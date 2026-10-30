package com.martverse.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class AddressDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressRequest {
        private String id;
        private String fullName;
        @NotBlank(message = "Phone number is required")
        private String phone;
        private String email;
        private String addressType; // HOME, WORK, OTHER
        private String houseNo;
        private String area;
        private String landmark;
        private String addressLine1;
        private String addressLine2;
        @NotBlank(message = "City is required")
        private String city;
        private String state;
        @NotBlank(message = "PIN code is required")
        private String pinCode;
        private String deliveryInstructions;
        private Boolean isDefault;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddressResponse {
        private UUID id;
        private String fullName;
        private String phone;
        private String email;
        private String addressType;
        private String houseNo;
        private String area;
        private String landmark;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pinCode;
        private String deliveryInstructions;
        private Boolean isDefault;
        private LocalDateTime createdAt;
    }
}

