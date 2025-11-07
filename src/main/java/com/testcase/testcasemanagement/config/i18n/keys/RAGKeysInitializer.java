// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/RAGKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RAGKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // RAG Manager 관련 키들
        createTranslationKeyIfNotExists("rag.manager.noProject", "rag", "프로젝트 미선택 메시지", "프로젝트를 먼저 선택해주세요.");

        // Document Upload 관련 키들
        createTranslationKeyIfNotExists("rag.upload.title", "rag", "문서 업로드 제목", "문서 업로드");
        createTranslationKeyIfNotExists("rag.upload.description", "rag", "문서 업로드 설명", "PDF, DOCX, DOC, TXT 파일을 업로드하여 RAG 시스템에 등록할 수 있습니다. (최대 50MB)");
        createTranslationKeyIfNotExists("rag.upload.dragAndDrop", "rag", "드래그 앤 드롭 안내", "파일을 이곳에 드래그하거나 클릭하여 선택하세요");
        createTranslationKeyIfNotExists("rag.upload.selectFiles", "rag", "파일 선택 버튼", "파일 선택");
        createTranslationKeyIfNotExists("rag.upload.selectedFiles", "rag", "선택된 파일 레이블", "선택된 파일");
        createTranslationKeyIfNotExists("rag.upload.uploading", "rag", "업로드 중 상태", "업로드 중");
        createTranslationKeyIfNotExists("rag.upload.upload", "rag", "업로드 버튼", "업로드");
        createTranslationKeyIfNotExists("rag.upload.error.unsupportedFileType", "rag", "지원하지 않는 파일 형식 에러", "지원하지 않는 파일 형식입니다. (PDF, DOCX, DOC, TXT만 가능)");
        createTranslationKeyIfNotExists("rag.upload.error.fileTooLarge", "rag", "파일 크기 초과 에러", "파일 크기가 너무 큽니다. (최대 {maxSize}MB)");
        createTranslationKeyIfNotExists("rag.upload.error.noFilesSelected", "rag", "파일 미선택 에러", "업로드할 파일을 선택해주세요.");

        // Document Parser 관련 키들
        createTranslationKeyIfNotExists("rag.upload.parser.label", "rag", "파서 선택 라벨", "문서 분석 파서");
        createTranslationKeyIfNotExists("rag.upload.parser.pypdf2.description", "rag", "pypdf2 파서 설명", "기본 로컬 파서");
        createTranslationKeyIfNotExists("rag.upload.parser.pymupdf.description", "rag", "pymupdf 파서 설명", "다양한 기능을 갖춘 빠른 로컬 파서");
        createTranslationKeyIfNotExists("rag.upload.parser.pymupdf4llm.description", "rag", "pymupdf4llm 파서 설명", "LLM 최적화 마크다운 추출");
        createTranslationKeyIfNotExists("rag.upload.parser.upstage.description", "rag", "upstage 파서 설명", "고급 레이아웃 분석이 가능한 클라우드 API (upstage_api_key 필요)");

        // Document List 관련 키들
        createTranslationKeyIfNotExists("rag.document.status.pending", "rag", "문서 상태 대기 중", "대기 중");
        createTranslationKeyIfNotExists("rag.document.status.analyzing", "rag", "문서 상태 분석 중", "분석 중");
        createTranslationKeyIfNotExists("rag.document.status.completed", "rag", "문서 상태 완료", "완료");
        createTranslationKeyIfNotExists("rag.document.status.failed", "rag", "문서 상태 실패", "실패");
        createTranslationKeyIfNotExists("rag.document.loading", "rag", "문서 목록 로딩", "문서 목록을 불러오는 중...");
        createTranslationKeyIfNotExists("rag.document.empty", "rag", "문서 없음 메시지", "업로드된 문서가 없습니다");
        createTranslationKeyIfNotExists("rag.document.emptyDescription", "rag", "문서 없음 설명", "상단의 업로드 영역을 사용하여 문서를 등록하세요");
        createTranslationKeyIfNotExists("rag.document.list.title", "rag", "문서 목록 제목", "업로드된 문서");
        createTranslationKeyIfNotExists("rag.document.list.fileName", "rag", "파일명 컬럼", "파일명");
        createTranslationKeyIfNotExists("rag.document.list.fileSize", "rag", "파일 크기 컬럼", "크기");
        createTranslationKeyIfNotExists("rag.document.list.status", "rag", "상태 컬럼", "상태");
        createTranslationKeyIfNotExists("rag.document.list.chunks", "rag", "청크 수 컬럼", "청크 수");
        createTranslationKeyIfNotExists("rag.document.list.uploadDate", "rag", "업로드 일시 컬럼", "업로드 일시");
        createTranslationKeyIfNotExists("rag.document.list.actions", "rag", "작업 컬럼", "작업");
        createTranslationKeyIfNotExists("rag.document.download", "rag", "문서 다운로드 버튼", "문서 다운로드");
        createTranslationKeyIfNotExists("rag.document.delete", "rag", "문서 삭제 버튼", "문서 삭제");
        createTranslationKeyIfNotExists("rag.document.deleteDialog.title", "rag", "문서 삭제 확인 다이얼로그 제목", "문서 삭제 확인");
        createTranslationKeyIfNotExists("rag.document.deleteDialog.message", "rag", "문서 삭제 확인 메시지", "이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
        createTranslationKeyIfNotExists("rag.document.pagination.rowsPerPage", "rag", "페이지당 행 수 라벨", "페이지당 행 수:");
        createTranslationKeyIfNotExists("rag.document.viewChunks", "rag", "청크 보기 버튼", "청크 보기");
        // ICT-388: 문서/테스트케이스 분리 표시
        createTranslationKeyIfNotExists("rag.document.list.regularDocuments", "rag", "업로드된 문서 섹션 제목", "업로드된 문서");
        createTranslationKeyIfNotExists("rag.document.list.testCaseDocuments", "rag", "테스트케이스 문서 섹션 제목", "테스트케이스 문서");

        // Similar Test Cases 검색 관련 키들
        createTranslationKeyIfNotExists("rag.similar.title", "rag", "유사 검색 제목", "유사 검색");
        createTranslationKeyIfNotExists("rag.similar.description", "rag", "유사 검색 설명", "키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트 케이스 또는 문서를 찾아줍니다.");
        createTranslationKeyIfNotExists("rag.similar.searchQuery", "rag", "검색어 입력 라벨", "검색어");
        createTranslationKeyIfNotExists("rag.similar.searchPlaceholder", "rag", "검색어 플레이스홀더", "예: 로그인 기능 테스트, 회원가입 유효성 검사");
        createTranslationKeyIfNotExists("rag.similar.search", "rag", "검색 버튼", "검색");
        createTranslationKeyIfNotExists("rag.similar.searching", "rag", "검색 중 상태", "검색 중...");
        createTranslationKeyIfNotExists("rag.similar.noResults", "rag", "검색 결과 없음 메시지", "검색 결과가 없습니다. 다른 키워드로 시도해보세요.");
        createTranslationKeyIfNotExists("rag.similar.resultsCount", "rag", "검색 결과 개수", "검색 결과 ({count}개)");
        // ICT-388: 검색 결과 분리 표시
        createTranslationKeyIfNotExists("rag.similar.testCaseResults", "rag", "테스트케이스 검색 결과 섹션 제목", "테스트케이스");
        createTranslationKeyIfNotExists("rag.similar.documentResults", "rag", "문서 검색 결과 섹션 제목", "문서");
        createTranslationKeyIfNotExists("rag.similar.metadata", "rag", "문서 메타데이터", "문서 ID: {documentId} | 청크 순서: {chunkIndex}");
        createTranslationKeyIfNotExists("rag.similar.copy", "rag", "복사 버튼", "복사");
        createTranslationKeyIfNotExists("rag.similar.addTestCase", "rag", "테스트케이스로 추가 버튼", "테스트케이스로 추가");
        createTranslationKeyIfNotExists("rag.similar.unknownDocument", "rag", "알 수 없는 문서", "알 수 없음");
        createTranslationKeyIfNotExists("rag.similar.testCaseTitle", "rag", "테스트케이스 제목 템플릿", "테스트케이스 - {fileName}");
        createTranslationKeyIfNotExists("rag.similar.sourceTestcase", "rag", "출처 타입: 테스트케이스", "테스트케이스");
        createTranslationKeyIfNotExists("rag.similar.sourceDocument", "rag", "문서 소스 타입", "문서");
        createTranslationKeyIfNotExists("rag.similar.showDetails", "rag", "유사도 낮음 결과 펼치기", "자세히 보기");
        createTranslationKeyIfNotExists("rag.similar.noHighSimilarityResults", "rag", "81% 이상 유사도 없음 메시지", "81% 이상의 유사도를 가진 문서가 없습니다. 아래에서 유사도가 낮은 결과를 확인하세요.");
        createTranslationKeyIfNotExists("rag.similar.lowSimilarityCollapsed", "rag", "유사도 낮음 결과 접힘", "유사도 낮음 (클릭하여 보기)");

        // ProjectHeader RAG 탭 관련 키들
        createTranslationKeyIfNotExists("projectHeader.tabs.ragDocuments", "rag", "RAG 문서 탭", "RAG 문서");

        // RAG Chat Interface 관련 키들
        createTranslationKeyIfNotExists("rag.chat.title", "rag", "AI 질의응답 제목", "AI 질의응답");
        createTranslationKeyIfNotExists("rag.chat.exitFullScreen", "rag", "전체화면 종료", "전체화면 종료");
        createTranslationKeyIfNotExists("rag.chat.enterFullScreen", "rag", "전체화면 보기", "전체화면 보기");
        createTranslationKeyIfNotExists("rag.chat.retry", "rag", "재시도", "재시도");
        createTranslationKeyIfNotExists("rag.chat.clear", "rag", "대화 초기화", "대화 초기화");
        createTranslationKeyIfNotExists("rag.chat.persistToggle", "rag", "대화 자동 저장 토글", "대화 자동 저장");
        createTranslationKeyIfNotExists("rag.chat.threadSelectLabel", "rag", "스레드 선택 라벨", "저장된 스레드");
        createTranslationKeyIfNotExists("rag.chat.threadAutoOption", "rag", "자동 생성 옵션", "새 스레드 자동 생성");
        createTranslationKeyIfNotExists("rag.chat.untitledThread", "rag", "제목 없는 스레드", "제목 없는 스레드");
        createTranslationKeyIfNotExists("rag.chat.refreshThreads", "rag", "스레드 새로 고침", "스레드 새로 고침");
        createTranslationKeyIfNotExists("rag.chat.deleteThread", "rag", "스레드 삭제", "스레드 삭제");
        createTranslationKeyIfNotExists("rag.chat.createThread", "rag", "새 스레드 생성", "새 스레드");
        createTranslationKeyIfNotExists("rag.chat.manageThreadsAction", "rag", "스레드 관리 액션", "스레드 관리");
        createTranslationKeyIfNotExists("rag.chat.categorySelectLabel", "rag", "카테고리 선택 라벨", "카테고리");
        createTranslationKeyIfNotExists("rag.chat.empty", "rag", "채팅 빈 화면 메시지", "문서에 대해 질문해보세요.");
        createTranslationKeyIfNotExists("rag.chat.placeholder", "rag", "메시지 입력 플레이스홀더", "메시지를 입력하세요...");
        createTranslationKeyIfNotExists("rag.chat.hint", "rag", "입력 힌트", "Shift + Enter: 줄바꿈 | Enter: 전송");
        createTranslationKeyIfNotExists("rag.chat.deleteThreadConfirm", "rag", "스레드 삭제 확인 메시지", "현재 스레드를 삭제하시겠습니까? 대화 내용이 모두 삭제됩니다.");
        createTranslationKeyIfNotExists("rag.chat.threadTitleLabel", "rag", "스레드 제목 라벨", "제목");
        createTranslationKeyIfNotExists("rag.chat.threadDescriptionLabel", "rag", "스레드 설명 라벨", "설명 (선택)");
        createTranslationKeyIfNotExists("rag.chat.threadCreateAction", "rag", "생성 버튼", "생성");
        createTranslationKeyIfNotExists("rag.chat.editResponse", "rag", "응답 편집", "응답 편집");
        createTranslationKeyIfNotExists("rag.chat.editPlaceholder", "rag", "편집 플레이스홀더", "수정할 답변 내용을 입력하세요.");
        createTranslationKeyIfNotExists("rag.chat.deleteMessageTitle", "rag", "메시지 삭제 제목", "응답 삭제");
        createTranslationKeyIfNotExists("rag.chat.deleteMessageConfirm", "rag", "메시지 삭제 확인", "이 응답을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadTitleRequired", "rag", "제목 필수 입력 메시지", "스레드 제목을 입력해주세요.");
        createTranslationKeyIfNotExists("rag.chat.threadCreateFailed", "rag", "스레드 생성 실패 메시지", "스레드를 생성하지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadDeleteFailed", "rag", "스레드 삭제 실패 메시지", "스레드를 삭제하지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.editFailed", "rag", "메시지 편집 실패 메시지", "메시지를 수정하지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.messageDeleteFailed", "rag", "메시지 삭제 실패 메시지", "메시지를 삭제하지 못했습니다.");

        // RAG Thread Manager Dialog 관련 키들
        createTranslationKeyIfNotExists("rag.chat.manageThreads", "rag", "스레드 관리 다이얼로그 제목", "대화 스레드 관리");
        createTranslationKeyIfNotExists("rag.chat.threadListLabel", "rag", "스레드 목록 라벨", "스레드 목록");
        createTranslationKeyIfNotExists("rag.chat.threadEmpty", "rag", "스레드 없음 메시지", "저장된 스레드가 없습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadDetailsLabel", "rag", "스레드 상세 라벨", "스레드 상세");
        createTranslationKeyIfNotExists("rag.chat.refresh", "rag", "새로 고침", "새로 고침");
        createTranslationKeyIfNotExists("rag.chat.threadNotFound", "rag", "스레드 찾을 수 없음", "선택한 스레드를 찾을 수 없습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadLoadError", "rag", "스레드 로드 실패", "스레드를 불러오지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadUpdateError", "rag", "스레드 수정 실패", "스레드를 수정하지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadDeleteError", "rag", "스레드 삭제 실패", "스레드를 삭제하지 못했습니다.");
        createTranslationKeyIfNotExists("rag.chat.threadArchivedLabel", "rag", "보관 처리 라벨", "보관 처리");
        createTranslationKeyIfNotExists("rag.chat.threadMessagesLabel", "rag", "대화 내용 라벨", "대화 내용");
        createTranslationKeyIfNotExists("rag.chat.threadMessagesEmpty", "rag", "대화 메시지 없음", "대화 메시지가 없습니다.");
        createTranslationKeyIfNotExists("rag.chat.roleAssistant", "rag", "어시스턴트 역할", "어시스턴트");
        createTranslationKeyIfNotExists("rag.chat.roleUser", "rag", "사용자 역할", "사용자");
        createTranslationKeyIfNotExists("rag.chat.threadDeleteAction", "rag", "삭제 액션", "삭제");
        createTranslationKeyIfNotExists("rag.chat.threadSaveAction", "rag", "저장 액션", "저장");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description, String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("번역 키 생성: {}", keyName);
        } else {
            log.debug("번역 키 이미 존재: {}", keyName);
        }
    }
}
