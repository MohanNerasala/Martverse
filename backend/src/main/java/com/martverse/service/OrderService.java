package com.martverse.service;

import com.martverse.dto.OrderDto;
import com.martverse.entity.*;
import com.martverse.enums.*;
import com.martverse.exception.*;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public OrderDto.OrderResponse createOrder(UUID userId, OrderDto.CreateOrderRequest request) {
        // Get active cart
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("No active cart found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock for all items
        for (CartItem item : cartItems) {
            validateStockAvailability(item);
        }

        // Create address
        Address address = Address.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .deliveryInstructions(request.getDeliveryInstructions())
                .build();
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            address.setUser(user);
        }
        address = addressRepository.save(address);

        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            BigDecimal price = item.getVariant() != null
                    ? item.getVariant().getEffectivePrice()
                    : item.getProduct().getEffectivePrice();
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        BigDecimal taxAmount = BigDecimal.ZERO; // Tax configured per business rules
        BigDecimal deliveryCharge = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(taxAmount).add(deliveryCharge);

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Create order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .address(address)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .deliveryCharge(deliveryCharge)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .fulfilmentType(FulfilmentType.DELIVERY)
                .build();

        if (userId != null) {
            User user = new User();
            user.setId(userId);
            order.setUser(user);
        }

        order = orderRepository.save(order);

        // Create order items (snapshot)
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            ProductVariant variant = cartItem.getVariant();

            BigDecimal unitPrice = variant != null
                    ? variant.getEffectivePrice()
                    : product.getEffectivePrice();

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            String variantInfo = null;
            String sku = product.getSku();
            if (variant != null) {
                variantInfo = (variant.getSize() != null ? "Size: " + variant.getSize() : "")
                        + (variant.getColor() != null ? " Color: " + variant.getColor() : "");
                variantInfo = variantInfo.trim();
                sku = variant.getFullSku();
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .variant(variant)
                    .productName(product.getName())
                    .productSku(sku)
                    .variantInfo(variantInfo)
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .discountAmount(BigDecimal.ZERO)
                    .lineTotal(lineTotal)
                    .build();
            order.getOrderItems().add(orderItem);
        }

        // Add status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING)
                .notes("Order created")
                .build();
        order.getStatusHistory().add(history);

        order = orderRepository.save(order);

        log.info("Order created: {} for user: {}", orderNumber, userId);
        return mapToOrderResponse(order);
    }

    @Transactional
    public void confirmOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in PENDING status");
        }

        // Deduct inventory
        for (OrderItem item : order.getOrderItems()) {
            int updated;
            if (item.getVariant() != null) {
                updated = inventoryRepository.deductVariantStock(
                        item.getProduct().getId(), item.getVariant().getId(), item.getQuantity());
            } else {
                updated = inventoryRepository.deductStock(
                        item.getProduct().getId(), item.getQuantity());
            }
            if (updated == 0) {
                throw new InsufficientStockException(
                        item.getProductName(), item.getQuantity(), 0);
            }
        }

        // Update order status
        order.setStatus(OrderStatus.CONFIRMED);
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED)
                .notes("Payment verified, order confirmed")
                .build();
        order.getStatusHistory().add(history);

        // Mark cart as checked out
        if (order.getUser() != null) {
            cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.ACTIVE)
                    .ifPresent(cart -> {
                        cart.setStatus(CartStatus.CHECKED_OUT);
                        cartRepository.save(cart);
                    });
        }

        orderRepository.save(order);
        log.info("Order confirmed: {}", order.getOrderNumber());
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId.toString()));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getUserOrders(UUID userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getOrdersByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return List.of();
        }
        List<Order> orders = orderRepository.findByAddressPhoneOrderByCreatedAtDesc(phone.trim());
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────

    private void validateStockAvailability(CartItem item) {
        Inventory inv;
        if (item.getVariant() != null) {
            inv = inventoryRepository.findByProductIdAndVariantId(
                    item.getProduct().getId(), item.getVariant().getId()).orElse(null);
        } else {
            inv = inventoryRepository.findByProductIdAndVariantIsNull(
                    item.getProduct().getId()).orElse(null);
        }

        int available = inv != null ? inv.getAvailableQuantity() : 0;
        if (item.getQuantity() > available) {
            throw new InsufficientStockException(
                    item.getProduct().getName(), item.getQuantity(), available);
        }
    }

    private String generateOrderNumber() {
        String prefix = "MV";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return prefix + timestamp + random;
    }

    private OrderDto.OrderResponse mapToOrderResponse(Order order) {
        List<OrderDto.OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderDto.OrderItemResponse.builder()
                        .id(item.getId().toString())
                        .productId(item.getProduct().getId().toString())
                        .productName(item.getProductName())
                        .productSku(item.getProductSku())
                        .variantInfo(item.getVariantInfo())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .discountAmount(item.getDiscountAmount())
                        .lineTotal(item.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        OrderDto.PaymentInfo paymentInfo = null;
        if (!order.getPayments().isEmpty()) {
            Payment payment = order.getPayments().get(0);
            paymentInfo = OrderDto.PaymentInfo.builder()
                    .id(payment.getId().toString())
                    .provider(payment.getPaymentProvider())
                    .providerOrderId(payment.getProviderOrderId())
                    .providerPaymentId(payment.getProviderPaymentId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(payment.getStatus().name())
                    .testMode(payment.getTestMode())
                    .build();
        }

        OrderDto.AddressInfo addressInfo = null;
        if (order.getAddress() != null) {
            Address addr = order.getAddress();
            addressInfo = OrderDto.AddressInfo.builder()
                    .fullName(addr.getFullName())
                    .phone(addr.getPhone())
                    .addressLine1(addr.getAddressLine1())
                    .addressLine2(addr.getAddressLine2())
                    .city(addr.getCity())
                    .state(addr.getState())
                    .pinCode(addr.getPinCode())
                    .build();
        }

        return OrderDto.OrderResponse.builder()
                .id(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .fulfilmentType(order.getFulfilmentType().name())
                .items(items)
                .payment(paymentInfo)
                .address(addressInfo)
                .createdAt(order.getCreatedAt().toString())
                .build();
    }
}
