package com.testcase.testcasemanagement.dto.requirement;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 요구사항 생성·수정 요청. status·type 은 {@code Requirement.Status}·{@code Requirement.Type} 이름 문자열이다. */
public record RequirementRequest(
    @NotBlank(message = "projectId is required.") String projectId,
    @NotBlank(message = "specId is required.") String specId,
    @NotBlank(message = "docId is required.") @Size(max = 64) String docId,
    @NotBlank(message = "title is required.") @Size(max = 200) String title,
    String scope,
    String status,
    String type,
    @Min(value = 0, message = "expectedCoverage must be 0 or greater.") Integer expectedCoverage,
    Integer displayOrder) {}
