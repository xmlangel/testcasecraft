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
