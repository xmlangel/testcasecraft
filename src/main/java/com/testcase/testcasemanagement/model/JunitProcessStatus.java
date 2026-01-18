// src/main/java/com/testcase/testcasemanagement/model/JunitProcessStatus.java

package com.testcase.testcasemanagement.model;

/**
 * ICT-203: JUnit XML 파일 처리 상태
 */
public enum JunitProcessStatus {
    /**
     * 파일 업로드 중
     */
    UPLOADING("업로드 중"),
    
    /**
     * XML 파싱 중
     */
    PARSING("파싱 중"),
    
    /**
     * 처리 완료
     */
    COMPLETED("완료"),
    
    /**
     * 처리 실패
     */
    FAILED("실패");
    
    private final String description;
    
    JunitProcessStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 진행 중인 상태인지 확인
     */
    public boolean isInProgress() {
        return this == UPLOADING || this == PARSING;
    }
    
    /**
     * 완료된 상태인지 확인 (성공/실패 모두 포함)
     */
    public boolean isFinished() {
        return this == COMPLETED || this == FAILED;
    }
}