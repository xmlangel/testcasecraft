package com.testcase.testcasemanagement.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 데이터베이스 초기화 컴포넌트
 * 애플리케이션 시작 시 데이터 정합성 체크 및 자동 수정 수행
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // ICT-373: TestCase의 version null 초기화
        // Hibernate의 optimistic locking을 위해 version이 null인 경우 0으로 초기화
        int updated = entityManager.createNativeQuery(
                "UPDATE testcases SET version = 0 WHERE version IS NULL").executeUpdate();

        if (updated > 0) {
            System.out.println("🔧 [데이터베이스 초기화] version null인 " + updated + "개 TestCase 초기화 완료");
        }
    }
}
