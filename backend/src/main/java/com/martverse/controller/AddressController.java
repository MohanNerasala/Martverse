package com.martverse.controller;

import com.martverse.dto.AddressDto;
import com.martverse.dto.ApiResponse;
import com.martverse.entity.User;
import com.martverse.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Customer Addresses", description = "CRUD and default address management with deduplication")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get saved addresses by authenticated user or phone number")
    public ResponseEntity<ApiResponse<List<AddressDto.AddressResponse>>> getAddresses(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String phone) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(addressService.getAddresses(userId, phone)));
    }

    @PostMapping
    @Operation(summary = "Save address with deduplication and default management")
    public ResponseEntity<ApiResponse<AddressDto.AddressResponse>> saveAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressDto.AddressRequest request) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Address saved successfully",
                addressService.saveAddress(userId, request)));
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "Set address as default")
    public ResponseEntity<ApiResponse<AddressDto.AddressResponse>> setDefaultAddress(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestParam(required = false) String phone) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Address set as default",
                addressService.setDefaultAddress(userId, id, phone)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete saved address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}

