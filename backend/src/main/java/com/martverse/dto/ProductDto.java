package com.martverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductResponse {
        private String id;
        private String sku;
        private String name;
        private String slug;
        private String description;
        private String brand;
        private String categoryId;
        private String categoryName;
        private CategoryRef category;
        private BigDecimal price;
        private BigDecimal mrp;
        private BigDecimal discountPrice;
        private BigDecimal effectivePrice;
        private Integer discountPercentage;
        private String imageUrl;
        private boolean hasVariants;
        private String weight;
        private String unit;
        private int stockQuantity;
        private boolean inStock;
        private boolean featured;
        private List<VariantResponse> variants;
        private ProductPlacementResponse placement;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryRef {
        private String id;
        private String name;
        private String slug;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductPlacementResponse {
        private String id;
        private String productId;
        private String productName;
        private String productSlug;
        private BigDecimal productPrice;
        private BigDecimal productMrp;
        private int floorNumber;
        private String aisleId;
        private int aisleNumber;
        private String aisleName;
        private String aisleCategory;
        private String shelfSide;
        private int shelfTier;
        private int shelfPosition;
        private double worldX;
        private double worldY;
        private double worldZ;
        private double rotationY;
        private String color;
        private String modelType;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VariantResponse {
        private String id;
        private String productId;
        private String sku;
        private String name;
        private String size;
        private String color;
        private String colorCode;
        private String colorHex;
        private String skuSuffix;
        private BigDecimal price;
        private BigDecimal mrp;
        private BigDecimal priceOverride;
        private BigDecimal effectivePrice;
        private String imageUrl;
        private int stockQuantity;
        private boolean inStock;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryResponse {
        private String id;
        private String name;
        private String slug;
        private String description;
        private int floorNumber;
        private String imageUrl;
        private int displayOrder;
        private String parentId;
        private List<CategoryResponse> children;
        private long productCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
