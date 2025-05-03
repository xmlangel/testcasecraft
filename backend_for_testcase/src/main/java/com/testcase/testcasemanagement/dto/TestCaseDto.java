// src/main/java/com/testcase/testcasemanagement/dto/TestCaseDto.java

package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDto {
    private String id;
    @NotBlank(message = "이름은 필수 항목입니다")
    @Size(max = 200, message = "이름은 200자 이내로 입력해주세요")
    private String name;
    private String type;
    private String description;
    private String parentId = "";
    private List<TestStepDto> steps = new ArrayList<>();
    private String expectedResults;
    private String createdAt;
    private String updatedAt;
    private List<TestCaseDto> children = new ArrayList<>(); // 트리 구조용 필드 추가
    private int displayNumber;
    @NotBlank(message = "프로젝트아이디는 필수 항목입니다")
    private String projectId; // ★ 프로젝트 종속성 필수 필드 추가
}
