package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.JiraBatchProcessingService;
import com.testcase.testcasemanagement.service.JiraBatchProcessingService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * JIRA 배치 처리 API 컨트롤러
 * ICT-165: 배치 처리 최적화 REST API
 */
@Tag(name = "JIRA - Batch Operations", description = "JIRA 배치 작업 API")
@RestController
@RequestMapping("/api/jira/batch")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "jira.batch-processing.enabled", havingValue = "true", matchIfMissing = false)
public class JiraBatchController {

    private final JiraBatchProcessingService batchProcessingService;

    /**
     * 여러 JIRA 이슈에 배치 코멘트 추가
     */
    @Operation(summary = "배치 코멘트 추가", description = "여러 JIRA 이슈에 코멘트를 일괄 추가합니다.")
    @PostMapping("/comments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> batchAddComments(
            Authentication authentication,
            @Valid @RequestBody BatchCommentRequestDto request) {

        try {
            String userId = authentication.getName();
            log.info("배치 코멘트 요청: userId={}, 요청수={}", userId, request.getComments().size());

            List<BatchCommentRequest> batchRequests = request.getComments().stream()
                    .map(dto -> new BatchCommentRequest(dto.getIssueKey(), dto.getComment()))
                    .toList();

            BatchOperationResult result = batchProcessingService.batchAddComments(userId, batchRequests);

            if (result.isSuccess()) {
                return ResponseEntity.ok(BatchResponseDto.success(
                        result.getOperationId(),
                        "배치 코멘트 추가 완료",
                        result.getResults(),
                        result.getSuccessCount(),
                        result.getFailureCount()));
            } else {
                return ResponseEntity.badRequest().body(BatchResponseDto.error(
                        result.getOperationId(),
                        result.getErrorMessage()));
            }

        } catch (Exception e) {
            log.error("배치 코멘트 추가 API 오류: userId={}", authentication.getName(), e);
            return ResponseEntity.internalServerError().body(BatchResponseDto.error(
                    null, "배치 처리 중 서버 오류가 발생했습니다."));
        }
    }

    /**
     * 여러 사용자의 JIRA 프로젝트를 배치 조회 (관리자용)
     */
    @Operation(summary = "배치 프로젝트 조회", description = "여러 사용자의 JIRA 프로젝트 목록을 일괄 조회합니다. (관리자 전용)")
    @PostMapping("/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> batchGetProjects(@Valid @RequestBody BatchProjectRequestDto request) {

        try {
            log.info("배치 프로젝트 조회 요청: 사용자수={}", request.getUserIds().size());

            BatchOperationResult result = batchProcessingService.batchGetProjects(request.getUserIds());

            if (result.isSuccess()) {
                return ResponseEntity.ok(BatchResponseDto.success(
                        result.getOperationId(),
                        "배치 프로젝트 조회 완료",
                        result.getResults(),
                        result.getSuccessCount(),
                        result.getFailureCount()));
            } else {
                return ResponseEntity.badRequest().body(BatchResponseDto.error(
                        result.getOperationId(),
                        result.getErrorMessage()));
            }

        } catch (Exception e) {
            log.error("배치 프로젝트 조회 API 오류", e);
            return ResponseEntity.internalServerError().body(BatchResponseDto.error(
                    null, "배치 처리 중 서버 오류가 발생했습니다."));
        }
    }

    /**
     * 여러 JIRA 설정의 연결 상태 배치 테스트 (관리자용)
     */
    @Operation(summary = "배치 연결 테스트", description = "여러 JIRA 설정의 연결 상태를 일괄 테스트합니다. (관리자 전용)")
    @PostMapping("/connection-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> batchTestConnections(@Valid @RequestBody BatchConnectionTestRequestDto request) {

        try {
            log.info("배치 연결 테스트 요청: 설정수={}", request.getConfigIds().size());

            BatchOperationResult result = batchProcessingService.batchTestConnections(request.getConfigIds());

            if (result.isSuccess()) {
                return ResponseEntity.ok(BatchResponseDto.success(
                        result.getOperationId(),
                        "배치 연결 테스트 완료",
                        result.getResults(),
                        result.getSuccessCount(),
                        result.getFailureCount()));
            } else {
                return ResponseEntity.badRequest().body(BatchResponseDto.error(
                        result.getOperationId(),
                        result.getErrorMessage()));
            }

        } catch (Exception e) {
            log.error("배치 연결 테스트 API 오류", e);
            return ResponseEntity.internalServerError().body(BatchResponseDto.error(
                    null, "배치 처리 중 서버 오류가 발생했습니다."));
        }
    }

    /**
     * 배치 작업 통계 조회
     */
    @Operation(summary = "배치 작업 통계 조회", description = "JIRA 배치 작업의 실행 통계를 조회합니다. (관리자 전용)")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBatchOperationStats() {

        try {
            Map<String, BatchOperationStats> stats = batchProcessingService.getBatchOperationStats();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "배치 작업 통계 조회 성공",
                    "data", stats,
                    "totalOperations", stats.size()));

        } catch (Exception e) {
            log.error("배치 작업 통계 조회 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "통계 조회 중 서버 오류가 발생했습니다."));
        }
    }

    /**
     * 오래된 배치 작업 통계 정리 (관리자용)
     */
    @Operation(summary = "오래된 통계 정리", description = "오래된 배치 작업 통계 데이터를 정리합니다. (관리자 전용)")
    @DeleteMapping("/stats/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cleanupOldStats() {

        try {
            batchProcessingService.cleanupOldStats();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "오래된 배치 작업 통계 정리 완료"));

        } catch (Exception e) {
            log.error("배치 통계 정리 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "통계 정리 중 서버 오류가 발생했습니다."));
        }
    }

    // Request/Response DTOs

    public static class BatchCommentRequestDto {
        @NotEmpty(message = "코멘트 목록이 비어있습니다")
        private List<@Valid CommentDto> comments;

        public List<CommentDto> getComments() {
            return comments;
        }

        public void setComments(List<CommentDto> comments) {
            this.comments = comments;
        }

        public static class CommentDto {
            @NotNull(message = "이슈 키는 필수입니다")
            private String issueKey;

            @NotNull(message = "코멘트 내용은 필수입니다")
            private String comment;

            public String getIssueKey() {
                return issueKey;
            }

            public void setIssueKey(String issueKey) {
                this.issueKey = issueKey;
            }

            public String getComment() {
                return comment;
            }

            public void setComment(String comment) {
                this.comment = comment;
            }
        }
    }

    public static class BatchProjectRequestDto {
        @NotEmpty(message = "사용자 ID 목록이 비어있습니다")
        private List<@NotNull String> userIds;

        public List<String> getUserIds() {
            return userIds;
        }

        public void setUserIds(List<String> userIds) {
            this.userIds = userIds;
        }
    }

    public static class BatchConnectionTestRequestDto {
        @NotEmpty(message = "설정 ID 목록이 비어있습니다")
        private List<@NotNull String> configIds;

        public List<String> getConfigIds() {
            return configIds;
        }

        public void setConfigIds(List<String> configIds) {
            this.configIds = configIds;
        }
    }

    public static class BatchResponseDto {
        private boolean success;
        private String operationId;
        private String message;
        private Object data;
        private Integer successCount;
        private Integer failureCount;

        private BatchResponseDto(boolean success, String operationId, String message,
                Object data, Integer successCount, Integer failureCount) {
            this.success = success;
            this.operationId = operationId;
            this.message = message;
            this.data = data;
            this.successCount = successCount;
            this.failureCount = failureCount;
        }

        public static BatchResponseDto success(String operationId, String message, Object data,
                int successCount, int failureCount) {
            return new BatchResponseDto(true, operationId, message, data, successCount, failureCount);
        }

        public static BatchResponseDto error(String operationId, String message) {
            return new BatchResponseDto(false, operationId, message, null, null, null);
        }

        // Getters
        public boolean isSuccess() {
            return success;
        }

        public String getOperationId() {
            return operationId;
        }

        public String getMessage() {
            return message;
        }

        public Object getData() {
            return data;
        }

        public Integer getSuccessCount() {
            return successCount;
        }

        public Integer getFailureCount() {
            return failureCount;
        }
    }
}