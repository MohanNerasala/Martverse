package com.martverse.repository;

import com.martverse.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    List<Address> findByPhoneOrderByIsDefaultDescCreatedAtDesc(String phone);

    Optional<Address> findFirstByUserIdAndAddressLine1AndPinCode(UUID userId, String addressLine1, String pinCode);
    Optional<Address> findFirstByPhoneAndAddressLine1AndPinCode(String phone, String addressLine1, String pinCode);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.phone = :phone")
    void resetDefaultByPhone(@Param("phone") String phone);
}
