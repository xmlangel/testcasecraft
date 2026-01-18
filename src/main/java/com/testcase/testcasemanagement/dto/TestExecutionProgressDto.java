package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 테스트 실행 진행률 데이터 DTO
 * 현재 진행 중인 테스트 실행들의 진행률 정보
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestExecutionProgressDto {
    private String testExecutionId; // 테스트 실행 ID
    private String testExecutionName; // 테스트 실행 이름
    private String projectId; // 프로젝트 ID
    private String projectName; // 프로젝트 이름
    private String testPlanId; // 테스트 플랜 ID (nullable)
    private String status; // 실행 상태 (INPROGRESS 등)
    private LocalDateTime startDate; // 시작 날짜
    private LocalDateTime endDate; // 종료 날짜 (nullable)
    
    private Integer totalTestCases; // 전체 테스트케이스 개수
    private Integer completedTestCases; // 완료된 테스트케이스 개수
    private Integer passedTestCases; // 성공한 테스트케이스 개수
    private Integer failedTestCases; // 실패한 테스트케이스 개수
    private Integer blockedTestCases; // 차단된 테스트케이스 개수
    private Integer skippedTestCases; // 건너뛴 테스트케이스 개수
    private Integer notRunTestCases; // 미실행 테스트케이스 개수
    
    private Double completionRate; // 완료율 (%)
    private Double passRate; // 통과율 (%)
    
    private LocalDateTime lastExecutedAt; // 마지막 실행 시간
}