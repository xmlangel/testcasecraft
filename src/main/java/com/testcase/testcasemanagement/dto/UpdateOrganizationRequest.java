package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 조직 수정 요청 DTO
 */
public class UpdateOrganizationRequest {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    public UpdateOrganizationRequest() {}
    
    public UpdateOrganizationRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}