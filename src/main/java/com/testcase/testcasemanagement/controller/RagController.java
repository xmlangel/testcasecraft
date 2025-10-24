package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
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
            @RequestParam(value = "parser", defaultValue = "auto") String parser) {

        log.info("REST API: Analyze document request - documentId={}, parser={}", documentId, parser);

        try {
            RagDocumentResponse response = ragService.analyzeDocument(documentId, parser);
            return ResponseEntity.ok(response);
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
            return ResponseEntity.ok(response);
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
}
