// src/main/java/com/testcase/testcasemanagement/controller/TestResultEditController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestResultEditDto;
import com.testcase.testcasemanagement.service.TestResultEditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.testcase.testcasemanagement.model.TestResultEdit;

/**
 * ICT-209: 테스트 결과 편집 컨트롤러
 * 테스트 결과 편집 기능을 위한 REST API 엔드포인트
 */
@Tag(name = "Test Result - Editing", description = "테스트 결과 수정 API")
@Slf4j
@RestController
@RequestMapping("/api/test-results/edits")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TestResultEditController {

    private final TestResultEditService editService;

    /**
     * 새로운 편집본 생성
     */
    @Operation(summary = "새로운 편집본 생성", description = "기존 테스트 결과에 대한 새로운 편집본(Draft)을 생성합니다.")
    @PostMapping
    public ResponseEntity<TestResultEditDto> createEdit(
            @Valid @RequestBody TestResultEditDto.CreateEditRequestDto request,
            Authentication authentication) {

        log.info("Creating edit for test result: {} by user: {}",
                request.getOriginalTestResultId(), authentication.getName());

        try {
            String currentUserId = getCurrentUserId(authentication);
            TestResultEditDto edit = editService.createEdit(request, currentUserId);

            return ResponseEntity.status(HttpStatus.CREATED).body(edit);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for creating edit: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to create edit", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 수정 (DRAFT 상태만 가능)
     */
    @Operation(summary = "편집본 수정", description = "작성 중인 편집본(Draft)을 수정합니다.")
    @PutMapping("/{editId}")
    public ResponseEntity<TestResultEditDto> updateEdit(
            @PathVariable String editId,
            @Valid @RequestBody TestResultEditDto.CreateEditRequestDto request,
            Authentication authentication) {

        log.info("Updating edit: {} by user: {}", editId, authentication.getName());

        try {
            String currentUserId = getCurrentUserId(authentication);
            TestResultEditDto edit = editService.updateEdit(editId, request, currentUserId);

            return ResponseEntity.ok(edit);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for updating edit: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to update edit: {}", editId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 승인/거부
     */
    @Operation(summary = "편집본 승인/거부", description = "제출된 편집본을 승인하거나 거부합니다.")
    @PostMapping("/{editId}/approval")
    public ResponseEntity<TestResultEditDto> processEditApproval(
            @PathVariable String editId,
            @Valid @RequestBody TestResultEditDto.EditApprovalRequestDto request,
            Authentication authentication) {

        log.info("Processing approval for edit: {} by user: {}", editId, authentication.getName());

        try {
            String approverId = getCurrentUserId(authentication);
            request.setEditId(editId); // 경로 파라미터로 editId 설정
            TestResultEditDto edit = editService.processEditApproval(request, approverId);

            return ResponseEntity.ok(edit);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for edit approval: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to process edit approval: {}", editId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 적용 (승인된 편집본을 활성화)
     */
    @Operation(summary = "편집본 적용", description = "승인된 편집본을 실제 테스트 결과에 적용합니다.")
    @PostMapping("/{editId}/apply")
    public ResponseEntity<TestResultEditDto.EditApplicationResultDto> applyEdit(
            @PathVariable String editId,
            Authentication authentication) {

        log.info("Applying edit: {} by user: {}", editId, authentication.getName());

        try {
            String applierId = getCurrentUserId(authentication);
            TestResultEditDto.EditApplicationResultDto result = editService.applyEdit(editId, applierId);

            if (result.getSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for applying edit: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to apply edit: {}", editId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 되돌리기
     */
    @Operation(summary = "편집본 되돌리기", description = "적용된 편집본을 이전 상태로 되돌립니다.")
    @PostMapping("/{editId}/revert")
    public ResponseEntity<TestResultEditDto> revertEdit(
            @PathVariable String editId,
            Authentication authentication) {

        log.info("Reverting edit: {} by user: {}", editId, authentication.getName());

        try {
            String userId = getCurrentUserId(authentication);
            TestResultEditDto edit = editService.revertEdit(editId, userId);

            return ResponseEntity.ok(edit);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for reverting edit: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to revert edit: {}", editId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 삭제 (DRAFT 상태만 가능)
     */
    @Operation(summary = "편집본 삭제", description = "작성 중인 편집본(Draft)을 삭제합니다.")
    @DeleteMapping("/{editId}")
    public ResponseEntity<Void> deleteEdit(
            @PathVariable String editId,
            Authentication authentication) {

        log.info("Deleting edit: {} by user: {}", editId, authentication.getName());

        try {
            String userId = getCurrentUserId(authentication);
            editService.deleteEdit(editId, userId);

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for deleting edit: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Failed to delete edit: {}", editId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집본 목록 조회 (필터링 지원)
     */
    @Operation(summary = "편집본 목록 조회", description = "다양한 필터 조건으로 편집본 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<TestResultEditDto>> getEdits(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String testExecutionId,
            @RequestParam(required = false) String editedByUserId,
            @RequestParam(required = false) String editStatus,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.debug("Getting edits with filters - projectId: {}, executionId: {}, page: {}",
                projectId, testExecutionId, page);

        try {
            TestResultEditDto.EditFilterDto filter = TestResultEditDto.EditFilterDto.builder()
                    .projectId(projectId)
                    .testExecutionId(testExecutionId)
                    .editedByUserId(editedByUserId)
                    .editStatus(editStatus != null ? TestResultEdit.EditStatus.valueOf(editStatus) : null)
                    .activeOnly(activeOnly)
                    .fromDate(fromDate != null ? LocalDateTime.parse(fromDate) : null)
                    .toDate(toDate != null ? LocalDateTime.parse(toDate) : null)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<TestResultEditDto> edits = editService.getEdits(filter);
            return ResponseEntity.ok(edits);

        } catch (Exception e) {
            log.error("Failed to get edits", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 특정 테스트 결과의 편집 이력 조회
     */
    @Operation(summary = "특정 테스트 결과의 편집 이력 조회", description = "특정 테스트 결과에 대한 모든 편집 이력을 조회합니다.")
    @GetMapping("/test-result/{testResultId}/history")
    public ResponseEntity<List<TestResultEditDto>> getEditHistory(
            @PathVariable String testResultId) {

        log.debug("Getting edit history for test result: {}", testResultId);

        try {
            List<TestResultEditDto> history = editService.getEditHistory(testResultId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Failed to get edit history for test result: {}", testResultId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 특정 테스트 결과의 활성 편집본 조회
     */
    @Operation(summary = "특정 테스트 결과의 활성 편집본 조회", description = "특정 테스트 결과의 현재 진행 중인 편집본을 조회합니다.")
    @GetMapping("/test-result/{testResultId}/active")
    public ResponseEntity<TestResultEditDto> getActiveEdit(
            @PathVariable String testResultId) {

        log.debug("Getting active edit for test result: {}", testResultId);

        try {
            Optional<TestResultEditDto> activeEdit = editService.getActiveEdit(testResultId);

            if (activeEdit.isPresent()) {
                return ResponseEntity.ok(activeEdit.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Failed to get active edit for test result: {}", testResultId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집 통계 조회
     */
    @Operation(summary = "편집 통계 조회", description = "사용자의 편집 활동 통계를 조회합니다.")
    @GetMapping("/statistics")
    public ResponseEntity<TestResultEditDto.EditStatisticsDto> getEditStatistics(
            Authentication authentication) {

        log.debug("Getting edit statistics for user: {}", authentication.getName());

        try {
            String userId = getCurrentUserId(authentication);
            TestResultEditDto.EditStatisticsDto statistics = editService.getEditStatistics(userId);

            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Failed to get edit statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 승인 대기 중인 편집본 목록 조회 (관리자/승인권한자용)
     */
    @Operation(summary = "승인 대기 목록 조회", description = "승인이 필요한 편집본 목록을 조회합니다.")
    @GetMapping("/pending-approvals")
    public ResponseEntity<Page<TestResultEditDto>> getPendingApprovals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.debug("Getting pending approvals for user: {}", authentication.getName());

        try {
            String currentUserId = getCurrentUserId(authentication);

            TestResultEditDto.EditFilterDto filter = TestResultEditDto.EditFilterDto.builder()
                    .editStatus(TestResultEdit.EditStatus.PENDING)
                    .page(page)
                    .size(size)
                    .sortBy("createdAt")
                    .sortDirection("ASC")
                    .build();

            Page<TestResultEditDto> pendingEdits = editService.getEdits(filter);

            // 자신의 편집본은 제외 (자가 승인 방지)
            Page<TestResultEditDto> filteredEdits = pendingEdits
                    .map(edit -> edit.getEditedByUserId().equals(currentUserId) ? null : edit)
                    .map(edit -> edit);

            return ResponseEntity.ok(filteredEdits);

        } catch (Exception e) {
            log.error("Failed to get pending approvals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 사용자별 편집본 목록 조회
     */
    @Operation(summary = "내 편집본 목록 조회", description = "내가 작성한 편집본 목록을 조회합니다.")
    @GetMapping("/my-edits")
    public ResponseEntity<Page<TestResultEditDto>> getMyEdits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String editStatus,
            Authentication authentication) {

        log.debug("Getting my edits for user: {}", authentication.getName());

        try {
            String userId = getCurrentUserId(authentication);

            TestResultEditDto.EditFilterDto filter = TestResultEditDto.EditFilterDto.builder()
                    .editedByUserId(userId)
                    .editStatus(editStatus != null ? TestResultEdit.EditStatus.valueOf(editStatus) : null)
                    .page(page)
                    .size(size)
                    .sortBy("createdAt")
                    .sortDirection("DESC")
                    .build();

            Page<TestResultEditDto> myEdits = editService.getEdits(filter);
            return ResponseEntity.ok(myEdits);

        } catch (Exception e) {
            log.error("Failed to get my edits", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 편집 상태 정보 조회 (프론트엔드 UI용)
     */
    @Operation(summary = "편집 상태 정보 조회", description = "편집 상태 코드 및 권한 정보를 조회합니다.")
    @GetMapping("/status-info")
    public ResponseEntity<Map<String, Object>> getEditStatusInfo() {

        try {
            Map<String, Object> statusInfo = Map.of(
                    "editStatuses", Arrays.asList(TestResultEdit.EditStatus.values()),
                    "editStatusDescriptions", Map.of(
                            "DRAFT", "임시저장 - 편집 중인 상태",
                            "PENDING", "승인 대기 - 검토 요청됨",
                            "APPROVED", "승인됨 - 적용 가능",
                            "APPLIED", "적용됨 - 현재 활성",
                            "REJECTED", "거부됨 - 수정 필요",
                            "REVERTED", "되돌림 - 이전 상태로 복원"),
                    "permissions", Map.of(
                            "canCreate", true,
                            "canEdit", "작성자만 가능 (DRAFT 상태)",
                            "canApprove", "다른 사용자의 편집본만 승인 가능",
                            "canApply", "승인된 편집본만 적용 가능",
                            "canRevert", "적용된 편집본만 되돌리기 가능",
                            "canDelete", "작성자만 가능 (DRAFT 상태)"));

            return ResponseEntity.ok(statusInfo);

        } catch (Exception e) {
            log.error("Failed to get edit status info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 인증 정보에서 사용자 ID 추출
     */
    private String getCurrentUserId(Authentication authentication) {
        // 실제 구현에서는 JWT 토큰이나 세션에서 사용자 ID를 추출
        // 현재는 사용자명을 ID로 사용 (임시)
        return authentication.getName();
    }
}