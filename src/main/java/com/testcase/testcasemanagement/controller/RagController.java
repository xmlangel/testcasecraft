package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequestStatus;
import com.testcase.testcasemanagement.service.RagGlobalDocumentRequestService;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.service.TestCaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * RAG API 클라이언트 컨트롤러
 *
 * Spring Boot Backend에서 RAG FastAPI 서비스를 호출하기 위한 REST 엔드포인트를 제공합니다.
 */
@Tag(name = "RAG - Document Management", description = "RAG 문서 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {

    private final RagService ragService;
    private final TestCaseService testCaseService;
    private final RagGlobalDocumentRequestService ragGlobalDocumentRequestService;

    /**
     * 문서 업로드 엔드포인트
     *
     * POST /api/rag/documents/upload
     */
    @Operation(summary = "문서 업로드", description = "RAG 시스템에 문서를 업로드합니다. (50MB 제한)")
    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<RagDocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") UUID projectId,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {

        log.info("REST API: Upload document request - file={}, projectId={}", file.getOriginalFilename(), projectId);

        try {
            // 1. 파일 검증 (크기, 타입)
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // 파일 크기 검증 (50MB 제한)
            long maxFileSize = 50 * 1024 * 1024; // 50MB
            if (file.getSize() > maxFileSize) {
                log.warn("File size exceeds limit: {} > {}", file.getSize(), maxFileSize);
                return ResponseEntity.status(413).build(); // Payload Too Large
            }

            // 파일 타입 검증
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("application/pdf") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("text/plain"))) {
                log.warn("Unsupported file type: {}", contentType);
                return ResponseEntity.status(415).build(); // Unsupported Media Type
            }

            // 2. ragService.uploadDocument() 호출
            RagDocumentResponse response = ragService.uploadDocument(file, projectId, uploadedBy);

            // 3. 적절한 HTTP 상태 코드와 함께 응답 반환
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            log.error("Failed to upload document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 분석 엔드포인트
     *
     * POST /api/rag/documents/{documentId}/analyze
     */
    @Operation(summary = "문서 분석", description = "업로드된 문서를 분석하여 텍스트를 추출합니다.")
    @PostMapping("/documents/{documentId}/analyze")
    public ResponseEntity<RagDocumentResponse> analyzeDocument(
            @PathVariable UUID documentId,
            @RequestParam(value = "parser", defaultValue = "pymupdf4llm") String parser) {

        log.info("REST API: Analyze document request - documentId={}, parser={}", documentId, parser);

        try {
            RagDocumentResponse response = ragService.analyzeDocument(documentId, parser);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.ACCEPTED).build();
            }
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            log.error("Failed to analyze document: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 임베딩 생성 엔드포인트
     *
     * POST /api/rag/embeddings/generate
     */
    @Operation(summary = "임베딩 생성", description = "분석된 문서의 텍스트 청크에 대한 벡터 임베딩을 생성합니다.")
    @PostMapping("/embeddings/generate")
    public ResponseEntity<RagDocumentResponse> generateEmbeddings(
            @RequestParam("documentId") UUID documentId) {

        log.info("REST API: Generate embeddings request - documentId={}", documentId);

        try {
            RagDocumentResponse response = ragService.generateEmbeddings(documentId);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.ACCEPTED).build();
            }
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            log.error("Failed to generate embeddings: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 유사도 검색 엔드포인트
     *
     * POST /api/rag/search/similar
     */
    @Operation(summary = "유사도 검색", description = "질의와 유사한 문서 청크를 검색합니다.")
    @PostMapping("/search/similar")
    public ResponseEntity<RagSearchResponse> searchSimilar(
            @Valid @RequestBody RagSearchRequest request) {

        log.info("REST API: Search similar request - query={}", request.getQueryText());

        try {
            // 1. 요청 검증 (@Valid 어노테이션으로 자동 처리)
            // 2. ragService.searchSimilar() 호출
            RagSearchResponse response = ragService.searchSimilar(request);

            // 3. 검색 결과 반환
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to search similar chunks: query={}", request.getQueryText(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 고급 검색 엔드포인트 (벡터, BM25, 하이브리드, Reranker 지원)
     *
     * POST /api/rag/search/advanced
     */
    @Operation(summary = "고급 검색", description = "벡터, BM25, 하이브리드 등 다양한 방식으로 검색합니다.")
    @PostMapping("/search/advanced")
    public ResponseEntity<RagSearchResponse> searchAdvanced(
            @Valid @RequestBody RagAdvancedSearchRequest request) {

        log.info("REST API: Advanced search request - query={}, method={}",
                request.getQueryText(), request.getSearchMethod());

        try {
            // 1. 요청 검증 (@Valid 어노테이션으로 자동 처리)
            // 2. ragService.searchAdvanced() 호출
            RagSearchResponse response = ragService.searchAdvanced(request);

            // 3. 검색 결과 반환
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to perform advanced search: query={}, method={}",
                    request.getQueryText(), request.getSearchMethod(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 조회 엔드포인트
     *
     * GET /api/rag/documents/{documentId}
     */
    @Operation(summary = "문서 조회", description = "특정 문서의 메타데이터를 조회합니다.")
    @GetMapping("/documents/{documentId}")
    public ResponseEntity<RagDocumentResponse> getDocument(
            @PathVariable UUID documentId) {

        log.info("REST API: Get document request - documentId={}", documentId);

        try {
            RagDocumentResponse response = ragService.getDocument(documentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get document: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 목록 조회 엔드포인트
     *
     * GET /api/rag/documents
     */
    @Operation(summary = "문서 목록 조회", description = "프로젝트의 문서 목록을 페이징하여 조회합니다.")
    @GetMapping("/documents")
    public ResponseEntity<RagDocumentListResponse> listDocuments(
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "20") Integer size) {

        log.info("REST API: List documents request - projectId={}, page={}, size={}", projectId, page, size);

        try {
            RagDocumentListResponse response = ragService.listDocuments(projectId, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to list documents: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 삭제 엔드포인트
     *
     * DELETE /api/rag/documents/{documentId}
     */
    @Operation(summary = "문서 삭제", description = "문서를 삭제합니다.")
    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<String> deleteDocument(@PathVariable UUID documentId) {
        log.info("REST API: Delete document request - documentId={}", documentId);

        try {
            String message = ragService.deleteDocument(documentId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Failed to delete document: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 다운로드 엔드포인트
     *
     * GET /api/rag/documents/{documentId}/download
     */
    @Operation(summary = "문서 다운로드", description = "문서 파일을 다운로드합니다.")
    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID documentId,
            Authentication authentication) {
        log.info("REST API: Download document request - documentId={}", documentId);

        try {
            // 1. RAG API에서 문서 메타데이터 조회
            RagDocumentResponse documentInfo = ragService.getDocument(documentId);

            // 2. RAG API에서 파일 다운로드
            byte[] fileData = ragService.downloadDocument(documentId);

            // 3. Resource로 변환
            ByteArrayResource resource = new ByteArrayResource(fileData);

            // 4. Content-Disposition 헤더 설정 (파일명 포함)
            String filename = documentInfo.getFileName();
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

            // 5. Content-Type 결정
            MediaType mediaType = determineMediaType(documentInfo.getFileType());

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(fileData.length)
                    .contentType(mediaType)
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to download document: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 청크 조회 엔드포인트 (페이지네이션 지원)
     *
     * GET /api/rag/documents/{documentId}/chunks?skip=0&limit=50
     */
    @Operation(summary = "문서 청크 조회", description = "문서의 분할된 텍스트 청크 목록을 조회합니다.")
    @GetMapping("/documents/{documentId}/chunks")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagChunkListResponse> getDocumentChunks(
            @PathVariable UUID documentId,
            @RequestParam(value = "skip", defaultValue = "0") Integer skip,
            @RequestParam(value = "limit", defaultValue = "50") Integer limit,
            Authentication authentication) {
        log.info("REST API: Get document chunks request - documentId={}, skip={}, limit={}", documentId, skip, limit);

        try {
            RagChunkListResponse response = ragService.getDocumentChunks(documentId, skip, limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get document chunks: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ICT-388: 기존 TestCase 일괄 벡터화 엔드포인트
     *
     * POST /api/rag/testcases/vectorize-all?projectId={projectId}
     *
     * 전체 또는 특정 프로젝트의 모든 TestCase를 RAG 시스템에 벡터화하여 등록합니다.
     * 관리자만 접근 가능합니다.
     */
    @Operation(summary = "테스트케이스 일괄 벡터화", description = "전체 또는 특정 프로젝트의 모든 테스트케이스를 RAG 시스템에 등록합니다. (관리자 전용)")
    @PostMapping("/testcases/vectorize-all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> vectorizeAllTestCases(
            @RequestParam(value = "projectId", required = false) String projectId) {

        log.info("ICT-388 REST API: Vectorize all testcases request - projectId={}", projectId);

        try {
            Map<String, Object> result = testCaseService.vectorizeAllTestCases(projectId);

            log.info(
                    "ICT-388 REST API: Vectorize all testcases completed - totalCount={}, successCount={}, failureCount={}",
                    result.get("totalCount"), result.get("successCount"), result.get("failureCount"));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("ICT-388 REST API: Failed to vectorize all testcases - projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 업로드 엔드포인트 (모든 프로젝트에서 접근 가능)
     * 관리자만 업로드 가능
     *
     * POST /api/rag/global-documents/upload
     */
    @Operation(summary = "공통 문서 업로드", description = "모든 프로젝트에서 접근 가능한 공통 문서를 업로드합니다. (관리자 전용)")
    @PostMapping(value = "/global-documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RagDocumentResponse> uploadGlobalDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {

        log.info("REST API: Upload global document request - file={}", file.getOriginalFilename());

        try {
            // 1. 파일 검증 (크기, 타입)
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // 파일 크기 검증 (50MB 제한)
            long maxFileSize = 50 * 1024 * 1024; // 50MB
            if (file.getSize() > maxFileSize) {
                log.warn("File size exceeds limit: {} > {}", file.getSize(), maxFileSize);
                return ResponseEntity.status(413).build(); // Payload Too Large
            }

            // 파일 타입 검증
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("application/pdf") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("text/plain"))) {
                log.warn("Unsupported file type: {}", contentType);
                return ResponseEntity.status(415).build(); // Unsupported Media Type
            }

            // 2. ragService.uploadGlobalDocument() 호출
            RagDocumentResponse response = ragService.uploadGlobalDocument(file, uploadedBy);

            // 3. 적절한 HTTP 상태 코드와 함께 응답 반환
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            log.error("Failed to upload global document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 목록 조회 엔드포인트
     *
     * GET /api/rag/global-documents
     */
    @Operation(summary = "공통 문서 목록 조회", description = "공통 문서 목록을 조회합니다.")
    @GetMapping("/global-documents")
    public ResponseEntity<RagDocumentListResponse> listGlobalDocuments(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "20") Integer size) {

        log.info("REST API: List global documents request - page={}, size={}", page, size);

        try {
            RagDocumentListResponse response = ragService.listGlobalDocuments(page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to list global documents", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 삭제 엔드포인트
     * 관리자만 삭제 가능
     *
     * DELETE /api/rag/global-documents/{documentId}
     */
    @Operation(summary = "공통 문서 삭제", description = "공통 문서를 삭제합니다. (관리자 전용)")
    @DeleteMapping("/global-documents/{documentId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> deleteGlobalDocument(@PathVariable UUID documentId) {
        log.info("REST API: Delete global document request - documentId={}", documentId);

        try {
            String message = ragService.deleteDocument(documentId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Failed to delete global document: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 프로젝트 문서를 공통 문서로 승격 (관리자 전용)
     */
    @Operation(summary = "문서 공통화 승격", description = "프로젝트 문서를 공통 문서로 승격시킵니다. (관리자 전용)")
    @PostMapping("/documents/{documentId}/promote-to-global")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RagDocumentResponse> promoteDocumentToGlobal(
            @PathVariable UUID documentId,
            @RequestBody(required = false) RagPromoteDocumentRequest request,
            Authentication authentication) {

        log.info("REST API: Promote document to global request - documentId={}", documentId);
        try {
            String reason = request != null ? request.getReason() : null;
            RagDocumentResponse response = ragService.moveDocumentToGlobal(documentId, authentication.getName(),
                    reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to promote document to global: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 등록 요청 생성 (일반 사용자)
     */
    @Operation(summary = "공통 문서 등록 요청", description = "프로젝트 문서를 공통 문서로 등록해달라고 요청합니다.")
    @PostMapping("/documents/{documentId}/global-request")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagGlobalDocumentRequestDto> requestGlobalDocument(
            @PathVariable UUID documentId,
            @RequestBody(required = false) RagGlobalDocumentRequestCreateRequest request,
            Authentication authentication) {

        log.info("REST API: Create global document request - documentId={}, requestedBy={}",
                documentId, authentication.getName());
        try {
            RagGlobalDocumentRequestDto response = ragGlobalDocumentRequestService.createRequest(
                    documentId,
                    authentication.getName(),
                    request != null ? request.getMessage() : null);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Failed to create global document request: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 요청 목록 조회 (관리자)
     */
    @Operation(summary = "공통 문서 요청 목록 조회", description = "공통 문서 등록 요청 목록을 조회합니다. (관리자 전용)")
    @GetMapping("/global-document-requests")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<RagGlobalDocumentRequestDto>> listGlobalDocumentRequests(
            @RequestParam(value = "status", required = false) RagGlobalDocumentRequestStatus status) {
        try {
            List<RagGlobalDocumentRequestDto> responses = ragGlobalDocumentRequestService.listRequests(status);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            log.error("Failed to list global document requests", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 요청 승인 (관리자)
     */
    @Operation(summary = "공통 문서 요청 승인", description = "공통 문서 등록 요청을 승인합니다. (관리자 전용)")
    @PostMapping("/global-document-requests/{requestId}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RagGlobalDocumentRequestDto> approveGlobalDocumentRequest(
            @PathVariable String requestId,
            @RequestBody(required = false) RagGlobalDocumentRequestDecisionRequest request,
            Authentication authentication) {
        try {
            RagGlobalDocumentRequestDto response = ragGlobalDocumentRequestService.approveRequest(
                    requestId,
                    authentication.getName(),
                    request != null ? request.getNote() : null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to approve global document request: requestId={}", requestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공통 문서 요청 거절 (관리자)
     */
    @Operation(summary = "공통 문서 요청 거절", description = "공통 문서 등록 요청을 거절합니다. (관리자 전용)")
    @PostMapping("/global-document-requests/{requestId}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RagGlobalDocumentRequestDto> rejectGlobalDocumentRequest(
            @PathVariable String requestId,
            @RequestBody(required = false) RagGlobalDocumentRequestDecisionRequest request,
            Authentication authentication) {
        try {
            RagGlobalDocumentRequestDto response = ragGlobalDocumentRequestService.rejectRequest(
                    requestId,
                    authentication.getName(),
                    request != null ? request.getNote() : null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to reject global document request: requestId={}", requestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 파일 타입에 따른 MediaType 결정
     */
    private MediaType determineMediaType(String fileType) {
        if (fileType == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        switch (fileType.toLowerCase()) {
            case ".pdf":
                return MediaType.APPLICATION_PDF;
            case ".docx":
                return MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case ".doc":
                return MediaType.parseMediaType("application/msword");
            case ".txt":
                return MediaType.TEXT_PLAIN;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private boolean isGlobalDocument(RagDocumentResponse document) {
        return document != null && RagService.GLOBAL_PROJECT_ID.equals(document.getProjectId());
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ADMIN"));
    }

    // ==================== LLM 분석 기능 엔드포인트 ====================

    /**
     * LLM 분석 비용 추정
     *
     * POST /api/rag/documents/{documentId}/estimate-cost
     */
    @Operation(summary = "LLM 분석 비용 추정", description = "문서 분석에 소요될 예상 비용을 계산합니다.")
    @PostMapping("/documents/{documentId}/estimate-cost")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagCostEstimateResponse> estimateAnalysisCost(
            @PathVariable UUID documentId,
            @Valid @RequestBody RagCostEstimateRequest request) {

        log.info("REST API: Estimate LLM analysis cost - documentId={}, llmProvider={}, llmModel={}",
                documentId, request.getLlmProvider(), request.getLlmModel());

        try {
            RagCostEstimateResponse response = ragService.estimateAnalysisCost(documentId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to estimate analysis cost: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 문서 LLM 순차 분석 시작
     *
     * POST /api/rag/documents/{documentId}/analyze-with-llm
     */
    @Operation(summary = "LLM 문서 분석 시작", description = "문서에 대한 LLM 심층 분석을 시작합니다.")
    @PostMapping("/documents/{documentId}/analyze-with-llm")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisResponse> analyzeDocumentWithLlm(
            @PathVariable UUID documentId,
            @Valid @RequestBody RagLlmAnalysisRequest request) {

        log.info("REST API: Start LLM analysis - documentId={}, llmProvider={}, llmModel={}",
                documentId, request.getLlmProvider(), request.getLlmModel());

        try {
            RagLlmAnalysisResponse response = ragService.analyzeDocumentWithLlm(documentId, request);
            return ResponseEntity.accepted().body(response); // 202 Accepted (백그라운드 작업)
        } catch (Exception e) {
            log.error("Failed to start LLM analysis: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 진행 상황 조회
     *
     * GET /api/rag/documents/{documentId}/llm-analysis-status
     */
    @Operation(summary = "LLM 분석 상태 조회", description = "진행 중인 LLM 분석 작업의 상태를 조회합니다.")
    @GetMapping("/documents/{documentId}/llm-analysis-status")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisStatusResponse> getLlmAnalysisStatus(@PathVariable UUID documentId) {

        log.debug("REST API: Get LLM analysis status - documentId={}", documentId);

        try {
            RagLlmAnalysisStatusResponse response = ragService.getLlmAnalysisStatus(documentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get LLM analysis status: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 결과 조회
     *
     * GET /api/rag/documents/{documentId}/llm-analysis-results
     */
    @Operation(summary = "LLM 분석 결과 조회", description = "완료된 LLM 분석 결과를 조회합니다.")
    @GetMapping("/documents/{documentId}/llm-analysis-results")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisResultsResponse> getLlmAnalysisResults(
            @PathVariable UUID documentId,
            @RequestParam(required = false, defaultValue = "0") Integer skip,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {

        log.info("REST API: Get LLM analysis results - documentId={}, skip={}, limit={}", documentId, skip, limit);

        try {
            RagLlmAnalysisResultsResponse response = ragService.getLlmAnalysisResults(documentId, skip, limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get LLM analysis results: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 일시정지
     *
     * POST /api/rag/documents/{documentId}/pause-analysis
     */
    @Operation(summary = "LLM 분석 일시정지", description = "진행 중인 LLM 분석 작업을 일시정지합니다.")
    @PostMapping("/documents/{documentId}/pause-analysis")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisStatusResponse> pauseAnalysis(@PathVariable UUID documentId) {

        log.info("REST API: Pause LLM analysis - documentId={}", documentId);

        try {
            RagLlmAnalysisStatusResponse response = ragService.pauseAnalysis(documentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to pause LLM analysis: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 재개
     *
     * POST /api/rag/documents/{documentId}/resume-analysis
     */
    @Operation(summary = "LLM 분석 재개", description = "일시정지된 LLM 분석 작업을 재개합니다.")
    @PostMapping("/documents/{documentId}/resume-analysis")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisStatusResponse> resumeAnalysis(@PathVariable UUID documentId) {

        log.info("REST API: Resume LLM analysis - documentId={}", documentId);

        try {
            RagLlmAnalysisStatusResponse response = ragService.resumeAnalysis(documentId);
            return ResponseEntity.accepted().body(response); // 202 Accepted (백그라운드 작업 재개)
        } catch (Exception e) {
            log.error("Failed to resume LLM analysis: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 취소
     *
     * POST /api/rag/documents/{documentId}/cancel-analysis
     */
    @Operation(summary = "LLM 분석 취소", description = "진행 중인 LLM 분석 작업을 취소합니다.")
    @PostMapping("/documents/{documentId}/cancel-analysis")
    @PreAuthorize("@projectSecurityService.canAccessDocumentProject(#documentId, authentication.name)")
    public ResponseEntity<RagLlmAnalysisStatusResponse> cancelAnalysis(@PathVariable UUID documentId) {

        log.info("REST API: Cancel LLM analysis - documentId={}", documentId);

        try {
            RagLlmAnalysisStatusResponse response = ragService.cancelAnalysis(documentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to cancel LLM analysis: documentId={}", documentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LLM 분석 작업 목록 조회
     *
     * GET /api/rag/llm-analysis/jobs?projectId=...&status=...&page=1&size=20
     */
    @Operation(summary = "LLM 분석 작업 목록", description = "LLM 분석 작업 목록을 조회합니다.")
    @GetMapping("/llm-analysis/jobs")
    public ResponseEntity<RagLlmAnalysisJobListResponse> listLlmAnalysisJobs(
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "20") Integer size) {

        log.info("REST API: List LLM analysis jobs - projectId={}, status={}, page={}, size={}",
                projectId, status, page, size);

        try {
            RagLlmAnalysisJobListResponse response = ragService.listLlmAnalysisJobs(projectId, status, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to list LLM analysis jobs: projectId={}, status={}", projectId, status, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 분석 요약 CRUD 엔드포인트 ====================

    /**
     * 분석 요약 생성
     *
     * POST /api/rag/analysis-summaries
     */
    @Operation(summary = "분석 요약 생성", description = "분석 결과에 대한 요약을 생성합니다.")
    @PostMapping("/analysis-summaries")
    public ResponseEntity<RagAnalysisSummaryResponse> createAnalysisSummary(
            @Valid @RequestBody RagAnalysisSummaryRequest request) {

        log.info("REST API: Create analysis summary - title={}", request.getTitle());

        try {
            RagAnalysisSummaryResponse response = ragService.createAnalysisSummary(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Failed to create analysis summary", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 분석 요약 목록 조회
     *
     * GET /api/rag/analysis-summaries
     */
    @Operation(summary = "분석 요약 목록 조회", description = "생성된 분석 요약 목록을 조회합니다.")
    @GetMapping("/analysis-summaries")
    public ResponseEntity<java.util.List<RagAnalysisSummaryResponse>> listAnalysisSummaries(
            @RequestParam(required = false) UUID documentId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false, defaultValue = "0") Integer skip,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {

        log.info("REST API: List analysis summaries - documentId={}, userId={}, isPublic={}, skip={}, limit={}",
                documentId, userId, isPublic, skip, limit);

        try {
            java.util.List<RagAnalysisSummaryResponse> response = ragService.listAnalysisSummaries(documentId, userId,
                    isPublic, skip, limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to list analysis summaries", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 분석 요약 상세 조회
     *
     * GET /api/rag/analysis-summaries/{summaryId}
     */
    @Operation(summary = "분석 요약 상세 조회", description = "특정 분석 요약의 상세 내용을 조회합니다.")
    @GetMapping("/analysis-summaries/{summaryId}")
    public ResponseEntity<RagAnalysisSummaryResponse> getAnalysisSummary(@PathVariable UUID summaryId) {

        log.info("REST API: Get analysis summary - summaryId={}", summaryId);

        try {
            RagAnalysisSummaryResponse response = ragService.getAnalysisSummary(summaryId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get analysis summary: summaryId={}", summaryId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 분석 요약 수정
     *
     * PUT /api/rag/analysis-summaries/{summaryId}
     */
    @PutMapping("/analysis-summaries/{summaryId}")
    public ResponseEntity<RagAnalysisSummaryResponse> updateAnalysisSummary(
            @PathVariable UUID summaryId,
            @Valid @RequestBody RagAnalysisSummaryRequest request) {

        log.info("REST API: Update analysis summary - summaryId={}", summaryId);

        try {
            RagAnalysisSummaryResponse response = ragService.updateAnalysisSummary(summaryId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to update analysis summary: summaryId={}", summaryId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 분석 요약 삭제
     *
     * DELETE /api/rag/analysis-summaries/{summaryId}
     */
    @DeleteMapping("/analysis-summaries/{summaryId}")
    public ResponseEntity<String> deleteAnalysisSummary(@PathVariable UUID summaryId) {

        log.info("REST API: Delete analysis summary - summaryId={}", summaryId);

        try {
            String message = ragService.deleteAnalysisSummary(summaryId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Failed to delete analysis summary: summaryId={}", summaryId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
