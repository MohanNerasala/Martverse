package com.martverse.service;

import com.martverse.dto.AuthDto;
import com.martverse.entity.CustomerProfile;
import com.martverse.entity.User;
import com.martverse.enums.UserRole;
import com.martverse.exception.BadRequestException;
import com.martverse.exception.ConflictException;
import com.martverse.exception.ResourceNotFoundException;
import com.martverse.repository.CustomerProfileRepository;
import com.martverse.repository.UserRepository;
import com.martverse.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)
                .active(true)
                .build();
        user = userRepository.save(user);

        CustomerProfile profile = CustomerProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .build();
        profileRepository.save(profile);

        return generateAuthResponse(user, profile);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.getActive()) {
            throw new BadRequestException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        CustomerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return generateAuthResponse(user, profile);
    }

    public AuthDto.AuthResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        var userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        CustomerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return generateAuthResponse(user, profile);
    }

    public AuthDto.UserInfo getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        CustomerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return AuthDto.UserInfo.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .phone(profile != null ? profile.getPhone() : null)
                .role(user.getRole().name())
                .build();
    }

    private AuthDto.AuthResponse generateAuthResponse(User user, CustomerProfile profile) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .user(AuthDto.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(profile != null ? profile.getFullName() : null)
                        .phone(profile != null ? profile.getPhone() : null)
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
