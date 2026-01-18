// src/main/java/com/testcase/testcasemanagement/dto/BulkPermissionChangeDto.java
package com.testcase.testcasemanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 대량 권한 변경 요청 객체
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkPermissionChangeDto {
    
    private String userId;
    private String resourceId; // 조직 ID 또는 프로젝트 ID
    private String resourceType; // "ORGANIZATION" 또는 "PROJECT"
    private String changeType; // "ADD_ORG_MEMBER", "CHANGE_ORG_ROLE", "REMOVE_ORG_MEMBER" 등
    private String currentRole; // 현재 역할 (변경/제거 시)
    private String newRole; // 새로운 역할 (추가/변경 시)
    private String reason; // 변경 사유
    
    // CSV 업로드 시 사용할 필드들
    private String username; // 사용자명 (ID 대신 사용 가능)
    private String organizationName; // 조직명 (ID 대신 사용 가능)
    private String projectName; // 프로젝트명 (ID 대신 사용 가능)
    
    // 검증 상태
    private boolean valid = true;
    private String validationMessage;
}