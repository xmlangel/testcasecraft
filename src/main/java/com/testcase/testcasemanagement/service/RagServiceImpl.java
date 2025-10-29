package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

/**
 * RAG API 클라이언트 서비스 구현체
 *
 * WebClient를 사용하여 FastAPI RAG 서비스와 통신합니다.
 */
@Slf4j
@Service
public class RagServiceImpl implements RagService {

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
                            .queryParam("parser", parser != null ? parser : "auto")
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

            log.info("Document analyzed successfully: documentId={}, totalChunks={}",
                    documentId, response != null ? response.getTotalChunks() : 0);
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
                    .message(embeddingResponse != null ? embeddingResponse.getMessage() : "Embeddings generated")
                    .build();

            log.info("Embeddings generated successfully: documentId={}, embeddingsGenerated={}",
                    documentId, embeddingResponse != null ? embeddingResponse.getEmbeddingsGenerated() : 0);
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
    public RagDocumentResponse getDocument(UUID documentId) {
        log.info("Getting document from RAG API: documentId={}", documentId);

        try {
            // GET /api/v1/documents/{documentId} 호출
            RagDocumentResponse response = ragWebClient.get()
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

            log.info("Document retrieved successfully: documentId={}, fileName={}",
                    documentId, response != null ? response.getFileName() : "null");
            return response;
        } catch (Exception e) {
            log.error("Failed to get document from RAG API: documentId={}", documentId, e);
            throw new RuntimeException("문서 조회 실패: " + e.getMessage(), e);
        }
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
}
