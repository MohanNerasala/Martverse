package com.martverse.service;

import com.martverse.dto.PaymentDto;
import com.martverse.entity.Order;
import com.martverse.entity.Payment;
import com.martverse.entity.User;
import com.martverse.enums.OrderStatus;
import com.martverse.enums.PaymentMethod;
import com.martverse.enums.PaymentStatus;
import com.martverse.exception.BadRequestException;
import com.martverse.exception.PaymentException;
import com.martverse.repository.OrderRepository;
import com.martverse.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private PaymentService paymentService;

    private User testUser;
    private Order testOrder;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("shopper@martverse.com")
                .build();

        orderId = UUID.randomUUID();
        testOrder = Order.builder()
                .id(orderId)
                .orderNumber("MV-TEST-1001")
                .user(testUser)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("499.00"))
                .build();
    }

    @Test
    @DisplayName("Valid Card with Luhn check and future expiry succeeds and records COMPLETED payment")
    void testCardPayment_Success() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        // 4532015112830366 is a valid Luhn visa card number
        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.CARD)
                .amount(new BigDecimal("499.00"))
                .cardNumber("4532 0151 1283 0366")
                .cardExpiry("12/29")
                .cardCvv("123")
                .build();

        PaymentDto.PaymentResponse response = paymentService.processPayment(testUser.getId(), request);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getPaymentMethod()).isEqualTo("CARD");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(saved.getPaidAt()).isNotNull();
        assertThat(saved.getFailureReason()).isNull();

        verify(orderService).confirmOrder(orderId);
    }

    @Test
    @DisplayName("Invalid Card Luhn fails, records FAILED payment record in DB, and throws PaymentException (no fake success)")
    void testCardPayment_Failure_InvalidLuhn() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // 4532015112830367 fails Luhn check (last digit changed)
        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.CARD)
                .amount(new BigDecimal("499.00"))
                .cardNumber("4532 0151 1283 0367")
                .cardExpiry("12/29")
                .cardCvv("123")
                .build();

        assertThatThrownBy(() -> paymentService.processPayment(testUser.getId(), request))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Invalid card number");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment failedPayment = captor.getValue();
        assertThat(failedPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(failedPayment.getFailureReason()).contains("Invalid card number");
        verify(orderService, never()).confirmOrder(any());
    }

    @Test
    @DisplayName("Expired Card fails, records FAILED status in DB, and throws PaymentException")
    void testCardPayment_Failure_ExpiredCard() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.CARD)
                .amount(new BigDecimal("499.00"))
                .cardNumber("4532 0151 1283 0366")
                .cardExpiry("01/20") // Expired
                .cardCvv("123")
                .build();

        assertThatThrownBy(() -> paymentService.processPayment(testUser.getId(), request))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Card has expired");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    @DisplayName("Valid UPI ID succeeds and records COMPLETED payment")
    void testUPIPayment_Success() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.UPI)
                .amount(new BigDecimal("499.00"))
                .upiId("shopper@okhdfcbank")
                .build();

        PaymentDto.PaymentResponse response = paymentService.processPayment(testUser.getId(), request);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getPaymentMethod()).isEqualTo("UPI");
        verify(orderService).confirmOrder(orderId);
    }

    @Test
    @DisplayName("Invalid UPI ID fails, records FAILED in database, and throws PaymentException")
    void testUPIPayment_Failure_InvalidVpa() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.UPI)
                .amount(new BigDecimal("499.00"))
                .upiId("invalid-no-handle")
                .build();

        assertThatThrownBy(() -> paymentService.processPayment(testUser.getId(), request))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("Invalid UPI ID");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    @DisplayName("Payment amount mismatch triggers server-side validation error")
    void testPayment_AmountMismatch() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.UPI)
                .amount(new BigDecimal("299.00")) // Mismatch! (Order total is 499.00)
                .upiId("shopper@okhdfcbank")
                .build();

        assertThatThrownBy(() -> paymentService.processPayment(testUser.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment amount mismatch");
    }

    @Test
    @DisplayName("Customer permission check prevents paying for another user's order")
    void testPayment_CustomerPermissionCheck() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        UUID anotherUserId = UUID.randomUUID();

        PaymentDto.ProcessPaymentRequest request = PaymentDto.ProcessPaymentRequest.builder()
                .orderId(orderId.toString())
                .paymentMethod(PaymentMethod.UPI)
                .amount(new BigDecimal("499.00"))
                .upiId("shopper@okhdfcbank")
                .build();

        assertThatThrownBy(() -> paymentService.processPayment(anotherUserId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order does not belong to the authenticated customer");
    }
}
