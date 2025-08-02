// src/main/java/com/testcase/testcasemanagement/config/OpenApiConfig.java
package com.testcase.testcasemanagement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger 설정
 */
@Configuration
public class OpenApiConfig {
    
    @Value("${server.servlet.context-path:/}")
    private String contextPath;
    
    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("Test Case Management API")
                .description("테스트케이스 관리 시스템 REST API 문서")
                .version("v1.0.0")
                .contact(new Contact()
                        .name("Test Case Management Team")
                        .email("admin@testcase.com")
                        .url("https://github.com/testcase/testcase-management"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));

        // JWT 보안 스키마 정의
        String jwtSchemeName = "bearerAuth";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT 토큰을 사용한 인증. 'Bearer {token}' 형식으로 입력하세요."));

        // 서버 정보 설정
        Server localServer = new Server()
                .url("http://localhost:8080" + contextPath)
                .description("로컬 개발 서버");
        
        Server productionServer = new Server()
                .url("https://qaspecialist.shop" + contextPath)
                .description("운영 서버");

        return new OpenAPI()
                .info(info)
                .addSecurityItem(securityRequirement)
                .components(components)
                .servers(List.of(localServer, productionServer));
    }
}