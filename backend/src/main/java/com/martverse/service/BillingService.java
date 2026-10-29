package com.martverse.service;

import com.martverse.dto.BillingDto;
import com.martverse.entity.*;
import com.martverse.enums.BillingSessionStatus;
import com.martverse.enums.CartStatus;
import com.martverse.exception.BadRequestException;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingSessionRepository billingSessionRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public BillingDto.BillingSessionResponse startBillingSession(
            UUID userId, String sessionId, BillingDto.StartBillingSessionRequest request) {

        Cart cart;
        if (request.getCartId() != null && !request.getCartId().isBlank()) {
            cart = cartRepository.findById(UUID.fromString(request.getCartId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Cart", request.getCartId()));
        } else if (userId != null) {
            cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                    .orElseThrow(() -> new BadRequestException("No active cart found for user"));
        } else if (sessionId != null && !sessionId.isBlank()) {
            cart = cartRepository.findBySessionIdAndStatus(sessionId, CartStatus.ACTIVE)
                    .orElseThrow(() -> new BadRequestException("No active cart found for session"));
        } else {
            throw new BadRequestException("Cart identification is required");
        }

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot start billing: trolley/cart is empty");
        }

        int scannedCount = 0;
        BigDecimal subtotal = BigDecimal.ZERO;
        List<BillingDto.BillingScannedItem> scannedItemList = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            ProductVariant v = ci.getVariant();
            BigDecimal price = v != null ? v.getEffectivePrice() : p.getEffectivePrice();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(ci.getQuantity()));

            subtotal = subtotal.add(lineTotal);
            scannedCount += ci.getQuantity();

            String varInfo = null;
            if (v != null) {
                varInfo = (v.getSize() != null ? "Size: " + v.getSize() : "") +
                        (v.getColor() != null ? " Color: " + v.getColor() : "");
            }

            scannedItemList.add(BillingDto.BillingScannedItem.builder()
                    .productId(p.getId().toString())
                    .productName(p.getName())
                    .productSku(v != null ? v.getFullSku() : p.getSku())
                    .variantId(v != null ? v.getId().toString() : null)
                    .variantInfo(varInfo != null ? varInfo.trim() : null)
                    .quantity(ci.getQuantity())
                    .unitPrice(price)
                    .lineTotal(lineTotal)
                    .build());
        }

        int counter = request.getCounterNumber() != null ? request.getCounterNumber() : 1;

        BillingSession billingSession = BillingSession.builder()
                .cart(cart)
                .status(BillingSessionStatus.SCANNING)
                .counterNumber(counter)
                .scannedCount(scannedCount)
                .subtotal(subtotal)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(subtotal)
                .build();

        if (userId != null) {
            User user = new User();
            user.setId(userId);
            billingSession.setUser(user);
        }

        billingSession = billingSessionRepository.save(billingSession);
        log.info("Started billing session {} at Counter #{} with {} items",
                billingSession.getId(), counter, scannedCount);

        return mapToResponse(billingSession, scannedItemList);
    }

    @Transactional(readOnly = true)
    public BillingDto.BillingSessionResponse getBillingSession(UUID sessionId) {
        BillingSession session = billingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("BillingSession", sessionId.toString()));

        List<CartItem> cartItems = cartItemRepository.findByCartId(session.getCart().getId());
        List<BillingDto.BillingScannedItem> scannedItemList = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            ProductVariant v = ci.getVariant();
            BigDecimal price = v != null ? v.getEffectivePrice() : p.getEffectivePrice();

            scannedItemList.add(BillingDto.BillingScannedItem.builder()
                    .productId(p.getId().toString())
                    .productName(p.getName())
                    .productSku(v != null ? v.getFullSku() : p.getSku())
                    .variantId(v != null ? v.getId().toString() : null)
                    .quantity(ci.getQuantity())
                    .unitPrice(price)
                    .lineTotal(price.multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .build());
        }

        return mapToResponse(session, scannedItemList);
    }

    @Transactional
    public BillingDto.BillingSessionResponse scanItem(UUID sessionId, BillingDto.ScanItemRequest request) {
        BillingSession session = billingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("BillingSession", sessionId.toString()));

        if (session.getStatus() != BillingSessionStatus.SCANNING && session.getStatus() != BillingSessionStatus.CREATED) {
            throw new BadRequestException("Billing session is not in scanning state: " + session.getStatus());
        }

        Product product = productRepository.findById(UUID.fromString(request.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        ProductVariant variant = null;
        if (request.getVariantId() != null && !request.getVariantId().isBlank()) {
            variant = variantRepository.findById(UUID.fromString(request.getVariantId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", request.getVariantId()));
        }

        int qty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        BigDecimal price = variant != null ? variant.getEffectivePrice() : product.getEffectivePrice();
        BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(qty));

        session.setScannedCount(session.getScannedCount() + qty);
        session.setSubtotal(session.getSubtotal().add(lineTotal));
        session.setTotalAmount(session.getSubtotal().add(session.getTaxAmount()));
        session = billingSessionRepository.save(session);

        return getBillingSession(session.getId());
    }

    @Transactional
    public BillingDto.BillingSessionResponse completeBillingSession(UUID sessionId) {
        BillingSession session = billingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("BillingSession", sessionId.toString()));

        session.setStatus(BillingSessionStatus.COMPLETED);
        session = billingSessionRepository.save(session);
        return getBillingSession(session.getId());
    }

    @Transactional
    public BillingDto.BillingSessionResponse cancelBillingSession(UUID sessionId) {
        BillingSession session = billingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("BillingSession", sessionId.toString()));

        session.setStatus(BillingSessionStatus.CANCELLED);
        session = billingSessionRepository.save(session);
        return getBillingSession(session.getId());
    }

    @Transactional(readOnly = true)
    public BillingDto.RevalidateCartResponse revalidateCart(BillingDto.RevalidateCartRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return BillingDto.RevalidateCartResponse.builder()
                    .valid(true)
                    .totalItems(0)
                    .subtotal(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .deliveryCharge(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .items(new ArrayList<>())
                    .warnings(new ArrayList<>())
                    .build();
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal mrpTotal = BigDecimal.ZERO;
        int totalItems = 0;
        List<BillingDto.BillingScannedItem> items = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (BillingDto.ScanItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getProductId().isBlank()) {
                continue;
            }

            Product product = productRepository.findById(UUID.fromString(itemReq.getProductId())).orElse(null);
            if (product == null || !Boolean.TRUE.equals(product.getActive())) {
                warnings.add("Product " + itemReq.getProductId() + " is no longer available.");
                continue;
            }

            ProductVariant variant = null;
            if (itemReq.getVariantId() != null && !itemReq.getVariantId().isBlank()) {
                variant = variantRepository.findById(UUID.fromString(itemReq.getVariantId())).orElse(null);
            }

            int requestedQty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;

            if (inventoryRepository != null) {
                Inventory inv;
                if (variant != null) {
                    inv = inventoryRepository.findByProductIdAndVariantId(product.getId(), variant.getId()).orElse(null);
                } else {
                    inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
                }
                int available = inv != null ? inv.getAvailableQuantity() : 0;
                if (requestedQty > available) {
                    warnings.add(product.getName() + " has only " + available + " units left in stock.");
                    if (available <= 0) {
                        continue;
                    }
                    requestedQty = available;
                }
            }

            BigDecimal unitPrice = variant != null ? variant.getEffectivePrice() : product.getEffectivePrice();
            BigDecimal unitMrp = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(requestedQty));
            BigDecimal lineMrp = unitMrp.multiply(BigDecimal.valueOf(requestedQty));

            subtotal = subtotal.add(lineTotal);
            mrpTotal = mrpTotal.add(lineMrp);
            totalItems += requestedQty;

            String varInfo = null;
            if (variant != null) {
                varInfo = (variant.getSize() != null ? "Size: " + variant.getSize() : "") +
                        (variant.getColor() != null ? " Color: " + variant.getColor() : "");
            }

            items.add(BillingDto.BillingScannedItem.builder()
                    .productId(product.getId().toString())
                    .productName(product.getName())
                    .productSku(variant != null ? variant.getFullSku() : product.getSku())
                    .variantId(variant != null ? variant.getId().toString() : null)
                    .variantInfo(varInfo != null ? varInfo.trim() : null)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build());
        }

        BigDecimal discountAmount = mrpTotal.subtract(subtotal).max(BigDecimal.ZERO);
        BigDecimal deliveryCharge = (subtotal.compareTo(new BigDecimal("499")) >= 0 || "STORE_PICKUP".equalsIgnoreCase(request.getFulfilmentType()))
                ? BigDecimal.ZERO
                : (subtotal.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : new BigDecimal("40"));

        BigDecimal totalAmount = subtotal.add(deliveryCharge);

        return BillingDto.RevalidateCartResponse.builder()
                .valid(warnings.isEmpty())
                .totalItems(totalItems)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .deliveryCharge(deliveryCharge)
                .totalAmount(totalAmount)
                .items(items)
                .warnings(warnings)
                .build();
    }

    private BillingDto.BillingSessionResponse mapToResponse(
            BillingSession session, List<BillingDto.BillingScannedItem> items) {
        return BillingDto.BillingSessionResponse.builder()
                .id(session.getId().toString())
                .cartId(session.getCart().getId().toString())
                .userId(session.getUser() != null ? session.getUser().getId().toString() : null)
                .status(session.getStatus().name())
                .counterNumber(session.getCounterNumber())
                .scannedCount(session.getScannedCount())
                .subtotal(session.getSubtotal())
                .taxAmount(session.getTaxAmount())
                .totalAmount(session.getTotalAmount())
                .items(items)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
