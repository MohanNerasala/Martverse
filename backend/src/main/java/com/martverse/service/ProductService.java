package com.martverse.service;

import com.martverse.dto.ProductDto;
import com.martverse.entity.*;
import com.martverse.enums.ShelfSide;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    public ProductDto.PagedResponse<ProductDto.ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrue(pageable);
        return toPagedResponse(page);
    }

    public List<ProductDto.ProductResponse> getAllActiveProductsList() {
        return productRepository.findAllActiveWithCategory().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductDto.ProductResponse getProductById(String id) {
        Product product = productRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return mapToResponse(product);
    }

    public ProductDto.ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .or(() -> productRepository.findBySku(slug))
                .orElseThrow(() -> new ResourceNotFoundException("Product with slug", slug));
        return mapToResponse(product);
    }

    public ProductDto.PagedResponse<ProductDto.ProductResponse> getProductsByCategory(String categoryId, Pageable pageable) {
        Page<Product> page = productRepository.findByCategoryIdAndActiveTrue(UUID.fromString(categoryId), pageable);
        return toPagedResponse(page);
    }

    public ProductDto.PagedResponse<ProductDto.ProductResponse> searchProducts(String query, Pageable pageable) {
        Page<Product> page = productRepository.searchProducts(query, pageable);
        return toPagedResponse(page);
    }

    public List<ProductDto.CategoryResponse> getAllCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullAndActiveTrue();
        return rootCategories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public ProductDto.CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return mapToCategoryResponse(category);
    }

    // ── Mapping helpers ──────────────────────────────────────────────

    private ProductDto.ProductResponse mapToResponse(Product product) {
        // Stock info
        int totalStock = 0;
        if (Boolean.TRUE.equals(product.getHasVariants())) {
            List<Inventory> inventoryList = product.getInventoryItems();
            totalStock = inventoryList.stream()
                    .mapToInt(Inventory::getAvailableQuantity)
                    .sum();
        } else {
            Inventory inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
            totalStock = inv != null ? inv.getAvailableQuantity() : 0;
        }

        // Pricing & discount calculation
        BigDecimal mrp = product.getPrice();
        BigDecimal effectivePrice = product.getEffectivePrice();
        int discountPct = 0;
        if (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                && product.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = mrp.subtract(effectivePrice);
            discountPct = diff.multiply(BigDecimal.valueOf(100))
                    .divide(mrp, 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        // Variants
        List<ProductDto.VariantResponse> variantResponses = null;
        if (Boolean.TRUE.equals(product.getHasVariants())) {
            List<ProductVariant> variants = variantRepository.findByProductIdAndActiveTrue(product.getId());
            variantResponses = variants.stream()
                    .map(v -> mapToVariantResponse(v, product))
                    .collect(Collectors.toList());
        }

        // 3D Product Placement
        ProductDto.ProductPlacementResponse placementResp = null;
        if (product.getPlacements() != null && !product.getPlacements().isEmpty()) {
            ProductPlacement plc = product.getPlacements().get(0);
            double wx = plc.getWorldX() != null ? plc.getWorldX().doubleValue()
                    : (plc.getShelfSide() == ShelfSide.LEFT ? -10.8 : -9.2);
            double wy = plc.getWorldY() != null ? plc.getWorldY().doubleValue() : 1.5;
            double wz = plc.getWorldZ() != null ? plc.getWorldZ().doubleValue() : 0.0;
            double ry = plc.getRotationY() != null ? plc.getRotationY().doubleValue()
                    : (plc.getShelfSide() == ShelfSide.LEFT ? Math.PI / 2 : -Math.PI / 2);

            String aisleCategory = "";
            if (plc.getAisle() != null && plc.getAisle().getCategory() != null) {
                aisleCategory = plc.getAisle().getCategory().getName();
            }

            placementResp = ProductDto.ProductPlacementResponse.builder()
                    .id(plc.getId().toString())
                    .productId(product.getId().toString())
                    .productName(product.getName())
                    .productSlug(product.getSlug() != null ? product.getSlug() : product.getSku().toLowerCase())
                    .productPrice(effectivePrice)
                    .productMrp(mrp)
                    .floorNumber(plc.getFloor() != null ? plc.getFloor().getFloorNumber() : 1)
                    .aisleId(plc.getAisle() != null ? plc.getAisle().getId().toString() : "")
                    .aisleNumber(plc.getAisle() != null ? plc.getAisle().getAisleNumber() : 1)
                    .aisleName(plc.getAisle() != null ? plc.getAisle().getName() : "")
                    .aisleCategory(aisleCategory)
                    .shelfSide(plc.getShelfSide() != null ? plc.getShelfSide().name() : "LEFT")
                    .shelfTier(plc.getShelfLevel() != null ? plc.getShelfLevel() : 2)
                    .shelfPosition(plc.getPositionIndex() != null ? plc.getPositionIndex() : 1)
                    .worldX(wx)
                    .worldY(wy)
                    .worldZ(wz)
                    .rotationY(ry)
                    .color(plc.getColor() != null ? plc.getColor() : "#10b981")
                    .modelType(plc.getModelType() != null ? plc.getModelType().toLowerCase() : plc.getDisplayType().name().toLowerCase())
                    .build();
        }

        String catSlug = product.getCategory() != null && product.getCategory().getName() != null
                ? product.getCategory().getName().toLowerCase().replace(" ", "-") : "all";

        return ProductDto.ProductResponse.builder()
                .id(product.getId().toString())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug() != null ? product.getSlug() : product.getSku().toLowerCase())
                .description(product.getDescription())
                .brand(product.getBrand())
                .categoryId(product.getCategory() != null ? product.getCategory().getId().toString() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .category(product.getCategory() != null ? ProductDto.CategoryRef.builder()
                        .id(product.getCategory().getId().toString())
                        .name(product.getCategory().getName())
                        .slug(catSlug)
                        .build() : null)
                .price(effectivePrice)
                .mrp(mrp)
                .discountPrice(product.getDiscountPrice())
                .effectivePrice(effectivePrice)
                .discountPercentage(discountPct)
                .imageUrl(product.getImageUrl())
                .hasVariants(Boolean.TRUE.equals(product.getHasVariants()))
                .weight(product.getWeight())
                .unit(product.getUnit())
                .stockQuantity(totalStock)
                .inStock(totalStock > 0)
                .featured(true)
                .variants(variantResponses)
                .placement(placementResp)
                .build();
    }

    private ProductDto.VariantResponse mapToVariantResponse(ProductVariant variant, Product product) {
        Inventory inv = inventoryRepository.findByProductIdAndVariantId(
                product.getId(), variant.getId()).orElse(null);
        int stock = inv != null ? inv.getAvailableQuantity() : 0;

        BigDecimal mrp = variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getPrice();
        BigDecimal price = variant.getEffectivePrice();

        return ProductDto.VariantResponse.builder()
                .id(variant.getId().toString())
                .productId(product.getId().toString())
                .sku(variant.getFullSku())
                .name((variant.getSize() != null ? "Size " + variant.getSize() : "") +
                        (variant.getColor() != null ? " (" + variant.getColor() + ")" : ""))
                .size(variant.getSize())
                .color(variant.getColor())
                .colorCode(variant.getColorHex() != null ? variant.getColorHex() : "#1e3a8a")
                .colorHex(variant.getColorHex())
                .skuSuffix(variant.getSkuSuffix())
                .price(price)
                .mrp(mrp)
                .priceOverride(variant.getPriceOverride())
                .effectivePrice(price)
                .imageUrl(variant.getImageUrl())
                .stockQuantity(stock)
                .inStock(stock > 0)
                .build();
    }

    private ProductDto.CategoryResponse mapToCategoryResponse(Category category) {
        List<ProductDto.CategoryResponse> children = null;
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            children = category.getChildren().stream()
                    .filter(Category::getActive)
                    .map(this::mapToCategoryResponse)
                    .collect(Collectors.toList());
        }

        long productCount = category.getProducts() != null
                ? category.getProducts().stream().filter(Product::getActive).count()
                : 0;

        return ProductDto.CategoryResponse.builder()
                .id(category.getId().toString())
                .name(category.getName())
                .slug(category.getName().toLowerCase().replace(" ", "-"))
                .description(category.getDescription())
                .floorNumber(category.getFloorNumber())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .parentId(category.getParent() != null ? category.getParent().getId().toString() : null)
                .children(children)
                .productCount(productCount)
                .build();
    }

    private ProductDto.PagedResponse<ProductDto.ProductResponse> toPagedResponse(Page<Product> page) {
        List<ProductDto.ProductResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ProductDto.PagedResponse.<ProductDto.ProductResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
