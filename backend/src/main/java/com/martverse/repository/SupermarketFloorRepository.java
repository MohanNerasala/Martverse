package com.martverse.repository;

import com.martverse.entity.SupermarketFloor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupermarketFloorRepository extends JpaRepository<SupermarketFloor, UUID> {
    Optional<SupermarketFloor> findByFloorNumber(Integer floorNumber);
    List<SupermarketFloor> findByActiveTrueOrderByFloorNumber();
}
