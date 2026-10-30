package com.martverse.service;

import com.martverse.dto.AddressDto;
import com.martverse.entity.Address;
import com.martverse.entity.CustomerProfile;
import com.martverse.entity.User;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.AddressRepository;
import com.martverse.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<AddressDto.AddressResponse> getAddresses(UUID userId, String phone) {
        List<Address> list;
        if (userId != null) {
            list = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        } else if (phone != null && !phone.isBlank()) {
            String cleanPhone = phone.replaceAll("[^0-9]", "");
            if (cleanPhone.length() >= 10) cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
            list = addressRepository.findByPhoneOrderByIsDefaultDescCreatedAtDesc(cleanPhone);
        } else {
            list = List.of();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressDto.AddressResponse saveAddress(UUID userId, AddressDto.AddressRequest request) {
        String cleanPhone = request.getPhone() != null ? request.getPhone().replaceAll("[^0-9]", "") : "";
        if (cleanPhone.length() >= 10) cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);

        // Resolve userId from profile if not authenticated
        if (userId == null && !cleanPhone.isEmpty()) {
            Optional<CustomerProfile> profileOpt = profileRepository.findByPhone(cleanPhone);
            if (profileOpt.isPresent() && profileOpt.get().getUser() != null) {
                userId = profileOpt.get().getUser().getId();
            }
        }

        String line1 = request.getAddressLine1();
        if (line1 == null || line1.isBlank()) {
            line1 = (request.getHouseNo() != null ? request.getHouseNo() : "") +
                    (request.getArea() != null ? ", " + request.getArea() : "");
            line1 = line1.trim().replaceAll("^,\\s*", "");
        }

        // DUPLICATE PREVENTION:
        // Check if an existing address has the same user/phone and addressLine1 and pinCode
        Optional<Address> existingOpt;
        if (request.getId() != null && !request.getId().isBlank() && !request.getId().startsWith("addr-")) {
            try {
                existingOpt = addressRepository.findById(UUID.fromString(request.getId()));
            } catch (Exception e) {
                existingOpt = Optional.empty();
            }
        } else if (userId != null) {
            existingOpt = addressRepository.findFirstByUserIdAndAddressLine1AndPinCode(userId, line1, request.getPinCode());
        } else {
            existingOpt = addressRepository.findFirstByPhoneAndAddressLine1AndPinCode(cleanPhone, line1, request.getPinCode());
        }

        Address address;
        if (existingOpt.isPresent()) {
            // Update existing without creating duplicate
            address = existingOpt.get();
        } else {
            address = new Address();
            if (userId != null) {
                User u = new User();
                u.setId(userId);
                address.setUser(u);
            }
        }

        // Handle Default Address flag: If set as default, reset previous defaults
        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (isDefault) {
            if (userId != null) {
                addressRepository.resetDefaultByUserId(userId);
            } else if (!cleanPhone.isEmpty()) {
                addressRepository.resetDefaultByPhone(cleanPhone);
            }
        } else if (existingOpt.isEmpty()) {
            // If user has no existing addresses, make the first one default
            List<Address> existingList = userId != null
                    ? addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                    : addressRepository.findByPhoneOrderByIsDefaultDescCreatedAtDesc(cleanPhone);
            if (existingList.isEmpty()) {
                isDefault = true;
            }
        }

        address.setFullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : "Customer");
        address.setPhone(cleanPhone);
        address.setEmail(request.getEmail());
        address.setAddressType(request.getAddressType() != null ? request.getAddressType().toUpperCase() : "HOME");
        address.setHouseNo(request.getHouseNo());
        address.setArea(request.getArea());
        address.setLandmark(request.getLandmark());
        address.setAddressLine1(line1);
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState() != null ? request.getState() : "Karnataka");
        address.setPinCode(request.getPinCode());
        address.setDeliveryInstructions(request.getDeliveryInstructions());
        address.setIsDefault(isDefault);

        address = addressRepository.save(address);
        log.info("Saved address successfully: ID={}, Phone={}, Type={}, Default={}",
                address.getId(), cleanPhone, address.getAddressType(), isDefault);
        return mapToResponse(address);
    }

    @Transactional
    public AddressDto.AddressResponse setDefaultAddress(UUID userId, UUID addressId, String phone) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (userId != null) {
            addressRepository.resetDefaultByUserId(userId);
        } else if (phone != null && !phone.isBlank()) {
            String cleanPhone = phone.replaceAll("[^0-9]", "");
            if (cleanPhone.length() >= 10) cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
            addressRepository.resetDefaultByPhone(cleanPhone);
        }

        address.setIsDefault(true);
        address = addressRepository.save(address);
        return mapToResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID addressId) {
        if (addressRepository.existsById(addressId)) {
            addressRepository.deleteById(addressId);
        }
    }

    private AddressDto.AddressResponse mapToResponse(Address a) {
        return AddressDto.AddressResponse.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .email(a.getEmail())
                .addressType(a.getAddressType() != null ? a.getAddressType() : "HOME")
                .houseNo(a.getHouseNo() != null ? a.getHouseNo() : a.getAddressLine1())
                .area(a.getArea() != null ? a.getArea() : a.getAddressLine2())
                .landmark(a.getLandmark())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .pinCode(a.getPinCode())
                .deliveryInstructions(a.getDeliveryInstructions())
                .isDefault(Boolean.TRUE.equals(a.getIsDefault()))
                .createdAt(a.getCreatedAt())
                .build();
    }
}
