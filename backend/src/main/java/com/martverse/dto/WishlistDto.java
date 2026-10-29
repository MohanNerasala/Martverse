package com.martverse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class WishlistDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistResponse {
        private String ownerId;
        private int totalItems;
        private List<ProductDto.ProductResponse> items;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToggleItemRequest {
        private String productId;
    }
}

