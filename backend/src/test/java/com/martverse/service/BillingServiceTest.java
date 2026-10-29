package com.martverse.service;

import com.martverse.dto.BillingDto;
import com.martverse.entity.*;
import com.martverse.enums.BillingSessionStatus;
import com.martverse.enums.CartStatus;
import com.martverse.exception.BadRequestException;
import com.martverse.repository.BillingSessionRepository;
import com.martverse.repository.CartItemRepository;
import com.martverse.repository.CartRepository;
import com.martverse.repository.ProductRepository;
import com.martverse.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private BillingSessionRepository billingSessionRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private com.martverse.repository.InventoryRepository inventoryRepository;

    @InjectMocks
    private BillingService billingService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;
    private CartItem testCartItem;
    private UUID cartId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder().id(userId).email("shopper@martverse.com").build();

        cartId = UUID.randomUUID();
        testCart = Cart.builder()
                .id(cartId)
                .user(testUser)
                .status(CartStatus.ACTIVE)
                .items(new ArrayList<>())
                .build();

        testProduct = Product.builder()
                .id(UUID.randomUUID())
                .name("Cadbury Dairy Milk Silk Chocolate")
                .sku("SWT-CDM-001")
                .price(new BigDecimal("90.00"))
                .discountPrice(new BigDecimal("80.00"))
                .active(true)
                .hasVariants(false)
                .build();

        testCartItem = CartItem.builder()
                .id(UUID.randomUUID())
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();
    }

    @Test
    @DisplayName("Starting billing session creates session at specified counter with scanned cart items")
    void testStartBillingSession_Success() {
        when(cartRepository.findById(cartId)).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartId(cartId)).thenReturn(List.of(testCartItem));
        when(billingSessionRepository.save(any(BillingSession.class))).thenAnswer(i -> {
            BillingSession bs = i.getArgument(0);
            bs.setId(UUID.randomUUID());
            return bs;
        });

        BillingDto.StartBillingSessionRequest request = BillingDto.StartBillingSessionRequest.builder()
                .cartId(cartId.toString())
                .counterNumber(2)
                .build();

        BillingDto.BillingSessionResponse response = billingService.startBillingSession(userId, null, request);

        assertThat(response).isNotNull();
        assertThat(response.getCounterNumber()).isEqualTo(2);
        assertThat(response.getScannedCount()).isEqualTo(2);
        // 2 units * 80.00 effective price = 160.00
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("160.00"));
        assertThat(response.getItems()).hasSize(1);
    }

    @Test
    @DisplayName("Starting billing session with empty cart throws BadRequestException")
    void testStartBillingSession_EmptyCart_ThrowsBadRequest() {
        when(cartRepository.findById(cartId)).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartId(cartId)).thenReturn(List.of());

        BillingDto.StartBillingSessionRequest request = BillingDto.StartBillingSessionRequest.builder()
                .cartId(cartId.toString())
                .counterNumber(1)
                .build();

        assertThatThrownBy(() -> billingService.startBillingSession(userId, null, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot start billing: trolley/cart is empty");
    }

    @Test
    @DisplayName("Completing billing session marks session as COMPLETED")
    void testCompleteBillingSession_Success() {
        UUID sessionId = UUID.randomUUID();
        BillingSession session = BillingSession.builder()
                .id(sessionId)
                .cart(testCart)
                .counterNumber(1)
                .scannedCount(2)
                .subtotal(new BigDecimal("160.00"))
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("160.00"))
                .status(BillingSessionStatus.SCANNING)
                .build();

        when(billingSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(billingSessionRepository.save(any(BillingSession.class))).thenAnswer(i -> i.getArgument(0));
        when(cartItemRepository.findByCartId(testCart.getId())).thenReturn(List.of(testCartItem));

        BillingDto.BillingSessionResponse response = billingService.completeBillingSession(sessionId);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(BillingSessionStatus.COMPLETED.name());
        verify(billingSessionRepository).save(session);
    }

    @Test
    @DisplayName("Revalidating cart against database calculates trusted subtotal and final amount")
    void testRevalidateCart_CalculatesTrustedTotals() {
        UUID prodId = testProduct.getId();
        when(productRepository.findById(prodId)).thenReturn(Optional.of(testProduct));

        com.martverse.entity.Inventory inv = com.martverse.entity.Inventory.builder()
                .product(testProduct)
                .stockQuantity(10)
                .reservedQuantity(0)
                .build();
        when(inventoryRepository.findByProductIdAndVariantIsNull(prodId)).thenReturn(Optional.of(inv));

        BillingDto.RevalidateCartRequest request = BillingDto.RevalidateCartRequest.builder()
                .items(List.of(
                        BillingDto.ScanItemRequest.builder()
                                .productId(prodId.toString())
                                .quantity(2)
                                .build()
                ))
                .fulfilmentType("DELIVERY")
                .build();

        BillingDto.RevalidateCartResponse response = billingService.revalidateCart(request);

        assertThat(response).isNotNull();
        assertThat(response.isValid()).isTrue();
        assertThat(response.getTotalItems()).isEqualTo(2);
        // 2 units * 80.00 effective price = 160.00
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("160.00"));
        // Subtotal < 499, delivery fee = 40.00 -> total = 200.00
        assertThat(response.getDeliveryCharge()).isEqualByComparingTo(new BigDecimal("40.00"));
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("200.00"));
        assertThat(response.getItems()).hasSize(1);
    }
}
