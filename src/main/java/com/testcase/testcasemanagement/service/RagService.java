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
     * 고급 검색 (벡터, BM25, 하이브리드, Reranker 지원)
     *
     * @param request 고급 검색 요청 (검색 방법, 가중치 등)
     * @return 검색 결과 리스트
     */
    RagSearchResponse searchAdvanced(RagAdvancedSearchRequest request);

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
     * @param projectId 프로젝트 ID (null이면 전체 문서)
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 20)
     * @return 페이징된 문서 목록
     */
    RagDocumentListResponse listDocuments(UUID projectId, Integer page, Integer size);

    /**
     * 문서 삭제
     *
     * @param documentId 삭제할 문서 ID
     * @return 삭제 결과 메시지
     */
    String deleteDocument(UUID documentId);

    /**
     * 문서 다운로드
     *
     * @param documentId 다운로드할 문서 ID
     * @return 파일 데이터 바이트 배열
     */
    byte[] downloadDocument(UUID documentId);

    /**
     * 문서의 청크 조회 (페이지네이션 지원)
     *
     * @param documentId 문서 ID
     * @param skip 건너뛸 청크 수 (오프셋, 기본값: 0)
     * @param limit 반환할 청크 수 (페이지 크기, 기본값: 50)
     * @return 청크 목록 응답
     */
    RagChunkListResponse getDocumentChunks(UUID documentId, Integer skip, Integer limit);

    /**
     * TestCase를 RAG 시스템에 벡터화하여 등록
     * ICT-388: @Async로 비동기 처리되므로 반환값 없음 (void)
     *
     * @param testCaseId TestCase ID
     * @param testCaseName TestCase 이름
     * @param testCaseContent TestCase 전체 내용 (텍스트)
     * @param projectId 프로젝트 ID
     * @param uploadedBy 등록자 사용자명
     */
    void vectorizeTestCase(String testCaseId, String testCaseName, String testCaseContent,
                          UUID projectId, String uploadedBy);

    /**
     * RAG 시스템에서 TestCase 문서 삭제
     *
     * @param testCaseId TestCase ID
     */
    void deleteTestCaseFromRAG(String testCaseId);

    /**
     * ICT-388: TestCase가 RAG 시스템에 벡터화되어 있는지 확인
     *
     * @param testCaseId TestCase ID
     * @return true: 벡터화됨, false: 벡터화 안 됨
     */
    boolean isTestCaseVectorized(String testCaseId);

    /**
     * LLM 대화 응답을 RAG 벡터스토어에 저장
     *
     * @param request 대화 메시지 인덱싱 요청
     * @return 인덱싱 결과
     */
    RagConversationMessageIndexResponse indexConversationMessage(RagConversationMessageIndexRequest request);

    /**
     * RAG 벡터스토어에서 대화 메시지 제거
     *
     * @param messageId 제거 대상 메시지 ID
     */
    void deleteConversationMessage(UUID messageId);

    /**
     * 공통 문서 업로드 (모든 프로젝트에서 접근 가능)
     * projectId를 null로 설정하여 업로드
     *
     * @param file 업로드할 파일
     * @param uploadedBy 업로더 사용자명
     * @return 업로드된 문서 정보
     */
    RagDocumentResponse uploadGlobalDocument(MultipartFile file, String uploadedBy);

    /**
     * 공통 문서 목록 조회 (projectId가 null인 문서만)
     *
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 20)
     * @return 페이징된 공통 문서 목록
     */
    RagDocumentListResponse listGlobalDocuments(Integer page, Integer size);
}
