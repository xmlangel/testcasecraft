// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanCommonAndExtendedUITranslationsPart4.java
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
 * 한국어 번역 - RAG, 고급 기능, 차트, 네비게이션, 공통 UI
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanAdvancedFeaturesAndCommonUITranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "성공",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode,
                                "프로젝트 분포",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode,
                                "프로젝트",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode,
                                "멤버",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "조직 목록",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode,
                                "테스트 결과 분포",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode,
                                "테스트 결과 상세",
                                createdBy);
                createTranslationIfNotExists("organization.table.user", languageCode, "사용자", createdBy);
                createTranslationIfNotExists("organization.table.role", languageCode, "역할", createdBy);
                createTranslationIfNotExists("organization.table.joinDate", languageCode, "가입일", createdBy);
                createTranslationIfNotExists("organization.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("common.search.keyword", languageCode, "키워드 검색", createdBy);
                createTranslationIfNotExists("common.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("common.expand", languageCode, "펼치기", createdBy);
                createTranslationIfNotExists("common.collapse", languageCode, "접기", createdBy);
                createTranslationIfNotExists("junit.confirm.deleteResult", languageCode, "이 결과를 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode, "테스트 상태 분포",
                                createdBy);
                createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode, "최근 실행 결과", createdBy);
                createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode, "최근 테스트 실행 결과",
                                createdBy);
                createTranslationIfNotExists("junit.table.executionName", languageCode, "실행명", createdBy);
                createTranslationIfNotExists("junit.table.fileName", languageCode, "파일명", createdBy);
                createTranslationIfNotExists("junit.table.totalTests", languageCode, "총 테스트", createdBy);
                createTranslationIfNotExists("junit.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "최근 테스트 결과",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "테스트 결과 추이", createdBy);
                createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "최근 15일", createdBy);
                createTranslationIfNotExists("dashboard.loading.chart", languageCode, "차트 로딩 중...", createdBy);
                createTranslationIfNotExists("dashboard.noData.chart", languageCode, "차트 데이터 없음", createdBy);
                createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "열린 테스트 실행 결과",
                                createdBy);
                createTranslationIfNotExists("dashboard.noData.noResults", languageCode, "결과가 없습니다", createdBy);
                createTranslationIfNotExists("dashboard.summary.totalProjects", languageCode, "총 프로젝트", createdBy);
                createTranslationIfNotExists("dashboard.summary.activeProjects", languageCode, "활성 프로젝트", createdBy);
                createTranslationIfNotExists("dashboard.summary.totalTestCases", languageCode, "총 테스트 케이스", createdBy);
                createTranslationIfNotExists("dashboard.summary.passedTests", languageCode, "통과된 테스트", createdBy);
                createTranslationIfNotExists("dashboard.summary.failedTests", languageCode, "실패한 테스트", createdBy);
                createTranslationIfNotExists("dashboard.summary.testCoverage", languageCode, "테스트 커버리지", createdBy);
                createTranslationIfNotExists("dashboard.activity.recentActivities", languageCode, "최근 활동", createdBy);
                createTranslationIfNotExists("dashboard.activity.testExecutions", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("dashboard.activity.newTestCases", languageCode, "새 테스트 케이스", createdBy);
                createTranslationIfNotExists("dashboard.activity.completedPlans", languageCode, "완료된 계획", createdBy);
                createTranslationIfNotExists("dashboard.quickActions.title", languageCode, "빠른 작업", createdBy);
                createTranslationIfNotExists("dashboard.quickActions.createTestCase", languageCode, "테스트 케이스 생성",
                                createdBy);
                createTranslationIfNotExists("dashboard.quickActions.runTests", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("dashboard.quickActions.viewReports", languageCode, "리포트 보기", createdBy);
                createTranslationIfNotExists("dashboard.quickActions.manageProjects", languageCode, "프로젝트 관리",
                                createdBy);
                createTranslationIfNotExists("navigation.menu.dashboard", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("navigation.menu.projects", languageCode, "프로젝트", createdBy);
                createTranslationIfNotExists("navigation.menu.testCases", languageCode, "테스트 케이스", createdBy);
                createTranslationIfNotExists("navigation.menu.testPlans", languageCode, "테스트 플랜", createdBy);
                createTranslationIfNotExists("navigation.menu.testExecutions", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("navigation.menu.reports", languageCode, "리포트", createdBy);
                createTranslationIfNotExists("navigation.menu.settings", languageCode, "설정", createdBy);
                createTranslationIfNotExists("navigation.menu.help", languageCode, "도움말", createdBy);
                createTranslationIfNotExists("navigation.user.profile", languageCode, "프로필", createdBy);
                createTranslationIfNotExists("navigation.user.preferences", languageCode, "환경설정", createdBy);
                createTranslationIfNotExists("navigation.user.logout", languageCode, "로그아웃", createdBy);
                createTranslationIfNotExists("navigation.breadcrumb.home", languageCode, "홈", createdBy);
                createTranslationIfNotExists("navigation.breadcrumb.back", languageCode, "뒤로", createdBy);
                createTranslationIfNotExists("validation.required", languageCode, "필수 입력 항목입니다", createdBy);
                createTranslationIfNotExists("validation.email.invalid", languageCode, "올바른 이메일 형식이 아닙니다", createdBy);
                createTranslationIfNotExists("validation.password.minLength", languageCode, "비밀번호는 최소 8자 이상이어야 합니다",
                                createdBy);
                createTranslationIfNotExists("validation.password.complexity", languageCode,
                                "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
                                createdBy);
                createTranslationIfNotExists("validation.confirm.password", languageCode, "비밀번호가 일치하지 않습니다", createdBy);
                createTranslationIfNotExists("validation.date.invalid", languageCode, "올바른 날짜 형식이 아닙니다", createdBy);
                createTranslationIfNotExists("validation.number.invalid", languageCode, "올바른 숫자 형식이 아닙니다", createdBy);
                createTranslationIfNotExists("notification.success.saved", languageCode, "성공적으로 저장되었습니다", createdBy);
                createTranslationIfNotExists("notification.success.deleted", languageCode, "성공적으로 삭제되었습니다", createdBy);
                createTranslationIfNotExists("notification.success.updated", languageCode, "성공적으로 수정되었습니다", createdBy);
                createTranslationIfNotExists("notification.error.networkError", languageCode, "네트워크 오류가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("notification.error.serverError", languageCode, "서버 오류가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("notification.info.processing", languageCode, "처리 중입니다...", createdBy);
                createTranslationIfNotExists("file.upload.title", languageCode, "파일 업로드", createdBy);
                createTranslationIfNotExists("file.upload.description", languageCode, "파일을 끌어다 놓거나 클릭하여 업로드하세요",
                                createdBy);
                createTranslationIfNotExists("file.upload.progress", languageCode, "업로드 진행 중...", createdBy);
                createTranslationIfNotExists("file.upload.success", languageCode, "파일이 성공적으로 업로드되었습니다", createdBy);
                createTranslationIfNotExists("file.upload.error", languageCode, "파일 업로드에 실패했습니다", createdBy);
                createTranslationIfNotExists("file.size.limit", languageCode, "파일 크기는 최대 {size}MB입니다", createdBy);
                createTranslationIfNotExists("file.type.invalid", languageCode, "지원하지 않는 파일 형식입니다", createdBy);
                createTranslationIfNotExists("file.download.preparing", languageCode, "다운로드 준비 중...", createdBy);
                createTranslationIfNotExists("file.download.error", languageCode, "파일 다운로드에 실패했습니다", createdBy);
                createTranslationIfNotExists("file.management.title", languageCode, "파일 관리", createdBy);
                createTranslationIfNotExists("team.management.title", languageCode, "팀 관리", createdBy);
                createTranslationIfNotExists("team.create.title", languageCode, "새 팀 생성", createdBy);
                createTranslationIfNotExists("team.member.add", languageCode, "팀원 추가", createdBy);
                createTranslationIfNotExists("team.member.remove", languageCode, "팀원 제거", createdBy);
                createTranslationIfNotExists("team.leader.assign", languageCode, "팀장 지정", createdBy);
                createTranslationIfNotExists("user.management.title", languageCode, "사용자 관리", createdBy);
                createTranslationIfNotExists("user.create.title", languageCode, "새 사용자 생성", createdBy);
                createTranslationIfNotExists("user.edit.title", languageCode, "사용자 편집", createdBy);
                createTranslationIfNotExists("user.deactivate.title", languageCode, "사용자 비활성화", createdBy);
                createTranslationIfNotExists("user.password.reset", languageCode, "비밀번호 재설정", createdBy);
                createTranslationIfNotExists("report.dashboard.title", languageCode, "보고서 대시보드", createdBy);
                createTranslationIfNotExists("report.generate.title", languageCode, "보고서 생성", createdBy);
                createTranslationIfNotExists("report.template.select", languageCode, "보고서 템플릿 선택", createdBy);
                createTranslationIfNotExists("report.period.select", languageCode, "보고 기간 선택", createdBy);
                createTranslationIfNotExists("report.format.pdf", languageCode, "PDF 형식", createdBy);
                createTranslationIfNotExists("report.format.excel", languageCode, "엑셀 형식", createdBy);
                createTranslationIfNotExists("analytics.overview.title", languageCode, "분석 개요", createdBy);
                createTranslationIfNotExists("analytics.trend.title", languageCode, "트렌드 분석", createdBy);
                createTranslationIfNotExists("analytics.performance.title", languageCode, "성능 분석", createdBy);
                createTranslationIfNotExists("analytics.quality.metrics", languageCode, "품질 지표", createdBy);
                createTranslationIfNotExists("settings.general.title", languageCode, "일반 설정", createdBy);
                createTranslationIfNotExists("settings.system.title", languageCode, "시스템 설정", createdBy);
                createTranslationIfNotExists("settings.security.title", languageCode, "보안 설정", createdBy);
                createTranslationIfNotExists("settings.notification.title", languageCode, "알림 설정", createdBy);
                createTranslationIfNotExists("settings.appearance.title", languageCode, "화면 설정", createdBy);
                createTranslationIfNotExists("settings.language.title", languageCode, "언어 설정", createdBy);
                createTranslationIfNotExists("settings.backup.title", languageCode, "백업 설정", createdBy);
                createTranslationIfNotExists("config.database.title", languageCode, "데이터베이스 구성", createdBy);
                createTranslationIfNotExists("config.api.title", languageCode, "API 구성", createdBy);
                createTranslationIfNotExists("config.integration.title", languageCode, "통합 구성", createdBy);
                createTranslationIfNotExists("approval.request.title", languageCode, "승인 요청", createdBy);
                createTranslationIfNotExists("approval.pending.list", languageCode, "대기 중인 승인", createdBy);
                createTranslationIfNotExists("approval.approved.list", languageCode, "승인된 항목", createdBy);
                createTranslationIfNotExists("approval.rejected.list", languageCode, "거부된 항목", createdBy);
                createTranslationIfNotExists("workflow.step.next", languageCode, "다음 단계", createdBy);
                createTranslationIfNotExists("workflow.step.previous", languageCode, "이전 단계", createdBy);
                createTranslationIfNotExists("workflow.complete.title", languageCode, "작업 완료", createdBy);
                createTranslationIfNotExists("workflow.cancel.title", languageCode, "작업 취소", createdBy);
                createTranslationIfNotExists("task.assignment.title", languageCode, "작업 할당", createdBy);
                createTranslationIfNotExists("task.deadline.title", languageCode, "작업 마감일", createdBy);
                createTranslationIfNotExists("audit.log.title", languageCode, "감사 로그", createdBy);
                createTranslationIfNotExists("audit.trail.title", languageCode, "감사 추적", createdBy);
                createTranslationIfNotExists("log.system.title", languageCode, "시스템 로그", createdBy);
                createTranslationIfNotExists("log.user.activity", languageCode, "사용자 활동 로그", createdBy);
                createTranslationIfNotExists("log.error.title", languageCode, "오류 로그", createdBy);
                createTranslationIfNotExists("log.access.title", languageCode, "접근 로그", createdBy);
                createTranslationIfNotExists("history.change.title", languageCode, "변경 이력", createdBy);
                createTranslationIfNotExists("history.version.title", languageCode, "버전 이력", createdBy);
                createTranslationIfNotExists("history.backup.title", languageCode, "백업 이력", createdBy);
                createTranslationIfNotExists("monitoring.status.title", languageCode, "모니터링 상태", createdBy);
                createTranslationIfNotExists("calendar.view.title", languageCode, "캘린더 보기", createdBy);
                createTranslationIfNotExists("calendar.event.create", languageCode, "일정 생성", createdBy);
                createTranslationIfNotExists("calendar.event.edit", languageCode, "일정 편집", createdBy);
                createTranslationIfNotExists("calendar.event.delete", languageCode, "일정 삭제", createdBy);
                createTranslationIfNotExists("schedule.test.execution", languageCode, "테스트 실행 일정", createdBy);
                createTranslationIfNotExists("schedule.maintenance.title", languageCode, "유지보수 일정", createdBy);
                createTranslationIfNotExists("schedule.release.title", languageCode, "릴리스 일정", createdBy);
                createTranslationIfNotExists("reminder.notification.title", languageCode, "알림 리마인더", createdBy);
                createTranslationIfNotExists("deadline.approaching.title", languageCode, "마감일 임박", createdBy);
                createTranslationIfNotExists("milestone.achievement.title", languageCode, "마일스톤 달성", createdBy);
                createTranslationIfNotExists("statistics.summary.title", languageCode, "통계 요약", createdBy);
                createTranslationIfNotExists("statistics.detailed.title", languageCode, "상세 통계", createdBy);
                createTranslationIfNotExists("chart.pie.title", languageCode, "파이 차트", createdBy);
                createTranslationIfNotExists("chart.bar.title", languageCode, "막대 차트", createdBy);
                createTranslationIfNotExists("chart.line.title", languageCode, "선형 차트", createdBy);
                createTranslationIfNotExists("chart.area.title", languageCode, "영역 차트", createdBy);
                createTranslationIfNotExists("chart.scatter.title", languageCode, "산점도 차트", createdBy);
                createTranslationIfNotExists("chart.radar.title", languageCode, "레이더 차트", createdBy);
                createTranslationIfNotExists("chart.heatmap.title", languageCode, "히트맵 차트", createdBy);
                createTranslationIfNotExists("chart.gauge.title", languageCode, "게이지 차트", createdBy);
                createTranslationIfNotExists("communication.chat.title", languageCode, "채팅", createdBy);
                createTranslationIfNotExists("communication.message.send", languageCode, "메시지 전송", createdBy);
                createTranslationIfNotExists("communication.message.receive", languageCode, "메시지 수신", createdBy);
                createTranslationIfNotExists("collaboration.share.title", languageCode, "공유", createdBy);
                createTranslationIfNotExists("collaboration.comment.add", languageCode, "댓글 추가", createdBy);
                createTranslationIfNotExists("collaboration.review.request", languageCode, "검토 요청", createdBy);
                createTranslationIfNotExists("collaboration.feedback.title", languageCode, "피드백", createdBy);
                createTranslationIfNotExists("discussion.forum.title", languageCode, "토론 포럼", createdBy);
                createTranslationIfNotExists("discussion.thread.create", languageCode, "토론 주제 생성", createdBy);
                createTranslationIfNotExists("discussion.reply.add", languageCode, "답글 추가", createdBy);
                createTranslationIfNotExists("mobile.menu.title", languageCode, "모바일 메뉴", createdBy);
                createTranslationIfNotExists("mobile.navigation.title", languageCode, "모바일 네비게이션", createdBy);
                createTranslationIfNotExists("mobile.responsive.title", languageCode, "반응형 디자인", createdBy);
                createTranslationIfNotExists("mobile.touch.gesture", languageCode, "터치 제스처", createdBy);
                createTranslationIfNotExists("mobile.offline.mode", languageCode, "오프라인 모드", createdBy);
                createTranslationIfNotExists("mobile.sync.title", languageCode, "동기화", createdBy);
                createTranslationIfNotExists("responsive.breakpoint.mobile", languageCode, "모바일 브레이크포인트", createdBy);
                createTranslationIfNotExists("responsive.breakpoint.tablet", languageCode, "태블릿 브레이크포인트", createdBy);
                createTranslationIfNotExists("responsive.breakpoint.desktop", languageCode, "데스크톱 브레이크포인트", createdBy);
                createTranslationIfNotExists("responsive.layout.adaptive", languageCode, "적응형 레이아웃", createdBy);
                createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
                createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
                createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);
                createTranslationIfNotExists("header.nav.llmConfig", languageCode, "LLM 설정", createdBy);
                createTranslationIfNotExists("header.nav.schedulerManagement", languageCode, "스케줄러 관리", createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "시스템 대시보드", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "전체 사용자 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.activeProjects", languageCode, "활성 프로젝트 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.testCases", languageCode, "테스트케이스 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.completedTests", languageCode, "완료된 테스트 수",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.stats.title", languageCode, "조직 통계", createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("common.buttons.reset", languageCode, "재설정", createdBy);
                createTranslationIfNotExists("common.buttons.apply", languageCode, "적용", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.buttons.ok", languageCode, "확인", createdBy);
                createTranslationIfNotExists("common.buttons.yes", languageCode, "예", createdBy);
                createTranslationIfNotExists("common.buttons.no", languageCode, "아니오", createdBy);
                createTranslationIfNotExists("common.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("junit.empty.noResults", languageCode, "테스트 결과가 없습니다", createdBy);
                createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode,
                                "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.",
                                createdBy);
                createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "첫 번째 테스트 결과 업로드", createdBy);
                createTranslationIfNotExists("junit.upload.fileSize", languageCode, "크기", createdBy);
                createTranslationIfNotExists("junit.upload.changeFile", languageCode, "다른 파일 선택", createdBy);
                createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "테스트 실행 정보", createdBy);
                createTranslationIfNotExists("junit.placeholder.description", languageCode, "설명 (선택사항)", createdBy);
                createTranslationIfNotExists("junit.upload.uploadingFile", languageCode, "\"{fileName}\" 업로드 중...",
                                createdBy);
                createTranslationIfNotExists("junit.upload.max", languageCode, "최대", createdBy);
                createTranslationIfNotExists("junit.detail.upload", languageCode, "업로드", createdBy);
                createTranslationIfNotExists("junit.detail.unknownUploader", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("junit.editor.title", languageCode, "테스트 케이스 편집", createdBy);
                createTranslationIfNotExists("junit.editor.viewMode", languageCode, "(보기 모드)", createdBy);
                createTranslationIfNotExists("junit.editor.editMode", languageCode, "(편집 모드)", createdBy);
                createTranslationIfNotExists("junit.editor.viewOriginalData", languageCode, "원본 데이터 보기", createdBy);
                createTranslationIfNotExists("junit.editor.editHistory", languageCode, "편집 이력", createdBy);
                createTranslationIfNotExists("junit.editor.status.passedDesc", languageCode, "테스트가 성공적으로 통과했습니다",
                                createdBy);
                createTranslationIfNotExists("junit.editor.status.failedDesc", languageCode, "테스트가 실패했습니다", createdBy);
                createTranslationIfNotExists("junit.editor.status.errorDesc", languageCode, "테스트 실행 중 오류가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("junit.editor.status.skippedDesc", languageCode, "테스트가 건너뛰어졌습니다",
                                createdBy);
                createTranslationIfNotExists("junit.editor.priority.high", languageCode, "높음", createdBy);
                createTranslationIfNotExists("junit.editor.priority.medium", languageCode, "보통", createdBy);
                createTranslationIfNotExists("junit.editor.priority.low", languageCode, "낮음", createdBy);
                createTranslationIfNotExists("junit.editor.tags", languageCode, "태그", createdBy);
                createTranslationIfNotExists("junit.editor.tagsPlaceholder", languageCode,
                                "쉼표로 구분하여 입력 (예: 버그, 회귀테스트, API)",
                                createdBy);
                createTranslationIfNotExists("junit.editor.tagsHelp", languageCode, "쉼표로 구분하여 여러 태그를 입력할 수 있습니다",
                                createdBy);
                createTranslationIfNotExists("junit.editor.notes", languageCode, "노트", createdBy);
                createTranslationIfNotExists("junit.editor.notesPlaceholder", languageCode, "테스트 케이스에 대한 추가 메모를 입력하세요",
                                createdBy);
                createTranslationIfNotExists("junit.editor.preview", languageCode, "미리보기", createdBy);
                createTranslationIfNotExists("junit.editor.saving", languageCode, "저장 중...", createdBy);
                createTranslationIfNotExists("junit.editor.error.noTestCase", languageCode, "테스트 케이스를 찾을 수 없습니다",
                                createdBy);
                createTranslationIfNotExists("junit.editor.error.saveFailed", languageCode, "테스트 케이스 저장에 실패했습니다",
                                createdBy);

                // 추가 JUnit 편집기 번역
                createTranslationIfNotExists("junit.editor.originalJunitData", languageCode, "원본 JUnit 데이터", createdBy);
                createTranslationIfNotExists("junit.editor.testName", languageCode, "테스트 이름", createdBy);
                createTranslationIfNotExists("junit.editor.className", languageCode, "클래스명", createdBy);
                createTranslationIfNotExists("junit.editor.executionTime", languageCode, "실행 시간", createdBy);
                createTranslationIfNotExists("junit.editor.originalStatus", languageCode, "원본 상태", createdBy);
                createTranslationIfNotExists("junit.editor.failureMessage", languageCode, "실패 메시지", createdBy);
                createTranslationIfNotExists("junit.editor.stackTrace", languageCode, "스택 트레이스", createdBy);
                createTranslationIfNotExists("junit.editor.userEditInfo", languageCode, "사용자 편집 정보", createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedTitle", languageCode, "사용자 정의 제목", createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedTitleHelp", languageCode,
                                "테스트 케이스에 대한 사용자 정의 제목을 입력하세요.", createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedStatus", languageCode, "사용자 정의 상태", createdBy);
                createTranslationIfNotExists("junit.editor.useOriginalStatus", languageCode, "원본 상태 사용", createdBy);
                createTranslationIfNotExists("junit.editor.priorityLabel", languageCode, "우선순위", createdBy);

                createTranslationIfNotExists("rag.manager.noProject", languageCode, "프로젝트를 먼저 선택해주세요.", createdBy);
                createTranslationIfNotExists("rag.upload.title", languageCode, "문서 업로드", createdBy);
                createTranslationIfNotExists("rag.upload.description", languageCode,
                                "PDF, DOCX, DOC, TXT 파일을 업로드하여 RAG 시스템에 등록할 수 있습니다. (최대 50MB)", createdBy);
                createTranslationIfNotExists("rag.upload.dragAndDrop", languageCode, "파일을 이곳에 드래그하거나 클릭하여 선택하세요",
                                createdBy);
                createTranslationIfNotExists("rag.upload.selectFiles", languageCode, "파일 선택", createdBy);
                createTranslationIfNotExists("rag.upload.selectedFiles", languageCode, "선택된 파일", createdBy);
                createTranslationIfNotExists("rag.upload.uploading", languageCode, "업로드 중", createdBy);
                createTranslationIfNotExists("rag.upload.upload", languageCode, "업로드", createdBy);
                createTranslationIfNotExists("rag.upload.error.unsupportedFileType", languageCode,
                                "지원하지 않는 파일 형식입니다. (PDF, DOCX, DOC, TXT만 가능)", createdBy);
                createTranslationIfNotExists("rag.upload.error.fileTooLarge", languageCode,
                                "파일 크기가 너무 큽니다. (최대 {maxSize}MB)",
                                createdBy);
                createTranslationIfNotExists("rag.upload.error.noFilesSelected", languageCode, "업로드할 파일을 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.label", languageCode, "문서 분석 파서", createdBy);
                createTranslationIfNotExists("rag.upload.parser.pypdf2.description", languageCode, "기본 로컬 파서",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.pymupdf.description", languageCode,
                                "다양한 기능을 갖춘 빠른 로컬 파서",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.pymupdf4llm.description", languageCode,
                                "LLM 최적화 마크다운 추출",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.upstage.description", languageCode,
                                "고급 레이아웃 분석이 가능한 클라우드 API (upstage_api_key 필요)", createdBy);
                createTranslationIfNotExists("rag.preview.loading", languageCode, "PDF를 불러오는 중...", createdBy);
                createTranslationIfNotExists("rag.preview.pdfOnly", languageCode, "PDF 파일만 미리보기가 가능합니다.", createdBy);
                createTranslationIfNotExists("rag.preview.error", languageCode, "PDF를 불러올 수 없습니다.", createdBy);
                createTranslationIfNotExists("rag.document.status.pending", languageCode, "대기 중", createdBy);
                createTranslationIfNotExists("rag.document.status.analyzing", languageCode, "분석 중", createdBy);
                createTranslationIfNotExists("rag.document.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("rag.document.status.failed", languageCode, "실패", createdBy);
                createTranslationIfNotExists("rag.document.loading", languageCode, "문서 목록을 불러오는 중...", createdBy);
                createTranslationIfNotExists("rag.document.empty", languageCode, "업로드된 문서가 없습니다", createdBy);
                createTranslationIfNotExists("rag.document.emptyDescription", languageCode,
                                "상단의 업로드 영역을 사용하여 문서를 등록하세요",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.title", languageCode, "업로드된 문서", createdBy);
                createTranslationIfNotExists("rag.document.list.fileName", languageCode, "파일명", createdBy);
                createTranslationIfNotExists("rag.document.list.fileSize", languageCode, "크기", createdBy);
                createTranslationIfNotExists("rag.document.list.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("rag.document.list.chunks", languageCode, "청크 수", createdBy);
                createTranslationIfNotExists("rag.document.list.uploadDate", languageCode, "업로드 일시", createdBy);
                createTranslationIfNotExists("rag.document.list.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("rag.document.download", languageCode, "문서 다운로드", createdBy);
                createTranslationIfNotExists("rag.document.delete", languageCode, "문서 삭제", createdBy);
                createTranslationIfNotExists("rag.document.deleteDialog.title", languageCode, "문서 삭제 확인", createdBy);
                createTranslationIfNotExists("rag.document.deleteDialog.message", languageCode,
                                "이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", createdBy);
                createTranslationIfNotExists("rag.document.pagination.rowsPerPage", languageCode, "페이지당 행 수:",
                                createdBy);
                createTranslationIfNotExists("rag.document.viewChunks", languageCode, "청크 보기", createdBy);
                createTranslationIfNotExists("rag.document.list.regularDocuments", languageCode, "업로드된 문서", createdBy);
                createTranslationIfNotExists("rag.document.list.testCaseDocuments", languageCode, "테스트케이스 문서",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.uploadButton", languageCode, "문서 업로드", createdBy);
                createTranslationIfNotExists("rag.document.global.promoteAction", languageCode, "공통 문서로 이동", createdBy);
                createTranslationIfNotExists("rag.document.global.requestAction", languageCode, "공통 문서 등록 요청",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteTitle", languageCode, "공통 문서로 이동", createdBy);
                createTranslationIfNotExists("rag.document.global.promoteDescription", languageCode,
                                "선택한 문서를 모든 프로젝트에서 활용 가능한 공통 RAG 문서로 이동합니다.", createdBy);
                createTranslationIfNotExists("rag.document.global.promoteReason", languageCode, "이동 사유 (선택)",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteSuccess", languageCode,
                                "문서가 공통 RAG 문서로 이동되었습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.requestTitle", languageCode, "공통 문서 등록 요청",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.requestSubmitted", languageCode,
                                "관리자에게 공통 문서 등록 요청이 전송되었습니다.", createdBy);
                createTranslationIfNotExists("rag.document.global.requestDescription", languageCode,
                                "관리자에게 이 문서를 공통 RAG 문서로 등록해달라고 요청합니다.", createdBy);
                createTranslationIfNotExists("rag.document.global.requestMessage", languageCode, "추가 메시지 (선택)",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.requestSubmitted", languageCode, "관리자에게 요청이 전송되었습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.title", languageCode, "유사 검색", createdBy);
                createTranslationIfNotExists("rag.similar.description", languageCode,
                                "키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트 케이스 또는 문서를 찾아줍니다.", createdBy);
                createTranslationIfNotExists("rag.similar.searchQuery", languageCode, "검색어", createdBy);
                createTranslationIfNotExists("rag.similar.searchPlaceholder", languageCode,
                                "예: 로그인 기능 테스트, 회원가입 유효성 검사",
                                createdBy);
                createTranslationIfNotExists("rag.similar.search", languageCode, "검색", createdBy);
                createTranslationIfNotExists("rag.similar.searching", languageCode, "검색 중...", createdBy);
                createTranslationIfNotExists("rag.similar.noResults", languageCode, "검색 결과가 없습니다. 다른 키워드로 시도해보세요.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.resultsCount", languageCode, "검색 결과 ({count}개)", createdBy);
                createTranslationIfNotExists("rag.similar.testCaseResults", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("rag.similar.documentResults", languageCode, "문서", createdBy);
                createTranslationIfNotExists("rag.similar.metadata", languageCode,
                                "문서 ID: {documentId} | 청크 순서: {chunkIndex}",
                                createdBy);
                createTranslationIfNotExists("rag.similar.copy", languageCode, "복사", createdBy);
                createTranslationIfNotExists("rag.similar.addTestCase", languageCode, "테스트케이스로 추가", createdBy);
                createTranslationIfNotExists("rag.similar.unknownDocument", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("rag.similar.testCaseTitle", languageCode, "테스트케이스 - {fileName}",
                                createdBy);
                createTranslationIfNotExists("rag.similar.sourceTestcase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("rag.similar.sourceDocument", languageCode, "문서", createdBy);
                createTranslationIfNotExists("rag.similar.showDetails", languageCode, "자세히 보기", createdBy);
                createTranslationIfNotExists("rag.similar.noHighSimilarityResults", languageCode,
                                "81% 이상의 유사도를 가진 문서가 없습니다. 아래에서 유사도가 낮은 결과를 확인하세요.", createdBy);
                createTranslationIfNotExists("rag.similar.lowSimilarityCollapsed", languageCode, "유사도 낮음 (클릭하여 보기)",
                                createdBy);

                // 고급 검색 설정 관련 한글 번역
                createTranslationIfNotExists("rag.similar.advancedSettings", languageCode, "고급 검색 설정", createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.enabled", languageCode, "활성화", createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.disabled", languageCode, "비활성화", createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.use", languageCode, "고급 검색 사용", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod", languageCode, "검색 방법", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector", languageCode, "벡터 검색", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector.description", languageCode,
                                "의미적 유사도 기반 (순수 벡터)",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25", languageCode, "BM25 검색", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25.description", languageCode,
                                "키워드 기반 (정확한 단어 매칭)",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid", languageCode, "하이브리드 검색", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid.description", languageCode,
                                "벡터 + BM25 결합 (RRF)",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank", languageCode,
                                "하이브리드 + Reranker ⭐",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank.description", languageCode,
                                "최고 품질 (권장) - 느림", createdBy);
                createTranslationIfNotExists("rag.similar.weightAdjustment", languageCode, "검색 가중치 조정", createdBy);
                createTranslationIfNotExists("rag.similar.vectorWeight", languageCode, "벡터 검색: {weight}%", createdBy);
                createTranslationIfNotExists("rag.similar.bm25Weight", languageCode, "BM25 검색: {weight}%", createdBy);
                createTranslationIfNotExists("rag.similar.recommendedSettings", languageCode,
                                "추천 설정: 벡터 60% + BM25 40% (한국어 최적화)", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector.info", languageCode,
                                "📊 의미적 유사도를 기반으로 검색합니다. 비슷한 의미를 가진 문서를 찾습니다.", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25.info", languageCode,
                                "🔍 키워드 기반 검색입니다. 정확한 단어 매칭에 강합니다.", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid.info", languageCode,
                                "⚡ 벡터와 BM25를 결합하여 균형잡힌 검색 결과를 제공합니다.", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank.info", languageCode,
                                "⭐ 하이브리드 검색 후 Reranker로 재순위를 매겨 최고 품질의 결과를 제공합니다. (처리 시간: 약 2-3배)", createdBy);

                createTranslationIfNotExists("projectHeader.tabs.ragDocuments", languageCode, "RAG 문서", createdBy);

                // RAG Chat Interface 관련 번역
                createTranslationIfNotExists("rag.chat.title", languageCode, "AI 질의응답", createdBy);
                createTranslationIfNotExists("rag.chat.exitFullScreen", languageCode, "전체화면 종료", createdBy);
                createTranslationIfNotExists("rag.chat.enterFullScreen", languageCode, "전체화면 보기", createdBy);
                createTranslationIfNotExists("rag.chat.retry", languageCode, "재시도", createdBy);
                createTranslationIfNotExists("rag.chat.clear", languageCode, "대화 초기화", createdBy);
                createTranslationIfNotExists("rag.chat.persistToggle", languageCode, "대화 자동 저장", createdBy);
                createTranslationIfNotExists("rag.chat.useRagSearch", languageCode, "RAG 문서 우선 검색", createdBy);
                createTranslationIfNotExists("rag.chat.threadSelectLabel", languageCode, "저장된 스레드", createdBy);
                createTranslationIfNotExists("rag.chat.threadAutoOption", languageCode, "새 스레드 자동 생성", createdBy);
                createTranslationIfNotExists("rag.chat.untitledThread", languageCode, "제목 없는 스레드", createdBy);
                createTranslationIfNotExists("rag.chat.refreshThreads", languageCode, "스레드 새로 고침", createdBy);
                createTranslationIfNotExists("rag.chat.deleteThread", languageCode, "스레드 삭제", createdBy);
                createTranslationIfNotExists("rag.chat.createThread", languageCode, "새 스레드", createdBy);
                createTranslationIfNotExists("rag.chat.manageThreadsAction", languageCode, "스레드 관리", createdBy);
                createTranslationIfNotExists("rag.chat.categorySelectLabel", languageCode, "카테고리", createdBy);
                createTranslationIfNotExists("rag.chat.empty", languageCode, "문서에 대해 질문해보세요.", createdBy);
                createTranslationIfNotExists("rag.chat.placeholder", languageCode, "메시지를 입력하세요...", createdBy);
                createTranslationIfNotExists("rag.chat.hint", languageCode, "Shift + Enter: 줄바꿈 | Enter: 전송",
                                createdBy);
                createTranslationIfNotExists("rag.chat.deleteThreadConfirm", languageCode,
                                "현재 스레드를 삭제하시겠습니까? 대화 내용이 모두 삭제됩니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadTitleLabel", languageCode, "제목", createdBy);
                createTranslationIfNotExists("rag.chat.threadDescriptionLabel", languageCode, "설명 (선택)", createdBy);
                createTranslationIfNotExists("rag.chat.threadCreateAction", languageCode, "생성", createdBy);
                createTranslationIfNotExists("rag.chat.editResponse", languageCode, "응답 편집", createdBy);
                createTranslationIfNotExists("rag.chat.editPlaceholder", languageCode, "수정할 답변 내용을 입력하세요.", createdBy);
                createTranslationIfNotExists("rag.chat.deleteMessageTitle", languageCode, "응답 삭제", createdBy);
                createTranslationIfNotExists("rag.chat.deleteMessageConfirm", languageCode,
                                "이 응답을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadTitleRequired", languageCode, "스레드 제목을 입력해주세요.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadCreateFailed", languageCode, "스레드를 생성하지 못했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteFailed", languageCode, "스레드를 삭제하지 못했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.editFailed", languageCode, "메시지를 수정하지 못했습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.messageDeleteFailed", languageCode, "메시지를 삭제하지 못했습니다.",
                                createdBy);

                // RAG Thread Manager Dialog 관련 번역
                createTranslationIfNotExists("rag.chat.manageThreads", languageCode, "대화 스레드 관리", createdBy);
                createTranslationIfNotExists("rag.chat.threadListLabel", languageCode, "스레드 목록", createdBy);
                createTranslationIfNotExists("rag.chat.threadEmpty", languageCode, "저장된 스레드가 없습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.threadDetailsLabel", languageCode, "스레드 상세", createdBy);
                createTranslationIfNotExists("rag.chat.refresh", languageCode, "새로 고침", createdBy);
                createTranslationIfNotExists("rag.chat.threadNotFound", languageCode, "선택한 스레드를 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.threadLoadError", languageCode, "스레드를 불러오지 못했습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.threadUpdateError", languageCode, "스레드를 수정하지 못했습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteError", languageCode, "스레드를 삭제하지 못했습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.threadArchivedLabel", languageCode, "보관 처리", createdBy);
                createTranslationIfNotExists("rag.chat.threadMessagesLabel", languageCode, "대화 내용", createdBy);
                createTranslationIfNotExists("rag.chat.threadMessagesEmpty", languageCode, "대화 메시지가 없습니다.", createdBy);
                createTranslationIfNotExists("rag.chat.roleAssistant", languageCode, "어시스턴트", createdBy);
                createTranslationIfNotExists("rag.chat.roleUser", languageCode, "사용자", createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteAction", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("rag.chat.threadSaveAction", languageCode, "저장", createdBy);

                // LLM 설정 체크 관련 번역
                createTranslationIfNotExists("rag.chat.llmNotConfigured", languageCode, "기본 LLM 설정이 필요합니다", createdBy);
                createTranslationIfNotExists("rag.chat.llmNotConfiguredMessage", languageCode,
                                "AI 질의응답 기능을 사용하려면 관리자가 LLM(Language Model)을 기본값으로 설정해야 합니다. 관리자에게 문의해주세요.", createdBy);
                createTranslationIfNotExists("rag.chat.recheckLlm", languageCode, "다시 확인", createdBy);
                createTranslationIfNotExists("rag.chat.checkingLlm", languageCode, "LLM 설정 확인 중...", createdBy);
                createTranslationIfNotExists("rag.chat.generatingAnswer", languageCode, "AI가 답변을 생성하고 있습니다...",
                                createdBy);

                // Document Chunks 관련 번역
                createTranslationIfNotExists("rag.chunks.dialog.title", languageCode, "문서 청크 보기", createdBy);
                createTranslationIfNotExists("rag.chunks.showMore", languageCode, "더보기", createdBy);
                createTranslationIfNotExists("rag.chunks.showLess", languageCode, "간략히", createdBy);
                createTranslationIfNotExists("rag.chunks.summaryLoadFailed", languageCode, "LLM 요약을 불러오지 못했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.empty", languageCode, "청크가 없습니다. 문서를 먼저 분석해주세요.", createdBy);
                createTranslationIfNotExists("rag.chunks.filteredMode", languageCode, "AI가 참조한 청크만 표시", createdBy);
                createTranslationIfNotExists("rag.chunks.loaded", languageCode, "로드됨", createdBy);
                createTranslationIfNotExists("rag.chunks.scrollForMore", languageCode, "스크롤하여 더 보기", createdBy);
                createTranslationIfNotExists("rag.chunks.viewLlmSummary", languageCode, "LLM 분석 요약 보기", createdBy);
                createTranslationIfNotExists("rag.chunks.metadata", languageCode, "메타데이터", createdBy);
                createTranslationIfNotExists("rag.chunks.loadingMore", languageCode, "추가 청크 로딩 중...", createdBy);
                createTranslationIfNotExists("rag.chunks.allLoaded", languageCode, "모든 청크를 불러왔습니다", createdBy);
                createTranslationIfNotExists("rag.chunks.viewCombinedSummary", languageCode, "LLM 분석 요약 보기", createdBy);
                createTranslationIfNotExists("rag.chunks.documentSummaryTitle", languageCode, "LLM 분석 요약", createdBy);
                createTranslationIfNotExists("rag.chunks.noLlmSummary", languageCode, "아직 확인할 수 있는 LLM 분석 요약이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.loadingLlmSummary", languageCode, "LLM 분석 요약을 불러오는 중입니다...",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.chunkLabel", languageCode, "청크", createdBy);
                createTranslationIfNotExists("rag.chunks.llmSummaryTitle", languageCode, "LLM 분석 요약", createdBy);
                createTranslationIfNotExists("rag.chunks.originalText", languageCode, "원본 텍스트", createdBy);
                createTranslationIfNotExists("rag.chunks.llmAnalysis", languageCode, "LLM 분석 결과", createdBy);
                createTranslationIfNotExists("rag.chunks.summaryNotReady", languageCode, "아직 요약을 확인할 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.preview.loading", languageCode, "PDF를 불러오는 중...", createdBy);

                // Document Analysis 관련 번역
                createTranslationIfNotExists("rag.analysis.llmConfig", languageCode, "LLM 설정", createdBy);
                createTranslationIfNotExists("rag.analysis.noActiveConfigs", languageCode,
                                "활성화된 LLM 설정이 없습니다. LLM 설정 페이지에서 설정을 추가하고 활성화하세요.", createdBy);
                createTranslationIfNotExists("rag.analysis.defaultOnlyInfo", languageCode,
                                "일반 사용자는 기본 LLM 설정만 사용할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.selectConfig", languageCode, "LLM 설정 선택", createdBy);
                createTranslationIfNotExists("rag.analysis.defaultBadge", languageCode, "[기본]", createdBy);
                createTranslationIfNotExists("rag.analysis.selectedConfigInfo", languageCode, "선택된 설정 정보", createdBy);
                createTranslationIfNotExists("rag.analysis.provider", languageCode, "제공자:", createdBy);
                createTranslationIfNotExists("rag.analysis.model", languageCode, "모델:", createdBy);
                createTranslationIfNotExists("rag.analysis.apiUrl", languageCode, "API URL:", createdBy);
                createTranslationIfNotExists("rag.analysis.defaultValue", languageCode, "기본값", createdBy);
                createTranslationIfNotExists("rag.analysis.apiKey", languageCode, "API 키 (선택)", createdBy);
                createTranslationIfNotExists("rag.analysis.apiKeyHelper", languageCode, "비워두면 선택한 LLM 설정에 저장된 API 키 사용",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.promptTemplate", languageCode, "프롬프트 템플릿", createdBy);
                createTranslationIfNotExists("rag.analysis.promptTemplateHelper", languageCode,
                                "{chunk_text} 플레이스홀더를 사용하세요",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.maxTokens", languageCode, "최대 토큰", createdBy);
                createTranslationIfNotExists("rag.analysis.temperature", languageCode, "온도", createdBy);
                createTranslationIfNotExists("rag.analysis.batchSize", languageCode, "배치 크기 (청크 개수)", createdBy);
                createTranslationIfNotExists("rag.analysis.batchSizeHelper", languageCode, "한 번에 처리할 청크 개수", createdBy);
                createTranslationIfNotExists("rag.analysis.pauseAfterBatch", languageCode, "배치마다 일시정지", createdBy);
                createTranslationIfNotExists("rag.analysis.pauseAfterBatchTooltip", languageCode,
                                "배치마다 일시정지하고 사용자 확인을 기다립니다",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.continueTooltip", languageCode, "모든 청크를 중단 없이 계속 분석합니다",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.progress", languageCode, "진행 상황", createdBy);
                createTranslationIfNotExists("rag.analysis.processing", languageCode, "처리 중:", createdBy);
                createTranslationIfNotExists("rag.analysis.chunkNumber", languageCode, "{number}번 청크", createdBy);
                createTranslationIfNotExists("rag.analysis.completed", languageCode, "완료: {count}개", createdBy);
                createTranslationIfNotExists("rag.analysis.total", languageCode, "/ 전체 {count} 청크", createdBy);
                createTranslationIfNotExists("rag.analysis.cost", languageCode, "비용:", createdBy);
                createTranslationIfNotExists("rag.analysis.results", languageCode, "분석 결과", createdBy);
                createTranslationIfNotExists("rag.analysis.chunkColumn", languageCode, "청크 #", createdBy);
                createTranslationIfNotExists("rag.analysis.originalText", languageCode, "원본 텍스트", createdBy);
                createTranslationIfNotExists("rag.analysis.llmResponse", languageCode, "LLM 응답", createdBy);
                createTranslationIfNotExists("rag.analysis.tokens", languageCode, "토큰", createdBy);
                createTranslationIfNotExists("rag.analysis.costColumn", languageCode, "비용", createdBy);
                createTranslationIfNotExists("rag.analysis.estimateCost", languageCode, "비용 추정", createdBy);
                createTranslationIfNotExists("rag.analysis.stop", languageCode, "중단", createdBy);
                createTranslationIfNotExists("rag.analysis.resume", languageCode, "재개", createdBy);
                createTranslationIfNotExists("rag.analysis.pause", languageCode, "일시정지", createdBy);

                // 비용 경고 다이얼로그
                createTranslationIfNotExists("rag.analysis.costWarning.title", languageCode, "LLM 분석 비용 예상", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.highCostAlert", languageCode,
                                "이 작업은 비용이 많이 발생할 수 있습니다. 계속하시겠습니까?", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.modelSection", languageCode, "LLM 모델",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.targetSection", languageCode, "분석 대상",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.chunkCount", languageCode, "총 {count} 개 청크",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.tokenUsageSection", languageCode, "예상 토큰 사용량",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.inputTokens", languageCode, "입력 토큰", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.outputTokens", languageCode, "출력 토큰", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.totalTokens", languageCode, "총 토큰", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.costSection", languageCode, "예상 비용 (USD)",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.inputCost", languageCode, "입력 비용", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.outputCost", languageCode, "출력 비용", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.totalCost", languageCode, "총 예상 비용", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.costPerChunk", languageCode, "(청크당 약 ${cost})",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceSection", languageCode, "모델 가격표 (1K 토큰 기준)",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceInput", languageCode, "입력", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceOutput", languageCode, "출력", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.confirm", languageCode, "확인 및 분석 시작", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.starting", languageCode, "시작 중...", createdBy);
                createTranslationIfNotExists("rag.analysis.error.costEstimate", languageCode, "비용 추정에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.statusCheck", languageCode, "분석 상태 확인에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.startAnalysis", languageCode, "LLM 분석 시작에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.resume", languageCode, "분석 재개에 실패했습니다.", createdBy);
                createTranslationIfNotExists("rag.analysis.error.restart", languageCode, "분석 재시작에 실패했습니다.", createdBy);
                createTranslationIfNotExists("rag.analysis.error.pause", languageCode, "일시정지에 실패했습니다.", createdBy);
                createTranslationIfNotExists("rag.analysis.error.cancel", languageCode, "취소에 실패했습니다.", createdBy);

                createTranslationIfNotExists("attachment.success.upload", languageCode, "파일이 성공적으로 업로드되었습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.success.delete", languageCode, "첨부파일이 성공적으로 삭제되었습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.auth.failed", languageCode, "사용자 인증에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.upload.validation", languageCode, "파일 검증에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.upload.io", languageCode, "파일 저장 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.upload.general", languageCode, "서버 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.list.failed", languageCode,
                                "첨부파일 목록을 조회하는 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.notfound", languageCode, "첨부파일을 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("attachment.error.info.failed", languageCode,
                                "첨부파일 정보를 조회하는 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.download.notfound", languageCode, "파일을 찾을 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.download.io", languageCode, "파일 다운로드 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.download.general", languageCode,
                                "파일 다운로드 중 예상치 못한 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.delete.failed", languageCode, "첨부파일을 삭제하는 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.storage.failed", languageCode,
                                "스토리지 정보를 조회하는 중 오류가 발생했습니다.",
                                createdBy);

                // RAG 문서 목록용 추가 번역
                createTranslationIfNotExists("rag.document.list.llmSummaryStatus", languageCode, "LLM 요약 상태",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.summaryProgress", languageCode, "요약 진행율", createdBy);
                createTranslationIfNotExists("rag.document.list.analyzedChunks", languageCode, "분석 청크", createdBy);

                // Document List - 추가 번역 (2024년 추가분)
                createTranslationIfNotExists("rag.document.summary.title", languageCode, "LLM 분석 요약 - {documentName}",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.fetchFailed", languageCode, "분석 결과 조회에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.noData", languageCode, "표시할 결과가 없습니다.", createdBy);
                createTranslationIfNotExists("rag.document.list.refreshButton", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("rag.document.summary.totalChunksLabel", languageCode, "총 {count}개 청크",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.analyzedChunksLabel", languageCode,
                                "분석 완료: {count}개",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.progressLabel", languageCode, "진행률: {progress}%",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.chunkTemplate", languageCode, "📄 청크 {chunkNumber}",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.progressFormat", languageCode,
                                "{analyzed}/{total} 청크",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.resultsSummary", languageCode, "LLM 분석 결과 요약",
                                createdBy);

                // Job History 관련 한국어 번역
                createTranslationIfNotExists("rag.document.jobHistory.title", languageCode, "작업 이력 - {fileName}",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.jobId", languageCode, "작업 ID", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.llmProvider", languageCode, "LLM 제공자", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.llmModel", languageCode, "LLM 모델", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.progress", languageCode, "진행률", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.chunks", languageCode, "청크", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.cost", languageCode, "비용 (USD)", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.tokens", languageCode, "토큰", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.startTime", languageCode, "시작 시각", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.completedTime", languageCode, "완료 시각", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.pausedTime", languageCode, "일시정지 시각", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.errorMessage", languageCode, "에러 메시지", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.hasError", languageCode, "에러 있음", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.empty", languageCode, "이 문서에 대한 작업 이력이 없습니다.",
                                createdBy);

                // Alert 메시지 관련 한국어 번역
                createTranslationIfNotExists("rag.document.alert.pauseUnavailable", languageCode,
                                "진행 중인 작업만 일시정지할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.alert.resumeUnavailable", languageCode,
                                "일시정지된 작업만 재개할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.alert.statusLoading", languageCode,
                                "작업 상태를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", createdBy);
                createTranslationIfNotExists("rag.document.alert.alreadyProcessing", languageCode, "이미 분석이 진행 중입니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.alert.alreadyProcessingWithProgress", languageCode,
                                "이미 분석이 진행 중입니다. (진행율: {progress})", createdBy);
                createTranslationIfNotExists("rag.document.alert.cancelConfirm", languageCode,
                                "\"{documentName}\" 문서의 분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.", createdBy);

                // Error 메시지 관련 한국어 번역
                createTranslationIfNotExists("rag.document.error.listFailed", languageCode, "문서 목록 조회에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.uploadFailed", languageCode, "문서 업로드에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.deleteFailed", languageCode, "문서 삭제에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.downloadFailed", languageCode, "문서 다운로드에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.analyzeFailed", languageCode, "문서 분석에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.embeddingFailed", languageCode, "임베딩 생성에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.promoteFailed", languageCode, "공통 문서 이동에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.requestFailed", languageCode, "공통 문서 등록 요청에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.jobHistoryFailed", languageCode, "작업 이력 조회에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.pauseFailed", languageCode, "일시정지에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.resumeFailed", languageCode, "재개에 실패했습니다.", createdBy);
                createTranslationIfNotExists("rag.document.error.cancelFailed", languageCode, "취소에 실패했습니다.", createdBy);

                // Confirm 다이얼로그 관련 한국어 번역
                createTranslationIfNotExists("rag.document.confirm.analyze", languageCode,
                                "문서 \"{fileName}\"을 분석하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("rag.document.confirm.generateEmbeddings", languageCode,
                                "문서 \"{fileName}\"의 임베딩을 생성하시겠습니까?", createdBy);
                createTranslationIfNotExists("rag.document.list.parser", languageCode, "파서", createdBy);
                createTranslationIfNotExists("rag.document.list.embeddingStatus", languageCode, "임베딩", createdBy);
                createTranslationIfNotExists("rag.document.embedding.pending", languageCode, "대기 중", createdBy);
                createTranslationIfNotExists("rag.document.embedding.generating", languageCode, "생성 중", createdBy);
                createTranslationIfNotExists("rag.document.embedding.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("rag.document.embedding.failed", languageCode, "실패", createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.notStartedMessage", languageCode,
                                "아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.", createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.errorMessage", languageCode, "분석 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.processingPausedMessage", languageCode,
                                "LLM 분석이 진행 중입니다. 현재까지 분석된 {analyzedChunks}개 청크의 결과를 확인할 수 있습니다.", createdBy);

                // LLM 설정 관리 한글 번역
                createTranslationIfNotExists("common.create", languageCode, "생성", createdBy);
                createTranslationIfNotExists("common.edit", languageCode, "수정", createdBy);
                createTranslationIfNotExists("common.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("admin.llmConfig.title", languageCode, "LLM 설정 관리", createdBy);
                createTranslationIfNotExists("admin.llmConfig.addConfig", languageCode, "LLM 설정 추가", createdBy);
                createTranslationIfNotExists("admin.llmConfig.editConfig", languageCode, "LLM 설정 수정", createdBy);
                createTranslationIfNotExists("admin.llmConfig.createConfig", languageCode, "LLM 설정 생성", createdBy);
                createTranslationIfNotExists("admin.llmConfig.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("admin.llmConfig.provider", languageCode, "제공자", createdBy);
                createTranslationIfNotExists("admin.llmConfig.model", languageCode, "모델", createdBy);
                createTranslationIfNotExists("admin.llmConfig.apiUrl", languageCode, "API URL", createdBy);
                createTranslationIfNotExists("admin.llmConfig.apiKey", languageCode, "API Key", createdBy);
                createTranslationIfNotExists("admin.llmConfig.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("admin.llmConfig.default", languageCode, "기본", createdBy);
                createTranslationIfNotExists("admin.llmConfig.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("admin.llmConfig.active", languageCode, "활성", createdBy);
                createTranslationIfNotExists("admin.llmConfig.inactive", languageCode, "비활성", createdBy);
                createTranslationIfNotExists("admin.llmConfig.activate", languageCode, "활성화", createdBy);
                createTranslationIfNotExists("admin.llmConfig.deactivate", languageCode, "비활성화", createdBy);
                createTranslationIfNotExists("admin.llmConfig.testConnection", languageCode, "연결 테스트", createdBy);
                createTranslationIfNotExists("admin.llmConfig.setAsDefault", languageCode, "기본 설정으로 지정", createdBy);
                createTranslationIfNotExists("admin.llmConfig.noConfigs", languageCode, "LLM 설정이 없습니다", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.allFieldsRequired", languageCode,
                                "모든 필수 필드를 입력해주세요",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.connectionSuccess", languageCode, "연결 테스트 성공!",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.connectionFailed", languageCode, "연결 테스트 실패",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.invalidJson", languageCode,
                                "템플릿이 유효한 JSON 형식이 아닙니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.confirmDelete", languageCode,
                                "정말 이 LLM 설정을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.deleted", languageCode, "LLM 설정이 삭제되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.updated", languageCode, "LLM 설정이 수정되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.created", languageCode, "LLM 설정이 생성되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.defaultChanged", languageCode,
                                "기본 LLM 설정이 변경되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.activeChanged", languageCode,
                                "LLM 설정 활성 상태가 변경되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.tab.configList", languageCode, "LLM 설정 목록", createdBy);
                createTranslationIfNotExists("admin.llmConfig.tab.template", languageCode, "기본 템플릿", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.title", languageCode, "📋 테스트 케이스 생성 기본 템플릿",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.description1", languageCode,
                                "이 템플릿은 새로운 LLM 설정 생성 시 자동으로 설정되며, AI에게 테스트 케이스 생성을 요청할 때 참고 형식으로 사용됩니다.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.description2", languageCode,
                                "각 LLM 설정별로 이 템플릿을 수정하여 사용할 수 있습니다.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.label", languageCode, "기본 템플릿 JSON:", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.download", languageCode, "다운로드", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.reset", languageCode, "초기화", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.downloadJson", languageCode, "JSON 다운로드",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usageTitle", languageCode, "사용 방법:", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage1", languageCode,
                                "1. LLM 설정 생성 시 이 템플릿이 자동으로 적용됩니다.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage2", languageCode,
                                "2. 각 LLM 설정에서 개별적으로 템플릿을 수정할 수 있습니다.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage3", languageCode,
                                "3. RAG 채팅에서 \"테스트 케이스\"를 포함한 요청 시 자동으로 템플릿을 참고합니다.", createdBy);

                // 공통 문서 등록 요청 키들
                createTranslationIfNotExists("admin.globalDoc.requests.title", languageCode, "📨 공통 문서 등록 요청",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.empty", languageCode, "대기 중인 요청이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedBy", languageCode, "요청자", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.message", languageCode, "요청 메모", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedAt", languageCode, "요청 일시", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approve", languageCode, "승인", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.reject", languageCode, "거절", createdBy);
                createTranslationIfNotExists("admin.globalDoc.title", languageCode, "🌐 공통 RAG 문서 관리", createdBy);
                createTranslationIfNotExists("admin.globalDoc.description", languageCode,
                                "모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스를 관리합니다. (관리자 전용)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploadFile", languageCode, "파일 업로드", createdBy);
                createTranslationIfNotExists("admin.globalDoc.fileName", languageCode, "파일명", createdBy);
                createTranslationIfNotExists("admin.globalDoc.fileSize", languageCode, "파일 크기", createdBy);
                createTranslationIfNotExists("admin.globalDoc.analysisStatus", languageCode, "분석 상태", createdBy);
                createTranslationIfNotExists("admin.globalDoc.parser", languageCode, "파서", createdBy);
                createTranslationIfNotExists("admin.globalDoc.embeddingStatus", languageCode, "임베딩 상태", createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunkCount", languageCode, "청크 수", createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploader", languageCode, "업로더", createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploadDate", languageCode, "업로드 날짜", createdBy);
                createTranslationIfNotExists("admin.globalDoc.noDocuments", languageCode,
                                "아직 공통 문서가 없습니다. 첫 번째 문서를 업로드해보세요!",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.parserUnknown", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("admin.globalDoc.parserAuto", languageCode, "자동 선택", createdBy);

                // 공통 문서 정보 섹션
                createTranslationIfNotExists("admin.globalDoc.info.whatIsTitle", languageCode, "📚 공통 문서란?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.whatIsDescription", languageCode,
                                "모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스입니다. 특수 프로젝트 ID({0})로 관리됩니다.", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.examplesTitle", languageCode, "💡 활용 예시:",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example1", languageCode, "회사 공통 코딩 컨벤션 및 개발 가이드라인",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example2", languageCode, "테스트 작성 표준 및 품질 관리 문서",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example3", languageCode,
                                "프로젝트 공통 참조 문서 (API 명세, 아키텍처 가이드 등)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example4", languageCode, "조직 전체의 모범 사례 및 학습 자료",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.techSpecsTitle", languageCode, "⚙️ 기술 사양:",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.supportedFormats", languageCode,
                                "지원 형식: PDF, DOCX, DOC, TXT (최대 50MB)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.autoSearch", languageCode,
                                "모든 프로젝트의 RAG Q&A에서 자동 검색됨",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.adminOnly", languageCode,
                                "관리자만 업로드/삭제 가능 (ADMIN 권한 필요)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.pending", languageCode, "대기", createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.failed", languageCode, "실패", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.preview", languageCode, "PDF 미리보기", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.viewChunks", languageCode, "청크 보기", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.download", languageCode, "다운로드", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.analyze", languageCode, "문서 분석", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.generateEmbedding", languageCode, "임베딩 생성",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.generateEmbeddings", languageCode, "임베딩 생성",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploadSuccess", languageCode,
                                "공통 문서 \"{0}\"이 업로드되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploadFailed", languageCode, "공통 문서 업로드 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleteSuccess", languageCode,
                                "공통 문서 \"{0}\"이 삭제되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleteFailed", languageCode, "공통 문서 삭제 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploaded", languageCode,
                                "공통 문서 \"{0}\"이 업로드되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleted", languageCode, "공통 문서 \"{0}\"이 삭제되었습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmDelete", languageCode,
                                "공통 문서 \"{0}\"을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmAnalyze", languageCode,
                                "문서 \"{0}\"을 분석하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmEmbedding", languageCode,
                                "문서 \"{0}\"의 임베딩을 생성하시겠습니까?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmEmbeddings", languageCode,
                                "문서 \"{0}\"의 임베딩을 생성하시겠습니까?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.analyzeStarted", languageCode,
                                "문서 \"{0}\" 분석 시작됨",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.analyzeFailed", languageCode, "분석 시작 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingStarted", languageCode,
                                "문서 \"{0}\" 임베딩 생성 시작됨",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingsStarted", languageCode,
                                "문서 \"{0}\" 임베딩 생성 시작됨",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingsFailed", languageCode, "임베딩 생성 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloaded", languageCode, "문서 \"{0}\" 다운로드 완료",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloadSuccess", languageCode,
                                "문서 \"{0}\" 다운로드 완료",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloadFailed", languageCode, "다운로드 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.viewChunksFailed", languageCode, "청크 조회 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.previewFailed", languageCode, "미리보기 실패",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.pdfOnly", languageCode, "PDF 파일만 미리보기가 가능합니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.supportedFormats", languageCode,
                                "지원되는 파일 형식: PDF, DOCX, DOC, TXT", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.maxSize", languageCode, "파일 크기는 50MB를 초과할 수 없습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.fileSizeLimit", languageCode,
                                "파일 크기는 50MB를 초과할 수 없습니다",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.unknownError", languageCode, "알 수 없는 오류",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunks.title", languageCode, "문서 청크", createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunks.chunkNumber", languageCode, "청크 #{0}", createdBy);

                // 스케줄러 관리 한글 번역
                createTranslationIfNotExists("scheduler.title", languageCode, "스케줄러 관리", createdBy);
                createTranslationIfNotExists("scheduler.description", languageCode,
                                "백그라운드 작업의 실행 시간을 동적으로 관리합니다. Cron 표현식을 변경하면 서버 재시작 없이 즉시 반영됩니다.", createdBy);
                createTranslationIfNotExists("scheduler.currentTime", languageCode, "현재 시간 ({timezone})", createdBy);
                createTranslationIfNotExists("scheduler.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("scheduler.status.changed", languageCode, "스케줄 상태가 변경되었습니다.", createdBy);
                createTranslationIfNotExists("scheduler.task.executed", languageCode, "작업이 실행되었습니다.", createdBy);
                createTranslationIfNotExists("scheduler.confirm.execute", languageCode,
                                "\"{taskName}\" 작업을 즉시 실행하시겠습니까?", createdBy);

                // 데이터 그리드 컬럼
                createTranslationIfNotExists("scheduler.column.taskName", languageCode, "작업 이름", createdBy);
                createTranslationIfNotExists("scheduler.column.scheduleExpression", languageCode, "스케줄 표현식", createdBy);
                createTranslationIfNotExists("scheduler.column.type", languageCode, "타입", createdBy);
                createTranslationIfNotExists("scheduler.column.nextExecution", languageCode, "다음 실행", createdBy);
                createTranslationIfNotExists("scheduler.column.lastExecution", languageCode, "마지막 실행", createdBy);
                createTranslationIfNotExists("scheduler.column.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("scheduler.column.enabled", languageCode, "활성화", createdBy);
                createTranslationIfNotExists("scheduler.column.actions", languageCode, "작업", createdBy);

                // 스케줄 타입 & 단위
                createTranslationIfNotExists("scheduler.type.fixedRate", languageCode, "Fixed Rate", createdBy);
                createTranslationIfNotExists("scheduler.type.fixedDelay", languageCode, "Fixed Delay", createdBy);
                createTranslationIfNotExists("scheduler.time.seconds", languageCode, "{seconds}초", createdBy);
                createTranslationIfNotExists("scheduler.time.minutes", languageCode, "{minutes}분", createdBy);
                createTranslationIfNotExists("scheduler.time.hours", languageCode, "{hours}시간", createdBy);
                createTranslationIfNotExists("scheduler.time.days", languageCode, "{days}일", createdBy);

                // 버튼 & 툴팁
                createTranslationIfNotExists("scheduler.tooltip.edit", languageCode, "편집", createdBy);
                createTranslationIfNotExists("scheduler.tooltip.execute", languageCode, "즉시 실행", createdBy);

                // 스케줄 설정 다이얼로그
                createTranslationIfNotExists("scheduler.dialog.title", languageCode, "스케줄 설정 편집", createdBy);
                createTranslationIfNotExists("scheduler.dialog.taskKey", languageCode, "작업 키:", createdBy);
                createTranslationIfNotExists("scheduler.dialog.scheduleType", languageCode, "스케줄 타입:", createdBy);
                createTranslationIfNotExists("scheduler.dialog.description", languageCode, "설명:", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronExpression", languageCode, "Cron 표현식", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronHelper", languageCode,
                                "형식: 초 분 시 일 월 요일 (예: 0 0 1 * * *)", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronExamples", languageCode, "Cron 표현식 예시", createdBy);
                createTranslationIfNotExists("scheduler.dialog.fixedRate", languageCode, "Fixed Rate (밀리초)", createdBy);
                createTranslationIfNotExists("scheduler.dialog.fixedDelay", languageCode, "Fixed Delay (밀리초)",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.currentValue", languageCode, "현재 값: {value}", createdBy);
                createTranslationIfNotExists("scheduler.dialog.enabled", languageCode, "활성화", createdBy);
                createTranslationIfNotExists("scheduler.dialog.nextExecution", languageCode, "다음 실행 예정: {time}",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("scheduler.dialog.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("scheduler.dialog.updated", languageCode, "스케줄 설정이 업데이트되었습니다.", createdBy);

                // Cron 예시
                createTranslationIfNotExists("scheduler.cron.every5min", languageCode, "매 5분마다", createdBy);
                createTranslationIfNotExists("scheduler.cron.everyHour", languageCode, "매 시간 정각", createdBy);
                createTranslationIfNotExists("scheduler.cron.midnight", languageCode, "매일 자정", createdBy);
                createTranslationIfNotExists("scheduler.cron.daily1am", languageCode, "매일 새벽 1시", createdBy);
                createTranslationIfNotExists("scheduler.cron.weekdays9am", languageCode, "평일 오전 9시", createdBy);
                createTranslationIfNotExists("scheduler.cron.monday9am", languageCode, "매주 월요일 오전 9시", createdBy);

                // 에러 메시지
                createTranslationIfNotExists("scheduler.error.cronRequired", languageCode, "Cron 표현식을 입력하세요",
                                createdBy);
                createTranslationIfNotExists("scheduler.error.cronFormat", languageCode,
                                "Cron 표현식은 6개 필드여야 합니다 (초 분 시 일 월 요일)", createdBy);
                createTranslationIfNotExists("scheduler.error.fixedRatePositive", languageCode,
                                "Fixed Rate 값은 0보다 커야 합니다", createdBy);
                createTranslationIfNotExists("scheduler.error.fixedDelayPositive", languageCode,
                                "Fixed Delay 값은 0보다 커야 합니다", createdBy);
                createTranslationIfNotExists("scheduler.error.updateFailed", languageCode, "스케줄 설정 업데이트에 실패했습니다.",
                                createdBy);

                // 스케줄러 목록
                createTranslationIfNotExists("scheduler.list.title", languageCode, "스케줄된 작업 목록", createdBy);
                createTranslationIfNotExists("scheduler.list.lastUpdated", languageCode, "최근 업데이트: {time}", createdBy);
                createTranslationIfNotExists("scheduler.list.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("scheduler.list.totalTasks", languageCode, "총 스케줄 작업", createdBy);
                createTranslationIfNotExists("scheduler.list.activeStatus", languageCode, "활성 상태", createdBy);
                createTranslationIfNotExists("scheduler.list.normalOperation", languageCode, "정상 동작", createdBy);
                createTranslationIfNotExists("scheduler.list.serverTimezone", languageCode, "서버 시간대", createdBy);
                createTranslationIfNotExists("scheduler.list.detailsTitle", languageCode, "스케줄 상세 정보", createdBy);
                createTranslationIfNotExists("scheduler.list.columnName", languageCode, "작업 이름", createdBy);
                createTranslationIfNotExists("scheduler.list.columnSchedule", languageCode, "스케줄", createdBy);
                createTranslationIfNotExists("scheduler.list.columnType", languageCode, "타입", createdBy);
                createTranslationIfNotExists("scheduler.list.columnDescription", languageCode, "설명", createdBy);
                createTranslationIfNotExists("scheduler.error.loadFailed", languageCode, "스케줄러 정보를 불러오는데 실패했습니다.",
                                createdBy);

                // Exploratory Session
                createTranslationIfNotExists("projectHeader.tabs.exploratorySessions", languageCode, "탐색 세션", createdBy);
                createTranslationIfNotExists("exploratory.workspace.title", languageCode, "탐색 세션 워크스페이스", createdBy);
                createTranslationIfNotExists("exploratory.workspace.badgeDraft", languageCode, "UI 초안", createdBy);
                createTranslationIfNotExists("exploratory.view.charterManagement", languageCode, "차터 관리", createdBy);
                createTranslationIfNotExists("exploratory.view.sessionList", languageCode, "세션 목록", createdBy);
                createTranslationIfNotExists("exploratory.view.sessionEditor", languageCode, "세션 작성/편집", createdBy);
                createTranslationIfNotExists("exploratory.view.debriefApproval", languageCode, "디브리프/승인", createdBy);
                createTranslationIfNotExists("exploratory.view.sessionDetail", languageCode, "세션 상세", createdBy);
                createTranslationIfNotExists("exploratory.charter.filter.status", languageCode, "상태 필터", createdBy);
                createTranslationIfNotExists("exploratory.charter.create", languageCode, "차터 생성", createdBy);
                createTranslationIfNotExists("exploratory.charter.mission", languageCode, "미션", createdBy);
                createTranslationIfNotExists("exploratory.charter.sessionCount", languageCode, "수행 횟수 {count}", createdBy);
                createTranslationIfNotExists("exploratory.charter.totalBugs", languageCode, "총 버그 {count}", createdBy);
                createTranslationIfNotExists("exploratory.charter.dialog.createTitle", languageCode, "차터 생성", createdBy);
                createTranslationIfNotExists("exploratory.charter.dialog.editTitle", languageCode, "차터 편집", createdBy);
                createTranslationIfNotExists("exploratory.charter.dialog.name", languageCode, "차터 이름", createdBy);
                createTranslationIfNotExists("exploratory.charter.dialog.mission", languageCode, "미션", createdBy);
                createTranslationIfNotExists("exploratory.charter.dialog.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("exploratory.session.filter.tester", languageCode, "테스터", createdBy);
                createTranslationIfNotExists("exploratory.session.filter.linkedCharter", languageCode, "연결 차터", createdBy);
                createTranslationIfNotExists("exploratory.session.filter.minBugs", languageCode, "버그 수(이상)", createdBy);
                createTranslationIfNotExists("exploratory.session.filter.periodFrom", languageCode, "기간 시작", createdBy);
                createTranslationIfNotExists("exploratory.session.filter.periodTo", languageCode, "기간 종료", createdBy);
                createTranslationIfNotExists("exploratory.session.label.bugs", languageCode, "버그 {count}", createdBy);
                createTranslationIfNotExists("exploratory.session.label.meta", languageCode, "기간 {date} | 테스터 {tester} | 차터 {charter}", createdBy);
                createTranslationIfNotExists("exploratory.editor.header.title", languageCode, "헤더", createdBy);
                createTranslationIfNotExists("exploratory.editor.header.elapsed", languageCode, "실행 시간 {value}", createdBy);
                createTranslationIfNotExists("exploratory.editor.header.paused", languageCode, "중단 시간 {value}", createdBy);
                createTranslationIfNotExists("exploratory.editor.timer.start", languageCode, "Start", createdBy);
                createTranslationIfNotExists("exploratory.editor.timer.pause", languageCode, "Pause", createdBy);
                createTranslationIfNotExists("exploratory.editor.timer.resume", languageCode, "Resume", createdBy);
                createTranslationIfNotExists("exploratory.editor.timer.end", languageCode, "End", createdBy);
                createTranslationIfNotExists("exploratory.editor.field.environment", languageCode, "환경", createdBy);
                createTranslationIfNotExists("exploratory.editor.field.version", languageCode, "버전", createdBy);
                createTranslationIfNotExists("exploratory.editor.field.tags", languageCode, "태그", createdBy);
                createTranslationIfNotExists("exploratory.editor.charterSection.title", languageCode, "차터 섹션", createdBy);
                createTranslationIfNotExists("exploratory.editor.charterSection.assigned", languageCode, "할당 차터", createdBy);
                createTranslationIfNotExists("exploratory.editor.charterSection.autoMission", languageCode, "자동 바인딩된 미션", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.title", languageCode, "시간 배분", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.execution", languageCode, "Test Execution (%)", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.bugInvestigation", languageCode, "Bug Investigation (%)", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.setupAdmin", languageCode, "Setup/Admin (%)", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.total", languageCode, "합계 {total}%", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.pausedMinutes", languageCode, "자동 반영된 중단 시간 {minutes}분", createdBy);
                createTranslationIfNotExists("exploratory.editor.timeSection.ratioWarning", languageCode, "시간 배분 합계가 100%가 아닙니다.", createdBy);
                createTranslationIfNotExists("exploratory.editor.notes.title", languageCode, "테스트 노트", createdBy);
                createTranslationIfNotExists("exploratory.editor.notes.flow", languageCode, "수행 흐름", createdBy);
                createTranslationIfNotExists("exploratory.editor.notes.coverage", languageCode, "커버리지", createdBy);
                createTranslationIfNotExists("exploratory.editor.notes.oracle", languageCode, "오라클", createdBy);
                createTranslationIfNotExists("exploratory.editor.notes.activity", languageCode, "활동 상세", createdBy);
                createTranslationIfNotExists("exploratory.editor.issue.title", languageCode, "버그/이슈", createdBy);
                createTranslationIfNotExists("exploratory.editor.issue.bugHeadline", languageCode, "버그 헤드라인 연동", createdBy);
                createTranslationIfNotExists("exploratory.editor.issue.blockers", languageCode, "방해 이슈", createdBy);
                createTranslationIfNotExists("exploratory.editor.issue.questions", languageCode, "남은 질문", createdBy);
                createTranslationIfNotExists("exploratory.editor.artifact.title", languageCode, "데이터/산출물", createdBy);
                createTranslationIfNotExists("exploratory.editor.artifact.testData", languageCode, "테스트 데이터", createdBy);
                createTranslationIfNotExists("exploratory.editor.artifact.upload", languageCode, "증적 업로드", createdBy);
                createTranslationIfNotExists("exploratory.editor.artifact.empty", languageCode, "업로드된 파일이 없습니다.", createdBy);
                createTranslationIfNotExists("exploratory.editor.artifact.sizeKb", languageCode, "{size} KB", createdBy);
                createTranslationIfNotExists("exploratory.editor.evaluation.title", languageCode, "평가/액션", createdBy);
                createTranslationIfNotExists("exploratory.editor.evaluation.achievement", languageCode, "차터 달성도 {value}%", createdBy);
                createTranslationIfNotExists("exploratory.editor.evaluation.overall", languageCode, "전체 평가", createdBy);
                createTranslationIfNotExists("exploratory.editor.evaluation.nextCharter", languageCode, "다음 세션 제안 차터", createdBy);
                createTranslationIfNotExists("exploratory.debrief.report.title", languageCode, "디브리프 리포트", createdBy);
                createTranslationIfNotExists("exploratory.debrief.report.meta", languageCode, "세션: Sprint 22 결제 탐색 | 테스터: Kim QA | 상태: DONE", createdBy);
                createTranslationIfNotExists("exploratory.debrief.report.summary", languageCode, "요약: 결제 승인 단계에서 간헐적 타임아웃 재현. 재시도 경로에서 중복 승인 위험 발견.", createdBy);
                createTranslationIfNotExists("exploratory.debrief.report.keyBugs", languageCode, "주요 버그: PAY-421, PAY-433", createdBy);
                createTranslationIfNotExists("exploratory.debrief.report.evidence", languageCode, "증적: screenshot_0210.png, payment-retry.log", createdBy);
                createTranslationIfNotExists("exploratory.debrief.checklist.title", languageCode, "체크리스트", createdBy);
                createTranslationIfNotExists("exploratory.debrief.checklist.scope", languageCode, "차터 범위 준수", createdBy);
                createTranslationIfNotExists("exploratory.debrief.checklist.timebox", languageCode, "타임박스/중단 시간 기록", createdBy);
                createTranslationIfNotExists("exploratory.debrief.checklist.evidence", languageCode, "버그 근거 자료 첨부", createdBy);
                createTranslationIfNotExists("exploratory.debrief.checklist.action", languageCode, "후속 액션 제안 포함", createdBy);
                createTranslationIfNotExists("exploratory.debrief.leadComment", languageCode, "리드 코멘트", createdBy);
                createTranslationIfNotExists("exploratory.debrief.action.approve", languageCode, "승인", createdBy);
                createTranslationIfNotExists("exploratory.debrief.action.requestChanges", languageCode, "보완요청", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.title", languageCode, "세션 활동 타임라인 (Read-only)", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.start.primary", languageCode, "10:02 세션 시작", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.start.secondary", languageCode, "차터 바인딩: 결제 실패 복구 시나리오 탐색", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.bug.primary", languageCode, "10:27 버그 발견", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.bug.secondary", languageCode, "PAY-421 생성, 증적 2건 첨부", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.pause.primary", languageCode, "10:41 중단/재개", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.pause.secondary", languageCode, "환경 불안정으로 4분 중단 후 재개", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.done.primary", languageCode, "11:03 종료 및 승인 완료", createdBy);
                createTranslationIfNotExists("exploratory.detail.timeline.done.secondary", languageCode, "리드 승인자: Choi Lead (2026-02-10)", createdBy);
                createTranslationIfNotExists("exploratory.detail.archive.title", languageCode, "최종 승인 리포트 아카이브", createdBy);

                createTranslationIfNotExists("admin.globalDoc.chunks.noChunks", languageCode, "청크가 없습니다.", createdBy);
                createTranslationIfNotExists("admin.globalDoc.noChunks", languageCode, "청크가 없습니다.", createdBy);
                createTranslationIfNotExists("admin.globalDoc.preview.title", languageCode, "PDF 미리보기", createdBy);
                createTranslationIfNotExists("admin.globalDoc.preview.loading", languageCode, "미리보기를 불러올 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.title", languageCode, "📨 공통 문서 등록 요청",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.empty", languageCode, "대기 중인 요청이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedBy", languageCode, "요청자", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.message", languageCode, "요청 메모", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedAt", languageCode, "요청 일시", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approve", languageCode, "승인", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.reject", languageCode, "거절", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approveNote", languageCode, "승인 메모 (선택)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approved", languageCode, "요청을 승인했습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approveFailed", languageCode, "요청 승인에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejectNote", languageCode, "거절 사유 (선택)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejected", languageCode, "요청을 거절했습니다.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejectFailed", languageCode, "요청 거절에 실패했습니다.",
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
