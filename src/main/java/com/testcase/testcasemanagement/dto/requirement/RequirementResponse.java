package com.testcase.testcasemanagement.dto.requirement;

import java.time.LocalDateTime;
import java.util.List;

public record RequirementResponse(
    String id,
    String projectId,
    String specId,
    String docId,
    String title,
    String scope,
    String status,
    String type,
    Integer expectedCoverage,
    Integer displayOrder,
    List<String> linkedTestCaseIds,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
