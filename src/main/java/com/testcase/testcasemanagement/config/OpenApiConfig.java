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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;

import java.util.List;

/**
 * OpenAPI/Swagger 설정
 */
@Configuration
public class OpenApiConfig {

        @Value("${server.servlet.context-path:/}")
        private String contextPath;

        @Autowired
        private BuildProperties buildProperties;

        @Bean
        public OpenAPI openAPI() {
                Info info = new Info()
                                .title("TestCaseCraft API")
                                .description("TestCaseCraft 테스트케이스 관리 시스템 REST API 문서")
                                .version(buildProperties.getVersion())
                                .contact(new Contact()
                                                .name("TestcaseCraft - Website")
                                                .email("kwangmyung.kim@gmail.com")
                                                .url("https://github.com/xmlangel/testcasecraft/releases"))
                                .license(new License()
                                                .name("Apache 2.0 License")
                                                .url("https://www.apache.org/licenses/LICENSE-2.0"));

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
                String serverUrl = System.getProperty("server.url",
                                System.getenv("SERVER_URL"));
                if (serverUrl == null || serverUrl.isEmpty()) {
                        serverUrl = "http://localhost:8080";
                }

                Server localServer = new Server()
                                .url(serverUrl + contextPath)
                                .description("API 서버");

                return new OpenAPI()
                                .info(info)
                                .addSecurityItem(securityRequirement)
                                .components(components)
                                .servers(List.of(localServer));
        }
}