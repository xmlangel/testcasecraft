// src/main/java/com/testcase/testcasemanagement/controller/AuthController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UserDto;
import com.testcase.testcasemanagement.model.RefreshToken;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.service.RefreshTokenService;
import com.testcase.testcasemanagement.service.UserManagementService;
import com.testcase.testcasemanagement.service.EmailVerificationService;
import com.testcase.testcasemanagement.dto.EmailVerificationDto;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Tag(name = "System - Authentication", description = "사용자 인증 및 토큰 관리 API")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final UserManagementService userManagementService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthenticationManager authenticationManager,
            JwtTokenUtil jwtTokenUtil,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            UserManagementService userManagementService,
            EmailVerificationService emailVerificationService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.userManagementService = userManagementService;
        this.emailVerificationService = emailVerificationService;
    }

    @Operation(summary = "사용자 등록", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // 입력값 null 체크 (username, password 등 필수값)
        if (user == null || user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username and password are required"));
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("username", user.getUsername());
            errorResponse.put("name", user.getName());
            errorResponse.put("email", user.getEmail());
            errorResponse.put("role", user.getRole());
            if (user.getRole() != null) {
                errorResponse.put("role", user.getRole());
            }
            errorResponse.put("message", "Username already exists");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        User newUser = new User();
        newUser.setUsername(user.getUsername());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setName(user.getName());
        newUser.setEmail(user.getEmail());
        newUser.setRole(user.getRole() != null ? user.getRole() : "TESTER");

        userRepository.save(newUser);

        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("username", newUser.getUsername());
        successResponse.put("name", newUser.getName());
        successResponse.put("email", newUser.getEmail());
        if (newUser.getRole() != null) {
            successResponse.put("role", newUser.getRole());
        }
        successResponse.put("message", "User registered successfully");

        return ResponseEntity.ok(successResponse);
    }

    @Operation(summary = "로그인", description = "사용자 인증 후 액세스 토큰과 리프레시 토큰을 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) {
        try {
            System.out.println("DEBUG - AuthController.createAuthenticationToken:");
            System.out.println("  - Received user: " + (user != null ? "NOT NULL" : "NULL"));
            System.out.println("  - Username: " + (user != null ? user.getUsername() : "NULL"));
            System.out.println("  - Password: "
                    + (user != null && user.getPassword() != null ? "***" + user.getPassword().length() + " chars***"
                            : "NULL"));

            // 사용자 인증
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            // 사용자 정보 조회
            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            Optional<User> userEntityOpt = userRepository.findByUsername(user.getUsername());

            if (userEntityOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다"));
            }

            User userEntity = userEntityOpt.get();

            // ICT-169: 비활성화된 사용자 추가 검증 (보안 강화)
            if (!userEntity.getIsActive()) {
                System.out.println("SECURITY - Login blocked for inactive user: " + userEntity.getUsername());
                return ResponseEntity.status(403).body(Map.of(
                        "errorCode", "ACCOUNT_DISABLED",
                        "message", "계정이 비활성화되었습니다. 관리자에게 문의하세요."));
            }

            // Access Token 생성
            final String accessToken = jwtTokenUtil.generateAccessToken(userDetails);

            // 기존 Refresh Token들 무효화 (선택사항: 보안을 높이려면 활성화)
            // refreshTokenService.revokeAllUserTokens(userEntity.getId());

            // Refresh Token 생성
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userEntity.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken.getToken());
            response.put("tokenType", "Bearer");
            response.put("accessTokenExpiration", jwtTokenUtil.getAccessTokenExpirationTime()); // 밀리초
            response.put("refreshTokenExpiration", jwtTokenUtil.getRefreshTokenExpirationTime()); // 밀리초
            response.put("user", Map.of(
                    "id", userEntity.getId(),
                    "username", userEntity.getUsername(),
                    "name", userEntity.getName(),
                    "email", userEntity.getEmail(),
                    "role", userEntity.getRole(),
                    "emailVerified", userEntity.getEmailVerified(),
                    "preferredLanguage",
                    userEntity.getPreferredLanguage() != null ? userEntity.getPreferredLanguage() : "ko",
                    "timezone", userEntity.getTimezone() != null ? userEntity.getTimezone() : "UTC"));

            return ResponseEntity.ok(response);

        } catch (org.springframework.security.authentication.DisabledException e) {
            // ICT-169: 비활성화된 계정 로그인 시도 처리
            System.out.println("SECURITY - Disabled account login attempt: " + e.getMessage());
            return ResponseEntity.status(403).body(Map.of(
                    "errorCode", "ACCOUNT_DISABLED",
                    "message", "계정이 비활성화되었습니다. 관리자에게 문의하세요."));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // 잘못된 자격 증명 처리
            return ResponseEntity.status(401).body(Map.of(
                    "errorCode", "INVALID_CREDENTIALS",
                    "message", "사용자명 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            System.out.println("ERROR - Authentication failure: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of(
                    "errorCode", "AUTHENTICATION_FAILED",
                    "message", "인증에 실패했습니다. 다시 시도해주세요."));
        }
    }

    @Operation(summary = "내 정보 수정", description = "현재 사용자의 정보를 수정합니다.")
    @PutMapping("/me")
    public ResponseEntity<?> updateMyInfo(
            Authentication authentication,
            @RequestBody Map<String, String> updateRequest) {
        // 인증 정보가 없는 경우
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "errorCode", "AUTHENTICATION_REQUIRED",
                    "message", "인증이 필요합니다. 로그인 후 다시 시도해주세요."));
        }

        // 인증된 사용자의 username 추출
        String username = authentication.getName();

        // DB에서 사용자 조회 (username으로)
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = userOpt.get();

        // 입력값에서 name, email, timezone 추출
        String newName = updateRequest.get("name");
        String newEmail = updateRequest.get("email");
        String newTimezone = updateRequest.get("timezone");

        boolean changed = false;
        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName.trim());
            changed = true;
        }
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            user.setEmail(newEmail.trim());
            changed = true;
        }
        if (newTimezone != null && !newTimezone.trim().isEmpty()) {
            user.setTimezone(newTimezone.trim());
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "timezone", user.getTimezone()));
    }

    @Operation(summary = "내 정보 조회", description = "현재 인증된 사용자의 상세 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Authentication authentication) {
        // 인증 정보가 없는 경우 - JWT 토큰이 유효하지 않거나 없음
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "errorCode", "AUTHENTICATION_REQUIRED",
                    "message", "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
                    "details", "JWT 토큰이 유효하지 않거나 만료되었습니다. localStorage를 확인하고 다시 로그인해주세요."));
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "errorCode", "USER_NOT_FOUND",
                    "message", "사용자를 찾을 수 없습니다.",
                    "details", "인증된 사용자명: " + username));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "emailVerified", user.getEmailVerified(),
                "preferredLanguage", user.getPreferredLanguage(),
                "timezone", user.getTimezone()));
    }

    /**
     * Refresh Token을 사용하여 새로운 Access Token 발급
     */
    @Operation(summary = "토큰 갱신", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.")
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshTokenValue = request.get("refreshToken");

            if (refreshTokenValue == null || refreshTokenValue.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Refresh Token이 필요합니다"));
            }

            // Refresh Token으로 새로운 Access Token 생성
            Optional<String> newAccessTokenOpt = refreshTokenService.refreshAccessToken(refreshTokenValue);

            if (newAccessTokenOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of(
                        "message", "유효하지 않은 Refresh Token입니다"));
            }

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessTokenOpt.get());
            response.put("tokenType", "Bearer");
            response.put("accessTokenExpiration", jwtTokenUtil.getAccessTokenExpirationTime());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "토큰 갱신 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 로그아웃 - Refresh Token 무효화
     */
    @Operation(summary = "로그아웃", description = "현재 세션의 리프레시 토큰을 무효화합니다.")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        try {
            String refreshTokenValue = request.get("refreshToken");

            // Refresh Token이 제공된 경우 무효화
            if (refreshTokenValue != null && !refreshTokenValue.trim().isEmpty()) {
                refreshTokenService.revokeToken(refreshTokenValue);
            }

            // 현재 사용자의 모든 토큰 무효화 (선택사항)
            if (authentication != null) {
                String username = authentication.getName();
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    // refreshTokenService.revokeAllUserTokens(userOpt.get().getId());
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "로그아웃이 완료되었습니다"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "로그아웃 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 모든 디바이스에서 로그아웃 - 사용자의 모든 Refresh Token 무효화
     */
    @Operation(summary = "전체 기기 로그아웃", description = "사용자의 모든 리프레시 토큰을 무효화하여 모든 기기에서 로그아웃 처리합니다.")
    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "message", "인증이 필요합니다"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "message", "사용자를 찾을 수 없습니다"));
            }

            // 사용자의 모든 Refresh Token 무효화
            refreshTokenService.revokeAllUserTokens(userOpt.get().getId());

            return ResponseEntity.ok(Map.of(
                    "message", "모든 디바이스에서 로그아웃이 완료되었습니다"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "로그아웃 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 본인 비밀번호 변경
     */
    @Operation(summary = "비밀번호 변경", description = "현재 사용자의 비밀번호를 변경합니다.")
    @PutMapping("/change-password")
    public ResponseEntity<?> changeMyPassword(
            Authentication authentication,
            @RequestBody UserDto.ChangePasswordRequest passwordRequest) {
        try {
            // 인증 확인
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "errorCode", "AUTHENTICATION_REQUIRED",
                        "message", "인증이 필요합니다. 로그인 후 다시 시도해주세요."));
            }

            // 입력값 검증
            if (passwordRequest.getCurrentPassword() == null || passwordRequest.getCurrentPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "errorCode", "CURRENT_PASSWORD_REQUIRED",
                        "message", "현재 비밀번호를 입력해주세요."));
            }

            if (passwordRequest.getNewPassword() == null || passwordRequest.getNewPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "errorCode", "NEW_PASSWORD_REQUIRED",
                        "message", "새 비밀번호를 입력해주세요."));
            }

            // 비밀번호 변경 처리
            UserDto.Response updatedUser = userManagementService.changeMyPassword(passwordRequest);

            return ResponseEntity.ok(Map.of(
                    "message", "비밀번호가 성공적으로 변경되었습니다.",
                    "user", Map.of(
                            "id", updatedUser.getId(),
                            "username", updatedUser.getUsername(),
                            "name", updatedUser.getName(),
                            "email", updatedUser.getEmail())));

        } catch (com.testcase.testcasemanagement.exception.ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "errorCode", "VALIDATION_ERROR",
                    "message", e.getMessage()));
        } catch (com.testcase.testcasemanagement.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "errorCode", "USER_NOT_FOUND",
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "errorCode", "INTERNAL_SERVER_ERROR",
                    "message", "비밀번호 변경 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 토큰 검증 API (개발/디버깅 용도)
     */
    @Operation(summary = "토큰 검증", description = "입력된 액세스 토큰 또는 리프레시 토큰의 유효성을 검증합니다.")
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            String refreshToken = request.get("refreshToken");

            Map<String, Object> result = new HashMap<>();

            if (accessToken != null) {
                try {
                    String username = jwtTokenUtil.extractUsername(accessToken);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    boolean isValid = jwtTokenUtil.validateAccessToken(accessToken, userDetails);

                    result.put("accessToken", Map.of(
                            "valid", isValid,
                            "username", username,
                            "expired", jwtTokenUtil.isTokenExpired(accessToken)));
                } catch (Exception e) {
                    result.put("accessToken", Map.of(
                            "valid", false,
                            "error", e.getMessage()));
                }
            }

            if (refreshToken != null) {
                boolean isValid = refreshTokenService.validateRefreshToken(refreshToken);
                result.put("refreshToken", Map.of("valid", isValid));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "토큰 검증 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자 선호 언어 업데이트
     */
    @Operation(summary = "선호 언어 설정", description = "사용자의 선호 언어를 업데이트합니다.")
    @PutMapping("/preferred-language")
    public ResponseEntity<?> updatePreferredLanguage(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "message", "인증이 필요합니다"));
            }

            String languageCode = request.get("languageCode");
            if (languageCode == null || languageCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "언어 코드가 필요합니다"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "message", "사용자를 찾을 수 없습니다"));
            }

            User user = userOpt.get();
            user.setPreferredLanguage(languageCode);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "선호 언어가 성공적으로 업데이트되었습니다",
                    "preferredLanguage", languageCode,
                    "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "preferredLanguage", user.getPreferredLanguage())));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "언어 설정 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 본인 이메일 인증 발송
     */
    @Operation(summary = "이메일 인증 발송", description = "현재 사용자에게 이메일 인증 링크를 발송합니다.")
    @PostMapping("/me/send-verification-email")
    public ResponseEntity<?> sendMyVerificationEmail(Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "인증이 필요합니다"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "사용자를 찾을 수 없습니다"));
            }

            User user = userOpt.get();

            // Extract base URL from request
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

            // EmailVerificationService 호출
            EmailVerificationDto.CommonResponse result = emailVerificationService.createVerificationToken(
                    user.getId(),
                    user.getEmail(),
                    baseUrl);
            if (result.isSuccess()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", result.getMessage()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", result.getMessage()));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "이메일 발송 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
