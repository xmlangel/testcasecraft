// src/main/java/com/testcase/testcasemanagement/config/OpenApiConfig.java
package com.testcase.testcasemanagement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexPageTransformer;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

/** OpenAPI/Swagger 설정 */
@Configuration
public class OpenApiConfig {

  @Value("${server.servlet.context-path:/}")
  private String contextPath;

  @Autowired(required = false) // DevTools 핫리로드 재시작 시 BuildProperties 빈이 없을 수 있음
  private BuildProperties buildProperties;

  @Bean
  public OpenAPI openAPI() {
    Info info =
        new Info()
            .title("TestCaseCraft API")
            .description("TestCaseCraft 테스트케이스 관리 시스템 REST API 문서")
            .version(buildProperties != null ? buildProperties.getVersion() : "unknown")
            .contact(new Contact().name("TestcaseCraft").email("kwangmyung.kim@gmail.com"));

    // JWT 보안 스키마 정의
    String jwtSchemeName = "bearerAuth";
    SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
    Components components =
        new Components()
            .addSecuritySchemes(
                jwtSchemeName,
                new SecurityScheme()
                    .name(jwtSchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT 토큰을 사용한 인증. 'Bearer {token}' 형식으로 입력하세요."));

    // 서버 정보 설정
    String serverUrl = System.getProperty("server.url", System.getenv("SERVER_URL"));
    if (serverUrl == null || serverUrl.isEmpty()) {
      serverUrl = "http://localhost:8080";
    }

    Server localServer = new Server().url(serverUrl + contextPath).description("API 서버");

    return new OpenAPI()
        .info(info)
        .addSecurityItem(securityRequirement)
        .components(components)
        .servers(List.of(localServer));
  }

  /**
   * Swagger UI 가 앱에 로그인한 브라우저의 accessToken 을 모든 요청에 실어 보내게 한다.
   *
   * <p>/api-docs 는 시스템 관리자(ADMIN)만 열람할 수 있는데(SecurityConfig), 토큰이 쿠키가 아니라 localStorage 에 있어 브라우저가
   * 자동으로 보내지 않는다. 명세를 불러오는 첫 요청부터 헤더가 필요하므로 Authorize 버튼으로는 해결되지 않는다. Authorize 로 직접 넣은 값이 있으면 그것을
   * 우선한다.
   */
  @Bean
  @ConditionalOnProperty(name = "springdoc.swagger-ui.enabled", matchIfMissing = true)
  public SwaggerIndexTransformer swaggerIndexTransformer(
      SwaggerUiConfigProperties swaggerUiConfig,
      SwaggerUiOAuthProperties swaggerUiOAuthProperties,
      SwaggerWelcomeCommon swaggerWelcomeCommon,
      ObjectMapperProvider objectMapperProvider) {
    return new SwaggerIndexPageTransformer(
        swaggerUiConfig, swaggerUiOAuthProperties, swaggerWelcomeCommon, objectMapperProvider) {
      @Override
      public Resource transform(
          HttpServletRequest request, Resource resource, ResourceTransformerChain chain)
          throws IOException {
        Resource transformed = super.transform(request, resource, chain);
        if (!request.getRequestURI().endsWith("/swagger-initializer.js")) {
          return transformed;
        }
        String js =
            new String(transformed.getInputStream().readAllBytes(), StandardCharsets.UTF_8)
                .replace("SwaggerUIBundle({", "SwaggerUIBundle({\n" + ACCESS_TOKEN_INTERCEPTOR)
                .replace(
                    "SwaggerUIBundle.plugins.DownloadUrl",
                    "SwaggerUIBundle.plugins.DownloadUrl,\n" + HIDE_SPEC_URL_PLUGIN);
        return new TransformedResource(transformed, js.getBytes(StandardCharsets.UTF_8));
      }
    };
  }

  /** 제목 아래의 명세 주소(/api-docs) 링크를 지운다. 새 탭으로 열면 Authorization 헤더가 실리지 않아 401 만 보이기 때문이다. */
  private static final String HIDE_SPEC_URL_PLUGIN =
      "      () => ({ wrapComponents: { InfoUrl: () => () => null } })";

  private static final String ACCESS_TOKEN_INTERCEPTOR =
      "    requestInterceptor: (req) => {\n"
          + "      const token = window.localStorage.getItem('accessToken');\n"
          + "      if (token && !req.headers.Authorization) {\n"
          + "        req.headers.Authorization = 'Bearer ' + token;\n"
          + "      }\n"
          + "      return req;\n"
          + "    },\n";
}
