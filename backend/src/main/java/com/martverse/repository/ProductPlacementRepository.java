package com.martverse.repository;

import com.martverse.entity.ProductPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductPlacementRepository extends JpaRepository<ProductPlacement, UUID> {

    List<ProductPlacement> findByAisleId(UUID aisleId);

    List<ProductPlacement> findByFloorId(UUID floorId);

    @Query("SELECT pp FROM ProductPlacement pp " +
           "JOIN FETCH pp.product p " +
           "JOIN FETCH p.category " +
           "JOIN FETCH pp.aisle a " +
           "JOIN FETCH pp.floor f " +
           "WHERE p.active = true " +
           "ORDER BY f.floorNumber, a.aisleNumber, pp.shelfSide, pp.shelfLevel, pp.positionIndex")
    List<ProductPlacement> findAllWithProductAndLocation();
}
