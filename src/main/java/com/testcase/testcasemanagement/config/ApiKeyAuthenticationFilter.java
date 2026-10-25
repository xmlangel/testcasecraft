package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import com.testcase.testcasemanagement.util.ApiKeyHasher;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

  private final ServiceApiKeyRepository serviceApiKeyRepository;
  private final UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    // X-API-KEY 헤더에서만 API 키를 읽습니다.
    // ⚠️ 보안: 쿼리 파라미터(?apiKey=)는 브라우저 히스토리/로그에 노출되므로 허용하지 않습니다.
    String apiKey = request.getHeader("X-API-KEY");

    if (apiKey != null
        && !apiKey.isEmpty()
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      // DB에는 키 해시만 저장되므로 들어온 키를 같은 방식으로 해시해 비교한다.
      Optional<ServiceApiKey> keyOpt =
          serviceApiKeyRepository.findByApiKeyAndIsActiveTrue(ApiKeyHasher.sha256Hex(apiKey));

      if (keyOpt.isPresent()) {
        ServiceApiKey serviceApiKey = keyOpt.get();

        if (serviceApiKey.getExpiresAt().isAfter(LocalDateTime.now())) {
          // ICT-440: 키를 발급한 사용자로 인증하고 권한도 그 사용자의 역할을 따른다.
          // 발급자가 없거나 비활성이면 키를 쓸 수 없다(예전 가상 계정 service-account 는 쓰지 않는다).
          UserDetails issuer = loadIssuer(serviceApiKey);
          if (issuer == null) {
            logger.debug("API Key issuer is missing or inactive: " + serviceApiKey.getName());
            response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED, "API Key issuer is not an active user");
            return;
          }
          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(issuer, null, issuer.getAuthorities());

          SecurityContextHolder.getContext().setAuthentication(authentication);
          logger.debug(
              "API Key authentication successful for: "
                  + serviceApiKey.getName()
                  + " (issuer "
                  + issuer.getUsername()
                  + ")");
        } else {
          logger.debug("API Key is expired: " + serviceApiKey.getName());
          // We can either return 401 directly or let it fall through and fail later
          response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "API Key is expired");
          return;
        }
      } else {
        logger.debug("Invalid API Key provided");
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid API Key");
        return;
      }
    }

    filterChain.doFilter(request, response);
  }

  /** 키 발급자를 사용자로 불러온다. 발급자가 비었거나, 없거나, 비활성이면 null. */
  private UserDetails loadIssuer(ServiceApiKey serviceApiKey) {
    String issuer = serviceApiKey.getCreatedBy();
    if (issuer == null || issuer.isBlank()) {
      return null;
    }
    try {
      UserDetails user = userDetailsService.loadUserByUsername(issuer);
      return user.isEnabled() ? user : null;
    } catch (AuthenticationException e) {
      return null;
    }
  }
}
