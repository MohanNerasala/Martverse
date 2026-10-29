package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateOrderRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Phone is required")
        private String phone;

        private String email;

        @NotBlank(message = "Address is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "PIN code is required")
        private String pinCode;

        private String deliveryInstructions;
        private String fulfilmentType;
        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderResponse {
        private String id;
        private String orderNumber;
        private String status;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal deliveryCharge;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String fulfilmentType;
        private List<OrderItemResponse> items;
        private PaymentInfo payment;
        private AddressInfo address;
        private String createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemResponse {
        private String id;
        private String productId;
        private String productName;
        private String productSku;
        private String variantInfo;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal discountAmount;
        private BigDecimal lineTotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentInfo {
        private String id;
        private String provider;
        private String providerOrderId;
        private String providerPaymentId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private boolean testMode;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressInfo {
        private String fullName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pinCode;
    }
}
