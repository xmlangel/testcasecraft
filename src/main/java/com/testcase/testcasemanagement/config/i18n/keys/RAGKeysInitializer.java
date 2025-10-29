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

        // Similar Test Cases 검색 관련 키들
        createTranslationKeyIfNotExists("rag.similar.title", "rag", "유사 테스트케이스 검색 제목", "유사 테스트케이스 검색");
        createTranslationKeyIfNotExists("rag.similar.description", "rag", "유사 테스트케이스 검색 설명", "키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트케이스를 찾아줍니다.");
        createTranslationKeyIfNotExists("rag.similar.searchQuery", "rag", "검색어 입력 라벨", "검색어");
        createTranslationKeyIfNotExists("rag.similar.searchPlaceholder", "rag", "검색어 플레이스홀더", "예: 로그인 기능 테스트, 회원가입 유효성 검사");
        createTranslationKeyIfNotExists("rag.similar.search", "rag", "검색 버튼", "검색");
        createTranslationKeyIfNotExists("rag.similar.noResults", "rag", "검색 결과 없음 메시지", "검색 결과가 없습니다. 다른 키워드로 시도해보세요.");
        createTranslationKeyIfNotExists("rag.similar.resultsCount", "rag", "검색 결과 개수", "검색 결과 ({count}개)");
        createTranslationKeyIfNotExists("rag.similar.metadata", "rag", "문서 메타데이터", "문서 ID: {documentId} | 청크 순서: {chunkIndex}");
        createTranslationKeyIfNotExists("rag.similar.copy", "rag", "복사 버튼", "복사");
        createTranslationKeyIfNotExists("rag.similar.addTestCase", "rag", "테스트케이스로 추가 버튼", "테스트케이스로 추가");
        createTranslationKeyIfNotExists("rag.similar.unknownDocument", "rag", "알 수 없는 문서", "알 수 없음");
        createTranslationKeyIfNotExists("rag.similar.testCaseTitle", "rag", "테스트케이스 제목 템플릿", "테스트케이스 - {fileName}");

        // ProjectHeader RAG 탭 관련 키들
        createTranslationKeyIfNotExists("projectHeader.tabs.ragDocuments", "rag", "RAG 문서 탭", "RAG 문서");
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
