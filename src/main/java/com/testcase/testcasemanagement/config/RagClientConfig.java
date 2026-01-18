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

        @Value("${rag.api.timeout.read:300000}") // ICT-390: 5분으로 증가 (대용량 임베딩 생성 지원)
        private int readTimeout;

        @Value("${rag.api.timeout.write:300000}") // ICT-390: 5분으로 증가 (대용량 파일 업로드 지원)
        private int writeTimeout;

        /**
         * RAG API 통신용 WebClient Bean 생성
         *
         * @return 설정된 WebClient 인스턴스
         */
        @Bean
        public WebClient ragWebClient() {
                log.info("Initializing RAG WebClient with baseUrl: {}", ragApiUrl);

                HttpClient httpClient = HttpClient.create()
                                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectionTimeout)
                                .responseTimeout(Duration.ofMillis(readTimeout))
                                .doOnConnected(conn -> conn
                                                .addHandlerLast(new ReadTimeoutHandler(readTimeout,
                                                                TimeUnit.MILLISECONDS))
                                                .addHandlerLast(new WriteTimeoutHandler(writeTimeout,
                                                                TimeUnit.MILLISECONDS)));

                return WebClient.builder()
                                .baseUrl(ragApiUrl)
                                .clientConnector(new ReactorClientHttpConnector(httpClient))
                                .codecs(configurer -> configurer
                                                .defaultCodecs()
                                                .maxInMemorySize(50 * 1024 * 1024)) // 50MB - 최대 문서 크기와 동일하게 설정 (대용량 청크
                                                                                    // 응답 지원)
                                .build();
        }

}
