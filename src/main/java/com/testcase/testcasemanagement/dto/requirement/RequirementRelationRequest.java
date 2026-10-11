package com.testcase.testcasemanagement.dto.requirement;

import jakarta.validation.constraints.NotBlank;

/** 관계 추가 요청. 경로의 요구사항이 source, targetId 가 target 이다. type 은 RequirementRelation.Type 이름이다. */
public record RequirementRelationRequest(
    @NotBlank(message = "targetId is required.") String targetId,
    @NotBlank(message = "type is required.") String type) {}
