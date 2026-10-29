package com.martverse.repository;

import com.martverse.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugAndActiveTrue(String slug);

    List<Product> findByCategoryIdInAndActiveTrue(List<UUID> categoryIds);

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.active = true")
    List<Product> findAllActiveWithCategory();

    long countByActiveTrue();
}
