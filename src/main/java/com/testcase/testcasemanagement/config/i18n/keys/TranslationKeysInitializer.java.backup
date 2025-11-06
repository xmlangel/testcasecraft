// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TranslationKeysInitializer.java
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
public class TranslationKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        log.info("번역 관리 페이지 관련 번역 키 초기화 시작");

        // 번역 관리 메인 키들
        createTranslationKeyIfNotExists("translation.management.title", "translation", "번역 관리 페이지 제목", "번역 관리");
        createTranslationKeyIfNotExists("translation.management.exportCsv", "translation", "CSV 내보내기 버튼", "CSV 내보내기");
        createTranslationKeyIfNotExists("translation.management.importCsv", "translation", "CSV 가져오기 버튼", "CSV 가져오기");
        createTranslationKeyIfNotExists("translation.management.clearCache", "translation", "캐시 초기화 버튼", "캐시 초기화");

        // 번역 관리 탭 키들
        createTranslationKeyIfNotExists("translation.tabs.languageManagement", "translation", "언어 관리 탭", "언어 관리");
        createTranslationKeyIfNotExists("translation.tabs.keyManagement", "translation", "번역 키 관리 탭", "번역 키 관리");
        createTranslationKeyIfNotExists("translation.tabs.translationManagement", "translation", "번역 관리 탭", "번역 관리");
        createTranslationKeyIfNotExists("translation.tabs.statistics", "translation", "통계 탭", "통계");

        // CSV 가져오기 다이얼로그 키들
        createTranslationKeyIfNotExists("translation.csvImport.dialogTitle", "translation", "CSV 가져오기 다이얼로그 제목", "CSV 파일 가져오기");
        createTranslationKeyIfNotExists("translation.csvImport.formatDescription", "translation", "CSV 형식 설명", "CSV 파일 형식: keyName, languageCode, value, context, isActive, updatedBy, updatedAt");
        createTranslationKeyIfNotExists("translation.csvImport.overwriteLabel", "translation", "덮어쓰기 옵션 라벨", "기존 번역 덮어쓰기");
        createTranslationKeyIfNotExists("translation.csvImport.overwriteHelper", "translation", "덮어쓰기 옵션 도움말", "체크하면 기존 번역이 있는 경우 새 값으로 덮어씁니다. 체크하지 않으면 기존 번역은 그대로 두고 새로운 번역만 추가합니다.");

        // 공통 버튼 키들 (번역 관리에서 사용)
        createTranslationKeyIfNotExists("common.buttons.import", "common", "가져오기 버튼", "가져오기");
        createTranslationKeyIfNotExists("common.buttons.add", "common", "추가 버튼", "추가");

        // 언어 관리 다이얼로그 키들
        createTranslationKeyIfNotExists("translation.languageDialog.addTitle", "translation", "언어 추가 다이얼로그 제목", "언어 추가");
        createTranslationKeyIfNotExists("translation.languageDialog.editTitle", "translation", "언어 편집 다이얼로그 제목", "언어 편집");
        createTranslationKeyIfNotExists("translation.languageDialog.codeLabel", "translation", "언어 코드 라벨", "언어 코드");
        createTranslationKeyIfNotExists("translation.languageDialog.codeHelper", "translation", "언어 코드 도움말", "예: ko, en, ja");
        createTranslationKeyIfNotExists("translation.languageDialog.sortOrderLabel", "translation", "정렬 순서 라벨", "정렬 순서");
        createTranslationKeyIfNotExists("translation.languageDialog.sortOrderHelper", "translation", "정렬 순서 도움말", "정렬 순서는 0 이상이어야 합니다");
        createTranslationKeyIfNotExists("translation.languageDialog.nameLabel", "translation", "언어명 라벨", "언어명");
        createTranslationKeyIfNotExists("translation.languageDialog.nameHelper", "translation", "언어명 도움말", "예: 한국어, English");
        createTranslationKeyIfNotExists("translation.languageDialog.nativeNameLabel", "translation", "원어명 라벨", "원어명");
        createTranslationKeyIfNotExists("translation.languageDialog.nativeNameHelper", "translation", "원어명 도움말", "예: 한국어, English");
        createTranslationKeyIfNotExists("translation.languageDialog.isDefaultLabel", "translation", "기본 언어 설정 라벨", "기본 언어로 설정");
        createTranslationKeyIfNotExists("translation.languageDialog.isActiveLabel", "translation", "활성 상태 라벨", "활성 상태");
        createTranslationKeyIfNotExists("translation.languageDialog.defaultLanguageWarning", "translation", "기본 언어 경고", "기본 언어로 설정하면 다른 언어들의 기본 설정이 해제됩니다.");

        // 언어 관리 검증 키들
        createTranslationKeyIfNotExists("translation.languageDialog.codeRequired", "validation", "언어 코드 필수 검증", "언어 코드는 필수입니다");
        createTranslationKeyIfNotExists("translation.languageDialog.codeFormat", "validation", "언어 코드 형식 검증", "언어 코드는 2-3자의 소문자여야 합니다");
        createTranslationKeyIfNotExists("translation.languageDialog.nameRequired", "validation", "언어명 필수 검증", "언어명은 필수입니다");
        createTranslationKeyIfNotExists("translation.languageDialog.nativeNameRequired", "validation", "원어명 필수 검증", "원어명은 필수입니다");
        createTranslationKeyIfNotExists("translation.languageDialog.sortOrderMin", "validation", "정렬 순서 최소값 검증", "정렬 순서는 0 이상이어야 합니다");

        // 번역 키 관리 다이얼로그 키들
        createTranslationKeyIfNotExists("translation.keyDialog.addTitle", "translation", "번역 키 추가 다이얼로그 제목", "번역 키 추가");
        createTranslationKeyIfNotExists("translation.keyDialog.editTitle", "translation", "번역 키 편집 다이얼로그 제목", "번역 키 편집");
        createTranslationKeyIfNotExists("translation.keyDialog.keyNameLabel", "translation", "키 이름 라벨", "키 이름");
        createTranslationKeyIfNotExists("translation.keyDialog.keyNameHelper", "translation", "키 이름 도움말", "예: login.title, button.submit");
        createTranslationKeyIfNotExists("translation.keyDialog.keyNameFormat", "translation", "키 이름 형식 설명", "키 이름은 영문자로 시작하며 영문자, 숫자, 점, 언더스코어만 사용 가능합니다");
        createTranslationKeyIfNotExists("translation.keyDialog.categoryLabel", "translation", "카테고리 라벨", "카테고리");
        createTranslationKeyIfNotExists("translation.keyDialog.descriptionLabel", "translation", "설명 라벨", "설명");
        createTranslationKeyIfNotExists("translation.keyDialog.descriptionHelper", "translation", "설명 도움말", "이 키가 어디에 사용되는지 설명해주세요");
        createTranslationKeyIfNotExists("translation.keyDialog.defaultValueLabel", "translation", "기본값 라벨", "기본값");
        createTranslationKeyIfNotExists("translation.keyDialog.defaultValueHelper", "translation", "기본값 도움말", "번역이 없을 때 표시될 기본 텍스트");
        createTranslationKeyIfNotExists("translation.keyDialog.isActiveLabel", "translation", "활성 상태 라벨", "활성 상태");

        // 번역 키 카테고리들
        createTranslationKeyIfNotExists("translation.keyDialog.category.login", "translation", "로그인 카테고리", "로그인");
        createTranslationKeyIfNotExists("translation.keyDialog.category.register", "translation", "회원가입 카테고리", "회원가입");
        createTranslationKeyIfNotExists("translation.keyDialog.category.button", "translation", "버튼 카테고리", "버튼");
        createTranslationKeyIfNotExists("translation.keyDialog.category.message", "translation", "메시지 카테고리", "메시지");
        createTranslationKeyIfNotExists("translation.keyDialog.category.validation", "translation", "검증 카테고리", "검증");
        createTranslationKeyIfNotExists("translation.keyDialog.category.navigation", "translation", "네비게이션 카테고리", "네비게이션");
        createTranslationKeyIfNotExists("translation.keyDialog.category.form", "translation", "폼 카테고리", "폼");
        createTranslationKeyIfNotExists("translation.keyDialog.category.error", "translation", "오류 카테고리", "오류");
        createTranslationKeyIfNotExists("translation.keyDialog.category.success", "translation", "성공 카테고리", "성공");
        createTranslationKeyIfNotExists("translation.keyDialog.category.common", "translation", "공통 카테고리", "공통");

        // 번역 키 관리 검증 키들
        createTranslationKeyIfNotExists("translation.keyDialog.keyNameRequired", "validation", "키 이름 필수 검증", "키 이름은 필수입니다");
        createTranslationKeyIfNotExists("translation.keyDialog.categoryRequired", "validation", "카테고리 필수 검증", "카테고리를 선택해주세요");
        createTranslationKeyIfNotExists("translation.keyDialog.descriptionRequired", "validation", "설명 필수 검증", "설명은 필수입니다");
        createTranslationKeyIfNotExists("translation.keyDialog.defaultValueRequired", "validation", "기본값 필수 검증", "기본값은 필수입니다");

        // 번역 관리 다이얼로그 키들
        createTranslationKeyIfNotExists("translation.translationDialog.addTitle", "translation", "번역 추가 다이얼로그 제목", "번역 추가");
        createTranslationKeyIfNotExists("translation.translationDialog.editTitle", "translation", "번역 편집 다이얼로그 제목", "번역 편집");
        createTranslationKeyIfNotExists("translation.translationDialog.keyLabel", "translation", "번역 키 라벨", "번역 키");
        createTranslationKeyIfNotExists("translation.translationDialog.languageLabel", "translation", "언어 라벨", "언어");
        createTranslationKeyIfNotExists("translation.translationDialog.keyDescription", "translation", "키 설명 라벨", "키 설명");
        createTranslationKeyIfNotExists("translation.translationDialog.defaultValue", "translation", "기본값 라벨", "기본값");
        createTranslationKeyIfNotExists("translation.translationDialog.valueLabel", "translation", "번역값 라벨", "번역값");
        createTranslationKeyIfNotExists("translation.translationDialog.valueHelper", "translation", "번역값 도움말", "이 언어로 표시될 텍스트를 입력하세요");
        createTranslationKeyIfNotExists("translation.translationDialog.contextLabel", "translation", "컨텍스트 라벨", "컨텍스트");
        createTranslationKeyIfNotExists("translation.translationDialog.contextHelper", "translation", "컨텍스트 도움말", "번역의 맥락이나 사용 상황을 설명해주세요 (선택사항)");
        createTranslationKeyIfNotExists("translation.translationDialog.isActiveLabel", "translation", "활성 상태 라벨", "활성 상태");

        // 번역 관리 검증 키들
        createTranslationKeyIfNotExists("translation.translationDialog.keyRequired", "validation", "번역 키 필수 검증", "번역 키를 선택해주세요");
        createTranslationKeyIfNotExists("translation.translationDialog.languageRequired", "validation", "언어 필수 검증", "언어를 선택해주세요");
        createTranslationKeyIfNotExists("translation.translationDialog.valueRequired", "validation", "번역값 필수 검증", "번역값은 필수입니다");

        // 언어 관리 탭 키들
        createTranslationKeyIfNotExists("translation.languageTab.listTitle", "translation", "언어 목록 제목", "언어 목록");
        createTranslationKeyIfNotExists("translation.languageTab.addLanguage", "translation", "언어 추가 버튼", "언어 추가");
        createTranslationKeyIfNotExists("translation.languageTab.table.code", "translation", "언어 코드 테이블 헤더", "언어 코드");
        createTranslationKeyIfNotExists("translation.languageTab.table.name", "translation", "언어명 테이블 헤더", "언어명");
        createTranslationKeyIfNotExists("translation.languageTab.table.nativeName", "translation", "원어명 테이블 헤더", "원어명");
        createTranslationKeyIfNotExists("translation.languageTab.table.isDefault", "translation", "기본 언어 테이블 헤더", "기본 언어");
        createTranslationKeyIfNotExists("translation.languageTab.table.isActive", "translation", "활성 상태 테이블 헤더", "활성 상태");
        createTranslationKeyIfNotExists("translation.languageTab.table.sortOrder", "translation", "정렬 순서 테이블 헤더", "정렬 순서");
        createTranslationKeyIfNotExists("translation.languageTab.deleteConfirm", "translation", "언어 삭제 확인", "정말로 이 언어를 삭제하시겠습니까?");

        // 번역 키 관리 탭 키들
        createTranslationKeyIfNotExists("translation.keyTab.listTitle", "translation", "번역 키 목록 제목", "번역 키 목록");
        createTranslationKeyIfNotExists("translation.keyTab.addKey", "translation", "번역 키 추가 버튼", "번역 키 추가");
        createTranslationKeyIfNotExists("translation.keyTab.categoryLabel", "translation", "카테고리 필터 라벨", "카테고리");
        createTranslationKeyIfNotExists("translation.keyTab.isActiveLabel", "translation", "활성 상태 필터 라벨", "활성 상태");
        createTranslationKeyIfNotExists("translation.keyTab.statusLabel", "translation", "상태 라벨", "상태");
        createTranslationKeyIfNotExists("translation.keyTab.table.keyName", "translation", "키 이름 테이블 헤더", "키 이름");
        createTranslationKeyIfNotExists("translation.keyTab.table.category", "translation", "카테고리 테이블 헤더", "카테고리");
        createTranslationKeyIfNotExists("translation.keyTab.table.description", "translation", "설명 테이블 헤더", "설명");
        createTranslationKeyIfNotExists("translation.keyTab.table.defaultValue", "translation", "기본값 테이블 헤더", "기본값");
        createTranslationKeyIfNotExists("translation.keyTab.table.isActive", "translation", "활성 상태 테이블 헤더", "활성 상태");
        createTranslationKeyIfNotExists("translation.keyTab.deleteConfirm", "translation", "번역 키 삭제 확인", "정말로 이 번역 키를 삭제하시겠습니까?");

        // 번역 관리 탭 키들
        createTranslationKeyIfNotExists("translation.translationTab.listTitle", "translation", "번역 목록 제목", "번역 목록");
        createTranslationKeyIfNotExists("translation.translationTab.exportCsvByLanguage", "translation", "언어별 CSV 내보내기", "{languageCode} CSV 내보내기");
        createTranslationKeyIfNotExists("translation.translationTab.addTranslation", "translation", "번역 추가 버튼", "번역 추가");
        createTranslationKeyIfNotExists("translation.translationTab.languageLabel", "translation", "언어 필터 라벨", "언어");
        createTranslationKeyIfNotExists("translation.translationTab.keyNameLabel", "translation", "번역 키 이름 필터 라벨", "번역 키 이름");
        createTranslationKeyIfNotExists("translation.translationTab.table.keyName", "translation", "번역 키 테이블 헤더", "번역 키");
        createTranslationKeyIfNotExists("translation.translationTab.table.language", "translation", "언어 테이블 헤더", "언어");
        createTranslationKeyIfNotExists("translation.translationTab.table.value", "translation", "번역값 테이블 헤더", "번역값");
        createTranslationKeyIfNotExists("translation.translationTab.table.context", "translation", "컨텍스트 테이블 헤더", "컨텍스트");
        createTranslationKeyIfNotExists("translation.translationTab.table.isActive", "translation", "활성 상태 테이블 헤더", "활성 상태");
        createTranslationKeyIfNotExists("translation.translationTab.table.updatedBy", "translation", "수정자 테이블 헤더", "수정자");
        createTranslationKeyIfNotExists("translation.translationTab.deleteConfirm", "translation", "번역 삭제 확인", "정말로 이 번역을 삭제하시겠습니까?");

        // 통계 탭 키들
        createTranslationKeyIfNotExists("translation.statisticsTab.title", "translation", "번역 완성도 통계 제목", "번역 완성도 통계");
        createTranslationKeyIfNotExists("translation.statisticsTab.completionRateLabel", "translation", "완성도 라벨", "완성도");
        createTranslationKeyIfNotExists("translation.statisticsTab.translatedCountLabel", "translation", "번역됨 라벨", "번역됨");
        createTranslationKeyIfNotExists("translation.statisticsTab.totalCountLabel", "translation", "전체 라벨", "전체");

        // 공통 테이블 및 검색 키들
        createTranslationKeyIfNotExists("common.table.actions", "common", "테이블 작업 헤더", "작업");
        createTranslationKeyIfNotExists("common.default", "common", "기본 상태 표시", "기본");
        createTranslationKeyIfNotExists("common.active", "common", "활성 상태 표시", "활성");
        createTranslationKeyIfNotExists("common.inactive", "common", "비활성 상태 표시", "비활성");
        createTranslationKeyIfNotExists("common.search.keyword", "common", "키워드 검색 라벨", "키워드 검색");
        createTranslationKeyIfNotExists("common.loading", "common", "로딩 메시지", "로딩 중...");
        createTranslationKeyIfNotExists("common.buttons.refresh", "common", "새로고침 버튼", "새로고침");

        // 헤더 네비게이션 키들
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 메뉴", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 메뉴", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 메뉴", "사용자 관리");
        createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 메뉴", "메일 설정");
        createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 메뉴", "번역 관리");
        createTranslationKeyIfNotExists("header.nav.managementMenu", "header", "관리 메뉴 그룹", "관리 메뉴");
        createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 메뉴", "프로젝트 선택");

        // 헤더 사용자 메뉴 키들
        createTranslationKeyIfNotExists("header.userMenu.profile", "header", "프로필 메뉴", "프로필");
        createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

        // JIRA 관련 키들
        createTranslationKeyIfNotExists("jira.status.connectionStatus", "jira", "JIRA 연결 상태", "연결 상태");
        createTranslationKeyIfNotExists("jira.status.notConfigured", "jira", "JIRA 미설정 상태", "설정되지 않음");
        createTranslationKeyIfNotExists("jira.messages.noConfig", "jira", "JIRA 설정 없음 메시지", "JIRA 서버가 설정되지 않았습니다.");

        // 새로 추가된 번역 관리 관련 키들
        createTranslationKeyIfNotExists("translation.keyDialog.descriptionLabel", "translation", "설명 라벨", "설명");
        createTranslationKeyIfNotExists("translation.keyDialog.descriptionHelper", "translation", "설명 도움말", "번역 키에 대한 설명을 입력하세요");
        createTranslationKeyIfNotExists("translation.keyTab.table.description", "translation", "테이블 설명 컬럼", "설명");

        // 새로 추가된 JUnit 관련 키들
        createTranslationKeyIfNotExists("junit.placeholder.executionName", "junit", "실행명 플레이스홀더", "실행 이름을 입력하세요");

        // 대량 번역 키 등록 (13-17번째 그룹, 총 47개)
        // 공통 키들
        createTranslationKeyIfNotExists("common.unauthorized.title", "common", "권한 없음 제목", "권한 없음");
        createTranslationKeyIfNotExists("common.unauthorized.message", "common", "권한 없음 메시지", "이 페이지에 접근할 권한이 없습니다");
        createTranslationKeyIfNotExists("common.loading", "common", "로딩 표시", "로딩 중...");
        createTranslationKeyIfNotExists("common.all", "common", "전체 선택", "전체");
        createTranslationKeyIfNotExists("common.status", "common", "상태", "상태");

        // 테스트 결과 키들
        createTranslationKeyIfNotExists("testResult.form.title", "testResult", "테스트 결과 폼 제목", "테스트 결과 입력");
        createTranslationKeyIfNotExists("testResult.pieChart.title", "testResult", "파이차트 제목", "테스트 결과 파이차트");
        createTranslationKeyIfNotExists("testResult.pieChart.loading", "testResult", "차트 로딩", "차트 로딩 중...");
        createTranslationKeyIfNotExists("testResult.pieChart.noData", "testResult", "차트 데이터 없음", "차트 데이터 없음");
        createTranslationKeyIfNotExists("testResult.pieChart.count", "testResult", "개수", "개수");
        createTranslationKeyIfNotExists("testResult.pieChart.percentage", "testResult", "비율", "비율");
        createTranslationKeyIfNotExists("testResult.pieChart.totalTestCases", "testResult", "총 테스트 케이스", "총 테스트 케이스");
        createTranslationKeyIfNotExists("testResult.statistics.noData", "testResult", "통계 데이터 없음", "통계 데이터 없음");
        createTranslationKeyIfNotExists("testResult.statistics.totalCount", "testResult", "총 개수", "총 개수");
        createTranslationKeyIfNotExists("testResult.error.testCaseLoadFailed", "testResult", "테스트케이스 로드 실패", "테스트 케이스 로드 실패");
        createTranslationKeyIfNotExists("testResult.error.saveFailed", "testResult", "저장 실패", "저장 실패");
        createTranslationKeyIfNotExists("testResult.error.resultRequired", "testResult", "결과 필수", "테스트 결과는 필수입니다");

        // 조직 관련 키들
        createTranslationKeyIfNotExists("organization.dashboard.title", "organization", "조직 대시보드 제목", "조직 대시보드");
        createTranslationKeyIfNotExists("organization.management.title", "organization", "조직 관리 제목", "조직 관리");
        createTranslationKeyIfNotExists("organization.dialog.edit.title", "organization", "조직 수정 제목", "조직 수정");
        createTranslationKeyIfNotExists("organization.dialog.create.title", "organization", "조직 생성 제목", "조직 생성");
        createTranslationKeyIfNotExists("organization.form.name", "organization", "조직명", "조직명");
        createTranslationKeyIfNotExists("organization.dialog.delete.title", "organization", "조직 삭제 제목", "조직 삭제");
        createTranslationKeyIfNotExists("organization.dialog.delete.message", "organization", "조직 삭제 메시지", "조직을 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("organization.dialog.invite.title", "organization", "멤버 초대 제목", "멤버 초대");
        createTranslationKeyIfNotExists("organization.dialog.createProject.title", "organization", "프로젝트 생성 제목", "프로젝트 생성");

        // 번역 관리 키들
        createTranslationKeyIfNotExists("translation.keyDialog.category.message", "translation", "메시지 카테고리", "메시지");
        createTranslationKeyIfNotExists("translation.keyTab.table.category", "translation", "카테고리 컬럼", "카테고리");
        createTranslationKeyIfNotExists("translation.languageTab.table.name", "translation", "언어명 컬럼", "언어명");
        createTranslationKeyIfNotExists("translation.translationTab.table.value", "translation", "번역값 컬럼", "번역값");
        createTranslationKeyIfNotExists("translation.statisticsTab.title", "translation", "번역 통계 제목", "번역 통계");
        createTranslationKeyIfNotExists("translation.management.title", "translation", "번역 관리 제목", "번역 관리");
        createTranslationKeyIfNotExists("translation.keyDialog.category.error", "translation", "에러 카테고리", "에러");
        createTranslationKeyIfNotExists("translation.keyDialog.category.success", "translation", "성공 카테고리", "성공");

        // JUnit 관련 키들
        createTranslationKeyIfNotExists("junit.dashboard.title", "junit", "JUnit 대시보드 제목", "JUnit 대시보드");
        createTranslationKeyIfNotExists("junit.table.status", "junit", "JUnit 테이블 상태", "상태");
        createTranslationKeyIfNotExists("junit.upload.dialog.title", "junit", "JUnit 업로드 제목", "JUnit 결과 업로드");
        createTranslationKeyIfNotExists("junit.error.loadFailed", "junit", "JUnit 로드 실패", "JUnit 결과 로드 실패");
        createTranslationKeyIfNotExists("junit.stats.error", "junit", "JUnit 에러", "에러");
        createTranslationKeyIfNotExists("junit.stats.errorTests", "junit", "JUnit 에러 테스트", "에러 테스트");
        createTranslationKeyIfNotExists("junit.stats.successRate", "junit", "JUnit 성공률", "성공률");
        createTranslationKeyIfNotExists("junit.stats.failed", "junit", "JUnit 실패", "실패");

        // 테스트 케이스 및 실행 관련
        createTranslationKeyIfNotExists("testCaseResult.page.title", "testCase", "테스트케이스 결과 제목", "테스트 케이스 결과");
        createTranslationKeyIfNotExists("testExecution.list.title", "testExecution", "테스트 실행 목록 제목", "테스트 실행 목록");
        createTranslationKeyIfNotExists("testExecution.list.delete.title", "testExecution", "테스트 실행 삭제 제목", "테스트 실행 삭제");

        // 대시보드 관련
        createTranslationKeyIfNotExists("dashboard.title", "dashboard", "대시보드 제목", "대시보드");
        createTranslationKeyIfNotExists("dashboard.noData.message", "dashboard", "데이터 없음 메시지", "표시할 데이터가 없습니다");
        createTranslationKeyIfNotExists("dashboard.error.retry", "dashboard", "다시 시도", "다시 시도");
        createTranslationKeyIfNotExists("dashboard.error.goToLogin", "dashboard", "로그인으로 이동", "로그인으로 이동");
        createTranslationKeyIfNotExists("dashboard.error.details", "dashboard", "상세 정보", "상세 정보");

        // 2차 대량 키 등록 (18-22번째 그룹)
        // 테스트 결과 폼 키들
        createTranslationKeyIfNotExists("testResult.form.preCondition", "testResult", "사전 조건", "사전 조건");
        createTranslationKeyIfNotExists("testResult.form.testSteps", "testResult", "테스트 단계", "테스트 단계");
        createTranslationKeyIfNotExists("testResult.form.expectedResult", "testResult", "예상 결과", "예상 결과");
        createTranslationKeyIfNotExists("testResult.form.notesLimitError", "testResult", "노트 길이 제한 에러", "비고는 10,000자 이내로 입력해주세요");
        createTranslationKeyIfNotExists("testResult.form.notesHelp", "testResult", "노트 도움말", "테스트 실행 시 특이사항이나 추가 정보를 입력하세요");
        createTranslationKeyIfNotExists("testResult.form.fileAttachment", "testResult", "파일 첨부", "파일 첨부");
        createTranslationKeyIfNotExists("testResult.form.fileUploading", "testResult", "파일 업로드 중", "파일 업로드 중...");
        createTranslationKeyIfNotExists("testResult.form.fileSelect", "testResult", "파일 선택", "파일 선택");
        createTranslationKeyIfNotExists("testResult.form.jiraIntegration", "testResult", "JIRA 연동", "JIRA 연동");
        createTranslationKeyIfNotExists("testResult.form.jiraComment", "testResult", "JIRA 코멘트", "JIRA 코멘트");

        // 공통 버튼 키들
        createTranslationKeyIfNotExists("common.buttons.edit", "common", "수정 버튼", "수정");
        createTranslationKeyIfNotExists("common.buttons.delete", "common", "삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.create", "common", "생성 버튼", "생성");

        // 조직 관련 추가 키들
        createTranslationKeyIfNotExists("organization.form.nameRequired", "organization", "조직명 필수", "조직명은 필수입니다");
        createTranslationKeyIfNotExists("organization.buttons.createNew", "organization", "새 조직 생성 버튼", "새 조직 만들기");
        createTranslationKeyIfNotExists("organization.buttons.firstOrganization", "organization", "첫 조직 생성 버튼", "첫 번째 조직 만들기");
        createTranslationKeyIfNotExists("organization.buttons.view", "organization", "보기 버튼", "보기");
        createTranslationKeyIfNotExists("organization.dialog.delete.warning", "organization", "삭제 경고", "이 작업은 되돌릴 수 없습니다");
        createTranslationKeyIfNotExists("organization.detail.members", "organization", "멤버", "멤버");
        createTranslationKeyIfNotExists("organization.detail.projects", "organization", "프로젝트", "프로젝트");
        createTranslationKeyIfNotExists("organization.detail.settings", "organization", "설정", "설정");
        createTranslationKeyIfNotExists("organization.member.role.admin", "organization", "관리자 역할", "관리자");
        createTranslationKeyIfNotExists("organization.member.role.member", "organization", "멤버 역할", "멤버");
        createTranslationKeyIfNotExists("organization.member.role.viewer", "organization", "뷰어 역할", "뷰어");
        createTranslationKeyIfNotExists("organization.project.status.active", "organization", "활성 상태", "활성");
        createTranslationKeyIfNotExists("organization.project.status.inactive", "organization", "비활성 상태", "비활성");
        createTranslationKeyIfNotExists("organization.project.status.archived", "organization", "보관됨 상태", "보관됨");

        // 프로젝트 관련 키들
        createTranslationKeyIfNotExists("project.form.name", "project", "프로젝트명", "프로젝트명");
        createTranslationKeyIfNotExists("project.form.description", "project", "프로젝트 설명", "프로젝트 설명");
        createTranslationKeyIfNotExists("project.form.startDate", "project", "시작일", "시작일");
        createTranslationKeyIfNotExists("project.form.endDate", "project", "종료일", "종료일");
        createTranslationKeyIfNotExists("project.status.planning", "project", "계획 상태", "계획");
        createTranslationKeyIfNotExists("project.status.inProgress", "project", "진행중 상태", "진행중");
        createTranslationKeyIfNotExists("project.status.completed", "project", "완료 상태", "완료");
        createTranslationKeyIfNotExists("project.status.onHold", "project", "보류 상태", "보류");

        // 테스트 케이스 관련 키들
        createTranslationKeyIfNotExists("testCase.form.name", "testCase", "테스트케이스명", "테스트 케이스명");
        createTranslationKeyIfNotExists("testCase.form.priority", "testCase", "우선순위", "우선순위");
        createTranslationKeyIfNotExists("testCase.priority.high", "testCase", "높은 우선순위", "높음");
        createTranslationKeyIfNotExists("testCase.priority.medium", "testCase", "보통 우선순위", "보통");
        createTranslationKeyIfNotExists("testCase.priority.low", "testCase", "낮은 우선순위", "낮음");
        createTranslationKeyIfNotExists("testCase.status.draft", "testCase", "초안 상태", "초안");
        createTranslationKeyIfNotExists("testCase.status.review", "testCase", "검토 상태", "검토중");
        createTranslationKeyIfNotExists("testCase.status.approved", "testCase", "승인 상태", "승인됨");
        createTranslationKeyIfNotExists("testCase.status.deprecated", "testCase", "사용중지 상태", "사용중지");

        // 테스트 실행 상태 키들
        createTranslationKeyIfNotExists("testExecution.status.notStarted", "testExecution", "시작안됨 상태", "시작 안됨");
        createTranslationKeyIfNotExists("testExecution.status.inProgress", "testExecution", "진행중 상태", "진행중");
        createTranslationKeyIfNotExists("testExecution.status.completed", "testExecution", "완료 상태", "완료");

        // 3차 대량 키 등록 (23-32번째 그룹, 100개)
        // 23번째 그룹 - 대시보드 차트 및 통계
        createTranslationKeyIfNotExists("dashboard.chart.pieChart.title", "dashboard", "파이 차트 제목", "테스트 결과 파이 차트");
        createTranslationKeyIfNotExists("dashboard.chart.pieChart.passed", "dashboard", "통과 차트", "통과");
        createTranslationKeyIfNotExists("dashboard.chart.pieChart.failed", "dashboard", "실패 차트", "실패");
        createTranslationKeyIfNotExists("dashboard.chart.pieChart.blocked", "dashboard", "차단 차트", "차단");
        createTranslationKeyIfNotExists("dashboard.chart.pieChart.notRun", "dashboard", "미실행 차트", "미실행");
        createTranslationKeyIfNotExists("dashboard.chart.barChart.title", "dashboard", "바 차트 제목", "월별 테스트 실행 추이");
        createTranslationKeyIfNotExists("dashboard.chart.lineChart.title", "dashboard", "라인 차트 제목", "품질 추이");
        createTranslationKeyIfNotExists("dashboard.chart.lineChart.passRate", "dashboard", "통과율 라인", "통과율");
        createTranslationKeyIfNotExists("dashboard.chart.lineChart.failRate", "dashboard", "실패율 라인", "실패율");
        createTranslationKeyIfNotExists("dashboard.chart.donutChart.title", "dashboard", "도넛 차트 제목", "우선순위별 테스트케이스 분포");

        // 24번째 그룹 - 대시보드 메트릭 및 위젯
        createTranslationKeyIfNotExists("dashboard.metrics.totalTestCases", "dashboard", "총 테스트케이스 메트릭", "총 테스트케이스");
        createTranslationKeyIfNotExists("dashboard.metrics.executedTests", "dashboard", "실행된 테스트 메트릭", "실행된 테스트");
        createTranslationKeyIfNotExists("dashboard.metrics.passedTests", "dashboard", "통과된 테스트 메트릭", "통과된 테스트");
        createTranslationKeyIfNotExists("dashboard.metrics.failedTests", "dashboard", "실패된 테스트 메트릭", "실패된 테스트");
        createTranslationKeyIfNotExists("dashboard.metrics.passRate", "dashboard", "통과율 메트릭", "통과율");
        createTranslationKeyIfNotExists("dashboard.widget.recentActivity", "dashboard", "최근 활동 위젯", "최근 활동");
        createTranslationKeyIfNotExists("dashboard.widget.upcomingTests", "dashboard", "예정된 테스트 위젯", "예정된 테스트");
        createTranslationKeyIfNotExists("dashboard.widget.criticalIssues", "dashboard", "중요 이슈 위젯", "중요 이슈");
        createTranslationKeyIfNotExists("dashboard.widget.teamPerformance", "dashboard", "팀 성과 위젯", "팀 성과");
        createTranslationKeyIfNotExists("dashboard.widget.projectStatus", "dashboard", "프로젝트 상태 위젯", "프로젝트 상태");

        // 25번째 그룹 - 테이블 관리 및 정렬
        createTranslationKeyIfNotExists("table.column.sortAscending", "table", "오름차순 정렬", "오름차순 정렬");
        createTranslationKeyIfNotExists("table.column.sortDescending", "table", "내림차순 정렬", "내림차순 정렬");
        createTranslationKeyIfNotExists("table.column.filter", "table", "컬럼 필터", "컬럼 필터");
        createTranslationKeyIfNotExists("table.column.hide", "table", "컬럼 숨기기", "컬럼 숨기기");
        createTranslationKeyIfNotExists("table.column.show", "table", "컬럼 보이기", "컬럼 보이기");
        createTranslationKeyIfNotExists("table.pagination.first", "table", "첫 페이지", "첫 페이지");
        createTranslationKeyIfNotExists("table.pagination.previous", "table", "이전 페이지", "이전 페이지");
        createTranslationKeyIfNotExists("table.pagination.next", "table", "다음 페이지", "다음 페이지");
        createTranslationKeyIfNotExists("table.pagination.last", "table", "마지막 페이지", "마지막 페이지");
        createTranslationKeyIfNotExists("table.pagination.info", "table", "페이지 정보", "{total}개 중 {from}-{to}개 표시");

        // 26번째 그룹 - 검색 및 필터링
        createTranslationKeyIfNotExists("search.placeholder.global", "search", "전체 검색 플레이스홀더", "전체 콘텐츠 검색...");
        createTranslationKeyIfNotExists("search.placeholder.testCase", "search", "테스트케이스 검색 플레이스홀더", "테스트케이스 검색...");
        createTranslationKeyIfNotExists("search.placeholder.project", "search", "프로젝트 검색 플레이스홀더", "프로젝트 검색...");
        createTranslationKeyIfNotExists("search.placeholder.user", "search", "사용자 검색 플레이스홀더", "사용자 검색...");
        createTranslationKeyIfNotExists("search.filter.status", "search", "상태 필터", "상태별 필터");
        createTranslationKeyIfNotExists("search.filter.priority", "search", "우선순위 필터", "우선순위별 필터");
        createTranslationKeyIfNotExists("search.filter.assignee", "search", "담당자 필터", "담당자별 필터");
        createTranslationKeyIfNotExists("search.filter.dateRange", "search", "날짜 범위 필터", "날짜 범위별 필터");
        createTranslationKeyIfNotExists("search.results.found", "search", "검색 결과 개수", "{count}개 결과 발견");
        createTranslationKeyIfNotExists("search.results.noResults", "search", "검색 결과 없음", "검색 결과가 없습니다");

        // 27번째 그룹 - 내보내기 및 보고서
        createTranslationKeyIfNotExists("export.format.pdf", "export", "PDF 내보내기", "PDF로 내보내기");
        createTranslationKeyIfNotExists("export.format.excel", "export", "엑셀 내보내기", "엑셀로 내보내기");
        createTranslationKeyIfNotExists("export.format.csv", "export", "CSV 내보내기", "CSV로 내보내기");
        createTranslationKeyIfNotExists("export.format.json", "export", "JSON 내보내기", "JSON으로 내보내기");
        createTranslationKeyIfNotExists("export.options.includeAttachments", "export", "첨부파일 포함 옵션", "첨부파일 포함");
        createTranslationKeyIfNotExists("export.options.includeHistory", "export", "이력 포함 옵션", "이력 포함");
        createTranslationKeyIfNotExists("export.progress.preparing", "export", "내보내기 준비", "내보내기 준비 중...");
        createTranslationKeyIfNotExists("export.progress.generating", "export", "파일 생성", "파일 생성 중...");
        createTranslationKeyIfNotExists("export.success.message", "export", "내보내기 성공", "내보내기 완료");
        createTranslationKeyIfNotExists("export.error.message", "export", "내보내기 실패", "내보내기 실패");

        // 28번째 그룹 - 알림 및 메시징
        createTranslationKeyIfNotExists("notification.type.info", "notification", "정보 알림", "정보");
        createTranslationKeyIfNotExists("notification.type.success", "notification", "성공 알림", "성공");
        createTranslationKeyIfNotExists("notification.type.warning", "notification", "경고 알림", "경고");
        createTranslationKeyIfNotExists("notification.type.error", "notification", "오류 알림", "오류");
        createTranslationKeyIfNotExists("notification.email.testResult", "notification", "테스트 결과 이메일", "테스트 결과 알림");
        createTranslationKeyIfNotExists("notification.email.projectUpdate", "notification", "프로젝트 업데이트 이메일", "프로젝트 업데이트 알림");
        createTranslationKeyIfNotExists("notification.settings.enable", "notification", "알림 활성화", "알림 활성화");
        createTranslationKeyIfNotExists("notification.settings.disable", "notification", "알림 비활성화", "알림 비활성화");
        createTranslationKeyIfNotExists("notification.markAsRead", "notification", "읽음 표시", "읽음으로 표시");
        createTranslationKeyIfNotExists("notification.clearAll", "notification", "모든 알림 지우기", "모든 알림 지우기");

        // 29번째 그룹 - 워크플로우 및 상태 관리
        createTranslationKeyIfNotExists("workflow.status.pending", "workflow", "대기 상태", "대기");
        createTranslationKeyIfNotExists("workflow.status.approved", "workflow", "승인 상태", "승인됨");
        createTranslationKeyIfNotExists("workflow.status.rejected", "workflow", "거부 상태", "거부됨");
        createTranslationKeyIfNotExists("workflow.status.inReview", "workflow", "검토 상태", "검토중");
        createTranslationKeyIfNotExists("workflow.action.approve", "workflow", "승인 액션", "승인");
        createTranslationKeyIfNotExists("workflow.action.reject", "workflow", "거부 액션", "거부");
        createTranslationKeyIfNotExists("workflow.action.submit", "workflow", "제출 액션", "검토 요청");
        createTranslationKeyIfNotExists("workflow.action.withdraw", "workflow", "철회 액션", "철회");
        createTranslationKeyIfNotExists("workflow.comment.placeholder", "workflow", "댓글 플레이스홀더", "댓글 추가...");
        createTranslationKeyIfNotExists("workflow.history.title", "workflow", "워크플로우 이력", "워크플로우 이력");

        // 30번째 그룹 - 네비게이션 및 메뉴
        createTranslationKeyIfNotExists("navigation.menu.dashboard", "navigation", "대시보드 메뉴", "대시보드");
        createTranslationKeyIfNotExists("navigation.menu.projects", "navigation", "프로젝트 메뉴", "프로젝트");
        createTranslationKeyIfNotExists("navigation.menu.testCases", "navigation", "테스트케이스 메뉴", "테스트케이스");
        createTranslationKeyIfNotExists("navigation.menu.testPlans", "navigation", "테스트계획 메뉴", "테스트계획");
        createTranslationKeyIfNotExists("navigation.menu.testExecution", "navigation", "테스트실행 메뉴", "테스트실행");
        createTranslationKeyIfNotExists("navigation.menu.reports", "navigation", "보고서 메뉴", "보고서");
        createTranslationKeyIfNotExists("navigation.menu.administration", "navigation", "관리 메뉴", "관리");
        createTranslationKeyIfNotExists("navigation.breadcrumb.home", "navigation", "홈 브레드크럼", "홈");
        createTranslationKeyIfNotExists("navigation.breadcrumb.separator", "navigation", "브레드크럼 구분자", "/");
        createTranslationKeyIfNotExists("navigation.back.button", "navigation", "뒤로 가기 버튼", "뒤로");

        // 31번째 그룹 - 사용자 액션 및 권한
        createTranslationKeyIfNotExists("action.permission.view", "action", "조회 권한", "조회 권한");
        createTranslationKeyIfNotExists("action.permission.edit", "action", "편집 권한", "편집 권한");
        createTranslationKeyIfNotExists("action.permission.delete", "action", "삭제 권한", "삭제 권한");
        createTranslationKeyIfNotExists("action.permission.admin", "action", "관리자 권한", "관리자 권한");
        createTranslationKeyIfNotExists("action.user.login", "action", "로그인 액션", "로그인");
        createTranslationKeyIfNotExists("action.user.logout", "action", "로그아웃 액션", "로그아웃");
        createTranslationKeyIfNotExists("action.user.profile", "action", "프로필 조회 액션", "프로필 보기");
        createTranslationKeyIfNotExists("action.user.changePassword", "action", "비밀번호 변경 액션", "비밀번호 변경");
        createTranslationKeyIfNotExists("action.user.preferences", "action", "사용자 설정 액션", "사용자 설정");
        createTranslationKeyIfNotExists("action.user.activity", "action", "사용자 활동 액션", "사용자 활동");

        // 32번째 그룹 - 검증 및 알림 메시지
        createTranslationKeyIfNotExists("validation.password.complexity", "validation", "비밀번호 복잡도 검증", "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다");
        createTranslationKeyIfNotExists("validation.confirm.password", "validation", "비밀번호 확인 검증", "비밀번호가 일치하지 않습니다");
        createTranslationKeyIfNotExists("validation.date.invalid", "validation", "날짜 형식 검증", "올바른 날짜 형식이 아닙니다");
        createTranslationKeyIfNotExists("validation.number.invalid", "validation", "숫자 형식 검증", "올바른 숫자 형식이 아닙니다");
        createTranslationKeyIfNotExists("notification.success.saved", "notification", "저장 성공 알림", "성공적으로 저장되었습니다");
        createTranslationKeyIfNotExists("notification.success.deleted", "notification", "삭제 성공 알림", "성공적으로 삭제되었습니다");
        createTranslationKeyIfNotExists("notification.success.updated", "notification", "수정 성공 알림", "성공적으로 수정되었습니다");
        createTranslationKeyIfNotExists("notification.error.networkError", "notification", "네트워크 오류 알림", "네트워크 오류가 발생했습니다");
        createTranslationKeyIfNotExists("notification.error.serverError", "notification", "서버 오류 알림", "서버 오류가 발생했습니다");
        createTranslationKeyIfNotExists("notification.info.processing", "notification", "처리중 정보 알림", "처리 중입니다...");

        // 4차 대량 키 등록 (33-42번째 그룹, 100개)
        // 33번째 그룹 - 파일 관리 및 업로드
        createTranslationKeyIfNotExists("file.upload.title", "file", "파일 업로드 제목", "파일 업로드");
        createTranslationKeyIfNotExists("file.upload.description", "file", "파일 업로드 설명", "파일을 끌어다 놓거나 클릭하여 업로드하세요");
        createTranslationKeyIfNotExists("file.upload.progress", "file", "업로드 진행", "업로드 진행 중...");
        createTranslationKeyIfNotExists("file.upload.success", "file", "업로드 성공", "파일이 성공적으로 업로드되었습니다");
        createTranslationKeyIfNotExists("file.upload.error", "file", "업로드 오류", "파일 업로드에 실패했습니다");
        createTranslationKeyIfNotExists("file.size.limit", "file", "파일 크기 제한", "파일 크기는 최대 {size}MB입니다");
        createTranslationKeyIfNotExists("file.type.invalid", "file", "파일 형식 오류", "지원하지 않는 파일 형식입니다");
        createTranslationKeyIfNotExists("file.download.preparing", "file", "다운로드 준비", "다운로드 준비 중...");
        createTranslationKeyIfNotExists("file.download.error", "file", "다운로드 오류", "파일 다운로드에 실패했습니다");
        createTranslationKeyIfNotExists("file.management.title", "file", "파일 관리", "파일 관리");

        // 34번째 그룹 - 사용자 관리 및 팀
        createTranslationKeyIfNotExists("team.management.title", "team", "팀 관리", "팀 관리");
        createTranslationKeyIfNotExists("team.create.title", "team", "팀 생성", "새 팀 생성");
        createTranslationKeyIfNotExists("team.member.add", "team", "팀원 추가", "팀원 추가");
        createTranslationKeyIfNotExists("team.member.remove", "team", "팀원 제거", "팀원 제거");
        createTranslationKeyIfNotExists("team.leader.assign", "team", "팀장 지정", "팀장 지정");
        createTranslationKeyIfNotExists("user.management.title", "user", "사용자 관리", "사용자 관리");
        createTranslationKeyIfNotExists("user.create.title", "user", "사용자 생성", "새 사용자 생성");
        createTranslationKeyIfNotExists("user.edit.title", "user", "사용자 편집", "사용자 편집");
        createTranslationKeyIfNotExists("user.deactivate.title", "user", "사용자 비활성화", "사용자 비활성화");
        createTranslationKeyIfNotExists("user.password.reset", "user", "비밀번호 재설정", "비밀번호 재설정");

        // 35번째 그룹 - 보고서 및 분석
        createTranslationKeyIfNotExists("report.dashboard.title", "report", "보고서 대시보드", "보고서 대시보드");
        createTranslationKeyIfNotExists("report.generate.title", "report", "보고서 생성", "보고서 생성");
        createTranslationKeyIfNotExists("report.template.select", "report", "보고서 템플릿 선택", "보고서 템플릿 선택");
        createTranslationKeyIfNotExists("report.period.select", "report", "보고 기간 선택", "보고 기간 선택");
        createTranslationKeyIfNotExists("report.format.pdf", "report", "PDF 형식", "PDF 형식");
        createTranslationKeyIfNotExists("report.format.excel", "report", "엑셀 형식", "엑셀 형식");
        createTranslationKeyIfNotExists("analytics.overview.title", "analytics", "분석 개요", "분석 개요");
        createTranslationKeyIfNotExists("analytics.trend.title", "analytics", "트렌드 분석", "트렌드 분석");
        createTranslationKeyIfNotExists("analytics.performance.title", "analytics", "성능 분석", "성능 분석");
        createTranslationKeyIfNotExists("analytics.quality.metrics", "analytics", "품질 지표", "품질 지표");

        // 36번째 그룹 - 설정 및 구성
        createTranslationKeyIfNotExists("settings.general.title", "settings", "일반 설정", "일반 설정");
        createTranslationKeyIfNotExists("settings.system.title", "settings", "시스템 설정", "시스템 설정");
        createTranslationKeyIfNotExists("settings.security.title", "settings", "보안 설정", "보안 설정");
        createTranslationKeyIfNotExists("settings.notification.title", "settings", "알림 설정", "알림 설정");
        createTranslationKeyIfNotExists("settings.appearance.title", "settings", "화면 설정", "화면 설정");
        createTranslationKeyIfNotExists("settings.language.title", "settings", "언어 설정", "언어 설정");
        createTranslationKeyIfNotExists("settings.backup.title", "settings", "백업 설정", "백업 설정");
        createTranslationKeyIfNotExists("config.database.title", "config", "데이터베이스 구성", "데이터베이스 구성");
        createTranslationKeyIfNotExists("config.api.title", "config", "API 구성", "API 구성");
        createTranslationKeyIfNotExists("config.integration.title", "config", "통합 구성", "통합 구성");

        // 37번째 그룹 - 작업 흐름 및 승인
        createTranslationKeyIfNotExists("approval.request.title", "approval", "승인 요청", "승인 요청");
        createTranslationKeyIfNotExists("approval.pending.list", "approval", "대기 중인 승인", "대기 중인 승인");
        createTranslationKeyIfNotExists("approval.approved.list", "approval", "승인된 항목", "승인된 항목");
        createTranslationKeyIfNotExists("approval.rejected.list", "approval", "거부된 항목", "거부된 항목");
        createTranslationKeyIfNotExists("workflow.step.next", "workflow", "다음 단계", "다음 단계");
        createTranslationKeyIfNotExists("workflow.step.previous", "workflow", "이전 단계", "이전 단계");
        createTranslationKeyIfNotExists("workflow.complete.title", "workflow", "작업 완료", "작업 완료");
        createTranslationKeyIfNotExists("workflow.cancel.title", "workflow", "작업 취소", "작업 취소");
        createTranslationKeyIfNotExists("task.assignment.title", "task", "작업 할당", "작업 할당");
        createTranslationKeyIfNotExists("task.deadline.title", "task", "작업 마감일", "작업 마감일");

        // 38번째 그룹 - 로그 및 감사
        createTranslationKeyIfNotExists("audit.log.title", "audit", "감사 로그", "감사 로그");
        createTranslationKeyIfNotExists("audit.trail.title", "audit", "감사 추적", "감사 추적");
        createTranslationKeyIfNotExists("log.system.title", "log", "시스템 로그", "시스템 로그");
        createTranslationKeyIfNotExists("log.user.activity", "log", "사용자 활동 로그", "사용자 활동 로그");
        createTranslationKeyIfNotExists("log.error.title", "log", "오류 로그", "오류 로그");
        createTranslationKeyIfNotExists("log.access.title", "log", "접근 로그", "접근 로그");
        createTranslationKeyIfNotExists("history.change.title", "history", "변경 이력", "변경 이력");
        createTranslationKeyIfNotExists("history.version.title", "history", "버전 이력", "버전 이력");
        createTranslationKeyIfNotExists("history.backup.title", "history", "백업 이력", "백업 이력");
        createTranslationKeyIfNotExists("monitoring.status.title", "monitoring", "모니터링 상태", "모니터링 상태");

        // 39번째 그룹 - 캘린더 및 일정
        createTranslationKeyIfNotExists("calendar.view.title", "calendar", "캘린더 보기", "캘린더 보기");
        createTranslationKeyIfNotExists("calendar.event.create", "calendar", "일정 생성", "일정 생성");
        createTranslationKeyIfNotExists("calendar.event.edit", "calendar", "일정 편집", "일정 편집");
        createTranslationKeyIfNotExists("calendar.event.delete", "calendar", "일정 삭제", "일정 삭제");
        createTranslationKeyIfNotExists("schedule.test.execution", "schedule", "테스트 실행 일정", "테스트 실행 일정");
        createTranslationKeyIfNotExists("schedule.maintenance.title", "schedule", "유지보수 일정", "유지보수 일정");
        createTranslationKeyIfNotExists("schedule.release.title", "schedule", "릴리스 일정", "릴리스 일정");
        createTranslationKeyIfNotExists("reminder.notification.title", "reminder", "알림 리마인더", "알림 리마인더");
        createTranslationKeyIfNotExists("deadline.approaching.title", "deadline", "마감일 임박", "마감일 임박");
        createTranslationKeyIfNotExists("milestone.achievement.title", "milestone", "마일스톤 달성", "마일스톤 달성");

        // 40번째 그룹 - 통계 및 차트
        createTranslationKeyIfNotExists("statistics.summary.title", "statistics", "통계 요약", "통계 요약");
        createTranslationKeyIfNotExists("statistics.detailed.title", "statistics", "상세 통계", "상세 통계");
        createTranslationKeyIfNotExists("chart.pie.title", "chart", "파이 차트", "파이 차트");
        createTranslationKeyIfNotExists("chart.bar.title", "chart", "막대 차트", "막대 차트");
        createTranslationKeyIfNotExists("chart.line.title", "chart", "선형 차트", "선형 차트");
        createTranslationKeyIfNotExists("chart.area.title", "chart", "영역 차트", "영역 차트");
        createTranslationKeyIfNotExists("chart.scatter.title", "chart", "산점도 차트", "산점도 차트");
        createTranslationKeyIfNotExists("chart.radar.title", "chart", "레이더 차트", "레이더 차트");
        createTranslationKeyIfNotExists("chart.heatmap.title", "chart", "히트맵 차트", "히트맵 차트");
        createTranslationKeyIfNotExists("chart.gauge.title", "chart", "게이지 차트", "게이지 차트");

        // 41번째 그룹 - 커뮤니케이션 및 협업
        createTranslationKeyIfNotExists("communication.chat.title", "communication", "채팅", "채팅");
        createTranslationKeyIfNotExists("communication.message.send", "communication", "메시지 전송", "메시지 전송");
        createTranslationKeyIfNotExists("communication.message.receive", "communication", "메시지 수신", "메시지 수신");
        createTranslationKeyIfNotExists("collaboration.share.title", "collaboration", "공유", "공유");
        createTranslationKeyIfNotExists("collaboration.comment.add", "collaboration", "댓글 추가", "댓글 추가");
        createTranslationKeyIfNotExists("collaboration.review.request", "collaboration", "검토 요청", "검토 요청");
        createTranslationKeyIfNotExists("collaboration.feedback.title", "collaboration", "피드백", "피드백");
        createTranslationKeyIfNotExists("discussion.forum.title", "discussion", "토론 포럼", "토론 포럼");
        createTranslationKeyIfNotExists("discussion.thread.create", "discussion", "토론 주제 생성", "토론 주제 생성");
        createTranslationKeyIfNotExists("discussion.reply.add", "discussion", "답글 추가", "답글 추가");

        // 42번째 그룹 - 모바일 및 반응형
        createTranslationKeyIfNotExists("mobile.menu.title", "mobile", "모바일 메뉴", "모바일 메뉴");
        createTranslationKeyIfNotExists("mobile.navigation.title", "mobile", "모바일 네비게이션", "모바일 네비게이션");
        createTranslationKeyIfNotExists("mobile.responsive.title", "mobile", "반응형 디자인", "반응형 디자인");
        createTranslationKeyIfNotExists("mobile.touch.gesture", "mobile", "터치 제스처", "터치 제스처");
        createTranslationKeyIfNotExists("mobile.offline.mode", "mobile", "오프라인 모드", "오프라인 모드");
        createTranslationKeyIfNotExists("mobile.sync.title", "mobile", "동기화", "동기화");
        createTranslationKeyIfNotExists("responsive.breakpoint.mobile", "responsive", "모바일 브레이크포인트", "모바일 브레이크포인트");
        createTranslationKeyIfNotExists("responsive.breakpoint.tablet", "responsive", "태블릿 브레이크포인트", "태블릿 브레이크포인트");
        createTranslationKeyIfNotExists("responsive.breakpoint.desktop", "responsive", "데스크톱 브레이크포인트", "데스크톱 브레이크포인트");
        createTranslationKeyIfNotExists("responsive.layout.adaptive", "responsive", "적응형 레이아웃", "적응형 레이아웃");

        // 콘솔 누락 키들 - 헤더 네비게이션
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "헤더 대시보드 네비게이션", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "헤더 조직 관리 네비게이션", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "헤더 사용자 관리 네비게이션", "사용자 관리");

        // 콘솔 누락 키들 - 조직 대시보드
        createTranslationKeyIfNotExists("organization.dashboard.title", "organization", "조직 대시보드 제목", "조직 대시보드");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers", "organization", "전체 사용자 수", "전체 사용자 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.activeProjects", "organization", "활성 프로젝트 수", "활성 프로젝트 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.testCases", "organization", "테스트케이스 수", "테스트케이스 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.completedTests", "organization", "완료된 테스트 수", "완료된 테스트 수");
        createTranslationKeyIfNotExists("organization.dashboard.stats.title", "organization", "조직 통계", "조직 통계");

        // 콘솔 누락 키들 - JIRA 연동
        createTranslationKeyIfNotExists("jira.status.connectionStatus", "jira", "JIRA 연결 상태", "JIRA 연결 상태");
        createTranslationKeyIfNotExists("jira.status.connected", "jira", "JIRA 연결됨", "연결됨");
        createTranslationKeyIfNotExists("jira.status.disconnected", "jira", "JIRA 연결 안됨", "연결 안됨");
        createTranslationKeyIfNotExists("jira.messages.connectionError", "jira", "JIRA 연결 오류", "JIRA 연결에 실패했습니다");
        createTranslationKeyIfNotExists("jira.messages.syncSuccess", "jira", "JIRA 동기화 성공", "JIRA와 성공적으로 동기화되었습니다");
        createTranslationKeyIfNotExists("jira.messages.syncError", "jira", "JIRA 동기화 오류", "JIRA 동기화에 실패했습니다");

        // JiraStatusIndicator 컴포넌트 관련
        createTranslationKeyIfNotExists("jira.indicator.checkingStatus", "jira", "JIRA 상태 확인 중", "확인 중...");
        createTranslationKeyIfNotExists("jira.indicator.unknown", "jira", "알 수 없는 상태", "알 수 없음");
        createTranslationKeyIfNotExists("jira.indicator.connectionFailed", "jira", "연결 실패", "연결 실패");
        createTranslationKeyIfNotExists("jira.indicator.setupRequired", "jira", "설정 필요 메시지", "JIRA와 연동하려면 먼저 설정을 완료해주세요.");
        createTranslationKeyIfNotExists("jira.indicator.setupButton", "jira", "JIRA 설정 버튼", "JIRA 설정하기");
        createTranslationKeyIfNotExists("jira.indicator.settingsButton", "jira", "설정 버튼", "설정");
        createTranslationKeyIfNotExists("jira.indicator.refreshTooltip", "jira", "새로고침 툴팁", "상태 새로고침");
        createTranslationKeyIfNotExists("jira.indicator.settingsTooltip", "jira", "설정 툴팁", "JIRA 설정");
        createTranslationKeyIfNotExists("jira.indicator.connectionInfo", "jira", "연결 정보", "연결 정보");
        createTranslationKeyIfNotExists("jira.indicator.server", "jira", "서버 라벨", "서버");
        createTranslationKeyIfNotExists("jira.indicator.user", "jira", "사용자 라벨", "사용자");
        createTranslationKeyIfNotExists("jira.indicator.lastTested", "jira", "마지막 테스트", "마지막 테스트");
        createTranslationKeyIfNotExists("jira.indicator.lastUpdate", "jira", "마지막 업데이트", "마지막 업데이트");
        createTranslationKeyIfNotExists("jira.indicator.error", "jira", "오류 라벨", "오류");
        createTranslationKeyIfNotExists("jira.indicator.connectedMessage", "jira", "연결 성공 메시지", "JIRA 서버와 정상적으로 연결되었습니다.");
        createTranslationKeyIfNotExists("jira.indicator.connectionFailedMessage", "jira", "연결 실패 메시지", "JIRA 서버 연결에 실패했습니다.");

        // JiraConfigDialog 컴포넌트 관련
        createTranslationKeyIfNotExists("jira.config.dialogTitle.add", "jira", "JIRA 설정 추가 제목", "JIRA 설정 추가");
        createTranslationKeyIfNotExists("jira.config.dialogTitle.edit", "jira", "JIRA 설정 수정 제목", "JIRA 설정 수정");
        createTranslationKeyIfNotExists("jira.config.serverUrl", "jira", "서버 URL 라벨", "JIRA 서버 URL");
        createTranslationKeyIfNotExists("jira.config.serverUrlPlaceholder", "jira", "서버 URL 플레이스홀더", "https://your-domain.atlassian.net");
        createTranslationKeyIfNotExists("jira.config.serverUrlHelper", "jira", "서버 URL 도움말", "JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)");
        createTranslationKeyIfNotExists("jira.config.username", "jira", "사용자명 라벨", "사용자명 (이메일)");
        createTranslationKeyIfNotExists("jira.config.usernamePlaceholder", "jira", "사용자명 플레이스홀더", "user@company.com");
        createTranslationKeyIfNotExists("jira.config.usernameHelper", "jira", "사용자명 도움말", "JIRA 로그인에 사용하는 이메일 주소");
        createTranslationKeyIfNotExists("jira.config.apiToken", "jira", "API 토큰 라벨", "API 토큰");
        createTranslationKeyIfNotExists("jira.config.apiTokenHelper", "jira", "API 토큰 도움말", "JIRA API 토큰을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.testProjectKey", "jira", "테스트 프로젝트 키 라벨", "테스트 프로젝트 키 (선택사항)");
        createTranslationKeyIfNotExists("jira.config.testProjectKeyPlaceholder", "jira", "테스트 프로젝트 키 플레이스홀더", "TEST");
        createTranslationKeyIfNotExists("jira.config.testProjectKeyHelper", "jira", "테스트 프로젝트 키 도움말", "연결 테스트 시 사용할 프로젝트 키 (선택사항)");
        createTranslationKeyIfNotExists("jira.config.autoTest", "jira", "자동 테스트 라벨", "저장 전 자동으로 연결 테스트 수행");
        createTranslationKeyIfNotExists("jira.config.testButton", "jira", "연결 테스트 버튼", "연결 테스트");
        createTranslationKeyIfNotExists("jira.config.testing", "jira", "테스트 중 라벨", "테스트 중...");
        createTranslationKeyIfNotExists("jira.config.testSuccess", "jira", "테스트 성공", "연결 성공");
        createTranslationKeyIfNotExists("jira.config.testFailed", "jira", "테스트 실패", "연결 실패");
        createTranslationKeyIfNotExists("jira.config.jiraVersion", "jira", "JIRA 버전", "JIRA 버전");
        createTranslationKeyIfNotExists("jira.config.testTime", "jira", "테스트 시각", "테스트 시각");
        createTranslationKeyIfNotExists("jira.config.availableProjects", "jira", "사용 가능한 프로젝트", "사용 가능한 프로젝트:");
        createTranslationKeyIfNotExists("jira.config.moreProjects", "jira", "더 많은 프로젝트", "외 {count}개 프로젝트");
        createTranslationKeyIfNotExists("jira.config.apiTokenGuide", "jira", "API 토큰 생성 안내", "API 토큰 생성 방법:");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep1", "jira", "API 토큰 생성 1단계", "1. JIRA → 프로필 → 계정 설정 → 보안");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep2", "jira", "API 토큰 생성 2단계", "2. \"API 토큰 만들기\" 클릭");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep3", "jira", "API 토큰 생성 3단계", "3. 토큰 이름 입력 후 생성");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep4", "jira", "API 토큰 생성 4단계", "4. 생성된 토큰을 복사하여 위에 입력");
        createTranslationKeyIfNotExists("jira.config.cancelButton", "jira", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("jira.config.saveButton", "jira", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("jira.config.saving", "jira", "저장 중", "저장 중...");
        createTranslationKeyIfNotExists("jira.config.error.serverUrlRequired", "jira", "서버 URL 필수 오류", "JIRA 서버 URL을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.invalidUrl", "jira", "잘못된 URL 오류", "올바른 URL 형식을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.usernameRequired", "jira", "사용자명 필수 오류", "사용자명을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.apiTokenRequired", "jira", "API 토큰 필수 오류", "API 토큰을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.connectionTestFailed", "jira", "연결 테스트 실패 오류", "연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.");
        createTranslationKeyIfNotExists("jira.config.error.testError", "jira", "테스트 중 오류", "연결 테스트 중 오류가 발생했습니다");
        createTranslationKeyIfNotExists("jira.config.confirm.saveWithoutTest", "jira", "테스트 없이 저장 확인", "JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?");

        // API 응답 메시지 번역 키
        createTranslationKeyIfNotExists("jira.api.connectionSuccess", "jira", "API 연결 성공", "JIRA 연결 성공");
        createTranslationKeyIfNotExists("jira.api.authFailure", "jira", "API 인증 실패", "인증 실패 또는 권한 부족");
        createTranslationKeyIfNotExists("jira.api.serverError", "jira", "API 서버 오류", "JIRA 서버 오류");
        createTranslationKeyIfNotExists("jira.api.networkError", "jira", "API 네트워크 오류", "네트워크 연결 실패");
        createTranslationKeyIfNotExists("jira.api.testFailure", "jira", "API 테스트 실패", "연결 테스트 실패");
        createTranslationKeyIfNotExists("jira.api.unknownError", "jira", "API 알 수 없는 오류", "알 수 없는 오류");

        // 콘솔 누락 키들 - 공통 버튼
        createTranslationKeyIfNotExists("common.buttons.refresh", "common", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("common.buttons.reset", "common", "재설정 버튼", "재설정");
        createTranslationKeyIfNotExists("common.buttons.apply", "common", "적용 버튼", "적용");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.ok", "common", "확인 버튼", "확인");
        createTranslationKeyIfNotExists("common.buttons.yes", "common", "예 버튼", "예");
        createTranslationKeyIfNotExists("common.buttons.no", "common", "아니오 버튼", "아니오");

        log.info("번역 관리 페이지 관련 번역 키 초기화 완료");
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
