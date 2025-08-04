// src/main/java/com/testcase/testcasemanagement/dto/PermissionConflictDto.java
package com.testcase.testcasemanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 권한 충돌 정보 객체
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermissionConflictDto {
    
    private String conflictType; // "DUPLICATE_MEMBERSHIP", "INSUFFICIENT_PERMISSION", "ROLE_CONFLICT" 등
    private String message; // 충돌 상세 메시지
    private String userId; // 관련 사용자 ID
    private String resourceId; // 관련 리소스 ID (조직/프로젝트)
    private String conflictDetails; // 추가 충돌 정보
    
    // 해결 방안 제안
    private String suggestedAction; // 제안하는 해결 방법
    private boolean canAutoResolve; // 자동 해결 가능 여부
    
    public PermissionConflictDto(String conflictType, String message, String userId, String resourceId) {
        this.conflictType = conflictType;
        this.message = message;
        this.userId = userId;
        this.resourceId = resourceId;
        this.canAutoResolve = false;
    }
}