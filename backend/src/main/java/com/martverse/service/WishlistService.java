package com.martverse.service;

import com.martverse.dto.ProductDto;
import com.martverse.dto.WishlistDto;
import com.martverse.entity.Product;
import com.martverse.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    // In-memory thread-safe store: ownerKey -> Set of productIds
    private final Map<String, Set<String>> wishlistStore = new ConcurrentHashMap<>();

    private String getOwnerKey(UUID userId, String sessionId) {
        if (userId != null) {
            return "user:" + userId.toString();
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return "session:" + sessionId.trim();
        }
        return "session:anonymous";
    }

    public WishlistDto.WishlistResponse getWishlist(UUID userId, String sessionId) {
        String key = getOwnerKey(userId, sessionId);
        Set<String> productIds = wishlistStore.getOrDefault(key, Collections.emptySet());

        List<ProductDto.ProductResponse> products = productIds.stream()
                .map(this::resolveProduct)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return WishlistDto.WishlistResponse.builder()
                .ownerId(key)
                .totalItems(products.size())
                .items(products)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public WishlistDto.WishlistResponse toggleItem(UUID userId, String sessionId, String productId) {
        if (productId == null || productId.isBlank()) {
            return getWishlist(userId, sessionId);
        }

        String key = getOwnerKey(userId, sessionId);
        Set<String> productIds = wishlistStore.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet());

        if (productIds.contains(productId)) {
            productIds.remove(productId);
            log.info("Removed product {} from wishlist for {}", productId, key);
        } else {
            productIds.add(productId);
            log.info("Added product {} to wishlist for {}", productId, key);
        }

        return getWishlist(userId, sessionId);
    }

    public WishlistDto.WishlistResponse addItem(UUID userId, String sessionId, String productId) {
        if (productId == null || productId.isBlank()) {
            return getWishlist(userId, sessionId);
        }
        String key = getOwnerKey(userId, sessionId);
        Set<String> productIds = wishlistStore.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet());
        productIds.add(productId);
        return getWishlist(userId, sessionId);
    }

    public WishlistDto.WishlistResponse removeItem(UUID userId, String sessionId, String productId) {
        if (productId == null || productId.isBlank()) {
            return getWishlist(userId, sessionId);
        }
        String key = getOwnerKey(userId, sessionId);
        Set<String> productIds = wishlistStore.get(key);
        if (productIds != null) {
            productIds.remove(productId);
        }
        return getWishlist(userId, sessionId);
    }

    public void clearWishlist(UUID userId, String sessionId) {
        String key = getOwnerKey(userId, sessionId);
        wishlistStore.remove(key);
    }

    private ProductDto.ProductResponse resolveProduct(String productId) {
        try {
            // First try resolving via database UUID
            try {
                UUID uuid = UUID.fromString(productId);
                Optional<Product> prodOpt = productRepository.findById(uuid);
                if (prodOpt.isPresent()) {
                    return productService.getProductById(productId);
                }
            } catch (IllegalArgumentException ignored) {
                // Not a UUID, slug or mock ID
            }

            // Next try finding by slug or sku
            try {
                return productService.getProductBySlug(productId);
            } catch (Exception ignored) {}

        } catch (Exception e) {
            log.debug("Could not resolve product in database: {}", productId);
        }

        // Fallback placeholder with standard details so frontend mock items remain preserved
        return ProductDto.ProductResponse.builder()
                .id(productId)
                .name("Supermarket Product (" + productId + ")")
                .slug(productId)
                .inStock(true)
                .build();
    }
}

