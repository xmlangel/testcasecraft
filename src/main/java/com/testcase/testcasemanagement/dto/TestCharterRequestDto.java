package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TestCharterRequestDto {

    @NotBlank(message = "projectId는 필수입니다.")
    private String projectId;

    @NotBlank(message = "title은 필수입니다.")
    private String title;

    @NotBlank(message = "mission은 필수입니다.")
    private String mission;

    private String areas;
    private String tags;
    private String createdBy;
    private String status;
}
