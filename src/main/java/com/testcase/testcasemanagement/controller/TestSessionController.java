package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestSessionPauseRequestDto;
import com.testcase.testcasemanagement.dto.TestSessionRequestDto;
import com.testcase.testcasemanagement.dto.TestSessionResponseDto;
import com.testcase.testcasemanagement.dto.TestSessionReviewRequestDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.TestSession;
import com.testcase.testcasemanagement.service.TestSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestSessionController {

    @Autowired
    private TestSessionService testSessionService;

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> createSession(
            @Valid @RequestBody TestSessionRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testSessionService.createSession(request));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> getSession(@PathVariable String id) {
        return ResponseEntity.ok(testSessionService.getSession(id));
    }

    @PutMapping("/sessions/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> updateSession(
            @PathVariable String id,
            @Valid @RequestBody TestSessionRequestDto request) {
        return ResponseEntity.ok(testSessionService.updateSession(id, request));
    }

    @PostMapping("/sessions/{id}/start")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> startSession(@PathVariable String id) {
        return ResponseEntity.ok(testSessionService.startSession(id));
    }

    @PostMapping("/sessions/{id}/pause")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> pauseSession(
            @PathVariable String id,
            @RequestBody(required = false) TestSessionPauseRequestDto request) {
        String reason = request == null ? null : request.getReason();
        return ResponseEntity.ok(testSessionService.pauseSession(id, reason));
    }

    @PostMapping("/sessions/{id}/resume")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> resumeSession(@PathVariable String id) {
        return ResponseEntity.ok(testSessionService.resumeSession(id));
    }

    @PostMapping("/sessions/{id}/end")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> endSession(@PathVariable String id) {
        return ResponseEntity.ok(testSessionService.endSession(id));
    }

    @PostMapping("/sessions/{id}/submit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<TestSessionResponseDto> submitSession(@PathVariable String id) {
        return ResponseEntity.ok(testSessionService.submitSession(id));
    }

    @PostMapping("/sessions/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<TestSessionResponseDto> approveSession(
            @PathVariable String id,
            @RequestBody(required = false) TestSessionReviewRequestDto request) {
        String comment = request == null ? null : request.getComment();
        return ResponseEntity.ok(testSessionService.approveSession(id, comment));
    }

    @PostMapping("/sessions/{id}/request-update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<TestSessionResponseDto> requestUpdate(
            @PathVariable String id,
            @RequestBody(required = false) TestSessionReviewRequestDto request) {
        String comment = request == null ? null : request.getComment();
        return ResponseEntity.ok(testSessionService.requestUpdate(id, comment));
    }

    @GetMapping("/projects/{projectId}/sessions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<List<TestSessionResponseDto>> listByProject(
            @PathVariable String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String testerId,
            @RequestParam(required = false) String charterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(testSessionService.listByProject(
                projectId,
                parseStatus(status),
                from,
                to,
                testerId,
                charterId,
                page,
                size,
                sort
        ));
    }

    private TestSession.SessionStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return TestSession.SessionStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResourceNotValidException(
                    "유효하지 않은 status 값입니다: " + status,
                    Map.of("status", status)
            );
        }
    }
}
