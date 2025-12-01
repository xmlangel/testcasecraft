package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestResultAttachmentDto;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.service.FileStorageService;
import com.testcase.testcasemanagement.service.I18nService;
import com.testcase.testcasemanagement.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ICT-361: 테스트 결과 첨부파일 관리 API 컨트롤러 (MinIO + i18n)
 */
@Slf4j
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@Tag(name = "Test Result - Attachments", description = "테스트 결과 첨부파일 관리 API")
public class TestResultAttachmentController {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final I18nService i18nService;

    private static final String DEFAULT_LANG = "ko";

    /**
     * 파일 업로드
     */
    @PostMapping("/upload/{testResultId}")
    @Operation(summary = "파일 업로드", description = "테스트 결과에 파일을 첨부합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "업로드 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (파일 검증 실패)"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "테스트 결과를 찾을 수 없음"),
            @ApiResponse(responseCode = "413", description = "파일 크기 초과"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<?> uploadFile(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @Parameter(description = "업로드할 파일") @RequestParam("file") MultipartFile file,
            @Parameter(description = "파일 설명 (선택사항)") @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 현재 사용자 조회
            User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse(
                                i18nService.getTranslation("attachment.error.auth.failed", DEFAULT_LANG)));
            }

            // 파일 업로드
            TestResultAttachmentDto attachmentDto = fileStorageService.uploadFile(
                    testResultId, file, currentUser, description);

            log.info("파일 업로드 성공: {} by {}", file.getOriginalFilename(), currentUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", i18nService.getTranslation("attachment.success.upload", DEFAULT_LANG));
            response.put("attachment", attachmentDto);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("파일 업로드 검증 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));

        } catch (IOException e) {
            log.error("파일 업로드 중 IO 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(i18nService.getTranslation("attachment.error.upload.io", DEFAULT_LANG)));

        } catch (Exception e) {
            log.error("파일 업로드 중 예상치 못한 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.upload.general", DEFAULT_LANG)));
        }
    }

    /**
     * 테스트 결과별 첨부파일 목록 조회
     */
    @GetMapping("/testresult/{testResultId}")
    @Operation(summary = "첨부파일 목록 조회", description = "특정 테스트 결과의 첨부파일 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "테스트 결과를 찾을 수 없음")
    })
    public ResponseEntity<?> getAttachmentsByTestResult(
            @Parameter(description = "테스트 결과 ID") @PathVariable String testResultId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            List<TestResultAttachmentDto> attachments = fileStorageService.getAttachmentsByTestResultId(testResultId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachments", attachments);
            response.put("count", attachments.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("첨부파일 목록 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.list.failed", DEFAULT_LANG)));
        }
    }

    /**
     * 파일 다운로드
     */
    @GetMapping("/{attachmentId}/download")
    @Operation(summary = "파일 다운로드", description = "첨부파일을 다운로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "다운로드 성공", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "첨부파일 ID") @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 첨부파일 정보 조회
            TestResultAttachmentDto attachmentInfo = fileStorageService.getAttachmentInfo(attachmentId);

            // 파일 리소스 로드
            Resource resource = fileStorageService.loadFileAsResource(attachmentId);

            // 파일 다운로드 응답 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + attachmentInfo.getOriginalFileName() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE,
                    attachmentInfo.getMimeType() != null ? attachmentInfo.getMimeType()
                            : MediaType.APPLICATION_OCTET_STREAM_VALUE);
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(attachmentInfo.getFileSize()));

            log.info("파일 다운로드: {} by {}", attachmentInfo.getOriginalFileName(), userDetails.getUsername());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (IllegalArgumentException e) {
            log.warn("파일 다운로드 요청 오류: {}", e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (IOException e) {
            log.error("파일 다운로드 중 IO 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

        } catch (Exception e) {
            log.error("파일 다운로드 중 예상치 못한 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 첨부파일 정보 조회
     */
    @GetMapping("/{attachmentId}")
    @Operation(summary = "첨부파일 정보 조회", description = "첨부파일의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음")
    })
    public ResponseEntity<?> getAttachmentInfo(
            @Parameter(description = "첨부파일 ID") @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            TestResultAttachmentDto attachmentInfo = fileStorageService.getAttachmentInfo(attachmentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachment", attachmentInfo);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("첨부파일 정보 조회 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(i18nService.getTranslation("attachment.error.notfound", DEFAULT_LANG)));

        } catch (Exception e) {
            log.error("첨부파일 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.info.failed", DEFAULT_LANG)));
        }
    }

    /**
     * 첨부파일 삭제
     */
    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "첨부파일 삭제", description = "첨부파일을 삭제합니다. (논리적 삭제)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<?> deleteAttachment(
            @Parameter(description = "첨부파일 ID") @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 현재 사용자 조회
            User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse(
                                i18nService.getTranslation("attachment.error.auth.failed", DEFAULT_LANG)));
            }

            // 파일 삭제
            fileStorageService.deleteAttachment(attachmentId, currentUser);

            log.info("첨부파일 삭제 완료: {} by {}", attachmentId, currentUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", i18nService.getTranslation("attachment.success.delete", DEFAULT_LANG));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("첨부파일 삭제 요청 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(i18nService.getTranslation("attachment.error.notfound", DEFAULT_LANG)));

        } catch (Exception e) {
            log.error("첨부파일 삭제 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.delete.failed", DEFAULT_LANG)));
        }
    }

    /**
     * 사용자별 첨부파일 목록 조회
     */
    @GetMapping("/user/my")
    @Operation(summary = "내 첨부파일 목록", description = "현재 사용자가 업로드한 첨부파일 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<?> getMyAttachments(@AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 현재 사용자 조회
            User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse(
                                i18nService.getTranslation("attachment.error.auth.failed", DEFAULT_LANG)));
            }

            List<TestResultAttachmentDto> attachments = fileStorageService.getAttachmentsByUser(currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachments", attachments);
            response.put("count", attachments.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("사용자 첨부파일 목록 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.list.failed", DEFAULT_LANG)));
        }
    }

    /**
     * 첨부파일 미리보기 (스트리밍 방식)
     */
    @GetMapping("/{attachmentId}/preview")
    @Operation(summary = "파일 미리보기", description = "첨부파일을 스트리밍 방식으로 미리보기합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "미리보기 성공", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Resource> previewFile(
            @Parameter(description = "첨부파일 ID") @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 첨부파일 정보 조회
            TestResultAttachmentDto attachmentInfo = fileStorageService.getAttachmentInfo(attachmentId);

            // 파일 리소스 로드
            Resource resource = fileStorageService.loadFileAsResource(attachmentId);

            // 미리보기 응답 헤더 설정 (다운로드가 아닌 인라인 표시)
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + attachmentInfo.getOriginalFileName() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE,
                    attachmentInfo.getMimeType() != null ? attachmentInfo.getMimeType()
                            : MediaType.APPLICATION_OCTET_STREAM_VALUE);
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(attachmentInfo.getFileSize()));

            // CORS 헤더 추가 (iframe에서 접근 가능하도록)
            headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
            headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET");

            log.info("파일 미리보기: {} by {}", attachmentInfo.getOriginalFileName(), userDetails.getUsername());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (IllegalArgumentException e) {
            log.warn("파일 미리보기 요청 오류: {}", e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (IOException e) {
            log.error("파일 미리보기 중 IO 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

        } catch (Exception e) {
            log.error("파일 미리보기 중 예상치 못한 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 스토리지 정보 조회 (관리자용)
     */
    @GetMapping("/admin/storage-info")
    @Operation(summary = "스토리지 정보 조회", description = "파일 스토리지 사용 현황을 조회합니다. (관리자 전용)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    public ResponseEntity<?> getStorageInfo(@AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 로그인된 사용자면 조회 가능

            FileStorageService.StorageInfo storageInfo = fileStorageService.getStorageInfo();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("storageInfo", storageInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("스토리지 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(
                            i18nService.getTranslation("attachment.error.storage.failed", DEFAULT_LANG)));
        }
    }

    /**
     * 에러 응답 생성 헬퍼 메서드
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}