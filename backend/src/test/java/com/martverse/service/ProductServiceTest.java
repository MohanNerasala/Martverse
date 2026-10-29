package com.martverse.service;

import com.martverse.dto.ProductDto;
import com.martverse.entity.*;
import com.martverse.enums.ShelfSide;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.CategoryRepository;
import com.martverse.repository.InventoryRepository;
import com.martverse.repository.ProductRepository;
import com.martverse.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private ProductService productService;

    private Category testCategory;
    private Product testProduct;
    private ProductPlacement testPlacement;
    private SupermarketFloor testFloor;
    private SupermarketAisle testAisle;
    private Inventory testInventory;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(UUID.randomUUID())
                .name("Snacks & Munchies")
                .active(true)
                .build();

        testFloor = SupermarketFloor.builder()
                .id(UUID.randomUUID())
                .floorNumber(1)
                .name("Ground Floor - Daily Supermarket")
                .build();

        testAisle = SupermarketAisle.builder()
                .id(UUID.randomUUID())
                .floor(testFloor)
                .aisleNumber(1)
                .name("Snacks & Munchies")
                .category(testCategory)
                .build();

        UUID productId = UUID.randomUUID();
        testProduct = Product.builder()
                .id(productId)
                .name("Lay's Classic Salted Potato Chips")
                .slug("lays-classic-salted-potato-chips-50g")
                .sku("SNK-LAY-001")
                .brand("Lay's")
                .category(testCategory)
                .price(new BigDecimal("20.00"))
                .discountPrice(new BigDecimal("18.00"))
                .unit("pack")
                .active(true)
                .hasVariants(false)
                .variants(new ArrayList<>())
                .placements(new ArrayList<>())
                .build();

        testPlacement = ProductPlacement.builder()
                .id(UUID.randomUUID())
                .product(testProduct)
                .floor(testFloor)
                .aisle(testAisle)
                .shelfSide(ShelfSide.LEFT)
                .shelfLevel(2)
                .positionIndex(1)
                .worldX(new BigDecimal("-10.5"))
                .worldY(new BigDecimal("1.3"))
                .worldZ(new BigDecimal("-8.0"))
                .rotationY(BigDecimal.ZERO)
                .modelType("bag")
                .color("#f59e0b")
                .build();

        testProduct.getPlacements().add(testPlacement);

        testInventory = Inventory.builder()
                .id(UUID.randomUUID())
                .product(testProduct)
                .stockQuantity(100)
                .reservedQuantity(5)
                .build();
    }

    @Test
    @DisplayName("Find product by slug returns mapped response with 3D placement and stock")
    void testGetProductBySlug_Success() {
        when(productRepository.findBySlugAndActiveTrue(testProduct.getSlug()))
                .thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProductIdAndVariantIsNull(testProduct.getId()))
                .thenReturn(Optional.of(testInventory));

        ProductDto.ProductResponse response = productService.getProductBySlug(testProduct.getSlug());

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Lay's Classic Salted Potato Chips");
        assertThat(response.getSlug()).isEqualTo("lays-classic-salted-potato-chips-50g");
        assertThat(response.getPrice()).isEqualByComparingTo(new BigDecimal("18.00"));
        assertThat(response.getMrp()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(response.getStockQuantity()).isEqualTo(95);
        assertThat(response.isInStock()).isTrue();

        // 3D placement check
        assertThat(response.getPlacement()).isNotNull();
        assertThat(response.getPlacement().getWorldX()).isEqualTo(-10.5);
        assertThat(response.getPlacement().getWorldY()).isEqualTo(1.3);
        assertThat(response.getPlacement().getWorldZ()).isEqualTo(-8.0);
        assertThat(response.getPlacement().getModelType()).isEqualTo("bag");
    }

    @Test
    @DisplayName("Product lookup with nonexistent slug throws ResourceNotFoundException")
    void testGetProductBySlug_NotFound() {
        when(productRepository.findBySlugAndActiveTrue("nonexistent-slug"))
                .thenReturn(Optional.empty());
        when(productRepository.findBySku("nonexistent-slug"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductBySlug("nonexistent-slug"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product with slug");
    }

    @Test
    @DisplayName("getAllActiveProductsList returns all products with 3D shelf placement details")
    void testGetAllActiveProductsList() {
        when(productRepository.findAllActiveWithCategory()).thenReturn(List.of(testProduct));
        when(inventoryRepository.findByProductIdAndVariantIsNull(testProduct.getId()))
                .thenReturn(Optional.of(testInventory));

        List<ProductDto.ProductResponse> list = productService.getAllActiveProductsList();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getName()).isEqualTo("Lay's Classic Salted Potato Chips");
        assertThat(list.get(0).getPlacement().getAisleNumber()).isEqualTo(1);
    }

    @Test
    @DisplayName("Paged product search returns paginated products")
    void testSearchProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(testProduct), pageable, 1);
        when(productRepository.searchProducts("Lay", pageable)).thenReturn(page);
        when(inventoryRepository.findByProductIdAndVariantIsNull(testProduct.getId()))
                .thenReturn(Optional.of(testInventory));

        ProductDto.PagedResponse<ProductDto.ProductResponse> pagedResponse =
                productService.searchProducts("Lay", pageable);

        assertThat(pagedResponse.getContent()).hasSize(1);
        assertThat(pagedResponse.getTotalElements()).isEqualTo(1);
    }
}
