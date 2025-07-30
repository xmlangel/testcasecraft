package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;

/**
 * 조직 멤버 초대 요청 DTO
 */
public class InviteMemberRequest {
    
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("role")
    private OrganizationRole role;
    
    public InviteMemberRequest() {}
    
    public InviteMemberRequest(String username, OrganizationRole role) {
        this.username = username;
        this.role = role;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public OrganizationRole getRole() {
        return role;
    }
    
    public void setRole(OrganizationRole role) {
        this.role = role;
    }
}