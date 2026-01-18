package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;

/**
 * 조직 멤버 역할 변경 요청 DTO
 */
public class UpdateMemberRoleRequest {
    
    @JsonProperty("role")
    private OrganizationRole role;
    
    public UpdateMemberRoleRequest() {}
    
    public UpdateMemberRoleRequest(OrganizationRole role) {
        this.role = role;
    }
    
    public OrganizationRole getRole() {
        return role;
    }
    
    public void setRole(OrganizationRole role) {
        this.role = role;
    }
}