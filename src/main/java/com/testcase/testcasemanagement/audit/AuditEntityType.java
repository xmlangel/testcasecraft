// src/main/java/com/testcase/testcasemanagement/audit/AuditEntityType.java
package com.testcase.testcasemanagement.audit;

/**
 * 감사 로그 엔티티 타입 상수 정의
 */
public enum AuditEntityType {
    // 사용자 관련
    USER("USER"),
    
    // 조직 관련
    ORGANIZATION("ORGANIZATION"),
    ORGANIZATION_USER("ORGANIZATION_USER"),
    
    // 프로젝트 관련
    PROJECT("PROJECT"),
    PROJECT_USER("PROJECT_USER"),
    
    // 그룹 관련
    GROUP("GROUP"),
    GROUP_MEMBER("GROUP_MEMBER"),
    
    // 테스트 케이스 관련
    TEST_CASE("TEST_CASE"),
    TEST_PLAN("TEST_PLAN"),
    TEST_EXECUTION("TEST_EXECUTION"),
    TEST_RESULT("TEST_RESULT"),
    
    // 시스템 관련
    SYSTEM("SYSTEM"),
    AUTHENTICATION("AUTHENTICATION");
    
    private final String value;
    
    AuditEntityType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public String toString() {
        return value;
    }
}