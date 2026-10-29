package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.BillingDto;
import com.martverse.entity.User;
import com.martverse.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing Sessions", description = "Physical supermarket POS counter billing sessions")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/start")
    @Operation(summary = "Start POS counter billing session for trolley/cart")
    public ResponseEntity<ApiResponse<BillingDto.BillingSessionResponse>> startBilling(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody BillingDto.StartBillingSessionRequest request) {

        UUID userId = user != null ? user.getId() : null;
        BillingDto.BillingSessionResponse response =
                billingService.startBillingSession(userId, sessionId, request);
        return ResponseEntity.ok(ApiResponse.success("Billing session started at Counter #" + response.getCounterNumber(), response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get billing session status and scanned items")
    public ResponseEntity<ApiResponse<BillingDto.BillingSessionResponse>> getBillingSession(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getBillingSession(UUID.fromString(id))));
    }

    @PostMapping("/{id}/scan")
    @Operation(summary = "Scan item at POS counter conveyor")
    public ResponseEntity<ApiResponse<BillingDto.BillingSessionResponse>> scanItem(
            @PathVariable String id,
            @Valid @RequestBody BillingDto.ScanItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item scanned", billingService.scanItem(UUID.fromString(id), request)));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete billing session")
    public ResponseEntity<ApiResponse<BillingDto.BillingSessionResponse>> completeBillingSession(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Billing session completed", billingService.completeBillingSession(UUID.fromString(id))));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel billing session")
    public ResponseEntity<ApiResponse<BillingDto.BillingSessionResponse>> cancelBillingSession(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Billing session cancelled", billingService.cancelBillingSession(UUID.fromString(id))));
    }

    @PostMapping("/revalidate")
    @Operation(summary = "Revalidate cart against backend database and compute authoritative order total")
    public ResponseEntity<ApiResponse<BillingDto.RevalidateCartResponse>> revalidateCart(
            @Valid @RequestBody BillingDto.RevalidateCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cart revalidated against database", billingService.revalidateCart(request)));
    }
}
