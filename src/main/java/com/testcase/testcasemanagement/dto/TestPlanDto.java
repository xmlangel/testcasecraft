// src/main/java/com/testcase/testcasemanagement/dto/TestPlanDto.java
package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

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

  @NotNull(message = "Project ID is required")
  private String projectId;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private int testCaseCount;
}
