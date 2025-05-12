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

//    @PostMapping("/register")
//    public ResponseEntity<?> registerUser(@RequestBody User user) {
//        if (userRepository.existsByUsername(user.getUsername())) {
//            return ResponseEntity.badRequest().body("Username already exists");
//        }
//
//        User newUser = new User();
//        newUser.setUsername(user.getUsername());
//        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
//        newUser.setName(user.getName());
//        newUser.setEmail(user.getEmail());
//        newUser.setRole(user.getRole() != null ? user.getRole() : "TESTER");
//
//        userRepository.save(newUser);
//        return ResponseEntity.ok("User registered successfully");
//    }

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
                "email", user.getEmail()
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
