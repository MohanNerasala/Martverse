package com.martverse.service;

import com.martverse.dto.PaymentDto;
import com.martverse.entity.*;
import com.martverse.enums.FulfilmentType;
import com.martverse.enums.OrderStatus;
import com.martverse.enums.PaymentMethod;
import com.martverse.enums.PaymentStatus;
import com.martverse.exception.BadRequestException;
import com.martverse.exception.ConflictException;
import com.martverse.exception.InsufficientStockException;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Dedicated dummy/simulated payment service for development & demo purposes.
 * Strictly simulates payments without contacting any external payment gateway.
 * Performs server-side price validation, stock validation, atomic inventory deduction,
 * and records orders with payment status SIMULATED_SUCCESS.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatedPaymentService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerProfileRepository customerProfileRepository;

    // Idempotency cache to prevent duplicate rapid clicks (keys: sessionId or phone+time window)
    private final Set<String> inFlightRequests = Collections.newSetFromMap(new ConcurrentHashMap<>());

    @Transactional
    public PaymentDto.SimulatedPaymentResponse processSimulatedCheckout(
            UUID userId, String sessionId, PaymentDto.SimulatedCheckoutRequest request) {

        log.info("Processing simulated checkout for customer: {} (phone: {})",
                request.getCustomerName(), request.getCustomerPhone());

        // Idempotency check to prevent duplicate order submissions
        String idempotencyKey = (userId != null ? userId.toString() : sessionId) + "_" + request.getCustomerPhone();
        if (!inFlightRequests.add(idempotencyKey)) {
            throw new ConflictException("A checkout is already being processed. Please wait.");
        }

        try {
            // 1. Resolve Items: from DB Cart or from request payload
            List<ItemOrderHolder> itemsToProcess = resolveItems(userId, sessionId, request);
            if (itemsToProcess.isEmpty()) {
                throw new BadRequestException("No items to checkout. Cart is empty.");
            }

            // 2. Server-side stock validation & trusted price calculation
            BigDecimal subtotal = BigDecimal.ZERO;
            int totalQuantity = 0;

            for (ItemOrderHolder holder : itemsToProcess) {
                // Verify inventory availability
                validateStock(holder.product, holder.variant, holder.quantity);

                // Calculate line total using trusted database prices
                BigDecimal price = holder.variant != null
                        ? holder.variant.getEffectivePrice()
                        : holder.product.getEffectivePrice();

                BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(holder.quantity));
                holder.unitPrice = price;
                holder.lineTotal = lineTotal;

                subtotal = subtotal.add(lineTotal);
                totalQuantity += holder.quantity;
            }

            // Free delivery threshold: >= 499 is free, else 40 INR
            BigDecimal deliveryCharge = subtotal.compareTo(new BigDecimal("499")) >= 0 ||
                    "STORE_PICKUP".equalsIgnoreCase(request.getFulfilmentType())
                    ? BigDecimal.ZERO
                    : new BigDecimal("40");

            BigDecimal codFee = request.getCodFee() != null ? request.getCodFee() : BigDecimal.ZERO;
            BigDecimal finalAmount = subtotal.add(deliveryCharge).add(codFee);

            // 3. Persist Customer Delivery Address (With Deduplication)
            String cleanPhone = request.getCustomerPhone() != null ? request.getCustomerPhone().replaceAll("[^0-9]", "") : "";
            if (cleanPhone.length() >= 10) {
                cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
            }

            // If userId not provided via JWT, try resolving through registered profile phone number
            if (userId == null && !cleanPhone.isEmpty()) {
                Optional<CustomerProfile> profileOpt = customerProfileRepository.findByPhone(cleanPhone);
                if (profileOpt.isPresent() && profileOpt.get().getUser() != null) {
                    userId = profileOpt.get().getUser().getId();
                }
            }

            Address address = null;
            if (request.getAddressId() != null && !request.getAddressId().isBlank() && !request.getAddressId().startsWith("addr-")) {
                try {
                    address = addressRepository.findById(UUID.fromString(request.getAddressId())).orElse(null);
                } catch (Exception ignored) {}
            }

            if (address == null) {
                String line1 = request.getAddressLine1();
                if (userId != null) {
                    address = addressRepository.findFirstByUserIdAndAddressLine1AndPinCode(userId, line1, request.getPinCode()).orElse(null);
                } else if (!cleanPhone.isEmpty()) {
                    address = addressRepository.findFirstByPhoneAndAddressLine1AndPinCode(cleanPhone, line1, request.getPinCode()).orElse(null);
                }
            }

            if (address == null) {
                address = Address.builder()
                        .fullName(request.getCustomerName() != null ? request.getCustomerName() : "Customer")
                        .phone(!cleanPhone.isEmpty() ? cleanPhone : request.getCustomerPhone())
                        .email(request.getCustomerEmail() != null ? request.getCustomerEmail() : "")
                        .addressType(request.getAddressType() != null ? request.getAddressType().toUpperCase() : "HOME")
                        .houseNo(request.getHouseNo())
                        .area(request.getArea())
                        .landmark(request.getLandmark())
                        .addressLine1(request.getAddressLine1())
                        .addressLine2(request.getAddressLine2())
                        .city(request.getCity())
                        .state(request.getState() != null ? request.getState() : "Karnataka")
                        .pinCode(request.getPinCode())
                        .deliveryInstructions(request.getDeliveryInstructions())
                        .isDefault(true)
                        .build();

                if (userId != null) {
                    User user = new User();
                    user.setId(userId);
                    address.setUser(user);
                }
                address = addressRepository.save(address);
            }

            // 4. Generate unique Order Number (MV + Date + 4-digit random)
            String orderNumber = generateOrderNumber();

            // 5. Create Order (Status: CONFIRMED immediately upon simulated payment success)
            Order order = Order.builder()
                    .orderNumber(orderNumber)
                    .address(address)
                    .status(OrderStatus.CONFIRMED)
                    .subtotal(subtotal)
                    .deliveryCharge(deliveryCharge)
                    .discountAmount(BigDecimal.ZERO)
                    .taxAmount(BigDecimal.ZERO)
                    .totalAmount(finalAmount)
                    .fulfilmentType("STORE_PICKUP".equalsIgnoreCase(request.getFulfilmentType())
                            ? FulfilmentType.PICKUP : FulfilmentType.DELIVERY)
                    .notes("DEMO ORDER — Simulated checkout completed without real financial charge.")
                    .build();

            if (userId != null) {
                User user = new User();
                user.setId(userId);
                order.setUser(user);
            }

            order = orderRepository.save(order);

            // 6. Persist Order Items & Perform Atomic Inventory Deduction
            List<PaymentDto.SimulatedOrderItemInfo> responseItems = new ArrayList<>();

            for (ItemOrderHolder holder : itemsToProcess) {
                // Atomic deduction in database
                deductStockSafely(holder.product, holder.variant, holder.quantity);

                String variantInfo = null;
                String sku = holder.product.getSku();
                if (holder.variant != null) {
                    variantInfo = (holder.variant.getSize() != null ? "Size: " + holder.variant.getSize() : "")
                            + (holder.variant.getColor() != null ? " Color: " + holder.variant.getColor() : "");
                    variantInfo = variantInfo.trim();
                    sku = holder.variant.getFullSku();
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(holder.product)
                        .variant(holder.variant)
                        .productName(holder.product.getName())
                        .productSku(sku)
                        .variantInfo(variantInfo)
                        .unitPrice(holder.unitPrice)
                        .quantity(holder.quantity)
                        .lineTotal(holder.lineTotal)
                        .discountAmount(BigDecimal.ZERO)
                        .build();

                order.getOrderItems().add(orderItem);

                responseItems.add(PaymentDto.SimulatedOrderItemInfo.builder()
                        .productName(holder.product.getName())
                        .brand(holder.product.getBrand())
                        .variantInfo(variantInfo)
                        .quantity(holder.quantity)
                        .unitPrice(holder.unitPrice)
                        .lineTotal(holder.lineTotal)
                        .build());
            }

            // 7. Add Order Status History entry
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status(OrderStatus.CONFIRMED)
                    .notes("Simulated payment successful (DEMO MODE). Order confirmed.")
                    .build();
            order.getStatusHistory().add(history);
            orderRepository.save(order);

            // 8. Record real Payment entity with status COMPLETED and payment method
            PaymentMethod pMethod = PaymentMethod.UPI;
            try {
                if (request.getPaymentMethod() != null) {
                    pMethod = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
                }
            } catch (Exception ignored) {}

            String provider = request.getPaymentProvider();
            if (provider == null || provider.isBlank()) {
                provider = pMethod.name() + "_DIRECT";
            }

            String txnId = "TXN-MV-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

            Payment payment = Payment.builder()
                    .order(order)
                    .paymentMethod(pMethod)
                    .paymentProvider(provider)
                    .providerOrderId("ORD_" + orderNumber)
                    .providerPaymentId(txnId)
                    .amount(finalAmount)
                    .currency("INR")
                    .status(pMethod == PaymentMethod.CASH ? PaymentStatus.PENDING : PaymentStatus.SIMULATED_SUCCESS)
                    .testMode(true)
                    .paidAt(pMethod == PaymentMethod.CASH ? null : LocalDateTime.now())
                    .failureReason(null)
                    .build();
            paymentRepository.save(payment);

            // 9. Clear Cart in database if it exists
            clearUserOrSessionCart(userId, sessionId);

            String formattedDateTime = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

            log.info("PAYMENT SIMULATED_SUCCESS: Order {} created for ₹{} ({} items), Txn: {}",
                    orderNumber, finalAmount, totalQuantity, txnId);

            return PaymentDto.SimulatedPaymentResponse.builder()
                    .orderId(order.getId().toString())
                    .orderNumber(orderNumber)
                    .customerName(request.getCustomerName())
                    .customerPhone(request.getCustomerPhone())
                    .purchasedProductCount(totalQuantity)
                    .subtotal(subtotal)
                    .discountAmount(BigDecimal.ZERO)
                    .deliveryCharge(deliveryCharge)
                    .finalAmount(finalAmount)
                    .paymentStatus(pMethod == PaymentMethod.CASH ? "PENDING_CASH" : PaymentStatus.SIMULATED_SUCCESS.name())
                    .paymentMethod(pMethod.name())
                    .paymentProvider(provider)
                    .transactionId(txnId)
                    .dateTime(formattedDateTime)
                    .message("Order placed with SIMULATED_SUCCESS payment status (DEMO MODE).")
                    .success(true)
                    .items(responseItems)
                    .build();

        } finally {
            inFlightRequests.remove(idempotencyKey);
        }
    }

    // ── Helper Methods ───────────────────────────────────────────

    private List<ItemOrderHolder> resolveItems(UUID userId, String sessionId, PaymentDto.SimulatedCheckoutRequest request) {
        List<ItemOrderHolder> holders = new ArrayList<>();

        // First check if direct items were sent in request
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PaymentDto.CheckoutItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(UUID.fromString(itemReq.getProductId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

                ProductVariant variant = null;
                if (itemReq.getVariantId() != null && !itemReq.getVariantId().isBlank()) {
                    variant = productVariantRepository.findById(UUID.fromString(itemReq.getVariantId())).orElse(null);
                }

                holders.add(new ItemOrderHolder(product, variant, Math.max(1, itemReq.getQuantity())));
            }
            return holders;
        }

        // Otherwise check active cart from DB
        Optional<Cart> cartOpt = userId != null
                ? cartRepository.findByUserIdAndStatus(userId, com.martverse.enums.CartStatus.ACTIVE)
                : (sessionId != null ? cartRepository.findBySessionIdAndStatus(sessionId, com.martverse.enums.CartStatus.ACTIVE) : Optional.empty());

        if (cartOpt.isPresent()) {
            List<CartItem> cartItems = cartItemRepository.findByCartId(cartOpt.get().getId());
            for (CartItem ci : cartItems) {
                holders.add(new ItemOrderHolder(ci.getProduct(), ci.getVariant(), ci.getQuantity()));
            }
        }

        return holders;
    }

    private void validateStock(Product product, ProductVariant variant, int requestedQty) {
        Inventory inv;
        if (variant != null) {
            inv = inventoryRepository.findByProductIdAndVariantId(product.getId(), variant.getId()).orElse(null);
        } else {
            inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
        }

        int available = (inv != null) ? inv.getAvailableQuantity() : 0;
        if (requestedQty > available) {
            String name = product.getName() + (variant != null ? " (" + variant.getSize() + ")" : "");
            throw new InsufficientStockException(name, requestedQty, available);
        }
    }

    private void deductStockSafely(Product product, ProductVariant variant, int qty) {
        int rowsUpdated;
        if (variant != null) {
            rowsUpdated = inventoryRepository.deductVariantStock(product.getId(), variant.getId(), qty);
        } else {
            rowsUpdated = inventoryRepository.deductStock(product.getId(), qty);
        }

        if (rowsUpdated == 0) {
            String name = product.getName() + (variant != null ? " (" + variant.getSize() + ")" : "");
            throw new InsufficientStockException(name, qty, 0);
        }
    }

    private void clearUserOrSessionCart(UUID userId, String sessionId) {
        try {
            Optional<Cart> cartOpt = userId != null
                    ? cartRepository.findByUserIdAndStatus(userId, com.martverse.enums.CartStatus.ACTIVE)
                    : (sessionId != null ? cartRepository.findBySessionIdAndStatus(sessionId, com.martverse.enums.CartStatus.ACTIVE) : Optional.empty());

            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                cart.setStatus(com.martverse.enums.CartStatus.CHECKED_OUT);
                cartRepository.save(cart);
                cartItemRepository.deleteByCartId(cart.getId());
            }
        } catch (Exception e) {
            log.warn("Cart cleanup note: {}", e.getMessage());
        }
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "MV" + timestamp + rand;
    }

    private static class ItemOrderHolder {
        Product product;
        ProductVariant variant;
        int quantity;
        BigDecimal unitPrice;
        BigDecimal lineTotal;

        ItemOrderHolder(Product product, ProductVariant variant, int quantity) {
            this.product = product;
            this.variant = variant;
            this.quantity = quantity;
        }
    }
}
