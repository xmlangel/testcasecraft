// src/main/java/com/testcase/testcasemanagement/dto/ProjectDto.java
package com.testcase.testcasemanagement.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ProjectDto {
    private String id;
    private String name;
    private String description;
    private Integer displayOrder;
    private String createdAt;
    private String updatedAt;
}
