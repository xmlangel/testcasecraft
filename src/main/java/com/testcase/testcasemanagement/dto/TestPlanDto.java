// src/main/java/com/testcase/testcasemanagement/dto/TestPlanDto.java
package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TestPlanDto {
    private String id;
    private String name;
    private String description;
    private List<String> testCaseIds;
    @NotNull(message = "프로젝트 ID는 필수 항목입니다")
    private String projectId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int testCaseCount;
}

