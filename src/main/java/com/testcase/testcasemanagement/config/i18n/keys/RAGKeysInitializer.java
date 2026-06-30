// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/RAGKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RAGKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // RAG Manager 관련 키들
    createTranslationKeyIfNotExists(
        "rag.manager.noProject", "rag", "프로젝트 미선택 메시지", "프로젝트를 먼저 선택해주세요.");

    // Document Upload 관련 키들
    createTranslationKeyIfNotExists("rag.upload.title", "rag", "문서 업로드 제목", "문서 업로드");
    createTranslationKeyIfNotExists(
        "rag.upload.description",
        "rag",
        "문서 업로드 설명",
        "PDF, DOCX, DOC, TXT 파일을 업로드하여 RAG 시스템에 등록할 수 있습니다. (최대 50MB)");
    createTranslationKeyIfNotExists(
        "rag.upload.dragAndDrop", "rag", "드래그 앤 드롭 안내", "파일을 이곳에 드래그하거나 클릭하여 선택하세요");
    createTranslationKeyIfNotExists("rag.upload.selectFiles", "rag", "파일 선택 버튼", "파일 선택");
    createTranslationKeyIfNotExists("rag.upload.selectedFiles", "rag", "선택된 파일 레이블", "선택된 파일");
    createTranslationKeyIfNotExists("rag.upload.uploading", "rag", "업로드 중 상태", "업로드 중");
    createTranslationKeyIfNotExists("rag.upload.upload", "rag", "업로드 버튼", "업로드");
    createTranslationKeyIfNotExists(
        "rag.upload.error.unsupportedFileType",
        "rag",
        "지원하지 않는 파일 형식 에러",
        "지원하지 않는 파일 형식입니다. (PDF, DOCX, DOC, TXT만 가능)");
    createTranslationKeyIfNotExists(
        "rag.upload.error.fileTooLarge", "rag", "파일 크기 초과 에러", "파일 크기가 너무 큽니다. (최대 {maxSize}MB)");
    createTranslationKeyIfNotExists(
        "rag.upload.error.noFilesSelected", "rag", "파일 미선택 에러", "업로드할 파일을 선택해주세요.");

    // Document Parser 관련 키들
    createTranslationKeyIfNotExists("rag.upload.parser.label", "rag", "파서 선택 라벨", "문서 분석 파서");
    createTranslationKeyIfNotExists(
        "rag.upload.parser.pypdf2.description", "rag", "pypdf2 파서 설명", "기본 로컬 파서");
    createTranslationKeyIfNotExists(
        "rag.upload.parser.pymupdf.description", "rag", "pymupdf 파서 설명", "다양한 기능을 갖춘 빠른 로컬 파서");
    createTranslationKeyIfNotExists(
        "rag.upload.parser.pymupdf4llm.description", "rag", "pymupdf4llm 파서 설명", "LLM 최적화 마크다운 추출");
    createTranslationKeyIfNotExists(
        "rag.upload.parser.upstage.description",
        "rag",
        "upstage 파서 설명",
        "고급 레이아웃 분석이 가능한 클라우드 API (upstage_api_key 필요)");

    // Document List 관련 키들
    createTranslationKeyIfNotExists("rag.document.status.pending", "rag", "문서 상태 대기 중", "대기 중");
    createTranslationKeyIfNotExists("rag.document.status.analyzing", "rag", "문서 상태 분석 중", "분석 중");
    createTranslationKeyIfNotExists("rag.document.status.completed", "rag", "문서 상태 완료", "완료");
    createTranslationKeyIfNotExists("rag.document.status.failed", "rag", "문서 상태 실패", "실패");
    createTranslationKeyIfNotExists("rag.document.empty", "rag", "문서 없음 메시지", "업로드된 문서가 없습니다");
    createTranslationKeyIfNotExists(
        "rag.document.emptyDescription", "rag", "문서 없음 설명", "상단의 업로드 영역을 사용하여 문서를 등록하세요");
    createTranslationKeyIfNotExists("rag.document.list.title", "rag", "문서 목록 제목", "업로드된 문서");
    createTranslationKeyIfNotExists("rag.document.list.fileName", "rag", "파일명 컬럼", "파일명");
    createTranslationKeyIfNotExists("rag.document.list.fileSize", "rag", "파일 크기 컬럼", "크기");
    createTranslationKeyIfNotExists("rag.document.list.status", "rag", "상태 컬럼", "상태");
    createTranslationKeyIfNotExists("rag.document.list.chunks", "rag", "청크 수 컬럼", "청크 수");
    createTranslationKeyIfNotExists("rag.document.list.uploadDate", "rag", "업로드 일시 컬럼", "업로드 일시");
    createTranslationKeyIfNotExists("rag.document.list.actions", "rag", "작업 컬럼", "작업");
    createTranslationKeyIfNotExists("rag.document.download", "rag", "문서 다운로드 버튼", "문서 다운로드");
    createTranslationKeyIfNotExists("rag.document.delete", "rag", "문서 삭제 버튼", "문서 삭제");
    createTranslationKeyIfNotExists(
        "rag.document.deleteDialog.title", "rag", "문서 삭제 확인 다이얼로그 제목", "문서 삭제 확인");
    createTranslationKeyIfNotExists(
        "rag.document.deleteDialog.message",
        "rag",
        "문서 삭제 확인 메시지",
        "이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.pagination.rowsPerPage", "rag", "페이지당 행 수 라벨", "페이지당 행 수:");
    createTranslationKeyIfNotExists("rag.document.viewChunks", "rag", "청크 보기 버튼", "청크 보기");
    createTranslationKeyIfNotExists(
        "rag.document.list.llmSummaryStatus", "rag", "LLM 요약 상태 컬럼", "LLM 요약 상태");
    createTranslationKeyIfNotExists(
        "rag.document.list.summaryProgress", "rag", "요약 진행률 컬럼", "요약 진행율");
    createTranslationKeyIfNotExists("rag.document.list.analyzedChunks", "rag", "분석 청크 컬럼", "분석 청크");
    createTranslationKeyIfNotExists("rag.document.list.parser", "rag", "파서 컬럼", "파서");
    createTranslationKeyIfNotExists("rag.document.list.embeddingStatus", "rag", "임베딩 상태 컬럼", "임베딩");
    createTranslationKeyIfNotExists("rag.document.embedding.pending", "rag", "임베딩 대기중", "대기 중");
    createTranslationKeyIfNotExists("rag.document.embedding.generating", "rag", "임베딩 생성중", "생성 중");
    createTranslationKeyIfNotExists("rag.document.embedding.completed", "rag", "임베딩 완료", "완료");
    createTranslationKeyIfNotExists("rag.document.embedding.failed", "rag", "임베딩 실패", "실패");
    // LLM 분석 상태 메시지
    createTranslationKeyIfNotExists(
        "rag.llmAnalysis.status.notStartedMessage",
        "rag",
        "LLM 분석 미실행 안내 메시지",
        "아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.");
    createTranslationKeyIfNotExists(
        "rag.llmAnalysis.status.errorMessage", "rag", "LLM 분석 중 오류 발생 메시지", "분석 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "rag.llmAnalysis.status.processingPausedMessage",
        "rag",
        "LLM 분석 진행/일시정지 중 메시지",
        "LLM 분석이 진행 중입니다. 현재까지 분석된 {analyzedChunks}개 청크의 결과를 확인할 수 있습니다.");
    // ICT-388: 문서/테스트케이스 분리 표시
    createTranslationKeyIfNotExists(
        "rag.document.list.regularDocuments", "rag", "업로드된 문서 섹션 제목", "업로드된 문서");
    createTranslationKeyIfNotExists(
        "rag.document.list.testCaseDocuments", "rag", "테스트케이스 문서 섹션 제목", "테스트케이스 문서");
    createTranslationKeyIfNotExists("rag.document.list.uploadButton", "rag", "문서 업로드 버튼", "문서 업로드");

    // Similar Test Cases 검색 관련 키들
    createTranslationKeyIfNotExists("rag.similar.title", "rag", "유사 검색 제목", "유사 검색");
    createTranslationKeyIfNotExists(
        "rag.similar.description",
        "rag",
        "유사 검색 설명",
        "키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트 케이스 또는 문서를 찾아줍니다.");
    createTranslationKeyIfNotExists("rag.similar.searchQuery", "rag", "검색어 입력 라벨", "검색어");
    createTranslationKeyIfNotExists(
        "rag.similar.searchPlaceholder", "rag", "검색어 플레이스홀더", "예: 로그인 기능 테스트, 회원가입 유효성 검사");
    createTranslationKeyIfNotExists("rag.similar.search", "rag", "검색 버튼", "검색");
    createTranslationKeyIfNotExists("rag.similar.searching", "rag", "검색 중 상태", "검색 중...");
    createTranslationKeyIfNotExists(
        "rag.similar.noResults", "rag", "검색 결과 없음 메시지", "검색 결과가 없습니다. 다른 키워드로 시도해보세요.");
    createTranslationKeyIfNotExists(
        "rag.similar.resultsCount", "rag", "검색 결과 개수", "검색 결과 ({count}개)");
    // ICT-388: 검색 결과 분리 표시
    createTranslationKeyIfNotExists(
        "rag.similar.testCaseResults", "rag", "테스트케이스 검색 결과 섹션 제목", "테스트케이스");
    createTranslationKeyIfNotExists("rag.similar.documentResults", "rag", "문서 검색 결과 섹션 제목", "문서");
    createTranslationKeyIfNotExists(
        "rag.similar.metadata", "rag", "문서 메타데이터", "문서 ID: {documentId} | 청크 순서: {chunkIndex}");
    createTranslationKeyIfNotExists("rag.similar.copy", "rag", "복사 버튼", "복사");
    createTranslationKeyIfNotExists(
        "rag.similar.addTestCase", "rag", "테스트케이스로 추가 버튼", "테스트케이스로 추가");
    createTranslationKeyIfNotExists("rag.similar.unknownDocument", "rag", "알 수 없는 문서", "알 수 없음");
    createTranslationKeyIfNotExists(
        "rag.similar.testCaseTitle", "rag", "테스트케이스 제목 템플릿", "테스트케이스 - {fileName}");
    createTranslationKeyIfNotExists("rag.similar.sourceTestcase", "rag", "출처 타입: 테스트케이스", "테스트케이스");
    createTranslationKeyIfNotExists("rag.similar.sourceDocument", "rag", "문서 소스 타입", "문서");
    createTranslationKeyIfNotExists(
        "rag.similar.noHighSimilarityResults",
        "rag",
        "81% 이상 유사도 없음 메시지",
        "81% 이상의 유사도를 가진 문서가 없습니다. 아래에서 유사도가 낮은 결과를 확인하세요.");
    createTranslationKeyIfNotExists(
        "rag.similar.lowSimilarityCollapsed", "rag", "유사도 낮음 결과 접힘", "유사도 낮음 (클릭하여 보기)");

    // 고급 검색 설정 관련 키들
    createTranslationKeyIfNotExists(
        "rag.similar.advancedSettings", "rag", "고급 검색 설정 제목", "고급 검색 설정");
    createTranslationKeyIfNotExists(
        "rag.similar.advancedSettings.enabled", "rag", "고급 검색 활성화 상태", "활성화");
    createTranslationKeyIfNotExists(
        "rag.similar.advancedSettings.disabled", "rag", "고급 검색 비활성화 상태", "비활성화");
    createTranslationKeyIfNotExists(
        "rag.similar.advancedSettings.use", "rag", "고급 검색 사용 토글", "고급 검색 사용");
    createTranslationKeyIfNotExists("rag.similar.searchMethod", "rag", "검색 방법 선택 라벨", "검색 방법");
    createTranslationKeyIfNotExists("rag.similar.searchMethod.vector", "rag", "벡터 검색 방법명", "벡터 검색");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.vector.description", "rag", "벡터 검색 설명", "의미적 유사도 기반 (순수 벡터)");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.bm25", "rag", "BM25 검색 방법명", "BM25 검색");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.bm25.description", "rag", "BM25 검색 설명", "키워드 기반 (정확한 단어 매칭)");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybrid", "rag", "하이브리드 검색 방법명", "하이브리드 검색");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybrid.description", "rag", "하이브리드 검색 설명", "벡터 + BM25 결합 (RRF)");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybridRerank",
        "rag",
        "하이브리드 + Reranker 방법명",
        "하이브리드 + Reranker ⭐");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybridRerank.description",
        "rag",
        "하이브리드 + Reranker 설명",
        "최고 품질 (권장) - 느림");
    createTranslationKeyIfNotExists(
        "rag.similar.weightAdjustment", "rag", "검색 가중치 조정 제목", "검색 가중치 조정");
    createTranslationKeyIfNotExists(
        "rag.similar.vectorWeight", "rag", "벡터 검색 가중치 라벨", "벡터 검색: {weight}%");
    createTranslationKeyIfNotExists(
        "rag.similar.bm25Weight", "rag", "BM25 검색 가중치 라벨", "BM25 검색: {weight}%");
    createTranslationKeyIfNotExists(
        "rag.similar.recommendedSettings", "rag", "추천 설정 안내", "추천 설정: 벡터 60% + BM25 40% (한국어 최적화)");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.vector.info",
        "rag",
        "벡터 검색 정보",
        "📊 의미적 유사도를 기반으로 검색합니다. 비슷한 의미를 가진 문서를 찾습니다.");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.bm25.info",
        "rag",
        "BM25 검색 정보",
        "🔍 키워드 기반 검색입니다. 정확한 단어 매칭에 강합니다.");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybrid.info",
        "rag",
        "하이브리드 검색 정보",
        "⚡ 벡터와 BM25를 결합하여 균형잡힌 검색 결과를 제공합니다.");
    createTranslationKeyIfNotExists(
        "rag.similar.searchMethod.hybridRerank.info",
        "rag",
        "하이브리드 + Reranker 정보",
        "⭐ 하이브리드 검색 후 Reranker로 재순위를 매겨 최고 품질의 결과를 제공합니다. (처리 시간: 약 2-3배)");

    // ProjectHeader RAG 탭 관련 키들
    createTranslationKeyIfNotExists("projectHeader.tabs.ragDocuments", "rag", "RAG 문서 탭", "RAG 문서");

    // RAG Chat Interface 관련 키들
    createTranslationKeyIfNotExists("rag.chat.title", "rag", "AI 질의응답 제목", "AI 질의응답");
    createTranslationKeyIfNotExists("rag.chat.exitFullScreen", "rag", "전체화면 종료", "전체화면 종료");
    createTranslationKeyIfNotExists("rag.chat.enterFullScreen", "rag", "전체화면 보기", "전체화면 보기");
    createTranslationKeyIfNotExists("rag.chat.retry", "rag", "재시도", "재시도");
    createTranslationKeyIfNotExists("rag.chat.clear", "rag", "대화 초기화", "대화 초기화");
    createTranslationKeyIfNotExists("rag.chat.persistToggle", "rag", "대화 자동 저장 토글", "대화 자동 저장");
    createTranslationKeyIfNotExists(
        "rag.chat.useRagSearch", "rag", "RAG 문서 우선 검색 토글", "RAG 문서 우선 검색");
    createTranslationKeyIfNotExists("rag.chat.threadSelectLabel", "rag", "스레드 선택 라벨", "저장된 스레드");
    createTranslationKeyIfNotExists("rag.chat.threadAutoOption", "rag", "자동 생성 옵션", "새 스레드 자동 생성");
    createTranslationKeyIfNotExists("rag.chat.untitledThread", "rag", "제목 없는 스레드", "제목 없는 스레드");
    createTranslationKeyIfNotExists("rag.chat.refreshThreads", "rag", "스레드 새로 고침", "스레드 새로 고침");
    createTranslationKeyIfNotExists("rag.chat.deleteThread", "rag", "스레드 삭제", "스레드 삭제");
    createTranslationKeyIfNotExists("rag.chat.createThread", "rag", "새 스레드 생성", "새 스레드");
    createTranslationKeyIfNotExists("rag.chat.manageThreadsAction", "rag", "스레드 관리 액션", "스레드 관리");
    createTranslationKeyIfNotExists("rag.chat.categorySelectLabel", "rag", "카테고리 선택 라벨", "카테고리");
    createTranslationKeyIfNotExists("rag.chat.empty", "rag", "채팅 빈 화면 메시지", "문서에 대해 질문해보세요.");
    createTranslationKeyIfNotExists(
        "rag.chat.placeholder", "rag", "메시지 입력 플레이스홀더", "메시지를 입력하세요...");
    createTranslationKeyIfNotExists(
        "rag.chat.hint", "rag", "입력 힌트", "Shift + Enter: 줄바꿈 | Enter: 전송");
    createTranslationKeyIfNotExists(
        "rag.chat.deleteThreadConfirm",
        "rag",
        "스레드 삭제 확인 메시지",
        "현재 스레드를 삭제하시겠습니까? 대화 내용이 모두 삭제됩니다.");
    createTranslationKeyIfNotExists("rag.chat.threadTitleLabel", "rag", "스레드 제목 라벨", "제목");
    createTranslationKeyIfNotExists(
        "rag.chat.threadDescriptionLabel", "rag", "스레드 설명 라벨", "설명 (선택)");
    createTranslationKeyIfNotExists("rag.chat.threadCreateAction", "rag", "생성 버튼", "생성");
    createTranslationKeyIfNotExists("rag.chat.editResponse", "rag", "응답 편집", "응답 편집");
    createTranslationKeyIfNotExists(
        "rag.chat.editPlaceholder", "rag", "편집 플레이스홀더", "수정할 답변 내용을 입력하세요.");
    createTranslationKeyIfNotExists("rag.chat.deleteMessageTitle", "rag", "메시지 삭제 제목", "응답 삭제");
    createTranslationKeyIfNotExists(
        "rag.chat.deleteMessageConfirm", "rag", "메시지 삭제 확인", "이 응답을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadTitleRequired", "rag", "제목 필수 입력 메시지", "스레드 제목을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadCreateFailed", "rag", "스레드 생성 실패 메시지", "스레드를 생성하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadDeleteFailed", "rag", "스레드 삭제 실패 메시지", "스레드를 삭제하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.editFailed", "rag", "메시지 편집 실패 메시지", "메시지를 수정하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.messageDeleteFailed", "rag", "메시지 삭제 실패 메시지", "메시지를 삭제하지 못했습니다.");

    // RAG Thread Manager Dialog 관련 키들
    createTranslationKeyIfNotExists(
        "rag.chat.manageThreads", "rag", "스레드 관리 다이얼로그 제목", "대화 스레드 관리");
    createTranslationKeyIfNotExists("rag.chat.threadListLabel", "rag", "스레드 목록 라벨", "스레드 목록");
    createTranslationKeyIfNotExists("rag.chat.threadEmpty", "rag", "스레드 없음 메시지", "저장된 스레드가 없습니다.");
    createTranslationKeyIfNotExists("rag.chat.threadDetailsLabel", "rag", "스레드 상세 라벨", "스레드 상세");
    createTranslationKeyIfNotExists("rag.chat.refresh", "rag", "새로 고침", "새로 고침");
    createTranslationKeyIfNotExists(
        "rag.chat.threadNotFound", "rag", "스레드 찾을 수 없음", "선택한 스레드를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadLoadError", "rag", "스레드 로드 실패", "스레드를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadUpdateError", "rag", "스레드 수정 실패", "스레드를 수정하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.threadDeleteError", "rag", "스레드 삭제 실패", "스레드를 삭제하지 못했습니다.");
    createTranslationKeyIfNotExists("rag.chat.threadArchivedLabel", "rag", "보관 처리 라벨", "보관 처리");
    createTranslationKeyIfNotExists("rag.chat.threadMessagesLabel", "rag", "대화 내용 라벨", "대화 내용");
    createTranslationKeyIfNotExists(
        "rag.chat.threadMessagesEmpty", "rag", "대화 메시지 없음", "대화 메시지가 없습니다.");
    createTranslationKeyIfNotExists("rag.chat.roleAssistant", "rag", "어시스턴트 역할", "어시스턴트");
    createTranslationKeyIfNotExists("rag.chat.roleUser", "rag", "사용자 역할", "사용자");
    createTranslationKeyIfNotExists("rag.chat.threadDeleteAction", "rag", "삭제 액션", "삭제");
    createTranslationKeyIfNotExists("rag.chat.threadSaveAction", "rag", "저장 액션", "저장");

    // LLM 설정 체크 관련 키들
    createTranslationKeyIfNotExists(
        "rag.chat.llmNotConfigured", "rag", "LLM 미설정 제목", "기본 LLM 설정이 필요합니다");
    createTranslationKeyIfNotExists(
        "rag.chat.llmNotConfiguredMessage",
        "rag",
        "LLM 미설정 안내 메시지",
        "AI 질의응답 기능을 사용하려면 관리자가 LLM(Language Model)을 기본값으로 설정해야 합니다. 관리자에게 문의해주세요.");
    createTranslationKeyIfNotExists("rag.chat.recheckLlm", "rag", "LLM 재확인 버튼", "다시 확인");
    createTranslationKeyIfNotExists(
        "rag.chat.checkingLlm", "rag", "LLM 확인 중 메시지", "LLM 설정 확인 중...");
    createTranslationKeyIfNotExists(
        "rag.chat.generatingAnswer", "rag", "AI 답변 생성 중 메시지", "AI가 답변을 생성하고 있습니다...");

    // Document Chunks 관련 키들
    createTranslationKeyIfNotExists(
        "rag.chunks.dialog.title", "rag", "문서 청크 보기 다이얼로그 제목", "문서 청크 보기");
    createTranslationKeyIfNotExists("rag.chunks.showMore", "rag", "청크 더보기 버튼", "더보기");
    createTranslationKeyIfNotExists("rag.chunks.showLess", "rag", "청크 간략히 버튼", "간략히");
    createTranslationKeyIfNotExists(
        "rag.chunks.summaryLoadFailed", "rag", "LLM 요약 로드 실패 메시지", "LLM 요약을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "rag.chunks.empty", "rag", "청크 없음 메시지", "청크가 없습니다. 문서를 먼저 분석해주세요.");
    createTranslationKeyIfNotExists(
        "rag.chunks.filteredMode", "rag", "필터 모드 레이블", "AI가 참조한 청크만 표시");
    createTranslationKeyIfNotExists("rag.chunks.loaded", "rag", "로드된 청크 수 레이블", "로드됨");
    createTranslationKeyIfNotExists("rag.chunks.scrollForMore", "rag", "스크롤 안내 메시지", "스크롤하여 더 보기");
    createTranslationKeyIfNotExists(
        "rag.chunks.viewLlmSummary", "rag", "LLM 분석 요약 보기 툴팁", "LLM 분석 요약 보기");
    createTranslationKeyIfNotExists("rag.chunks.metadata", "rag", "메타데이터 레이블", "메타데이터");
    createTranslationKeyIfNotExists(
        "rag.chunks.loadingMore", "rag", "추가 청크 로딩 중 메시지", "추가 청크 로딩 중...");
    createTranslationKeyIfNotExists(
        "rag.chunks.allLoaded", "rag", "모든 청크 로드 완료 메시지", "모든 청크를 불러왔습니다");
    createTranslationKeyIfNotExists(
        "rag.chunks.viewCombinedSummary", "rag", "LLM 분석 요약 보기 버튼 툴팁", "LLM 분석 요약 보기");
    createTranslationKeyIfNotExists(
        "rag.chunks.documentSummaryTitle", "rag", "LLM 분석 요약 다이얼로그 제목", "LLM 분석 요약");
    createTranslationKeyIfNotExists(
        "rag.chunks.noLlmSummary", "rag", "LLM 분석 요약 없음 메시지", "아직 확인할 수 있는 LLM 분석 요약이 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.chunks.loadingLlmSummary", "rag", "LLM 분석 요약 로딩 중 메시지", "LLM 분석 요약을 불러오는 중입니다...");
    createTranslationKeyIfNotExists("rag.chunks.chunkLabel", "rag", "청크 레이블", "청크");
    createTranslationKeyIfNotExists(
        "rag.chunks.llmSummaryTitle", "rag", "LLM 분석 요약 제목", "LLM 분석 요약");
    createTranslationKeyIfNotExists("rag.chunks.originalText", "rag", "원본 텍스트 레이블", "원본 텍스트");
    createTranslationKeyIfNotExists("rag.chunks.llmAnalysis", "rag", "LLM 분석 결과 레이블", "LLM 분석 결과");
    createTranslationKeyIfNotExists(
        "rag.chunks.summaryNotReady", "rag", "요약 준비 안됨 메시지", "아직 요약을 확인할 수 없습니다.");
    createTranslationKeyIfNotExists("rag.preview.loading", "rag", "PDF 로딩 중 메시지", "PDF를 불러오는 중...");

    // PDF 미리보기 관련 키
    createTranslationKeyIfNotExists(
        "rag.preview.pdfOnly", "rag", "PDF만 미리보기 가능 메시지", "PDF 파일만 미리보기가 가능합니다");
    createTranslationKeyIfNotExists("rag.preview.error", "rag", "미리보기 오류 메시지", "미리보기를 불러올 수 없습니다");

    // 공통 문서 승격 관련 키
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteAction", "rag", "공통 문서로 승격 액션", "공통 문서로 승격");
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteTitle", "rag", "공통 문서 승격 제목", "공통 문서로 승격");
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteDescription",
        "rag",
        "공통 문서 승격 설명",
        "이 문서를 모든 프로젝트에서 사용할 수 있는 공통 문서로 승격하시겠습니까?");
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteReason", "rag", "승격 사유 입력", "승격 사유");
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteSuccess", "rag", "승격 성공 메시지", "공통 문서로 승격되었습니다");
    createTranslationKeyIfNotExists(
        "rag.document.global.requestDescription",
        "rag",
        "공통 문서 등록 요청 설명",
        "이 문서를 모든 프로젝트에서 사용할 수 있는 공통 문서로 등록을 요청하시겠습니까?");
    createTranslationKeyIfNotExists(
        "rag.document.global.requestMessage", "rag", "공통 문서 등록 요청 메시지 입력", "요청 메시지");

    // RAG 분석 관련 추가 키
    createTranslationKeyIfNotExists(
        "rag.analysis.defaultOnlyInfo", "rag", "기본 문서만 사용 정보", "현재 기본으로 설정된 문서만 사용됩니다");

    // 관리자 공통 문서 요청 관리 관련 키
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.approveNote", "rag", "승인 노트 입력", "승인 노트");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.approved", "rag", "승인 완료 메시지", "요청이 승인되었습니다");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.approveFailed", "rag", "승인 실패 메시지", "승인에 실패했습니다");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.rejectNote", "rag", "거부 노트 입력", "거부 사유");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.rejected", "rag", "거부 완료 메시지", "요청이 거부되었습니다");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.requests.rejectFailed", "rag", "거부 실패 메시지", "거부에 실패했습니다");

    // Document Analysis 관련 키들
    createTranslationKeyIfNotExists("rag.analysis.llmConfig", "rag", "LLM 설정 제목", "LLM 설정");
    createTranslationKeyIfNotExists(
        "rag.analysis.noActiveConfigs",
        "rag",
        "활성화된 LLM 설정 없음 메시지",
        "활성화된 LLM 설정이 없습니다. LLM 설정 페이지에서 설정을 추가하고 활성화하세요.");
    createTranslationKeyIfNotExists(
        "rag.analysis.selectConfig", "rag", "LLM 설정 선택 라벨", "LLM 설정 선택");
    createTranslationKeyIfNotExists("rag.analysis.defaultBadge", "rag", "기본 배지", "[기본]");
    createTranslationKeyIfNotExists(
        "rag.analysis.selectedConfigInfo", "rag", "선택된 설정 정보 제목", "선택된 설정 정보");
    createTranslationKeyIfNotExists("rag.analysis.provider", "rag", "제공자 라벨", "제공자:");
    createTranslationKeyIfNotExists("rag.analysis.model", "rag", "모델 라벨", "모델:");
    createTranslationKeyIfNotExists("rag.analysis.apiUrl", "rag", "API URL 라벨", "API URL:");
    createTranslationKeyIfNotExists("rag.analysis.defaultValue", "rag", "기본값 텍스트", "기본값");
    createTranslationKeyIfNotExists("rag.analysis.apiKey", "rag", "API 키 라벨", "API 키 (선택)");
    createTranslationKeyIfNotExists(
        "rag.analysis.apiKeyHelper", "rag", "API 키 도움말", "비워두면 선택한 LLM 설정에 저장된 API 키 사용");
    createTranslationKeyIfNotExists(
        "rag.analysis.promptTemplate", "rag", "프롬프트 템플릿 라벨", "프롬프트 템플릿");
    createTranslationKeyIfNotExists(
        "rag.analysis.promptTemplateHelper", "rag", "프롬프트 템플릿 도움말", "{chunk_text} 플레이스홀더를 사용하세요");
    createTranslationKeyIfNotExists("rag.analysis.maxTokens", "rag", "최대 토큰 라벨", "최대 토큰");
    createTranslationKeyIfNotExists("rag.analysis.temperature", "rag", "온도 라벨", "온도");
    createTranslationKeyIfNotExists("rag.analysis.batchSize", "rag", "배치 크기 라벨", "배치 크기 (청크 개수)");
    createTranslationKeyIfNotExists(
        "rag.analysis.batchSizeHelper", "rag", "배치 크기 도움말", "한 번에 처리할 청크 개수");
    createTranslationKeyIfNotExists(
        "rag.analysis.pauseAfterBatch", "rag", "배치마다 일시정지 라벨", "배치마다 일시정지");
    createTranslationKeyIfNotExists(
        "rag.analysis.pauseAfterBatchTooltip", "rag", "배치마다 일시정지 툴팁", "배치마다 일시정지하고 사용자 확인을 기다립니다");
    createTranslationKeyIfNotExists(
        "rag.analysis.continueTooltip", "rag", "계속 분석 툴팁", "모든 청크를 중단 없이 계속 분석합니다");
    createTranslationKeyIfNotExists("rag.analysis.progress", "rag", "진행 상황 제목", "진행 상황");
    createTranslationKeyIfNotExists("rag.analysis.processing", "rag", "처리 중 텍스트", "처리 중:");
    createTranslationKeyIfNotExists("rag.analysis.chunkNumber", "rag", "청크 번호 템플릿", "{number}번 청크");
    createTranslationKeyIfNotExists("rag.analysis.completed", "rag", "완료 텍스트", "완료: {count}개");
    createTranslationKeyIfNotExists("rag.analysis.total", "rag", "전체 텍스트", "/ 전체 {count} 청크");
    createTranslationKeyIfNotExists("rag.analysis.cost", "rag", "비용 라벨", "비용:");
    createTranslationKeyIfNotExists("rag.analysis.results", "rag", "분석 결과 제목", "분석 결과");
    createTranslationKeyIfNotExists("rag.analysis.originalText", "rag", "원본 텍스트 컬럼", "원본 텍스트");
    createTranslationKeyIfNotExists("rag.analysis.llmResponse", "rag", "LLM 응답 컬럼", "LLM 응답");
    createTranslationKeyIfNotExists("rag.analysis.tokens", "rag", "토큰 컬럼", "토큰");
    createTranslationKeyIfNotExists("rag.analysis.estimateCost", "rag", "비용 추정 버튼", "비용 추정");
    createTranslationKeyIfNotExists("rag.analysis.stop", "rag", "중단 버튼", "중단");
    createTranslationKeyIfNotExists("rag.analysis.resume", "rag", "재개 버튼", "재개");
    createTranslationKeyIfNotExists("rag.analysis.pause", "rag", "일시정지 버튼", "일시정지");

    // 비용 경고 다이얼로그
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.title", "rag", "비용 경고 다이얼로그 제목", "LLM 분석 비용 예상");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.highCostAlert",
        "rag",
        "비용 경고 메시지",
        "이 작업은 비용이 많이 발생할 수 있습니다. 계속하시겠습니까?");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.modelSection", "rag", "LLM 모델 섹션 제목", "LLM 모델");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.targetSection", "rag", "분석 대상 섹션 제목", "분석 대상");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.chunkCount", "rag", "청크 수 라벨", "총 {count} 개 청크");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.tokenUsageSection", "rag", "토큰 사용량 섹션 제목", "예상 토큰 사용량");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.inputTokens", "rag", "입력 토큰 라벨", "입력 토큰");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.outputTokens", "rag", "출력 토큰 라벨", "출력 토큰");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.totalTokens", "rag", "총 토큰 라벨", "총 토큰");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.costSection", "rag", "비용 섹션 제목", "예상 비용 (USD)");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.inputCost", "rag", "입력 비용 라벨", "입력 비용");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.outputCost", "rag", "출력 비용 라벨", "출력 비용");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.totalCost", "rag", "총 예상 비용 라벨", "총 예상 비용");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.costPerChunk", "rag", "청크당 비용 라벨", "(청크당 약 ${cost})");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.priceSection", "rag", "가격표 섹션 제목", "모델 가격표 (1K 토큰 기준)");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.priceInput", "rag", "가격표 입력 라벨", "입력");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.priceOutput", "rag", "가격표 출력 라벨", "출력");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.confirm", "rag", "비용 경고 확인 버튼", "확인 및 분석 시작");
    createTranslationKeyIfNotExists(
        "rag.analysis.costWarning.starting", "rag", "비용 경고 로딩 텍스트", "시작 중...");

    // 에러 메시지
    createTranslationKeyIfNotExists(
        "rag.analysis.error.costEstimate", "rag", "비용 추정 실패 메시지", "비용 추정에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.statusCheck", "rag", "상태 확인 실패 메시지", "분석 상태 확인에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.startAnalysis", "rag", "분석 시작 실패 메시지", "LLM 분석 시작에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.resume", "rag", "재개 실패 메시지", "분석 재개에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.restart", "rag", "재시작 실패 메시지", "분석 재시작에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.pause", "rag", "일시정지 실패 메시지", "일시정지에 실패했습니다.");
    createTranslationKeyIfNotExists("rag.analysis.error.cancel", "rag", "취소 실패 메시지", "취소에 실패했습니다.");

    // Document List - 추가 번역 키들
    createTranslationKeyIfNotExists(
        "rag.document.summary.title",
        "rag",
        "LLM 분석 요약 다이얼로그 제목 템플릿",
        "LLM 분석 요약 - {documentName}");
    createTranslationKeyIfNotExists(
        "rag.document.summary.fetchFailed", "rag", "분석 결과 조회 실패 메시지", "분석 결과 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.summary.noData", "rag", "표시할 결과 없음 메시지", "표시할 결과가 없습니다.");
    createTranslationKeyIfNotExists("rag.document.list.refreshButton", "rag", "새로고침 버튼", "새로고침");
    createTranslationKeyIfNotExists(
        "rag.document.summary.totalChunksLabel", "rag", "총 청크 수 레이블", "총 {count}개 청크");
    createTranslationKeyIfNotExists(
        "rag.document.summary.analyzedChunksLabel", "rag", "분석 완료 레이블", "분석 완료: {count}개");
    createTranslationKeyIfNotExists(
        "rag.document.summary.progressLabel", "rag", "진행률 레이블", "진행률: {progress}%");
    createTranslationKeyIfNotExists(
        "rag.document.summary.resultsSummary", "rag", "LLM 분석 결과 요약 제목", "LLM 분석 결과 요약");

    // Job History 관련 번역 키들
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.title", "rag", "작업 이력 다이얼로그 제목", "작업 이력 - {fileName}");
    createTranslationKeyIfNotExists("rag.document.jobHistory.jobId", "rag", "작업 ID 컬럼", "작업 ID");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.llmProvider", "rag", "LLM 제공자 컬럼", "LLM 제공자");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.llmModel", "rag", "LLM 모델 컬럼", "LLM 모델");
    createTranslationKeyIfNotExists("rag.document.jobHistory.status", "rag", "상태 컬럼", "상태");
    createTranslationKeyIfNotExists("rag.document.jobHistory.progress", "rag", "진행률 컬럼", "진행률");
    createTranslationKeyIfNotExists("rag.document.jobHistory.chunks", "rag", "청크 컬럼", "청크");
    createTranslationKeyIfNotExists("rag.document.jobHistory.cost", "rag", "비용 컬럼", "비용 (USD)");
    createTranslationKeyIfNotExists("rag.document.jobHistory.tokens", "rag", "토큰 컬럼", "토큰");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.startTime", "rag", "시작 시각 컬럼", "시작 시각");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.completedTime", "rag", "완료 시각 컬럼", "완료 시각");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.pausedTime", "rag", "일시정지 시각 컬럼", "일시정지 시각");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.errorMessage", "rag", "에러 메시지 컬럼", "에러 메시지");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.hasError", "rag", "에러 있음 레이블", "에러 있음");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory.empty", "rag", "작업 이력 없음 메시지", "이 문서에 대한 작업 이력이 없습니다.");

    // Alert 메시지 관련 번역 키들
    createTranslationKeyIfNotExists(
        "rag.document.alert.pauseUnavailable", "rag", "일시정지 불가 경고", "진행 중인 작업만 일시정지할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.alert.resumeUnavailable", "rag", "재개 불가 경고", "일시정지된 작업만 재개할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.alert.statusLoading",
        "rag",
        "상태 로딩 중 메시지",
        "작업 상태를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    createTranslationKeyIfNotExists(
        "rag.document.alert.alreadyProcessing", "rag", "이미 진행중 메시지", "이미 분석이 진행 중입니다.");
    createTranslationKeyIfNotExists(
        "rag.document.alert.alreadyProcessingWithProgress",
        "rag",
        "이미 진행중 메시지 (진행률 포함)",
        "이미 분석이 진행 중입니다. (진행율: {progress})");

    // Error 메시지 관련 번역 키들

    // 공통 문서 요청 관련 키들
    createTranslationKeyIfNotExists(
        "rag.document.global.requestTitle", "rag", "공통 문서 등록 요청 제목", "공통 문서 등록 요청");
    createTranslationKeyIfNotExists(
        "rag.document.global.requestAction", "rag", "공통 문서 등록 요청 액션", "공통 문서 등록 요청");
    createTranslationKeyIfNotExists(
        "rag.document.global.requestSubmitted",
        "rag",
        "공통 문서 등록 요청 전송됨",
        "관리자에게 공통 문서 등록 요청이 전송되었습니다.");

    // Confirm 다이얼로그 관련 번역 키들

    // 공통 문서 관리 관련 키들
    createTranslationKeyIfNotExists(
        "admin.globalDoc.title", "rag", "공통 문서 관리 제목", "🌐 공통 RAG 문서 관리");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.description",
        "rag",
        "공통 문서 관리 설명",
        "모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스를 관리합니다. (관리자 전용)");
    createTranslationKeyIfNotExists("admin.globalDoc.uploadFile", "rag", "파일 업로드 버튼", "파일 업로드");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.noDocuments", "rag", "문서 없음 메시지", "아직 공통 문서가 없습니다. 첫 번째 문서를 업로드해보세요!");

    // 공통 문서 메시지 관련 키들
    createTranslationKeyIfNotExists(
        "admin.globalDoc.message.confirmDelete",
        "rag",
        "공통 문서 삭제 확인 메시지",
        "공통 문서 \"{0}\"을 삭제하시겠습니까?");

    // 공통 문서 청크 관련 키들
  }

  private void createTranslationKeyIfNotExists(
      String keyName, String category, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      TranslationKey translationKey =
          new TranslationKey(keyName, category, description, defaultValue);
      translationKeyRepository.save(translationKey);
      log.debug("번역 키 생성: {}", keyName);
    } else {
      log.debug("번역 키 이미 존재: {}", keyName);
    }
  }
}
