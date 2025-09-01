// src/main/java/com/testcase/testcasemanagement/config/JiraConfig.java
package com.testcase.testcasemanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.DeserializationFeature;

import java.time.Duration;

@Configuration
public class JiraConfig {
    
    @Component
    @ConfigurationProperties(prefix = "app.jira")
    public static class JiraProperties {
        private String serverUrl;
        
        public String getServerUrl() {
            return serverUrl;
        }
        
        public void setServerUrl(String serverUrl) {
            this.serverUrl = serverUrl;
        }
    }
    
    /**
     * JIRA API 호출용 RestTemplate 설정
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(30))
            .build();
    }
    
    /**
     * JSON 처리용 ObjectMapper 설정
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }
}