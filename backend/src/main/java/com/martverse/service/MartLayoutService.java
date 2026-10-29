package com.martverse.service;

import com.martverse.dto.MartLayoutDto;
import com.martverse.entity.*;
import com.martverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MartLayoutService {

    private final SupermarketFloorRepository floorRepository;
    private final SupermarketAisleRepository aisleRepository;
    private final ProductPlacementRepository placementRepository;
    private final InventoryRepository inventoryRepository;

    public MartLayoutDto.FullLayoutResponse getFullLayout() {
        List<SupermarketFloor> floors = floorRepository.findByActiveTrueOrderByFloorNumber();
        List<ProductPlacement> allPlacements = placementRepository.findAllWithProductAndLocation();

        // Group placements by aisle
        Map<UUID, List<ProductPlacement>> placementsByAisle = allPlacements.stream()
                .collect(Collectors.groupingBy(pp -> pp.getAisle().getId()));

        List<MartLayoutDto.FloorResponse> floorResponses = floors.stream()
                .map(floor -> mapFloor(floor, placementsByAisle))
                .collect(Collectors.toList());

        return MartLayoutDto.FullLayoutResponse.builder()
                .floors(floorResponses)
                .totalProducts(allPlacements.size())
                .totalAisles(floors.stream()
                        .mapToInt(f -> f.getAisles().size())
                        .sum())
                .build();
    }

    public List<MartLayoutDto.FloorResponse> getFloors() {
        return getFullLayout().getFloors();
    }

    public List<MartLayoutDto.AisleResponse> getAislesForFloor(String floorId) {
        List<SupermarketAisle> aisles = aisleRepository.findByFloorIdAndActiveTrue(UUID.fromString(floorId));
        List<ProductPlacement> placements = placementRepository.findByFloorId(UUID.fromString(floorId));

        Map<UUID, List<ProductPlacement>> placementsByAisle = placements.stream()
                .collect(Collectors.groupingBy(pp -> pp.getAisle().getId()));

        return aisles.stream()
                .map(aisle -> mapAisle(aisle, placementsByAisle.getOrDefault(aisle.getId(), List.of())))
                .collect(Collectors.toList());
    }

    // ── Mapping helpers ──────────────────────────────────────────────

    private MartLayoutDto.FloorResponse mapFloor(SupermarketFloor floor,
                                                  Map<UUID, List<ProductPlacement>> placementsByAisle) {
        List<MartLayoutDto.AisleResponse> aisleResponses = floor.getAisles().stream()
                .filter(SupermarketAisle::getActive)
                .sorted(Comparator.comparing(SupermarketAisle::getAisleNumber))
                .map(aisle -> mapAisle(aisle, placementsByAisle.getOrDefault(aisle.getId(), List.of())))
                .collect(Collectors.toList());

        return MartLayoutDto.FloorResponse.builder()
                .id(floor.getId().toString())
                .floorNumber(floor.getFloorNumber())
                .name(floor.getName())
                .description(floor.getDescription())
                .heightOffset(floor.getHeightOffset())
                .length(floor.getLength() != null ? floor.getLength().doubleValue() : 50.0)
                .width(floor.getWidth() != null ? floor.getWidth().doubleValue() : 36.0)
                .height(floor.getHeight() != null ? floor.getHeight().doubleValue() : 4.5)
                .aisles(aisleResponses)
                .build();
    }

    private MartLayoutDto.AisleResponse mapAisle(SupermarketAisle aisle,
                                                  List<ProductPlacement> placements) {
        List<MartLayoutDto.PlacementResponse> placementResponses = placements.stream()
                .map(this::mapPlacement)
                .collect(Collectors.toList());

        double sX = aisle.getStartX() != null ? aisle.getStartX().doubleValue() : aisle.getPositionX().doubleValue();
        double sZ = aisle.getStartZ() != null ? aisle.getStartZ().doubleValue() : -12.0;
        double eX = aisle.getEndX() != null ? aisle.getEndX().doubleValue() : aisle.getPositionX().doubleValue();
        double eZ = aisle.getEndZ() != null ? aisle.getEndZ().doubleValue() : 12.0;
        double sH = aisle.getShelfHeight() != null ? aisle.getShelfHeight().doubleValue() : 2.8;
        int tiers = aisle.getShelfTiers() != null ? aisle.getShelfTiers() : 3;
        String color = aisle.getColorCode() != null ? aisle.getColorCode() : "#10b981";
        String banner = aisle.getBannerText() != null ? aisle.getBannerText() :
                ("AISLE " + aisle.getAisleNumber() + " • " + aisle.getName().toUpperCase());

        return MartLayoutDto.AisleResponse.builder()
                .id(aisle.getId().toString())
                .floorId(aisle.getFloor() != null ? aisle.getFloor().getId().toString() : "")
                .floorNumber(aisle.getFloor() != null ? aisle.getFloor().getFloorNumber() : 1)
                .aisleNumber(aisle.getAisleNumber())
                .name(aisle.getName())
                .categoryId(aisle.getCategory() != null ? aisle.getCategory().getId().toString() : null)
                .categoryName(aisle.getCategory() != null ? aisle.getCategory().getName() : null)
                .startX(sX)
                .startZ(sZ)
                .endX(eX)
                .endZ(eZ)
                .shelfHeight(sH)
                .shelfTiers(tiers)
                .colorCode(color)
                .bannerText(banner)
                .positionX(aisle.getPositionX())
                .positionZ(aisle.getPositionZ())
                .length(aisle.getLength())
                .placements(placementResponses)
                .build();
    }

    private MartLayoutDto.PlacementResponse mapPlacement(ProductPlacement pp) {
        Product product = pp.getProduct();
        Inventory inv = inventoryRepository.findByProductIdAndVariantIsNull(product.getId()).orElse(null);
        int stock = inv != null ? inv.getAvailableQuantity() : 0;

        double wx = pp.getWorldX() != null ? pp.getWorldX().doubleValue() : 0.0;
        double wy = pp.getWorldY() != null ? pp.getWorldY().doubleValue() : 1.5;
        double wz = pp.getWorldZ() != null ? pp.getWorldZ().doubleValue() : 0.0;
        double ry = pp.getRotationY() != null ? pp.getRotationY().doubleValue() : 0.0;
        String modType = pp.getModelType() != null ? pp.getModelType() : pp.getDisplayType().name().toLowerCase();

        return MartLayoutDto.PlacementResponse.builder()
                .id(pp.getId().toString())
                .productId(product.getId().toString())
                .productName(product.getName())
                .productSku(product.getSku())
                .brand(product.getBrand())
                .price(product.getPrice())
                .mrp(product.getPrice())
                .effectivePrice(product.getEffectivePrice())
                .imageUrl(product.getImageUrl())
                .shelfSide(pp.getShelfSide().name())
                .shelfTier(pp.getShelfLevel() != null ? pp.getShelfLevel() : 2)
                .shelfLevel(pp.getShelfLevel() != null ? pp.getShelfLevel() : 2)
                .positionIndex(pp.getPositionIndex())
                .worldX(wx)
                .worldY(wy)
                .worldZ(wz)
                .rotationY(ry)
                .displayType(pp.getDisplayType().name())
                .modelType(modType)
                .color(pp.getColor() != null ? pp.getColor() : "#10b981")
                .inStock(stock > 0)
                .stockQuantity(stock)
                .hasVariants(Boolean.TRUE.equals(product.getHasVariants()))
                .build();
    }
}
