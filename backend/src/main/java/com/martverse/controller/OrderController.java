package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.OrderDto;
import com.martverse.entity.User;
import com.martverse.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order creation and history")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create order from current cart")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderDto.CreateOrderRequest request) {
        OrderDto.OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrder(UUID.fromString(id), user != null ? user.getId() : null)));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number (public)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderByNumber(orderNumber)));
    }

    @GetMapping
    @Operation(summary = "Get user's order history")
    public ResponseEntity<ApiResponse<List<OrderDto.OrderResponse>>> getUserOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getUserOrders(user.getId(), PageRequest.of(page, size))));
    }

    @GetMapping("/history")
    @Operation(summary = "Get order history by phone number or authenticated user")
    public ResponseEntity<ApiResponse<List<OrderDto.OrderResponse>>> getOrderHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String phone,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (user != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    orderService.getUserOrders(user.getId(), PageRequest.of(page, size))));
        } else if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(
                    orderService.getOrdersByPhone(phone)));
        }
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
}
