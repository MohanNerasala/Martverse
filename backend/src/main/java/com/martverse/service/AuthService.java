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

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final Map<String, String> otpCache = new ConcurrentHashMap<>();

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

    public AuthDto.SendOtpResponse sendOtp(AuthDto.SendOtpRequest request) {
        String rawPhone = request.getPhone() != null ? request.getPhone().replaceAll("[^0-9]", "") : "";
        if (rawPhone.startsWith("91") && rawPhone.length() == 12) {
            rawPhone = rawPhone.substring(2);
        }
        if (rawPhone.length() != 10) {
            throw new BadRequestException("Please enter a valid 10-digit mobile number");
        }

        // Generate 6-digit test OTP
        String otp = String.valueOf(100000 + (int)(Math.random() * 900000));
        otpCache.put(rawPhone, otp);

        // Prominently print in backend terminal for testing as requested by user
        System.out.flush();
        System.err.flush();
        String banner = "\n" +
            "==================================================================\n" +
            "  >>> [MARTVERSE AUTH OTP TEST] <<<\n" +
            "  Mobile Number : +91 " + rawPhone + "\n" +
            "  RANDOM OTP    : >>> " + otp + " <<<\n" +
            "==================================================================\n";
        System.out.println(banner);
        System.err.println(banner);
        System.out.flush();
        System.err.flush();
        log.info(">>> [MARTVERSE AUTH OTP TEST] Mobile: +91 {} | RANDOM OTP: {} <<<", rawPhone, otp);

        return AuthDto.SendOtpResponse.builder()
                .phone(rawPhone)
                .message("OTP sent successfully to +91 " + rawPhone)
                .testOtp(otp)
                .build();
    }

    @Transactional
    public AuthDto.AuthResponse verifyOtp(AuthDto.VerifyOtpRequest request) {
        String rawPhone = request.getPhone() != null ? request.getPhone().replaceAll("[^0-9]", "") : "";
        if (rawPhone.startsWith("91") && rawPhone.length() == 12) {
            rawPhone = rawPhone.substring(2);
        }
        if (rawPhone.length() != 10) {
            throw new BadRequestException("Please enter a valid 10-digit mobile number");
        }

        String inputOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        String validOtp = otpCache.get(rawPhone);

        // Accept generated OTP or universal test fallback "123456" for convenience
        if (!"123456".equals(inputOtp) && (validOtp == null || !validOtp.equals(inputOtp))) {
            throw new BadRequestException("Invalid or expired OTP. Please try again.");
        }

        otpCache.remove(rawPhone);

        // Find or create customer account
        CustomerProfile profile = profileRepository.findByPhone(rawPhone).orElse(null);
        User user;
        if (profile != null && profile.getUser() != null) {
            user = profile.getUser();
        } else {
            String generatedEmail = "phone" + rawPhone + "@martverse.com";
            user = userRepository.findByEmail(generatedEmail).orElse(null);
            if (user == null) {
                user = User.builder()
                        .email(generatedEmail)
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(UserRole.CUSTOMER)
                        .active(true)
                        .build();
                user = userRepository.save(user);

                profile = CustomerProfile.builder()
                        .user(user)
                        .fullName("Mart Customer (" + rawPhone.substring(6) + ")")
                        .phone(rawPhone)
                        .build();
                profileRepository.save(profile);
            } else {
                profile = profileRepository.findByUserId(user.getId()).orElse(null);
            }
        }

        log.info("Customer authenticated via OTP: +91 {}", rawPhone);
        return generateAuthResponse(user, profile);
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
