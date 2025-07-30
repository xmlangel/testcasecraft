package com.testcase.testcasemanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    // RefreshTokenService의 @Scheduled 메서드가 동작하도록 하는 설정
}