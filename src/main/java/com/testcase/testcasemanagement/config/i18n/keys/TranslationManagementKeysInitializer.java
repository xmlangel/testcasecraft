// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TranslationManagementKeysInitializer.java
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
public class TranslationManagementKeysInitializer {

        private final TranslationKeyRepository translationKeyRepository;

        public void initialize() {
                log.info("번역 관리 페이지 관련 번역 키 초기화 시작");

                // 번역 관리 메인 키들
                createTranslationKeyIfNotExists("translation.management.title", "translation", "번역 관리 페이지 제목", "번역 관리");
                createTranslationKeyIfNotExists("translation.management.exportCsv", "translation", "CSV 내보내기 버튼",
                                "CSV 내보내기");
                createTranslationKeyIfNotExists("translation.management.importCsv", "translation", "CSV 가져오기 버튼",
                                "CSV 가져오기");
                createTranslationKeyIfNotExists("translation.management.clearCache", "translation", "캐시 초기화 버튼",
                                "캐시 초기화");

                // 번역 관리 탭 키들
                createTranslationKeyIfNotExists("translation.tabs.languageManagement", "translation", "언어 관리 탭",
                                "언어 관리");
                createTranslationKeyIfNotExists("translation.tabs.keyManagement", "translation", "번역 키 관리 탭",
                                "번역 키 관리");
                createTranslationKeyIfNotExists("translation.tabs.translationManagement", "translation", "번역 관리 탭",
                                "번역 관리");
                createTranslationKeyIfNotExists("translation.tabs.statistics", "translation", "통계 탭", "통계");

                // CSV 가져오기 다이얼로그 키들
                createTranslationKeyIfNotExists("translation.csvImport.dialogTitle", "translation", "CSV 가져오기 다이얼로그 제목",
                                "CSV 파일 가져오기");
                createTranslationKeyIfNotExists("translation.csvImport.formatDescription", "translation", "CSV 형식 설명",
                                "CSV 파일 형식: keyName, languageCode, value, context, isActive, updatedBy, updatedAt");
                createTranslationKeyIfNotExists("translation.csvImport.overwriteLabel", "translation", "덮어쓰기 옵션 라벨",
                                "기존 번역 덮어쓰기");
                createTranslationKeyIfNotExists("translation.csvImport.overwriteHelper", "translation", "덮어쓰기 옵션 도움말",
                                "체크하면 기존 번역이 있는 경우 새 값으로 덮어씁니다. 체크하지 않으면 기존 번역은 그대로 두고 새로운 번역만 추가합니다.");

                // 언어 관리 다이얼로그 키들
                createTranslationKeyIfNotExists("translation.languageDialog.addTitle", "translation", "언어 추가 다이얼로그 제목",
                                "언어 추가");
                createTranslationKeyIfNotExists("translation.languageDialog.editTitle", "translation", "언어 편집 다이얼로그 제목",
                                "언어 편집");
                createTranslationKeyIfNotExists("translation.languageDialog.codeLabel", "translation", "언어 코드 라벨",
                                "언어 코드");
                createTranslationKeyIfNotExists("translation.languageDialog.codeHelper", "translation", "언어 코드 도움말",
                                "예: ko, en, ja");
                createTranslationKeyIfNotExists("translation.languageDialog.sortOrderLabel", "translation", "정렬 순서 라벨",
                                "정렬 순서");
                createTranslationKeyIfNotExists("translation.languageDialog.sortOrderHelper", "translation",
                                "정렬 순서 도움말",
                                "정렬 순서는 0 이상이어야 합니다");
                createTranslationKeyIfNotExists("translation.languageDialog.nameLabel", "translation", "언어명 라벨", "언어명");
                createTranslationKeyIfNotExists("translation.languageDialog.nameHelper", "translation", "언어명 도움말",
                                "예: 한국어, English");
                createTranslationKeyIfNotExists("translation.languageDialog.nativeNameLabel", "translation", "원어명 라벨",
                                "원어명");
                createTranslationKeyIfNotExists("translation.languageDialog.nativeNameHelper", "translation", "원어명 도움말",
                                "예: 한국어, English");
                createTranslationKeyIfNotExists("translation.languageDialog.isDefaultLabel", "translation",
                                "기본 언어 설정 라벨",
                                "기본 언어로 설정");
                createTranslationKeyIfNotExists("translation.languageDialog.isActiveLabel", "translation", "활성 상태 라벨",
                                "활성 상태");
                createTranslationKeyIfNotExists("translation.languageDialog.defaultLanguageWarning", "translation",
                                "기본 언어 경고",
                                "기본 언어로 설정하면 다른 언어들의 기본 설정이 해제됩니다.");
                createTranslationKeyIfNotExists("translation.languageDialog.codeRequired", "translation", "언어 코드 필수 검증",
                                "언어 코드는 필수입니다");

                // Validation 관련 추가 키들
                createTranslationKeyIfNotExists("translation.languageDialog.codeFormat", "translation", "언어 코드 형식 검증",
                                "언어 코드는 2-3자의 소문자여야 합니다");
                createTranslationKeyIfNotExists("translation.languageDialog.nameRequired", "translation", "언어명 필수 검증",
                                "언어명은 필수입니다");
                createTranslationKeyIfNotExists("translation.languageDialog.nativeNameRequired", "translation",
                                "원어명 필수 검증",
                                "원어명은 필수입니다");
                createTranslationKeyIfNotExists("translation.languageDialog.sortOrderMin", "translation",
                                "정렬 순서 최소값 검증",
                                "정렬 순서는 0 이상이어야 합니다");
                createTranslationKeyIfNotExists("translation.keyDialog.keyNameRequired", "translation", "키 이름 필수 검증",
                                "키 이름은 필수입니다");
                createTranslationKeyIfNotExists("translation.keyDialog.categoryRequired", "translation", "카테고리 필수 검증",
                                "카테고리를 선택해주세요");
                createTranslationKeyIfNotExists("translation.keyDialog.descriptionRequired", "translation", "설명 필수 검증",
                                "설명은 필수입니다");
                createTranslationKeyIfNotExists("translation.keyDialog.defaultValueRequired", "translation",
                                "기본값 필수 검증",
                                "기본값은 필수입니다");
                createTranslationKeyIfNotExists("translation.translationDialog.keyRequired", "translation",
                                "번역 키 필수 검증",
                                "번역 키를 선택해주세요");
                createTranslationKeyIfNotExists("translation.translationDialog.languageRequired", "translation",
                                "언어 필수 검증",
                                "언어를 선택해주세요");
                createTranslationKeyIfNotExists("translation.translationDialog.valueRequired", "translation",
                                "번역값 필수 검증",
                                "번역값은 필수입니다");

                // 번역 키 관리 다이얼로그 키들
                createTranslationKeyIfNotExists("translation.keyDialog.addTitle", "translation", "번역 키 추가 다이얼로그 제목",
                                "번역 키 추가");
                createTranslationKeyIfNotExists("translation.keyDialog.editTitle", "translation", "번역 키 편집 다이얼로그 제목",
                                "번역 키 편집");
                createTranslationKeyIfNotExists("translation.keyDialog.keyNameLabel", "translation", "키 이름 라벨", "키 이름");
                createTranslationKeyIfNotExists("translation.keyDialog.keyNameHelper", "translation", "키 이름 도움말",
                                "예: login.title, button.submit");
                createTranslationKeyIfNotExists("translation.keyDialog.keyNameFormat", "translation", "키 이름 형식 설명",
                                "키 이름은 영문자로 시작하며 영문자, 숫자, 점, 언더스코어만 사용 가능합니다");
                createTranslationKeyIfNotExists("translation.keyDialog.categoryLabel", "translation", "카테고리 라벨",
                                "카테고리");
                createTranslationKeyIfNotExists("translation.keyDialog.descriptionLabel", "translation", "설명 라벨", "설명");
                createTranslationKeyIfNotExists("translation.keyDialog.descriptionHelper", "translation", "설명 도움말",
                                "이 키가 어디에 사용되는지 설명해주세요");
                createTranslationKeyIfNotExists("translation.keyDialog.defaultValueLabel", "translation", "기본값 라벨",
                                "기본값");
                createTranslationKeyIfNotExists("translation.keyDialog.defaultValueHelper", "translation", "기본값 도움말",
                                "번역이 없을 때 표시될 기본 텍스트");
                createTranslationKeyIfNotExists("translation.keyDialog.isActiveLabel", "translation", "활성 상태 라벨",
                                "활성 상태");

                // 번역 키 카테고리들
                createTranslationKeyIfNotExists("translation.keyDialog.category.login", "translation", "로그인 카테고리",
                                "로그인");
                createTranslationKeyIfNotExists("translation.keyDialog.category.register", "translation", "회원가입 카테고리",
                                "회원가입");
                createTranslationKeyIfNotExists("translation.keyDialog.category.button", "translation", "버튼 카테고리",
                                "버튼");
                createTranslationKeyIfNotExists("translation.keyDialog.category.message", "translation", "메시지 카테고리",
                                "메시지");
                createTranslationKeyIfNotExists("translation.keyDialog.category.validation", "translation", "검증 카테고리",
                                "검증");
                createTranslationKeyIfNotExists("translation.keyDialog.category.navigation", "translation",
                                "네비게이션 카테고리",
                                "네비게이션");
                createTranslationKeyIfNotExists("translation.keyDialog.category.form", "translation", "폼 카테고리", "폼");
                createTranslationKeyIfNotExists("translation.keyDialog.category.error", "translation", "오류 카테고리", "오류");
                createTranslationKeyIfNotExists("translation.keyDialog.category.success", "translation", "성공 카테고리",
                                "성공");
                createTranslationKeyIfNotExists("translation.keyDialog.category.common", "translation", "공통 카테고리",
                                "공통");

                // 번역 관리 다이얼로그 키들
                createTranslationKeyIfNotExists("translation.translationDialog.addTitle", "translation",
                                "번역 추가 다이얼로그 제목",
                                "번역 추가");
                createTranslationKeyIfNotExists("translation.translationDialog.editTitle", "translation",
                                "번역 편집 다이얼로그 제목",
                                "번역 편집");
                createTranslationKeyIfNotExists("translation.translationDialog.keyLabel", "translation", "번역 키 라벨",
                                "번역 키");
                createTranslationKeyIfNotExists("translation.translationDialog.languageLabel", "translation", "언어 라벨",
                                "언어");
                createTranslationKeyIfNotExists("translation.translationDialog.keyDescription", "translation",
                                "키 설명 라벨",
                                "키 설명");
                createTranslationKeyIfNotExists("translation.translationDialog.defaultValue", "translation", "기본값 라벨",
                                "기본값");
                createTranslationKeyIfNotExists("translation.translationDialog.valueLabel", "translation", "번역값 라벨",
                                "번역값");
                createTranslationKeyIfNotExists("translation.translationDialog.valueHelper", "translation", "번역값 도움말",
                                "이 언어로 표시될 텍스트를 입력하세요");
                createTranslationKeyIfNotExists("translation.translationDialog.contextLabel", "translation", "컨텍스트 라벨",
                                "컨텍스트");
                createTranslationKeyIfNotExists("translation.translationDialog.contextHelper", "translation",
                                "컨텍스트 도움말",
                                "번역의 맥락이나 사용 상황을 설명해주세요 (선택사항)");
                createTranslationKeyIfNotExists("translation.translationDialog.isActiveLabel", "translation",
                                "활성 상태 라벨",
                                "활성 상태");

                // 언어 관리 탭 키들
                createTranslationKeyIfNotExists("translation.languageTab.listTitle", "translation", "언어 목록 제목",
                                "언어 목록");
                createTranslationKeyIfNotExists("translation.languageTab.addLanguage", "translation", "언어 추가 버튼",
                                "언어 추가");
                createTranslationKeyIfNotExists("translation.languageTab.table.code", "translation", "언어 코드 테이블 헤더",
                                "언어 코드");
                createTranslationKeyIfNotExists("translation.languageTab.table.name", "translation", "언어명 테이블 헤더",
                                "언어명");
                createTranslationKeyIfNotExists("translation.languageTab.table.nativeName", "translation", "원어명 테이블 헤더",
                                "원어명");
                createTranslationKeyIfNotExists("translation.languageTab.table.isDefault", "translation",
                                "기본 언어 테이블 헤더",
                                "기본 언어");
                createTranslationKeyIfNotExists("translation.languageTab.table.isActive", "translation", "활성 상태 테이블 헤더",
                                "활성 상태");
                createTranslationKeyIfNotExists("translation.languageTab.table.sortOrder", "translation",
                                "정렬 순서 테이블 헤더",
                                "정렬 순서");
                createTranslationKeyIfNotExists("translation.languageTab.deleteConfirm", "translation", "언어 삭제 확인",
                                "정말로 이 언어를 삭제하시겠습니까?");

                // 번역 키 관리 탭 키들
                createTranslationKeyIfNotExists("translation.keyTab.listTitle", "translation", "번역 키 목록 제목", "번역 키 목록");
                createTranslationKeyIfNotExists("translation.keyTab.addKey", "translation", "번역 키 추가 버튼", "번역 키 추가");
                createTranslationKeyIfNotExists("translation.keyTab.categoryLabel", "translation", "카테고리 필터 라벨",
                                "카테고리");
                createTranslationKeyIfNotExists("translation.keyTab.isActiveLabel", "translation", "활성 상태 필터 라벨",
                                "활성 상태");
                createTranslationKeyIfNotExists("translation.keyTab.statusLabel", "translation", "상태 라벨", "상태");
                createTranslationKeyIfNotExists("translation.keyTab.table.keyName", "translation", "키 이름 테이블 헤더",
                                "키 이름");
                createTranslationKeyIfNotExists("translation.keyTab.table.category", "translation", "카테고리 테이블 헤더",
                                "카테고리");
                createTranslationKeyIfNotExists("translation.keyTab.table.description", "translation", "설명 테이블 헤더",
                                "설명");
                createTranslationKeyIfNotExists("translation.keyTab.table.defaultValue", "translation", "기본값 테이블 헤더",
                                "기본값");
                createTranslationKeyIfNotExists("translation.keyTab.table.isActive", "translation", "활성 상태 테이블 헤더",
                                "활성 상태");
                createTranslationKeyIfNotExists("translation.keyTab.deleteConfirm", "translation", "번역 키 삭제 확인",
                                "정말로 이 번역 키를 삭제하시겠습니까?");

                // 번역 관리 탭 키들
                createTranslationKeyIfNotExists("translation.translationTab.listTitle", "translation", "번역 목록 제목",
                                "번역 목록");
                createTranslationKeyIfNotExists("translation.translationTab.exportCsvByLanguage", "translation",
                                "언어별 CSV 내보내기",
                                "{languageCode} CSV 내보내기");
                createTranslationKeyIfNotExists("translation.translationTab.addTranslation", "translation", "번역 추가 버튼",
                                "번역 추가");
                createTranslationKeyIfNotExists("translation.translationTab.languageLabel", "translation", "언어 필터 라벨",
                                "언어");
                createTranslationKeyIfNotExists("translation.translationTab.keyNameLabel", "translation",
                                "번역 키 이름 필터 라벨",
                                "번역 키 이름");
                createTranslationKeyIfNotExists("translation.translationTab.table.keyName", "translation",
                                "번역 키 테이블 헤더",
                                "번역 키");
                createTranslationKeyIfNotExists("translation.translationTab.table.language", "translation", "언어 테이블 헤더",
                                "언어");
                createTranslationKeyIfNotExists("translation.translationTab.table.value", "translation", "번역값 테이블 헤더",
                                "번역값");
                createTranslationKeyIfNotExists("translation.translationTab.table.context", "translation",
                                "컨텍스트 테이블 헤더",
                                "컨텍스트");
                createTranslationKeyIfNotExists("translation.translationTab.table.isActive", "translation",
                                "활성 상태 테이블 헤더",
                                "활성 상태");
                createTranslationKeyIfNotExists("translation.translationTab.table.updatedBy", "translation",
                                "수정자 테이블 헤더",
                                "수정자");
                createTranslationKeyIfNotExists("translation.translationTab.deleteConfirm", "translation", "번역 삭제 확인",
                                "정말로 이 번역을 삭제하시겠습니까?");

                // 통계 탭 키들
                createTranslationKeyIfNotExists("translation.statisticsTab.title", "translation", "번역 완성도 통계 제목",
                                "번역 완성도 통계");
                createTranslationKeyIfNotExists("translation.statisticsTab.completionRateLabel", "translation",
                                "완성도 라벨",
                                "완성도");
                createTranslationKeyIfNotExists("translation.statisticsTab.translatedCountLabel", "translation",
                                "번역됨 라벨",
                                "번역됨");
                createTranslationKeyIfNotExists("translation.statisticsTab.totalCountLabel", "translation", "전체 라벨",
                                "전체");

                log.info("번역 관리 페이지 관련 번역 키 초기화 완료");
        }

        private void createTranslationKeyIfNotExists(String keyName, String category, String description,
                        String defaultValue) {
                Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
                if (existingKey.isEmpty()) {
                        TranslationKey translationKey = new TranslationKey(keyName, category, description,
                                        defaultValue);
                        translationKeyRepository.save(translationKey);
                        log.debug("번역 키 생성: {}", keyName);
                } else {
                        log.debug("번역 키 이미 존재: {}", keyName);
                }
        }
}
