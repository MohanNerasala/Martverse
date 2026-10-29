package com.martverse.service;

import com.martverse.dto.CartDto;
import com.martverse.entity.*;
import com.martverse.enums.CartStatus;
import com.martverse.exception.*;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public CartDto.CartResponse getCart(UUID userId, String sessionId) {
        Cart cart = getOrCreateCart(userId, sessionId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartDto.CartResponse addItem(UUID userId, String sessionId, CartDto.AddItemRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId);
        Product product = productRepository.findById(UUID.fromString(request.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (!product.getActive()) {
            throw new BadRequestException("Product is not available");
        }

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(UUID.fromString(request.getVariantId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", request.getVariantId()));
        } else if (product.getHasVariants()) {
            throw new BadRequestException("This product requires variant selection (size/color)");
        }

        // Check stock
        validateStock(product, variant, request.getQuantity());

        // Find existing cart item or create new
        CartItem cartItem;
        if (variant != null) {
            cartItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(
                    cart.getId(), product.getId(), variant.getId()).orElse(null);
        } else {
            cartItem = cartItemRepository.findByCartIdAndProductIdAndVariantIsNull(
                    cart.getId(), product.getId()).orElse(null);
        }

        if (cartItem != null) {
            int newQty = cartItem.getQuantity() + request.getQuantity();
            validateStock(product, variant, newQty);
            cartItem.setQuantity(newQty);
            cartItemRepository.save(cartItem);
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartDto.CartResponse updateItem(UUID userId, String sessionId, String itemId,
                                            CartDto.UpdateItemRequest request) {
        Cart cart = getActiveCart(userId, sessionId);
        CartItem item = cartItemRepository.findById(UUID.fromString(itemId))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        validateStock(item.getProduct(), item.getVariant(), request.getQuantity());
        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartDto.CartResponse removeItem(UUID userId, String sessionId, String itemId) {
        Cart cart = getActiveCart(userId, sessionId);
        CartItem item = cartItemRepository.findById(UUID.fromString(itemId))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        cartItemRepository.delete(item);
        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public void clearCart(UUID userId, String sessionId) {
        Cart cart = getActiveCart(userId, sessionId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    // ── Internal helpers ─────────────────────────────────────────

    public Cart getOrCreateCart(UUID userId, String sessionId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);
        } else {
            cart = cartRepository.findBySessionIdAndStatus(sessionId, CartStatus.ACTIVE).orElse(null);
        }

        if (cart == null) {
            cart = Cart.builder()
                    .status(CartStatus.ACTIVE)
                    .sessionId(sessionId)
                    .build();
            if (userId != null) {
                User user = new User();
                user.setId(userId);
                cart.setUser(user);
            }
            cart = cartRepository.save(cart);
        }
        return cart;
    }

    private Cart getActiveCart(UUID userId, String sessionId) {
        Cart cart;
        if (userId != null) {
            cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);
        } else {
            cart = cartRepository.findBySessionIdAndStatus(sessionId, CartStatus.ACTIVE).orElse(null);
        }
        if (cart == null) {
            throw new ResourceNotFoundException("No active cart found");
        }
        return cart;
    }

    private void validateStock(Product product, ProductVariant variant, int quantity) {
        Inventory inv;
        if (variant != null) {
            inv = inventoryRepository.findByProductIdAndVariantId(product.getId(), variant.getId()).orElse(null);
        } else {
            inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
        }

        int available = inv != null ? inv.getAvailableQuantity() : 0;
        if (quantity > available) {
            throw new InsufficientStockException(product.getName(), quantity, available);
        }
    }

    private CartDto.CartResponse mapToCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        List<CartDto.CartItemResponse> itemResponses = items.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
                .map(CartDto.CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream().mapToInt(CartItem::getQuantity).sum();

        return CartDto.CartResponse.builder()
                .id(cart.getId().toString())
                .items(itemResponses)
                .totalItems(totalItems)
                .uniqueItems(items.size())
                .subtotal(subtotal)
                .build();
    }

    private CartDto.CartItemResponse mapToCartItemResponse(CartItem item) {
        Product product = item.getProduct();
        ProductVariant variant = item.getVariant();

        BigDecimal effectivePrice = variant != null
                ? variant.getEffectivePrice()
                : product.getEffectivePrice();

        BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        Inventory inv;
        if (variant != null) {
            inv = inventoryRepository.findByProductIdAndVariantId(product.getId(), variant.getId()).orElse(null);
        } else {
            inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
        }
        int available = inv != null ? inv.getAvailableQuantity() : 0;

        return CartDto.CartItemResponse.builder()
                .id(item.getId().toString())
                .productId(product.getId().toString())
                .productName(product.getName())
                .productSku(product.getSku())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .unitPrice(product.getPrice())
                .effectivePrice(effectivePrice)
                .quantity(item.getQuantity())
                .lineTotal(lineTotal)
                .variantId(variant != null ? variant.getId().toString() : null)
                .size(variant != null ? variant.getSize() : null)
                .color(variant != null ? variant.getColor() : null)
                .availableStock(available)
                .build();
    }
}
