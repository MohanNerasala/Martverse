package com.martverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_variants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "sku_suffix"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 20)
    private String size;

    @Column(length = 50)
    private String color;

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(name = "sku_suffix", nullable = false, length = 20)
    private String skuSuffix;

    @Column(name = "price_override", precision = 10, scale = 2)
    private BigDecimal priceOverride;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Returns this variant's effective price — either its override or the parent product's price.
     */
    @Transient
    public BigDecimal getEffectivePrice() {
        if (priceOverride != null && priceOverride.compareTo(BigDecimal.ZERO) > 0) {
            return priceOverride;
        }
        return product != null ? product.getEffectivePrice() : BigDecimal.ZERO;
    }

    @Transient
    public String getFullSku() {
        return product != null ? product.getSku() + "-" + skuSuffix : skuSuffix;
    }
}
