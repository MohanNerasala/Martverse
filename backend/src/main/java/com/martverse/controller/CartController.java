package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.CartDto;
import com.martverse.entity.User;
import com.martverse.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Cart management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current cart")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> getCart(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId, sessionId)));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> addItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody CartDto.AddItemRequest request) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to trolley", cartService.addItem(userId, sessionId, request)));
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> updateItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable String itemId,
            @Valid @RequestBody CartDto.UpdateItemRequest request) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItem(userId, sessionId, itemId, request)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> removeItem(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable String itemId) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(userId, sessionId, itemId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        UUID userId = user != null ? user.getId() : null;
        cartService.clearCart(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
