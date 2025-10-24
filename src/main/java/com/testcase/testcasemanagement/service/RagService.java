package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * RAG (Retrieval-Augmented Generation) API 클라이언트 서비스 인터페이스
 *
 * FastAPI RAG 서비스와 통신하여 다음 기능을 제공합니다:
 * - 문서 업로드 및 분석
 * - 임베딩 생성
 * - 유사도 검색 (벡터 검색)
 */
public interface RagService {

    /**
     * RAG API에 문서 업로드
     *
     * @param file 업로드할 파일
     * @param projectId 프로젝트 ID
     * @param uploadedBy 업로더 사용자명
     * @return 업로드된 문서 정보
     */
    RagDocumentResponse uploadDocument(MultipartFile file, UUID projectId, String uploadedBy);

    /**
     * 문서 분석 요청
     *
     * @param documentId 분석할 문서 ID
     * @param parser 사용할 파서 (upstage, pymupdf, pypdf2, auto 등)
     * @return 분석 결과
     */
    RagDocumentResponse analyzeDocument(UUID documentId, String parser);

    /**
     * 문서의 임베딩 생성 요청
     *
     * @param documentId 임베딩을 생성할 문서 ID
     * @return 임베딩 생성 결과
     */
    RagDocumentResponse generateEmbeddings(UUID documentId);

    /**
     * 유사 텍스트 검색 (벡터 유사도 검색)
     *
     * @param request 검색 요청 (쿼리, 필터 조건 등)
     * @return 검색 결과 리스트
     */
    RagSearchResponse searchSimilar(RagSearchRequest request);

    /**
     * 문서 조회
     *
     * @param documentId 조회할 문서 ID
     * @return 문서 정보
     */
    RagDocumentResponse getDocument(UUID documentId);

    /**
     * 프로젝트의 문서 목록 조회
     *
     * @param projectId 프로젝트 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 문서 목록
     */
    // TODO: DocumentListResponse DTO 생성 필요
    // List<RagDocumentResponse> listDocuments(UUID projectId, int page, int size);
}
