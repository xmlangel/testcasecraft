package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestCharterRequestDto;
import com.testcase.testcasemanagement.dto.TestCharterResponseDto;
import com.testcase.testcasemanagement.service.TestCharterService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestCharterController {

  @Autowired private TestCharterService testCharterService;

  // ICT-444: 대상 프로젝트에서 세션을 진행할 수 있는 사람만 차터를 만든다(화면의 차터 생성 버튼과 같은 기준).
  // 이전에는 시스템 역할만 봐서 아무 프로젝트에나 차터를 만들 수 있었다.
  @PostMapping("/charters")
  @PreAuthorize("@projectSecurityService.canRunTestSession(#request.projectId)")
  public ResponseEntity<TestCharterResponseDto> createCharter(
      @Valid @RequestBody TestCharterRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(testCharterService.createCharter(request));
  }

  @GetMapping("/projects/{projectId}/charters")
  @PreAuthorize(
      "(hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER'))"
          + " and @projectSecurityService.canAccessProject(#projectId)")
  public ResponseEntity<List<TestCharterResponseDto>> getProjectCharters(
      @PathVariable String projectId) {
    return ResponseEntity.ok(testCharterService.getProjectCharters(projectId));
  }

  @GetMapping("/charters/{id}")
  @PreAuthorize(
      "(hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER'))"
          + " and @projectSecurityService.canAccessTestCharter(#id)")
  public ResponseEntity<TestCharterResponseDto> getCharter(@PathVariable String id) {
    return ResponseEntity.ok(testCharterService.getCharter(id));
  }

  // ICT-444: 시스템 역할에 더해 차터가 속한 프로젝트의 진행 권한을 본다. 이전에는 시스템 MANAGER 가 소속되지 않은
  // 프로젝트의 차터도 고칠 수 있었다.
  @PutMapping("/charters/{id}")
  @PreAuthorize(
      "(hasRole('ADMIN') or hasRole('MANAGER')) and @projectSecurityService.canEditCharter(#id)")
  public ResponseEntity<TestCharterResponseDto> updateCharter(
      @PathVariable String id, @RequestBody TestCharterRequestDto request) {
    return ResponseEntity.ok(testCharterService.updateCharter(id, request));
  }
}
