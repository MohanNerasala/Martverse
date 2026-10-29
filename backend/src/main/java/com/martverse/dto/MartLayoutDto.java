package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MartLayoutDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FloorResponse {
        private String id;
        private int floorNumber;
        private String name;
        private String description;
        private BigDecimal heightOffset;
        private double length;
        private double width;
        private double height;
        private List<AisleResponse> aisles;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AisleResponse {
        private String id;
        private String floorId;
        private int floorNumber;
        private int aisleNumber;
        private String name;
        private String categoryId;
        private String categoryName;
        private double startX;
        private double startZ;
        private double endX;
        private double endZ;
        private double shelfHeight;
        private int shelfTiers;
        private String colorCode;
        private String bannerText;
        private BigDecimal positionX;
        private BigDecimal positionZ;
        private BigDecimal length;
        private List<PlacementResponse> placements;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlacementResponse {
        private String id;
        private String productId;
        private String productName;
        private String productSku;
        private String brand;
        private BigDecimal price;
        private BigDecimal mrp;
        private BigDecimal effectivePrice;
        private String imageUrl;
        private String shelfSide;
        private int shelfTier;
        private int shelfLevel;
        private int positionIndex;
        private double worldX;
        private double worldY;
        private double worldZ;
        private double rotationY;
        private String displayType;
        private String modelType;
        private String color;
        private boolean inStock;
        private int stockQuantity;
        private boolean hasVariants;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FullLayoutResponse {
        private List<FloorResponse> floors;
        private int totalProducts;
        private int totalAisles;
    }
}
