// src/main/java/com/testcase/testcasemanagement/config/SecurityConfig.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

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

  /** 파일 이름에 내용 해시가 붙어 내용이 바뀌면 이름도 바뀌는 정적 자산 경로. */
  private static final String[] IMMUTABLE_ASSET_PATHS = {"/assets/**", "/static/**"};

  /** 이름이 고정된 정적 파일. 오래 캐시하면 교체가 반영되지 않으므로 짧게 잡는다. */
  private static final String[] NAMED_STATIC_PATHS = {
    "/favicon.ico",
    "/manifest.json",
    "/asset-manifest.json",
    "/robots.txt",
    "/logo*.png",
    "/testcasecraft_*.jpg",
    "/testcasecraft_*.png"
  };

  /**
   * 정적 자산 전용 체인. 캐시 금지 헤더를 붙이지 않는다.
   *
   * <p>기본 체인은 모든 응답에 {@code Cache-Control: no-cache, no-store, max-age=0, must-revalidate} 를 붙인다.
   * API 응답에는 맞는 값이지만 정적 자산에는 값이 비싸다. CDN 이 앞에 있으면 {@code no-store} 때문에 캐시를 통째로 건너뛰고(Cloudflare 는
   * BYPASS 로 표시한다) 매 요청이 오리진까지 간다. 실측에서 0.8 kB 짜리 청크 하나가 4초를 썼다(2026-08-21 확인).
   *
   * <p>{@code index.html} 과 SPA 라우팅 경로는 여기에 넣지 않는다. 그 문서가 캐시되면 배포한 새 자산 이름을 가리키는 문서가 갱신되지 않아 옛 화면이
   * 계속 뜬다.
   */
  @Bean
  @Order(1)
  public SecurityFilterChain staticAssetFilterChain(HttpSecurity http) throws Exception {
    String[] paths = new String[IMMUTABLE_ASSET_PATHS.length + NAMED_STATIC_PATHS.length];
    System.arraycopy(IMMUTABLE_ASSET_PATHS, 0, paths, 0, IMMUTABLE_ASSET_PATHS.length);
    System.arraycopy(
        NAMED_STATIC_PATHS, 0, paths, IMMUTABLE_ASSET_PATHS.length, NAMED_STATIC_PATHS.length);

    http.securityMatcher(paths)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        // 캐시 헤더는 WebConfig 의 자원 핸들러가 경로별로 정한다.
        .headers(headers -> headers.cacheControl(HeadersConfigurer.CacheControlConfig::disable));
    return http.build();
  }

  @Bean
  @Order(2)
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
                    // ICT-445: 로그인 전 화면이 쓰는 조회만 공개한다. 나머지는 아래 규칙으로 인증·관리자를 요구한다.
                    // 설정: 앱 기동 시 API 주소·시간대를 읽는 조회만 공개. 실행 profile 을 돌려주는 /environment 는 관리자.
                    .requestMatchers(HttpMethod.GET, "/api/config", "/api/config/api-url")
                    .permitAll()
                    .requestMatchers("/api/config/environment")
                    .hasRole("ADMIN")
                    .requestMatchers("/api/system-settings/rag/status")
                    .permitAll() // RAG 서비스 상태 확인 허용
                    // 모니터링: 방문 기록은 로그인 사용자, 서버 정보·메트릭 조회는 관리자 (ICT-445)
                    .requestMatchers(HttpMethod.POST, "/api/monitoring/usage/page-visits")
                    .authenticated()
                    .requestMatchers("/api/monitoring/**")
                    .hasRole("ADMIN")
                    // 다국어: 캐시 비우기는 관리자, 로그인 화면이 쓰는 언어 목록·번역 조회만 공개 (ICT-445)
                    .requestMatchers(HttpMethod.POST, "/api/i18n/cache/clear")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/i18n/languages",
                        "/api/i18n/languages/default",
                        "/api/i18n/translations/**",
                        "/api/i18n/translation/**")
                    .permitAll()
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
                    // 매뉴얼·가이드 조회: 로그인 화면의 매뉴얼 링크와 매뉴얼 안의 가이드 링크가 로그인 전에 연다 (GET 만)
                    .requestMatchers(HttpMethod.GET, "/api/guides/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/manual/**")
                    .permitAll()
                    // 액추에이터: 헬스체크(프로브)만 공개, 나머지(scheduledtasks·metrics 등)는 ADMIN 전용.
                    // (이전: /actuator·/actuator/scheduledtasks 까지 permitAll → 내부 스케줄·정보 비인증 노출)
                    .requestMatchers("/actuator/health", "/actuator/health/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .hasRole("ADMIN")
                    // Swagger UI 화면과 UI 설정(swagger-config)은 공개한다. 둘 다 API 구조를 담지 않는다.
                    // API 명세(/api-docs)는 시스템 관리자(ADMIN)만 본다. 화면이 앱의 accessToken 을
                    // 실어 보낸다 (OpenApiConfig.swaggerIndexTransformer).
                    .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/api-docs/swagger-config",
                        "/v3/api-docs/swagger-config")
                    .permitAll()
                    .requestMatchers("/api-docs", "/api-docs/**", "/v3/api-docs", "/v3/api-docs/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/apiauth/me")
                    .authenticated()
                    // 스케줄러 조회·변경 모두 아래 /api/admin/** 규칙으로 ADMIN 을 요구한다.
                    // (이전: GET 은 permitAll → 비인증 사용자에게 스케줄 설정 노출, ICT-445)
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
    return new ApiKeyAuthenticationFilter(serviceApiKeyRepository, userDetailsService);
  }

  // JWT 인증 필터 생성
  @Bean
  public JwtAuthenticationFilter jwtAuthenticationFilter() {
    return new JwtAuthenticationFilter(jwtTokenUtil, userDetailsService);
  }

  // CORS 설정
  // 보안: 와일드카드 '*' 금지 — allowCredentials(true)와 '*' 조합은 임의 Origin 을 반사해 취약하다.
  // 다만 '동일 출처(same-origin)' 요청은 교차 사이트 공격 벡터가 아니므로 설정과 무관하게 항상 허용한다.
  // (Vite 가 정적 자산을 <script type="module" crossorigin> 으로 로드하므로 브라우저가 자기 자신 Origin 을
  //  실어 CORS 요청을 보낸다 — 이를 막으면 APP_CORS_ALLOWED_ORIGINS 를 설정하지 않은 배포에서 앱 자체가
  //  뜨지 않는다. 요청 Host 와 Origin host 가 같으면 same-origin 으로 판정해 반사한다.)
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    List<String> configuredOrigins =
        java.util.Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();

    return (jakarta.servlet.http.HttpServletRequest request) -> {
      java.util.List<String> patterns = new java.util.ArrayList<>(configuredOrigins);

      // 동일 출처 반사: Origin 의 host 가 요청 Host 헤더와 일치하면 허용 목록에 추가(안전 — 교차 사이트 아님).
      String origin = request.getHeader("Origin");
      String hostHeader = request.getHeader("Host");
      if (origin != null && hostHeader != null) {
        try {
          String originHost = java.net.URI.create(origin).getHost();
          String requestHost = hostHeader.split(":", 2)[0];
          if (originHost != null
              && originHost.equalsIgnoreCase(requestHost)
              && !patterns.contains(origin)) {
            patterns.add(origin);
          }
        } catch (RuntimeException ignored) {
          // 파싱 불가한 Origin 은 무시(설정된 목록만 적용)
        }
      }

      CorsConfiguration configuration = new CorsConfiguration();
      configuration.setAllowedOriginPatterns(patterns);
      configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(List.of("*"));
      configuration.setAllowCredentials(true);
      return configuration;
    };
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
