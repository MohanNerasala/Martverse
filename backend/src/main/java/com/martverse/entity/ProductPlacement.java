package com.martverse.entity;

import com.martverse.enums.DisplayType;
import com.martverse.enums.ShelfSide;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_placements")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductPlacement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private SupermarketFloor floor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aisle_id", nullable = false)
    private SupermarketAisle aisle;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "shelf_side", nullable = false, length = 10)
    private ShelfSide shelfSide = ShelfSide.LEFT;

    @Builder.Default
    @Column(name = "shelf_level", nullable = false)
    private Integer shelfLevel = 1;

    @Builder.Default
    @Column(name = "position_index", nullable = false)
    private Integer positionIndex = 1;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "display_type", nullable = false, length = 20)
    private DisplayType displayType = DisplayType.BOX;

    @Column(name = "world_x", precision = 8, scale = 2)
    private BigDecimal worldX;

    @Column(name = "world_y", precision = 8, scale = 2)
    private BigDecimal worldY;

    @Column(name = "world_z", precision = 8, scale = 2)
    private BigDecimal worldZ;

    @Column(name = "rotation_y", precision = 8, scale = 4)
    private BigDecimal rotationY;

    @Column(name = "color", length = 30)
    private String color;

    @Column(name = "model_type", length = 30)
    private String modelType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
