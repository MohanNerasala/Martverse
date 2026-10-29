package com.martverse.repository;

import com.martverse.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    List<ProductVariant> findByProductIdAndActiveTrue(UUID productId);
    List<ProductVariant> findByProductId(UUID productId);
}
