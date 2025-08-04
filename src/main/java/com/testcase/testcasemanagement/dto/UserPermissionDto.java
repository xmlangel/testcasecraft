// src/main/java/com/testcase/testcasemanagement/dto/UserPermissionDto.java
package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.ProjectUser;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 사용자 권한 정보 전송 객체
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionDto {
    
    private String userId;
    private String username;
    private String userRole;
    private String systemRole;
    private Boolean isActive;
    
    // 조직 멤버십 정보
    private List<OrganizationUser> organizationMemberships;
    
    // 프로젝트 멤버십 정보
    private List<ProjectUser> projectMemberships;
    
    // 사용자 이름과 이메일 (편의용)
    private String name;
    private String email;
}