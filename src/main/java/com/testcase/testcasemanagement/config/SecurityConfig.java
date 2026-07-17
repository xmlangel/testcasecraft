// src/main/java/com/testcase/testcasemanagement/config/SecurityConfig.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.List;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

  private final CustomUserDetailsService userDetailsService;
  private final JwtTokenUtil jwtTokenUtil;
  private final CustomAuthenticationEntryPoint authenticationEntryPoint;
  private final CustomAccessDeniedHandler accessDeniedHandler;
  private final com.testcase.testcasemanagement.repository.ServiceApiKeyRepository
      serviceApiKeyRepository;

  /**
   * CORS 허용 Origin 목록(쉼표 구분). 와일드카드 '*'를 쓰지 않는다 — allowCredentials(true)와 '*' 조합은 요청 Origin을 그대로
   * 반사해 임의 사이트의 자격증명 실은 요청을 허용하는 취약점이다. 운영에서는 APP_CORS_ALLOWED_ORIGINS 환경변수로 실제 도메인을 지정한다.
   */
  @org.springframework.beans.factory.annotation.Value(
      "${APP_CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173,http://localhost:8080}")
  private String allowedOrigins;

  public SecurityConfig(
      CustomUserDetailsService userDetailsService,
      JwtTokenUtil jwtTokenUtil,
      CustomAuthenticationEntryPoint authenticationEntryPoint,
      CustomAccessDeniedHandler accessDeniedHandler,
      com.testcase.testcasemanagement.repository.ServiceApiKeyRepository serviceApiKeyRepository) {
    this.userDetailsService = userDetailsService;
    this.jwtTokenUtil = jwtTokenUtil;
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
    this.serviceApiKeyRepository = serviceApiKeyRepository;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authenticationProvider(authenticationProvider()) // AuthenticationProvider 명시적 등록
        .exceptionHandling(
            exceptions ->
                exceptions
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
        .authorizeHttpRequests(
            auth ->
                auth
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
                        "/logo*.png", // PWA 아이콘 (manifest.json·apple-touch-icon 참조)
                        "/testcasecraft_*.jpg", // 로고 이미지 파일
                        "/testcasecraft_*.png" // 투명 로고 이미지 파일
                        )
                    .permitAll()
                    // ⚠️ API 경로를 SPA 라우팅보다 먼저 매칭 (우선순위 확보)
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers("/api/auth/me/**")
                    .authenticated() // 인증된 사용자 전용 API
                    .requestMatchers("/api/auth/**")
                    .permitAll() // 로그인, 회원가입 등
                    .requestMatchers("/api/config/**")
                    .permitAll() // 설정 API 허용
                    .requestMatchers("/api/system-settings/rag/status")
                    .permitAll() // RAG 서비스 상태 확인 허용
                    .requestMatchers("/api/monitoring/**")
                    .permitAll() // 모니터링 API 허용
                    .requestMatchers("/api/i18n/**")
                    .permitAll() // 다국어 API 허용
                    .requestMatchers("/api/testcase-attachments/public/**")
                    .permitAll()
                    .requestMatchers("/api/rag/**")
                    .authenticated() // RAG API는 인증 필요
                    .requestMatchers("/api/service-api-keys/redirect-token")
                    .permitAll() // Forge 앱 임시 토큰 발급 (자체 API
                    // 키 검증)
                    .requestMatchers("/api/service-api-keys/exchange-token")
                    .permitAll() // 임시 토큰 → JWT 교환 (1회성)
                    .requestMatchers("/api/email-verification/**")
                    .permitAll() // 이메일 인증 API 허용
                    .requestMatchers("/api/guides/**")
                    .permitAll() // 가이드 API 허용
                    .requestMatchers("/api/manual/**")
                    .permitAll() // 사용자 매뉴얼 API 허용 (로그인 화면 링크 지원)
                    // 액추에이터: 헬스체크(프로브)만 공개, 나머지(scheduledtasks·metrics 등)는 ADMIN 전용.
                    // (이전: /actuator·/actuator/scheduledtasks 까지 permitAll → 내부 스케줄·정보 비인증 노출)
                    .requestMatchers("/actuator/health", "/actuator/health/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .hasRole("ADMIN")
                    // Swagger UI 및 API 문서 허용
                    .requestMatchers(
                        "/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/apiauth/me")
                    .authenticated()
                    // 스케줄러 정보 "조회(GET)"만 허용 — 변경(PUT/POST)은 아래 /api/admin/** 규칙으로
                    // ADMIN 권한이 강제된다. (이전: 전체 permitAll → 비인증 변경/실행 가능 취약점)
                    .requestMatchers(HttpMethod.GET, "/api/admin/scheduler/**")
                    .permitAll()
                    // 역할 기반 접근 제어 (더 구체적인 경로가 먼저)
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    // 나머지 모든 /api/** 경로는 인증 필요 (SPA 라우팅과 충돌 방지)
                    .requestMatchers("/api/testcases/**")
                    .authenticated() // 명시적 선언 (디버깅용)
                    .requestMatchers("/api/**")
                    .authenticated()
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
                        "/jira-redirect",
                        "/jira-redirect/**",
                        "/verify-email",
                        "/verify-email/**",
                        "/guides",
                        "/guides/**",
                        "/manual",
                        "/manual/**",
                        "/login",
                        "/login/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(apiKeyAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // API Key 인증 필터 생성
  @Bean
  public ApiKeyAuthenticationFilter apiKeyAuthenticationFilter() {
    return new ApiKeyAuthenticationFilter(serviceApiKeyRepository);
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
    // 명시적으로 설정된 Origin만 허용 (와일드카드 '*' 금지 — allowCredentials와 결합 시 Origin 반사 취약점).
    List<String> origins =
        java.util.Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    configuration.setAllowedOriginPatterns(origins);
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
    // Spring Security 6.4+: UserDetailsService 는 생성자로 주입(무인자 생성자·setUserDetailsService 는
    // deprecated)
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(
      AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }
}
