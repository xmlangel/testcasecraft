package com.testcase.testcasemanagement.dto.requirement;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 요구사항 생성·수정 요청. status·type 은 {@code Requirement.Status}·{@code Requirement.Type} 이름 문자열이다. */
public record RequirementRequest(
    @NotBlank(message = "projectId는 필수입니다.") String projectId,
    @NotBlank(message = "specId는 필수입니다.") String specId,
    @NotBlank(message = "docId는 필수입니다.") @Size(max = 64) String docId,
    @NotBlank(message = "title은 필수입니다.") @Size(max = 200) String title,
    String scope,
    String status,
    String type,
    @Min(value = 0, message = "expectedCoverage는 0 이상이어야 합니다.") Integer expectedCoverage,
    Integer displayOrder) {}
