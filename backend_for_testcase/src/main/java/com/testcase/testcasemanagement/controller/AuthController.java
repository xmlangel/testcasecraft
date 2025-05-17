// src/main/java/com/testcase/testcasemanagement/controller/AuthController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenUtil jwtTokenUtil,
                          CustomUserDetailsService userDetailsService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // 입력값 null 체크 (username, password 등 필수값)
        if (user == null || user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username and password are required"
            ));
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
        newUser.setRole(user.getRole() != null ? user.getRole() : "ADMIN");

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

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok().body(Map.of(
                "token", token,
                "expiration", jwtTokenUtil.getExpirationTime() // 초 단위 반환
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyInfo(
            Authentication authentication,
            @RequestBody Map<String, String> updateRequest
    ) {
        // 인증된 사용자의 username 추출
        String username = authentication.getName();

        // DB에서 사용자 조회 (username으로)
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        User user = userOpt.get();

        // 입력값에서 name, email 추출
        String newName = updateRequest.get("name");
        String newEmail = updateRequest.get("email");

        boolean changed = false;
        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName.trim());
            changed = true;
        }
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            user.setEmail(newEmail.trim());
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }
}
