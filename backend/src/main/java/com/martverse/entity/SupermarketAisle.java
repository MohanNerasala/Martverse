package com.martverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "supermarket_aisles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SupermarketAisle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private SupermarketFloor floor;

    @Column(name = "aisle_number", nullable = false)
    private Integer aisleNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Builder.Default
    @Column(name = "position_x", nullable = false, precision = 8, scale = 2)
    private BigDecimal positionX = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "position_z", nullable = false, precision = 8, scale = 2)
    private BigDecimal positionZ = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "start_x", precision = 8, scale = 2)
    private BigDecimal startX = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "start_z", precision = 8, scale = 2)
    private BigDecimal startZ = new BigDecimal("-12");

    @Builder.Default
    @Column(name = "end_x", precision = 8, scale = 2)
    private BigDecimal endX = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "end_z", precision = 8, scale = 2)
    private BigDecimal endZ = new BigDecimal("12");

    @Builder.Default
    @Column(name = "shelf_height", precision = 4, scale = 2)
    private BigDecimal shelfHeight = new BigDecimal("2.8");

    @Builder.Default
    @Column(name = "shelf_tiers")
    private Integer shelfTiers = 3;

    @Builder.Default
    @Column(name = "color_code", length = 20)
    private String colorCode = "#10b981";

    @Column(name = "banner_text", length = 255)
    private String bannerText;

    @Builder.Default
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal length = new BigDecimal("24");

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "aisle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductPlacement> placements = new ArrayList<>();
}
