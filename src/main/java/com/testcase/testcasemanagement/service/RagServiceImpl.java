package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * RAG API 클라이언트 서비스 구현체
 *
 * WebClient를 사용하여 FastAPI RAG 서비스와 통신합니다.
 */
@Slf4j
@Service
public class RagServiceImpl implements RagService {

    /**
     * 글로벌 문서를 위한 특수 프로젝트 ID
     * 모든 프로젝트에서 접근 가능한 공통 문서를 식별하는 데 사용됩니다.
     */
    public static final UUID GLOBAL_PROJECT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final WebClient ragWebClient;
    private final String ragApiUrl;

    public RagServiceImpl(
            WebClient ragWebClient,
            @Value("${rag.api.url:http://localhost:8001}") String ragApiUrl) {
        this.ragWebClient = ragWebClient;
        this.ragApiUrl = ragApiUrl;
        log.info("RAG Service initialized with API URL: {}", ragApiUrl);
    }

    @Override
    public RagDocumentResponse uploadDocument(MultipartFile file, UUID projectId, String uploadedBy) {
        log.info("Uploading document to RAG API: file={}, projectId={}", file.getOriginalFilename(), projectId);

        try {
            // MultipartBodyBuilder로 multipart/form-data 요청 생성
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", file.getResource())
                    .filename(file.getOriginalFilename())
                    .contentType(org.springframework.http.MediaType.parseMediaType(file.getContentType()));
            builder.part("project_id", projectId.toString());
            if (uploadedBy != null && !uploadedBy.isEmpty()) {
                builder.part("uploaded_by", uploadedBy);
            }

            // WebClient로 POST /api/v1/documents/upload 호출
            RagDocumentResponse response = ragWebClient.post()
                    .uri("/api/v1/documents/upload")
                    .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagDocumentResponse.class)
                    .block();

            log.info("Document uploaded successfully: documentId={}", response != null ? response.getId() : "null");
            return response;
        } catch (Exception e) {
            log.error("Failed to upload document to RAG API", e);
            throw new RuntimeException("문서 업로드 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagDocumentResponse analyzeDocument(UUID documentId, String parser) {
        log.info("Analyzing document in RAG API: documentId={}, parser={}", documentId, parser);

        try {
            // POST /api/v1/documents/{documentId}/analyze 호출
            // FastAPI는 query parameters만 받고 body는 받지 않음
            RagDocumentResponse response = ragWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/documents/{documentId}/analyze")
                            .queryParam("parser", parser != null ? parser : "pymupdf4llm")
                            .build(documentId))
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagDocumentResponse.class)
                    .block();

            if (response != null) {
                log.info("Document analysis request accepted: documentId={}, status={}",
                        documentId, response.getAnalysisStatus());
            } else {
                log.warn("Document analysis request returned empty response: documentId={}", documentId);
            }
            return response;
        } catch (Exception e) {
            log.error("Failed to analyze document in RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 분석 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagDocumentResponse generateEmbeddings(UUID documentId) {
        log.info("Generating embeddings in RAG API: documentId={}", documentId);

        try {
            // RagEmbeddingRequest 생성
            RagEmbeddingRequest request = RagEmbeddingRequest.builder()
                    .documentId(documentId)
                    .build();

            // POST /api/v1/embeddings/generate 호출
            RagEmbeddingResponse embeddingResponse = ragWebClient.post()
                    .uri("/api/v1/embeddings/generate")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagEmbeddingResponse.class)
                    .block();

            // RagEmbeddingResponse를 RagDocumentResponse로 변환
            RagDocumentResponse response = RagDocumentResponse.builder()
                    .id(embeddingResponse != null ? embeddingResponse.getDocumentId() : documentId)
                    .totalChunks(embeddingResponse != null ? embeddingResponse.getTotalChunks() : 0)
                    .message(embeddingResponse != null ? embeddingResponse.getMessage() : "Embedding generation started")
                    .build();

            log.info("Embedding generation request accepted: documentId={}, message={}",
                    documentId, embeddingResponse != null ? embeddingResponse.getMessage() : "N/A");
            return response;
        } catch (Exception e) {
            log.error("Failed to generate embeddings in RAG API: documentId={}", documentId, e);
            throw new RuntimeException("임베딩 생성 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagSearchResponse searchSimilar(RagSearchRequest request) {
        log.info("Searching similar chunks in RAG API: query={}", request.getQueryText());

        try {
            // POST /api/v1/search/similar 호출
            RagSearchResponse response = ragWebClient.post()
                    .uri("/api/v1/search/similar")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagSearchResponse.class)
                    .block();

            log.info("Search completed successfully: totalResults={}",
                    response != null ? response.getTotalResults() : 0);
            return response;
        } catch (Exception e) {
            log.error("Failed to search similar chunks in RAG API: query={}", request.getQueryText(), e);
            throw new RuntimeException("유사도 검색 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagSearchResponse searchAdvanced(RagAdvancedSearchRequest request) {
        log.info("Advanced search in RAG API: query={}, method={}",
                request.getQueryText(), request.getSearchMethod());

        try {
            // POST /api/v1/search/advanced 호출
            RagSearchResponse response = ragWebClient.post()
                    .uri("/api/v1/search/advanced")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagSearchResponse.class)
                    .block();

            log.info("Advanced search completed successfully: totalResults={}, method={}",
                    response != null ? response.getTotalResults() : 0,
                    request.getSearchMethod());
            return response;
        } catch (Exception e) {
            log.error("Failed to perform advanced search in RAG API: query={}, method={}",
                    request.getQueryText(), request.getSearchMethod(), e);
            throw new RuntimeException("고급 검색 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagDocumentResponse getDocument(UUID documentId) {
        log.info("Getting document from RAG API: documentId={}", documentId);

        try {
            RagDocumentResponse response = fetchDocument(documentId);

            log.info("Document retrieved successfully: documentId={}, fileName={}",
                    documentId, response != null ? response.getFileName() : "null");
            return response;
        } catch (Exception e) {
            log.error("Failed to get document from RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 조회 실패: " + e.getMessage(), e);
        }
    }

    private RagDocumentResponse fetchDocument(UUID documentId) {
        return ragWebClient.get()
                .uri("/api/v1/documents/{documentId}", documentId)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                )
                .onStatus(
                        status -> status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                )
                .bodyToMono(RagDocumentResponse.class)
                .block();
    }

    @Override
    public RagDocumentListResponse listDocuments(UUID projectId, Integer page, Integer size) {
        log.info("Listing documents from RAG API: projectId={}, page={}, size={}", projectId, page, size);

        try {
            // GET /api/v1/documents/?project_id={projectId}&page={page}&page_size={size} 호출
            RagDocumentListResponse response = ragWebClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/api/v1/documents/");
                        if (projectId != null) {
                            uriBuilder.queryParam("project_id", projectId.toString());
                        }
                        if (page != null) {
                            uriBuilder.queryParam("page", page);
                        }
                        if (size != null) {
                            uriBuilder.queryParam("page_size", size);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagDocumentListResponse.class)
                    .block();

            log.info("Documents retrieved successfully: total={}, page={}, size={}",
                    response != null ? response.getTotal() : 0,
                    response != null ? response.getPage() : 0,
                    response != null ? response.getPageSize() : 0);
            return response;
        } catch (Exception e) {
            log.error("Failed to list documents from RAG API: projectId={}", projectId, e);
            throw new RuntimeException("문서 목록 조회 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public String deleteDocument(UUID documentId) {
        log.info("Deleting document from RAG API: documentId={}", documentId);

        try {
            // DELETE /api/v1/documents/{documentId} 호출
            String response = ragWebClient.delete()
                    .uri("/api/v1/documents/{documentId}", documentId)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(String.class)
                    .block();

            log.info("Document deleted successfully: documentId={}", documentId);
            return response != null ? response : "Document deleted successfully";
        } catch (Exception e) {
            log.error("Failed to delete document from RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 삭제 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] downloadDocument(UUID documentId) {
        log.info("Downloading document from RAG API: documentId={}", documentId);

        try {
            // GET /api/v1/documents/{documentId}/download 호출
            byte[] fileData = ragWebClient.get()
                    .uri("/api/v1/documents/{documentId}/download", documentId)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(byte[].class)
                    .block();

            log.info("Document downloaded successfully: documentId={}, size={} bytes",
                    documentId, fileData != null ? fileData.length : 0);
            return fileData;
        } catch (Exception e) {
            log.error("Failed to download document from RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 다운로드 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagChunkListResponse getDocumentChunks(UUID documentId, Integer skip, Integer limit) {
        log.info("Getting document chunks from RAG API: documentId={}, skip={}, limit={}", documentId, skip, limit);

        try {
            // GET /api/v1/documents/{documentId}/chunks 호출 (페이지네이션 파라미터 포함)
            RagChunkListResponse response = ragWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/documents/{documentId}/chunks")
                            .queryParam("skip", skip != null ? skip : 0)
                            .queryParam("limit", limit != null ? limit : 50)
                            .build(documentId))
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagChunkListResponse.class)
                    .block();

            log.info("Document chunks retrieved successfully: documentId={}, total={}, returned={}",
                    documentId, response != null ? response.getTotal() : 0, response != null ? response.getChunks().size() : 0);
            return response;
        } catch (Exception e) {
            log.error("Failed to get document chunks from RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 청크 조회 실패: " + e.getMessage(), e);
        }
    }

    /**
     * Wait until document analysis completes or fails by polling the RAG API.
     * 문서 분석이 완료되거나 실패할 때까지 RAG API를 폴링하여 대기합니다.
     */
    private boolean waitForAnalysisCompletion(UUID documentId, Duration timeout, Duration pollInterval) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();

        while (System.currentTimeMillis() < deadline) {
            try {
                RagDocumentResponse document = fetchDocument(documentId);
                if (document != null && document.getAnalysisStatus() != null) {
                    String status = document.getAnalysisStatus().toLowerCase();
                    if ("completed".equals(status)) {
                        log.info("Document analysis completed: documentId={}, totalChunks={}",
                                documentId, document.getTotalChunks());
                        return true;
                    }
                    if ("failed".equals(status)) {
                        log.warn("Document analysis failed while waiting: documentId={}", documentId);
                        return false;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch document status while waiting for analysis: documentId={}, reason={}",
                        documentId, e.getMessage());
            }

            try {
                Thread.sleep(pollInterval.toMillis());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for analysis completion: documentId={}", documentId);
                return false;
            }
        }

        log.warn("Timed out waiting for document analysis completion: documentId={}", documentId);
        return false;
    }

    /**
     * Wait until embedding generation completes or fails by polling the RAG API.
     * 임베딩 생성이 완료되거나 실패할 때까지 RAG API를 폴링하여 대기합니다.
     */
    private boolean waitForEmbeddingCompletion(UUID documentId, Duration timeout, Duration pollInterval) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();

        while (System.currentTimeMillis() < deadline) {
            try {
                RagDocumentResponse document = fetchDocument(documentId);
                if (document != null && document.getMetaData() != null) {
                    Object statusObj = document.getMetaData().get("embedding_status");
                    if (statusObj != null) {
                        String status = statusObj.toString().toLowerCase();
                        if ("completed".equals(status)) {
                            log.info("Embedding generation completed: documentId={}", documentId);
                            return true;
                        }
                        if ("failed".equals(status)) {
                            log.warn("Embedding generation failed: documentId={}", documentId);
                            return false;
                        }
                        if ("generating".equals(status)) {
                            log.debug("Embedding generation in progress: documentId={}", documentId);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch embedding status while waiting: documentId={}, reason={}", documentId, e.getMessage());
            }

            try {
                Thread.sleep(pollInterval.toMillis());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for embedding completion: documentId={}", documentId);
                return false;
            }
        }

        log.warn("Timed out waiting for embedding generation: documentId={}", documentId);
        return false;
    }

    @Override
    @Async("ragVectorizationExecutor")
    public void vectorizeTestCase(String testCaseId, String testCaseName, String testCaseContent,
                                  UUID projectId, String uploadedBy) {
        log.info("[비동기] Vectorizing TestCase to RAG: testCaseId={}, testCaseName={}, projectId={}, thread={}",
                testCaseId, testCaseName, projectId, Thread.currentThread().getName());

        try {
            // ICT-388: 동일한 testCaseId의 기존 문서가 있으면 먼저 삭제 (1개만 유지)
            try {
                deleteTestCaseFromRAG(testCaseId);
                log.info("기존 TestCase 문서 삭제 완료: testCaseId={}", testCaseId);
            } catch (Exception e) {
                // 기존 문서가 없으면 무시
                log.debug("기존 TestCase 문서 없음 (정상): testCaseId={}", testCaseId);
            }

            // TestCase 내용을 .txt 파일로 변환
            String fileName = String.format("testcase_%s.txt", testCaseId);
            byte[] contentBytes = testCaseContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

            // 커스텀 MultipartFile 구현 (프로덕션 코드용)
            MultipartFile multipartFile = new MultipartFile() {
                @Override
                public String getName() {
                    return "file";
                }

                @Override
                public String getOriginalFilename() {
                    return fileName;
                }

                @Override
                public String getContentType() {
                    return "text/plain";
                }

                @Override
                public boolean isEmpty() {
                    return contentBytes.length == 0;
                }

                @Override
                public long getSize() {
                    return contentBytes.length;
                }

                @Override
                public byte[] getBytes() {
                    return contentBytes;
                }

                @Override
                public java.io.InputStream getInputStream() {
                    return new java.io.ByteArrayInputStream(contentBytes);
                }

                @Override
                public void transferTo(java.io.File dest) throws IOException {
                    java.nio.file.Files.write(dest.toPath(), contentBytes);
                }
            };

            // 1. RAG API에 업로드
            RagDocumentResponse uploadResponse = uploadDocument(multipartFile, projectId, uploadedBy);

            if (uploadResponse == null || uploadResponse.getId() == null) {
                throw new RuntimeException("TestCase 업로드 실패: 응답이 null입니다");
            }

            UUID documentId = uploadResponse.getId();
            log.info("TestCase uploaded successfully: documentId={}", documentId);

            // 2. 문서 분석 (pymupdf4llm 파서 사용 - LLM 최적화 마크다운 추출)
            boolean analysisCompleted = false;
            try {
                RagDocumentResponse analyzeResponse = analyzeDocument(documentId, "pymupdf4llm");
                log.info("TestCase analysis started: status={}", analyzeResponse != null ? analyzeResponse.getAnalysisStatus() : "unknown");

                analysisCompleted = waitForAnalysisCompletion(
                        documentId,
                        Duration.ofMinutes(5),
                        Duration.ofSeconds(2)
                );

                if (!analysisCompleted) {
                    log.warn("TestCase 분석이 제한 시간 내에 완료되지 않았습니다: documentId={}", documentId);
                }
            } catch (Exception e) {
                log.warn("TestCase 분석 실패, 계속 진행: {}", e.getMessage());
            }

            if (!analysisCompleted) {
                log.warn("Skipping embedding generation because analysis did not complete: documentId={}", documentId);
                return;
            }

            // 3. 임베딩 생성
            try {
                generateEmbeddings(documentId);
                boolean embeddingsCompleted = waitForEmbeddingCompletion(
                        documentId,
                        Duration.ofMinutes(5),
                        Duration.ofSeconds(2)
                );

                if (!embeddingsCompleted) {
                    throw new RuntimeException("TestCase 임베딩 생성이 제한 시간 내에 완료되지 않았습니다.");
                }

                log.info("TestCase embeddings generated successfully: documentId={}", documentId);
            } catch (Exception e) {
                log.error("TestCase 임베딩 생성 실패: {}", e.getMessage());
                throw new RuntimeException("TestCase 임베딩 생성 실패: " + e.getMessage(), e);
            }

        } catch (Exception e) {
            log.error("Failed to vectorize TestCase to RAG: testCaseId={}", testCaseId, e);
            throw new RuntimeException("TestCase 벡터화 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteTestCaseFromRAG(String testCaseId) {
        log.info("Deleting TestCase from RAG: testCaseId={}", testCaseId);

        try {
            // TestCase ID로 문서 검색 (파일명 기반)
            String searchFileName = String.format("testcase_%s.txt", testCaseId);

            // 전체 문서 목록에서 해당 TestCase 찾기
            RagDocumentListResponse documents = listDocuments(null, 1, 1000);

            if (documents != null && documents.getDocuments() != null) {
                // ICT-388: 중복 문서 방지 - 동일한 파일명의 모든 문서를 삭제
                List<RagDocumentResponse> matchingDocs = documents.getDocuments().stream()
                    .filter(doc -> doc.getFileName() != null && doc.getFileName().equals(searchFileName))
                    .collect(java.util.stream.Collectors.toList());

                log.info("Found {} matching TestCase documents to delete: testCaseId={}", matchingDocs.size(), testCaseId);

                for (RagDocumentResponse doc : matchingDocs) {
                    try {
                        deleteDocument(doc.getId());
                        log.info("TestCase deleted from RAG successfully: testCaseId={}, documentId={}",
                                testCaseId, doc.getId());
                    } catch (Exception e) {
                        log.error("Failed to delete TestCase document: documentId={}", doc.getId(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete TestCase from RAG: testCaseId={}", testCaseId, e);
            // 삭제 실패는 무시 (RAG 시스템 장애 시에도 TestCase 삭제는 계속 진행)
        }
    }

    @Override
    public boolean isTestCaseVectorized(String testCaseId) {
        try {
            // TestCase ID로 문서 검색 (파일명 기반)
            String searchFileName = String.format("testcase_%s.txt", testCaseId);

            // 전체 문서 목록에서 해당 TestCase 찾기
            RagDocumentListResponse documents = listDocuments(null, 1, 1000);

            if (documents != null && documents.getDocuments() != null) {
                boolean exists = documents.getDocuments().stream()
                    .anyMatch(doc -> doc.getFileName() != null && doc.getFileName().equals(searchFileName));

                log.debug("TestCase vectorization check: testCaseId={}, exists={}", testCaseId, exists);
                return exists;
            }

            return false;
        } catch (Exception e) {
            log.warn("Failed to check TestCase vectorization status: testCaseId={}", testCaseId, e);
            return false; // RAG 시스템 장애 시 false 반환
        }
    }

    @Override
    public RagConversationMessageIndexResponse indexConversationMessage(RagConversationMessageIndexRequest request) {
        log.info("Indexing conversation message in RAG: messageId={}", request.getMessageId());

        try {
            return ragWebClient.post()
                    .uri("/api/v1/conversations/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagConversationMessageIndexResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to index conversation message in RAG", e);
            throw new RuntimeException("대화 메시지 임베딩 저장 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteConversationMessage(UUID messageId) {
        log.info("Deleting conversation message from RAG: messageId={}", messageId);

        try {
            ragWebClient.delete()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/conversations/messages/{messageId}")
                            .build(messageId))
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete conversation message in RAG", e);
            throw new RuntimeException("대화 메시지 임베딩 삭제 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagDocumentResponse uploadGlobalDocument(MultipartFile file, String uploadedBy) {
        log.info("Uploading global document to RAG API: file={}, globalProjectId={}",
                file.getOriginalFilename(), GLOBAL_PROJECT_ID);

        try {
            // MultipartBodyBuilder로 multipart/form-data 요청 생성
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", file.getResource())
                    .filename(file.getOriginalFilename())
                    .contentType(org.springframework.http.MediaType.parseMediaType(file.getContentType()));

            // 글로벌 문서를 위한 특수 프로젝트 ID 전송
            builder.part("project_id", GLOBAL_PROJECT_ID.toString());

            if (uploadedBy != null && !uploadedBy.isEmpty()) {
                builder.part("uploaded_by", uploadedBy);
            }

            // WebClient로 POST /api/v1/documents/upload 호출
            RagDocumentResponse response = ragWebClient.post()
                    .uri("/api/v1/documents/upload")
                    .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(builder.build())
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagDocumentResponse.class)
                    .block();

            log.info("Global document uploaded successfully: documentId={}", response != null ? response.getId() : "null");
            return response;
        } catch (Exception e) {
            log.error("Failed to upload global document to RAG API", e);
            throw new RuntimeException("공통 문서 업로드 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public RagDocumentListResponse listGlobalDocuments(Integer page, Integer size) {
        log.info("Listing global documents from RAG API: globalProjectId={}, page={}, size={}",
                GLOBAL_PROJECT_ID, page, size);

        try {
            // GET /api/v1/documents/?project_id={GLOBAL_PROJECT_ID}&page={page}&page_size={size} 호출
            RagDocumentListResponse response = ragWebClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/api/v1/documents/");
                        // 글로벌 문서를 위한 특수 프로젝트 ID로 필터링
                        uriBuilder.queryParam("project_id", GLOBAL_PROJECT_ID.toString());
                        if (page != null) {
                            uriBuilder.queryParam("page", page);
                        }
                        if (size != null) {
                            uriBuilder.queryParam("page_size", size);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 클라이언트 에러: " + error))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(error -> new RuntimeException("RAG API 서버 에러: " + error))
                    )
                    .bodyToMono(RagDocumentListResponse.class)
                    .block();

            // FastAPI가 이미 project_id로 필터링하여 반환하므로 추가 필터링 불필요
            if (response != null) {
                log.info("Global documents retrieved successfully: total={}",
                        response.getTotal() != null ? response.getTotal() : 0);
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to list global documents from RAG API", e);
            throw new RuntimeException("공통 문서 목록 조회 실패: " + e.getMessage(), e);
        }
    }
}
