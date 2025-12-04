package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.service.CustomUserDetailsService;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil,
            CustomUserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        logger.debug("Processing request to: " + request.getRequestURI());
        logger.debug("Authorization header: " + (authorizationHeader != null ? "Bearer [PRESENT]" : "NULL"));

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String jwt = authorizationHeader.substring(7);

            try {
                // 1. 토큰 서명 검증
                if (!jwtTokenUtil.isSignatureValid(jwt)) {
                    throw new JwtException("Invalid JWT signature");
                }

                // 2. username 추출
                String username = jwtTokenUtil.extractUsername(jwt);
                logger.debug("Extracted username from token: " + username);

                // 3. UserDetails 조회
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("UserDetails loaded successfully for: " + username);

                // 4. Access Token 검증 (토큰 타입 포함)
                if (jwtTokenUtil.validateAccessToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("JWT authentication successful for user: " + username);
                } else {
                    logger.debug("JWT token validation failed for user: " + username);
                    // 상세한 검증 실패 이유 로깅
                    logger.debug("Token expired: " + jwtTokenUtil.isTokenExpired(jwt));
                    logger.debug("Token type: " + jwtTokenUtil.extractTokenType(jwt));
                }

            } catch (JwtException | UsernameNotFoundException e) {
                // 5. 오류 처리 - 로그만 남기고 401 응답 반환 (필터 체인 중단)
                logger.debug("JWT validation failed: " + e.getMessage() + " for token: "
                        + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
                logger.debug("Request from: " + request.getRemoteAddr() + ", User-Agent: "
                        + request.getHeader("User-Agent"));
                SecurityContextHolder.clearContext();

                // 명시적으로 401 에러 반환하여 프론트엔드가 재로그인/갱신을 시도하도록 함
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage());
                return; // 필터 체인 중단
            }
        }
        filterChain.doFilter(request, response);
    }
}
