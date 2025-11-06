package com.testcase.testcasemanagement.config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO 클라이언트 설정
 *
 * TestCase 첨부파일을 MinIO Object Storage에 저장하기 위한 설정을 제공합니다.
 */
@Slf4j
@Configuration
public class MinIOClientConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.secure:false}")
    private boolean secure;

    /**
     * MinIO 클라이언트 Bean 생성
     *
     * @return 설정된 MinioClient 인스턴스
     */
    @Bean
    public MinioClient minioClient() {
        log.info("Initializing MinIO Client with endpoint: {}, secure: {}", endpoint, secure);

        // endpoint가 "host:port" 형식이면 그대로 사용, 아니면 포트 추가
        String fullEndpoint = endpoint;
        if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
            fullEndpoint = (secure ? "https://" : "http://") + endpoint;
        }

        return MinioClient.builder()
                .endpoint(fullEndpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
