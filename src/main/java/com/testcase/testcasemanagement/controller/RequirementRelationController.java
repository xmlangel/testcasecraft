package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.requirement.RequirementRelationEdge;
import com.testcase.testcasemanagement.dto.requirement.RequirementRelationRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementRelationResponse;
import com.testcase.testcasemanagement.service.RequirementRelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 요구사항 사이의 관계 API. 인가는 서비스에서 프로젝트 단위로 판정한다. */
@Tag(name = "Requirement", description = "요구사항 문서·요구사항·TC 연결·커버리지·리포트")
@RestController
@RequestMapping("/api")
public class RequirementRelationController {

  private final RequirementRelationService relationService;

  public RequirementRelationController(RequirementRelationService relationService) {
    this.relationService = relationService;
  }

  @Operation(summary = "요구사항의 관계 목록")
  @GetMapping("/requirements/{id}/relations")
  public List<RequirementRelationResponse> getRelations(@PathVariable String id) {
    return relationService.getRelations(id);
  }

  @Operation(summary = "프로젝트의 요구사항 관계 전체(관계도용)")
  @GetMapping("/projects/{projectId}/requirement-relations")
  public List<RequirementRelationEdge> getProjectRelations(@PathVariable String projectId) {
    return relationService.getProjectRelations(projectId);
  }

  @Operation(summary = "요구사항 관계 추가", description = "경로의 요구사항이 source, 본문의 targetId 가 target 이다.")
  @PostMapping("/requirements/{id}/relations")
  public List<RequirementRelationResponse> addRelation(
      @PathVariable String id, @Valid @RequestBody RequirementRelationRequest request) {
    return relationService.addRelation(id, request.targetId(), request.type());
  }

  @Operation(summary = "요구사항 관계 삭제")
  @DeleteMapping("/requirement-relations/{relationId}")
  public ResponseEntity<Void> deleteRelation(@PathVariable String relationId) {
    relationService.deleteRelation(relationId);
    return ResponseEntity.noContent().build();
  }
}
