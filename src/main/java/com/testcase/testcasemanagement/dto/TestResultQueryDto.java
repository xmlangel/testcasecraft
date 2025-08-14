// src/main/java/com/testcase/testcasemanagement/dto/TestResultQueryDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-208: 테스트 결과 조회를 위한 쿼리 DTO
 * 다양한 조회 조건을 통합하여 처리합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultQueryDto {
    
    /**
     * 프로젝트 ID
     */
    private String projectId;
    
    /**
     * 테스트 플랜 ID 목록
     */
    private List<String> testPlanIds;
    
    /**
     * 테스트 실행 ID 목록  
     */
    private List<String> testExecutionIds;
    
    /**
     * JUnit 테스트 결과 ID 목록
     */
    private List<String> junitTestResultIds;
    
    /**
     * 테스트 결과 상태 필터 (PASS, FAIL, NOT_RUN, BLOCKED)
     */
    private List<String> resultStatuses;
    
    /**
     * 실행자 ID 목록
     */
    private List<String> executorIds;
    
    /**
     * JIRA 이슈 키
     */
    private String jiraIssueKey;
    
    /**
     * JIRA 동기화 상태
     */
    private List<String> jiraSyncStatuses;
    
    /**
     * 시작 날짜 (실행일 기준)
     */
    private LocalDateTime startDate;
    
    /**
     * 종료 날짜 (실행일 기준)
     */
    private LocalDateTime endDate;
    
    /**
     * 테스트 케이스명 검색 키워드
     */
    private String testCaseNameKeyword;
    
    /**
     * 폴더 경로 필터
     */
    private String folderPath;
    
    /**
     * 우선순위 필터
     */
    private List<String> priorities;
    
    /**
     * 카테고리 필터
     */
    private List<String> categories;
    
    /**
     * 최근 N일 간의 결과만 조회
     */
    private Integer recentDays;
    
    /**
     * 실패한 테스트만 조회 여부
     */
    private Boolean failedOnly;
    
    /**
     * 페이지 번호 (0부터 시작)
     */
    @Builder.Default
    private int page = 0;
    
    /**
     * 페이지 크기
     */
    @Builder.Default
    private int size = 20;
    
    /**
     * 정렬 필드
     */
    @Builder.Default
    private String sortBy = "executedAt";
    
    /**
     * 정렬 방향 (ASC, DESC)
     */
    @Builder.Default
    private String sortDirection = "DESC";
    
    /**
     * 포함할 통계 유형
     */
    private List<String> includeStatistics;
    
    /**
     * 집계 기준 (일별, 주별, 월별)
     */
    private String aggregationPeriod;
}