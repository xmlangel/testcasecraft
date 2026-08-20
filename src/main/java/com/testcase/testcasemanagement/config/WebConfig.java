package com.testcase.testcasemanagement.config;

import java.util.concurrent.TimeUnit;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  /** 내용 해시가 이름에 붙은 자산. 내용이 바뀌면 이름이 바뀌므로 오래 캐시해도 안전하다. */
  private static final CacheControl IMMUTABLE =
      CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable();

  /** 이름이 고정된 파일. 교체가 반영되어야 하므로 하루만 두고 다시 묻게 한다. */
  private static final CacheControl NAMED = CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic();

  // API 경로를 제외한 정적 리소스 핸들러 설정
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Vite 빌드 결과물. 핸들러가 없어 기본 경로로 처리되면서 캐시 지시가 붙지 않았다.
    // 그 결과 CDN 이 캐시를 건너뛰고 매 요청이 오리진까지 갔다(2026-08-21 실측).
    registry
        .addResourceHandler("/assets/**")
        .addResourceLocations("classpath:/static/assets/")
        .setCacheControl(IMMUTABLE);

    // 구 CRA 빌드 결과물 (이름에 해시가 붙어 있다)
    registry
        .addResourceHandler("/static/**")
        .addResourceLocations("classpath:/static/static/")
        .setCacheControl(IMMUTABLE);

    // 루트 레벨 정적 파일들. 이름이 고정이라 1년으로 두면 교체가 반영되지 않는다.
    registry
        .addResourceHandler(
            "/favicon.ico",
            "/manifest.json",
            "/robots.txt",
            "/asset-manifest.json",
            "/logo*.png",
            "/testcasecraft_*.jpg",
            "/testcasecraft_*.png")
        .addResourceLocations("classpath:/static/")
        .setCacheControl(NAMED);
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
    registry.addViewController("/jira-redirect").setViewName("forward:/index.html");
    registry.addViewController("/jira-redirect/**").setViewName("forward:/index.html");
    registry.addViewController("/verify-email").setViewName("forward:/index.html");
    registry.addViewController("/verify-email/**").setViewName("forward:/index.html");
    registry.addViewController("/login").setViewName("forward:/index.html");
    registry.addViewController("/login/**").setViewName("forward:/index.html");
    registry.addViewController("/guides").setViewName("forward:/index.html");
    registry.addViewController("/guides/**").setViewName("forward:/index.html");
    registry.addViewController("/manual").setViewName("forward:/index.html");
    registry.addViewController("/manual/**").setViewName("forward:/index.html");

    // ⚠️ 일반 패턴 주석 처리 - /api/** 경로와 충돌 방지
    // 명시적으로 정의된 SPA 경로만 사용하여 API 경로가 올바르게 처리되도록 함
    // registry.addViewController("/{x:[\\w\\-]+}").setViewName("forward:/index.html");
    // registry.addViewController("/{x:[\\w\\-]+}/{y:[\\w\\-]+}").setViewName("forward:/index.html");
    // registry.addViewController("/{x:[\\w\\-]+}/{y:[\\w\\-]+}/{z:[\\w\\-]+}").setViewName("forward:/index.html");
  }
}
