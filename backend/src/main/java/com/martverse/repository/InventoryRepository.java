package com.martverse.repository;

import com.martverse.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByProductIdAndVariantIsNull(UUID productId);

    Optional<Inventory> findByProductIdAndVariantId(UUID productId, UUID variantId);

    @Modifying
    @Query("UPDATE Inventory i SET i.stockQuantity = i.stockQuantity - :qty, " +
           "i.reservedQuantity = GREATEST(i.reservedQuantity - :qty, 0) " +
           "WHERE i.product.id = :productId AND i.variant IS NULL " +
           "AND (i.stockQuantity - :qty) >= 0")
    int deductStock(@Param("productId") UUID productId, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.stockQuantity = i.stockQuantity - :qty, " +
           "i.reservedQuantity = GREATEST(i.reservedQuantity - :qty, 0) " +
           "WHERE i.product.id = :productId AND i.variant.id = :variantId " +
           "AND (i.stockQuantity - :qty) >= 0")
    int deductVariantStock(@Param("productId") UUID productId,
                           @Param("variantId") UUID variantId,
                           @Param("qty") int qty);
}
