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

    UUID GLOBAL_PROJECT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

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

    /**
     * 프로젝트 문서를 공통 RAG 문서 영역으로 이동
     *
     * @param documentId 이동할 문서 ID
     * @param requestedBy 요청자
     * @param reason 이동 사유
     * @return 이동된 문서 정보
     */
    RagDocumentResponse moveDocumentToGlobal(UUID documentId, String requestedBy, String reason);

    // ==================== LLM 분석 기능 ====================

    /**
     * LLM 분석 비용 추정
     * 분석 시작 전 예상 토큰 사용량 및 비용 계산
     *
     * @param documentId 분석할 문서 ID
     * @param request 비용 추정 요청 (LLM 모델, 프롬프트 템플릿 등)
     * @return 예상 비용 정보 (토큰 수, USD 비용, 경고 메시지)
     */
    RagCostEstimateResponse estimateAnalysisCost(UUID documentId, RagCostEstimateRequest request);

    /**
     * 문서의 모든 청크를 LLM으로 순차 분석
     * 백그라운드 작업으로 실행되며, 상태 조회 API로 진행 상황 확인
     *
     * @param documentId 분석할 문서 ID
     * @param request LLM 분석 요청 (LLM 설정, 프롬프트, 배치 크기 등)
     * @return 분석 작업 시작 응답 (작업 ID, 상태)
     */
    RagLlmAnalysisResponse analyzeDocumentWithLlm(UUID documentId, RagLlmAnalysisRequest request);

    /**
     * LLM 분석 진행 상황 조회
     * 처리된 청크 수, 진행률, 비용 정보 반환
     *
     * @param documentId 문서 ID
     * @return 분석 진행 상황 (상태, 진행률, 비용 등)
     */
    RagLlmAnalysisStatusResponse getLlmAnalysisStatus(UUID documentId);

    /**
     * LLM 분석 결과 조회 (페이지네이션)
     * 청크별 분석 결과, LLM 응답, 토큰 사용량 반환
     *
     * @param documentId 문서 ID
     * @param skip 건너뛸 결과 수 (오프셋, 기본값: 0)
     * @param limit 반환할 결과 수 (페이지 크기, 기본값: 50)
     * @return 분석 결과 목록
     */
    RagLlmAnalysisResultsResponse getLlmAnalysisResults(UUID documentId, Integer skip, Integer limit);

    /**
     * LLM 분석 일시정지
     * 현재 배치 처리 후 분석 중단 (재개 가능)
     *
     * @param documentId 문서 ID
     * @return 일시정지 결과 (처리된 청크 수, 실제 비용)
     */
    RagLlmAnalysisStatusResponse pauseAnalysis(UUID documentId);

    /**
     * LLM 분석 재개
     * 일시정지된 지점부터 분석 계속
     *
     * @param documentId 문서 ID
     * @return 재개 결과 (남은 청크 수)
     */
    RagLlmAnalysisStatusResponse resumeAnalysis(UUID documentId);

    /**
     * LLM 분석 취소
     * 분석 완전 중단 (재개 불가, 지금까지 결과는 보존)
     *
     * @param documentId 문서 ID
     * @return 취소 결과 (처리된 청크 수, 총 비용)
     */
    RagLlmAnalysisStatusResponse cancelAnalysis(UUID documentId);

    /**
     * LLM 분석 작업 목록 조회
     * 프로젝트별 또는 전체 LLM 분석 작업 목록 조회
     *
     * @param projectId 프로젝트 ID (선택, null이면 전체)
     * @param status 작업 상태 필터 (선택, null이면 전체)
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 20)
     * @return LLM 분석 작업 목록
     */
    RagLlmAnalysisJobListResponse listLlmAnalysisJobs(UUID projectId, String status, Integer page, Integer size);

    // ==================== 분석 요약 CRUD ====================

    /**
     * 분석 요약 생성
     * 사용자가 분석 결과를 정리하여 저장
     *
     * @param request 요약 생성 요청 (제목, 내용, 태그 등)
     * @return 생성된 요약 정보
     */
    RagAnalysisSummaryResponse createAnalysisSummary(RagAnalysisSummaryRequest request);

    /**
     * 분석 요약 조회
     *
     * @param summaryId 요약 ID
     * @return 요약 정보
     */
    RagAnalysisSummaryResponse getAnalysisSummary(UUID summaryId);

    /**
     * 분석 요약 목록 조회 (필터링 지원)
     *
     * @param documentId 문서 ID (선택, null이면 전체)
     * @param userId 사용자 ID (선택, null이면 전체)
     * @param isPublic 공개 여부 필터 (선택, null이면 전체)
     * @param skip 건너뛸 요약 수 (오프셋, 기본값: 0)
     * @param limit 반환할 요약 수 (페이지 크기, 기본값: 20)
     * @return 요약 목록
     */
    java.util.List<RagAnalysisSummaryResponse> listAnalysisSummaries(
            UUID documentId, UUID userId, Boolean isPublic, Integer skip, Integer limit);

    /**
     * 분석 요약 수정
     *
     * @param summaryId 요약 ID
     * @param request 수정할 요약 정보
     * @return 수정된 요약 정보
     */
    RagAnalysisSummaryResponse updateAnalysisSummary(UUID summaryId, RagAnalysisSummaryRequest request);

    /**
     * 분석 요약 삭제
     *
     * @param summaryId 요약 ID
     * @return 삭제 결과 메시지
     */
    String deleteAnalysisSummary(UUID summaryId);
}
