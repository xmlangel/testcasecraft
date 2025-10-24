package com.testcase.testcasemanagement.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * RAG API 클라이언트 설정
 *
 * WebClient를 사용하여 FastAPI RAG 서비스와 통신하기 위한 설정을 제공합니다.
 */
@Slf4j
@Configuration
public class RagClientConfig {

    @Value("${rag.api.url:http://localhost:8001}")
    private String ragApiUrl;

    @Value("${rag.api.timeout.connection:5000}")
    private int connectionTimeout;

    @Value("${rag.api.timeout.read:30000}")
    private int readTimeout;

    @Value("${rag.api.timeout.write:30000}")
    private int writeTimeout;

    /**
     * RAG API 통신용 WebClient Bean 생성
     *
     * @return 설정된 WebClient 인스턴스
     */
    @Bean
    public WebClient ragWebClient() {
        log.info("Initializing RAG WebClient with baseUrl: {}", ragApiUrl);

        // TODO: 옵션2에서 구현
        // 1. HttpClient 설정 (타임아웃, 재시도 등)
        // 2. ExchangeFilterFunction 추가 (로깅, 에러 핸들링)
        // 3. WebClient.Builder로 WebClient 생성

        // 기본 골격 - 옵션2에서 완전 구현 예정
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectionTimeout)
                .responseTimeout(Duration.ofMillis(readTimeout))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(readTimeout, TimeUnit.MILLISECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(writeTimeout, TimeUnit.MILLISECONDS)));

        return WebClient.builder()
                .baseUrl(ragApiUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                // TODO: 옵션2에서 추가 필터 및 설정
                .build();
    }

    // TODO: 옵션2에서 추가 Bean 구현
    // - ExchangeFilterFunction for logging
    // - ExchangeFilterFunction for error handling
    // - RetrySpec for retry logic
}
