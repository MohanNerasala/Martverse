package com.martverse.repository;

import com.martverse.entity.Cart;
import com.martverse.enums.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUserIdAndStatus(UUID userId, CartStatus status);
    Optional<Cart> findBySessionIdAndStatus(String sessionId, CartStatus status);
}
