package com.testcase.testcasemanagement.dto.requirement;

import java.time.LocalDateTime;

public record RequirementSpecResponse(
    String id,
    String projectId,
    String parentId,
    String docId,
    String title,
    String scope,
    Integer displayOrder,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
