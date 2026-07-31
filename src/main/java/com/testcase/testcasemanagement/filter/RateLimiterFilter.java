// src/main/java/com/testcase/testcasemanagement/filter/RateLimiterFilter.java

package com.testcase.testcasemanagement.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

/**
 * Rate Limiting 필터 - IP 기반으로 페이지 리프레시 제한
 *
 * <p>기능: - IP별로 1초당 최대 60회 페이지 요청 허용 - 제한 초과 시 429 Too Many Requests 응답 - 정적 리소스는 제한에서 제외
 */
@Component
public class RateLimiterFilter implements Filter {

  private static final Logger log = LoggerFactory.getLogger(RateLimiterFilter.class);

  // 추적 IP 상한 — 무한 증식(스푸핑된 IP 회전에 의한 메모리 고갈 DoS) 방지용 LRU 캡
  private static final int MAX_TRACKED_IPS = 100_000;

  // IP별 Rate Limiter를 관리하는 크기 제한 LRU 맵 (접근 순서, 상한 초과 시 오래된 항목 제거).
  // (이전: 무한 ConcurrentHashMap + resilience4j Registry 이중 저장 → evict 없이 무한 증식)
  private final Map<String, RateLimiter> rateLimiters =
      Collections.synchronizedMap(
          new LinkedHashMap<>(1024, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, RateLimiter> eldest) {
              return size() > MAX_TRACKED_IPS;
            }
          });

  // Rate Limiter 설정
  private final RateLimiterConfig rateLimiterConfig;

  /**
   * X-Forwarded-For / X-Real-IP 신뢰 여부. 기본 false — 헤더는 클라이언트가 임의로 설정할 수 있어, 신뢰하면 IP를 회전시켜 rate
   * limit을 우회하고 추적 맵을 무한 증식시킬 수 있다. 신뢰할 수 있는 리버스 프록시 뒤에 배포된 경우에만 true로 설정한다.
   */
  @Value("${app.ratelimit.trust-forwarded-headers:false}")
  private boolean trustForwardedHeaders;

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
    this.rateLimiterConfig =
        RateLimiterConfig.custom()
            .limitForPeriod(60) // 기간당 최대 60회
            .limitRefreshPeriod(Duration.ofSeconds(1)) // 1초마다 리셋
            .timeoutDuration(Duration.ZERO) // 대기 없이 즉시 거부
            .build();
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

    // IP별 Rate Limiter 가져오기 또는 생성 (Registry 미사용 — LRU 맵이 수명 관리)
    RateLimiter rateLimiter =
        rateLimiters.computeIfAbsent(clientIp, ip -> RateLimiter.of(ip, rateLimiterConfig));

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

  /** Rate Limit 초과 시 처리 */
  private void handleRateLimitExceeded(
      HttpServletRequest request, HttpServletResponse response, String clientIp)
      throws IOException {

    log.warn(
        "Rate limit exceeded - IP: {}, Path: {}, Method: {}",
        clientIp,
        request.getRequestURI(),
        request.getMethod());

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
      // JSON 응답 반환 (API 요청) — clientIp 를 JSON 이스케이프해 구조 주입 방지
      response.setContentType("application/json;charset=UTF-8");
      String jsonResponse =
          String.format(
              "{\"error\":\"Too Many Requests\",\"message\":\"동일 IP에서 1초에 60번 이상 요청이 발생했습니다. 1초 후"
                  + " 다시 시도해주세요.\",\"retryAfter\":1,\"clientIp\":\"%s\"}",
              jsonEscape(clientIp));
      response.getWriter().write(jsonResponse);
    }

    response.getWriter().flush();
  }

  /**
   * JSON 문자열 이스케이프 — 백슬래시·큰따옴표뿐 아니라 모든 제어문자(U+0000~U+001F)를 처리한다. 이전 구현은 \n\r\t 만 다뤄, \b·\f 나
   * U+0000 같은 제어문자가 clientIp/헤더 경유로 섞이면 깨진 JSON(파서 실패·구조 오염)을 만들 수 있었다.
   */
  private String jsonEscape(String value) {
    if (value == null) {
      return "";
    }
    StringBuilder sb = new StringBuilder(value.length() + 8);
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      switch (c) {
        case '\\':
          sb.append("\\\\");
          break;
        case '"':
          sb.append("\\\"");
          break;
        case '\n':
          sb.append("\\n");
          break;
        case '\r':
          sb.append("\\r");
          break;
        case '\t':
          sb.append("\\t");
          break;
        case '\b':
          sb.append("\\b");
          break;
        case '\f':
          sb.append("\\f");
          break;
        default:
          if (c < 0x20) {
            sb.append(String.format("\\u%04x", (int) c));
          } else {
            sb.append(c);
          }
      }
    }
    return sb.toString();
  }

  /** Rate Limit 초과 시 표시할 HTML 페이지 생성 */
  private String generateRateLimitHtmlPage(String clientIpRaw, String requestPathRaw) {
    // 반영 XSS 방지 — 헤더/URI 유래 값을 HTML 이스케이프
    String clientIp = HtmlUtils.htmlEscape(clientIpRaw == null ? "" : clientIpRaw);
    String requestPath = HtmlUtils.htmlEscape(requestPathRaw == null ? "" : requestPathRaw);
    return "<!DOCTYPE html>\n"
        + "<html lang=\"ko\">\n"
        + "<head>\n"
        + "    <meta charset=\"UTF-8\">\n"
        + "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
        + "    <title>🚨 요청 제한 초과 / Request Limit Exceeded</title>\n"
        + "    <style>\n"
        + "        * { margin: 0; padding: 0; box-sizing: border-box; }\n"
        + "        body {\n"
        + "            font-family: 'Segoe UI', Arial, sans-serif;\n"
        + "            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n"
        + "            display: flex;\n"
        + "            justify-content: center;\n"
        + "            align-items: center;\n"
        + "            min-height: 100vh;\n"
        + "            padding: 20px;\n"
        + "        }\n"
        + "        .container {\n"
        + "            background: white;\n"
        + "            border-radius: 20px;\n"
        + "            box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n"
        + "            max-width: 600px;\n"
        + "            width: 100%;\n"
        + "            overflow: hidden;\n"
        + "            animation: slideIn 0.5s ease-out;\n"
        + "        }\n"
        + "        @keyframes slideIn {\n"
        + "            from { transform: translateY(-50px); opacity: 0; }\n"
        + "            to { transform: translateY(0); opacity: 1; }\n"
        + "        }\n"
        + "        .header {\n"
        + "            background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);\n"
        + "            color: white;\n"
        + "            padding: 30px;\n"
        + "            text-align: center;\n"
        + "            border-bottom: 4px solid #b71c1c;\n"
        + "        }\n"
        + "        .icon {\n"
        + "            font-size: 64px;\n"
        + "            margin-bottom: 10px;\n"
        + "            animation: pulse 2s ease-in-out infinite;\n"
        + "        }\n"
        + "        @keyframes pulse {\n"
        + "            0%, 100% { transform: scale(1); }\n"
        + "            50% { transform: scale(1.1); }\n"
        + "        }\n"
        + "        .header h1 {\n"
        + "            font-size: 28px;\n"
        + "            font-weight: bold;\n"
        + "            margin-bottom: 8px;\n"
        + "        }\n"
        + "        .header p {\n"
        + "            font-size: 16px;\n"
        + "            opacity: 0.9;\n"
        + "        }\n"
        + "        .content {\n"
        + "            padding: 40px 30px;\n"
        + "        }\n"
        + "        .message {\n"
        + "            font-size: 18px;\n"
        + "            color: #333;\n"
        + "            margin-bottom: 30px;\n"
        + "            text-align: center;\n"
        + "            line-height: 1.6;\n"
        + "        }\n"
        + "        .countdown-box {\n"
        + "            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);\n"
        + "            border: 3px dashed #ff9800;\n"
        + "            border-radius: 15px;\n"
        + "            padding: 30px;\n"
        + "            text-align: center;\n"
        + "            margin-bottom: 30px;\n"
        + "        }\n"
        + "        .countdown {\n"
        + "            font-size: 72px;\n"
        + "            font-weight: bold;\n"
        + "            color: #ff9800;\n"
        + "            margin-bottom: 10px;\n"
        + "        }\n"
        + "        .countdown-label {\n"
        + "            font-size: 16px;\n"
        + "            color: #666;\n"
        + "        }\n"
        + "        .progress-bar {\n"
        + "            background: #ffecb3;\n"
        + "            height: 12px;\n"
        + "            border-radius: 6px;\n"
        + "            overflow: hidden;\n"
        + "            margin: 20px 0;\n"
        + "        }\n"
        + "        .progress-fill {\n"
        + "            height: 100%;\n"
        + "            background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);\n"
        + "            border-radius: 6px;\n"
        + "            transition: width 1s linear;\n"
        + "        }\n"
        + "        .info-box {\n"
        + "            background: #fff8e1;\n"
        + "            border: 1px solid #ffecb3;\n"
        + "            border-radius: 10px;\n"
        + "            padding: 20px;\n"
        + "            margin-bottom: 20px;\n"
        + "        }\n"
        + "        .info-box h3 {\n"
        + "            font-size: 16px;\n"
        + "            color: #f57c00;\n"
        + "            margin-bottom: 10px;\n"
        + "        }\n"
        + "        .info-box ul {\n"
        + "            list-style: none;\n"
        + "            padding-left: 0;\n"
        + "        }\n"
        + "        .info-box li {\n"
        + "            font-size: 14px;\n"
        + "            color: #666;\n"
        + "            margin-bottom: 8px;\n"
        + "            padding-left: 20px;\n"
        + "            position: relative;\n"
        + "        }\n"
        + "        .info-box li:before {\n"
        + "            content: '•';\n"
        + "            position: absolute;\n"
        + "            left: 0;\n"
        + "            color: #ff9800;\n"
        + "            font-weight: bold;\n"
        + "        }\n"
        + "        .details {\n"
        + "            font-size: 12px;\n"
        + "            color: #999;\n"
        + "            text-align: center;\n"
        + "            padding-top: 20px;\n"
        + "            border-top: 1px solid #eee;\n"
        + "        }\n"
        + "    </style>\n"
        + "</head>\n"
        + "<body>\n"
        + "    <div class=\"container\">\n"
        + "        <div class=\"header\">\n"
        + "            <div class=\"icon\">😤</div>\n"
        + "            <h1>🚨 요청 제한 초과 / Request Limit Exceeded</h1>\n"
        + "        </div>\n"
        + "        <div class=\"content\">\n"
        + "            <div class=\"message\">\n"
        + "                <strong>너무 많은 요청이 발생했습니다! / Too Many Requests!</strong><br>\n"
        + "                동일 IP에서 1초에 60번 이상 요청 시 차단됩니다.<br>\n"
        + "                More than 60 requests per second from the same IP will be"
        + " blocked.<br>\n"
        + "                1초 후 다시 시도해주세요. / Please try again in 1 second.\n"
        + "            </div>\n"
        + "            \n"
        + "            <div class=\"countdown-box\">\n"
        + "                <div class=\"countdown\" id=\"countdown\">1</div>\n"
        + "                <div class=\"countdown-label\">초 후 자동으로 재시도됩니다 / Auto-retry after"
        + " countdown</div>\n"
        + "                <div class=\"progress-bar\">\n"
        + "                    <div class=\"progress-fill\" id=\"progress\"></div>\n"
        + "                </div>\n"
        + "            </div>\n"
        + "            \n"
        + "            <div class=\"info-box\">\n"
        + "                <h3>💡 도움말 / Tips</h3>\n"
        + "                <ul>\n"
        + "                    <li>페이지를 너무 자주 새로고침하지 마세요 / Please avoid refreshing too"
        + " frequently</li>\n"
        + "                    <li>잠시 기다렸다가 다시 시도해주세요 / Wait a moment before trying"
        + " again</li>\n"
        + "                    <li>문제가 계속되면 관리자에게 문의하세요 / Contact administrator if the issue"
        + " persists</li>\n"
        + "                </ul>\n"
        + "            </div>\n"
        + "            \n"
        + "            <div class=\"details\">\n"
        + "                IP: "
        + clientIp
        + " | Path: "
        + requestPath
        + "\n"
        + "            </div>\n"
        + "        </div>\n"
        + "    </div>\n"
        + "    \n"
        + "    <script>\n"
        + "        let countdown = 1;\n"
        + "        const countdownEl = document.getElementById('countdown');\n"
        + "        const progressEl = document.getElementById('progress');\n"
        + "        \n"
        + "        function updateCountdown() {\n"
        + "            countdown--;\n"
        + "            countdownEl.textContent = countdown;\n"
        + "            \n"
        + "            const progress = ((1 - countdown) / 1) * 100;\n"
        + "            progressEl.style.width = progress + '%';\n"
        + "            \n"
        + "            if (countdown <= 0) {\n"
        + "                window.location.reload();\n"
        + "            }\n"
        + "        }\n"
        + "        \n"
        + "        setInterval(updateCountdown, 1000);\n"
        + "        progressEl.style.width = '0%';\n"
        + "    </script>\n"
        + "</body>\n"
        + "</html>";
  }

  /** 제외 경로인지 확인 */
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
   * 클라이언트 IP 추출.
   *
   * <p>보안: X-Forwarded-For / X-Real-IP 는 클라이언트가 임의로 설정 가능하므로 신뢰할 수 있는 프록시 뒤에 있을 때만
   * (app.ratelimit.trust-forwarded-headers=true) 참고한다. 그렇지 않으면 헤더를 무시하고 실제 소켓 주소(getRemoteAddr)를
   * 사용해 IP 스푸핑에 의한 rate limit 우회·추적 맵 무한 증식을 막는다.
   */
  private String extractClientIp(HttpServletRequest request) {
    if (trustForwardedHeaders) {
      String xForwardedFor = request.getHeader("X-Forwarded-For");
      if (StringUtils.hasText(xForwardedFor)) {
        // 여러 IP가 있을 경우 첫 번째 IP 사용
        int commaIndex = xForwardedFor.indexOf(',');
        return commaIndex > 0
            ? xForwardedFor.substring(0, commaIndex).trim()
            : xForwardedFor.trim();
      }
      String xRealIp = request.getHeader("X-Real-IP");
      if (StringUtils.hasText(xRealIp)) {
        return xRealIp.trim();
      }
    }
    // 기본: 스푸핑 불가능한 실제 소켓 주소
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
