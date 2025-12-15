package com.testcase.testcasemanagement.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        // 403 Forbidden - 권한 없음 (인증은 되었으나 해당 리소스 접근 불가)
        response.getWriter().write(String.format(
                "{\"error\": \"Forbidden\", \"message\": \"Access Denied: %s\", \"path\": \"%s\"}",
                accessDeniedException.getMessage().replace("\"", "'"),
                request.getRequestURI()));
    }
}
