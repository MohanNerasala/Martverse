package com.martverse.repository;

import com.martverse.entity.SupermarketAisle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupermarketAisleRepository extends JpaRepository<SupermarketAisle, UUID> {
    List<SupermarketAisle> findByFloorIdAndActiveTrue(UUID floorId);
    List<SupermarketAisle> findByActiveTrueOrderByFloor_FloorNumberAscAisleNumberAsc();
}
