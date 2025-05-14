// src/main/java/com/testcase/testcasemanagement/dto/TestCaseDto.java

package com.testcase.testcasemanagement.dto;

import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotBlank(message = "이름은 필수 항목입니다")
    @Size(max = 200, message = "이름은 200자 이내로 입력해주세요")
    private String name;

    @Size(max = 20, message = "타입은 20자 이내로 입력해주세요")
    private String type;

    @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
    private String description;

    @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
    private String preCondition;

    private String parentId;

    @Valid
    @Size(max = 100, message = "테스트 단계는 100개 이하로 입력해주세요")
    private List<TestStepDto> steps = new ArrayList<>();

    @Size(max = 2000, message = "기대 결과는 2000자 이내로 입력해주세요")
    private String expectedResults;

    @Size(max = 30, message = "생성일시는 30자 이내로 입력해주세요")
    private String createdAt;

    @Size(max = 30, message = "수정일시는 30자 이내로 입력해주세요")
    private String updatedAt;

    @Valid
    @Size(max = 100, message = "하위 테스트케이스는 100개 이하로 입력해주세요")
    private List<TestCaseDto> children = new ArrayList<>(); // 트리 구조용 필드

    private Integer displayOrder;

    private int displayNumber;

    @NotBlank(message = "프로젝트아이디는 필수 항목입니다")
    @Size(max = 36, message = "프로젝트아이디는 36자 이내로 입력해주세요")
    private String projectId;

    private String parentName;
}
