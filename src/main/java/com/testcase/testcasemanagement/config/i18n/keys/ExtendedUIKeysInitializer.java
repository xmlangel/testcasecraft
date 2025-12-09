// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ExtendedUIKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 확장 UI 관련 번역 키 초기화
 *
 * TranslationKeysInitializer에서 분리된 나머지 키들을 관리합니다.
 * - 공통 UI 컴포넌트 키들 (common, header, table, search, navigation 등)
 * - 도메인 특화 키들 (organization, dashboard, testResult, testCase, project, junit 등)
 * - 시스템 키들 (validation, notification, workflow, file, export, action 등)
 * - 차트 및 분석 키들 (chart, statistics, analytics, report 등)
 * - 협업 및 설정 키들 (user, team, communication, settings, config 등)
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

    /**
     * 공통 UI 컴포넌트 키들 초기화
     */
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
        createTranslationKeyIfNotExists("common.unauthorized.message", "common", "권한 없음 메시지", "이 페이지에 접근할 권한이 없습니다");
        createTranslationKeyIfNotExists("common.all", "common", "전체 선택", "전체");
        createTranslationKeyIfNotExists("common.status", "common", "상태", "상태");
        createTranslationKeyIfNotExists("common.buttons.edit", "common", "수정 버튼", "수정");
        createTranslationKeyIfNotExists("common.buttons.delete", "common", "삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.create", "common", "생성 버튼", "생성");
        createTranslationKeyIfNotExists("common.buttons.reset", "common", "재설정 버튼", "재설정");
        createTranslationKeyIfNotExists("common.buttons.apply", "common", "적용 버튼", "적용");
        createTranslationKeyIfNotExists("common.buttons.ok", "common", "확인 버튼", "확인");
        createTranslationKeyIfNotExists("common.buttons.yes", "common", "예 버튼", "예");
        createTranslationKeyIfNotExists("common.buttons.no", "common", "아니오 버튼", "아니오");

        // 헤더 네비게이션 키들
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 메뉴", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 메뉴", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 메뉴", "사용자 관리");
        createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 메뉴", "메일 설정");
        createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 메뉴", "번역 관리");
        createTranslationKeyIfNotExists("header.nav.managementMenu", "header", "관리 메뉴 그룹", "관리 메뉴");
        createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 메뉴", "프로젝트 선택");
        createTranslationKeyIfNotExists("header.userMenu.profile", "header", "프로필 메뉴", "프로필");
        createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

        // 테이블 관련 키들
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

        // 검색 및 필터링 키들
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

        // 네비게이션 키들
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

        // 추가 네비게이션 키들
        createTranslationKeyIfNotExists("navigation.menu.testExecutions", "navigation", "테스트 실행 메뉴", "테스트 실행");
        createTranslationKeyIfNotExists("navigation.menu.settings", "navigation", "설정 메뉴", "설정");
        createTranslationKeyIfNotExists("navigation.menu.help", "navigation", "도움말 메뉴", "도움말");
        createTranslationKeyIfNotExists("navigation.user.profile", "navigation", "사용자 프로필", "프로필");
        createTranslationKeyIfNotExists("navigation.user.preferences", "navigation", "사용자 환경설정", "환경설정");
        createTranslationKeyIfNotExists("navigation.user.logout", "navigation", "로그아웃", "로그아웃");
        createTranslationKeyIfNotExists("navigation.breadcrumb.back", "navigation", "뒤로 가기", "뒤로");

        // 추가 Validation 키들
        createTranslationKeyIfNotExists("validation.email.invalid", "validation", "이메일 형식 오류", "올바른 이메일 형식이 아닙니다");
        createTranslationKeyIfNotExists("validation.password.minLength", "validation", "비밀번호 최소 길이",
                "비밀번호는 최소 8자 이상이어야 합니다");
    }

    /**
     * 도메인 특화 키들 초기화
     */
    private void initializeDomainSpecificKeys() {
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
        createTranslationKeyIfNotExists("testResult.error.testCaseLoadFailed", "testResult", "테스트케이스 로드 실패",
                "테스트 케이스 로드 실패");
        createTranslationKeyIfNotExists("testResult.error.saveFailed", "testResult", "저장 실패", "저장 실패");
        createTranslationKeyIfNotExists("testResult.error.resultRequired", "testResult", "결과 필수", "테스트 결과는 필수입니다");
        createTranslationKeyIfNotExists("testResult.form.preCondition", "testResult", "사전 조건", "사전 조건");
        createTranslationKeyIfNotExists("testResult.form.testSteps", "testResult", "테스트 단계", "테스트 단계");
        createTranslationKeyIfNotExists("testResult.form.expectedResult", "testResult", "예상 결과", "예상 결과");
        createTranslationKeyIfNotExists("testResult.form.notesLimitError", "testResult", "노트 길이 제한 에러",
                "비고는 10,000자 이내로 입력해주세요");
        createTranslationKeyIfNotExists("testResult.form.notesHelp", "testResult", "노트 도움말",
                "테스트 실행 시 특이사항이나 추가 정보를 입력하세요");
        createTranslationKeyIfNotExists("testResult.form.fileAttachment", "testResult", "파일 첨부", "파일 첨부");
        createTranslationKeyIfNotExists("testResult.form.fileUploading", "testResult", "파일 업로드 중", "파일 업로드 중...");
        createTranslationKeyIfNotExists("testResult.form.fileSelect", "testResult", "파일 선택", "파일 선택");
        createTranslationKeyIfNotExists("testResult.form.jiraIntegration", "testResult", "JIRA 연동", "JIRA 연동");
        createTranslationKeyIfNotExists("testResult.form.jiraComment", "testResult", "JIRA 코멘트", "JIRA 코멘트");

        // 조직 관련 키들
        createTranslationKeyIfNotExists("organization.dashboard.title", "organization", "조직 대시보드 제목", "조직 대시보드");
        createTranslationKeyIfNotExists("organization.management.title", "organization", "조직 관리 제목", "조직 관리");
        createTranslationKeyIfNotExists("organization.dialog.edit.title", "organization", "조직 수정 제목", "조직 수정");
        createTranslationKeyIfNotExists("organization.dialog.create.title", "organization", "조직 생성 제목", "조직 생성");
        createTranslationKeyIfNotExists("organization.form.name", "organization", "조직명", "조직명");
        createTranslationKeyIfNotExists("organization.dialog.delete.title", "organization", "조직 삭제 제목", "조직 삭제");
        createTranslationKeyIfNotExists("organization.dialog.delete.message", "organization", "조직 삭제 메시지",
                "조직을 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("organization.dialog.invite.title", "organization", "멤버 초대 제목", "멤버 초대");
        createTranslationKeyIfNotExists("organization.dialog.createProject.title", "organization", "프로젝트 생성 제목",
                "프로젝트 생성");
        createTranslationKeyIfNotExists("organization.form.nameRequired", "organization", "조직명 필수", "조직명은 필수입니다");
        createTranslationKeyIfNotExists("organization.buttons.createNew", "organization", "새 조직 생성 버튼", "새 조직 만들기");
        createTranslationKeyIfNotExists("organization.buttons.firstOrganization", "organization", "첫 조직 생성 버튼",
                "첫 번째 조직 만들기");
        createTranslationKeyIfNotExists("organization.buttons.view", "organization", "보기 버튼", "보기");
        createTranslationKeyIfNotExists("organization.dialog.delete.warning", "organization", "삭제 경고",
                "이 작업은 되돌릴 수 없습니다");
        createTranslationKeyIfNotExists("organization.detail.members", "organization", "멤버", "멤버");
        createTranslationKeyIfNotExists("organization.detail.projects", "organization", "프로젝트", "프로젝트");
        createTranslationKeyIfNotExists("organization.detail.settings", "organization", "설정", "설정");
        createTranslationKeyIfNotExists("organization.member.role.admin", "organization", "관리자 역할", "관리자");
        createTranslationKeyIfNotExists("organization.member.role.member", "organization", "멤버 역할", "멤버");
        createTranslationKeyIfNotExists("organization.member.role.viewer", "organization", "뷰어 역할", "뷰어");
        createTranslationKeyIfNotExists("organization.project.status.active", "organization", "활성 상태", "활성");
        createTranslationKeyIfNotExists("organization.project.status.inactive", "organization", "비활성 상태", "비활성");
        createTranslationKeyIfNotExists("organization.project.status.archived", "organization", "보관됨 상태", "보관됨");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers", "organization", "전체 사용자 수",
                "전체 사용자 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.activeProjects", "organization", "활성 프로젝트 수",
                "활성 프로젝트 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.testCases", "organization", "테스트케이스 수",
                "테스트케이스 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.completedTests", "organization", "완료된 테스트 수",
                "완료된 테스트 수");
        createTranslationKeyIfNotExists("organization.dashboard.stats.title", "organization", "조직 통계", "조직 통계");

        // 대시보드 키들
        createTranslationKeyIfNotExists("dashboard.title", "dashboard", "대시보드 제목", "대시보드");
        createTranslationKeyIfNotExists("dashboard.noData.message", "dashboard", "데이터 없음 메시지", "표시할 데이터가 없습니다");
        createTranslationKeyIfNotExists("dashboard.error.retry", "dashboard", "다시 시도", "다시 시도");
        createTranslationKeyIfNotExists("dashboard.error.goToLogin", "dashboard", "로그인으로 이동", "로그인으로 이동");
        createTranslationKeyIfNotExists("dashboard.error.details", "dashboard", "상세 정보", "상세 정보");
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

        // 프로젝트 키들
        createTranslationKeyIfNotExists("project.form.name", "project", "프로젝트명", "프로젝트명");
        createTranslationKeyIfNotExists("project.form.description", "project", "프로젝트 설명", "프로젝트 설명");
        createTranslationKeyIfNotExists("project.form.startDate", "project", "시작일", "시작일");
        createTranslationKeyIfNotExists("project.form.endDate", "project", "종료일", "종료일");
        createTranslationKeyIfNotExists("project.status.planning", "project", "계획 상태", "계획");
        createTranslationKeyIfNotExists("project.status.inProgress", "project", "진행중 상태", "진행중");
        createTranslationKeyIfNotExists("project.status.completed", "project", "완료 상태", "완료");
        createTranslationKeyIfNotExists("project.status.onHold", "project", "보류 상태", "보류");

        // 테스트 케이스 키들
        createTranslationKeyIfNotExists("testCase.form.name", "testCase", "테스트케이스명", "테스트 케이스명");
        createTranslationKeyIfNotExists("testCase.form.priority", "testCase", "우선순위", "우선순위");
        createTranslationKeyIfNotExists("testCase.priority.high", "testCase", "높은 우선순위", "높음");
        createTranslationKeyIfNotExists("testCase.priority.medium", "testCase", "보통 우선순위", "보통");
        createTranslationKeyIfNotExists("testCase.priority.low", "testCase", "낮은 우선순위", "낮음");
        createTranslationKeyIfNotExists("testCase.status.draft", "testCase", "초안 상태", "초안");
        createTranslationKeyIfNotExists("testCase.status.review", "testCase", "검토 상태", "검토중");
        createTranslationKeyIfNotExists("testCase.status.approved", "testCase", "승인 상태", "승인됨");
        createTranslationKeyIfNotExists("testCase.status.deprecated", "testCase", "사용중지 상태", "사용중지");
        createTranslationKeyIfNotExists("testCaseResult.page.title", "testCase", "테스트케이스 결과 제목", "테스트 케이스 결과");

        // 테스트 실행 키들
        createTranslationKeyIfNotExists("testExecution.status.notStarted", "testExecution", "시작안됨 상태", "시작 안됨");
        createTranslationKeyIfNotExists("testExecution.status.inProgress", "testExecution", "진행중 상태", "진행중");
        createTranslationKeyIfNotExists("testExecution.status.completed", "testExecution", "완료 상태", "완료");
        createTranslationKeyIfNotExists("testExecution.list.title", "testExecution", "테스트 실행 목록 제목", "테스트 실행 목록");
        createTranslationKeyIfNotExists("testExecution.list.delete.title", "testExecution", "테스트 실행 삭제 제목",
                "테스트 실행 삭제");

        // JUnit 키들
        createTranslationKeyIfNotExists("junit.placeholder.executionName", "junit", "실행명 플레이스홀더", "실행 이름을 입력하세요");
        createTranslationKeyIfNotExists("junit.dashboard.title", "junit", "JUnit 대시보드 제목", "JUnit 대시보드");
        createTranslationKeyIfNotExists("junit.table.status", "junit", "JUnit 테이블 상태", "상태");
        createTranslationKeyIfNotExists("junit.upload.dialog.title", "junit", "JUnit 업로드 제목", "JUnit 결과 업로드");
        createTranslationKeyIfNotExists("junit.error.loadFailed", "junit", "JUnit 로드 실패", "JUnit 결과 로드 실패");
        createTranslationKeyIfNotExists("junit.stats.error", "junit", "JUnit 에러", "에러");
        createTranslationKeyIfNotExists("junit.stats.errorTests", "junit", "JUnit 에러 테스트", "에러 테스트");
        createTranslationKeyIfNotExists("junit.stats.successRate", "junit", "JUnit 성공률", "성공률");
        createTranslationKeyIfNotExists("junit.stats.failed", "junit", "JUnit 실패", "실패");
    }

    /**
     * 시스템 키들 초기화
     */
    private void initializeSystemKeys() {
        // 검증 메시지 키들
        createTranslationKeyIfNotExists("validation.languageDialog.codeRequired", "validation", "언어 코드 필수 검증",
                "언어 코드는 필수입니다");
        createTranslationKeyIfNotExists("validation.languageDialog.codeFormat", "validation", "언어 코드 형식 검증",
                "언어 코드는 2-3자의 소문자여야 합니다");
        createTranslationKeyIfNotExists("validation.languageDialog.nameRequired", "validation", "언어명 필수 검증",
                "언어명은 필수입니다");
        createTranslationKeyIfNotExists("validation.languageDialog.nativeNameRequired", "validation", "원어명 필수 검증",
                "원어명은 필수입니다");
        createTranslationKeyIfNotExists("validation.languageDialog.sortOrderMin", "validation", "정렬 순서 최소값 검증",
                "정렬 순서는 0 이상이어야 합니다");
        createTranslationKeyIfNotExists("validation.keyDialog.keyNameRequired", "validation", "키 이름 필수 검증",
                "키 이름은 필수입니다");
        createTranslationKeyIfNotExists("validation.keyDialog.categoryRequired", "validation", "카테고리 필수 검증",
                "카테고리를 선택해주세요");
        createTranslationKeyIfNotExists("validation.keyDialog.descriptionRequired", "validation", "설명 필수 검증",
                "설명은 필수입니다");
        createTranslationKeyIfNotExists("validation.keyDialog.defaultValueRequired", "validation", "기본값 필수 검증",
                "기본값은 필수입니다");
        createTranslationKeyIfNotExists("validation.translationDialog.keyRequired", "validation", "번역 키 필수 검증",
                "번역 키를 선택해주세요");
        createTranslationKeyIfNotExists("validation.translationDialog.languageRequired", "validation", "언어 필수 검증",
                "언어를 선택해주세요");
        createTranslationKeyIfNotExists("validation.translationDialog.valueRequired", "validation", "번역값 필수 검증",
                "번역값은 필수입니다");
        createTranslationKeyIfNotExists("validation.password.complexity", "validation", "비밀번호 복잡도 검증",
                "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다");
        createTranslationKeyIfNotExists("validation.confirm.password", "validation", "비밀번호 확인 검증", "비밀번호가 일치하지 않습니다");
        createTranslationKeyIfNotExists("validation.date.invalid", "validation", "날짜 형식 검증", "올바른 날짜 형식이 아닙니다");
        createTranslationKeyIfNotExists("validation.number.invalid", "validation", "숫자 형식 검증", "올바른 숫자 형식이 아닙니다");

        // 알림 키들
        createTranslationKeyIfNotExists("notification.type.info", "notification", "정보 알림", "정보");
        createTranslationKeyIfNotExists("notification.type.success", "notification", "성공 알림", "성공");
        createTranslationKeyIfNotExists("notification.type.warning", "notification", "경고 알림", "경고");
        createTranslationKeyIfNotExists("notification.type.error", "notification", "오류 알림", "오류");
        createTranslationKeyIfNotExists("notification.email.testResult", "notification", "테스트 결과 이메일", "테스트 결과 알림");
        createTranslationKeyIfNotExists("notification.email.projectUpdate", "notification", "프로젝트 업데이트 이메일",
                "프로젝트 업데이트 알림");
        createTranslationKeyIfNotExists("notification.settings.enable", "notification", "알림 활성화", "알림 활성화");
        createTranslationKeyIfNotExists("notification.settings.disable", "notification", "알림 비활성화", "알림 비활성화");
        createTranslationKeyIfNotExists("notification.markAsRead", "notification", "읽음 표시", "읽음으로 표시");
        createTranslationKeyIfNotExists("notification.clearAll", "notification", "모든 알림 지우기", "모든 알림 지우기");
        createTranslationKeyIfNotExists("notification.success.saved", "notification", "저장 성공 알림", "성공적으로 저장되었습니다");
        createTranslationKeyIfNotExists("notification.success.deleted", "notification", "삭제 성공 알림", "성공적으로 삭제되었습니다");
        createTranslationKeyIfNotExists("notification.success.updated", "notification", "수정 성공 알림", "성공적으로 수정되었습니다");
        createTranslationKeyIfNotExists("notification.error.networkError", "notification", "네트워크 오류 알림",
                "네트워크 오류가 발생했습니다");
        createTranslationKeyIfNotExists("notification.error.serverError", "notification", "서버 오류 알림", "서버 오류가 발생했습니다");
        createTranslationKeyIfNotExists("notification.info.processing", "notification", "처리중 정보 알림", "처리 중입니다...");

        // 파일 관리 키들
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

        // 내보내기 키들
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

        // 워크플로우 키들
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
        createTranslationKeyIfNotExists("workflow.step.next", "workflow", "다음 단계", "다음 단계");
        createTranslationKeyIfNotExists("workflow.step.previous", "workflow", "이전 단계", "이전 단계");
        createTranslationKeyIfNotExists("workflow.complete.title", "workflow", "작업 완료", "작업 완료");
        createTranslationKeyIfNotExists("workflow.cancel.title", "workflow", "작업 취소", "작업 취소");

        // 액션 키들
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

        // 캘린더 및 일정 관리 키들
        createTranslationKeyIfNotExists("calendar.event.create", "calendar", "이벤트 생성", "이벤트 생성");
        createTranslationKeyIfNotExists("calendar.event.edit", "calendar", "이벤트 수정", "이벤트 수정");
        createTranslationKeyIfNotExists("calendar.event.delete", "calendar", "이벤트 삭제", "이벤트 삭제");
        createTranslationKeyIfNotExists("schedule.test.execution", "schedule", "테스트 실행 일정", "테스트 실행 일정");
        createTranslationKeyIfNotExists("schedule.maintenance.title", "schedule", "유지보수 일정", "유지보수 일정");
        createTranslationKeyIfNotExists("schedule.release.title", "schedule", "릴리스 일정", "릴리스 일정");
        createTranslationKeyIfNotExists("reminder.notification.title", "reminder", "알림 제목", "알림");
        createTranslationKeyIfNotExists("deadline.approaching.title", "deadline", "마감일 임박", "마감일 임박");
        createTranslationKeyIfNotExists("milestone.achievement.title", "milestone", "마일스톤 달성", "마일스톤 달성");

        // 커뮤니케이션 및 협업 키들
        createTranslationKeyIfNotExists("communication.chat.title", "communication", "채팅", "채팅");
        createTranslationKeyIfNotExists("communication.message.send", "communication", "메시지 보내기", "보내기");
        createTranslationKeyIfNotExists("communication.message.receive", "communication", "메시지 받기", "받기");
        createTranslationKeyIfNotExists("discussion.forum.title", "discussion", "포럼", "포럼");
        createTranslationKeyIfNotExists("discussion.thread.create", "discussion", "스레드 생성", "스레드 생성");
        createTranslationKeyIfNotExists("discussion.reply.add", "discussion", "답글 추가", "답글 추가");

        // 모바일 및 반응형 UI 키들
        createTranslationKeyIfNotExists("mobile.menu.title", "mobile", "모바일 메뉴", "메뉴");
        createTranslationKeyIfNotExists("mobile.navigation.title", "mobile", "모바일 네비게이션", "네비게이션");
        createTranslationKeyIfNotExists("mobile.responsive.title", "mobile", "반응형 화면", "반응형");
        createTranslationKeyIfNotExists("mobile.touch.gesture", "mobile", "터치 제스처", "터치 제스처");
        createTranslationKeyIfNotExists("mobile.offline.mode", "mobile", "오프라인 모드", "오프라인 모드");
        createTranslationKeyIfNotExists("mobile.sync.title", "mobile", "동기화", "동기화");
        createTranslationKeyIfNotExists("responsive.breakpoint.mobile", "responsive", "모바일 화면", "모바일");
        createTranslationKeyIfNotExists("responsive.breakpoint.tablet", "responsive", "태블릿 화면", "태블릿");
        createTranslationKeyIfNotExists("responsive.breakpoint.desktop", "responsive", "데스크탑 화면", "데스크탑");
        createTranslationKeyIfNotExists("responsive.layout.adaptive", "responsive", "적응형 레이아웃", "적응형");
    }

    /**
     * 차트 및 분석 키들 초기화
     */
    private void initializeChartAndAnalyticsKeys() {
        // 차트 키들
        createTranslationKeyIfNotExists("chart.pie.title", "chart", "파이 차트", "파이 차트");
        createTranslationKeyIfNotExists("chart.bar.title", "chart", "막대 차트", "막대 차트");
        createTranslationKeyIfNotExists("chart.line.title", "chart", "선형 차트", "선형 차트");
        createTranslationKeyIfNotExists("chart.area.title", "chart", "영역 차트", "영역 차트");
        createTranslationKeyIfNotExists("chart.scatter.title", "chart", "산점도 차트", "산점도 차트");
        createTranslationKeyIfNotExists("chart.radar.title", "chart", "레이더 차트", "레이더 차트");
        createTranslationKeyIfNotExists("chart.heatmap.title", "chart", "히트맵 차트", "히트맵 차트");
        createTranslationKeyIfNotExists("chart.gauge.title", "chart", "게이지 차트", "게이지 차트");

        // 통계 키들
        createTranslationKeyIfNotExists("statistics.summary.title", "statistics", "통계 요약", "통계 요약");
        createTranslationKeyIfNotExists("statistics.detailed.title", "statistics", "상세 통계", "상세 통계");

        // 분석 키들
        createTranslationKeyIfNotExists("analytics.overview.title", "analytics", "분석 개요", "분석 개요");
        createTranslationKeyIfNotExists("analytics.trend.title", "analytics", "트렌드 분석", "트렌드 분석");
        createTranslationKeyIfNotExists("analytics.performance.title", "analytics", "성능 분석", "성능 분석");
        createTranslationKeyIfNotExists("analytics.quality.metrics", "analytics", "품질 지표", "품질 지표");

        // 보고서 키들
        createTranslationKeyIfNotExists("report.dashboard.title", "report", "보고서 대시보드", "보고서 대시보드");
        createTranslationKeyIfNotExists("report.generate.title", "report", "보고서 생성", "보고서 생성");
        createTranslationKeyIfNotExists("report.template.select", "report", "보고서 템플릿 선택", "보고서 템플릿 선택");
        createTranslationKeyIfNotExists("report.period.select", "report", "보고 기간 선택", "보고 기간 선택");
        createTranslationKeyIfNotExists("report.format.pdf", "report", "PDF 형식", "PDF 형식");
        createTranslationKeyIfNotExists("report.format.excel", "report", "엑셀 형식", "엑셀 형식");
    }

    /**
     * 협업 및 설정 키들 초기화
     */
    private void initializeCollaborationAndSettingsKeys() {
        // 사용자 관리 키들
        createTranslationKeyIfNotExists("user.management.title", "user", "사용자 관리", "사용자 관리");
        createTranslationKeyIfNotExists("user.create.title", "user", "사용자 생성", "새 사용자 생성");
        createTranslationKeyIfNotExists("user.edit.title", "user", "사용자 편집", "사용자 편집");
        createTranslationKeyIfNotExists("user.deactivate.title", "user", "사용자 비활성화", "사용자 비활성화");
        createTranslationKeyIfNotExists("user.password.reset", "user", "비밀번호 재설정", "비밀번호 재설정");

        // 팀 관리 키들
        createTranslationKeyIfNotExists("team.management.title", "team", "팀 관리", "팀 관리");
        createTranslationKeyIfNotExists("team.create.title", "team", "팀 생성", "새 팀 생성");
        createTranslationKeyIfNotExists("team.member.add", "team", "팀원 추가", "팀원 추가");
        createTranslationKeyIfNotExists("team.member.remove", "team", "팀원 제거", "팀원 제거");
        createTranslationKeyIfNotExists("team.leader.assign", "team", "팀장 지정", "팀장 지정");

        // 협업 키들
        createTranslationKeyIfNotExists("collaboration.share.title", "collaboration", "공유", "공유");
        createTranslationKeyIfNotExists("collaboration.comment.add", "collaboration", "댓글 추가", "댓글 추가");
        createTranslationKeyIfNotExists("collaboration.review.request", "collaboration", "검토 요청", "검토 요청");
        createTranslationKeyIfNotExists("collaboration.feedback.title", "collaboration", "피드백", "피드백");

        // 설정 키들
        createTranslationKeyIfNotExists("settings.general.title", "settings", "일반 설정", "일반 설정");
        createTranslationKeyIfNotExists("settings.system.title", "settings", "시스템 설정", "시스템 설정");
        createTranslationKeyIfNotExists("settings.security.title", "settings", "보안 설정", "보안 설정");
        createTranslationKeyIfNotExists("settings.notification.title", "settings", "알림 설정", "알림 설정");
        createTranslationKeyIfNotExists("settings.appearance.title", "settings", "화면 설정", "화면 설정");
        createTranslationKeyIfNotExists("settings.language.title", "settings", "언어 설정", "언어 설정");
        createTranslationKeyIfNotExists("settings.backup.title", "settings", "백업 설정", "백업 설정");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description,
            String defaultValue) {
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
