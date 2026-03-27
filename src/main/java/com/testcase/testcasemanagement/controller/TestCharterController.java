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

  @PostMapping("/charters")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
  public ResponseEntity<TestCharterResponseDto> createCharter(
      @Valid @RequestBody TestCharterRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(testCharterService.createCharter(request));
  }

  @GetMapping("/projects/{projectId}/charters")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
  public ResponseEntity<List<TestCharterResponseDto>> getProjectCharters(
      @PathVariable String projectId) {
    return ResponseEntity.ok(testCharterService.getProjectCharters(projectId));
  }

  @GetMapping("/charters/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
  public ResponseEntity<TestCharterResponseDto> getCharter(@PathVariable String id) {
    return ResponseEntity.ok(testCharterService.getCharter(id));
  }

  @PutMapping("/charters/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
  public ResponseEntity<TestCharterResponseDto> updateCharter(
      @PathVariable String id, @RequestBody TestCharterRequestDto request) {
    return ResponseEntity.ok(testCharterService.updateCharter(id, request));
  }
}
