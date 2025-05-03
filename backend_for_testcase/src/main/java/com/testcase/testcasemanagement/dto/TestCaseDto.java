package com.testcase.testcasemanagement.dto;

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
    private String name;
    private String type;
    private String description;
    private String parentId = ""; // 기본값을 빈 문자열로 설정
    private List<TestStepDto> steps = new ArrayList<>();
    private String expectedResults;
    private String createdAt;
    private String updatedAt;
    private List<TestCaseDto> children = new ArrayList<>(); // 트리 구조용 필드 추가
    private int displayNumber;
    private String projectId; // ★ 프로젝트 종속성 필수 필드 추가
}
