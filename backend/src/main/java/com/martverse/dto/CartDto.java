package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddItemRequest {
        @NotNull(message = "Product ID is required")
        private String productId;

        private String variantId;

        @Builder.Default
        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity = 1;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateItemRequest {
        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CartResponse {
        private String id;
        private List<CartItemResponse> items;
        private int totalItems;
        private int uniqueItems;
        private BigDecimal subtotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CartItemResponse {
        private String id;
        private String productId;
        private String productName;
        private String productSku;
        private String brand;
        private String imageUrl;
        private BigDecimal unitPrice;
        private BigDecimal effectivePrice;
        private int quantity;
        private BigDecimal lineTotal;
        private String variantId;
        private String size;
        private String color;
        private int availableStock;
    }
}
