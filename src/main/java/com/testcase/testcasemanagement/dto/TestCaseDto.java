// src/main/java/com/testcase/testcasemanagement/dto/TestCaseDto.java

package com.testcase.testcasemanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TestCaseDto {
  private String id;

  // ICT-339: 순차 ID 필드 추가
  private Integer sequentialId;

  // ICT-341: 프로젝트코드-넘버 형식의 표시 ID 추가
  private String displayId;

  @NotBlank(message = "name is required.")
  @Size(max = 200, message = "name must be 200 characters or fewer.")
  private String name;

  @Size(max = 20, message = "type must be 20 characters or fewer.")
  private String type;

  @Size(max = 10000, message = "description must be 10,000 characters or fewer.")
  private String description;

  @Size(max = 10000, message = "preCondition must be 10,000 characters or fewer.")
  private String preCondition;

  @Size(max = 10000, message = "postCondition must be 10,000 characters or fewer.")
  private String postCondition;

  private Boolean isAutomated;

  @Size(max = 50, message = "executionType must be 50 characters or fewer.")
  private String executionType;

  @Size(max = 10000, message = "testTechnique must be 10,000 characters or fewer.")
  private String testTechnique;

  private String parentId;

  @Valid
  @Size(max = 100, message = "steps can have at most 100 items.")
  private List<TestStepDto> steps = new ArrayList<>();

  @Size(max = 10000, message = "expectedResults must be 10,000 characters or fewer.")
  private String expectedResults;

  @Size(max = 30, message = "createdAt must be 30 characters or fewer.")
  private String createdAt;

  @Size(max = 30, message = "updatedAt must be 30 characters or fewer.")
  private String updatedAt;

  // 작성자 정보
  @Size(max = 100, message = "createdBy must be 100 characters or fewer.")
  private String createdBy;

  // 수정자 정보
  @Size(max = 100, message = "updatedBy must be 100 characters or fewer.")
  private String updatedBy;

  @Valid
  @Size(max = 100, message = "children can have at most 100 items.")
  private List<TestCaseDto> children = new ArrayList<>();

  private Integer displayOrder;

  private int displayNumber;

  @NotBlank(message = "projectId is required.")
  @Size(max = 36, message = "projectId must be 36 characters or fewer.")
  private String projectId;

  private String parentName;

  private String priority;

  // 태그 목록
  @Size(max = 50, message = "tags can have at most 50 items.")
  private List<String> tags = new ArrayList<>();

  // ICT-388: RAG 벡터화 상태 (true: 벡터화됨, false: 벡터화 안 됨)
  private Boolean ragVectorized;

  // 연결된 RAG 문서 ID 목록
  @Size(max = 50, message = "linkedDocumentIds can have at most 50 items.")
  private List<String> linkedDocumentIds = new ArrayList<>();

  // 연결된 (수동) 테스트케이스 ID 목록
  // 기본값 null: 필드를 생략한 PUT(MCP/bulk/sheet-import)이 기존 링크를 전삭제하지 않도록 —
  // 매퍼가 null이면 미변경, []이면 전체 비움(명시적 clear)으로 구분한다.
  @Size(max = 50, message = "linkedTestCaseIds can have at most 50 items.")
  private List<String> linkedTestCaseIds = null;

  // 연결된 JUnit 자동화 케이스 ID 목록 (동일 규칙: null=미변경, []=명시적 clear)
  @Size(max = 50, message = "linkedJunitTestCaseIds can have at most 50 items.")
  private List<String> linkedJunitTestCaseIds = null;

  private Long version;
}
