// src/main/java/com/testcase/testcasemanagement/dto/TestExecutionDto.java

package com.testcase.testcasemanagement.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TestExecutionDto {
    private String id;
    private String name;
    private String testPlanId;
    private String description;
    private String status; // NOTSTARTED, INPROGRESS, COMPLETED
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<TestResultDto> results; // 각 테스트케이스별 결과

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getter/setter 생략
}
