// src/main/java/com/testcase/testcasemanagement/model/JunitTestStatus.java

package com.testcase.testcasemanagement.model;

/**
 * ICT-203: JUnit 테스트 케이스 상태
 */
public enum JunitTestStatus {
    /**
     * 테스트 성공
     */
    PASSED("성공"),
    
    /**
     * 테스트 실패 (assertion failure)
     */
    FAILED("실패"),
    
    /**
     * 테스트 에러 (exception)
     */
    ERROR("에러"),
    
    /**
     * 테스트 스킵
     */
    SKIPPED("스킵");
    
    private final String description;
    
    JunitTestStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 성공 여부 확인
     */
    public boolean isSuccess() {
        return this == PASSED;
    }
    
    /**
     * 실패 여부 확인 (FAILED 또는 ERROR)
     */
    public boolean isFailure() {
        return this == FAILED || this == ERROR;
    }
    
    /**
     * 실행되지 않음 여부 확인
     */
    public boolean isNotExecuted() {
        return this == SKIPPED;
    }
}