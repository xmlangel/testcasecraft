// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ExtendedUIKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 확장 UI 관련 번역 키 초기화
 *
 * <p>TranslationKeysInitializer에서 분리된 나머지 키들을 관리합니다. - 공통 UI 컴포넌트 키들 (common, header, table,
 * search, navigation 등) - 도메인 특화 키들 (organization, dashboard, testResult, testCase, project, junit
 * 등) - 시스템 키들 (validation, notification, workflow, file, export, action 등) - 차트 및 분석 키들 (chart,
 * statistics, analytics, report 등) - 협업 및 설정 키들 (user, team, communication, settings, config 등)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExtendedUIKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    log.info("확장 UI 관련 번역 키 초기화 시작");

    initializeCommonUIKeys();
    initializeDomainSpecificKeys();
    initializeSystemKeys();
    initializeChartAndAnalyticsKeys();
    initializeCollaborationAndSettingsKeys();

    log.info("확장 UI 관련 번역 키 초기화 완료");
  }

  /** 공통 UI 컴포넌트 키들 초기화 */
  private void initializeCommonUIKeys() {
    // 공통 버튼 키들
    createTranslationKeyIfNotExists("common.buttons.import", "common", "가져오기 버튼", "가져오기");
    createTranslationKeyIfNotExists("common.buttons.add", "common", "추가 버튼", "추가");
    createTranslationKeyIfNotExists("common.table.actions", "common", "테이블 작업 헤더", "작업");
    createTranslationKeyIfNotExists("common.default", "common", "기본 상태 표시", "기본");
    createTranslationKeyIfNotExists("common.active", "common", "활성 상태 표시", "활성");
    createTranslationKeyIfNotExists("common.inactive", "common", "비활성 상태 표시", "비활성");
    createTranslationKeyIfNotExists("common.search.keyword", "common", "키워드 검색 라벨", "키워드 검색");
    createTranslationKeyIfNotExists("common.loading", "common", "로딩 메시지", "로딩 중...");
    createTranslationKeyIfNotExists("common.buttons.refresh", "common", "새로고침 버튼", "새로고침");
    createTranslationKeyIfNotExists("common.unauthorized.title", "common", "권한 없음 제목", "권한 없음");
    createTranslationKeyIfNotExists(
        "common.unauthorized.message", "common", "권한 없음 메시지", "이 페이지에 접근할 권한이 없습니다");
    createTranslationKeyIfNotExists("common.all", "common", "전체 선택", "전체");
    createTranslationKeyIfNotExists("common.status", "common", "상태", "상태");
    createTranslationKeyIfNotExists("common.buttons.edit", "common", "수정 버튼", "수정");
    createTranslationKeyIfNotExists("common.buttons.delete", "common", "삭제 버튼", "삭제");
    createTranslationKeyIfNotExists("common.buttons.cancel", "common", "취소 버튼", "취소");
    createTranslationKeyIfNotExists("common.buttons.create", "common", "생성 버튼", "생성");

    // 헤더 네비게이션 키들
    createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 메뉴", "대시보드");
    createTranslationKeyIfNotExists(
        "header.nav.organizationManagement", "header", "조직 관리 메뉴", "조직 관리");
    createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 메뉴", "사용자 관리");
    createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 메뉴", "메일 설정");
    createTranslationKeyIfNotExists(
        "header.nav.translationManagement", "header", "번역 관리 메뉴", "번역 관리");
    createTranslationKeyIfNotExists("header.nav.managementMenu", "header", "관리 메뉴 그룹", "관리 메뉴");
    createTranslationKeyIfNotExists(
        "header.nav.projectSelection", "header", "프로젝트 선택 메뉴", "프로젝트 선택");
    createTranslationKeyIfNotExists("header.userMenu.profile", "header", "프로필 메뉴", "프로필");
    createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

    // 테이블 관련 키들

    // 검색 및 필터링 키들

    // 네비게이션 키들

    // 추가 네비게이션 키들

    // 추가 Validation 키들
  }

  /** 도메인 특화 키들 초기화 */
  private void initializeDomainSpecificKeys() {
    // 테스트 결과 키들
    createTranslationKeyIfNotExists(
        "testResult.form.title", "testResult", "테스트 결과 폼 제목", "테스트 결과 입력");
    createTranslationKeyIfNotExists(
        "testResult.pieChart.title", "testResult", "파이차트 제목", "테스트 결과 파이차트");
    createTranslationKeyIfNotExists(
        "testResult.pieChart.loading", "testResult", "차트 로딩", "차트 로딩 중...");
    createTranslationKeyIfNotExists(
        "testResult.pieChart.noData", "testResult", "차트 데이터 없음", "차트 데이터 없음");
    createTranslationKeyIfNotExists("testResult.pieChart.count", "testResult", "개수", "개수");
    createTranslationKeyIfNotExists("testResult.pieChart.percentage", "testResult", "비율", "비율");
    createTranslationKeyIfNotExists(
        "testResult.pieChart.totalTestCases", "testResult", "총 테스트 케이스", "총 테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.statistics.noData", "testResult", "통계 데이터 없음", "통계 데이터 없음");
    createTranslationKeyIfNotExists(
        "testResult.error.testCaseLoadFailed", "testResult", "테스트케이스 로드 실패", "테스트 케이스 로드 실패");
    createTranslationKeyIfNotExists("testResult.error.saveFailed", "testResult", "저장 실패", "저장 실패");
    createTranslationKeyIfNotExists(
        "testResult.error.resultRequired", "testResult", "결과 필수", "테스트 결과는 필수입니다");
    createTranslationKeyIfNotExists("testResult.form.preCondition", "testResult", "사전 조건", "사전 조건");
    createTranslationKeyIfNotExists("testResult.form.testSteps", "testResult", "테스트 단계", "테스트 단계");
    createTranslationKeyIfNotExists(
        "testResult.form.expectedResult", "testResult", "예상 결과", "예상 결과");
    createTranslationKeyIfNotExists(
        "testResult.form.notesLimitError", "testResult", "노트 길이 제한 에러", "비고는 10,000자 이내로 입력해주세요");
    createTranslationKeyIfNotExists(
        "testResult.form.notesHelp", "testResult", "노트 도움말", "테스트 실행 시 특이사항이나 추가 정보를 입력하세요");
    createTranslationKeyIfNotExists(
        "testResult.form.fileAttachment", "testResult", "파일 첨부", "파일 첨부");
    createTranslationKeyIfNotExists(
        "testResult.form.fileUploading", "testResult", "파일 업로드 중", "파일 업로드 중...");
    createTranslationKeyIfNotExists("testResult.form.fileSelect", "testResult", "파일 선택", "파일 선택");
    createTranslationKeyIfNotExists(
        "testResult.form.jiraIntegration", "testResult", "JIRA 연동", "JIRA 연동");
    createTranslationKeyIfNotExists(
        "testResult.form.jiraComment", "testResult", "JIRA 코멘트", "JIRA 코멘트");

    // 조직 관련 키들
    createTranslationKeyIfNotExists(
        "organization.dashboard.title", "organization", "조직 대시보드 제목", "조직 대시보드");
    createTranslationKeyIfNotExists(
        "organization.management.title", "organization", "조직 관리 제목", "조직 관리");
    createTranslationKeyIfNotExists(
        "organization.dialog.edit.title", "organization", "조직 수정 제목", "조직 수정");
    createTranslationKeyIfNotExists(
        "organization.dialog.create.title", "organization", "조직 생성 제목", "조직 생성");
    createTranslationKeyIfNotExists("organization.form.name", "organization", "조직명", "조직명");
    createTranslationKeyIfNotExists(
        "organization.dialog.delete.title", "organization", "조직 삭제 제목", "조직 삭제");
    createTranslationKeyIfNotExists(
        "organization.dialog.delete.message", "organization", "조직 삭제 메시지", "조직을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "organization.dialog.invite.title", "organization", "멤버 초대 제목", "멤버 초대");
    createTranslationKeyIfNotExists(
        "organization.dialog.createProject.title", "organization", "프로젝트 생성 제목", "프로젝트 생성");
    createTranslationKeyIfNotExists(
        "organization.form.nameRequired", "organization", "조직명 필수", "조직명은 필수입니다");
    createTranslationKeyIfNotExists(
        "organization.buttons.createNew", "organization", "새 조직 생성 버튼", "새 조직 만들기");
    createTranslationKeyIfNotExists(
        "organization.buttons.firstOrganization", "organization", "첫 조직 생성 버튼", "첫 번째 조직 만들기");
    createTranslationKeyIfNotExists("organization.buttons.view", "organization", "보기 버튼", "보기");
    createTranslationKeyIfNotExists(
        "organization.dialog.delete.warning", "organization", "삭제 경고", "이 작업은 되돌릴 수 없습니다");
    createTranslationKeyIfNotExists(
        "organization.dashboard.metrics.totalUsers", "organization", "전체 사용자 수", "전체 사용자 수");

    // 대시보드 키들
    createTranslationKeyIfNotExists("dashboard.title", "dashboard", "대시보드 제목", "대시보드");
    createTranslationKeyIfNotExists(
        "dashboard.noData.message", "dashboard", "데이터 없음 메시지", "표시할 데이터가 없습니다");
    createTranslationKeyIfNotExists("dashboard.error.retry", "dashboard", "다시 시도", "다시 시도");
    createTranslationKeyIfNotExists(
        "dashboard.error.goToLogin", "dashboard", "로그인으로 이동", "로그인으로 이동");
    createTranslationKeyIfNotExists("dashboard.error.details", "dashboard", "상세 정보", "상세 정보");

    // 프로젝트 키들
    createTranslationKeyIfNotExists("project.form.name", "project", "프로젝트명", "프로젝트명");
    createTranslationKeyIfNotExists("project.form.description", "project", "프로젝트 설명", "프로젝트 설명");

    // 테스트 케이스 키들
    createTranslationKeyIfNotExists("testCase.form.priority", "testCase", "우선순위", "우선순위");
    createTranslationKeyIfNotExists("testCase.priority.high", "testCase", "높은 우선순위", "높음");
    createTranslationKeyIfNotExists("testCase.priority.medium", "testCase", "보통 우선순위", "보통");
    createTranslationKeyIfNotExists("testCase.priority.low", "testCase", "낮은 우선순위", "낮음");
    createTranslationKeyIfNotExists(
        "testCaseResult.page.title", "testCase", "테스트케이스 결과 제목", "테스트 케이스 결과");

    // 테스트 실행 키들
    createTranslationKeyIfNotExists(
        "testExecution.status.notStarted", "testExecution", "시작안됨 상태", "시작 안됨");
    createTranslationKeyIfNotExists(
        "testExecution.status.inProgress", "testExecution", "진행중 상태", "진행중");
    createTranslationKeyIfNotExists(
        "testExecution.status.completed", "testExecution", "완료 상태", "완료");
    createTranslationKeyIfNotExists(
        "testExecution.list.title", "testExecution", "테스트 실행 목록 제목", "테스트 실행 목록");
    createTranslationKeyIfNotExists(
        "testExecution.list.delete.title", "testExecution", "테스트 실행 삭제 제목", "테스트 실행 삭제");

    // JUnit 키들
    createTranslationKeyIfNotExists(
        "junit.placeholder.executionName", "junit", "실행명 플레이스홀더", "실행 이름을 입력하세요");
    createTranslationKeyIfNotExists(
        "junit.dashboard.title", "junit", "JUnit 대시보드 제목", "JUnit 대시보드");
    createTranslationKeyIfNotExists("junit.table.status", "junit", "JUnit 테이블 상태", "상태");
    createTranslationKeyIfNotExists(
        "junit.upload.dialog.title", "junit", "JUnit 업로드 제목", "JUnit 결과 업로드");
    createTranslationKeyIfNotExists(
        "junit.error.loadFailed", "junit", "JUnit 로드 실패", "JUnit 결과 로드 실패");
    createTranslationKeyIfNotExists("junit.stats.error", "junit", "JUnit 에러", "에러");
    createTranslationKeyIfNotExists("junit.stats.errorTests", "junit", "JUnit 에러 테스트", "에러 테스트");
    createTranslationKeyIfNotExists("junit.stats.successRate", "junit", "JUnit 성공률", "성공률");
    createTranslationKeyIfNotExists("junit.stats.failed", "junit", "JUnit 실패", "실패");
  }

  /** 시스템 키들 초기화 */
  private void initializeSystemKeys() {
    // 검증 메시지 키들
    createTranslationKeyIfNotExists(
        "validation.languageDialog.codeRequired", "validation", "언어 코드 필수 검증", "언어 코드는 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.languageDialog.codeFormat",
        "validation",
        "언어 코드 형식 검증",
        "언어 코드는 2-3자의 소문자여야 합니다");
    createTranslationKeyIfNotExists(
        "validation.languageDialog.nameRequired", "validation", "언어명 필수 검증", "언어명은 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.languageDialog.nativeNameRequired", "validation", "원어명 필수 검증", "원어명은 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.languageDialog.sortOrderMin",
        "validation",
        "정렬 순서 최소값 검증",
        "정렬 순서는 0 이상이어야 합니다");
    createTranslationKeyIfNotExists(
        "validation.keyDialog.keyNameRequired", "validation", "키 이름 필수 검증", "키 이름은 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.keyDialog.categoryRequired", "validation", "카테고리 필수 검증", "카테고리를 선택해주세요");
    createTranslationKeyIfNotExists(
        "validation.keyDialog.descriptionRequired", "validation", "설명 필수 검증", "설명은 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.keyDialog.defaultValueRequired", "validation", "기본값 필수 검증", "기본값은 필수입니다");
    createTranslationKeyIfNotExists(
        "validation.translationDialog.keyRequired", "validation", "번역 키 필수 검증", "번역 키를 선택해주세요");
    createTranslationKeyIfNotExists(
        "validation.translationDialog.languageRequired", "validation", "언어 필수 검증", "언어를 선택해주세요");
    createTranslationKeyIfNotExists(
        "validation.translationDialog.valueRequired", "validation", "번역값 필수 검증", "번역값은 필수입니다");

    // 알림 키들

    // 파일 관리 키들

    // 내보내기 키들

    // 워크플로우 키들

    // 액션 키들

    // 캘린더 및 일정 관리 키들

    // 커뮤니케이션 및 협업 키들

    // 모바일 및 반응형 UI 키들
  }

  /** 차트 및 분석 키들 초기화 */
  private void initializeChartAndAnalyticsKeys() {
    // 차트 키들

    // 통계 키들

    // 분석 키들

    // 보고서 키들
  }

  /** 협업 및 설정 키들 초기화 */
  private void initializeCollaborationAndSettingsKeys() {
    // 사용자 관리 키들

    // 팀 관리 키들

    // 협업 키들

    // 설정 키들
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
