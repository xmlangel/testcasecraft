// src/main/java/com/testcase/testcasemanagement/dto/ProjectDto.java
package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String code; // ✅ 필수 필드로 추가
    private String id;
    private String name;
    private String description;
    private Integer displayOrder;
    private String createdAt;
    private String updatedAt;
}
