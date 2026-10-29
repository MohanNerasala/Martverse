package com.martverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "supermarket_floors")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SupermarketFloor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "floor_number", nullable = false, unique = true)
    private Integer floorNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "height_offset", nullable = false, precision = 6, scale = 2)
    private BigDecimal heightOffset = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 6, scale = 2)
    private BigDecimal length = new BigDecimal("50.0");

    @Builder.Default
    @Column(precision = 6, scale = 2)
    private BigDecimal width = new BigDecimal("36.0");

    @Builder.Default
    @Column(precision = 6, scale = 2)
    private BigDecimal height = new BigDecimal("4.5");

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SupermarketAisle> aisles = new ArrayList<>();
}
