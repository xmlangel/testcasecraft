package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.*;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;

/**
 * RAG API 클라이언트 컨트롤러
 *
 * Spring Boot Backend에서 RAG FastAPI 서비스를 호출하기 위한 REST 엔드포인트를 제공합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {

    private final RagService ragService;
    private final TestCaseService testCaseService;

    /**
     * 문서 업로드 엔드포인트
     *
     * POST /api/rag/documents/upload
     */
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
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
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
    @GetMapping("/documents/{documentId}/chunks")
    public ResponseEntity<RagChunkListResponse> getDocumentChunks(
            @PathVariable UUID documentId,
            @RequestParam(value = "skip", defaultValue = "0") Integer skip,
            @RequestParam(value = "limit", defaultValue = "50") Integer limit) {
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
    @PostMapping("/testcases/vectorize-all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> vectorizeAllTestCases(
            @RequestParam(value = "projectId", required = false) String projectId) {

        log.info("ICT-388 REST API: Vectorize all testcases request - projectId={}", projectId);

        try {
            Map<String, Object> result = testCaseService.vectorizeAllTestCases(projectId);

            log.info("ICT-388 REST API: Vectorize all testcases completed - totalCount={}, successCount={}, failureCount={}",
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
                return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case ".doc":
                return MediaType.parseMediaType("application/msword");
            case ".txt":
                return MediaType.TEXT_PLAIN;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    // ==================== LLM 분석 기능 엔드포인트 ====================

    /**
     * LLM 분석 비용 추정
     *
     * POST /api/rag/documents/{documentId}/estimate-cost
     */
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

    // ==================== 분석 요약 CRUD 엔드포인트 ====================

    /**
     * 분석 요약 생성
     *
     * POST /api/rag/analysis-summaries
     */
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
            java.util.List<RagAnalysisSummaryResponse> response =
                    ragService.listAnalysisSummaries(documentId, userId, isPublic, skip, limit);
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
