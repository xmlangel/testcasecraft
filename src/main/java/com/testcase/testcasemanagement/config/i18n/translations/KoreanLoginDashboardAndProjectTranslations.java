// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanCommonAndExtendedUITranslationsPart1.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 한국어 번역 - 로그인, 대시보드, 프로젝트 기본 기능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanLoginDashboardAndProjectTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                createTranslationIfNotExists("login.title", languageCode, "로그인", createdBy);
                createTranslationIfNotExists("login.username", languageCode, "아이디", createdBy);
                createTranslationIfNotExists("login.password", languageCode, "비밀번호", createdBy);
                createTranslationIfNotExists("login.button", languageCode, "로그인", createdBy);
                createTranslationIfNotExists("login.back", languageCode, "로그인으로 돌아가기", createdBy);

                // 회원가입
                createTranslationIfNotExists("register.title", languageCode, "회원가입", createdBy);
                createTranslationIfNotExists("register.confirm_password", languageCode, "비밀번호 확인", createdBy);
                createTranslationIfNotExists("register.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("register.email", languageCode, "이메일", createdBy);
                createTranslationIfNotExists("register.button", languageCode, "회원가입", createdBy);
                createTranslationIfNotExists("register.switch", languageCode, "회원가입", createdBy);
                createTranslationIfNotExists("register.success", languageCode, "회원가입이 완료되었습니다. 로그인 해주세요.", createdBy);
                createTranslationIfNotExists("register.error.general", languageCode, "회원가입 중 오류가 발생했습니다.", createdBy);

                // 세션 만료
                createTranslationIfNotExists("auth.session.expired.title", languageCode, "연결 및 세션 확인", createdBy);
                createTranslationIfNotExists("auth.session.expired.message", languageCode,
                                "세션이 만료되었거나 일시적인 오류일 수 있습니다.", createdBy);
                createTranslationIfNotExists("auth.session.expired.cause", languageCode,
                                "새로고침으로 해결될 수 있습니다. 문제가 지속되면 다시 로그인해주세요.", createdBy);
                createTranslationIfNotExists("auth.session.button.refresh", languageCode, "페이지 새로고침", createdBy);
                createTranslationIfNotExists("auth.session.button.login", languageCode, "로그인 페이지로 이동", createdBy);

                createTranslationIfNotExists("dashboard.title", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("project.dialog.createTitle", languageCode, "새 프로젝트 생성", createdBy);
                createTranslationIfNotExists("project.dialog.editTitle", languageCode, "프로젝트 수정", createdBy);
                createTranslationIfNotExists("project.form.name", languageCode, "프로젝트 이름", createdBy);
                createTranslationIfNotExists("project.form.code", languageCode, "프로젝트 코드", createdBy);
                createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "예: PROJ001", createdBy);
                createTranslationIfNotExists("project.form.organization", languageCode, "소속 조직", createdBy);
                createTranslationIfNotExists("project.form.noOrganization", languageCode, "독립 프로젝트 (조직 없음)", createdBy);
                createTranslationIfNotExists("project.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode,
                                "프로젝트에 대한 설명을 입력하세요...",
                                createdBy);
                createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
                createTranslationIfNotExists("common.buttons.update", languageCode, "수정", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("dashboard.lastUpdated", languageCode, "최종 업데이트: {date}", createdBy);
                createTranslationIfNotExists("dashboard.refresh.tooltip", languageCode, "대시보드 데이터 새로고침", createdBy);
                createTranslationIfNotExists("dashboard.refresh.button", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("dashboard.loading.data", languageCode, "대시보드 데이터를 불러오는 중...", createdBy);
                createTranslationIfNotExists("dashboard.loading.chart", languageCode, "차트 데이터를 불러오는 중...", createdBy);
                createTranslationIfNotExists("dashboard.error.solution", languageCode, "해결책: {action}", createdBy);
                createTranslationIfNotExists("dashboard.error.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "로그인으로 이동", createdBy);
                createTranslationIfNotExists("dashboard.error.details", languageCode, "상세 정보", createdBy);
                createTranslationIfNotExists("dashboard.noData.message", languageCode, "표시할 대시보드 데이터가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("dashboard.noData.chart", languageCode, "차트 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("dashboard.noData.noActiveTestRuns", languageCode, "진행 중인 테스트 실행이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode, "총 {count}개 테스트케이스",
                                createdBy);
                createTranslationIfNotExists("dashboard.project.members", languageCode, "{count}명 참여", createdBy);
                createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "최근 테스트 결과",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "테스트 결과 추이", createdBy);
                createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "최근 15일", createdBy);
                createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "진행 중인 테스트 결과",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "담당자별 결과", createdBy);
                createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "테스트 플랜별 결과", createdBy);
                createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "미실행 테스트 추이", createdBy);
                createTranslationIfNotExists("dashboard.status.pass", languageCode, "성공", createdBy);
                createTranslationIfNotExists("dashboard.status.fail", languageCode, "실패", createdBy);
                createTranslationIfNotExists("dashboard.status.blocked", languageCode, "차단됨", createdBy);
                createTranslationIfNotExists("dashboard.status.notrun", languageCode, "미실행", createdBy);
                createTranslationIfNotExists("dashboard.status.skipped", languageCode, "건너뜀", createdBy);
                createTranslationIfNotExists("dashboard.status.complete", languageCode, "완료", createdBy);
                createTranslationIfNotExists("dashboard.status.failureRate", languageCode, "실패율 {rate}%", createdBy);
                createTranslationIfNotExists("dashboard.status.completedCount", languageCode, "{completed}/{total} 완료",
                                createdBy);
                createTranslationIfNotExists("dashboard.messages.selectProject", languageCode,
                                "테스트 플랜별 결과를 보려면 프로젝트를 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("project.title", languageCode, "프로젝트 관리", createdBy);
                createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "조직별 프로젝트", createdBy);
                createTranslationIfNotExists("project.tabs.independent", languageCode, "독립 프로젝트", createdBy);
                createTranslationIfNotExists("project.tabs.all", languageCode, "전체 프로젝트", createdBy);
                createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count}개 프로젝트", createdBy);
                createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "총 {count}개 프로젝트",
                                createdBy);
                createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "독립 프로젝트가 없습니다",
                                createdBy);
                createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode,
                                "조직에 속하지 않는 개인 프로젝트를 생성해보세요.", createdBy);
                createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
                createTranslationIfNotExists("userList.title", languageCode, "사용자 관리", createdBy);
                createTranslationIfNotExists("testcase.form.title.create", languageCode, "테스트케이스 생성", createdBy);
                createTranslationIfNotExists("testPlan.form.title.create", languageCode, "새 테스트 플랜 생성", createdBy);
                createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "테스트 플랜 수정", createdBy);
                createTranslationIfNotExists("testPlan.form.planName", languageCode, "플랜 이름", createdBy);
                createTranslationIfNotExists("testPlan.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "테스트케이스 선택", createdBy);
                createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count}개 선택됨", createdBy);
                createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode, "프로젝트를 먼저 선택해주세요",
                                createdBy);
                createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testPlan.form.button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "처리 중...", createdBy);
                createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode, "테스트 플랜 이름은 필수 입력 항목입니다",
                                createdBy);
                createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode,
                                "최소 한 개 이상의 테스트케이스를 선택해야 합니다", createdBy);
                createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "저장 처리 중 오류가 발생했습니다: ",
                                createdBy);
                createTranslationIfNotExists("testPlan.list.add", languageCode, "테스트 플랜 추가", createdBy);
                createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
                createTranslationIfNotExists("testPlan.list.table.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("testPlan.list.table.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "테스트케이스 수", createdBy);
                createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "생성일", createdBy);
                createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "실행", createdBy);
                createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "수정", createdBy);
                createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "등록된 테스트 플랜이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode, "테스트 실행 - {planName}",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode, "새 실행 생성",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.empty.message", languageCode, "이 테스트 플랜의 실행 이력이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.progress", languageCode, "진행률:", createdBy);
                createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "편집", createdBy);
                createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "전체화면 보기", createdBy);
                createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "테스트 플랜 삭제", createdBy);
                createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode,
                                "정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.", createdBy);
                createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testPlan.selector.label", languageCode, "테스트 플랜 선택", createdBy);
                createTranslationIfNotExists("testPlan.selector.all", languageCode, "전체", createdBy);
                createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count}개 케이스", createdBy);
                createTranslationIfNotExists("testPlan.selector.selected", languageCode, "선택된 플랜: {planName}",
                                createdBy);
                createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count}개 테스트케이스)",
                                createdBy);
                createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "시작 안됨", createdBy);
                createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "진행 중", createdBy);
                createTranslationIfNotExists("testPlan.status.completed", languageCode, "완료됨", createdBy);
                createTranslationIfNotExists("testPlan.tab.label", languageCode, "테스트플랜", createdBy);
                createTranslationIfNotExists("common.list", languageCode, "목록", createdBy);
                createTranslationIfNotExists("common.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("testCaseResult.page.title", languageCode, "테스트 결과 입력", createdBy);
                createTranslationIfNotExists("common.button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.button.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("common.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("common.empty", languageCode, "-", createdBy);
                createTranslationIfNotExists("common.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("common.select", languageCode, "선택", createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("common.loading", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("projectHeader.breadcrumb.projects", languageCode, "프로젝트", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.dashboard", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testCases", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testExecution", languageCode, "테스트실행", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testResults", languageCode, "테스트결과", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.automation", languageCode, "자동화 테스트", createdBy);
                createTranslationIfNotExists("testResultDashboard.chart.planComparison", languageCode, "테스트 플랜별 결과 비교",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.chart.executorComparison", languageCode, "실행자별 결과 비교",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.title", languageCode, "통계 요약", createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.executionRate", languageCode, "실행률",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.jiraLinkRate", languageCode, "JIRA 연동률",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.lastUpdated", languageCode, "최종 업데이트",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.unknown", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.error.comparisonLoadFailed", languageCode,
                                "비교 데이터를 불러오는데 실패했습니다.", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.error.trendLoadFailed", languageCode,
                                "추이 데이터를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.loading.trendData", languageCode, "추이 데이터를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.noData.title", languageCode, "추이 데이터가 없습니다", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.noData.description", languageCode,
                                "선택한 기간 동안의 테스트 실행 기록이 없습니다.", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.label", languageCode, "기간", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last7days", languageCode, "최근 7일", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last15days", languageCode, "최근 15일", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last30days", languageCode, "최근 30일", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last60days", languageCode, "최근 60일", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last90days", languageCode, "최근 90일", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chartType.line", languageCode, "라인", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chartType.area", languageCode, "영역", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.avgSuccessRate", languageCode, "평균 성공률",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.avgCompletionRate", languageCode, "평균 완료율",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.dataPoints", languageCode, "데이터 포인트",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.successRateChange", languageCode, "성공률 변화",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.overallTrend", languageCode, "테스트 결과 변화 추이",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.testPlanComparison", languageCode,
                                "테스트 플랜별 결과 비교",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.assigneeComparison", languageCode, "실행자별 결과 비교",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.successAndCompletionRate", languageCode,
                                "성공률 및 완료율 추이",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.completionRate", languageCode, "완료율", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.overallSuccessRate", languageCode, "전체 성공률",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.plan", languageCode, "Plan", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.unit", languageCode, "건", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.overallSuccessRate", languageCode, "전체 성공률",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.plan", languageCode, "Plan", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.prompt.selectTestPlan", languageCode,
                                "비교할 테스트 플랜을 선택해주세요",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.prompt.selectAssignee", languageCode, "비교할 실행자를 선택해주세요",
                                createdBy);
                createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
                createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);
                createTranslationIfNotExists("header.nav.mailSettings", languageCode, "메일 설정", createdBy);
                createTranslationIfNotExists("header.nav.translationManagement", languageCode, "번역 관리", createdBy);
                createTranslationIfNotExists("header.nav.managementMenu", languageCode, "관리 메뉴", createdBy);
                createTranslationIfNotExists("common.buttons.import", languageCode, "가져오기", createdBy);
                createTranslationIfNotExists("common.buttons.add", languageCode, "추가", createdBy);
                createTranslationIfNotExists("common.buttons.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("common.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("common.default", languageCode, "기본", createdBy);
                createTranslationIfNotExists("common.active", languageCode, "활성", createdBy);
                createTranslationIfNotExists("common.inactive", languageCode, "비활성", createdBy);
                createTranslationIfNotExists("common.buttons.edit", languageCode, "편집", createdBy);
                createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("common.search.keyword", languageCode, "키워드 검색", createdBy);
                createTranslationIfNotExists("header.nav.projectSelection", languageCode, "프로젝트 선택", createdBy);
                createTranslationIfNotExists("header.userMenu.profile", languageCode, "프로필", createdBy);
                createTranslationIfNotExists("header.userMenu.logout", languageCode, "로그아웃", createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode,
                                "총 조직 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode,
                                "활성 조직", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode, "총 프로젝트 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode,
                                "전체 프로젝트",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode, "총 테스트케이스",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode,
                                "작성된 테스트케이스", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "총 사용자 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode,
                                "등록된 사용자",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode, "총 프로젝트 참여",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode,
                                "프로젝트 멤버십 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode, "조직 현황",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode, "테스트 통계",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode,
                                "조직별 프로젝트 분포",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode,
                                "프로젝트 수", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode,
                                "멤버 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "조직 목록",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode,
                                "테스트 결과 분포",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode,
                                "테스트 결과 상세",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode, "프로젝트: {count}개",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode, "멤버: {count}명",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "성공",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "실패",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "차단됨",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "미실행",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "전체 선택", createdBy);
                createTranslationIfNotExists("testcase.tree.root", languageCode, "루트", createdBy);
                createTranslationIfNotExists("testcase.tree.title.select", languageCode, "테스트케이스 선택", createdBy);
                createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode, "프로젝트를 선택하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "테스트케이스가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode, "이름을 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "이름 변경에 실패했습니다: ",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode, "삭제 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.ragVectorized", languageCode, "RAG 벡터화됨", createdBy);
                createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "선택 삭제", createdBy);
                createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "리프레시", createdBy);
                createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "순서 저장", createdBy);
                createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "순서 편집", createdBy);
                createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testcase.tree.button.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "폴더 추가", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "테스트케이스 추가", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "하위 폴더 추가", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "하위 테스트케이스 추가",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "이름 변경", createdBy);
                createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "버전 히스토리", createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "선택 삭제",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode,
                                "{count}개 항목(하위 포함)을 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "삭제 확인",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode,
                                "정말로 삭제하시겠습니까? (하위 항목 포함)", createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "오류", createdBy);
                createTranslationIfNotExists("testcase.tree.tooltip.open", languageCode, "테스트케이스 트리 열기", createdBy);
                createTranslationIfNotExists("testcase.tree.tooltip.close", languageCode, "테스트케이스 트리 닫기", createdBy);
                createTranslationIfNotExists("testcase.tree.count.testcases", languageCode, "테스트케이스: {count}개",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.count.folders", languageCode, "폴더: {count}개", createdBy);
                createTranslationIfNotExists("testcase.tree.count.total", languageCode, "전체: {count}개", createdBy);
                createTranslationIfNotExists("testcase.form.title.edit", languageCode, "테스트케이스 수정", createdBy);
                createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
                createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "순서", createdBy);
                createTranslationIfNotExists("testcase.form.createdBy", languageCode, "작성자", createdBy);
                createTranslationIfNotExists("testcase.form.updatedBy", languageCode, "수정자", createdBy);
                createTranslationIfNotExists("testcase.form.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("testcase.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testcase.form.preCondition", languageCode, "사전 조건", createdBy);
                createTranslationIfNotExists("testcase.form.testSteps", languageCode, "테스트 스텝", createdBy);
                createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
                createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
                createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
                createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "Expected Results",
                                createdBy);
                createTranslationIfNotExists("testcase.form.postCondition", languageCode, "사후 조건", createdBy);
                createTranslationIfNotExists("testcase.form.isAutomated", languageCode, "자동화 여부", createdBy);
                createTranslationIfNotExists("testcase.form.executionType", languageCode, "Manual/Automation",
                                createdBy);
                createTranslationIfNotExists("testcase.form.testTechnique", languageCode, "테스트 기법", createdBy);
                createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "사전 조건", createdBy);
                createTranslationIfNotExists("testcase.form.postConditionPlaceholder", languageCode, "사후 조건",
                                createdBy);
                createTranslationIfNotExists("testcase.form.testTechniquePlaceholder", languageCode,
                                "예: 경계값 분석, 의사결정 테이블",
                                createdBy);
                createTranslationIfNotExists("testcase.executionType.manual", languageCode, "수동", createdBy);
                createTranslationIfNotExists("testcase.executionType.automation", languageCode, "자동화", createdBy);
                createTranslationIfNotExists("testcase.executionType.hybrid", languageCode, "하이브리드", createdBy);
                createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step 설명", createdBy);
                createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "예상 결과", createdBy);
                createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode, "전체 예상 결과",
                                createdBy);
                createTranslationIfNotExists("testcase.form.folderName", languageCode, "폴더 이름", createdBy);
                createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "폴더 설명", createdBy);
                createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "테스트케이스 이름", createdBy);
                createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "테스트케이스 설명", createdBy);
                createTranslationIfNotExists("testcase.helper.description", languageCode, "설명을 입력하세요.", createdBy);
                createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "사전 조건을 입력하세요.", createdBy);
                createTranslationIfNotExists("testcase.button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("testcase.button.saving", languageCode, "저장 중...", createdBy);
                createTranslationIfNotExists("testcase.button.addStep", languageCode, "스텝 추가", createdBy);
                createTranslationIfNotExists("testcase.message.selectProject", languageCode, "프로젝트를 먼저 선택하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.selectOrCreate", languageCode, "테스트케이스를 선택하거나 새로 만드세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.addSteps", languageCode, "스텝을 추가하세요.", createdBy);
                createTranslationIfNotExists("testcase.message.saved", languageCode, "저장되었습니다.", createdBy);
                createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "이름을 입력하세요.", createdBy);
                createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Step을 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode,
                                "전체 예상 결과를 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.error.saveError", languageCode, "저장 중 오류가 발생했습니다.", createdBy);
                createTranslationIfNotExists("testcase.folder.info.title", languageCode, "폴더 정보", createdBy);
                createTranslationIfNotExists("testcase.info.title", languageCode, "테스트케이스 정보", createdBy);
                createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "테스트 폴더 수정", createdBy);
                createTranslationIfNotExists("testcase.form.folder.create", languageCode, "테스트 폴더 생성", createdBy);
                createTranslationIfNotExists("testcase.version.button.create", languageCode, "버전 생성", createdBy);
                createTranslationIfNotExists("testcase.version.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testcase.version.button.creating", languageCode, "생성 중...", createdBy);
                createTranslationIfNotExists("testcase.version.current.fetchError", languageCode, "현재 버전 조회 실패:",
                                createdBy);
                createTranslationIfNotExists("testcase.version.error.notSaved", languageCode,
                                "저장된 테스트케이스에만 버전을 생성할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.version.error.folderNotAllowed", languageCode,
                                "폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.", createdBy);
                createTranslationIfNotExists("testcase.version.error.createFailed", languageCode, "버전 생성에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.version.error.createError", languageCode, "버전 생성 실패:",
                                createdBy);
                createTranslationIfNotExists("testcase.version.validation.labelRequired", languageCode, "버전 라벨을 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.version.defaultDescription", languageCode, "수동 버전 생성",
                                createdBy);
                createTranslationIfNotExists("testcase.version.dialog.title", languageCode, "수동 버전 생성", createdBy);
                createTranslationIfNotExists("testcase.version.form.label", languageCode, "버전 라벨", createdBy);
                createTranslationIfNotExists("testcase.version.form.labelPlaceholder", languageCode, "예: v2.1 수정사항 반영",
                                createdBy);
                createTranslationIfNotExists("testcase.version.form.labelHelperText", languageCode,
                                "버전을 식별할 수 있는 라벨을 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.version.form.description", languageCode, "버전 설명", createdBy);
                createTranslationIfNotExists("testcase.version.form.descriptionPlaceholder", languageCode,
                                "이 버전에서 변경된 내용을 상세히 설명하세요.", createdBy);
                createTranslationIfNotExists("testcase.version.form.descriptionHelperText", languageCode,
                                "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.header.title", languageCode, "테스트케이스 스프레드시트",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.rows", languageCode, "{count}개 행", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.steps", languageCode, "{count}개 스텝",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.changed", languageCode, "변경됨", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.addRows", languageCode, "행 추가", createdBy);

                // 사용량 요약 (Usage Summary)
                createTranslationIfNotExists("dashboard.usage.title", languageCode, "사용량 요약", createdBy);
                createTranslationIfNotExists("dashboard.usage.lastUpdated", languageCode, "최근 업데이트 {time}", createdBy);
                createTranslationIfNotExists("dashboard.usage.loading", languageCode, "사용량 데이터를 불러오는 중입니다...",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.error", languageCode, "사용량 데이터를 불러오지 못했습니다.", createdBy);
                createTranslationIfNotExists("dashboard.usage.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("dashboard.usage.totalVisits", languageCode, "오늘 방문", createdBy);
                createTranslationIfNotExists("dashboard.usage.uniqueVisitors", languageCode, "오늘 고유 방문자", createdBy);
                createTranslationIfNotExists("dashboard.usage.activeVisitors", languageCode, "활성 세션", createdBy);
                createTranslationIfNotExists("dashboard.usage.activeWindow", languageCode, "최근 {minutes}분 기준",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.topPages", languageCode, "상위 페이지", createdBy);
                createTranslationIfNotExists("dashboard.usage.totalLabel", languageCode, "누적 {total}", createdBy);
                createTranslationIfNotExists("dashboard.usage.noData", languageCode, "집계된 방문 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("dashboard.usage.dailySummary", languageCode, "일별 방문 요약", createdBy);
                createTranslationIfNotExists("dashboard.usage.uniqueLabel", languageCode, "고유 {count}", createdBy);

                // 통계 소스 타입 선택 (수동 테스트 / 자동화 테스트 / 전체 합계)
                createTranslationIfNotExists("dashboard.source.manual", languageCode, "수동 테스트", createdBy);
                createTranslationIfNotExists("dashboard.source.automated", languageCode, "자동화 테스트", createdBy);
                createTranslationIfNotExists("dashboard.source.total", languageCode, "전체 합계", createdBy);

                // 테스트 플랜 자동화 테스트 연동
                createTranslationIfNotExists("testPlan.list.table.automationCount", languageCode, "자동화 테스트", createdBy);
                createTranslationIfNotExists("testPlan.list.table.linkAutomated", languageCode, "자동화 테스트 연결",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.automated.title", languageCode, "연결된 자동화 테스트",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.automated.empty", languageCode, "연결된 자동화 테스트가 없습니다.",
                                createdBy);
        }

        private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
                Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
                if (translationKeyOpt.isPresent()) {
                        TranslationKey translationKey = translationKeyOpt.get();
                        Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
                        if (languageOpt.isPresent()) {
                                Language language = languageOpt.get();
                                Optional<Translation> existingTranslationOpt = translationRepository
                                                .findByTranslationKeyAndLanguage(translationKey, language);
                                if (existingTranslationOpt.isEmpty()) {
                                        Translation translation = new Translation();
                                        translation.setTranslationKey(translationKey);
                                        translation.setLanguage(language);
                                        translation.setValue(value);
                                        translation.setCreatedBy(createdBy);
                                        translation.setUpdatedBy(createdBy);
                                        translation.setIsActive(true);
                                        translationRepository.save(translation);
                                        log.debug("번역 생성: {} - {}", keyName, languageCode);
                                } else {
                                        Translation existingTranslation = existingTranslationOpt.get();
                                        if (!existingTranslation.getValue().equals(value)) {
                                                existingTranslation.setValue(value);
                                                existingTranslation.setUpdatedBy(createdBy);
                                                translationRepository.save(existingTranslation);
                                                log.debug("번역 업데이트: {} - {}", keyName, languageCode);
                                        } else {
                                                log.debug("번역 이미 존재하며 동일함: {} - {}", keyName, languageCode);
                                        }
                                }
                        }
                } else {
                        log.warn("번역 키를 찾을 수 없음: {}", keyName);
                }
        }
}
