package com.testcase.testcasemanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseFilterDto {
    
    // Basic filters
    private String search;
    private String priority;
    private String type;
    private String status;
    private List<String> projectIds;
    
    // Date filters
    private LocalDateTime createdDateFrom;
    private LocalDateTime createdDateTo;
    private LocalDateTime updatedDateFrom;
    private LocalDateTime updatedDateTo;
    
    // Content filters
    private Boolean hasSteps;
    private Boolean hasResults;
    private List<String> tags;
    
    // Pagination
    private Integer page = 0;
    private Integer size = 50;
    private String sortBy = "updatedAt";
    private String sortDirection = "DESC";
    
    // Advanced search options
    private Boolean searchInSteps = true;
    private Boolean searchInDescription = true;
    private Boolean caseSensitive = false;
    
    public boolean hasDateFilter() {
        return createdDateFrom != null || createdDateTo != null 
            || updatedDateFrom != null || updatedDateTo != null;
    }
    
    public boolean hasContentFilter() {
        return hasSteps != null || hasResults != null 
            || (tags != null && !tags.isEmpty());
    }
    
    public boolean isEmpty() {
        return (search == null || search.trim().isEmpty())
            && priority == null
            && type == null
            && status == null
            && (projectIds == null || projectIds.isEmpty())
            && !hasDateFilter()
            && !hasContentFilter();
    }
}