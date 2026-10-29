package com.martverse.repository;

import com.martverse.entity.BillingSession;
import com.martverse.enums.BillingSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillingSessionRepository extends JpaRepository<BillingSession, UUID> {
    Optional<BillingSession> findByCartIdAndStatusNot(UUID cartId, BillingSessionStatus status);
    Optional<BillingSession> findByUserIdAndStatusIn(UUID userId, java.util.List<BillingSessionStatus> statuses);
}
