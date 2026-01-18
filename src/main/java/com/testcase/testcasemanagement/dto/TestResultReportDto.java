package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-185: 테스트 결과 리포트 상세 데이터 DTO
 * 폴더/케이스/결과/시행일자/실행자/비고/JIRA ID를 포함한 상세 리포트 데이터
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResultReportDto {

    // 기본 테스트 정보
    private String testPlanId;
    private String testPlanName;
    private String testExecutionId;
    private String testExecutionName;

    // 테스트 케이스 정보
    private String testCaseId;
    private String testCaseName;
    private String folderPath; // 계층 구조 경로 (예: "Root/API/Authentication")

    // 실행 결과
    private String result; // PASS, FAIL, NOT_RUN, BLOCKED

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime executedAt; // 시행일자

    private String executedBy; // 실행자 ID
    private String executorName; // 실행자 이름

    private String notes; // 비고

    // JIRA 연동 정보
    private String jiraIssueKey; // JIRA ID
    private String jiraIssueUrl;
    private String jiraStatus; // JIRA 이슈 현재 상태
    private String jiraSyncStatus; // 동기화 상태

    // 추가 메타데이터
    private String priority; // 테스트 케이스 우선순위
    private String category; // 테스트 카테고리

    // ICT-277: 새로 추가된 테스트 케이스 상세 정보
    private String preCondition; // 사전설정
    private String expectedResults; // 전체 예상결과
    private Object steps; // 스텝 정보 (JSON 배열 또는 문자열)

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // ICT-361: 첨부파일 개수
    private int attachmentCount;
}