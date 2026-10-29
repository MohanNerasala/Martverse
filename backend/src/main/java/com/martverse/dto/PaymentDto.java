package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.martverse.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProcessPaymentRequest {
        @NotBlank(message = "Order ID is required")
        private String orderId;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        private BigDecimal amount;

        // Card details (if paymentMethod == CARD)
        private String cardNumber;
        private String cardExpiry;
        private String cardCvv;
        private String cardHolder;

        // UPI details (if paymentMethod == UPI)
        private String upiId;

        // Net Banking details (if paymentMethod == NET_BANKING)
        private String bankCode;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentResponse {
        private String paymentId;
        private String orderId;
        private String orderNumber;
        private String paymentMethod;
        private String paymentProvider;
        private String transactionId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String failureReason;
        private LocalDateTime paidAt;
        private String message;
        private boolean success;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SimulatedCheckoutRequest {
        @NotBlank(message = "Customer name is required")
        private String customerName;

        @NotBlank(message = "Mobile number is required")
        private String customerPhone;

        private String customerEmail;

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        private String state;

        @NotBlank(message = "PIN code is required")
        private String pinCode;

        private String deliveryInstructions;

        @Builder.Default
        private String fulfilmentType = "DELIVERY";

        @Builder.Default
        private String paymentMethod = "CARD";

        private List<CheckoutItemRequest> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CheckoutItemRequest {
        private String productId;
        private String variantId;
        private int quantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SimulatedPaymentResponse {
        private String orderId;
        private String orderNumber;
        private String customerName;
        private String customerPhone;
        private int purchasedProductCount;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal deliveryCharge;
        private BigDecimal finalAmount;
        private String paymentStatus;
        private String paymentMethod;
        private String paymentProvider;
        private String transactionId;
        private String dateTime;
        private String message;
        private boolean success;
        private List<SimulatedOrderItemInfo> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SimulatedOrderItemInfo {
        private String productName;
        private String brand;
        private String variantInfo;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatePaymentRequest {
        @NotBlank(message = "Order ID is required")
        private String orderId;

        private PaymentMethod paymentMethod;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatePaymentResponse {
        private String paymentId;
        private String orderId;
        private String providerOrderId;
        private String razorpayKeyId;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod;
        private boolean testMode;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VerifyPaymentRequest {
        @NotBlank(message = "Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Signature is required")
        private String razorpaySignature;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentResult {
        private String orderId;
        private String orderNumber;
        private String paymentId;
        private String status;
        private BigDecimal amount;
        private boolean testMode;
        private boolean success;
        private String message;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CheckoutOrderRequest {
        @NotBlank(message = "Customer name is required")
        private String customerName;

        @NotBlank(message = "Phone number is required")
        private String customerPhone;

        private String customerEmail;

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        private String state;

        @NotBlank(message = "PIN code is required")
        private String pinCode;

        private String deliveryInstructions;

        @Builder.Default
        private String fulfilmentType = "DELIVERY";

        private List<CheckoutItemRequest> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CheckoutOrderResponse {
        private String orderId;
        private String orderNumber;
        private String orderStatus;
        private String razorpayOrderId;
        private String razorpayKeyId;
        private BigDecimal amount;
        private Long amountInPaise;
        private String currency;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal deliveryCharge;
        private BigDecimal totalAmount;
        private boolean testMode;
        private String testModeNotice;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String message;
        private List<SimulatedOrderItemInfo> items;
        private String testPaymentId;
        private String testSignature;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VerifyRazorpayPaymentRequest {
        @NotBlank(message = "Order ID is required")
        private String orderId;

        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Signature is required")
        private String razorpaySignature;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CancelPaymentRequest {
        @NotBlank(message = "Order ID is required")
        private String orderId;
        private String reason;
    }
}
