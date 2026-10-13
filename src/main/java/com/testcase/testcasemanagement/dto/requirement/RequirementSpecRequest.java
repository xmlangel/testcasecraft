package com.testcase.testcasemanagement.dto.requirement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 요구사항 문서 생성·수정 요청. 수정은 전체 교체다: parentId 가 null 이면 최상위로 옮기고 scope 가 null 이면 비운다. displayOrder 만
 * null 일 때 기존 값을 둔다.
 */
public record RequirementSpecRequest(
    @NotBlank(message = "projectId is required.") String projectId,
    String parentId,
    @Size(max = 64) String docId,
    @NotBlank(message = "title is required.") @Size(max = 200) String title,
    String scope,
    Integer displayOrder) {}
