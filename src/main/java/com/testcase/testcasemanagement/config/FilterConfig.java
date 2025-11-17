// src/main/java/com/testcase/testcasemanagement/config/FilterConfig.java

package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.filter.RateLimiterFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * 필터 설정 클래스
 * Rate Limiting 필터를 등록하고 우선순위를 설정합니다.
 */
@Configuration
public class FilterConfig {

    /**
     * Rate Limiter 필터 등록
     *
     * - 모든 URL 패턴에 대해 적용 (/**)
     * - 필터 체인의 가장 앞에 배치 (HIGHEST_PRECEDENCE + 1)
     * - Security Filter보다 먼저 실행되어 불필요한 처리 방지
     */
    @Bean
    public FilterRegistrationBean<RateLimiterFilter> rateLimiterFilterRegistration(RateLimiterFilter rateLimiterFilter) {
        FilterRegistrationBean<RateLimiterFilter> registration = new FilterRegistrationBean<>();

        registration.setFilter(rateLimiterFilter);
        registration.addUrlPatterns("/*");  // 모든 요청에 적용
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);  // 높은 우선순위
        registration.setName("rateLimiterFilter");

        return registration;
    }
}
