package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.OrderDto;
import com.martverse.entity.User;
import com.martverse.service.OrderService;
import com.martverse.repository.CustomerProfileRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order creation and history")
public class OrderController {

    private final OrderService orderService;
    private final CustomerProfileRepository profileRepository;

    @PostMapping
    @Operation(summary = "Create order from current cart")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderDto.CreateOrderRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to create cart-based order"));
        }
        OrderDto.OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID or order number")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        UUID orderUuid;
        try {
            orderUuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.success(
                    orderService.getOrderByNumber(id)));
        }
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrder(orderUuid, user != null ? user.getId() : null)));
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
            @RequestParam(defaultValue = "20") int size) {

        Map<String, OrderDto.OrderResponse> combined = new LinkedHashMap<>();

        // 1. If explicit phone provided, lookup by phone
        if (phone != null && !phone.isBlank()) {
            List<OrderDto.OrderResponse> byPhone = orderService.getOrdersByPhone(phone);
            for (OrderDto.OrderResponse o : byPhone) {
                combined.put(o.getOrderNumber(), o);
            }
        }

        // 2. If authenticated user, lookup user orders and their profile phone orders
        if (user != null) {
            List<OrderDto.OrderResponse> userOrders = orderService.getUserOrders(user.getId(), PageRequest.of(page, size));
            for (OrderDto.OrderResponse o : userOrders) {
                combined.put(o.getOrderNumber(), o);
            }

            profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                if (profile.getPhone() != null && !profile.getPhone().isBlank()) {
                    List<OrderDto.OrderResponse> phoneOrders = orderService.getOrdersByPhone(profile.getPhone());
                    for (OrderDto.OrderResponse o : phoneOrders) {
                        combined.putIfAbsent(o.getOrderNumber(), o);
                    }
                }
            });
        }

        List<OrderDto.OrderResponse> resultList = new ArrayList<>(combined.values());
        return ResponseEntity.ok(ApiResponse.success(resultList));
    }
}
