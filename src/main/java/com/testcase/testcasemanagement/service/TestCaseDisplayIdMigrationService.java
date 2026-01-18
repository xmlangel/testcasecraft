// src/main/java/com/testcase/testcasemanagement/service/TestCaseDisplayIdMigrationService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ICT-341: 기존 테스트 케이스들에 Display ID를 자동으로 생성하는 마이그레이션 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseDisplayIdMigrationService {

    private final TestCaseRepository testCaseRepository;
    private final TestCaseDisplayIdService displayIdService;

    /**
     * 애플리케이션 시작 시 자동으로 실행되는 마이그레이션
     * displayId가 null인 모든 테스트 케이스에 대해 Display ID를 생성합니다.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateExistingTestCases() {
        log.info("기존 테스트 케이스 Display ID 마이그레이션 시작");
        
        try {
            // displayId가 null인 모든 테스트 케이스 조회
            List<TestCase> testCasesWithoutDisplayId = testCaseRepository.findByDisplayIdIsNull();
            
            if (testCasesWithoutDisplayId.isEmpty()) {
                log.info("Display ID 마이그레이션이 필요한 테스트 케이스가 없습니다.");
                return;
            }
            
            log.info("Display ID 마이그레이션 대상: {} 개 테스트 케이스", testCasesWithoutDisplayId.size());
            
            int successCount = 0;
            int failCount = 0;
            
            for (TestCase testCase : testCasesWithoutDisplayId) {
                try {
                    // Display ID 생성 및 설정
                    String generatedDisplayId = displayIdService.generateDisplayId(testCase);
                    
                    if (generatedDisplayId != null) {
                        testCase.setDisplayId(generatedDisplayId);
                        testCaseRepository.save(testCase);
                        successCount++;
                        
                        log.debug("Display ID 생성 성공 - TestCase ID: {}, Display ID: {}", 
                                 testCase.getId(), generatedDisplayId);
                    } else {
                        failCount++;
                        log.warn("Display ID 생성 실패 - TestCase ID: {} (프로젝트 또는 순차 ID 누락)", 
                                testCase.getId());
                    }
                } catch (Exception e) {
                    failCount++;
                    log.error("Display ID 생성 중 오류 - TestCase ID: {}", testCase.getId(), e);
                }
            }
            
            log.info("Display ID 마이그레이션 완료 - 성공: {}, 실패: {}", successCount, failCount);
            
            if (failCount > 0) {
                log.warn("일부 테스트 케이스의 Display ID 마이그레이션이 실패했습니다. 로그를 확인하세요.");
            }
            
        } catch (Exception e) {
            log.error("Display ID 마이그레이션 중 예상치 못한 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 수동으로 마이그레이션을 실행할 수 있는 메소드
     * 관리자가 필요에 따라 호출할 수 있습니다.
     * 
     * @return 마이그레이션된 테스트 케이스 수
     */
    @Transactional
    public int manualMigration() {
        log.info("ICT-341: 수동 Display ID 마이그레이션 시작");
        
        List<TestCase> testCasesWithoutDisplayId = testCaseRepository.findByDisplayIdIsNull();
        
        int migrationCount = 0;
        for (TestCase testCase : testCasesWithoutDisplayId) {
            try {
                String generatedDisplayId = displayIdService.generateDisplayId(testCase);
                
                if (generatedDisplayId != null) {
                    testCase.setDisplayId(generatedDisplayId);
                    testCaseRepository.save(testCase);
                    migrationCount++;
                }
            } catch (Exception e) {
                log.error("ICT-341: 수동 마이그레이션 중 오류 - TestCase ID: {}", testCase.getId(), e);
            }
        }
        
        log.info("ICT-341: 수동 Display ID 마이그레이션 완료 - {} 개 테스트 케이스 업데이트", migrationCount);
        return migrationCount;
    }
    
    /**
     * 특정 프로젝트의 테스트 케이스들에 대해서만 Display ID를 생성합니다.
     * 
     * @param projectId 프로젝트 ID
     * @return 마이그레이션된 테스트 케이스 수
     */
    @Transactional
    public int migrateByProject(String projectId) {
        log.info("ICT-341: 프로젝트별 Display ID 마이그레이션 시작 - 프로젝트 ID: {}", projectId);
        
        List<TestCase> testCasesWithoutDisplayId = testCaseRepository.findByProjectIdAndDisplayIdIsNull(projectId);
        
        int migrationCount = 0;
        for (TestCase testCase : testCasesWithoutDisplayId) {
            try {
                String generatedDisplayId = displayIdService.generateDisplayId(testCase);
                
                if (generatedDisplayId != null) {
                    testCase.setDisplayId(generatedDisplayId);
                    testCaseRepository.save(testCase);
                    migrationCount++;
                }
            } catch (Exception e) {
                log.error("프로젝트별 마이그레이션 중 오류 - TestCase ID: {}", testCase.getId(), e);
            }
        }
        
        log.info("프로젝트별 Display ID 마이그레이션 완료 - {} 개 테스트 케이스 업데이트", migrationCount);
        return migrationCount;
    }
    
    /**
     * Display ID 마이그레이션 상태를 확인합니다.
     * 
     * @return 마이그레이션이 필요한 테스트 케이스 수
     */
    @Transactional(readOnly = true)
    public long checkMigrationStatus() {
        long countWithoutDisplayId = testCaseRepository.countByDisplayIdIsNull();
        log.info("Display ID 마이그레이션 상태 확인 - 마이그레이션 필요: {} 개", countWithoutDisplayId);
        return countWithoutDisplayId;
    }
}