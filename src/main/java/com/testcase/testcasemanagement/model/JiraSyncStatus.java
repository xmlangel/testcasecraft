// src/main/java/com/testcase/testcasemanagement/model/JiraSyncStatus.java
package com.testcase.testcasemanagement.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * JIRA 동기화 상태를 나타내는 열거형
 * ICT-162: JIRA API 클라이언트 및 연동 서비스 구현
 */
@Getter
@RequiredArgsConstructor
public enum JiraSyncStatus {
    /**
     * 동기화되지 않음 - JIRA 이슈와 연결되지 않은 상태
     */
    NOT_SYNCED("동기화되지 않음"),
    
    /**
     * 동기화 대기 중 - JIRA 연동 요청이 있지만 아직 처리되지 않음
     */
    PENDING("동기화 대기 중"),
    
    /**
     * 동기화 진행 중 - JIRA API 호출 진행 중
     */
    IN_PROGRESS("동기화 진행 중"),
    
    /**
     * 동기화 성공 - JIRA 이슈에 코멘트가 성공적으로 추가됨
     */
    SYNCED("동기화 완료"),
    
    /**
     * 동기화 실패 - JIRA API 호출 실패 또는 오류 발생
     */
    FAILED("동기화 실패"),
    
    /**
     * 재시도 필요 - 일시적인 오류로 재시도가 필요한 상태
     */
    RETRY_REQUIRED("재시도 필요");

    private final String description;

    /**
     * 동기화 가능한 상태인지 확인
     * @return 동기화 시도가 가능한 상태인지 여부
     */
    public boolean canSync() {
        return this == NOT_SYNCED || this == FAILED || this == RETRY_REQUIRED;
    }

    /**
     * 동기화 완료 상태인지 확인
     * @return 동기화가 완료된 상태인지 여부
     */
    public boolean isSynced() {
        return this == SYNCED;
    }

    /**
     * 동기화 진행 중 상태인지 확인
     * @return 동기화가 진행 중인 상태인지 여부
     */
    public boolean isInProgress() {
        return this == PENDING || this == IN_PROGRESS;
    }
}