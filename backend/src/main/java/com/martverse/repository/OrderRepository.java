package com.martverse.repository;

import com.martverse.entity.Order;
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
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    List<Order> findByAddressPhoneOrderByCreatedAtDesc(String phone);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.address a WHERE (a.phone IS NOT NULL AND a.phone LIKE %:cleanPhone%) OR o.user.id IN (SELECT p.user.id FROM CustomerProfile p WHERE p.phone LIKE %:cleanPhone%) ORDER BY o.createdAt DESC")
    List<Order> findByPhoneFlexible(@Param("cleanPhone") String cleanPhone);
}
