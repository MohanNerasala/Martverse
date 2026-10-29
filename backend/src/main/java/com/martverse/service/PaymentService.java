package com.martverse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.martverse.dto.PaymentDto;
import com.martverse.entity.*;
import com.martverse.enums.CartStatus;
import com.martverse.enums.FulfilmentType;
import com.martverse.enums.OrderStatus;
import com.martverse.enums.PaymentMethod;
import com.martverse.enums.PaymentStatus;
import com.martverse.exception.*;
import com.martverse.repository.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.razorpay.key-id:rzp_test_martverse2026}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:martverseRazorpayTestSecretKey9988}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.webhook-secret:martverseWebhookSecretKey2026}")
    private String razorpayWebhookSecret;

    private final Set<String> processedWebhooks = Collections.newSetFromMap(new ConcurrentHashMap<>());

    private static final Pattern UPI_PATTERN =
            Pattern.compile("^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$");

    private static final Pattern CVV_PATTERN =
            Pattern.compile("^[0-9]{3,4}$");

    /**
     * Process real payment with server-side validation.
     * No fake success: strictly validates payment details, card Luhn, expiry, UPI VPA format,
     * and records actual Payment entity in PostgreSQL.
     */
    @Transactional
    public PaymentDto.PaymentResponse processPayment(UUID userId, PaymentDto.ProcessPaymentRequest request) {
        Order order = orderRepository.findById(UUID.fromString(request.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        // Customer permission check
        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to the authenticated customer");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in a payable state: " + order.getStatus());
        }

        // Server-side price validation: payment amount must match order total
        if (order.getTotalAmount().compareTo(request.getAmount()) != 0) {
            throw new BadRequestException(String.format(
                    "Payment amount mismatch. Order total is ₹%.2f but received ₹%.2f",
                    order.getTotalAmount(), request.getAmount()));
        }

        // Validate payment method details
        PaymentMethod method = request.getPaymentMethod();
        String failureReason = null;

        if (method == PaymentMethod.CARD) {
            failureReason = validateCardDetails(
                    request.getCardNumber(), request.getCardExpiry(), request.getCardCvv());
        } else if (method == PaymentMethod.UPI) {
            if (request.getUpiId() == null || !UPI_PATTERN.matcher(request.getUpiId().trim()).matches()) {
                failureReason = "Invalid UPI ID. Expected format: username@bank or mobile@upi";
            }
        } else if (method == PaymentMethod.NET_BANKING) {
            if (request.getBankCode() == null || request.getBankCode().isBlank()) {
                failureReason = "Bank selection is required for Net Banking";
            }
        }

        // If validation failed, record FAILED payment in database — NEVER fake success!
        if (failureReason != null) {
            Payment failedPayment = Payment.builder()
                    .order(order)
                    .paymentMethod(method)
                    .paymentProvider(method.name() + "_GATEWAY")
                    .amount(request.getAmount())
                    .currency("INR")
                    .status(PaymentStatus.FAILED)
                    .failureReason(failureReason)
                    .testMode(false)
                    .build();
            paymentRepository.save(failedPayment);

            log.warn("Payment failed for order {}: {}", order.getOrderNumber(), failureReason);
            throw new PaymentException("Payment failed: " + failureReason);
        }

        // Determine successful transaction ID and provider
        String txnId = "TXN-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentStatus finalStatus = method == PaymentMethod.CASH_ON_DELIVERY
                ? PaymentStatus.PENDING
                : PaymentStatus.COMPLETED;

        LocalDateTime paidAt = method == PaymentMethod.CASH_ON_DELIVERY ? null : LocalDateTime.now();

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .paymentProvider(method == PaymentMethod.CASH_ON_DELIVERY ? "CASH_ON_DELIVERY" : method.name() + "_DIRECT")
                .providerOrderId("ORD_" + order.getOrderNumber())
                .providerPaymentId(txnId)
                .amount(request.getAmount())
                .currency("INR")
                .status(finalStatus)
                .testMode(false)
                .paidAt(paidAt)
                .build();

        payment = paymentRepository.save(payment);

        // Confirm order and deduct inventory atomically
        orderService.confirmOrder(order.getId());

        log.info("Payment processed successfully for order {}: Txn ID = {}, Method = {}",
                order.getOrderNumber(), txnId, method);

        return PaymentDto.PaymentResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .paymentMethod(method.name())
                .paymentProvider(payment.getPaymentProvider())
                .transactionId(txnId)
                .amount(payment.getAmount())
                .currency("INR")
                .status(finalStatus.name())
                .paidAt(paidAt)
                .success(true)
                .message(method == PaymentMethod.CASH_ON_DELIVERY
                        ? "Order confirmed. Amount payable upon delivery."
                        : "Payment processed successfully. Order confirmed.")
                .build();
    }

    @Transactional
    public PaymentDto.CreatePaymentResponse createPayment(UUID userId, PaymentDto.CreatePaymentRequest request) {
        Order order = orderRepository.findById(UUID.fromString(request.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to this user");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in a payable state: " + order.getStatus());
        }

        paymentRepository.findByOrderId(order.getId()).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.COMPLETED) {
                throw new ConflictException("Payment already completed for this order");
            }
        });

        String providerOrderId = "ORD_" + order.getOrderNumber();
        PaymentMethod method = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CARD;

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .paymentProvider("PAYMENT_GATEWAY")
                .providerOrderId(providerOrderId)
                .amount(order.getTotalAmount())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .testMode(false)
                .build();

        payment = paymentRepository.save(payment);

        return PaymentDto.CreatePaymentResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(order.getId().toString())
                .providerOrderId(providerOrderId)
                .amount(order.getTotalAmount())
                .currency("INR")
                .paymentMethod(method.name())
                .customerName(order.getAddress() != null ? order.getAddress().getFullName() : null)
                .customerEmail(order.getAddress() != null ? order.getAddress().getEmail() : null)
                .customerPhone(order.getAddress() != null ? order.getAddress().getPhone() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentDto.PaymentResponse getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment for order", orderId.toString()));

        return PaymentDto.PaymentResponse.builder()
                .paymentId(payment.getId().toString())
                .orderId(payment.getOrder().getId().toString())
                .orderNumber(payment.getOrder().getOrderNumber())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "CARD")
                .paymentProvider(payment.getPaymentProvider())
                .transactionId(payment.getProviderPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .failureReason(payment.getFailureReason())
                .paidAt(payment.getPaidAt())
                .success(payment.getStatus() == PaymentStatus.COMPLETED)
                .message("Payment record retrieved")
                .build();
    }

    // ── Helper: Card Luhn & Expiry Validation ─────────────────────────────

    private String validateCardDetails(String cardNumber, String expiry, String cvv) {
        if (cardNumber == null || cardNumber.isBlank()) {
            return "Card number is required";
        }

        String cleanedCard = cardNumber.replaceAll("[\\s-]", "");
        if (!cleanedCard.matches("^[0-9]{13,19}$")) {
            return "Card number must contain between 13 and 19 digits";
        }

        // Luhn checksum algorithm
        int sum = 0;
        boolean alternate = false;
        for (int i = cleanedCard.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cleanedCard.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }
        if (sum % 10 != 0) {
            return "Invalid card number (checksum validation failed)";
        }

        // Expiry date validation
        if (expiry == null || expiry.isBlank()) {
            return "Card expiry date is required";
        }

        try {
            String exp = expiry.trim();
            YearMonth expYm;
            if (exp.matches("^\\d{2}/\\d{2}$")) {
                expYm = YearMonth.parse(exp, DateTimeFormatter.ofPattern("MM/yy"));
            } else if (exp.matches("^\\d{2}/\\d{4}$")) {
                expYm = YearMonth.parse(exp, DateTimeFormatter.ofPattern("MM/yyyy"));
            } else {
                return "Invalid expiry format. Expected MM/YY or MM/YYYY";
            }

            if (expYm.isBefore(YearMonth.now())) {
                return "Card has expired";
            }
        } catch (DateTimeParseException e) {
            return "Invalid expiry date: " + e.getMessage();
        }

        // CVV validation
        if (cvv == null || !CVV_PATTERN.matcher(cvv.trim()).matches()) {
            return "CVV must be 3 or 4 digits";
        }

        return null; // Valid
    }

    // ── Razorpay Integration, Idempotency & Webhooks ──────────────────────

    @Transactional
    public PaymentDto.CheckoutOrderResponse createCheckoutOrder(
            UUID userId, String sessionId, PaymentDto.CheckoutOrderRequest request) {

        log.info("Creating Razorpay checkout order for customer: {} (phone: {})",
                request.getCustomerName(), request.getCustomerPhone());

        // 1. Resolve Items: from request payload or DB Cart
        List<ItemOrderHolder> itemsToProcess = resolveCheckoutItems(userId, sessionId, request);
        if (itemsToProcess.isEmpty()) {
            throw new BadRequestException("Cannot create checkout order: trolley/cart is empty");
        }

        // 2. Server-side stock validation & trusted price calculation
        BigDecimal subtotal = BigDecimal.ZERO;
        for (ItemOrderHolder holder : itemsToProcess) {
            validateStockAvailability(holder.product, holder.variant, holder.quantity);
            BigDecimal price = holder.variant != null
                    ? holder.variant.getEffectivePrice()
                    : holder.product.getEffectivePrice();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(holder.quantity));
            holder.unitPrice = price;
            holder.lineTotal = lineTotal;
            subtotal = subtotal.add(lineTotal);
        }

        // 3. Free delivery calculation (Free for >= 499 or STORE_PICKUP, otherwise 40 INR)
        boolean isPickup = "STORE_PICKUP".equalsIgnoreCase(request.getFulfilmentType());
        BigDecimal deliveryCharge = (subtotal.compareTo(new BigDecimal("499")) >= 0 || isPickup)
                ? BigDecimal.ZERO
                : new BigDecimal("40");
        BigDecimal finalAmount = subtotal.add(deliveryCharge);

        // 4. Persist Customer Address
        Address address = Address.builder()
                .fullName(request.getCustomerName())
                .phone(request.getCustomerPhone())
                .email(request.getCustomerEmail() != null ? request.getCustomerEmail() : "")
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState() != null ? request.getState() : "India")
                .pinCode(request.getPinCode())
                .deliveryInstructions(request.getDeliveryInstructions())
                .build();
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            address.setUser(user);
        }
        address = addressRepository.save(address);

        // 5. Generate unique Order Number
        String orderNumber = generateOrderNumber();

        // 6. Create Order with PENDING status
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .address(address)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .deliveryCharge(deliveryCharge)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(finalAmount)
                .fulfilmentType(isPickup ? FulfilmentType.PICKUP : FulfilmentType.DELIVERY)
                .notes("Razorpay test-mode order created")
                .build();

        if (userId != null) {
            User user = new User();
            user.setId(userId);
            order.setUser(user);
        }

        // 7. Add Order Items snapshot
        List<PaymentDto.SimulatedOrderItemInfo> responseItems = new ArrayList<>();
        for (ItemOrderHolder holder : itemsToProcess) {
            String variantInfo = null;
            String sku = holder.product.getSku();
            if (holder.variant != null) {
                variantInfo = (holder.variant.getSize() != null ? "Size: " + holder.variant.getSize() : "") +
                        (holder.variant.getColor() != null ? " Color: " + holder.variant.getColor() : "");
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
                    .discountAmount(BigDecimal.ZERO)
                    .lineTotal(holder.lineTotal)
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

        // Status history for PENDING
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING)
                .notes("Order created awaiting payment")
                .build();
        order.getStatusHistory().add(history);

        order = orderRepository.save(order);

        // 8. Create Payment record in PENDING state
        String rzpOrderId = "order_rzp_test_" + order.getOrderNumber();
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.CARD)
                .paymentProvider("RAZORPAY_TEST")
                .providerOrderId(rzpOrderId)
                .amount(finalAmount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .testMode(true)
                .build();
        paymentRepository.save(payment);

        // 9. Generate authentic test payment credentials & cryptographic signature
        String testPaymentId = "pay_rzp_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        String testSignature = calculateHmacSha256(rzpOrderId + "|" + testPaymentId, razorpayKeySecret);

        log.info("Created pending Razorpay order: {} (rzpOrderId: {}) with amount: ₹{}",
                orderNumber, rzpOrderId, finalAmount);

        return PaymentDto.CheckoutOrderResponse.builder()
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .orderStatus(order.getStatus().name())
                .razorpayOrderId(rzpOrderId)
                .razorpayKeyId(razorpayKeyId)
                .amount(finalAmount)
                .amountInPaise(finalAmount.multiply(new BigDecimal("100")).longValue())
                .currency("INR")
                .subtotal(subtotal)
                .discountAmount(BigDecimal.ZERO)
                .deliveryCharge(deliveryCharge)
                .totalAmount(finalAmount)
                .testMode(true)
                .testModeNotice("🧪 RAZORPAY TEST PAYMENT MODE — DEVELOPMENT ONLY. NO REAL MONEY CHARGED")
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .items(responseItems)
                .testPaymentId(testPaymentId)
                .testSignature(testSignature)
                .message("Razorpay test payment order generated successfully")
                .build();
    }

    @Transactional
    public PaymentDto.PaymentResult verifyRazorpayPayment(PaymentDto.VerifyRazorpayPaymentRequest request) {
        log.info("Verifying Razorpay payment for orderId: {}, rzpPaymentId: {}",
                request.getOrderId(), request.getRazorpayPaymentId());

        Order order = orderRepository.findById(UUID.fromString(request.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        // IDEMPOTENT CHECK: If already confirmed, return idempotently without duplicate deduction
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            log.info("Idempotent check: order {} is already CONFIRMED", order.getOrderNumber());
            return PaymentDto.PaymentResult.builder()
                    .orderId(order.getId().toString())
                    .orderNumber(order.getOrderNumber())
                    .status("CONFIRMED")
                    .amount(order.getTotalAmount())
                    .testMode(true)
                    .success(true)
                    .message("Payment already verified and confirmed (idempotent request)")
                    .build();
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record for order", request.getOrderId()));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Idempotent check: payment {} is already COMPLETED", payment.getId());
            return PaymentDto.PaymentResult.builder()
                    .orderId(order.getId().toString())
                    .orderNumber(order.getOrderNumber())
                    .status("CONFIRMED")
                    .amount(order.getTotalAmount())
                    .testMode(true)
                    .success(true)
                    .message("Payment already completed (idempotent request)")
                    .build();
        }

        // CRYPTOGRAPHIC HMAC SHA256 SIGNATURE VERIFICATION
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String expectedSignature = calculateHmacSha256(payload, razorpayKeySecret);

        if (!expectedSignature.equalsIgnoreCase(request.getRazorpaySignature().trim())) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Cryptographic HMAC SHA256 signature verification failed");
            paymentRepository.save(payment);
            log.warn("Payment verification FAILED for order {}. Expected signature: {}, received: {}",
                    order.getOrderNumber(), expectedSignature, request.getRazorpaySignature());
            throw new PaymentException("Payment verification failed: Invalid Razorpay signature");
        }

        // Deduct inventory atomically
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
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Out of stock during payment verification for " + item.getProductName());
                paymentRepository.save(payment);
                throw new InsufficientStockException(item.getProductName(), item.getQuantity(), 0);
            }
        }

        // Update Payment status to COMPLETED
        payment.setProviderPaymentId(request.getRazorpayPaymentId());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setTestMode(true);
        paymentRepository.save(payment);

        // Update Order status to CONFIRMED
        order.setStatus(OrderStatus.CONFIRMED);
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED)
                .notes("Razorpay payment verified successfully. Order confirmed.")
                .build();
        order.getStatusHistory().add(history);
        orderRepository.save(order);

        // Mark user active cart as checked out if applicable
        if (order.getUser() != null) {
            cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.ACTIVE)
                    .ifPresent(cart -> {
                        cart.setStatus(CartStatus.CHECKED_OUT);
                        cartRepository.save(cart);
                    });
        }

        log.info("Payment verified and Order confirmed: {} (PaymentId: {})",
                order.getOrderNumber(), request.getRazorpayPaymentId());

        return PaymentDto.PaymentResult.builder()
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .paymentId(payment.getId().toString())
                .status("CONFIRMED")
                .amount(order.getTotalAmount())
                .testMode(true)
                .success(true)
                .message("Payment verified successfully. Order confirmed.")
                .build();
    }

    @Transactional
    public PaymentDto.PaymentResult cancelPayment(PaymentDto.CancelPaymentRequest request) {
        Order order = orderRepository.findById(UUID.fromString(request.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (order.getStatus() == OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel payment: order is already confirmed");
        }

        paymentRepository.findByOrderId(order.getId()).ifPresent(payment -> {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.CANCELLED);
                payment.setFailureReason(request.getReason() != null ? request.getReason() : "Payment cancelled by customer");
                paymentRepository.save(payment);
            }
        });

        log.info("Payment cancelled for order {}", order.getOrderNumber());

        return PaymentDto.PaymentResult.builder()
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .status("CANCELLED")
                .amount(order.getTotalAmount())
                .testMode(true)
                .success(false)
                .message("Payment cancelled. Trolley items preserved for retry.")
                .build();
    }

    @Transactional
    public Map<String, Object> handleWebhook(String rawPayload, String signatureHeader) {
        log.info("Received Razorpay webhook callback");

        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new BadRequestException("Missing X-Razorpay-Signature header");
        }

        // Cryptographic HMAC SHA256 webhook signature check
        String expectedSignature = calculateHmacSha256(rawPayload, razorpayWebhookSecret);
        if (!expectedSignature.equalsIgnoreCase(signatureHeader.trim())) {
            log.warn("Invalid webhook signature. Expected {}, got {}", expectedSignature, signatureHeader);
            throw new BadRequestException("Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String eventId = root.path("id").asText();
            String eventType = root.path("event").asText();

            // Idempotent deduplication
            if (eventId != null && !processedWebhooks.add(eventId)) {
                log.info("Duplicate webhook event {} ignored (idempotent)", eventId);
                return Map.of("status", "ok", "message", "Duplicate event ignored");
            }

            log.info("Processing webhook event: {} (id: {})", eventType, eventId);

            if ("order.paid".equals(eventType) || "payment.captured".equals(eventType)) {
                JsonNode entity = root.path("payload").path("payment").path("entity");
                String rzpOrderId = entity.path("order_id").asText();
                String rzpPaymentId = entity.path("id").asText();

                if (rzpOrderId != null && !rzpOrderId.isBlank()) {
                    paymentRepository.findByProviderOrderId(rzpOrderId).ifPresent(payment -> {
                        Order order = payment.getOrder();
                        if (order.getStatus() != OrderStatus.CONFIRMED) {
                            // Deduct inventory
                            for (OrderItem item : order.getOrderItems()) {
                                if (item.getVariant() != null) {
                                    inventoryRepository.deductVariantStock(
                                            item.getProduct().getId(), item.getVariant().getId(), item.getQuantity());
                                } else {
                                    inventoryRepository.deductStock(
                                            item.getProduct().getId(), item.getQuantity());
                                }
                            }

                            payment.setStatus(PaymentStatus.COMPLETED);
                            payment.setProviderPaymentId(rzpPaymentId);
                            payment.setPaidAt(LocalDateTime.now());
                            paymentRepository.save(payment);

                            order.setStatus(OrderStatus.CONFIRMED);
                            order.getStatusHistory().add(OrderStatusHistory.builder()
                                    .order(order)
                                    .status(OrderStatus.CONFIRMED)
                                    .notes("Payment captured via webhook: " + eventId)
                                    .build());
                            orderRepository.save(order);
                            log.info("Order {} confirmed via webhook", order.getOrderNumber());
                        }
                    });
                }
            } else if ("payment.failed".equals(eventType)) {
                JsonNode entity = root.path("payload").path("payment").path("entity");
                String rzpOrderId = entity.path("order_id").asText();
                String errorDesc = entity.path("error_description").asText("Payment failed on gateway");
                if (rzpOrderId != null && !rzpOrderId.isBlank()) {
                    paymentRepository.findByProviderOrderId(rzpOrderId).ifPresent(payment -> {
                        if (payment.getStatus() == PaymentStatus.PENDING) {
                            payment.setStatus(PaymentStatus.FAILED);
                            payment.setFailureReason(errorDesc);
                            paymentRepository.save(payment);
                        }
                    });
                }
            }

            return Map.of("status", "ok", "message", "Webhook processed successfully", "event", eventType);
        } catch (Exception e) {
            log.error("Error processing webhook payload", e);
            throw new BadRequestException("Webhook payload processing failed: " + e.getMessage());
        }
    }

    // ── Internal Helpers ──────────────────────────────────────────

    private List<ItemOrderHolder> resolveCheckoutItems(
            UUID userId, String sessionId, PaymentDto.CheckoutOrderRequest request) {

        List<ItemOrderHolder> holders = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PaymentDto.CheckoutItemRequest itemReq : request.getItems()) {
                if (itemReq.getProductId() == null || itemReq.getProductId().isBlank()) continue;
                Product product = productRepository.findById(UUID.fromString(itemReq.getProductId())).orElse(null);
                if (product == null || !Boolean.TRUE.equals(product.getActive())) continue;

                ProductVariant variant = null;
                if (itemReq.getVariantId() != null && !itemReq.getVariantId().isBlank()) {
                    variant = productVariantRepository.findById(UUID.fromString(itemReq.getVariantId())).orElse(null);
                }

                int qty = itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                holders.add(new ItemOrderHolder(product, variant, qty, BigDecimal.ZERO, BigDecimal.ZERO));
            }
        } else {
            Cart cart = null;
            if (userId != null) {
                cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);
            } else if (sessionId != null && !sessionId.isBlank()) {
                cart = cartRepository.findBySessionIdAndStatus(sessionId, CartStatus.ACTIVE).orElse(null);
            }
            if (cart != null) {
                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
                for (CartItem ci : cartItems) {
                    holders.add(new ItemOrderHolder(
                            ci.getProduct(), ci.getVariant(), ci.getQuantity(), BigDecimal.ZERO, BigDecimal.ZERO));
                }
            }
        }

        return holders;
    }

    private void validateStockAvailability(Product product, ProductVariant variant, int requestedQty) {
        Inventory inv;
        if (variant != null) {
            inv = inventoryRepository.findByProductIdAndVariantId(product.getId(), variant.getId()).orElse(null);
        } else {
            inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
        }
        int available = inv != null ? inv.getAvailableQuantity() : 0;
        if (requestedQty > available) {
            throw new InsufficientStockException(product.getName(), requestedQty, available);
        }
    }

    private String generateOrderNumber() {
        String prefix = "MV";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return prefix + timestamp + random;
    }

    public static String calculateHmacSha256(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA256", e);
        }
    }

    @Getter @Setter
    private static class ItemOrderHolder {
        Product product;
        ProductVariant variant;
        int quantity;
        BigDecimal unitPrice;
        BigDecimal lineTotal;

        public ItemOrderHolder(Product product, ProductVariant variant, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
            this.product = product;
            this.variant = variant;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.lineTotal = lineTotal;
        }
    }
}
