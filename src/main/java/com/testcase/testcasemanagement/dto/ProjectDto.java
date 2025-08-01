// src/main/java/com/testcase/testcasemanagement/dto/ProjectDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    @NotBlank(message = "코드는 필수 항목입니다")
    @Size(max = 30, message = "코드는 30자 이내로 입력해주세요")
    private String code; // ✅ 필수 필드

    @Size(max = 36, message = "ID는 36자 이내로 입력해주세요")
    private String id;

    @NotBlank(message = "이름은 필수 항목입니다")
    @Size(max = 100, message = "이름은 100자 이내로 입력해주세요")
    private String name; // ✅ 필수 필드

    @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
    private String description;

    private Integer displayOrder;

    @Size(max = 30, message = "생성일시는 30자 이내로 입력해주세요")
    private String createdAt;

    @Size(max = 30, message = "수정일시는 30자 이내로 입력해주세요")
    private String updatedAt;

    // 조직 ID (조직에 속한 프로젝트인 경우)
    @Size(max = 36, message = "조직 ID는 36자 이내로 입력해주세요")
    private String organizationId;
}
