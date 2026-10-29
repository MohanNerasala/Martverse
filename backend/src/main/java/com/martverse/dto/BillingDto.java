package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BillingDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StartBillingSessionRequest {
        @NotNull(message = "Counter number is required")
        @Min(value = 1, message = "Counter number must be at least 1")
        @Max(value = 10, message = "Counter number cannot exceed 10")
        private Integer counterNumber;

        private String cartId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScanItemRequest {
        @NotNull(message = "Product ID is required")
        private String productId;

        private String variantId;

        @Builder.Default
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity = 1;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BillingSessionResponse {
        private String id;
        private String cartId;
        private String userId;
        private String status;
        private int counterNumber;
        private int scannedCount;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private List<BillingScannedItem> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BillingScannedItem {
        private String productId;
        private String productName;
        private String productSku;
        private String variantId;
        private String variantInfo;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RevalidateCartRequest {
        private List<ScanItemRequest> items;
        private String fulfilmentType;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RevalidateCartResponse {
        private boolean valid;
        private int totalItems;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal deliveryCharge;
        private BigDecimal totalAmount;
        private List<BillingScannedItem> items;
        private List<String> warnings;
    }
}
