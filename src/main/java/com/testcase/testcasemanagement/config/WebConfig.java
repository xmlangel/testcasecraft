package com.testcase.testcasemanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // API 경로를 제외한 정적 리소스 핸들러 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // API 경로 제외하고 정적 리소스 처리
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/static/")
                .setCachePeriod(31556926);

        // 루트 레벨 정적 파일들 (index.html, favicon.ico 등)
        registry.addResourceHandler("/favicon.ico", "/manifest.json", "/robots.txt", "/asset-manifest.json")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(31556926);
    }

    // SPA 라우팅을 위한 뷰 컨트롤러 설정 개선
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 메인 페이지
        registry.addViewController("/").setViewName("forward:/index.html");

        // SPA 라우팅 경로들 - 모든 React Router 경로를 index.html로 포워딩
        registry.addViewController("/organizations").setViewName("forward:/index.html");
        registry.addViewController("/organizations/**").setViewName("forward:/index.html");
        registry.addViewController("/projects").setViewName("forward:/index.html");
        registry.addViewController("/projects/**").setViewName("forward:/index.html");
        registry.addViewController("/testcases").setViewName("forward:/index.html");
        registry.addViewController("/testcases/**").setViewName("forward:/index.html");
        registry.addViewController("/executions").setViewName("forward:/index.html");
        registry.addViewController("/executions/**").setViewName("forward:/index.html");
        registry.addViewController("/dashboard").setViewName("forward:/index.html");
        registry.addViewController("/dashboard/**").setViewName("forward:/index.html");
        registry.addViewController("/users").setViewName("forward:/index.html");
        registry.addViewController("/users/**").setViewName("forward:/index.html");
        registry.addViewController("/settings").setViewName("forward:/index.html");
        registry.addViewController("/settings/**").setViewName("forward:/index.html");
        registry.addViewController("/translation-management").setViewName("forward:/index.html");
        registry.addViewController("/translation-management/**").setViewName("forward:/index.html");
        registry.addViewController("/mail-settings").setViewName("forward:/index.html");
        registry.addViewController("/mail-settings/**").setViewName("forward:/index.html");
        registry.addViewController("/rag-documents").setViewName("forward:/index.html");
        registry.addViewController("/rag-documents/**").setViewName("forward:/index.html");
        registry.addViewController("/llm-config").setViewName("forward:/index.html");
        registry.addViewController("/llm-config/**").setViewName("forward:/index.html");
        registry.addViewController("/scheduler").setViewName("forward:/index.html");
        registry.addViewController("/scheduler/**").setViewName("forward:/index.html");
        registry.addViewController("/verify-email").setViewName("forward:/index.html");
        registry.addViewController("/verify-email/**").setViewName("forward:/index.html");

        // ⚠️ 일반 패턴 주석 처리 - /api/** 경로와 충돌 방지
        // 명시적으로 정의된 SPA 경로만 사용하여 API 경로가 올바르게 처리되도록 함
        // registry.addViewController("/{x:[\\w\\-]+}").setViewName("forward:/index.html");
        // registry.addViewController("/{x:[\\w\\-]+}/{y:[\\w\\-]+}").setViewName("forward:/index.html");
        // registry.addViewController("/{x:[\\w\\-]+}/{y:[\\w\\-]+}/{z:[\\w\\-]+}").setViewName("forward:/index.html");
    }
}
