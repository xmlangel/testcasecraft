// src/main/java/com/testcase/testcasemanagement/audit/AuditAction.java
package com.testcase.testcasemanagement.audit;

/**
 * 감사 로그 액션 상수 정의
 */
public enum AuditAction {
    // 생성 작업
    CREATE("CREATE"),
    
    // 읽기 작업
    READ("READ"),
    
    // 수정 작업
    UPDATE("UPDATE"),
    
    // 삭제 작업
    DELETE("DELETE"),
    
    // 멤버 관리 작업
    INVITE_MEMBER("INVITE_MEMBER"),
    REMOVE_MEMBER("REMOVE_MEMBER"),
    UPDATE_MEMBER_ROLE("UPDATE_MEMBER_ROLE"),
    
    // 권한 관리 작업
    GRANT_PERMISSION("GRANT_PERMISSION"),
    REVOKE_PERMISSION("REVOKE_PERMISSION"),
    
    // 이전/이동 작업
    TRANSFER("TRANSFER"),
    
    // 로그인/로그아웃
    LOGIN("LOGIN"),
    LOGOUT("LOGOUT"),
    
    // 기타 작업
    ACTIVATE("ACTIVATE"),
    DEACTIVATE("DEACTIVATE"),
    ARCHIVE("ARCHIVE"),
    RESTORE("RESTORE");
    
    private final String value;
    
    AuditAction(String value) {
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