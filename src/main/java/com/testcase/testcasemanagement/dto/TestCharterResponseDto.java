package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCharterResponseDto {
    private String id;
    private String projectId;
    private String title;
    private String mission;
    private String areas;
    private String tags;
    private String createdBy;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
