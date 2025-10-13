// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TestResultKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TestResultKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    @Transactional
    public void initialize() {
        log.info("테스트 결과 번역 키 초기화 중...");

        // 테스트 결과 메인 페이지
        createTranslationKeyIfNotExists("testResult.mainPage.title", "testResult", "테스트 결과 페이지 제목", "테스트 결과");
        createTranslationKeyIfNotExists("testResult.mainPage.description", "testResult", "테스트 결과 페이지 설명", "프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.");

        // 테스트 결과 탭
        createTranslationKeyIfNotExists("testResult.tab.statistics", "testResult", "통계 탭", "통계");
        createTranslationKeyIfNotExists("testResult.tab.statisticsFull", "testResult", "통계 대시보드 탭", "통계 대시보드");
        createTranslationKeyIfNotExists("testResult.tab.statisticsDescription", "testResult", "통계 탭 설명", "테스트 결과의 통계를 차트와 그래프로 확인할 수 있습니다.");
        createTranslationKeyIfNotExists("testResult.tab.trend", "testResult", "추이 탭", "추이");
        createTranslationKeyIfNotExists("testResult.tab.trendFull", "testResult", "추이 분석 탭", "추이 분석");
        createTranslationKeyIfNotExists("testResult.tab.trendDescription", "testResult", "추이 탭 설명", "시간에 따른 테스트 결과 변화를 분석할 수 있습니다.");
        createTranslationKeyIfNotExists("testResult.tab.table", "testResult", "테이블 탭", "테이블");
        createTranslationKeyIfNotExists("testResult.tab.tableFull", "testResult", "상세 테이블 탭", "상세 테이블");
        createTranslationKeyIfNotExists("testResult.tab.tableDescription", "testResult", "테이블 탭 설명", "모든 테스트 결과를 상세한 테이블 형태로 확인할 수 있습니다.");
        createTranslationKeyIfNotExists("testResult.tab.report", "testResult", "리포트 탭", "리포트");
        createTranslationKeyIfNotExists("testResult.tab.reportFull", "testResult", "상세 리포트 탭", "상세 리포트");
        createTranslationKeyIfNotExists("testResult.tab.reportDescription", "testResult", "리포트 탭 설명", "완전한 테스트 리포트를 생성하고 확인할 수 있습니다.");

        // 테스트케이스 결과 페이지
        createTranslationKeyIfNotExists("testCaseResult.page.title", "testResult", "테스트케이스 결과 페이지 제목", "테스트 케이스 결과");

        // 테스트 결과 폼
        createTranslationKeyIfNotExists("testResult.form.title", "testResult", "테스트 결과 폼 제목", "테스트 결과 입력");
        createTranslationKeyIfNotExists("testResult.form.testResult", "testResult", "테스트 결과", "테스트 결과");
        createTranslationKeyIfNotExists("testResult.form.preCondition", "testResult", "사전 조건", "사전 조건");
        createTranslationKeyIfNotExists("testResult.form.testSteps", "testResult", "테스트 단계", "테스트 단계");
        createTranslationKeyIfNotExists("testResult.form.expectedResult", "testResult", "예상 결과", "예상 결과");
        createTranslationKeyIfNotExists("testResult.form.notes", "testResult", "비고", "비고 ({current}/{max})");
        createTranslationKeyIfNotExists("testResult.form.notesPlaceholder", "testResult", "비고 입력란", "테스트 결과에 대한 추가 정보를 입력하세요");
        createTranslationKeyIfNotExists("testResult.form.notesHelp", "testResult", "비고 도움말", "테스트 과정에서 발견한 특이사항이나 추가 정보를 기록해주세요.");
        createTranslationKeyIfNotExists("testResult.form.notesLimitWarning", "testResult", "비고 글자수 경고", "⚠️ 권장 글자 수를 초과했습니다 ({current}/{max})");
        createTranslationKeyIfNotExists("testResult.form.notesLimitError", "testResult", "비고 글자수 오류", "❌ 최대 글자 수를 초과했습니다 ({current}/{max})");

        // 파일 첨부
        createTranslationKeyIfNotExists("testResult.form.fileAttachment", "testResult", "파일 첨부", "파일 첨부");
        createTranslationKeyIfNotExists("testResult.form.fileSelect", "testResult", "파일 선택", "파일 선택");
        createTranslationKeyIfNotExists("testResult.form.fileUploading", "testResult", "파일 업로드 중", "업로드 중...");
        createTranslationKeyIfNotExists("testResult.form.fileFormat", "testResult", "파일 형식", "지원 형식: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX");
        createTranslationKeyIfNotExists("testResult.form.newAttachments", "testResult", "새 첨부파일", "새 첨부파일:");
        createTranslationKeyIfNotExists("testResult.form.attachments", "testResult", "첨부파일", "첨부파일:");
        createTranslationKeyIfNotExists("testResult.form.attachmentsNote", "testResult", "첨부파일 안내", "테스트 관련 스크린샷, 문서 등을 첨부할 수 있습니다.");

        // JIRA 연동
        createTranslationKeyIfNotExists("testResult.form.jiraIntegration", "testResult", "JIRA 연동", "JIRA 연동");
        createTranslationKeyIfNotExists("testResult.form.jiraIssueId", "testResult", "JIRA 이슈 ID", "JIRA 이슈 ID");
        createTranslationKeyIfNotExists("testResult.form.jiraIssuePlaceholder", "testResult", "JIRA 이슈 ID 입력란", "예: TEST-123");
        createTranslationKeyIfNotExists("testResult.form.jiraComment", "testResult", "JIRA 코멘트", "JIRA 코멘트로 추가");
        createTranslationKeyIfNotExists("testResult.form.jiraDetected", "testResult", "JIRA 이슈 감지", "비고에서 JIRA 이슈가 감지되었습니다. 자동으로 연결하시겠습니까?");
        createTranslationKeyIfNotExists("testResult.form.jiraDetectedShort", "testResult", "JIRA 이슈 감지 짧은 메시지", "JIRA 이슈 감지됨");
        createTranslationKeyIfNotExists("testResult.jira.connectionCheckFailed", "testResult", "JIRA 연결 실패", "JIRA 연결 상태 확인 실패:");
        createTranslationKeyIfNotExists("testResult.jira.placeholder", "testResult", "JIRA 입력란 도움말", "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)");
        createTranslationKeyIfNotExists("testResult.jira.detectedIssues", "testResult", "감지된 이슈", "감지된 이슈");

        // 파일 에러 메시지
        createTranslationKeyIfNotExists("testResult.file.sizeError", "testResult", "파일 크기 오류", "파일 크기는 10MB 이하여야 합니다");
        createTranslationKeyIfNotExists("testResult.file.typeError", "testResult", "파일 형식 오류", "허용되지 않은 파일 형식입니다");
        createTranslationKeyIfNotExists("testResult.file.allowedFormats", "testResult", "허용 파일 형식", "허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)");
        createTranslationKeyIfNotExists("testResult.file.newAttachmentsCount", "testResult", "새 첨부파일 개수", "새로 첨부할 파일 ({count}개)");
        createTranslationKeyIfNotExists("testResult.file.attachedFilesCount", "testResult", "첨부된 파일 개수", "첨부된 파일 ({count}개)");
        createTranslationKeyIfNotExists("testResult.file.saveToViewAttachments", "testResult", "첨부파일 저장 안내", "테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다.");

        // 에러 메시지
        createTranslationKeyIfNotExists("testResult.error.saveFailed", "testResult", "저장 실패", "결과 저장에 실패했습니다.");
        createTranslationKeyIfNotExists("testResult.error.testCaseLoadFailed", "testResult", "테스트케이스 로드 실패", "테스트케이스를 불러오지 못했습니다.");
        createTranslationKeyIfNotExists("testResult.error.resultRequired", "testResult", "결과 필수", "테스트 결과를 선택해주세요.");

        // 공통 버튼
        createTranslationKeyIfNotExists("common.button.save", "common", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("common.button.cancel", "common", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.button.close", "common", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("common.button.refresh", "common", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("common.button.retry", "common", "다시 시도 버튼", "다시 시도");
        createTranslationKeyIfNotExists("common.empty", "common", "빈 값", "-");

        // 테스트 결과 상태
        createTranslationKeyIfNotExists("testResult.status.pass", "testResult", "성공 상태", "성공");
        createTranslationKeyIfNotExists("testResult.status.fail", "testResult", "실패 상태", "실패");
        createTranslationKeyIfNotExists("testResult.status.blocked", "testResult", "차단됨 상태", "차단됨");
        createTranslationKeyIfNotExists("testResult.status.notRun", "testResult", "미실행 상태", "미실행");
        createTranslationKeyIfNotExists("testResult.status.error", "testResult", "에러 상태", "에러");

        // 테스트 결과 테이블
        createTranslationKeyIfNotExists("testResult.table.title", "testResult", "테이블 제목", "테스트 결과 상세 목록");
        createTranslationKeyIfNotExists("testResult.table.resultCount", "testResult", "결과 개수", "개의 테스트 결과");
        createTranslationKeyIfNotExists("testResult.table.filtered", "testResult", "필터됨", "필터됨");
        createTranslationKeyIfNotExists("testResult.table.loadError", "testResult", "테이블 로드 에러", "테스트 결과를 불러올 수 없습니다");

        // 테스트 결과 차트
        createTranslationKeyIfNotExists("testResult.chart.distribution", "testResult", "차트 분포", "테스트 결과 분포");
        createTranslationKeyIfNotExists("testResult.chart.loading", "testResult", "차트 로딩", "차트 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("testResult.chart.noData", "testResult", "차트 데이터 없음", "차트 데이터가 없습니다.");
        createTranslationKeyIfNotExists("testResult.chart.total", "testResult", "차트 총계", "총 테스트 케이스: {total}건");
        createTranslationKeyIfNotExists("testResult.chart.compareTitle", "testResult", "차트 비교 제목", "테스트 결과 비교");
        createTranslationKeyIfNotExists("testResult.chart.percentageView", "testResult", "퍼센트 보기", "퍼센트 보기");
        createTranslationKeyIfNotExists("testResult.chart.tooltip", "testResult", "차트 툴팁", "테스트 플랜별 또는 실행자별 결과를 비교합니다.");
        createTranslationKeyIfNotExists("testResult.chart.yAxisCount", "testResult", "Y축 개수", "개수 (건)");
        createTranslationKeyIfNotExists("testResult.chart.yAxisPercent", "testResult", "Y축 비율", "비율 (%)");
        createTranslationKeyIfNotExists("testResult.chart.compareItems", "testResult", "비교 항목", "총 {count}개 항목 비교");
        createTranslationKeyIfNotExists("testResult.chart.loadingData", "testResult", "차트 데이터 로딩", "차트 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("testResult.chart.noCompareData", "testResult", "비교 데이터 없음", "비교할 데이터가 없습니다.");

        // 테스트 결과 통계 카드
        createTranslationKeyIfNotExists("testResult.statistics.title", "testResult", "통계 제목", "테스트 결과 통계");
        createTranslationKeyIfNotExists("testResult.statistics.loading", "testResult", "통계 로딩", "로딩 중...");
        createTranslationKeyIfNotExists("testResult.statistics.error", "testResult", "통계 에러", "에러: {error}");
        createTranslationKeyIfNotExists("testResult.statistics.noData", "testResult", "통계 데이터 없음", "데이터 없음");
        createTranslationKeyIfNotExists("testResult.statistics.successRate", "testResult", "성공률", "성공률");
        createTranslationKeyIfNotExists("testResult.statistics.totalTests", "testResult", "총 테스트", "총 테스트");
        createTranslationKeyIfNotExists("testResult.statistics.totalCount", "testResult", "총 개수", "총 {count}건");

        // 테스트 결과 파이차트
        createTranslationKeyIfNotExists("testResult.pieChart.title", "testResult", "파이차트 제목", "테스트 결과 분포");
        createTranslationKeyIfNotExists("testResult.pieChart.loading", "testResult", "파이차트 로딩", "차트 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("testResult.pieChart.noData", "testResult", "파이차트 데이터 없음", "차트 데이터가 없습니다.");
        createTranslationKeyIfNotExists("testResult.pieChart.count", "testResult", "개수", "개수");
        createTranslationKeyIfNotExists("testResult.pieChart.percentage", "testResult", "비율", "비율");
        createTranslationKeyIfNotExists("testResult.pieChart.totalTestCases", "testResult", "총 테스트케이스", "총 테스트 케이스: {total}건");

        // 통계 필터 패널
        createTranslationKeyIfNotExists("testResult.filter.title", "testResult", "필터 제목", "통계 필터");
        createTranslationKeyIfNotExists("testResult.filter.applied", "testResult", "필터 적용됨", "{count}개 적용");
        createTranslationKeyIfNotExists("testResult.filter.refresh", "testResult", "새로고침", "새로고침");
        createTranslationKeyIfNotExists("testResult.filter.refreshTooltip", "testResult", "새로고침 툴팁", "데이터 새로고침");
        createTranslationKeyIfNotExists("testResult.filter.apply", "testResult", "필터 적용", "필터 적용");
        createTranslationKeyIfNotExists("testResult.filter.clear", "testResult", "초기화", "초기화");
        createTranslationKeyIfNotExists("testResult.filter.clearTooltip", "testResult", "초기화 툴팁", "모든 필터 초기화");
        createTranslationKeyIfNotExists("testResult.filter.testPlan", "testResult", "테스트 플랜", "테스트 플랜");
        createTranslationKeyIfNotExists("testResult.filter.allPlans", "testResult", "전체 플랜", "전체 플랜");
        createTranslationKeyIfNotExists("testResult.filter.testExecution", "testResult", "테스트 실행", "테스트 실행");
        createTranslationKeyIfNotExists("testResult.filter.allExecutions", "testResult", "전체 실행", "전체 실행");
        createTranslationKeyIfNotExists("testResult.filter.allView", "testResult", "전체 보기", "전체 보기");
        createTranslationKeyIfNotExists("testResult.filter.errorLoadPlans", "testResult", "플랜 로드 오류", "테스트 플랜 목록을 불러올 수 없습니다.");
        createTranslationKeyIfNotExists("testResult.filter.period", "testResult", "기간", "기간");
        createTranslationKeyIfNotExists("testResult.filter.allPeriod", "testResult", "전체 기간", "전체 기간");
        createTranslationKeyIfNotExists("testResult.filter.today", "testResult", "오늘", "오늘");
        createTranslationKeyIfNotExists("testResult.filter.week", "testResult", "최근 1주", "최근 1주");
        createTranslationKeyIfNotExists("testResult.filter.month", "testResult", "최근 1개월", "최근 1개월");
        createTranslationKeyIfNotExists("testResult.filter.quarter", "testResult", "최근 3개월", "최근 3개월");
        createTranslationKeyIfNotExists("testResult.filter.viewType", "testResult", "보기 형태", "보기 형태");
        createTranslationKeyIfNotExists("testResult.filter.overviewView", "testResult", "전체 개요", "전체 개요");
        createTranslationKeyIfNotExists("testResult.filter.planView", "testResult", "플랜별 비교", "플랜별 비교");
        createTranslationKeyIfNotExists("testResult.filter.executorView", "testResult", "실행자별 비교", "실행자별 비교");
        createTranslationKeyIfNotExists("testResult.filter.activeFilters", "testResult", "적용 중인 필터", "적용 중인 필터:");
        createTranslationKeyIfNotExists("testResult.filter.planPrefix", "testResult", "플랜 접두사", "플랜:");
        createTranslationKeyIfNotExists("testResult.filter.executionPrefix", "testResult", "실행 접두사", "실행:");
        createTranslationKeyIfNotExists("testResult.filter.periodPrefix", "testResult", "기간 접두사", "기간:");

        // JIRA 상태 요약 카드
        createTranslationKeyIfNotExists("jira.summary.title", "jira", "JIRA 상태 요약 제목", "JIRA 상태 요약");
        createTranslationKeyIfNotExists("jira.summary.loading", "jira", "JIRA 로딩", "JIRA 상태 정보를 불러오는 중...");
        createTranslationKeyIfNotExists("jira.summary.error", "jira", "JIRA 에러", "JIRA 상태 정보를 불러오는데 실패했습니다: {error}");
        createTranslationKeyIfNotExists("jira.summary.noData", "jira", "JIRA 데이터 없음", "연결된 JIRA 이슈가 없습니다.");
        createTranslationKeyIfNotExists("jira.summary.filterAll", "jira", "전체 필터", "전체");
        createTranslationKeyIfNotExists("jira.summary.filterActive", "jira", "진행중 필터", "진행중");
        createTranslationKeyIfNotExists("jira.summary.filterFailed", "jira", "실패 필터", "실패");
        createTranslationKeyIfNotExists("jira.summary.filterPassed", "jira", "통과 필터", "통과");
        createTranslationKeyIfNotExists("jira.summary.refresh", "jira", "새로고침", "새로고침");
        createTranslationKeyIfNotExists("jira.summary.testResult", "jira", "테스트 결과", "테스트 결과 ({count}개)");
        createTranslationKeyIfNotExists("jira.summary.latestTest", "jira", "최근 테스트", "최근 테스트:");
        createTranslationKeyIfNotExists("jira.summary.executionTime", "jira", "실행 시간", "실행 시간:");
        createTranslationKeyIfNotExists("jira.summary.sync", "jira", "동기화", "동기화:");
        createTranslationKeyIfNotExists("jira.summary.summaryStats", "jira", "요약 통계", "요약 통계");
        createTranslationKeyIfNotExists("jira.summary.totalIssues", "jira", "전체 이슈", "전체 이슈");
        createTranslationKeyIfNotExists("jira.summary.activeIssues", "jira", "활성 이슈", "활성 이슈");
        createTranslationKeyIfNotExists("jira.summary.allPassed", "jira", "전체 통과", "전체 통과");
        createTranslationKeyIfNotExists("jira.summary.hasFailed", "jira", "실패 포함", "실패 포함");

        // JIRA 상태 및 메시지 관련 키
        createTranslationKeyIfNotExists("jira.status.connectionStatus", "jira", "JIRA 연결 상태", "JIRA 연결 상태");
        createTranslationKeyIfNotExists("jira.status.notConfigured", "jira", "JIRA 미설정", "JIRA 미설정");
        createTranslationKeyIfNotExists("jira.messages.noConfig", "jira", "JIRA 설정 없음 메시지", "JIRA 설정이 없습니다. 설정 페이지에서 JIRA 서버 정보를 등록해주세요.");
        createTranslationKeyIfNotExists("common.buttons.refresh", "common", "새로고침 버튼", "새로고침");

        // TestResultStatisticsDashboard 번역 키들
        createTranslationKeyIfNotExists("testResultDashboard.chart.planComparison", "testResult", "테스트 플랜별 결과 비교", "테스트 플랜별 결과 비교");
        createTranslationKeyIfNotExists("testResultDashboard.chart.executorComparison", "testResult", "실행자별 결과 비교", "실행자별 결과 비교");
        createTranslationKeyIfNotExists("testResultDashboard.summary.title", "testResult", "통계 요약 제목", "통계 요약");
        createTranslationKeyIfNotExists("testResultDashboard.summary.executionRate", "testResult", "실행률", "실행률");
        createTranslationKeyIfNotExists("testResultDashboard.summary.successRate", "testResult", "성공률", "성공률");
        createTranslationKeyIfNotExists("testResultDashboard.summary.jiraLinkRate", "testResult", "JIRA 연동률", "JIRA 연동률");
        createTranslationKeyIfNotExists("testResultDashboard.summary.lastUpdated", "testResult", "최종 업데이트", "최종 업데이트");
        createTranslationKeyIfNotExists("testResultDashboard.summary.unknown", "testResult", "알 수 없음", "알 수 없음");

        // TestResultTrendAnalysis 번역 키들
        createTranslationKeyIfNotExists("testTrendAnalysis.error.comparisonLoadFailed", "testResult", "비교 데이터 로드 실패", "비교 데이터를 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("testTrendAnalysis.error.trendLoadFailed", "testResult", "추이 데이터 로드 실패", "추이 데이터를 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("testTrendAnalysis.loading.trendData", "testResult", "추이 데이터 로딩", "추이 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("testTrendAnalysis.noData.title", "testResult", "추이 데이터 없음 제목", "추이 데이터가 없습니다");
        createTranslationKeyIfNotExists("testTrendAnalysis.noData.description", "testResult", "추이 데이터 없음 설명", "선택한 기간 동안의 테스트 실행 기록이 없습니다.");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.label", "testResult", "기간 라벨", "기간");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.last7days", "testResult", "최근 7일", "최근 7일");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.last15days", "testResult", "최근 15일", "최근 15일");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.last30days", "testResult", "최근 30일", "최근 30일");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.last60days", "testResult", "최근 60일", "최근 60일");
        createTranslationKeyIfNotExists("testTrendAnalysis.period.last90days", "testResult", "최근 90일", "최근 90일");
        createTranslationKeyIfNotExists("testTrendAnalysis.chartType.line", "testResult", "라인 차트", "라인");
        createTranslationKeyIfNotExists("testTrendAnalysis.chartType.area", "testResult", "영역 차트", "영역");
        createTranslationKeyIfNotExists("testTrendAnalysis.summary.avgSuccessRate", "testResult", "평균 성공률", "평균 성공률");
        createTranslationKeyIfNotExists("testTrendAnalysis.summary.avgCompletionRate", "testResult", "평균 완료율", "평균 완료율");
        createTranslationKeyIfNotExists("testTrendAnalysis.summary.dataPoints", "testResult", "데이터 포인트", "데이터 포인트");
        createTranslationKeyIfNotExists("testTrendAnalysis.summary.successRateChange", "testResult", "성공률 변화", "성공률 변화");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.overallTrend", "testResult", "전체 추이", "테스트 결과 변화 추이");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.testPlanComparison", "testResult", "테스트 플랜 비교", "테스트 플랜별 결과 비교");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.assigneeComparison", "testResult", "실행자 비교", "실행자별 결과 비교");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.successAndCompletionRate", "testResult", "성공률 및 완료율 추이", "성공률 및 완료율 추이");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.successRate", "testResult", "성공률", "성공률");
        createTranslationKeyIfNotExists("testTrendAnalysis.chart.completionRate", "testResult", "완료율", "완료율");
        createTranslationKeyIfNotExists("testTrendAnalysis.tooltip.overallSuccessRate", "testResult", "전체 성공률", "전체 성공률");
        createTranslationKeyIfNotExists("testTrendAnalysis.tooltip.plan", "testResult", "플랜", "Plan");
        createTranslationKeyIfNotExists("testTrendAnalysis.tooltip.user", "testResult", "사용자", "User");
        createTranslationKeyIfNotExists("testTrendAnalysis.tooltip.unit", "testResult", "건", "건");
        createTranslationKeyIfNotExists("testTrendAnalysis.legend.overallSuccessRate", "testResult", "전체 성공률", "전체 성공률");
        createTranslationKeyIfNotExists("testTrendAnalysis.legend.plan", "testResult", "플랜", "Plan");
        createTranslationKeyIfNotExists("testTrendAnalysis.legend.user", "testResult", "사용자", "User");
        createTranslationKeyIfNotExists("testTrendAnalysis.prompt.selectTestPlan", "testResult", "테스트 플랜 선택 프롬프트", "비교할 테스트 플랜을 선택해주세요");
        createTranslationKeyIfNotExists("testTrendAnalysis.prompt.selectAssignee", "testResult", "실행자 선택 프롬프트", "비교할 실행자를 선택해주세요");

        // 테스트 결과 메시지 키들 (누락된 키들)
        createTranslationKeyIfNotExists("testResult.message.error", "testResult", "테스트 결과 오류 메시지", "오류가 발생했습니다");
        createTranslationKeyIfNotExists("testResult.message.deleteFailed", "testResult", "테스트 결과 삭제 실패 메시지", "삭제에 실패했습니다");

        // JIRA 오류 관련 키들 (누락된 키들)
        createTranslationKeyIfNotExists("jira.error.saveFailed", "jira", "JIRA 저장 실패", "저장에 실패했습니다");
        createTranslationKeyIfNotExists("jira.error.deleteFailed", "jira", "JIRA 삭제 실패", "삭제에 실패했습니다");
        createTranslationKeyIfNotExists("jira.error.network", "jira", "JIRA 네트워크 오류", "네트워크 연결 오류");
        createTranslationKeyIfNotExists("jira.error.authentication", "jira", "JIRA 인증 오류", "인증에 실패했습니다");
        createTranslationKeyIfNotExists("jira.error.encryption", "jira", "JIRA 암호화 오류", "암호화 처리 오류");

        log.info("테스트 결과 번역 키 초기화 완료");
        createTranslationKeyIfNotExists("testResult.message.exportSuccess", "testResult", "CSV 내보내기 성공 메시지", "CSV 파일이 성공적으로 내보내졌습니다.");
        createTranslationKeyIfNotExists("testResult.message.exportFailed", "testResult", "CSV 내보내기 실패 메시지", "CSV 내보내기에 실패했습니다.");

        // 컬럼 순서 변경 다이얼로그
        createTranslationKeyIfNotExists("testResult.orderDialog.title", "testResult", "컬럼 순서 변경 다이얼로그 제목", "컬럼 순서 변경");
        createTranslationKeyIfNotExists("testResult.orderDialog.description", "testResult", "컬럼 순서 변경 다이얼로그 설명", "위/아래 화살표 버튼을 사용하여 컬럼 순서를 변경하세요");
        createTranslationKeyIfNotExists("testResult.orderDialog.visible", "testResult", "표시 상태 라벨", "표시");
        createTranslationKeyIfNotExists("testResult.orderDialog.hidden", "testResult", "숨김 상태 라벨", "숨김");
        createTranslationKeyIfNotExists("testResult.orderDialog.cancel", "testResult", "컬럼 순서 변경 취소 버튼", "취소");
        createTranslationKeyIfNotExists("testResult.orderDialog.apply", "testResult", "컬럼 순서 변경 적용 버튼", "순서 적용");

        // 테스트 결과 내보내기 다이얼로그 번역 키들
        createTranslationKeyIfNotExists("testResult.export.dialog.title", "testResult", "내보내기 다이얼로그 제목", "테스트 결과 내보내기");
        createTranslationKeyIfNotExists("testResult.export.section.format", "testResult", "형식 선택 섹션 제목", "📄 내보내기 형식 선택");
        createTranslationKeyIfNotExists("testResult.export.section.info", "testResult", "정보 섹션 제목", "📋 내보내기 정보");

        // Excel 형식
        createTranslationKeyIfNotExists("testResult.export.format.excel.title", "testResult", "Excel 형식 제목", "Excel (.xlsx)");
        createTranslationKeyIfNotExists("testResult.export.format.excel.description", "testResult", "Excel 형식 설명", "서식과 차트 포함, 업무용 보고서에 최적");
        createTranslationKeyIfNotExists("testResult.export.format.excel.feature1", "testResult", "Excel 기능1", "통계 차트 포함");
        createTranslationKeyIfNotExists("testResult.export.format.excel.feature2", "testResult", "Excel 기능2", "서식 유지");
        createTranslationKeyIfNotExists("testResult.export.format.excel.feature3", "testResult", "Excel 기능3", "필터링 가능");
        createTranslationKeyIfNotExists("testResult.export.format.excel.alert", "testResult", "Excel 알림 메시지", "💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.");

        // PDF 형식
        createTranslationKeyIfNotExists("testResult.export.format.pdf.title", "testResult", "PDF 형식 제목", "PDF (.pdf)");
        createTranslationKeyIfNotExists("testResult.export.format.pdf.description", "testResult", "PDF 형식 설명", "인쇄 및 공유용, 레이아웃 고정");
        createTranslationKeyIfNotExists("testResult.export.format.pdf.feature1", "testResult", "PDF 기능1", "인쇄 최적화");
        createTranslationKeyIfNotExists("testResult.export.format.pdf.feature2", "testResult", "PDF 기능2", "레이아웃 고정");
        createTranslationKeyIfNotExists("testResult.export.format.pdf.feature3", "testResult", "PDF 기능3", "범용 호환성");
        createTranslationKeyIfNotExists("testResult.export.format.pdf.alert", "testResult", "PDF 알림 메시지", "🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.");

        // CSV 형식
        createTranslationKeyIfNotExists("testResult.export.format.csv.title", "testResult", "CSV 형식 제목", "CSV (.csv)");
        createTranslationKeyIfNotExists("testResult.export.format.csv.description", "testResult", "CSV 형식 설명", "데이터 분석용, 가벼운 파일 크기");
        createTranslationKeyIfNotExists("testResult.export.format.csv.feature1", "testResult", "CSV 기능1", "데이터 분석 최적");
        createTranslationKeyIfNotExists("testResult.export.format.csv.feature2", "testResult", "CSV 기능2", "가벼운 용량");
        createTranslationKeyIfNotExists("testResult.export.format.csv.feature3", "testResult", "CSV 기능3", "호환성 우수");
        createTranslationKeyIfNotExists("testResult.export.format.csv.alert", "testResult", "CSV 알림 메시지", "📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.");

        // 내보내기 정보
        createTranslationKeyIfNotExists("testResult.export.info.totalRows", "testResult", "총 데이터 건수 라벨", "📊 총 데이터 건수:");
        createTranslationKeyIfNotExists("testResult.export.info.totalRowsValue", "testResult", "총 데이터 건수 값", "{count}건");
        createTranslationKeyIfNotExists("testResult.export.info.columns", "testResult", "표시 컬럼 수 라벨", "🔍 표시 컬럼 수:");
        createTranslationKeyIfNotExists("testResult.export.info.columnsValue", "testResult", "표시 컬럼 수 값", "{count}개");
        createTranslationKeyIfNotExists("testResult.export.info.columnsList", "testResult", "내보낼 컬럼 리스트 라벨", "📂 내보낼 컬럼:");

        // 내보내기 진행 및 버튼
        createTranslationKeyIfNotExists("testResult.export.progress.message", "testResult", "내보내기 진행 메시지", "파일을 생성하고 있습니다... 잠시만 기다려주세요");
        createTranslationKeyIfNotExists("testResult.export.button.cancel", "testResult", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testResult.export.button.export", "testResult", "내보내기 버튼", "{format} 내보내기");
        createTranslationKeyIfNotExists("testResult.export.button.exporting", "testResult", "내보내는 중 버튼", "생성 중...");

        // 내보내기 오류 메시지
        createTranslationKeyIfNotExists("testResult.export.error.noProject", "testResult", "프로젝트 미선택 오류", "프로젝트가 선택되지 않았습니다.");
        createTranslationKeyIfNotExists("testResult.export.error.failed", "testResult", "내보내기 실패 오류", "파일 내보내기 중 오류가 발생했습니다: {message}");
        createTranslationKeyIfNotExists("testResult.export.error.response", "testResult", "응답 오류", "내보내기 실패: {status} {statusText}");

        // JUnit 결과 대시보드 - 빈 상태 메시지
        createTranslationKeyIfNotExists("junit.empty.noResults", "testResult", "테스트 결과 없음 메시지", "테스트 결과가 없습니다");
        createTranslationKeyIfNotExists("junit.empty.uploadPrompt", "testResult", "업로드 안내 메시지", "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.");
        createTranslationKeyIfNotExists("junit.empty.firstUpload", "testResult", "첫 업로드 버튼", "첫 번째 테스트 결과 업로드");

        // JUnit 업로드 다이얼로그 번역 키들
        createTranslationKeyIfNotExists("junit.upload.fileSize", "testResult", "파일 크기 라벨", "크기");
        createTranslationKeyIfNotExists("junit.upload.changeFile", "testResult", "파일 변경 버튼", "다른 파일 선택");
        createTranslationKeyIfNotExists("junit.upload.executionInfo", "testResult", "실행 정보 라벨", "테스트 실행 정보");
        createTranslationKeyIfNotExists("junit.placeholder.description", "testResult", "설명 입력란", "설명 (선택사항)");
        createTranslationKeyIfNotExists("junit.upload.uploadingFile", "testResult", "파일 업로드 중 메시지", "\"{fileName}\" 업로드 중...");
        createTranslationKeyIfNotExists("junit.upload.max", "testResult", "최대 라벨", "최대");

        // JUnit 상세 페이지 번역 키들
        createTranslationKeyIfNotExists("junit.detail.upload", "testResult", "업로드 라벨", "Upload");
        createTranslationKeyIfNotExists("junit.detail.unknownUploader", "testResult", "알 수 없는 업로더", "알 수 없음");

        // JUnit 테스트 케이스 에디터 번역 키들
        createTranslationKeyIfNotExists("junit.editor.title", "testResult", "에디터 제목", "테스트 케이스 편집");
        createTranslationKeyIfNotExists("junit.editor.viewMode", "testResult", "보기 모드", "(보기 모드)");
        createTranslationKeyIfNotExists("junit.editor.editMode", "testResult", "편집 모드", "(편집 모드)");
        createTranslationKeyIfNotExists("junit.editor.viewOriginalData", "testResult", "원본 데이터 보기 툴팁", "원본 데이터 보기");
        createTranslationKeyIfNotExists("junit.editor.editHistory", "testResult", "편집 이력 툴팁", "편집 이력");

        // 상태 설명
        createTranslationKeyIfNotExists("junit.editor.status.passedDesc", "testResult", "통과 상태 설명", "테스트가 성공적으로 통과했습니다");
        createTranslationKeyIfNotExists("junit.editor.status.failedDesc", "testResult", "실패 상태 설명", "테스트가 실패했습니다");
        createTranslationKeyIfNotExists("junit.editor.status.errorDesc", "testResult", "오류 상태 설명", "테스트 실행 중 오류가 발생했습니다");
        createTranslationKeyIfNotExists("junit.editor.status.skippedDesc", "testResult", "건너뛴 상태 설명", "테스트가 건너뛰어졌습니다");

        // 우선순위
        createTranslationKeyIfNotExists("junit.editor.priority.high", "testResult", "높은 우선순위", "높음");
        createTranslationKeyIfNotExists("junit.editor.priority.medium", "testResult", "보통 우선순위", "보통");
        createTranslationKeyIfNotExists("junit.editor.priority.low", "testResult", "낮은 우선순위", "낮음");

        // 태그 및 노트
        createTranslationKeyIfNotExists("junit.editor.tags", "testResult", "태그 라벨", "태그");
        createTranslationKeyIfNotExists("junit.editor.tagsPlaceholder", "testResult", "태그 입력란", "쉼표로 구분하여 입력 (예: 버그, 회귀테스트, API)");
        createTranslationKeyIfNotExists("junit.editor.tagsHelp", "testResult", "태그 도움말", "쉼표로 구분하여 여러 태그를 입력할 수 있습니다");
        createTranslationKeyIfNotExists("junit.editor.notes", "testResult", "노트 라벨", "노트");
        createTranslationKeyIfNotExists("junit.editor.notesPlaceholder", "testResult", "노트 입력란", "테스트 케이스에 대한 추가 메모를 입력하세요");

        // 미리보기 및 버튼
        createTranslationKeyIfNotExists("junit.editor.preview", "testResult", "미리보기 제목", "미리보기");
        createTranslationKeyIfNotExists("junit.editor.saving", "testResult", "저장 중", "저장 중...");

        // 오류 메시지
        createTranslationKeyIfNotExists("junit.editor.error.noTestCase", "testResult", "테스트 케이스 없음 오류", "테스트 케이스를 찾을 수 없습니다");
        createTranslationKeyIfNotExists("junit.editor.error.saveFailed", "testResult", "저장 실패 오류", "테스트 케이스 저장에 실패했습니다");
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