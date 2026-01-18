package com.testcase.testcasemanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseBulkOperationDto {
    
    public enum OperationType {
        UPDATE, DELETE, MOVE, COPY
    }
    
    private OperationType operationType;
    private List<String> testCaseIds;
    
    // For UPDATE operation
    private Map<String, Object> updateFields;
    
    // For MOVE and COPY operations
    private String targetProjectId;
    private String targetParentId; // null means root
    
    // Response data
    private Integer affectedCount;
    private List<String> errors;
    private boolean success;
    
    // Validation helpers
    public boolean isValidForUpdate() {
        return operationType == OperationType.UPDATE 
            && testCaseIds != null && !testCaseIds.isEmpty()
            && updateFields != null && !updateFields.isEmpty();
    }
    
    public boolean isValidForDelete() {
        return operationType == OperationType.DELETE 
            && testCaseIds != null && !testCaseIds.isEmpty();
    }
    
    public boolean isValidForMoveOrCopy() {
        return (operationType == OperationType.MOVE || operationType == OperationType.COPY)
            && testCaseIds != null && !testCaseIds.isEmpty()
            && targetProjectId != null;
    }
}