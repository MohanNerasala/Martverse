package com.martverse.service;

import com.martverse.dto.CartDto;
import com.martverse.entity.*;
import com.martverse.enums.CartStatus;
import com.martverse.exception.InsufficientStockException;
import com.martverse.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;
    private Inventory testInventory;
    private UUID userId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder().id(userId).email("shopper@martverse.com").build();

        testCart = Cart.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .status(CartStatus.ACTIVE)
                .items(new ArrayList<>())
                .build();

        productId = UUID.randomUUID();
        testProduct = Product.builder()
                .id(productId)
                .name("Tata Salt 1kg")
                .sku("GRC-TTS-001")
                .price(new BigDecimal("28.00"))
                .discountPrice(new BigDecimal("25.00"))
                .active(true)
                .hasVariants(false)
                .build();

        testInventory = Inventory.builder()
                .id(UUID.randomUUID())
                .product(testProduct)
                .stockQuantity(10)
                .reservedQuantity(2)
                .build();
    }

    @Test
    @DisplayName("Adding available item to cart creates cart item and validates stock")
    void testAddToCart_Success() {
        when(cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(productId))
                .thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProductIdAndVariantIsNull(productId))
                .thenReturn(Optional.of(testInventory));
        when(cartItemRepository.findByCartIdAndProductIdAndVariantIsNull(testCart.getId(), productId))
                .thenReturn(Optional.empty());
        when(cartRepository.findById(testCart.getId()))
                .thenReturn(Optional.of(testCart));

        CartDto.AddItemRequest request = CartDto.AddItemRequest.builder()
                .productId(productId.toString())
                .quantity(3)
                .build();

        CartDto.CartResponse response = cartService.addItem(userId, null, request);

        assertThat(response).isNotNull();
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Adding quantity exceeding available stock triggers ConflictException")
    void testAddToCart_ExceedsInventory_ThrowsConflict() {
        when(cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(productId))
                .thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProductIdAndVariantIsNull(productId))
                .thenReturn(Optional.of(testInventory)); // Available: 10 - 2 = 8

        CartDto.AddItemRequest request = CartDto.AddItemRequest.builder()
                .productId(productId.toString())
                .quantity(15) // Greater than 8 available
                .build();

        assertThatThrownBy(() -> cartService.addItem(userId, null, request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Removing item from cart deletes the item")
    void testRemoveItem_Success() {
        when(cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE))
                .thenReturn(Optional.of(testCart));

        UUID itemId = UUID.randomUUID();
        CartItem item = CartItem.builder()
                .id(itemId)
                .cart(testCart)
                .product(testProduct)
                .quantity(2)
                .build();

        when(cartItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(cartRepository.findById(testCart.getId())).thenReturn(Optional.of(testCart));

        cartService.removeItem(userId, null, itemId.toString());

        verify(cartItemRepository).delete(item);
    }
}
