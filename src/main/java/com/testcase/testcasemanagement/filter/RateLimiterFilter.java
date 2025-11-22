// src/main/java/com/testcase/testcasemanagement/filter/RateLimiterFilter.java

package com.testcase.testcasemanagement.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Rate Limiting 필터 - IP 기반으로 페이지 리프레시 제한
 *
 * 기능:
 * - IP별로 1초당 최대 60회 페이지 요청 허용
 * - 제한 초과 시 429 Too Many Requests 응답
 * - 정적 리소스는 제한에서 제외
 */
@Component
public class RateLimiterFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterFilter.class);

    // IP별 Rate Limiter를 관리하는 맵
    private final ConcurrentMap<String, RateLimiter> rateLimiters = new ConcurrentHashMap<>();

    // Rate Limiter 설정
    private final RateLimiterConfig rateLimiterConfig;
    private final RateLimiterRegistry rateLimiterRegistry;

    // Rate Limiting에서 제외할 경로 패턴
    private static final String[] EXCLUDED_PATHS = {
            "/api/", // API 요청은 별도 제한 정책 적용 가능
            "/static/", // 정적 리소스
            "/assets/", // 프론트엔드 assets
            "/css/",
            "/js/",
            "/images/",
            "/fonts/",
            "/favicon.ico",
            "/actuator/", // Actuator 엔드포인트
            "/swagger-ui/", // Swagger UI
            "/api-docs/" // API 문서
    };

    public RateLimiterFilter() {
        // Rate Limiter 설정: 1초당 60회
        this.rateLimiterConfig = RateLimiterConfig.custom()
                .limitForPeriod(60) // 기간당 최대 60회
                .limitRefreshPeriod(Duration.ofSeconds(1)) // 1초마다 리셋
                .timeoutDuration(Duration.ZERO) // 대기 없이 즉시 거부
                .build();

        this.rateLimiterRegistry = RateLimiterRegistry.of(rateLimiterConfig);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestPath = httpRequest.getRequestURI();

        // 제외 경로 확인
        if (isExcludedPath(requestPath)) {
            chain.doFilter(request, response);
            return;
        }

        // 클라이언트 IP 추출
        String clientIp = extractClientIp(httpRequest);

        // IP별 Rate Limiter 가져오기 또는 생성
        RateLimiter rateLimiter = rateLimiters.computeIfAbsent(
                clientIp,
                ip -> rateLimiterRegistry.rateLimiter(ip, rateLimiterConfig));

        try {
            // Rate Limiter 체크
            RateLimiter.waitForPermission(rateLimiter);

            // 허용된 요청 - 다음 필터로 진행
            chain.doFilter(request, response);

        } catch (RequestNotPermitted e) {
            // Rate Limit 초과 - 429 응답
            handleRateLimitExceeded(httpRequest, httpResponse, clientIp);
        }
    }

    /**
     * Rate Limit 초과 시 처리
     */
    private void handleRateLimitExceeded(HttpServletRequest request, HttpServletResponse response, String clientIp)
            throws IOException {

        log.warn("Rate limit exceeded - IP: {}, Path: {}, Method: {}",
                clientIp, request.getRequestURI(), request.getMethod());

        // 429 Too Many Requests 응답
        response.setStatus(429); // HttpServletResponse.SC_TOO_MANY_REQUESTS (Servlet 5.0+)
        response.setHeader("Retry-After", "1"); // 1초 후 재시도

        // Accept 헤더를 확인하여 HTML/JSON 응답 분기
        String acceptHeader = request.getHeader("Accept");
        boolean wantsHtml = acceptHeader != null && acceptHeader.contains("text/html");

        if (wantsHtml) {
            // HTML 에러 페이지 반환
            response.setContentType("text/html;charset=UTF-8");
            String htmlResponse = generateRateLimitHtmlPage(clientIp, request.getRequestURI());
            response.getWriter().write(htmlResponse);
        } else {
            // JSON 응답 반환 (API 요청)
            response.setContentType("application/json;charset=UTF-8");
            String jsonResponse = String.format(
                    "{\"error\":\"Too Many Requests\",\"message\":\"동일 IP에서 1초에 60번 이상 요청이 발생했습니다. 1초 후 다시 시도해주세요.\",\"retryAfter\":1,\"clientIp\":\"%s\"}",
                    clientIp);
            response.getWriter().write(jsonResponse);
        }

        response.getWriter().flush();
    }

    /**
     * Rate Limit 초과 시 표시할 HTML 페이지 생성
     */
    private String generateRateLimitHtmlPage(String clientIp, String requestPath) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"ko\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>🚨 요청 제한 초과 / Request Limit Exceeded</title>\n" +
                "    <style>\n" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
                "        body {\n" +
                "            font-family: 'Segoe UI', Arial, sans-serif;\n" +
                "            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n" +
                "            display: flex;\n" +
                "            justify-content: center;\n" +
                "            align-items: center;\n" +
                "            min-height: 100vh;\n" +
                "            padding: 20px;\n" +
                "        }\n" +
                "        .container {\n" +
                "            background: white;\n" +
                "            border-radius: 20px;\n" +
                "            box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n" +
                "            max-width: 600px;\n" +
                "            width: 100%;\n" +
                "            overflow: hidden;\n" +
                "            animation: slideIn 0.5s ease-out;\n" +
                "        }\n" +
                "        @keyframes slideIn {\n" +
                "            from { transform: translateY(-50px); opacity: 0; }\n" +
                "            to { transform: translateY(0); opacity: 1; }\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);\n" +
                "            color: white;\n" +
                "            padding: 30px;\n" +
                "            text-align: center;\n" +
                "            border-bottom: 4px solid #b71c1c;\n" +
                "        }\n" +
                "        .icon {\n" +
                "            font-size: 64px;\n" +
                "            margin-bottom: 10px;\n" +
                "            animation: pulse 2s ease-in-out infinite;\n" +
                "        }\n" +
                "        @keyframes pulse {\n" +
                "            0%, 100% { transform: scale(1); }\n" +
                "            50% { transform: scale(1.1); }\n" +
                "        }\n" +
                "        .header h1 {\n" +
                "            font-size: 28px;\n" +
                "            font-weight: bold;\n" +
                "            margin-bottom: 8px;\n" +
                "        }\n" +
                "        .header p {\n" +
                "            font-size: 16px;\n" +
                "            opacity: 0.9;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 40px 30px;\n" +
                "        }\n" +
                "        .message {\n" +
                "            font-size: 18px;\n" +
                "            color: #333;\n" +
                "            margin-bottom: 30px;\n" +
                "            text-align: center;\n" +
                "            line-height: 1.6;\n" +
                "        }\n" +
                "        .countdown-box {\n" +
                "            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);\n" +
                "            border: 3px dashed #ff9800;\n" +
                "            border-radius: 15px;\n" +
                "            padding: 30px;\n" +
                "            text-align: center;\n" +
                "            margin-bottom: 30px;\n" +
                "        }\n" +
                "        .countdown {\n" +
                "            font-size: 72px;\n" +
                "            font-weight: bold;\n" +
                "            color: #ff9800;\n" +
                "            margin-bottom: 10px;\n" +
                "        }\n" +
                "        .countdown-label {\n" +
                "            font-size: 16px;\n" +
                "            color: #666;\n" +
                "        }\n" +
                "        .progress-bar {\n" +
                "            background: #ffecb3;\n" +
                "            height: 12px;\n" +
                "            border-radius: 6px;\n" +
                "            overflow: hidden;\n" +
                "            margin: 20px 0;\n" +
                "        }\n" +
                "        .progress-fill {\n" +
                "            height: 100%;\n" +
                "            background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);\n" +
                "            border-radius: 6px;\n" +
                "            transition: width 1s linear;\n" +
                "        }\n" +
                "        .info-box {\n" +
                "            background: #fff8e1;\n" +
                "            border: 1px solid #ffecb3;\n" +
                "            border-radius: 10px;\n" +
                "            padding: 20px;\n" +
                "            margin-bottom: 20px;\n" +
                "        }\n" +
                "        .info-box h3 {\n" +
                "            font-size: 16px;\n" +
                "            color: #f57c00;\n" +
                "            margin-bottom: 10px;\n" +
                "        }\n" +
                "        .info-box ul {\n" +
                "            list-style: none;\n" +
                "            padding-left: 0;\n" +
                "        }\n" +
                "        .info-box li {\n" +
                "            font-size: 14px;\n" +
                "            color: #666;\n" +
                "            margin-bottom: 8px;\n" +
                "            padding-left: 20px;\n" +
                "            position: relative;\n" +
                "        }\n" +
                "        .info-box li:before {\n" +
                "            content: '•';\n" +
                "            position: absolute;\n" +
                "            left: 0;\n" +
                "            color: #ff9800;\n" +
                "            font-weight: bold;\n" +
                "        }\n" +
                "        .details {\n" +
                "            font-size: 12px;\n" +
                "            color: #999;\n" +
                "            text-align: center;\n" +
                "            padding-top: 20px;\n" +
                "            border-top: 1px solid #eee;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <div class=\"icon\">😤</div>\n" +
                "            <h1>🚨 요청 제한 초과 / Request Limit Exceeded</h1>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <div class=\"message\">\n" +
                "                <strong>너무 많은 요청이 발생했습니다! / Too Many Requests!</strong><br>\n" +
                "                동일 IP에서 1초에 60번 이상 요청 시 차단됩니다.<br>\n" +
                "                More than 60 requests per second from the same IP will be blocked.<br>\n" +
                "                1초 후 다시 시도해주세요. / Please try again in 1 second.\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"countdown-box\">\n" +
                "                <div class=\"countdown\" id=\"countdown\">1</div>\n" +
                "                <div class=\"countdown-label\">초 후 자동으로 재시도됩니다 / Auto-retry after countdown</div>\n" +
                "                <div class=\"progress-bar\">\n" +
                "                    <div class=\"progress-fill\" id=\"progress\"></div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"info-box\">\n" +
                "                <h3>💡 도움말 / Tips</h3>\n" +
                "                <ul>\n" +
                "                    <li>페이지를 너무 자주 새로고침하지 마세요 / Please avoid refreshing too frequently</li>\n" +
                "                    <li>잠시 기다렸다가 다시 시도해주세요 / Wait a moment before trying again</li>\n" +
                "                    <li>문제가 계속되면 관리자에게 문의하세요 / Contact administrator if the issue persists</li>\n" +
                "                </ul>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"details\">\n" +
                "                IP: " + clientIp + " | Path: " + requestPath + "\n" +
                "            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    \n" +
                "    <script>\n" +
                "        let countdown = 1;\n" +
                "        const countdownEl = document.getElementById('countdown');\n" +
                "        const progressEl = document.getElementById('progress');\n" +
                "        \n" +
                "        function updateCountdown() {\n" +
                "            countdown--;\n" +
                "            countdownEl.textContent = countdown;\n" +
                "            \n" +
                "            const progress = ((1 - countdown) / 1) * 100;\n" +
                "            progressEl.style.width = progress + '%';\n" +
                "            \n" +
                "            if (countdown <= 0) {\n" +
                "                window.location.reload();\n" +
                "            }\n" +
                "        }\n" +
                "        \n" +
                "        setInterval(updateCountdown, 1000);\n" +
                "        progressEl.style.width = '0%';\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";
    }

    /**
     * 제외 경로인지 확인
     */
    private boolean isExcludedPath(String path) {
        if (!StringUtils.hasText(path)) {
            return false;
        }

        for (String excludedPath : EXCLUDED_PATHS) {
            if (path.startsWith(excludedPath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 클라이언트 IP 추출 (프록시 고려)
     */
    private String extractClientIp(HttpServletRequest request) {
        // X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있는 경우)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            // 여러 IP가 있을 경우 첫 번째 IP 사용
            int commaIndex = xForwardedFor.indexOf(',');
            return commaIndex > 0
                    ? xForwardedFor.substring(0, commaIndex).trim()
                    : xForwardedFor.trim();
        }

        // X-Real-IP 헤더 확인
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp.trim();
        }

        // 기본 Remote Address 사용
        return request.getRemoteAddr();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("RateLimiterFilter 초기화 완료 - 1초당 최대 60회 요청 허용");
    }

    @Override
    public void destroy() {
        log.info("RateLimiterFilter 종료");
        rateLimiters.clear();
    }
}
