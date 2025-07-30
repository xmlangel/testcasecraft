package com.testcase.testcasemanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.text.SimpleDateFormat;

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

    // 기존 뷰 컨트롤러 설정
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/{x:[\\w\\-]+}").setViewName("forward:/index.html");
        registry.addViewController("/{x:[\\w\\-]+}/{y:[\\w\\-]+}").setViewName("forward:/index.html");
    }
}
