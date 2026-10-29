package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.WishlistDto;
import com.martverse.entity.User;
import com.martverse.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Customer saved products management")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get current customer wishlist")
    public ResponseEntity<ApiResponse<WishlistDto.WishlistResponse>> getWishlist(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(userId, sessionId)));
    }

    @PostMapping("/toggle")
    @Operation(summary = "Toggle product in wishlist (add if missing, remove if present)")
    public ResponseEntity<ApiResponse<WishlistDto.WishlistResponse>> toggleItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestBody WishlistDto.ToggleItemRequest request) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated", wishlistService.toggleItem(userId, sessionId, request.getProductId())));
    }

    @PostMapping("/items/{productId}")
    @Operation(summary = "Add item to wishlist")
    public ResponseEntity<ApiResponse<WishlistDto.WishlistResponse>> addItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable String productId) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", wishlistService.addItem(userId, sessionId, productId)));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove item from wishlist")
    public ResponseEntity<ApiResponse<WishlistDto.WishlistResponse>> removeItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable String productId) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", wishlistService.removeItem(userId, sessionId, productId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire wishlist")
    public ResponseEntity<ApiResponse<Void>> clearWishlist(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        UUID userId = user != null ? user.getId() : null;
        wishlistService.clearWishlist(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared", null));
    }
}

