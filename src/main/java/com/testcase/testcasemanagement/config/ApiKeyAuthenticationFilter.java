package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final ServiceApiKeyRepository serviceApiKeyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Check for api key in header or query param
        String apiKey = request.getHeader("X-API-KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = request.getParameter("apiKey");
        }

        if (apiKey != null && !apiKey.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<ServiceApiKey> keyOpt = serviceApiKeyRepository.findByApiKeyAndIsActiveTrue(apiKey);

            if (keyOpt.isPresent()) {
                ServiceApiKey serviceApiKey = keyOpt.get();

                if (serviceApiKey.getExpiresAt().isAfter(LocalDateTime.now())) {
                    // Create an authentication token with a system/service identity
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            "service-account",
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_TESTER")) // Give it tester role
                                                                                                 // to access data
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("API Key authentication successful for: " + serviceApiKey.getName());
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
}
