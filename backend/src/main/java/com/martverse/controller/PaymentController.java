package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.PaymentDto;
import com.martverse.entity.User;
import com.martverse.service.PaymentService;
import com.martverse.service.SimulatedPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Processing", description = "Real payment lifecycle, server-side validation, and payment records")
public class PaymentController {

    private final PaymentService paymentService;
    private final SimulatedPaymentService simulatedPaymentService;

    @PostMapping("/process")
    @Operation(summary = "Process real payment with payment method verification (Card Luhn, Expiry, UPI VPA, COD)")
    public ResponseEntity<ApiResponse<PaymentDto.PaymentResponse>> processPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentDto.ProcessPaymentRequest request) {

        UUID userId = user != null ? user.getId() : null;
        PaymentDto.PaymentResponse response = paymentService.processPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/create")
    @Operation(summary = "Create a payment record for an order")
    public ResponseEntity<ApiResponse<PaymentDto.CreatePaymentResponse>> createPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentDto.CreatePaymentRequest request) {

        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Payment record created",
                paymentService.createPayment(userId, request)));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment details for an order")
    public ResponseEntity<ApiResponse<PaymentDto.PaymentResponse>> getPaymentByOrderId(
            @PathVariable String orderId) {

        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentByOrderId(UUID.fromString(orderId))));
    }

    @PostMapping("/simulate")
    @Operation(summary = "Process checkout with full database order, item, inventory and payment persistence")
    public ResponseEntity<ApiResponse<PaymentDto.SimulatedPaymentResponse>> processCheckout(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody PaymentDto.SimulatedCheckoutRequest request) {

        UUID userId = user != null ? user.getId() : null;
        PaymentDto.SimulatedPaymentResponse response =
                simulatedPaymentService.processSimulatedCheckout(userId, sessionId, request);

        return ResponseEntity.ok(ApiResponse.success("Checkout processed and payment recorded", response));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Create a pending Razorpay checkout order with server-side pricing and inventory validation")
    public ResponseEntity<ApiResponse<PaymentDto.CheckoutOrderResponse>> createCheckoutOrder(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody PaymentDto.CheckoutOrderRequest request) {

        UUID userId = user != null ? user.getId() : null;
        PaymentDto.CheckoutOrderResponse response =
                paymentService.createCheckoutOrder(userId, sessionId, request);

        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Cryptographically verify Razorpay payment HMAC SHA256 signature and confirm order idempotently")
    public ResponseEntity<ApiResponse<PaymentDto.PaymentResult>> verifyRazorpayPayment(
            @Valid @RequestBody PaymentDto.VerifyRazorpayPaymentRequest request) {

        PaymentDto.PaymentResult response = paymentService.verifyRazorpayPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Record customer payment cancellation while preserving order items")
    public ResponseEntity<ApiResponse<PaymentDto.PaymentResult>> cancelPayment(
            @Valid @RequestBody PaymentDto.CancelPaymentRequest request) {

        PaymentDto.PaymentResult response = paymentService.cancelPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Secure Razorpay webhook receiver with HMAC SHA256 validation and idempotent event processing")
    public ResponseEntity<java.util.Map<String, Object>> handleWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader) {

        return ResponseEntity.ok(paymentService.handleWebhook(rawPayload, signatureHeader));
    }
}
