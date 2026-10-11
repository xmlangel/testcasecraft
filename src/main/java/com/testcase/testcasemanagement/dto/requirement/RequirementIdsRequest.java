package com.testcase.testcasemanagement.dto.requirement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** ID 목록 하나만 담는 요청(요구사항에 TC 추가, TC 의 요구사항 목록 교체). */
public record RequirementIdsRequest(
    @NotNull(message = "ids는 필수입니다.") List<@NotBlank(message = "빈 ID는 허용되지 않습니다.") String> ids) {}
