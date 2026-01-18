// src/main/java/com/testcase/testcasemanagement/config/AsyncConfig.java

package com.testcase.testcasemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * ICT-200: 대량 파일 처리를 위한 비동기 설정
 * JUnit XML 파일의 백그라운드 처리를 위한 스레드 풀 구성
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * JUnit 파일 처리용 전용 스레드 풀
     * 대용량 파일 처리 시 메인 애플리케이션 스레드에 영향을 주지 않도록 분리
     */
    @Bean("junitProcessingExecutor")
    public Executor junitProcessingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 기본 스레드 수 (CPU 코어 수의 1/2)
        executor.setCorePoolSize(Math.max(2, Runtime.getRuntime().availableProcessors() / 2));
        
        // 최대 스레드 수 (CPU 코어 수와 동일)
        executor.setMaxPoolSize(Runtime.getRuntime().availableProcessors());
        
        // 대기열 용량 (메모리 사용량 고려하여 제한)
        executor.setQueueCapacity(50);
        
        // 스레드 이름 접두사
        executor.setThreadNamePrefix("JunitProcessor-");
        
        // 스레드 유지 시간 (60초 후 초과 스레드 정리)
        executor.setKeepAliveSeconds(60);
        
        // 애플리케이션 종료 시 대기 중인 작업 완료 대기
        executor.setWaitForTasksToCompleteOnShutdown(true);
        
        // 최대 대기 시간 (30초)
        executor.setAwaitTerminationSeconds(30);
        
        // 스레드 풀 초기화
        executor.initialize();
        
        return executor;
    }
    
    /**
     * 일반적인 비동기 작업용 스레드 풀
     * 가벼운 비동기 작업용
     */
    @Bean("generalAsyncExecutor")
    public Executor generalAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("GeneralAsync-");
        executor.setKeepAliveSeconds(30);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(15);

        executor.initialize();

        return executor;
    }

    /**
     * ICT-388: RAG 벡터화 전용 스레드 풀
     * TestCase 저장 시 RAG 벡터화를 백그라운드에서 처리
     *
     * 대량 일괄 저장 최적화:
     * - Core 4개 스레드로 병렬 처리 향상
     * - Queue 100개로 증가하여 대량 작업 처리
     */
    @Bean("ragVectorizationExecutor")
    public Executor ragVectorizationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // RAG 작업은 I/O 집약적이므로 스레드 수를 적절히 설정
        // 대량 일괄 저장을 고려하여 Core 스레드 증가 (2 → 4)
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        // 대량 작업 대기를 위한 큐 증가 (50 → 100)
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("RAGVectorize-");
        executor.setKeepAliveSeconds(60);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        executor.initialize();

        return executor;
    }
}