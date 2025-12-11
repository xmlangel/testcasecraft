// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTestResultTranslations.java
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
 * 한국어 번역 - 테스트 결과 관련
 * testResult.* 관련 번역들
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanTestResultTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                createTranslationIfNotExists("testResult.mainPage.title", languageCode, "테스트 결과", createdBy);
                createTranslationIfNotExists("testResult.mainPage.description", languageCode,
                                "프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testResult.tab.statistics", languageCode, "통계", createdBy);
                createTranslationIfNotExists("testResult.tab.statisticsFull", languageCode, "통계 대시보드", createdBy);
                createTranslationIfNotExists("testResult.tab.statisticsDescription", languageCode,
                                "Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악할 수 있습니다", createdBy);
                createTranslationIfNotExists("testResult.tab.trend", languageCode, "추이", createdBy);
                createTranslationIfNotExists("testResult.tab.trendFull", languageCode, "추이 분석", createdBy);
                createTranslationIfNotExists("testResult.tab.trendDescription", languageCode,
                                "테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석이 가능합니다", createdBy);
                createTranslationIfNotExists("testResult.tab.table", languageCode, "테이블", createdBy);
                createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "상세 테이블", createdBy);
                createTranslationIfNotExists("testResult.tab.tableDescription", languageCode,
                                "전체 테스트 결과를 테이블 형태로 상세하게 확인할 수 있습니다", createdBy);
                createTranslationIfNotExists("testResult.tab.report", languageCode, "리포트", createdBy);
                createTranslationIfNotExists("testResult.tab.reportFull", languageCode, "상세 리포트", createdBy);
                createTranslationIfNotExists("testResult.tab.reportDescription", languageCode,
                                "폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리를 지원합니다", createdBy);
                createTranslationIfNotExists("testResult.form.title", languageCode, "테스트 결과 입력", createdBy);
                createTranslationIfNotExists("testResult.form.testResult", languageCode, "테스트 결과", createdBy);
                createTranslationIfNotExists("testResult.form.preCondition", languageCode, "사전 조건", createdBy);
                createTranslationIfNotExists("testResult.form.testSteps", languageCode, "테스트 단계", createdBy);
                createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "기대 결과", createdBy);
                createTranslationIfNotExists("testResult.form.postCondition", languageCode, "사후조건", createdBy);
                createTranslationIfNotExists("testResult.form.automationStatus", languageCode, "자동화 여부", createdBy);
                createTranslationIfNotExists("testResult.form.automated", languageCode, "자동화", createdBy);
                createTranslationIfNotExists("testResult.form.manual", languageCode, "수동", createdBy);
                createTranslationIfNotExists("testResult.form.executionType", languageCode, "실행 타입", createdBy);
                createTranslationIfNotExists("testResult.form.tags", languageCode, "태그", createdBy);
                createTranslationIfNotExists("testResult.form.testTechnique", languageCode, "테스트 기법", createdBy);
                createTranslationIfNotExists("testResult.form.notes", languageCode, "노트", createdBy);
                createTranslationIfNotExists("testResult.form.notesPlaceholder", languageCode, "노트 ({length}/10,000)",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesHelp", languageCode,
                                "테스트 과정에서 발견한 특이사항이나 추가 정보를 기록해주세요.",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode, "{remaining}자 남음",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitError", languageCode,
                                "10,000자를 초과했습니다. 긴 내용은 파일로 첨부해주세요.", createdBy);
                createTranslationIfNotExists("testResult.form.notesFileRecommendation", languageCode,
                                "긴 내용은 파일 첨부를 권장합니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.form.mode.text", languageCode, "텍스트", createdBy);
                createTranslationIfNotExists("testResult.form.mode.markdown", languageCode, "Markdown", createdBy);
                createTranslationIfNotExists("testResult.form.mode.switch", languageCode, "모드 전환", createdBy);
                createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "파일 첨부", createdBy);
                createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "파일 선택", createdBy);
                createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "업로드 중...", createdBy);
                createTranslationIfNotExists("testResult.form.fileFormat", languageCode,
                                "허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)", createdBy);
                createTranslationIfNotExists("testResult.form.newAttachments", languageCode, "새로 첨부할 파일 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testResult.form.attachments", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testResult.form.attachmentsNote", languageCode,
                                "테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA 이슈 연동", createdBy);
                createTranslationIfNotExists("testResult.form.jiraIssueId", languageCode, "JIRA 이슈 ID (예: ICT-123)",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraIssuePlaceholder", languageCode,
                                "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)", createdBy);
                createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA 코멘트", createdBy);
                createTranslationIfNotExists("testResult.form.jiraDetected", languageCode, "감지된 이슈: {issues}",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraDetectedShort", languageCode, "감지: {issues}",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.connectionCheckFailed", languageCode, "JIRA 연결 상태 확인 실패:",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.placeholder", languageCode,
                                "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.detectedIssues", languageCode, "감지된 이슈", createdBy);
                createTranslationIfNotExists("testResult.jira.issueIdLabel", languageCode, "JIRA 이슈 ID (예: ICT-123)",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.issueIdPlaceholder", languageCode,
                                "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)", createdBy);
                createTranslationIfNotExists("testResult.jira.invalidFormat", languageCode,
                                "올바른 JIRA 이슈 키 형식이 아닙니다 (예: ICT-123)", createdBy);
                createTranslationIfNotExists("testResult.jira.autoUppercase", languageCode, "입력된 키가 자동으로 대문자로 변환됩니다",
                                createdBy);
                createTranslationIfNotExists("testResult.file.sizeError", languageCode, "파일 크기는 10MB 이하여야 합니다",
                                createdBy);
                createTranslationIfNotExists("testResult.file.typeError", languageCode, "허용되지 않은 파일 형식입니다", createdBy);
                createTranslationIfNotExists("testResult.file.allowedFormats", languageCode,
                                "허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)", createdBy);
                createTranslationIfNotExists("testResult.file.newAttachmentsCount", languageCode,
                                "새로 첨부할 파일 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testResult.file.attachedFilesCount", languageCode, "첨부된 파일 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testResult.file.saveToViewAttachments", languageCode,
                                "테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "결과 저장에 실패했습니다.", createdBy);
                createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "테스트케이스를 불러오지 못했습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "테스트 결과를 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("testResult.status.pass", languageCode, "성공", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "실패", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "차단됨", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "미실행", createdBy);
                createTranslationIfNotExists("testResult.status.error", languageCode, "에러", createdBy);
                createTranslationIfNotExists("testResult.table.title", languageCode, "테스트 결과 상세 목록", createdBy);
                createTranslationIfNotExists("testResult.table.resultCount", languageCode, "개의 테스트 결과", createdBy);
                createTranslationIfNotExists("testResult.table.filtered", languageCode, "필터됨", createdBy);
                createTranslationIfNotExists("testResult.table.loadError", languageCode, "테스트 결과를 불러올 수 없습니다",
                                createdBy);

                // 테스트 결과 상태 (확장)
                createTranslationIfNotExists("testResult.status.pass", languageCode, "성공", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "실패", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "차단됨", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "미실행", createdBy);
                createTranslationIfNotExists("testResult.status.error", languageCode, "에러", createdBy);
                createTranslationIfNotExists("testResult.status.skipped", languageCode, "건너뜀", createdBy);
                createTranslationIfNotExists("testResult.status.untested", languageCode, "미테스트", createdBy);
                createTranslationIfNotExists("testResult.status.retest", languageCode, "재테스트", createdBy);
                createTranslationIfNotExists("testResult.status.final", languageCode, "완료", createdBy);

                // 테스트 결과 버튼 (확장)
                createTranslationIfNotExists("testResult.button.jiraStatusCheck", languageCode, "JIRA 상태 체크",
                                createdBy);
                createTranslationIfNotExists("testResult.button.column", languageCode, "컬럼", createdBy);
                createTranslationIfNotExists("testResult.button.order", languageCode, "순서", createdBy);
                createTranslationIfNotExists("testResult.button.export", languageCode, "내보내기", createdBy);
                createTranslationIfNotExists("testResult.button.advancedExport", languageCode, "고급 내보내기", createdBy);
                createTranslationIfNotExists("testResult.button.viewDetail", languageCode, "상세보기", createdBy);
                createTranslationIfNotExists("testResult.button.edit", languageCode, "편집", createdBy);

                // 컬럼 표시 설정 메뉴
                createTranslationIfNotExists("testResult.columnMenu.title", languageCode, "컬럼 표시 설정", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.description", languageCode, "표시할 컬럼을 선택해주세요",
                                createdBy);
                createTranslationIfNotExists("testResult.columnMenu.showAll", languageCode, "전체 표시", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.showEssential", languageCode, "필수만 표시", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.required", languageCode, "필수 컬럼", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.summary", languageCode,
                                "표시 중: {visible}/{total}개 컬럼", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.tip", languageCode,
                                "팁: 테스트케이스와 결과는 필수 컬럼으로 항상 표시됩니다", createdBy);

                // JIRA 기타
                createTranslationIfNotExists("testResult.jira.status.unknown", languageCode, "알 수 없음", createdBy);

                // 툴팁
                createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "사전설정 없음", createdBy);
                createTranslationIfNotExists("testResult.tooltip.noPostCondition", languageCode, "사후조건 없음", createdBy);
                createTranslationIfNotExists("testResult.steps.empty", languageCode, "스텝 없음", createdBy);
                createTranslationIfNotExists("testResult.steps.description", languageCode, "설명", createdBy);

                // 컬럼 헤더 (확장)
                createTranslationIfNotExists("testResult.column.folder", languageCode, "폴더", createdBy);
                createTranslationIfNotExists("testResult.column.testCase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("testResult.column.result", languageCode, "결과", createdBy);
                createTranslationIfNotExists("testResult.column.preCondition", languageCode, "사전조건", createdBy);
                createTranslationIfNotExists("testResult.column.postCondition", languageCode, "사후조건", createdBy);
                createTranslationIfNotExists("testResult.column.steps", languageCode, "스텝 정보", createdBy);
                createTranslationIfNotExists("testResult.column.linkedDocuments", languageCode, "연결된 RAG 문서",
                                createdBy);
                createTranslationIfNotExists("testResult.column.linkedDocCount", languageCode, "{count}건", createdBy);
                createTranslationIfNotExists("testResult.column.executedBy", languageCode, "실행자", createdBy);
                createTranslationIfNotExists("testResult.column.executedAt", languageCode, "실행일시", createdBy);
                createTranslationIfNotExists("testResult.column.testPlan", languageCode, "테스트플랜", createdBy);
                createTranslationIfNotExists("testResult.column.testExecution", languageCode, "테스트실행", createdBy);
                createTranslationIfNotExists("testResult.column.jiraStatus", languageCode, "JIRA 상태", createdBy);
                createTranslationIfNotExists("testResult.column.actions", languageCode, "작업", createdBy);

                createTranslationIfNotExists("testResult.chart.distribution", languageCode, "테스트 결과 분포", createdBy);
                createTranslationIfNotExists("testResult.chart.loading", languageCode, "차트 데이터를 불러오는 중...", createdBy);
                createTranslationIfNotExists("testResult.chart.noData", languageCode, "차트 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("testResult.chart.total", languageCode, "총 테스트 케이스: {total}건", createdBy);
                createTranslationIfNotExists("testResult.chart.compareTitle", languageCode, "테스트 결과 비교", createdBy);
                createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "퍼센트 보기", createdBy);
                createTranslationIfNotExists("testResult.chart.tooltip", languageCode, "테스트 플랜별 또는 실행자별 결과를 비교합니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "개수 (건)", createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "비율 (%)", createdBy);
                createTranslationIfNotExists("testResult.chart.compareItems", languageCode, "총 {count}개 항목 비교",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "차트 데이터를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "비교할 데이터가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.title", languageCode, "테스트 결과 통계", createdBy);
                createTranslationIfNotExists("testResult.statistics.loading", languageCode, "로딩 중...", createdBy);
                createTranslationIfNotExists("testResult.statistics.error", languageCode, "에러: {error}", createdBy);
                createTranslationIfNotExists("testResult.statistics.noData", languageCode, "데이터 없음", createdBy);
                createTranslationIfNotExists("testResult.statistics.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("testResult.statistics.totalTests", languageCode, "총 테스트", createdBy);
                createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "총 {count}건", createdBy);
                createTranslationIfNotExists("testResult.pieChart.title", languageCode, "테스트 결과 분포", createdBy);
                createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "차트 데이터를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "차트 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("testResult.pieChart.count", languageCode, "개수", createdBy);
                createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "비율", createdBy);
                createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "총 테스트 케이스: {total}건",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.title", languageCode, "통계 필터", createdBy);
                createTranslationIfNotExists("testResult.filter.applied", languageCode, "{count}개 적용", createdBy);
                createTranslationIfNotExists("testResult.filter.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("testResult.filter.refreshTooltip", languageCode, "데이터 새로고침", createdBy);
                createTranslationIfNotExists("testResult.filter.clear", languageCode, "초기화", createdBy);
                createTranslationIfNotExists("testResult.filter.clearTooltip", languageCode, "모든 필터 초기화", createdBy);
                createTranslationIfNotExists("testResult.filter.testPlan", languageCode, "테스트 플랜", createdBy);
                createTranslationIfNotExists("testResult.filter.allPlans", languageCode, "전체 플랜", createdBy);
                createTranslationIfNotExists("testResult.filter.testExecution", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("testResult.filter.allExecutions", languageCode, "전체 실행", createdBy);
                createTranslationIfNotExists("testResult.filter.period", languageCode, "기간", createdBy);
                createTranslationIfNotExists("testResult.filter.allPeriod", languageCode, "전체 기간", createdBy);
                createTranslationIfNotExists("testResult.filter.today", languageCode, "오늘", createdBy);
                createTranslationIfNotExists("testResult.filter.week", languageCode, "최근 1주", createdBy);
                createTranslationIfNotExists("testResult.filter.month", languageCode, "최근 1개월", createdBy);
                createTranslationIfNotExists("testResult.filter.quarter", languageCode, "최근 3개월", createdBy);
                createTranslationIfNotExists("testResult.filter.viewType", languageCode, "보기 형태", createdBy);
                createTranslationIfNotExists("testResult.filter.overviewView", languageCode, "전체 개요", createdBy);
                createTranslationIfNotExists("testResult.filter.planView", languageCode, "플랜별 비교", createdBy);
                createTranslationIfNotExists("testResult.filter.executorView", languageCode, "실행자별 비교", createdBy);
                createTranslationIfNotExists("testResult.filter.activeFilters", languageCode, "적용 중인 필터:", createdBy);
                createTranslationIfNotExists("testResult.filter.planPrefix", languageCode, "플랜:", createdBy);
                createTranslationIfNotExists("testResult.filter.executionPrefix", languageCode, "실행:", createdBy);
                createTranslationIfNotExists("testResult.filter.periodPrefix", languageCode, "기간:", createdBy);
                createTranslationIfNotExists("testResult.column.folder", languageCode, "폴더", createdBy);
                createTranslationIfNotExists("testResult.column.testCase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("testResult.column.result", languageCode, "결과", createdBy);
                createTranslationIfNotExists("testResult.column.executedBy", languageCode, "실행자", createdBy);
                createTranslationIfNotExists("testResult.column.executedAt", languageCode, "실행일시", createdBy);
                createTranslationIfNotExists("testResult.column.testPlan", languageCode, "테스트플랜", createdBy);
                createTranslationIfNotExists("testResult.column.testExecution", languageCode, "테스트실행", createdBy);
                createTranslationIfNotExists("testResult.column.jiraStatus", languageCode, "JIRA 상태", createdBy);
                createTranslationIfNotExists("testResult.column.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("testResult.button.edit", languageCode, "편집", createdBy);
                createTranslationIfNotExists("testResult.button.view", languageCode, "보기", createdBy);
                createTranslationIfNotExists("testResult.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testResult.button.export", languageCode, "내보내기", createdBy);
                createTranslationIfNotExists("testResult.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("testResult.tooltip.edit", languageCode, "테스트 결과 편집", createdBy);
                createTranslationIfNotExists("testResult.tooltip.view", languageCode, "테스트 결과 보기", createdBy);
                createTranslationIfNotExists("testResult.tooltip.delete", languageCode, "테스트 결과 삭제", createdBy);
                createTranslationIfNotExists("testResult.tooltip.export", languageCode, "CSV로 내보내기", createdBy);
                createTranslationIfNotExists("testResult.tooltip.refresh", languageCode, "데이터 새로고침", createdBy);
                createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "사전설정 없음", createdBy);
                createTranslationIfNotExists("testResult.tooltip.noSteps", languageCode, "테스트 단계 없음", createdBy);
                createTranslationIfNotExists("testResult.tooltip.noExpectedResult", languageCode, "기대 결과 없음",
                                createdBy);
                createTranslationIfNotExists("testResult.tooltip.noNotes", languageCode, "노트 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noData", languageCode, "데이터 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noFolder", languageCode, "폴더 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noTestCase", languageCode, "테스트케이스 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noExecutor", languageCode, "실행자 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noTestPlan", languageCode, "테스트플랜 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noTestExecution", languageCode, "테스트실행 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noPreCondition", languageCode, "사전설정 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noSteps", languageCode, "테스트 단계 없음", createdBy);
                createTranslationIfNotExists("testResult.default.noExpectedResult", languageCode, "기대 결과 없음",
                                createdBy);
                createTranslationIfNotExists("testResult.default.noNotes", languageCode, "노트 없음", createdBy);
                createTranslationIfNotExists("testResult.message.loading", languageCode, "테스트 결과를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("testResult.message.noData", languageCode, "표시할 테스트 결과가 없습니다.", createdBy);
                createTranslationIfNotExists("testResult.message.error", languageCode, "테스트 결과를 불러오는 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.message.deleteConfirm", languageCode, "이 테스트 결과를 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("testResult.message.deleteSuccess", languageCode, "테스트 결과가 성공적으로 삭제되었습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "테스트 결과 삭제에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.message.exportSuccess", languageCode, "CSV 파일이 성공적으로 내보내졌습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.message.exportFailed", languageCode, "CSV 내보내기에 실패했습니다.",
                                createdBy);

                // XML 데이터 불일치 경고
                createTranslationIfNotExists("testResult.warning.xmlCountMismatch", languageCode,
                                "XML 메타데이터의 테스트 개수({metadata})와 실제 로드된 테스트 개수({actual})가 일치하지 않습니다. 일부 테스트(예: 성공한 테스트)가 누락되었을 수 있습니다.",
                                createdBy);

                createTranslationIfNotExists("testResult.status.pass", languageCode, "성공", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "실패", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "차단됨", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "미실행", createdBy);
                createTranslationIfNotExists("testResult.status.skipped", languageCode, "건너뜀", createdBy);
                createTranslationIfNotExists("testResult.status.unknown", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.title", languageCode, "컬럼 순서 변경", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.description", languageCode,
                                "위/아래 화살표 버튼을 사용하여 컬럼 순서를 변경하세요", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.visible", languageCode, "표시", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.hidden", languageCode, "숨김", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.apply", languageCode, "순서 적용", createdBy);
                createTranslationIfNotExists("testResult.export.dialog.title", languageCode, "테스트 결과 내보내기", createdBy);
                createTranslationIfNotExists("testResult.export.section.format", languageCode, "📄 내보내기 형식 선택",
                                createdBy);
                createTranslationIfNotExists("testResult.export.section.info", languageCode, "📋 내보내기 정보", createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.title", languageCode, "Excel (.xlsx)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.description", languageCode,
                                "서식과 차트 포함, 업무용 보고서에 최적", createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature1", languageCode, "통계 차트 포함",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature2", languageCode, "서식 유지",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature3", languageCode, "필터링 가능",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.alert", languageCode,
                                "💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.", createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.title", languageCode, "PDF (.pdf)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.description", languageCode,
                                "인쇄 및 공유용, 레이아웃 고정",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature1", languageCode, "인쇄 최적화",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature2", languageCode, "레이아웃 고정",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature3", languageCode, "범용 호환성",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.alert", languageCode,
                                "🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.", createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.title", languageCode, "CSV (.csv)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.description", languageCode,
                                "데이터 분석용, 가벼운 파일 크기",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature1", languageCode, "데이터 분석 최적",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature2", languageCode, "가벼운 용량",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature3", languageCode, "호환성 우수",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.alert", languageCode,
                                "📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.", createdBy);
                createTranslationIfNotExists("testResult.export.info.totalRows", languageCode, "📊 총 데이터 건수:",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.totalRowsValue", languageCode, "{count}건",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.columns", languageCode, "🔍 표시 컬럼 수:", createdBy);
                createTranslationIfNotExists("testResult.export.info.columnsValue", languageCode, "{count}개",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.columnsList", languageCode, "📂 내보낼 컬럼:",
                                createdBy);
                createTranslationIfNotExists("testResult.export.progress.message", languageCode,
                                "파일을 생성하고 있습니다... 잠시만 기다려주세요",
                                createdBy);
                createTranslationIfNotExists("testResult.export.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testResult.export.button.export", languageCode, "{format} 내보내기",
                                createdBy);
                createTranslationIfNotExists("testResult.export.button.exporting", languageCode, "생성 중...", createdBy);
                createTranslationIfNotExists("testResult.export.error.noProject", languageCode, "프로젝트가 선택되지 않았습니다.",
                                createdBy);
                createTranslationIfNotExists("testResult.export.error.failed", languageCode,
                                "파일 내보내기 중 오류가 발생했습니다: {message}",
                                createdBy);
                createTranslationIfNotExists("testResult.export.error.response", languageCode,
                                "내보내기 실패: {status} {statusText}",
                                createdBy);
                createTranslationIfNotExists("testResult.message.error", languageCode, "오류가 발생했습니다", createdBy);
                createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "삭제에 실패했습니다", createdBy);
                createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode, "테스트 결과 첨부파일",
                                createdBy);
                createTranslationIfNotExists("testResult.detailReport.searchPlaceholder", languageCode,
                                "테스트 케이스명, 폴더 경로, 실행자 등", createdBy);
                createTranslationIfNotExists("testResult.form.title", languageCode, "테스트 결과 입력", createdBy);
                createTranslationIfNotExists("testResult.pieChart.title", languageCode, "테스트 결과 파이차트", createdBy);
                createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "테스트 케이스 로드 실패",
                                createdBy);
                createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "저장 실패", createdBy);
                createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "테스트 결과는 필수입니다",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "차트 로딩 중...", createdBy);
                createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "차트 데이터 없음", createdBy);
                createTranslationIfNotExists("testResult.pieChart.count", languageCode, "개수", createdBy);
                createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "비율", createdBy);
                createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "총 테스트 케이스",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.noData", languageCode, "통계 데이터 없음", createdBy);
                createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "총 개수", createdBy);
                createTranslationIfNotExists("testResult.form.preCondition", languageCode, "사전 조건", createdBy);
                createTranslationIfNotExists("testResult.form.testSteps", languageCode, "테스트 단계", createdBy);
                createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "예상 결과", createdBy);
                createTranslationIfNotExists("testResult.form.testResult", languageCode, "테스트 결과", createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "비고는 10,000자 이내로 입력해주세요",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "테스트 실행 시 특이사항이나 추가 정보를 입력하세요",
                                createdBy);
                createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "파일 첨부", createdBy);
                createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "파일 업로드 중...", createdBy);
                createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "파일 선택", createdBy);
                createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA 연동", createdBy);
                createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA 코멘트", createdBy);
                createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "데이터 로딩 중...", createdBy);
                createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "비교할 데이터가 없습니다",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.tooltip", languageCode, "차트 툴팁", createdBy);
                createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "백분율 보기", createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "백분율 (%)", createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "개수", createdBy);
                createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "상세 테이블 보기", createdBy);
                createTranslationIfNotExists("testResult.tab.tableDescription", languageCode, "테스트 결과를 테이블 형태로 확인",
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
