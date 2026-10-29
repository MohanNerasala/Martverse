package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.ProductDto;
import com.martverse.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog, categories and placements")
public class ProductController {

    private final ProductService productService;

    private static final Pattern UUID_REGEX =
            Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    @GetMapping("/products")
    @Operation(summary = "Get all products with pagination")
    public ResponseEntity<ApiResponse<ProductDto.PagedResponse<ProductDto.ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200), Sort.by(sortBy));
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(pageable)));
    }

    @GetMapping("/products/all")
    @Operation(summary = "Get all active products as a flat list")
    public ResponseEntity<ApiResponse<List<ProductDto.ProductResponse>>> getAllActiveProductsList() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllActiveProductsList()));
    }

    @GetMapping("/products/{idOrSlug}")
    @Operation(summary = "Get product by ID or Slug")
    public ResponseEntity<ApiResponse<ProductDto.ProductResponse>> getProductByIdOrSlug(
            @PathVariable String idOrSlug) {
        if (UUID_REGEX.matcher(idOrSlug).matches()) {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductById(idOrSlug)));
        } else {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(idOrSlug)));
        }
    }

    @GetMapping("/products/slug/{slug}")
    @Operation(summary = "Get product specifically by slug")
    public ResponseEntity<ApiResponse<ProductDto.ProductResponse>> getProductBySlug(
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }

    @GetMapping("/products/search")
    @Operation(summary = "Search products by name, brand, or description")
    public ResponseEntity<ApiResponse<ProductDto.PagedResponse<ProductDto.ProductResponse>>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(q, pageable)));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all product categories")
    public ResponseEntity<ApiResponse<List<ProductDto.CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllCategories()));
    }

    @GetMapping("/categories/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<ProductDto.CategoryResponse>> getCategoryById(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getCategoryById(id)));
    }

    @GetMapping("/categories/{id}/products")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<ProductDto.PagedResponse<ProductDto.ProductResponse>>> getProductsByCategory(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategory(id, pageable)));
    }
}
