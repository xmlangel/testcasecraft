package com.testcase.testcasemanagement.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException)
            throws IOException, ServletException {

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // 401 Unauthorized - 인증되지 않음 (토큰 없음, 만료 등)
        response.getWriter().write(String.format(
                "{\"error\": \"Unauthorized\", \"message\": \"%s\", \"path\": \"%s\"}",
                authException.getMessage().replace("\"", "'"),
                request.getRequestURI()));
    }
}
