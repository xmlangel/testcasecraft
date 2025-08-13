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
}