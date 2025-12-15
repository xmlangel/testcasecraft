// src/main/java/com/testcase/testcasemanagement/config/SecurityConfig.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
            JwtTokenUtil jwtTokenUtil,
            CustomAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) {
        this.userDetailsService = userDetailsService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())) // H2 콘솔을 위한 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider()) // AuthenticationProvider 명시적 등록
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // 프론트엔드 정적 리소스는 모두 허용
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/static/**",
                                "/assets/**", // Vite 빌드 결과물 (JS, CSS 등)
                                "/favicon.ico",
                                "/manifest.json",
                                "/asset-manifest.json",
                                "/robots.txt",
                                "/testcasecraft_*.jpg" // 로고 이미지 파일
                        ).permitAll()
                        // ⚠️ API 경로를 SPA 라우팅보다 먼저 매칭 (우선순위 확보)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/me/**").authenticated() // 인증된 사용자 전용 API
                        .requestMatchers("/api/auth/**").permitAll() // 로그인, 회원가입 등
                        .requestMatchers("/api/config/**").permitAll() // 설정 API 허용
                        .requestMatchers("/api/monitoring/**").permitAll() // 모니터링 API 허용
                        .requestMatchers("/api/i18n/**").permitAll() // 다국어 API 허용
                        .requestMatchers("/api/testcase-attachments/public/**").permitAll()
                        .requestMatchers("/api/rag/**").authenticated() // RAG API는 인증 필요
                        .requestMatchers("/api/email-verification/**").permitAll() // 이메일 인증 API 허용
                        .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 허용
                        // 액추에이터 엔드포인트 허용 (루트, 헬스, 스케줄러)
                        .requestMatchers("/actuator", "/actuator/health", "/actuator/health/**",
                                "/actuator/scheduledtasks")
                        .permitAll()
                        // Swagger UI 및 API 문서 허용
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/apiauth/me").authenticated()
                        // 스케줄러 정보 조회는 모두 허용 (admin 역할 체크 전에 먼저 처리)
                        .requestMatchers("/api/admin/scheduler/**").permitAll()
                        // 역할 기반 접근 제어 (더 구체적인 경로가 먼저)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/manager/**").hasRole("MANAGER")
                        .requestMatchers("/api/tester/**").hasRole("TESTER")
                        // 나머지 모든 /api/** 경로는 인증 필요 (SPA 라우팅과 충돌 방지)
                        .requestMatchers("/api/testcases/**").authenticated() // 명시적 선언 (디버깅용)
                        .requestMatchers("/api/**").authenticated()
                        // SPA 클라이언트 라우팅 경로들 허용 (API 경로는 이미 위에서 처리됨)
                        .requestMatchers(
                                "/organizations",
                                "/organizations/**",
                                "/projects",
                                "/projects/**",
                                "/testcases",
                                "/testcases/**",
                                "/executions",
                                "/executions/**",
                                "/dashboard",
                                "/dashboard/**",
                                "/users",
                                "/users/**",
                                "/settings",
                                "/settings/**",
                                "/translation-management",
                                "/translation-management/**",
                                "/mail-settings",
                                "/mail-settings/**",
                                "/llm-config",
                                "/llm-config/**",
                                "/scheduler",
                                "/scheduler/**",
                                "/verify-email",
                                "/verify-email/**")
                        .permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // JWT 인증 필터 생성
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenUtil, userDetailsService);
    }

    // CORS 설정 (기존 코드 유지)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 모든 Origin 허용 (개발/테스트용)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 나머지 기존 빈 설정 유지
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
