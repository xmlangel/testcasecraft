// src/main/java/com/testcase/testcasemanagement/dto/TestCaseDto.java

package com.testcase.testcasemanagement.dto;

import lombok.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TestCaseDto {
    private String id;

    // ICT-339: 순차 ID 필드 추가
    private Integer sequentialId;

    // ICT-341: 프로젝트코드-넘버 형식의 표시 ID 추가
    private String displayId;

    @NotBlank(message = "name은 필수입니다.")
    @Size(max = 200, message = "name은 200자 이하여야 합니다.")
    private String name;

    @Size(max = 20, message = "type은 20자 이하여야 합니다.")
    private String type;

    @Size(max = 10000, message = "description은 10,000자 이하여야 합니다.")
    private String description;

    @Size(max = 10000, message = "preCondition은 10,000자 이하여야 합니다.")
    private String preCondition;

    private String parentId;

    @Valid
    @Size(max = 100, message = "steps는 최대 100개까지 가능합니다.")
    private List<TestStepDto> steps = new ArrayList<>();

    @Size(max = 10000, message = "expectedResults는 10,000자 이하여야 합니다.")
    private String expectedResults;

    @Size(max = 30, message = "createdAt은 30자 이하여야 합니다.")
    private String createdAt;

    @Size(max = 30, message = "updatedAt은 30자 이하여야 합니다.")
    private String updatedAt;

    @Valid
    @Size(max = 100, message = "children은 최대 100개까지 가능합니다.")
    private List<TestCaseDto> children = new ArrayList<>();

    private Integer displayOrder;

    private int displayNumber;

    @NotBlank(message = "projectId는 필수입니다.")
    @Size(max = 36, message = "projectId는 36자 이하여야 합니다.")
    private String projectId;

    private String parentName;
}
