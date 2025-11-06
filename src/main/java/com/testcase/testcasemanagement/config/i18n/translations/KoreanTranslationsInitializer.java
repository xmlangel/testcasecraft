// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTranslationsInitializer.java
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

@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanTranslationsInitializer {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "ko";
        String createdBy = "system";

        // This is just a subset of translations for brevity. In a real application, you would have all of them.
        createTranslationIfNotExists("login.title", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "아이디", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("dashboard.title", languageCode, "대시보드", createdBy);

        // 프로젝트 생성/수정 다이얼로그
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "프로젝트 수정", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "예: PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "소속 조직", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "독립 프로젝트 (조직 없음)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "프로젝트에 대한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "수정", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);

        // Dashboard 페이지 전용 번역 키들
        createTranslationIfNotExists("dashboard.lastUpdated", languageCode, "최종 업데이트: {date}", createdBy);
        createTranslationIfNotExists("dashboard.refresh.tooltip", languageCode, "대시보드 데이터 새로고침", createdBy);
        createTranslationIfNotExists("dashboard.refresh.button", languageCode, "새로고침", createdBy);

        // 로딩 상태
        createTranslationIfNotExists("dashboard.loading.data", languageCode, "대시보드 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("dashboard.loading.chart", languageCode, "차트 데이터를 불러오는 중...", createdBy);

        // 에러 상태
        createTranslationIfNotExists("dashboard.error.solution", languageCode, "해결책: {action}", createdBy);
        createTranslationIfNotExists("dashboard.error.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "로그인으로 이동", createdBy);
        createTranslationIfNotExists("dashboard.error.details", languageCode, "상세 정보", createdBy);

        // 데이터 없음 상태
        createTranslationIfNotExists("dashboard.noData.message", languageCode, "표시할 대시보드 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("dashboard.noData.chart", languageCode, "차트 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("dashboard.noData.noActiveTestRuns", languageCode, "진행 중인 테스트 실행이 없습니다.", createdBy);

        // 프로젝트 정보
        createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode, "총 {count}개 테스트케이스", createdBy);
        createTranslationIfNotExists("dashboard.project.members", languageCode, "{count}명 참여", createdBy);

        // 차트 제목들
        createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "최근 테스트 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "테스트 결과 추이", createdBy);
        createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "최근 15일", createdBy);
        createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "진행 중인 테스트 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "담당자별 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "테스트 플랜별 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "미실행 테스트 추이", createdBy);

        // 상태 관련
        createTranslationIfNotExists("dashboard.status.pass", languageCode, "성공", createdBy);
        createTranslationIfNotExists("dashboard.status.fail", languageCode, "실패", createdBy);
        createTranslationIfNotExists("dashboard.status.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("dashboard.status.notrun", languageCode, "미실행", createdBy);
        createTranslationIfNotExists("dashboard.status.skipped", languageCode, "건너뜀", createdBy);
        createTranslationIfNotExists("dashboard.status.complete", languageCode, "완료", createdBy);
        createTranslationIfNotExists("dashboard.status.failureRate", languageCode, "실패율 {rate}%", createdBy);
        createTranslationIfNotExists("dashboard.status.completedCount", languageCode, "{completed}/{total} 완료", createdBy);

        // 메시지
        createTranslationIfNotExists("dashboard.messages.selectProject", languageCode, "테스트 플랜별 결과를 보려면 프로젝트를 선택해주세요.", createdBy);

        createTranslationIfNotExists("project.title", languageCode, "프로젝트 관리", createdBy);

        // 프로젝트 탭
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "조직별 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "독립 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "전체 프로젝트", createdBy);

        // 프로젝트 통계
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count}개 프로젝트", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "총 {count}개 프로젝트", createdBy);

        // 프로젝트 메시지
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "독립 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "조직에 속하지 않는 개인 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("userList.title", languageCode, "사용자 관리", createdBy);
        createTranslationIfNotExists("testcase.form.title.create", languageCode, "테스트케이스 생성", createdBy);
        createTranslationIfNotExists("testPlan.form.title.create", languageCode, "새 테스트 플랜 생성", createdBy);
        createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "테스트 플랜 수정", createdBy);
        createTranslationIfNotExists("testPlan.form.planName", languageCode, "플랜 이름", createdBy);
        createTranslationIfNotExists("testPlan.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "테스트케이스 선택", createdBy);
        createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count}개 선택됨", createdBy);
        createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode, "프로젝트를 먼저 선택해주세요", createdBy);
        createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testPlan.form.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "처리 중...", createdBy);

        // 테스트 플랜 폼 검증 메시지
        createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode, "테스트 플랜 이름은 필수 입력 항목입니다", createdBy);
        createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode, "최소 한 개 이상의 테스트케이스를 선택해야 합니다", createdBy);
        createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "저장 처리 중 오류가 발생했습니다: ", createdBy);

        // 테스트 플랜 목록
        createTranslationIfNotExists("testPlan.list.add", languageCode, "테스트 플랜 추가", createdBy);
        createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
        createTranslationIfNotExists("testPlan.list.table.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("testPlan.list.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "생성일", createdBy);
        createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "실행", createdBy);
        createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "등록된 테스트 플랜이 없습니다.", createdBy);

        // 테스트 실행 다이얼로그
        createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode, "테스트 실행 - {planName}", createdBy);
        createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode, "새 실행 생성", createdBy);
        createTranslationIfNotExists("testPlan.execution.empty.message", languageCode, "이 테스트 플랜의 실행 이력이 없습니다.", createdBy);
        createTranslationIfNotExists("testPlan.execution.progress", languageCode, "진행률:", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "전체화면 보기", createdBy);
        createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "닫기", createdBy);

        // 테스트 플랜 삭제 다이얼로그
        createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "테스트 플랜 삭제", createdBy);
        createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode, "정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "삭제", createdBy);

        // 테스트 플랜 선택기
        createTranslationIfNotExists("testPlan.selector.label", languageCode, "테스트 플랜 선택", createdBy);
        createTranslationIfNotExists("testPlan.selector.all", languageCode, "전체", createdBy);
        createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count}개 케이스", createdBy);
        createTranslationIfNotExists("testPlan.selector.selected", languageCode, "선택된 플랜: {planName}", createdBy);
        createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count}개 테스트케이스)", createdBy);

        // 실행 상태
        createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "시작 안됨", createdBy);
        createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "진행 중", createdBy);
        createTranslationIfNotExists("testPlan.status.completed", languageCode, "완료됨", createdBy);

        // 탭 라벨
        createTranslationIfNotExists("testPlan.tab.label", languageCode, "테스트플랜", createdBy);
        createTranslationIfNotExists("testExecution.title", languageCode, "테스트 실행", createdBy);

        // 테스트 실행 목록 (TestExecutionList)
        createTranslationIfNotExists("testExecution.list.title", languageCode, "실행 이력", createdBy);
        createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
        createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "실행 이력이 없습니다.", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "실행 삭제", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "정말로 이 실행을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);

        // 테스트 실행 상태 칩
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);

        // 테스트 실행 폼 (TestExecutionForm)
        createTranslationIfNotExists("testExecution.form.title.create", languageCode, "테스트 실행 등록", createdBy);
        createTranslationIfNotExists("testExecution.form.title.edit", languageCode, "테스트 실행: {name}", createdBy);
        createTranslationIfNotExists("testExecution.form.executionName", languageCode, "실행명", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "테스트 계획", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan.select", languageCode, "선택", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediately", languageCode, "저장 후 즉시 실행 시작", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediately.description", languageCode, "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다", createdBy);

        // 테스트 실행 폼 버튼
        createTranslationIfNotExists("testExecution.form.button.list", languageCode, "목록", createdBy);
        createTranslationIfNotExists("testExecution.form.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testExecution.form.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("testExecution.form.button.saveAndStart", languageCode, "저장 및 시작", createdBy);
        createTranslationIfNotExists("testExecution.form.button.start", languageCode, "실행시작", createdBy);
        createTranslationIfNotExists("testExecution.form.button.complete", languageCode, "실행완료", createdBy);
        createTranslationIfNotExists("testExecution.form.button.restart", languageCode, "재실행", createdBy);
        createTranslationIfNotExists("testExecution.form.button.hideGuide", languageCode, "안내 숨기기", createdBy);
        createTranslationIfNotExists("testExecution.form.button.showGuide", languageCode, "실행 절차", createdBy);

        // 테스트 실행 정보 패널
        createTranslationIfNotExists("testExecution.info.title", languageCode, "실행 정보", createdBy);
        createTranslationIfNotExists("testExecution.info.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("testExecution.info.startDate", languageCode, "시작일시", createdBy);
        createTranslationIfNotExists("testExecution.info.endDate", languageCode, "종료일시", createdBy);
        createTranslationIfNotExists("testExecution.info.progress", languageCode, "진행률", createdBy);
        createTranslationIfNotExists("testExecution.info.total", languageCode, "총 {total} 건", createdBy);

        // 테스트 실행 가이드
        createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 테스트 실행 절차 안내", createdBy);
        createTranslationIfNotExists("testExecution.guide.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. 테스트 실행 준비", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.description", languageCode, "실행명, 테스트 계획, 설명을 입력하고 '저장' 버튼을 클릭합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. 실행 시작", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. 테스트 케이스 실행", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. 실행 완료", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. 결과 확인", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. 재실행 (완료 후)", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.", createdBy);

        // 테스트 케이스 테이블 헤더
        createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "폴더/케이스", createdBy);
        createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "케이스명", createdBy);
        createTranslationIfNotExists("testExecution.table.header.result", languageCode, "결과", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "실행일시", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "실행자", createdBy);
        createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "비고", createdBy);
        createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "결과입력", createdBy);
        createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "이전결과", createdBy);
        createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "첨부파일", createdBy);

        createTranslationIfNotExists("testExecution.table.executionId", "testExecution", "실행 ID", createdBy);
        createTranslationIfNotExists("testExecution.table.executionName", "testExecution", "실행 이름", createdBy);

        // 테스트 케이스 테이블 버튼
        createTranslationIfNotExists("testExecution.table.button.resultInput", languageCode, "결과입력", createdBy);
        createTranslationIfNotExists("testExecution.table.button.previousResults", languageCode, "이전결과", createdBy);
        createTranslationIfNotExists("testExecution.table.button.attachments", languageCode, "첨부파일", createdBy);

        // 페이지네이션
        createTranslationIfNotExists("testExecution.pagination.info", languageCode, "총 {totalItems}개 항목 중 {start}-{end}개 표시", createdBy);
        createTranslationIfNotExists("testExecution.pagination.page", languageCode, "페이지 {current} / {total}", createdBy);
        createTranslationIfNotExists("testExecution.table.noTestCases", languageCode, "표시할 테스트 케이스가 없습니다.", createdBy);

        // 이전 결과 다이얼로그
        createTranslationIfNotExists("testExecution.previousResults.title", languageCode, "이전 실행 결과", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.noResults", languageCode, "이전 실행 결과가 없습니다.", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executedAt", languageCode, "실행일시", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.result", languageCode, "결과", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executionId", languageCode, "실행ID", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executionName", languageCode, "실행명", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executedBy", languageCode, "실행자", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.notes", languageCode, "비고", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.attachments", languageCode, "첨부파일", createdBy);

        // 첨부파일 다이얼로그
        createTranslationIfNotExists("testExecution.attachments.title", languageCode, "테스트 결과 첨부파일", createdBy);
        createTranslationIfNotExists("testExecution.attachments.close", languageCode, "닫기", createdBy);

        // JIRA 이슈 링크
        createTranslationIfNotExists("testExecution.jira.urlNotSet", languageCode, "{issueKey} (JIRA URL 미설정)", createdBy);

        // 성공 메시지
        createTranslationIfNotExists("testExecution.success.savedAndStarted", languageCode, "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.", createdBy);

        // 누락된 번역 키들 추가
        createTranslationIfNotExists("testExecution.form.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("testExecution.table.folderCase", languageCode, "폴더/케이스", createdBy);
        createTranslationIfNotExists("testExecution.form.titleNew", languageCode, "테스트 실행 등록", createdBy);
        createTranslationIfNotExists("testExecution.form.titleEdit", languageCode, "테스트 실행: {name}", createdBy);
        createTranslationIfNotExists("testExecution.actions.enterResult", languageCode, "결과입력", createdBy);
        createTranslationIfNotExists("testExecution.actions.prevResults", languageCode, "이전 결과", createdBy);
        createTranslationIfNotExists("testExecution.table.prevResults", languageCode, "이전 결과", createdBy);
        createTranslationIfNotExists("testExecution.actions.startExecution", languageCode, "실행시작", createdBy);
        createTranslationIfNotExists("testExecution.actions.completeExecution", languageCode, "실행완료", createdBy);
        createTranslationIfNotExists("testExecution.actions.rerunExecution", languageCode, "재실행", createdBy);
        createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "폴더/케이스", createdBy);
        createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "케이스명", createdBy);
        createTranslationIfNotExists("testExecution.table.header.result", languageCode, "결과", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "실행일시", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "실행자", createdBy);
        createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "비고", createdBy);
        createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "결과입력", createdBy);
        createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "이전결과", createdBy);
        createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("testExecution.dialog.attachments.title", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("testExecution.dialog.attachments.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("testExecution.progress.completed", languageCode, "완료", createdBy);
        createTranslationIfNotExists("testExecution.progress.total", languageCode, "전체", createdBy);

        // 추가 누락된 번역 키들
        createTranslationIfNotExists("testExecution.table.caseName", languageCode, "케이스명", createdBy);
        createTranslationIfNotExists("testExecution.table.result", languageCode, "결과", createdBy);
        createTranslationIfNotExists("testExecution.table.executedAt", languageCode, "실행일시", createdBy);
        createTranslationIfNotExists("testExecution.table.executedBy", languageCode, "실행자", createdBy);
        createTranslationIfNotExists("testExecution.table.notes", languageCode, "노트", createdBy);
        createTranslationIfNotExists("testExecution.table.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.enterResult", languageCode, "결과입력", createdBy);
        createTranslationIfNotExists("testExecution.table.prevResults", languageCode, "이전결과", createdBy);
        createTranslationIfNotExists("testExecution.table.attachments", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("testExecution.table.executionId", languageCode, "실행ID", createdBy);
        createTranslationIfNotExists("testExecution.table.executionName", languageCode, "실행명", createdBy);

        // 폼 관련 누락된 번역
        createTranslationIfNotExists("testExecution.form.saveAndStart", languageCode, "저장 후 시작", createdBy);
        createTranslationIfNotExists("testExecution.form.executionName", languageCode, "실행명", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "테스트플랜", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testExecution.form.progress", languageCode, "진행률", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediatelyLabel", languageCode, "즉시 시작", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediatelyDescription", languageCode, "저장 후 바로 실행을 시작합니다.", createdBy);

        // 액션 관련 누락된 번역
        createTranslationIfNotExists("testExecution.actions.restartExecution", languageCode, "재실행", createdBy);

        // 이전 결과 다이얼로그
        createTranslationIfNotExists("testExecution.prevResults.title", languageCode, "이전 실행 결과", createdBy);
        createTranslationIfNotExists("testExecution.prevResults.noResults", languageCode, "이전 실행 결과가 없습니다.", createdBy);

        // 상태 관련 번역
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "시작 전", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "진행 중", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "완료", createdBy);

        // 리스트 관련 번역
        createTranslationIfNotExists("testExecution.list.title", languageCode, "테스트 실행", createdBy);
        createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
        createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "등록된 테스트 실행이 없습니다.", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "실행 삭제", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "이 테스트 실행을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);

        // 가이드 관련 번역
        createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 테스트 실행 절차 안내", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. 실행 정보 입력", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.description", languageCode, "실행명, 테스트플랜, 설명 등 기본 정보를 입력합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. 실행 시작", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. 테스트 케이스 실행", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. 실행 완료", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. 결과 확인", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. 재실행 (완료 후)", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.", createdBy);

        // 새로 추가된 번역 키들
        createTranslationIfNotExists("testExecution.table.viewAttachments", languageCode, "첨부파일 보기", createdBy);
        createTranslationIfNotExists("testExecution.form.registerTitle", languageCode, "테스트 실행 등록", createdBy);
        createTranslationIfNotExists("testExecution.form.executionInfo", languageCode, "실행 정보", createdBy);
        createTranslationIfNotExists("testExecution.form.startDate", languageCode, "시작일시", createdBy);
        createTranslationIfNotExists("testExecution.form.endDate", languageCode, "종료일시", createdBy);
        createTranslationIfNotExists("testExecution.form.editTitle", languageCode, "테스트 실행: {name}", createdBy);
        createTranslationIfNotExists("testExecution.table.attachments", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("testExecution.attachments.title", languageCode, "테스트 결과 첨부파일", createdBy);

        // 추가 testExecution 번역 키
        createTranslationIfNotExists("testExecution.form.totalCount", languageCode, "총 {count}건", createdBy);
        createTranslationIfNotExists("testExecution.table.noData", languageCode, "표시할 데이터가 없습니다.", createdBy);

        // 추가 translation 관리 키
        createTranslationIfNotExists("translation.keyTab.statusLabel", languageCode, "상태", createdBy);

        // Common 키들
        createTranslationIfNotExists("common.list", languageCode, "목록", createdBy);
        createTranslationIfNotExists("common.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.save", languageCode, "저장", createdBy);

        // 테스트 결과 페이지 (TestResultMainPage)
        createTranslationIfNotExists("testResult.mainPage.title", languageCode, "테스트 결과", createdBy);
        createTranslationIfNotExists("testResult.mainPage.description", languageCode, "프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.", createdBy);

        // 테스트 결과 메인 페이지 탭
        createTranslationIfNotExists("testResult.tab.statistics", languageCode, "통계", createdBy);
        createTranslationIfNotExists("testResult.tab.statisticsFull", languageCode, "통계 대시보드", createdBy);
        createTranslationIfNotExists("testResult.tab.statisticsDescription", languageCode, "Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악할 수 있습니다", createdBy);

        createTranslationIfNotExists("testResult.tab.trend", languageCode, "추이", createdBy);
        createTranslationIfNotExists("testResult.tab.trendFull", languageCode, "추이 분석", createdBy);
        createTranslationIfNotExists("testResult.tab.trendDescription", languageCode, "테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석이 가능합니다", createdBy);

        createTranslationIfNotExists("testResult.tab.table", languageCode, "테이블", createdBy);
        createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "상세 테이블", createdBy);
        createTranslationIfNotExists("testResult.tab.tableDescription", languageCode, "전체 테스트 결과를 테이블 형태로 상세하게 확인할 수 있습니다", createdBy);

        createTranslationIfNotExists("testResult.tab.report", languageCode, "리포트", createdBy);
        createTranslationIfNotExists("testResult.tab.reportFull", languageCode, "상세 리포트", createdBy);
        createTranslationIfNotExists("testResult.tab.reportDescription", languageCode, "폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리를 지원합니다", createdBy);

        // 테스트 결과 입력 폼 (TestResultForm)
        createTranslationIfNotExists("testResult.form.title", languageCode, "테스트 결과 입력", createdBy);
        createTranslationIfNotExists("testResult.form.testResult", languageCode, "테스트 결과", createdBy);
        createTranslationIfNotExists("testResult.form.preCondition", languageCode, "사전 조건", createdBy);
        createTranslationIfNotExists("testResult.form.testSteps", languageCode, "테스트 단계", createdBy);
        createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "기대 결과", createdBy);
        createTranslationIfNotExists("testResult.form.notes", languageCode, "노트", createdBy);
        createTranslationIfNotExists("testResult.form.notesPlaceholder", languageCode, "노트 ({length}/10,000)", createdBy);
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "테스트 과정에서 발견한 특이사항이나 추가 정보를 기록해주세요.", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode, "{remaining}자 남음", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "10,000자를 초과했습니다. 긴 내용은 파일로 첨부해주세요.", createdBy);
        createTranslationIfNotExists("testResult.form.notesFileRecommendation", languageCode, "긴 내용은 파일 첨부를 권장합니다.", createdBy);

        // Markdown 모드 관련
        createTranslationIfNotExists("testResult.form.mode.text", languageCode, "텍스트", createdBy);
        createTranslationIfNotExists("testResult.form.mode.markdown", languageCode, "Markdown", createdBy);
        createTranslationIfNotExists("testResult.form.mode.switch", languageCode, "모드 전환", createdBy);

        // 파일 첨부
        createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "파일 첨부", createdBy);
        createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "파일 선택", createdBy);
        createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "업로드 중...", createdBy);
        createTranslationIfNotExists("testResult.form.fileFormat", languageCode, "허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)", createdBy);
        createTranslationIfNotExists("testResult.form.newAttachments", languageCode, "새로 첨부할 파일 ({count}개)", createdBy);
        createTranslationIfNotExists("testResult.form.attachments", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("testResult.form.attachmentsNote", languageCode, "테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다.", createdBy);

        // JIRA 연동
        createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA 이슈 연동", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIssueId", languageCode, "JIRA 이슈 ID (예: ICT-123)", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIssuePlaceholder", languageCode, "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)", createdBy);
        createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA 코멘트", createdBy);
        createTranslationIfNotExists("testResult.form.jiraDetected", languageCode, "감지된 이슈: {issues}", createdBy);
        createTranslationIfNotExists("testResult.form.jiraDetectedShort", languageCode, "감지: {issues}", createdBy);

        // 테스트 결과 페이지 (TestCaseResultPage)
        createTranslationIfNotExists("testCaseResult.page.title", languageCode, "테스트 결과 입력", createdBy);

        // 새로 추가된 테스트 결과 번역 키들
        createTranslationIfNotExists("testResult.jira.connectionCheckFailed", languageCode, "JIRA 연결 상태 확인 실패:", createdBy);
        createTranslationIfNotExists("testResult.jira.placeholder", languageCode, "관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)", createdBy);
        createTranslationIfNotExists("testResult.jira.detectedIssues", languageCode, "감지된 이슈", createdBy);

        // 파일 에러 메시지
        createTranslationIfNotExists("testResult.file.sizeError", languageCode, "파일 크기는 10MB 이하여야 합니다", createdBy);
        createTranslationIfNotExists("testResult.file.typeError", languageCode, "허용되지 않은 파일 형식입니다", createdBy);
        createTranslationIfNotExists("testResult.file.allowedFormats", languageCode, "허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)", createdBy);
        createTranslationIfNotExists("testResult.file.newAttachmentsCount", languageCode, "새로 첨부할 파일 ({count}개)", createdBy);
        createTranslationIfNotExists("testResult.file.attachedFilesCount", languageCode, "첨부된 파일 ({count}개)", createdBy);
        createTranslationIfNotExists("testResult.file.saveToViewAttachments", languageCode, "테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다.", createdBy);

        // 에러 메시지
        createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "결과 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "테스트케이스를 불러오지 못했습니다.", createdBy);
        createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "테스트 결과를 선택해주세요.", createdBy);

        // 공통 버튼
        createTranslationIfNotExists("common.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("common.button.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("common.empty", languageCode, "-", createdBy);

        // 추가 공통 번역 키
        createTranslationIfNotExists("common.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("common.select", languageCode, "선택", createdBy);

        // 테스트 결과 상태
        createTranslationIfNotExists("testResult.status.pass", languageCode, "성공", createdBy);
        createTranslationIfNotExists("testResult.status.fail", languageCode, "실패", createdBy);
        createTranslationIfNotExists("testResult.status.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("testResult.status.notRun", languageCode, "미실행", createdBy);
        createTranslationIfNotExists("testResult.status.error", languageCode, "에러", createdBy);

        // 테스트 결과 테이블
        createTranslationIfNotExists("testResult.table.title", languageCode, "테스트 결과 상세 목록", createdBy);
        createTranslationIfNotExists("testResult.table.resultCount", languageCode, "개의 테스트 결과", createdBy);
        createTranslationIfNotExists("testResult.table.filtered", languageCode, "필터됨", createdBy);
        createTranslationIfNotExists("testResult.table.loadError", languageCode, "테스트 결과를 불러올 수 없습니다", createdBy);

        // 테스트 결과 차트
        createTranslationIfNotExists("testResult.chart.distribution", languageCode, "테스트 결과 분포", createdBy);
        createTranslationIfNotExists("testResult.chart.loading", languageCode, "차트 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("testResult.chart.noData", languageCode, "차트 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("testResult.chart.total", languageCode, "총 테스트 케이스: {total}건", createdBy);
        createTranslationIfNotExists("testResult.chart.compareTitle", languageCode, "테스트 결과 비교", createdBy);
        createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "퍼센트 보기", createdBy);
        createTranslationIfNotExists("testResult.chart.tooltip", languageCode, "테스트 플랜별 또는 실행자별 결과를 비교합니다.", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "개수 (건)", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "비율 (%)", createdBy);
        createTranslationIfNotExists("testResult.chart.compareItems", languageCode, "총 {count}개 항목 비교", createdBy);
        createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "차트 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "비교할 데이터가 없습니다.", createdBy);

        // 테스트 결과 통계 카드
        createTranslationIfNotExists("testResult.statistics.title", languageCode, "테스트 결과 통계", createdBy);
        createTranslationIfNotExists("testResult.statistics.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("testResult.statistics.error", languageCode, "에러: {error}", createdBy);
        createTranslationIfNotExists("testResult.statistics.noData", languageCode, "데이터 없음", createdBy);
        createTranslationIfNotExists("testResult.statistics.successRate", languageCode, "성공률", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalTests", languageCode, "총 테스트", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "총 {count}건", createdBy);

        // 테스트 결과 파이차트
        createTranslationIfNotExists("testResult.pieChart.title", languageCode, "테스트 결과 분포", createdBy);
        createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "차트 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "차트 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("testResult.pieChart.count", languageCode, "개수", createdBy);
        createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "비율", createdBy);
        createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "총 테스트 케이스: {total}건", createdBy);

        // 통계 필터 패널
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

        // TestResult Detailed Table 컬럼 한국어 번역
        createTranslationIfNotExists("testResult.column.folder", languageCode, "폴더", createdBy);
        createTranslationIfNotExists("testResult.column.testCase", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("testResult.column.result", languageCode, "결과", createdBy);
        createTranslationIfNotExists("testResult.column.executedBy", languageCode, "실행자", createdBy);
        createTranslationIfNotExists("testResult.column.executedAt", languageCode, "실행일시", createdBy);
        createTranslationIfNotExists("testResult.column.testPlan", languageCode, "테스트플랜", createdBy);
        createTranslationIfNotExists("testResult.column.testExecution", languageCode, "테스트실행", createdBy);
        createTranslationIfNotExists("testResult.column.actions", languageCode, "작업", createdBy);

        // TestResult Detailed Table 버튼 한국어 번역
        createTranslationIfNotExists("testResult.button.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("testResult.button.view", languageCode, "보기", createdBy);
        createTranslationIfNotExists("testResult.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testResult.button.export", languageCode, "내보내기", createdBy);
        createTranslationIfNotExists("testResult.button.refresh", languageCode, "새로고침", createdBy);

        // TestResult Detailed Table 툴팁 한국어 번역
        createTranslationIfNotExists("testResult.tooltip.edit", languageCode, "테스트 결과 편집", createdBy);
        createTranslationIfNotExists("testResult.tooltip.view", languageCode, "테스트 결과 보기", createdBy);
        createTranslationIfNotExists("testResult.tooltip.delete", languageCode, "테스트 결과 삭제", createdBy);
        createTranslationIfNotExists("testResult.tooltip.export", languageCode, "CSV로 내보내기", createdBy);
        createTranslationIfNotExists("testResult.tooltip.refresh", languageCode, "데이터 새로고침", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "사전설정 없음", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noSteps", languageCode, "테스트 단계 없음", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noExpectedResult", languageCode, "기대 결과 없음", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noNotes", languageCode, "노트 없음", createdBy);

        // TestResult Detailed Table 기본값 한국어 번역
        createTranslationIfNotExists("testResult.default.noData", languageCode, "데이터 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noFolder", languageCode, "폴더 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noTestCase", languageCode, "테스트케이스 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noExecutor", languageCode, "실행자 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noTestPlan", languageCode, "테스트플랜 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noTestExecution", languageCode, "테스트실행 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noPreCondition", languageCode, "사전설정 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noSteps", languageCode, "테스트 단계 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noExpectedResult", languageCode, "기대 결과 없음", createdBy);
        createTranslationIfNotExists("testResult.default.noNotes", languageCode, "노트 없음", createdBy);

        // TestResult Detailed Table 상태 메시지 한국어 번역
        createTranslationIfNotExists("testResult.message.loading", languageCode, "테스트 결과를 불러오는 중...", createdBy);
        createTranslationIfNotExists("testResult.message.noData", languageCode, "표시할 테스트 결과가 없습니다.", createdBy);
        createTranslationIfNotExists("testResult.message.error", languageCode, "테스트 결과를 불러오는 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("testResult.message.deleteConfirm", languageCode, "이 테스트 결과를 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testResult.message.deleteSuccess", languageCode, "테스트 결과가 성공적으로 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "테스트 결과 삭제에 실패했습니다.", createdBy);
        createTranslationIfNotExists("testResult.message.exportSuccess", languageCode, "CSV 파일이 성공적으로 내보내졌습니다.", createdBy);
        createTranslationIfNotExists("testResult.message.exportFailed", languageCode, "CSV 내보내기에 실패했습니다.", createdBy);

        // JIRA 상태 요약 카드
        createTranslationIfNotExists("jira.summary.title", languageCode, "JIRA 상태 요약", createdBy);
        createTranslationIfNotExists("jira.summary.loading", languageCode, "JIRA 상태 정보를 불러오는 중...", createdBy);
        createTranslationIfNotExists("jira.summary.error", languageCode, "JIRA 상태 정보를 불러오는데 실패했습니다: {error}", createdBy);
        createTranslationIfNotExists("jira.summary.noData", languageCode, "연결된 JIRA 이슈가 없습니다.", createdBy);
        createTranslationIfNotExists("jira.summary.filterAll", languageCode, "전체", createdBy);
        createTranslationIfNotExists("jira.summary.filterActive", languageCode, "진행중", createdBy);
        createTranslationIfNotExists("jira.summary.filterFailed", languageCode, "실패", createdBy);
        createTranslationIfNotExists("jira.summary.filterPassed", languageCode, "통과", createdBy);
        createTranslationIfNotExists("jira.summary.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "최근 테스트:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "실행 시간:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "동기화:", createdBy);

        // JIRA 상태 표시기
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA 연결 상태", createdBy);
        createTranslationIfNotExists("jira.status.notConfigured", languageCode, "JIRA 미설정", createdBy);
        createTranslationIfNotExists("jira.messages.noConfig", languageCode, "JIRA 설정이 없습니다. 설정 페이지에서 JIRA 서버 정보를 등록해주세요.", createdBy);
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("common.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("jira.summary.summaryStats", languageCode, "요약 통계", createdBy);
        createTranslationIfNotExists("jira.summary.totalIssues", languageCode, "전체 이슈", createdBy);
        createTranslationIfNotExists("jira.summary.activeIssues", languageCode, "활성 이슈", createdBy);
        createTranslationIfNotExists("jira.summary.allPassed", languageCode, "전체 통과", createdBy);
        createTranslationIfNotExists("jira.summary.hasFailed", languageCode, "실패 포함", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "최근 테스트:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "실행 시간:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "동기화:", createdBy);

        // ProjectHeader 번역 키들
        createTranslationIfNotExists("projectHeader.breadcrumb.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testCases", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testExecution", languageCode, "테스트실행", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testResults", languageCode, "테스트결과", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.automation", languageCode, "자동화 테스트", createdBy);

        // TestResultStatisticsDashboard 번역 키들
        createTranslationIfNotExists("testResultDashboard.chart.planComparison", languageCode, "테스트 플랜별 결과 비교", createdBy);
        createTranslationIfNotExists("testResultDashboard.chart.executorComparison", languageCode, "실행자별 결과 비교", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.title", languageCode, "통계 요약", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.executionRate", languageCode, "실행률", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.successRate", languageCode, "성공률", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.jiraLinkRate", languageCode, "JIRA 연동률", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.lastUpdated", languageCode, "최종 업데이트", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.unknown", languageCode, "알 수 없음", createdBy);

        // TestResultTrendAnalysis 한국어 번역
        createTranslationIfNotExists("testTrendAnalysis.error.comparisonLoadFailed", languageCode, "비교 데이터를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.error.trendLoadFailed", languageCode, "추이 데이터를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.loading.trendData", languageCode, "추이 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.noData.title", languageCode, "추이 데이터가 없습니다", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.noData.description", languageCode, "선택한 기간 동안의 테스트 실행 기록이 없습니다.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.label", languageCode, "기간", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last7days", languageCode, "최근 7일", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last15days", languageCode, "최근 15일", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last30days", languageCode, "최근 30일", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last60days", languageCode, "최근 60일", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last90days", languageCode, "최근 90일", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chartType.line", languageCode, "라인", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chartType.area", languageCode, "영역", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.avgSuccessRate", languageCode, "평균 성공률", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.avgCompletionRate", languageCode, "평균 완료율", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.dataPoints", languageCode, "데이터 포인트", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.successRateChange", languageCode, "성공률 변화", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.overallTrend", languageCode, "테스트 결과 변화 추이", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.testPlanComparison", languageCode, "테스트 플랜별 결과 비교", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.assigneeComparison", languageCode, "실행자별 결과 비교", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.successAndCompletionRate", languageCode, "성공률 및 완료율 추이", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.successRate", languageCode, "성공률", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.completionRate", languageCode, "완료율", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.overallSuccessRate", languageCode, "전체 성공률", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.plan", languageCode, "Plan", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.unit", languageCode, "건", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.overallSuccessRate", languageCode, "전체 성공률", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.plan", languageCode, "Plan", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.prompt.selectTestPlan", languageCode, "비교할 테스트 플랜을 선택해주세요", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.prompt.selectAssignee", languageCode, "비교할 실행자를 선택해주세요", createdBy);

        // Header Navigation 번역 키들
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "메일 설정", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("header.nav.managementMenu", languageCode, "관리 메뉴", createdBy);

        // 다국어 관리 페이지
        createTranslationIfNotExists("translation.management.title", languageCode, "다국어 관리", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "CSV 내보내기", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "CSV 가져오기", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "캐시 초기화", createdBy);

        // 다국어 관리 탭
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "언어 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "번역 키 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "통계", createdBy);

        // CSV 가져오기 다이얼로그
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "CSV 파일 가져오기", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV 파일 형식: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "기존 번역 덮어쓰기", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "체크하면 기존 번역이 있는 경우 새 값으로 덮어씁니다. 체크하지 않으면 기존 번역은 그대로 두고 새로운 번역만 추가합니다.", createdBy);
        createTranslationIfNotExists("common.buttons.import", languageCode, "가져오기", createdBy);

        // 언어 관리 다이얼로그
        createTranslationIfNotExists("translation.languageDialog.addTitle", languageCode, "언어 추가", createdBy);
        createTranslationIfNotExists("translation.languageDialog.editTitle", languageCode, "언어 편집", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeLabel", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeHelper", languageCode, "예: ko, en, ja", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "정렬 순서는 0 이상이어야 합니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameLabel", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameHelper", languageCode, "예: 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameLabel", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameHelper", languageCode, "예: 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isDefaultLabel", languageCode, "기본 언어로 설정", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.languageDialog.defaultLanguageWarning", languageCode, "기본 언어로 설정하면 다른 언어들의 기본 설정이 해제됩니다.", createdBy);
        createTranslationIfNotExists("common.buttons.add", languageCode, "추가", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeRequired", languageCode, "언어 코드는 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeFormat", languageCode, "언어 코드는 2-3자의 소문자여야 합니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameRequired", languageCode, "언어명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameRequired", languageCode, "원어명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderMin", languageCode, "정렬 순서는 0 이상이어야 합니다", createdBy);

        // 번역 키 관리 다이얼로그
        createTranslationIfNotExists("translation.keyDialog.addTitle", languageCode, "번역 키 추가", createdBy);
        createTranslationIfNotExists("translation.keyDialog.editTitle", languageCode, "번역 키 편집", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameLabel", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameHelper", languageCode, "예: login.title, button.submit", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameFormat", languageCode, "키 이름은 영문자로 시작하며 영문자, 숫자, 점, 언더스코어만 사용 가능합니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryLabel", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.login", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.register", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "버튼", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "메시지", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "검증", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.navigation", languageCode, "네비게이션", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.form", languageCode, "폼", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "오류", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.common", languageCode, "공통", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "이 키가 어디에 사용되는지 설명해주세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueLabel", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueHelper", languageCode, "번역이 없을 때 표시될 기본 텍스트", createdBy);
        createTranslationIfNotExists("translation.keyDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameRequired", languageCode, "키 이름은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryRequired", languageCode, "카테고리를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionRequired", languageCode, "설명은 필수입니다", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueRequired", languageCode, "기본값은 필수입니다", createdBy);

        // 번역 관리 다이얼로그
        createTranslationIfNotExists("translation.translationDialog.addTitle", languageCode, "번역 추가", createdBy);
        createTranslationIfNotExists("translation.translationDialog.editTitle", languageCode, "번역 편집", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyLabel", languageCode, "번역 키", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageLabel", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyDescription", languageCode, "키 설명", createdBy);
        createTranslationIfNotExists("translation.translationDialog.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueLabel", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueHelper", languageCode, "이 언어로 표시될 텍스트를 입력하세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextLabel", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextHelper", languageCode, "번역의 맥락이나 사용 상황을 설명해주세요 (선택사항)", createdBy);
        createTranslationIfNotExists("translation.translationDialog.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyRequired", languageCode, "번역 키를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageRequired", languageCode, "언어를 선택해주세요", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueRequired", languageCode, "번역값은 필수입니다", createdBy);

        // 언어 관리 탭
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "언어 목록", createdBy);
        createTranslationIfNotExists("translation.languageTab.addLanguage", languageCode, "언어 추가", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "기본 언어", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("common.table.actions", languageCode, "작업", createdBy);
        createTranslationIfNotExists("common.default", languageCode, "기본", createdBy);
        createTranslationIfNotExists("common.active", languageCode, "활성", createdBy);
        createTranslationIfNotExists("common.inactive", languageCode, "비활성", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("translation.languageTab.deleteConfirm", languageCode, "정말로 이 언어를 삭제하시겠습니까?", createdBy);

        // 번역 키 관리 탭
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "번역 키 목록", createdBy);
        createTranslationIfNotExists("translation.keyTab.addKey", languageCode, "번역 키 추가", createdBy);
        createTranslationIfNotExists("common.search.keyword", languageCode, "키워드 검색", createdBy);
        createTranslationIfNotExists("translation.keyTab.categoryLabel", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyTab.isActiveLabel", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.keyTab.deleteConfirm", languageCode, "정말로 이 번역 키를 삭제하시겠습니까?", createdBy);

        // 번역 관리 탭
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "번역 목록", createdBy);
        createTranslationIfNotExists("translation.translationTab.exportCsvByLanguage", languageCode, "{languageCode} CSV 내보내기", createdBy);
        createTranslationIfNotExists("translation.translationTab.addTranslation", languageCode, "번역 추가", createdBy);
        createTranslationIfNotExists("translation.translationTab.languageLabel", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.keyNameLabel", languageCode, "번역 키 이름", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "번역 키", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "수정자", createdBy);
        createTranslationIfNotExists("translation.translationTab.deleteConfirm", languageCode, "정말로 이 번역을 삭제하시겠습니까?", createdBy);

        // 통계 탭
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "번역 완성도 통계", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.completionRateLabel", languageCode, "완성도", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.translatedCountLabel", languageCode, "번역됨", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.totalCountLabel", languageCode, "전체", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "프로젝트 선택", createdBy);
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "프로필", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "로그아웃", createdBy);

        // Organization Dashboard 번역 키들
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode, "총 조직 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode, "활성 조직", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode, "총 프로젝트 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode, "전체 프로젝트", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode, "총 테스트케이스", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode, "작성된 테스트케이스", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "총 사용자 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode, "등록된 사용자", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode, "총 프로젝트 참여", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode, "프로젝트 멤버십 수", createdBy);

        // 탭 관련
        createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode, "조직 현황", createdBy);
        createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode, "테스트 통계", createdBy);

        // 차트 제목들
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode, "조직별 프로젝트 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "프로젝트 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "멤버 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "조직 목록", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode, "테스트 결과 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode, "테스트 결과 상세", createdBy);

        // 조직 목록 항목들
        createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode, "프로젝트: {count}개", createdBy);
        createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode, "멤버: {count}명", createdBy);

        // 테스트 결과 상태들
        createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "실패", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "미실행", createdBy);

        // 테스트케이스 폼 관련 번역 키들 추가
        // TestCaseTree 컴포넌트 번역 키들
        createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "전체 선택", createdBy);
        createTranslationIfNotExists("testcase.tree.root", languageCode, "루트", createdBy);
        createTranslationIfNotExists("testcase.tree.title.select", languageCode, "테스트케이스 선택", createdBy);
        createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode, "프로젝트를 선택하세요.", createdBy);
        createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "테스트케이스가 없습니다.", createdBy);
        createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode, "이름을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "이름 변경에 실패했습니다: ", createdBy);
        createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode, "삭제 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("testcase.tree.ragVectorized", languageCode, "RAG 벡터화됨", createdBy);

        // 트리 액션 버튼들
        createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "선택 삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "리프레시", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "순서 저장", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "순서 편집", createdBy);
        createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.button.close", languageCode, "닫기", createdBy);

        // 트리 액션 메뉴
        createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "폴더 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "테스트케이스 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "하위 폴더 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "하위 테스트케이스 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "이름 변경", createdBy);
        createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "버전 히스토리", createdBy);

        // 트리 다이얼로그들
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "선택 삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode, "{count}개 항목(하위 포함)을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "삭제 확인", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode, "정말로 삭제하시겠습니까? (하위 항목 포함)", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "오류", createdBy);

        // 트리 토글 버튼 툴팁
        createTranslationIfNotExists("testcase.tree.tooltip.open", languageCode, "테스트케이스 트리 열기", createdBy);
        createTranslationIfNotExists("testcase.tree.tooltip.close", languageCode, "테스트케이스 트리 닫기", createdBy);

        // 트리 통계 카운트
        createTranslationIfNotExists("testcase.tree.count.testcases", languageCode, "테스트케이스: {count}개", createdBy);
        createTranslationIfNotExists("testcase.tree.count.folders", languageCode, "폴더: {count}개", createdBy);
        createTranslationIfNotExists("testcase.tree.count.total", languageCode, "전체: {count}개", createdBy);

        // TestCaseForm 컴포넌트 번역 키들
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "테스트케이스 수정", createdBy);
        createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "순서", createdBy);
        createTranslationIfNotExists("testcase.form.createdBy", languageCode, "작성자", createdBy);
        createTranslationIfNotExists("testcase.form.updatedBy", languageCode, "수정자", createdBy);
        createTranslationIfNotExists("testcase.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("testcase.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testcase.form.testSteps", languageCode, "테스트 스텝", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "Expected Results", createdBy);
        createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "사전 조건", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step 설명", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "예상 결과", createdBy);
        createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode, "전체 예상 결과", createdBy);

        // 폼 플레이스홀더들
        createTranslationIfNotExists("testcase.form.folderName", languageCode, "폴더 이름", createdBy);
        createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "폴더 설명", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "테스트케이스 이름", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "테스트케이스 설명", createdBy);

        // 폼 헬퍼 텍스트들
        createTranslationIfNotExists("testcase.helper.description", languageCode, "설명을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "사전 조건을 입력하세요.", createdBy);

        // 폼 버튼들
        createTranslationIfNotExists("testcase.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("testcase.button.saving", languageCode, "저장 중...", createdBy);
        createTranslationIfNotExists("testcase.button.addStep", languageCode, "스텝 추가", createdBy);

        // 폼 메시지들
        createTranslationIfNotExists("testcase.message.selectProject", languageCode, "프로젝트를 먼저 선택하세요.", createdBy);
        createTranslationIfNotExists("testcase.message.selectOrCreate", languageCode, "테스트케이스를 선택하거나 새로 만드세요.", createdBy);
        createTranslationIfNotExists("testcase.message.addSteps", languageCode, "스텝을 추가하세요.", createdBy);
        createTranslationIfNotExists("testcase.message.saved", languageCode, "저장되었습니다.", createdBy);

        // 폼 검증 메시지들
        createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "이름을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Step을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode, "전체 예상 결과를 입력하세요.", createdBy);

        // 폼 에러 메시지들
        createTranslationIfNotExists("testcase.error.saveError", languageCode, "저장 중 오류가 발생했습니다.", createdBy);

        // 폴더/테스트케이스 정보 섹션들
        createTranslationIfNotExists("testcase.folder.info.title", languageCode, "폴더 정보", createdBy);
        createTranslationIfNotExists("testcase.info.title", languageCode, "테스트케이스 정보", createdBy);
        createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "테스트 폴더 수정", createdBy);
        createTranslationIfNotExists("testcase.form.folder.create", languageCode, "테스트 폴더 생성", createdBy);

        // 버전 관리 관련
        createTranslationIfNotExists("testcase.version.button.create", languageCode, "버전 생성", createdBy);
        createTranslationIfNotExists("testcase.version.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.version.button.creating", languageCode, "생성 중...", createdBy);
        createTranslationIfNotExists("testcase.version.current.fetchError", languageCode, "현재 버전 조회 실패:", createdBy);
        createTranslationIfNotExists("testcase.version.error.notSaved", languageCode, "저장된 테스트케이스에만 버전을 생성할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.version.error.folderNotAllowed", languageCode, "폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.version.error.createFailed", languageCode, "버전 생성에 실패했습니다.", createdBy);
        createTranslationIfNotExists("testcase.version.error.createError", languageCode, "버전 생성 실패:", createdBy);
        createTranslationIfNotExists("testcase.version.validation.labelRequired", languageCode, "버전 라벨을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.version.defaultDescription", languageCode, "수동 버전 생성", createdBy);

        // 버전 다이얼로그
        createTranslationIfNotExists("testcase.version.dialog.title", languageCode, "수동 버전 생성", createdBy);
        createTranslationIfNotExists("testcase.version.form.label", languageCode, "버전 라벨", createdBy);
        createTranslationIfNotExists("testcase.version.form.labelPlaceholder", languageCode, "예: v2.1 수정사항 반영", createdBy);
        createTranslationIfNotExists("testcase.version.form.labelHelperText", languageCode, "버전을 식별할 수 있는 라벨을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.version.form.description", languageCode, "버전 설명", createdBy);
        createTranslationIfNotExists("testcase.version.form.descriptionPlaceholder", languageCode, "이 버전에서 변경된 내용을 상세히 설명하세요.", createdBy);
        createTranslationIfNotExists("testcase.version.form.descriptionHelperText", languageCode, "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.", createdBy);

        // TestCaseSpreadsheet 컴포넌트 번역 키들
        createTranslationIfNotExists("testcase.spreadsheet.header.title", languageCode, "테스트케이스 스프레드시트", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.rows", languageCode, "{count}개 행", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.steps", languageCode, "{count}개 스텝", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.changed", languageCode, "변경됨", createdBy);

        // 스프레드시트 버튼들
        createTranslationIfNotExists("testcase.spreadsheet.button.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addRows", languageCode, "행 추가", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addFolder", languageCode, "폴더 추가", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.validate", languageCode, "검증", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.export", languageCode, "Export", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.save", languageCode, "일괄 저장", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.saving", languageCode, "저장 중...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.stepManagement", languageCode, "스텝 관리", createdBy);

        // 스프레드시트 컬럼 헤더
        createTranslationIfNotExists("testcase.spreadsheet.column.createdBy", languageCode, "작성자", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.updatedBy", languageCode, "수정자", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.order", languageCode, "순서", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.type", languageCode, "타입", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.parentFolder", languageCode, "상위폴더", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.preCondition", languageCode, "사전조건", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.expectedResults", languageCode, "예상결과", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.step", languageCode, "Step {number}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.expected", languageCode, "Expected {number}", createdBy);

        // 테스트케이스 타입
        createTranslationIfNotExists("testcase.type.folder", languageCode, "폴더", createdBy);
        createTranslationIfNotExists("testcase.type.testcase", languageCode, "테스트케이스", createdBy);

        // 스프레드시트 사용법 안내
        createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "사용법:", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode, "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode, "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode, "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).", createdBy);

        // 고급 스프레드시트 기능 안내
        createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "고급 기능:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode, "셀 내에서 Enter로 줄바꿈이 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode, "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode, "다중 선택:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode, "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode, "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.", createdBy);

        // 스프레드시트 스텝 메뉴
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "스텝 추가 ({count}개)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode, "스텝 제거 ({count}개)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "스텝 수 직접 설정...", createdBy);

        // 스프레드시트 스텝 다이얼로그
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "스텝 수 설정", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode, "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "스텝 수", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode, "1개부터 10개까지 설정 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "적용", createdBy);

        // 스프레드시트 폴더 다이얼로그
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.title", languageCode, "새 폴더 생성", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.description", languageCode, "새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.label", languageCode, "폴더명", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.placeholder", languageCode, "예: API 테스트, UI 테스트", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.create", languageCode, "생성", createdBy);

        // 스프레드시트 Export 메뉴
        createTranslationIfNotExists("testcase.spreadsheet.export.csv.title", languageCode, "CSV로 내보내기", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.csv.description", languageCode, "스프레드시트 호환 형식", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.excel.title", languageCode, "Excel로 내보내기", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.excel.description", languageCode, "Microsoft Excel 형식 (.xlsx)", createdBy);

        // 스프레드시트 Fallback 모드
        createTranslationIfNotExists("testcase.spreadsheet.fallback.title", languageCode, "향상된 스프레드시트 모드", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.fallback.description", languageCode, "모든 기능이 정상적으로 작동합니다. 셀 편집, 복사/붙여넣기, 일괄 저장을 지원합니다.", createdBy);

        // 스프레드시트 에러 메시지
        createTranslationIfNotExists("testcase.spreadsheet.error.title", languageCode, "스프레드시트 로딩 오류", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.error.description", languageCode, "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.", createdBy);

        // 스프레드시트 플레이스홀더
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.multiline", languageCode, "여러 줄 입력 가능...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.text", languageCode, "텍스트 입력...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.columnInput", languageCode, "{title} 입력...", createdBy);

        // 스프레드시트 메시지
        createTranslationIfNotExists("testcase.spreadsheet.message.saveSuccess", languageCode, "{count}개의 테스트케이스가 저장되었습니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.saveError", languageCode, "저장 중 오류가 발생했습니다: {error}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.refreshSuccess", languageCode, "최신 데이터로 새로고침되었습니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.refreshError", languageCode, "새로고침 중 오류가 발생했습니다: {error}", createdBy);

        // ICT-373: 배치 저장 관련 메시지
        createTranslationIfNotExists("testcase.spreadsheet.message.noChanges", languageCode, "변경된 항목이 없습니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.batchSaveSuccess", languageCode, "✅ 배치 저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.batchSavePartialFailure", languageCode, "⚠️ 배치 저장 부분 실패:\n✅ 성공: {successCount}개\n❌ 실패: {failureCount}개\n\n", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.failureDetails", languageCode, "실패 내역:\n", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.moreErrors", languageCode, "... 외 {count}개 오류\n", createdBy);

        // 스프레드시트 스텝 메뉴
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "스텝 추가 ({count}개)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode, "스텝 제거 ({count}개)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "스텝 수 직접 설정...", createdBy);

        // 스프레드시트 스텝 다이얼로그
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "스텝 수 설정", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode, "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "스텝 수", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode, "1개부터 10개까지 설정 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "적용", createdBy);

        // 스프레드시트 하단 정보
        createTranslationIfNotExists("testcase.spreadsheet.footer.info", languageCode, "* react-datasheet-grid 기반 고급 스프레드시트 • {count}개 스텝 • 줄바꿈 및 고급 편집 지원", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.footer.warning", languageCode, "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.", createdBy);

        // 스프레드시트 상태 표시
        createTranslationIfNotExists("testcase.spreadsheet.status.lineBreakSupport", languageCode, "줄바꿈 지원", createdBy);

        // 고급 스프레드시트 제목
        createTranslationIfNotExists("testcase.advancedGrid.title", languageCode, "고급 스프레드시트", createdBy);

        // InputModeToggle - 고급 스프레드시트 모드
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "고급 스프레드시트", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode, "고급 스프레드시트 모드", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.", createdBy);

        // Attachments 첨부파일 관련 한국어 번역들
        createTranslationIfNotExists("attachments.loading", languageCode, "첨부파일을 불러오는 중...", createdBy);
        createTranslationIfNotExists("attachments.empty", languageCode, "첨부파일이 없습니다.", createdBy);
        createTranslationIfNotExists("attachments.title", languageCode, "첨부파일", createdBy);
        createTranslationIfNotExists("attachments.button.download", languageCode, "다운로드", createdBy);
        createTranslationIfNotExists("attachments.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("attachments.delete.title", languageCode, "첨부파일 삭제", createdBy);
        createTranslationIfNotExists("attachments.delete.message", languageCode, "다음 파일을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("attachments.delete.warning", languageCode, "삭제된 파일은 복구할 수 없습니다.", createdBy);
        createTranslationIfNotExists("attachments.error.loadFailed", languageCode, "첨부파일 목록을 불러올 수 없습니다.", createdBy);
        createTranslationIfNotExists("attachments.error.loadError", languageCode, "첨부파일 목록을 불러오는 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("attachments.error.downloadError", languageCode, "파일 다운로드 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("attachments.error.deleteError", languageCode, "파일 삭제 중 오류가 발생했습니다.", createdBy);

        // Common 공통 버튼 한국어 번역들
        createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.button.delete", languageCode, "삭제", createdBy);

        // Input Mode 입력 모드 관련 한국어 번역들
        createTranslationIfNotExists("testcase.inputMode.title", languageCode, "입력 모드 선택", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "개별 폼", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "스프레드시트", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "고급 스프레드시트", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.description", languageCode, "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode, "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode, "개별 폼으로 상세 입력 (기존 방식)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode, "스프레드시트로 일괄 입력 (기본 버전)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.ariaLabel", languageCode, "폼 모드", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.ariaLabel", languageCode, "스프레드시트 모드", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode, "고급 스프레드시트 모드", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.status", languageCode, "📝 현재 {count}개의 테스트케이스가 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.features", languageCode, "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode, "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode, "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode, "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기", createdBy);
        createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode, "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.", createdBy);

        // JUnit 결과 대시보드 관련 번역 (한국어)
        createTranslationIfNotExists("junit.dashboard.title", languageCode, "테스트 결과 대시보드", createdBy);
        createTranslationIfNotExists("junit.dashboard.subtitle", languageCode, "{projectName} - 자동화 테스트 결과 분석", createdBy);
        createTranslationIfNotExists("junit.dashboard.upload", languageCode, "업로드", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "업로드 중...", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "테스트 결과 업로드", createdBy);
        createTranslationIfNotExists("junit.dashboard.refresh", languageCode, "새로고침", createdBy);

        // 헤더와 제목들
        createTranslationIfNotExists("junit.header.testResultDashboard", languageCode, "테스트 결과 대시보드", createdBy);
        createTranslationIfNotExists("junit.header.automationAnalysis", languageCode, "자동화 테스트 결과 분석", createdBy);

        // 통계 카드들
        createTranslationIfNotExists("junit.stats.passed", languageCode, "통과", createdBy);
        createTranslationIfNotExists("junit.stats.failed", languageCode, "실패", createdBy);
        createTranslationIfNotExists("junit.stats.error", languageCode, "에러", createdBy);
        createTranslationIfNotExists("junit.stats.skipped", languageCode, "스킵", createdBy);
        createTranslationIfNotExists("junit.stats.successRate", languageCode, "성공률", createdBy);
        createTranslationIfNotExists("junit.stats.passedTests", languageCode, "통과한 테스트", createdBy);
        createTranslationIfNotExists("junit.stats.failedTests", languageCode, "실패한 테스트", createdBy);
        createTranslationIfNotExists("junit.stats.errorTests", languageCode, "에러 발생", createdBy);
        createTranslationIfNotExists("junit.stats.averageSuccessRate", languageCode, "평균 성공률", createdBy);

        // 탭 레이블들
        createTranslationIfNotExists("junit.tab.overview", languageCode, "개요", createdBy);
        createTranslationIfNotExists("junit.tab.recentResults", languageCode, "최근 결과", createdBy);
        createTranslationIfNotExists("junit.tab.statisticsChart", languageCode, "통계 차트", createdBy);
        createTranslationIfNotExists("junit.tab.trendAnalysis", languageCode, "트렌드 분석", createdBy);

        // 차트 제목들
        createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode, "테스트 상태 분포", createdBy);
        createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode, "최근 실행 결과", createdBy);
        createTranslationIfNotExists("junit.chart.successRateTrend", languageCode, "성공률 트렌드", createdBy);
        createTranslationIfNotExists("junit.chart.detailedStatistics", languageCode, "상세 통계 정보", createdBy);

        // 테이블 헤더들
        createTranslationIfNotExists("junit.table.executionName", languageCode, "실행 이름", createdBy);
        createTranslationIfNotExists("junit.table.fileName", languageCode, "파일명", createdBy);
        createTranslationIfNotExists("junit.table.totalTests", languageCode, "총 테스트", createdBy);
        createTranslationIfNotExists("junit.table.successRate", languageCode, "성공률", createdBy);
        createTranslationIfNotExists("junit.table.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("junit.table.uploadTime", languageCode, "업로드 시간", createdBy);
        createTranslationIfNotExists("junit.table.actions", languageCode, "작업", createdBy);

        // 버튼들과 액션들
        createTranslationIfNotExists("junit.button.viewDetail", languageCode, "상세 보기", createdBy);
        createTranslationIfNotExists("junit.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("junit.button.backToAutomation", languageCode, "자동화 테스트로 돌아가기", createdBy);

        // 메시지들
        createTranslationIfNotExists("junit.message.noResults", languageCode, "테스트 결과가 없습니다", createdBy);
        createTranslationIfNotExists("junit.message.uploadFirst", languageCode, "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.", createdBy);
        createTranslationIfNotExists("junit.message.firstUpload", languageCode, "첫 번째 테스트 결과 업로드", createdBy);
        createTranslationIfNotExists("junit.message.loadingResults", languageCode, "테스트 결과를 불러오는 중...", createdBy);
        createTranslationIfNotExists("junit.message.loadFailed", languageCode, "테스트 결과를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("junit.message.noData", languageCode, "테스트 결과가 없습니다.", createdBy);
        createTranslationIfNotExists("junit.message.trendDataInsufficient", languageCode, "트렌드 분석을 위한 데이터가 부족합니다.", createdBy);
        createTranslationIfNotExists("junit.message.statisticsImplementing", languageCode, "통계 차트 구현 예정", createdBy);
        createTranslationIfNotExists("junit.message.selectProject", languageCode, "프로젝트를 먼저 선택해주세요.", createdBy);
        createTranslationIfNotExists("junit.message.deletingResult", languageCode, "정말로 이 테스트 결과를 삭제하시겠습니까?", createdBy);

        // 업로드 다이얼로그 관련
        createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "JUnit XML 파일 업로드", createdBy);
        createTranslationIfNotExists("junit.upload.dragDrop", languageCode, "JUnit XML 파일을 드래그하거나 클릭하여 선택", createdBy);
        createTranslationIfNotExists("junit.upload.selectFile", languageCode, "파일 선택", createdBy);
        createTranslationIfNotExists("junit.upload.selectAnother", languageCode, "다른 파일 선택", createdBy);
        createTranslationIfNotExists("junit.upload.maxSize", languageCode, "최대 {maxSize}까지 업로드 가능", createdBy);
        createTranslationIfNotExists("junit.upload.allowedFormats", languageCode, "허용 형식: {formats}", createdBy);
        createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "테스트 실행 정보", createdBy);
        createTranslationIfNotExists("junit.upload.executionName", languageCode, "실행 이름 (예: Sprint 24 Integration Tests)", createdBy);
        createTranslationIfNotExists("junit.upload.description", languageCode, "설명 (선택사항)", createdBy);
        createTranslationIfNotExists("junit.upload.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("junit.upload.fileSize", languageCode, "크기: {size}", createdBy);

        // 날짜 관련
        createTranslationIfNotExists("junit.date.noInfo", languageCode, "날짜 정보 없음", createdBy);
        createTranslationIfNotExists("junit.date.unknown", languageCode, "알 수 없는 날짜 형식", createdBy);
        createTranslationIfNotExists("junit.date.invalid", languageCode, "유효하지 않은 날짜", createdBy);
        createTranslationIfNotExists("junit.date.error", languageCode, "날짜 처리 오류", createdBy);

        // JUnit 결과 상세 페이지 관련
        createTranslationIfNotExists("junit.detail.title", languageCode, "JUnit 테스트 결과 상세", createdBy);
        createTranslationIfNotExists("junit.detail.uploadInfo", languageCode, "업로드: {date} | {uploader}", createdBy);
        createTranslationIfNotExists("junit.detail.loadingDetail", languageCode, "테스트 결과 상세 정보를 불러오는 중...", createdBy);
        createTranslationIfNotExists("junit.detail.loadFailedDetail", languageCode, "테스트 결과 상세 정보를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.notFound", languageCode, "테스트 결과를 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDF", languageCode, "PDF 내보내기", createdBy);
        createTranslationIfNotExists("junit.detail.exportingPDF", languageCode, "PDF 생성 중...", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSV", languageCode, "CSV 내보내기", createdBy);
        createTranslationIfNotExists("junit.detail.exportingCSV", languageCode, "CSV 생성 중...", createdBy);
        createTranslationIfNotExists("junit.detail.versionManagement", languageCode, "버전 관리", createdBy);

        // 탭 - JUnit 상세
        createTranslationIfNotExists("junit.detail.tab.testCases", languageCode, "테스트 케이스", createdBy);
        createTranslationIfNotExists("junit.detail.tab.failedTests", languageCode, "실패한 테스트", createdBy);
        createTranslationIfNotExists("junit.detail.tab.slowTests", languageCode, "느린 테스트", createdBy);

        // JUnit 상세 페이지 추가 한국어 번역
        createTranslationIfNotExists("junit.detail.backToAutomation", languageCode, "자동화 테스트로 돌아가기", createdBy);
        createTranslationIfNotExists("junit.detail.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("junit.detail.noDateInfo", languageCode, "날짜 정보 없음", createdBy);
        createTranslationIfNotExists("junit.detail.unknownDateFormat", languageCode, "알 수 없는 날짜 형식", createdBy);
        createTranslationIfNotExists("junit.detail.invalidDate", languageCode, "유효하지 않은 날짜", createdBy);
        createTranslationIfNotExists("junit.detail.dateProcessingError", languageCode, "날짜 처리 오류", createdBy);
        createTranslationIfNotExists("junit.detail.loadTestCasesFailed", languageCode, "테스트 케이스를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.testSuite", languageCode, "테스트 스위트", createdBy);
        createTranslationIfNotExists("junit.detail.testCaseSearch", languageCode, "테스트 케이스 검색...", createdBy);
        createTranslationIfNotExists("junit.detail.testName", languageCode, "테스트명", createdBy);
        createTranslationIfNotExists("junit.detail.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("junit.detail.original", languageCode, "원본", createdBy);
        createTranslationIfNotExists("junit.detail.failedTestCases", languageCode, "실패한 테스트 케이스", createdBy);
        createTranslationIfNotExists("junit.detail.noFailedTests", languageCode, "실패한 테스트 케이스가 없습니다!", createdBy);
        createTranslationIfNotExists("junit.detail.failureMessagePreview", languageCode, "실패 메시지 미리보기:", createdBy);
        createTranslationIfNotExists("junit.detail.clickForDetails", languageCode, "상세 내용을 보려면 테스트명을 클릭하세요", createdBy);
        createTranslationIfNotExists("junit.detail.slowestTests", languageCode, "가장 느린 테스트 케이스", createdBy);
        createTranslationIfNotExists("junit.detail.slowestTestsTop", languageCode, "가장 느린 테스트 케이스 (상위 {count}개)", createdBy);
        createTranslationIfNotExists("junit.detail.noExecutionTimeData", languageCode, "실행 시간 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFAlert", languageCode, "테스트 결과를 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFComplete", languageCode, "PDF 내보내기 완료", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFFailed", languageCode, "PDF 내보내기 실패", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFError", languageCode, "PDF 내보내기 중 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVAlert", languageCode, "내보낼 테스트 결과가 없습니다.", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVComplete", languageCode, "CSV 내보내기 완료", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVFailed", languageCode, "CSV 내보내기 실패", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVError", languageCode, "CSV 내보내기 중 오류가 발생했습니다", createdBy);

        // 공통 용어 한국어 번역
        createTranslationIfNotExists("common.unit.count", languageCode, "개", createdBy);
        createTranslationIfNotExists("common.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("common.all", languageCode, "전체", createdBy);

        // 테스트 스위트 관련
        createTranslationIfNotExists("junit.suite.testSuite", languageCode, "테스트 스위트", createdBy);
        createTranslationIfNotExists("junit.suite.all", languageCode, "전체", createdBy);
        createTranslationIfNotExists("junit.suite.search", languageCode, "테스트 케이스 검색...", createdBy);

        // 실패한 테스트 관련
        createTranslationIfNotExists("junit.failed.title", languageCode, "실패한 테스트 케이스 ({count}개)", createdBy);
        createTranslationIfNotExists("junit.failed.noFailures", languageCode, "실패한 테스트 케이스가 없습니다!", createdBy);
        createTranslationIfNotExists("junit.failed.failureMessage", languageCode, "실패 메시지 미리보기:", createdBy);
        createTranslationIfNotExists("junit.failed.clickForDetail", languageCode, "상세 내용을 보려면 테스트명을 클릭하세요", createdBy);

        // 느린 테스트 관련
        createTranslationIfNotExists("junit.slow.title", languageCode, "가장 느린 테스트 케이스 (상위 {count}개)", createdBy);
        createTranslationIfNotExists("junit.slow.noData", languageCode, "실행 시간 데이터가 없습니다.", createdBy);

        // 테스트 케이스 상세 패널 관련
        createTranslationIfNotExists("junit.testcase.selectCase", languageCode, "테스트 케이스를 선택하세요", createdBy);
        createTranslationIfNotExists("junit.testcase.loadingDetail", languageCode, "테스트 케이스 상세 정보 로드 중...", createdBy);
        createTranslationIfNotExists("junit.testcase.errorOccurred", languageCode, "오류 발생", createdBy);
        createTranslationIfNotExists("junit.testcase.noData", languageCode, "데이터 없음", createdBy);
        createTranslationIfNotExists("junit.testcase.noDetailInfo", languageCode, "테스트 케이스 상세 정보가 없습니다.", createdBy);
        createTranslationIfNotExists("junit.testcase.edit", languageCode, "테스트 케이스 편집", createdBy);
        createTranslationIfNotExists("junit.testcase.close", languageCode, "닫기", createdBy);

        // Tracelog 탭 관련
        createTranslationIfNotExists("junit.tracelog.tab", languageCode, "Tracelog", createdBy);
        createTranslationIfNotExists("junit.tracelog.failureMessage", languageCode, "Failure Message", createdBy);
        createTranslationIfNotExists("junit.tracelog.stackTrace", languageCode, "Stack Trace", createdBy);
        createTranslationIfNotExists("junit.tracelog.skipMessage", languageCode, "Skip Message", createdBy);
        createTranslationIfNotExists("junit.tracelog.noErrorLog", languageCode, "이 테스트 케이스에는 오류 로그가 없습니다.", createdBy);

        // Test Body 탭 관련
        createTranslationIfNotExists("junit.testbody.tab", languageCode, "Test Body", createdBy);
        createTranslationIfNotExists("junit.testbody.systemOut", languageCode, "System Out", createdBy);
        createTranslationIfNotExists("junit.testbody.systemErr", languageCode, "System Error", createdBy);
        createTranslationIfNotExists("junit.testbody.noOutput", languageCode, "이 테스트 케이스에는 시스템 출력이 없습니다.", createdBy);
        createTranslationIfNotExists("junit.testbody.fullscreen", languageCode, "전체화면으로 보기", createdBy);
        createTranslationIfNotExists("junit.testbody.fullscreenTitle", languageCode, "Test Body - {testName}", createdBy);

        // RecentTestResults 컴포넌트 관련 키들
        createTranslationIfNotExists("recentResults.status.notRun", languageCode, "미실행", createdBy);
        createTranslationIfNotExists("recentResults.status.unknown", languageCode, "알 수 없음", createdBy);
        createTranslationIfNotExists("recentResults.message.noResults", languageCode, "최근 테스트 결과가 없습니다.", createdBy);
        createTranslationIfNotExists("recentResults.title.withCount", languageCode, "최근 테스트 결과 ({count}개)", createdBy);
        createTranslationIfNotExists("recentResults.button.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("recentResults.label.testcase", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("recentResults.label.project", languageCode, "프로젝트:", createdBy);
        createTranslationIfNotExists("recentResults.label.execution", languageCode, "실행:", createdBy);
        createTranslationIfNotExists("recentResults.label.executor", languageCode, "실행자:", createdBy);
        createTranslationIfNotExists("recentResults.label.notes", languageCode, "메모:", createdBy);
        createTranslationIfNotExists("recentResults.testcase.fallback", languageCode, "테스트케이스 {id}", createdBy);

        // JunitResultDashboard 추가 하드코딩 텍스트들
        createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode, "최근 테스트 실행 결과", createdBy);
        createTranslationIfNotExists("junit.fallback.noName", languageCode, "(이름 없음)", createdBy);
        createTranslationIfNotExists("junit.error.loadFailed", languageCode, "테스트 결과를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("junit.confirm.deleteResult", languageCode, "정말로 이 테스트 결과를 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("junit.comment.fileNameExtraction", languageCode, "파일명에서 실행 이름 추출", createdBy);

        // TestResult 상태 라벨 번역 (testResultConstants.js에서 사용)
        createTranslationIfNotExists("testResult.status.pass", languageCode, "성공", createdBy);
        createTranslationIfNotExists("testResult.status.fail", languageCode, "실패", createdBy);
        createTranslationIfNotExists("testResult.status.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("testResult.status.notRun", languageCode, "미실행", createdBy);
        createTranslationIfNotExists("testResult.status.skipped", languageCode, "건너뜀", createdBy);
        createTranslationIfNotExists("testResult.status.unknown", languageCode, "알 수 없음", createdBy);

        // JUnit 상태 라벨 번역 (junitResultService.js에서 사용)
        createTranslationIfNotExists("junit.status.uploading", languageCode, "업로드중", createdBy);
        createTranslationIfNotExists("junit.status.parsing", languageCode, "파싱중", createdBy);
        createTranslationIfNotExists("junit.status.completed", languageCode, "완료", createdBy);
        createTranslationIfNotExists("junit.status.unknown", languageCode, "알 수 없음", createdBy);

        // JUnit 입력 필드 placeholder 번역
        createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "실행 이름 (예: Sprint 24 Integration Tests)", createdBy);

        // 사용자 프로필 관련 한국어 번역
        createTranslationIfNotExists("profile.title", languageCode, "사용자 프로필", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "기본 정보", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "언어 설정", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA 설정", createdBy);

        // 프로필 폼 관련
        createTranslationIfNotExists("profile.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "이메일", createdBy);

        // 프로필 검증 메시지
        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "이름과 이메일을 모두 입력하세요.", createdBy);

        // 프로필 성공/오류 메시지
        createTranslationIfNotExists("profile.success.updated", languageCode, "정보가 성공적으로 변경되었습니다.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "정보 변경에 실패했습니다.", createdBy);

        // 언어 설정 관련
        createTranslationIfNotExists("language.settings.title", languageCode, "언어 설정", createdBy);
        createTranslationIfNotExists("language.settings.description", languageCode, "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.", createdBy);
        createTranslationIfNotExists("language.interface", languageCode, "인터페이스 언어", createdBy);
        createTranslationIfNotExists("language.helperText", languageCode, "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.", createdBy);
        createTranslationIfNotExists("language.current", languageCode, "현재 언어", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);

        // JIRA 관련
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA 통합 설정", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode, "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "설정 수정", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "설정 삭제", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA 설정이 저장되었습니다.", createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA 설정이 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "JIRA 설정 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "JIRA 설정 삭제 실패", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "로그인이 만료되었습니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode, "JIRA 설정을 삭제하시겠습니까?", createdBy);

        // 사용자 프로필 - JIRA 설정 (profile.jira.*)
        createTranslationIfNotExists("profile.jira.settings.title", languageCode, "JIRA 통합 설정", createdBy);
        createTranslationIfNotExists("profile.jira.settings.description", languageCode, "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.", createdBy);
        createTranslationIfNotExists("profile.jira.button.configure", languageCode, "설정 수정", createdBy);
        createTranslationIfNotExists("profile.jira.button.delete", languageCode, "설정 삭제", createdBy);
        createTranslationIfNotExists("profile.jira.confirm.delete", languageCode, "JIRA 설정을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("profile.jira.success.saved", languageCode, "JIRA 설정이 저장되었습니다.", createdBy);
        createTranslationIfNotExists("profile.jira.success.deleted", languageCode, "JIRA 설정이 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("profile.jira.error.saveFailed", languageCode, "JIRA 설정 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("profile.jira.error.deleteFailed", languageCode, "JIRA 설정 삭제 실패", createdBy);
        createTranslationIfNotExists("profile.jira.error.network", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
        createTranslationIfNotExists("profile.jira.error.authentication", languageCode, "로그인이 만료되었습니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("profile.jira.error.encryption", languageCode, "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.", createdBy);

        // JiraStatusIndicator 컴포넌트 관련
        createTranslationIfNotExists("jira.indicator.checkingStatus", languageCode, "확인 중...", createdBy);
        createTranslationIfNotExists("jira.indicator.unknown", languageCode, "알 수 없음", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailed", languageCode, "연결 실패", createdBy);
        createTranslationIfNotExists("jira.indicator.setupRequired", languageCode, "JIRA와 연동하려면 먼저 설정을 완료해주세요.", createdBy);
        createTranslationIfNotExists("jira.indicator.setupButton", languageCode, "JIRA 설정하기", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsButton", languageCode, "설정", createdBy);
        createTranslationIfNotExists("jira.indicator.refreshTooltip", languageCode, "상태 새로고침", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsTooltip", languageCode, "JIRA 설정", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionInfo", languageCode, "연결 정보", createdBy);
        createTranslationIfNotExists("jira.indicator.server", languageCode, "서버", createdBy);
        createTranslationIfNotExists("jira.indicator.user", languageCode, "사용자", createdBy);
        createTranslationIfNotExists("jira.indicator.lastTested", languageCode, "마지막 확인", createdBy);
        createTranslationIfNotExists("jira.indicator.lastUpdate", languageCode, "업데이트", createdBy);
        createTranslationIfNotExists("jira.indicator.error", languageCode, "오류", createdBy);
        createTranslationIfNotExists("jira.indicator.connectedMessage", languageCode, "JIRA 서버와 정상적으로 연결되었습니다.", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailedMessage", languageCode, "JIRA 서버 연결에 실패했습니다.", createdBy);

        // JiraConfigDialog 컴포넌트 관련
        createTranslationIfNotExists("jira.config.dialogTitle.add", languageCode, "JIRA 설정 추가", createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.edit", languageCode, "JIRA 설정 수정", createdBy);
        createTranslationIfNotExists("jira.config.serverUrl", languageCode, "JIRA 서버 URL", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlPlaceholder", languageCode, "https://your-domain.atlassian.net", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlHelper", languageCode, "JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)", createdBy);
        createTranslationIfNotExists("jira.config.username", languageCode, "사용자명 (이메일)", createdBy);
        createTranslationIfNotExists("jira.config.usernamePlaceholder", languageCode, "user@company.com", createdBy);
        createTranslationIfNotExists("jira.config.usernameHelper", languageCode, "JIRA 로그인에 사용하는 이메일 주소", createdBy);
        createTranslationIfNotExists("jira.config.apiToken", languageCode, "API 토큰", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenHelper", languageCode, "JIRA API 토큰을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKey", languageCode, "테스트 프로젝트 키 (선택사항)", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyPlaceholder", languageCode, "TEST", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyHelper", languageCode, "연결 테스트 시 사용할 프로젝트 키 (선택사항)", createdBy);
        createTranslationIfNotExists("jira.config.autoTest", languageCode, "저장 전 자동으로 연결 테스트 수행", createdBy);
        createTranslationIfNotExists("jira.config.testButton", languageCode, "연결 테스트", createdBy);
        createTranslationIfNotExists("jira.config.testing", languageCode, "테스트 중...", createdBy);
        createTranslationIfNotExists("jira.config.testSuccess", languageCode, "연결 성공", createdBy);
        createTranslationIfNotExists("jira.config.testFailed", languageCode, "연결 실패", createdBy);
        createTranslationIfNotExists("jira.config.jiraVersion", languageCode, "JIRA 버전", createdBy);
        createTranslationIfNotExists("jira.config.testTime", languageCode, "테스트 시각", createdBy);
        createTranslationIfNotExists("jira.config.availableProjects", languageCode, "사용 가능한 프로젝트:", createdBy);
        createTranslationIfNotExists("jira.config.moreProjects", languageCode, "외 {count}개 프로젝트", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenGuide", languageCode, "API 토큰 생성 방법:", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep1", languageCode, "1. JIRA → 프로필 → 계정 설정 → 보안", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep2", languageCode, "2. \"API 토큰 만들기\" 클릭", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep3", languageCode, "3. 토큰 이름 입력 후 생성", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep4", languageCode, "4. 생성된 토큰을 복사하여 위에 입력", createdBy);
        createTranslationIfNotExists("jira.config.cancelButton", languageCode, "취소", createdBy);
        createTranslationIfNotExists("jira.config.saveButton", languageCode, "저장", createdBy);
        createTranslationIfNotExists("jira.config.saving", languageCode, "저장 중...", createdBy);
        createTranslationIfNotExists("jira.config.error.serverUrlRequired", languageCode, "JIRA 서버 URL을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.invalidUrl", languageCode, "올바른 URL 형식을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.usernameRequired", languageCode, "사용자명을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.apiTokenRequired", languageCode, "API 토큰을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.connectionTestFailed", languageCode, "연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.config.error.testError", languageCode, "연결 테스트 중 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("jira.config.confirm.saveWithoutTest", languageCode, "JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?", createdBy);
        createTranslationIfNotExists("jira.config.error.general", languageCode, "설정 저장 중 오류가 발생했습니다.", createdBy);

        // API 응답 메시지 번역
        createTranslationIfNotExists("jira.api.connectionSuccess", languageCode, "JIRA 연결 성공", createdBy);
        createTranslationIfNotExists("jira.api.authFailure", languageCode, "인증 실패 또는 권한 부족", createdBy);
        createTranslationIfNotExists("jira.api.serverError", languageCode, "JIRA 서버 오류", createdBy);
        createTranslationIfNotExists("jira.api.networkError", languageCode, "네트워크 연결 실패", createdBy);
        createTranslationIfNotExists("jira.api.testFailure", languageCode, "연결 테스트 실패", createdBy);
        createTranslationIfNotExists("jira.api.unknownError", languageCode, "알 수 없는 오류", createdBy);

        // 비밀번호 관련 번역 (AuthKeysInitializer에서 정의한 키들)
        createTranslationIfNotExists("password.requirements.title", languageCode, "비밀번호 요구사항:", createdBy);
        createTranslationIfNotExists("password.requirements.length", languageCode, "8-100자 길이", createdBy);
        createTranslationIfNotExists("password.requirements.letter", languageCode, "영문 포함", createdBy);
        createTranslationIfNotExists("password.requirements.digit", languageCode, "숫자 포함", createdBy);
        createTranslationIfNotExists("password.requirements.special", languageCode, "특수문자 포함", createdBy);
        createTranslationIfNotExists("password.requirements.combination", languageCode, "2가지 이상 조합", createdBy);
        createTranslationIfNotExists("password.success.changed", languageCode, "비밀번호가 성공적으로 변경되었습니다.", createdBy);
        createTranslationIfNotExists("password.error.changeFailed", languageCode, "비밀번호 변경 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("password.validation.newRequired", languageCode, "새 비밀번호를 입력해주세요", createdBy);
        createTranslationIfNotExists("password.validation.confirmRequired", languageCode, "비밀번호 확인을 입력해주세요", createdBy);
        createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode, "새 비밀번호는 현재 비밀번호와 달라야 합니다", createdBy);

        // 공통 버튼
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);

        // 컬럼 순서 변경 다이얼로그
        createTranslationIfNotExists("testResult.orderDialog.title", languageCode, "컬럼 순서 변경", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.description", languageCode, "위/아래 화살표 버튼을 사용하여 컬럼 순서를 변경하세요", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.visible", languageCode, "표시", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.hidden", languageCode, "숨김", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.apply", languageCode, "순서 적용", createdBy);

        // 테스트 결과 내보내기 다이얼로그
        createTranslationIfNotExists("testResult.export.dialog.title", languageCode, "테스트 결과 내보내기", createdBy);
        createTranslationIfNotExists("testResult.export.section.format", languageCode, "📄 내보내기 형식 선택", createdBy);
        createTranslationIfNotExists("testResult.export.section.info", languageCode, "📋 내보내기 정보", createdBy);

        // Excel 형식
        createTranslationIfNotExists("testResult.export.format.excel.title", languageCode, "Excel (.xlsx)", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.description", languageCode, "서식과 차트 포함, 업무용 보고서에 최적", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature1", languageCode, "통계 차트 포함", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature2", languageCode, "서식 유지", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature3", languageCode, "필터링 가능", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.alert", languageCode, "💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.", createdBy);

        // PDF 형식
        createTranslationIfNotExists("testResult.export.format.pdf.title", languageCode, "PDF (.pdf)", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.description", languageCode, "인쇄 및 공유용, 레이아웃 고정", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature1", languageCode, "인쇄 최적화", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature2", languageCode, "레이아웃 고정", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature3", languageCode, "범용 호환성", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.alert", languageCode, "🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.", createdBy);

        // CSV 형식
        createTranslationIfNotExists("testResult.export.format.csv.title", languageCode, "CSV (.csv)", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.description", languageCode, "데이터 분석용, 가벼운 파일 크기", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature1", languageCode, "데이터 분석 최적", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature2", languageCode, "가벼운 용량", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature3", languageCode, "호환성 우수", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.alert", languageCode, "📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.", createdBy);

        // 내보내기 정보
        createTranslationIfNotExists("testResult.export.info.totalRows", languageCode, "📊 총 데이터 건수:", createdBy);
        createTranslationIfNotExists("testResult.export.info.totalRowsValue", languageCode, "{count}건", createdBy);
        createTranslationIfNotExists("testResult.export.info.columns", languageCode, "🔍 표시 컬럼 수:", createdBy);
        createTranslationIfNotExists("testResult.export.info.columnsValue", languageCode, "{count}개", createdBy);
        createTranslationIfNotExists("testResult.export.info.columnsList", languageCode, "📂 내보낼 컬럼:", createdBy);

        // 내보내기 진행 및 버튼
        createTranslationIfNotExists("testResult.export.progress.message", languageCode, "파일을 생성하고 있습니다... 잠시만 기다려주세요", createdBy);
        createTranslationIfNotExists("testResult.export.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testResult.export.button.export", languageCode, "{format} 내보내기", createdBy);
        createTranslationIfNotExists("testResult.export.button.exporting", languageCode, "생성 중...", createdBy);

        // 내보내기 오류 메시지
        createTranslationIfNotExists("testResult.export.error.noProject", languageCode, "프로젝트가 선택되지 않았습니다.", createdBy);
        createTranslationIfNotExists("testResult.export.error.failed", languageCode, "파일 내보내기 중 오류가 발생했습니다: {message}", createdBy);
        createTranslationIfNotExists("testResult.export.error.response", languageCode, "내보내기 실패: {status} {statusText}", createdBy);

        // ============================================
        // 조직 관리 (Organization Management) 번역
        // ============================================

        // 조직 관리 메인
        createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);

        // 조직 버튼들
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "새 조직 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "조직 보기", createdBy);
        createTranslationIfNotExists("organization.buttons.edit", languageCode, "조직 수정", createdBy);
        createTranslationIfNotExists("organization.buttons.invite", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.buttons.createProject", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "첫 번째 조직 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "첫 번째 프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.back", languageCode, "조직 목록으로", createdBy);
        createTranslationIfNotExists("organization.buttons.inviteMember", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.buttons.removeMember", languageCode, "멤버 제거", createdBy);
        createTranslationIfNotExists("organization.buttons.backToList", languageCode, "조직 목록으로", createdBy);
        createTranslationIfNotExists("organization.buttons.transferOwnership", languageCode, "소유권 이전", createdBy);
        createTranslationIfNotExists("organization.buttons.transfer", languageCode, "이전", createdBy);

        // 조직 메시지들
        createTranslationIfNotExists("organization.messages.noOrganizations", languageCode, "조직이 없습니다", createdBy);
        createTranslationIfNotExists("organization.messages.noProjects", languageCode, "이 조직에는 아직 프로젝트가 없습니다.", createdBy);
        createTranslationIfNotExists("organization.messages.createHint", languageCode, "새 조직을 생성하여 프로젝트와 팀을 관리해보세요.", createdBy);
        createTranslationIfNotExists("organization.messages.joinHint", languageCode, "조직에 참가하려면 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.accessDenied", languageCode, "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.canCreateNew", languageCode, "기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.", createdBy);
        createTranslationIfNotExists("organization.messages.noAccessContact", languageCode, "현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.notFound", languageCode, "조직을 찾을 수 없습니다.", createdBy);

        // 조직 폼 라벨들
        createTranslationIfNotExists("organization.form.name", languageCode, "조직 이름", createdBy);
        createTranslationIfNotExists("organization.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "조직에 대한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "조직 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.codeRequired", languageCode, "프로젝트 코드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.projectNameRequired", languageCode, "프로젝트 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.usernameRequired", languageCode, "사용자명을 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.username", languageCode, "사용자명", createdBy);
        createTranslationIfNotExists("organization.form.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("organization.form.projectCode", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("organization.form.projectName", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("organization.form.projectDescription", languageCode, "프로젝트 설명", createdBy);
        createTranslationIfNotExists("organization.form.projectCodePlaceholder", languageCode, "예: WEB_APP_TEST", createdBy);
        createTranslationIfNotExists("organization.form.projectNamePlaceholder", languageCode, "예: 웹 애플리케이션 테스트", createdBy);
        createTranslationIfNotExists("organization.form.projectDescriptionPlaceholder", languageCode, "프로젝트에 대한 간단한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.form.projectCodeHelp", languageCode, "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능", createdBy);
        createTranslationIfNotExists("organization.form.namePlaceholder", languageCode, "조직 이름을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.form.projectCodeRequired", languageCode, "프로젝트 코드를 입력해주세요.", createdBy);

        // 조직 다이얼로그 제목들
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "새 조직 생성", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "조직 수정", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "조직 삭제 확인", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.dialog.project.title", languageCode, "조직별 프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.dialog.editInfo.title", languageCode, "조직 정보 수정", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.info", languageCode, "'{organizationName}' 조직에 새 프로젝트가 생성됩니다.", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.title", languageCode, "소유권 이전", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.warning", languageCode, "조직의 소유권을 {name}님에게 이전하시겠습니까? 이 작업은 되돌릴 수 없으며, 귀하는 관리자 권한으로 변경됩니다.", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.newOwner", languageCode, "새로운 소유자", createdBy);

        // 조직 삭제 확인 메시지들
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "조직을 정말 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.", createdBy);

        // 조직 상세 페이지 관련
        createTranslationIfNotExists("organization.detail.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.detail.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.detail.organizationMembers", languageCode, "조직 멤버", createdBy);
        createTranslationIfNotExists("organization.detail.organizationProjects", languageCode, "조직 프로젝트", createdBy);

        // 조직 테이블 헤더들
        createTranslationIfNotExists("organization.table.user", languageCode, "사용자", createdBy);
        createTranslationIfNotExists("organization.table.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("organization.table.joinDate", languageCode, "가입일", createdBy);
        createTranslationIfNotExists("organization.table.actions", languageCode, "작업", createdBy);

        // 조직 멤버 관리 관련
        createTranslationIfNotExists("organization.member.remove", languageCode, "멤버 제거", createdBy);
        createTranslationIfNotExists("organization.member.username", languageCode, "사용자명", createdBy);
        createTranslationIfNotExists("organization.member.role", languageCode, "역할", createdBy);

        // 조직 프로젝트 관리 관련
        createTranslationIfNotExists("organization.project.code", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("organization.project.name", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("organization.project.description", languageCode, "프로젝트 설명", createdBy);
        createTranslationIfNotExists("organization.project.codePlaceholder", languageCode, "예: WEB_APP_TEST", createdBy);
        createTranslationIfNotExists("organization.project.namePlaceholder", languageCode, "예: 웹 애플리케이션 테스트", createdBy);
        createTranslationIfNotExists("organization.project.descriptionPlaceholder", languageCode, "프로젝트에 대한 간단한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.project.codeHelperText", languageCode, "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능", createdBy);
        createTranslationIfNotExists("organization.project.belongsTo", languageCode, "이 프로젝트는 조직에 속하게 됩니다.", createdBy);
        createTranslationIfNotExists("organization.project.noDescription", languageCode, "설명 없음", createdBy);
        createTranslationIfNotExists("organization.project.organizationLabel", languageCode, "소속 조직", createdBy);

        // 조직 대시보드 관련
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "멤버", createdBy);

        // 조직 탭 관련
        createTranslationIfNotExists("organization.tabs.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.tabs.projects", languageCode, "프로젝트", createdBy);

        // 조직 역할 관련
        createTranslationIfNotExists("organization.role.member", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.role.admin", languageCode, "관리자", createdBy);
        createTranslationIfNotExists("organization.role.owner", languageCode, "소유자", createdBy);

        // 조직 에러 관련
        createTranslationIfNotExists("organization.error.notFound", languageCode, "조직을 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("organization.error.idNotProvided", languageCode, "조직 ID가 제공되지 않았습니다.", createdBy);
        createTranslationIfNotExists("organization.error.dataLoadFailed", languageCode, "조직 데이터를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("organization.error.infoLoadFailed", languageCode, "조직 정보를 불러오는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("organization.error.editDialogFailed", languageCode, "수정 다이얼로그를 여는데 실패했습니다.", createdBy);
        createTranslationIfNotExists("organization.error.selectMember", languageCode, "이전할 멤버를 선택해주세요.", createdBy);
        createTranslationIfNotExists("organization.error.accessDenied", languageCode, "조직 접근 권한 없음", createdBy);
        createTranslationIfNotExists("organization.error.authRequired", languageCode, "인증 필요", createdBy);
        createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "리소스 없음", createdBy);
        createTranslationIfNotExists("organization.error.general", languageCode, "오류 발생", createdBy);
        createTranslationIfNotExists("organization.error.authDescription", languageCode, "로그인이 필요합니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("organization.error.notFoundDescription", languageCode, "요청한 리소스를 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("organization.error.generalDescription", languageCode, "문제가 지속되면 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "문제가 발생했습니다", createdBy);
        createTranslationIfNotExists("organization.error.occurredAt", languageCode, "발생 시간: {date}", createdBy);

        // ============================================
        // 사용자 역할 (User Role) 번역
        // ============================================

        // 사용자 역할 명칭
        createTranslationIfNotExists("user.role.admin", languageCode, "시스템 관리자", createdBy);
        createTranslationIfNotExists("user.role.manager", languageCode, "프로젝트 관리자", createdBy);
        createTranslationIfNotExists("user.role.tester", languageCode, "테스터", createdBy);
        createTranslationIfNotExists("user.role.user", languageCode, "일반 사용자", createdBy);

        // 사용자 역할 설명
        createTranslationIfNotExists("user.role.admin.description", languageCode, "모든 시스템 기능 접근 가능", createdBy);
        createTranslationIfNotExists("user.role.manager.description", languageCode, "프로젝트 관리 및 팀 리더십", createdBy);
        createTranslationIfNotExists("user.role.tester.description", languageCode, "테스트 케이스 작성 및 실행", createdBy);
        createTranslationIfNotExists("user.role.user.description", languageCode, "기본적인 시스템 사용", createdBy);

        // 누락된 번역 키들 추가
        createTranslationIfNotExists("testResult.message.error", languageCode, "오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "삭제에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "저장에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "삭제에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "네트워크 연결 오류", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "인증에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "암호화 처리 오류", createdBy);

        // 메일 설정 관련 누락된 번역 키들 추가 (첫 번째 그룹 10개)
        createTranslationIfNotExists("mail.manager.title", languageCode, "메일 설정 관리", createdBy);
        createTranslationIfNotExists("mail.manager.currentSettings", languageCode, "현재 메일 설정", createdBy);
        createTranslationIfNotExists("mail.manager.subheader", languageCode, "시스템 이메일 발송 설정 상태", createdBy);
        createTranslationIfNotExists("mail.manager.notConfigured", languageCode, "메일 설정이 구성되지 않았습니다. 새 설정을 추가해주세요.", createdBy);
        createTranslationIfNotExists("mail.status.enabled", languageCode, "메일 기능", createdBy);
        createTranslationIfNotExists("mail.status.active", languageCode, "활성", createdBy);
        createTranslationIfNotExists("mail.status.inactive", languageCode, "비활성", createdBy);
        createTranslationIfNotExists("mail.status.activatedStatus", languageCode, "활성화됨", createdBy);
        createTranslationIfNotExists("mail.status.deactivatedStatus", languageCode, "비활성화됨", createdBy);
        createTranslationIfNotExists("mail.smtp.server", languageCode, "SMTP 서버", createdBy);

        // 패스워드 관련 누락된 번역 키들 추가 (한국어)
        createTranslationIfNotExists("password.validation.minLength", languageCode, "최소 8자 이상이어야 합니다", createdBy);
        createTranslationIfNotExists("password.validation.maxLength", languageCode, "최대 100자까지 입력 가능합니다", createdBy);
        createTranslationIfNotExists("password.validation.complexity", languageCode, "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다", createdBy);
        createTranslationIfNotExists("password.validation.mismatch", languageCode, "새 비밀번호와 일치하지 않습니다", createdBy);
        createTranslationIfNotExists("password.validation.currentRequired", languageCode, "현재 비밀번호를 입력해주세요", createdBy);
        createTranslationIfNotExists("password.change.title", languageCode, "비밀번호 변경", createdBy);
        createTranslationIfNotExists("password.change.description", languageCode, "보안을 위해 정기적으로 비밀번호를 변경해주세요.", createdBy);
        createTranslationIfNotExists("password.form.current", languageCode, "현재 비밀번호", createdBy);
        createTranslationIfNotExists("password.form.new", languageCode, "새 비밀번호", createdBy);
        createTranslationIfNotExists("password.form.confirm", languageCode, "새 비밀번호 확인", createdBy);
        createTranslationIfNotExists("password.placeholder.current", languageCode, "현재 사용 중인 비밀번호를 입력하세요", createdBy);
        createTranslationIfNotExists("password.placeholder.new", languageCode, "새로운 비밀번호를 입력하세요 (8자 이상)", createdBy);
        createTranslationIfNotExists("password.placeholder.confirm", languageCode, "새 비밀번호를 다시 입력하세요", createdBy);
        createTranslationIfNotExists("password.button.change", languageCode, "비밀번호 변경", createdBy);
        createTranslationIfNotExists("password.button.changing", languageCode, "변경 중...", createdBy);

        // 사용자 프로필 다이얼로그 관련 (한국어)
        createTranslationIfNotExists("profile.title", languageCode, "사용자 프로필", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "기본 정보", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "언어 설정", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA 설정", createdBy);
        createTranslationIfNotExists("profile.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("profile.success.updated", languageCode, "정보가 성공적으로 변경되었습니다.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "정보 변경에 실패했습니다.", createdBy);

        // 공통 버튼 (한국어)
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);

        // 기타 누락된 번역 키들 추가 (한국어)
        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "이름과 이메일을 모두 입력해주세요.", createdBy);
        createTranslationIfNotExists("userProfile.edit.title", languageCode, "프로필 편집", createdBy);
        createTranslationIfNotExists("userProfile.edit.description", languageCode, "프로필 정보를 수정할 수 있습니다.", createdBy);

        // 사용자 상세 정보 관련 누락된 번역 키들 추가 (한국어) - 세 번째 그룹 10개
        createTranslationIfNotExists("userDetail.loading", languageCode, "사용자 정보를 불러오는 중...", createdBy);
        createTranslationIfNotExists("userDetail.title", languageCode, "사용자 정보", createdBy);
        createTranslationIfNotExists("userDetail.notFound", languageCode, "사용자 정보를 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("userDetail.editCancel.title", languageCode, "편집 취소", createdBy);
        createTranslationIfNotExists("userDetail.editCancel.message", languageCode, "편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?", createdBy);
        createTranslationIfNotExists("userDetail.validation.required", languageCode, "이름과 이메일은 필수 입력 항목입니다.", createdBy);
        createTranslationIfNotExists("userDetail.validation.emailFormat", languageCode, "올바른 이메일 형식을 입력해주세요.", createdBy);
        createTranslationIfNotExists("userDetail.error.saveError", languageCode, "저장 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("userDetail.section.basicInfo", languageCode, "기본 정보", createdBy);
        createTranslationIfNotExists("userDetail.button.close", languageCode, "닫기", createdBy);

        // Common 영역 누락된 번역 키들 추가 (네 번째 그룹 10개)
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "로그인이 필요합니다", createdBy);
        createTranslationIfNotExists("common.unauthorized.message", languageCode, "이 페이지에 접근하려면 로그인이 필요합니다.", createdBy);
        createTranslationIfNotExists("common.unauthorized.redirecting", languageCode, "로그인 페이지로 이동 중...", createdBy);
        createTranslationIfNotExists("common.loading.text", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("common.error.networkError", languageCode, "네트워크 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("common.error.serverError", languageCode, "서버 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("common.error.unknownError", languageCode, "알 수 없는 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("common.success.saved", languageCode, "성공적으로 저장되었습니다.", createdBy);
        createTranslationIfNotExists("common.success.deleted", languageCode, "성공적으로 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("common.confirm.delete", languageCode, "정말로 삭제하시겠습니까?", createdBy);

        // 추가 누락된 번역 키들 추가 (다섯 번째 그룹 10개)
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "참여 중인 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "프로젝트에 참여하려면 초대가 필요합니다.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "프로젝트 관리자에게 초대를 요청하세요.", createdBy);
        createTranslationIfNotExists("common.unauthorized.backToProjects", languageCode, "프로젝트 선택으로 돌아가기", createdBy);
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("common.status.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("common.status.error", languageCode, "오류 발생", createdBy);
        createTranslationIfNotExists("common.actions.view", languageCode, "보기", createdBy);
        createTranslationIfNotExists("common.actions.download", languageCode, "다운로드", createdBy);
        createTranslationIfNotExists("common.validation.required", languageCode, "필수 입력 항목입니다", createdBy);

        // UserDetail 관련 누락된 번역 키들 추가 (여섯 번째 그룹 10개)
        createTranslationIfNotExists("userDetail.status.active", languageCode, "활성", createdBy);
        createTranslationIfNotExists("userDetail.status.inactive", languageCode, "비활성", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "비밀번호 변경", createdBy);
        createTranslationIfNotExists("userDetail.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("userDetail.form.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("userDetail.form.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "계정 활성화", createdBy);

        // 프로젝트 다이얼로그 관련 누락된 번역 키들 추가 (일곱 번째 그룹 10개)
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "프로젝트 조직 이전", createdBy);
        createTranslationIfNotExists("project.dialog.transferDescription", languageCode, "'<strong>{projectName}</strong>' 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "프로젝트 강제 삭제 확인", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteConfirm", languageCode, "'<strong>{projectName}</strong>' 프로젝트를 정말 강제 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ 강제 삭제 경고", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteConfirm", languageCode, "'<strong>{projectName}</strong>' 프로젝트를 정말 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.", createdBy);
        createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode, "테스트 결과 첨부파일", createdBy);
        createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail 앱 비밀번호 설정 가이드", createdBy);

        // 메일 가이드 섹션 관련 누락된 번역 키들 추가 (여덟 번째 그룹 10개)
        createTranslationIfNotExists("mail.guide.requirements.header", languageCode, "📋 필수 요구사항", createdBy);
        createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode, "🔧 단계별 설정 방법", createdBy);
        createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 문제 해결", createdBy);
        createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 보안 주의사항", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "버튼", createdBy);
        createTranslationIfNotExists("attachments.button.download", languageCode, "다운로드", createdBy);
        createTranslationIfNotExists("attachments.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "리프레시", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "순서 저장", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "순서 편집", createdBy);

        // 프로젝트 툴팁 관련 누락된 번역 키들 추가 (아홉 번째 그룹 10개)
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "멤버 수", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "자동화 테스트 결과 수", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "자동화 테스트 상태", createdBy);
        createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Step을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step 설명", createdBy);
        createTranslationIfNotExists("recentResults.button.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("userList.button.refresh", languageCode, "새로고침", createdBy);

        // 사용자 리스트 및 기타 누락된 번역 키들 추가 (열 번째 그룹 10개)
        createTranslationIfNotExists("userList.button.export", languageCode, "데이터 내보내기", createdBy);
        createTranslationIfNotExists("userList.button.reset", languageCode, "초기화", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "결과 업로드", createdBy);
        createTranslationIfNotExists("junit.table.uploadTime", languageCode, "업로드 시간", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "업로드 중...", createdBy);
        createTranslationIfNotExists("junit.dashboard.upload", languageCode, "업로드", createdBy);
        createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("common.button.save", languageCode, "저장", createdBy);

        // 폼 설명, 가이드 및 플레이스홀더 관련 번역 키들 추가 (열한 번째 그룹 10개)
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "조직에 대한 설명을 입력하세요", createdBy);
        createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "실행 이름을 입력하세요", createdBy);

        // 누락된 placeholder 번역 키들 추가
        createTranslationIfNotExists("junit.editor.userDescriptionPlaceholder", languageCode, "이 테스트 케이스에 대한 상세한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("testcase.advancedFilter.searchPlaceholder", languageCode, "테스트케이스 이름, 설명, 단계 내용 검색...", createdBy);
        createTranslationIfNotExists("testResult.detailReport.searchPlaceholder", languageCode, "테스트 케이스명, 폴더 경로, 실행자 등", createdBy);
        createTranslationIfNotExists("preset.name.placeholder", languageCode, "예: 내 테스트 케이스", createdBy);

        createTranslationIfNotExists("testExecution.guide.title", languageCode, "테스트 실행 가이드", createdBy);
        createTranslationIfNotExists("testExecution.guide.hideGuide", languageCode, "가이드 숨기기", createdBy);
        createTranslationIfNotExists("testExecution.guide.showGuide", languageCode, "가이드 보기", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "설명", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "번역 키에 대한 설명을 입력하세요", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "단계 1: 테스트 플랜 선택", createdBy);

        // 테스트 실행 가이드 단계별 상세 내용 번역 키들 추가 (열두 번째 그룹 10개)
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "단계 2: 실행 정보 입력", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "테스트 실행명, 설명, 담당자 등 기본 정보를 입력합니다", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "단계 3: 테스트 케이스 확인", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "선택된 테스트 플랜의 케이스들을 확인하고 실행 순서를 조정할 수 있습니다", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "단계 4: 실행 시작", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "모든 정보를 확인 후 테스트 실행을 시작합니다", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "단계 5: 결과 입력", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "각 테스트 케이스별로 실행 결과를 입력합니다", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "단계 6: 실행 완료", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "모든 테스트 케이스 실행이 완료되면 전체 실행을 종료합니다", createdBy);

        // 대량 번역 키 추가 (13-17번째 그룹, 총 50개)
        // 13번째 그룹 - 공통 UI 요소들
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "권한 없음", createdBy);
        createTranslationIfNotExists("common.unauthorized.message", languageCode, "이 페이지에 접근할 권한이 없습니다", createdBy);
        createTranslationIfNotExists("common.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("common.all", languageCode, "전체", createdBy);
        createTranslationIfNotExists("common.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("testResult.form.title", languageCode, "테스트 결과 입력", createdBy);
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "조직 대시보드", createdBy);
        createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "조직 수정", createdBy);
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "조직 생성", createdBy);

        // 14번째 그룹 - 조직 관련 폼과 다이얼로그
        createTranslationIfNotExists("organization.form.name", languageCode, "조직명", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "조직 삭제", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "조직을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "메시지", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "카테고리", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "언어명", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "번역값", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "번역 통계", createdBy);

        // 15번째 그룹 - JUnit 및 테스트 관련
        createTranslationIfNotExists("junit.dashboard.title", languageCode, "JUnit 대시보드", createdBy);
        createTranslationIfNotExists("junit.table.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "JUnit 결과 업로드", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("testCaseResult.page.title", languageCode, "테스트 케이스 결과", createdBy);
        createTranslationIfNotExists("testExecution.list.title", languageCode, "테스트 실행 목록", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "테스트 실행 삭제", createdBy);
        createTranslationIfNotExists("dashboard.title", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("dashboard.noData.message", languageCode, "표시할 데이터가 없습니다", createdBy);
        createTranslationIfNotExists("testResult.pieChart.title", languageCode, "테스트 결과 파이차트", createdBy);

        // 16번째 그룹 - 에러 메시지와 상태
        createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "테스트 케이스 로드 실패", createdBy);
        createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "저장 실패", createdBy);
        createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "테스트 결과는 필수입니다", createdBy);
        createTranslationIfNotExists("junit.error.loadFailed", languageCode, "JUnit 결과 로드 실패", createdBy);
        createTranslationIfNotExists("dashboard.error.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "로그인으로 이동", createdBy);
        createTranslationIfNotExists("dashboard.error.details", languageCode, "상세 정보", createdBy);
        createTranslationIfNotExists("junit.stats.error", languageCode, "에러", createdBy);
        createTranslationIfNotExists("junit.stats.errorTests", languageCode, "에러 테스트", createdBy);
        createTranslationIfNotExists("junit.stats.successRate", languageCode, "성공률", createdBy);

        // 17번째 그룹 - 번역 관리 카테고리와 기타
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "에러", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("junit.stats.failed", languageCode, "실패", createdBy);
        createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "차트 로딩 중...", createdBy);
        createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "차트 데이터 없음", createdBy);
        createTranslationIfNotExists("testResult.pieChart.count", languageCode, "개수", createdBy);
        createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "비율", createdBy);
        createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "총 테스트 케이스", createdBy);
        createTranslationIfNotExists("testResult.statistics.noData", languageCode, "통계 데이터 없음", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "총 개수", createdBy);

        // 대량 번역 키 추가 2차 (18-22번째 그룹, 총 50개)
        // 18번째 그룹 - 테스트 결과 폼 관련
        createTranslationIfNotExists("testResult.form.preCondition", languageCode, "사전 조건", createdBy);
        createTranslationIfNotExists("testResult.form.testSteps", languageCode, "테스트 단계", createdBy);
        createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "예상 결과", createdBy);
        createTranslationIfNotExists("testResult.form.testResult", languageCode, "테스트 결과", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "비고는 10,000자 이내로 입력해주세요", createdBy);
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "테스트 실행 시 특이사항이나 추가 정보를 입력하세요", createdBy);
        createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "파일 첨부", createdBy);
        createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "파일 업로드 중...", createdBy);
        createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "파일 선택", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA 연동", createdBy);

        // 19번째 그룹 - JIRA 및 조직 관련
        createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA 코멘트", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "조직명은 필수입니다", createdBy);
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "새 조직 만들기", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "첫 번째 조직 만들기", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "보기", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "이 작업은 되돌릴 수 없습니다", createdBy);

        // 20번째 그룹 - 조직 세부 정보 및 다이얼로그
        createTranslationIfNotExists("organization.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("organization.detail.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.detail.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.detail.settings", languageCode, "설정", createdBy);
        createTranslationIfNotExists("organization.member.role.admin", languageCode, "관리자", createdBy);
        createTranslationIfNotExists("organization.member.role.member", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.member.role.viewer", languageCode, "뷰어", createdBy);
        createTranslationIfNotExists("organization.project.status.active", languageCode, "활성", createdBy);
        createTranslationIfNotExists("organization.project.status.inactive", languageCode, "비활성", createdBy);
        createTranslationIfNotExists("organization.project.status.archived", languageCode, "보관됨", createdBy);

        // 21번째 그룹 - 프로젝트 및 테스트 관련
        createTranslationIfNotExists("project.form.name", languageCode, "프로젝트명", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "프로젝트 설명", createdBy);
        createTranslationIfNotExists("project.form.startDate", languageCode, "시작일", createdBy);
        createTranslationIfNotExists("project.form.endDate", languageCode, "종료일", createdBy);
        createTranslationIfNotExists("project.status.planning", languageCode, "계획", createdBy);
        createTranslationIfNotExists("project.status.inProgress", languageCode, "진행중", createdBy);
        createTranslationIfNotExists("project.status.completed", languageCode, "완료", createdBy);
        createTranslationIfNotExists("project.status.onHold", languageCode, "보류", createdBy);
        createTranslationIfNotExists("testCase.form.name", languageCode, "테스트 케이스명", createdBy);
        createTranslationIfNotExists("testCase.form.priority", languageCode, "우선순위", createdBy);

        // 22번째 그룹 - 테스트 케이스 및 실행 관련
        createTranslationIfNotExists("testCase.priority.high", languageCode, "높음", createdBy);
        createTranslationIfNotExists("testCase.priority.medium", languageCode, "보통", createdBy);
        createTranslationIfNotExists("testCase.priority.low", languageCode, "낮음", createdBy);
        createTranslationIfNotExists("testCase.status.draft", languageCode, "초안", createdBy);
        createTranslationIfNotExists("testCase.status.review", languageCode, "검토중", createdBy);
        createTranslationIfNotExists("testCase.status.approved", languageCode, "승인됨", createdBy);
        createTranslationIfNotExists("testCase.status.deprecated", languageCode, "사용중지", createdBy);
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "시작 안됨", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "진행중", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "완료", createdBy);

        // 대량 번역 키 추가 3차 (23-32번째 그룹, 총 100개)
        // 23번째 그룹 - 조직 대시보드 차트 관련
        createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode, "프로젝트 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "조직 목록", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode, "테스트 결과 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode, "테스트 결과 상세", createdBy);
        createTranslationIfNotExists("organization.table.user", languageCode, "사용자", createdBy);
        createTranslationIfNotExists("organization.table.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("organization.table.joinDate", languageCode, "가입일", createdBy);

        // 24번째 그룹 - 조직 테이블 및 번역 관리
        createTranslationIfNotExists("organization.table.actions", languageCode, "작업", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "정렬 순서", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "언어 표시 순서를 입력하세요", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "검증", createdBy);
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "번역 키 목록", createdBy);
        createTranslationIfNotExists("common.search.keyword", languageCode, "키워드 검색", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("common.table.actions", languageCode, "작업", createdBy);
        createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "데이터 로딩 중...", createdBy);

        // 25번째 그룹 - 차트 및 테이블 관련
        createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "비교할 데이터가 없습니다", createdBy);
        createTranslationIfNotExists("testResult.chart.tooltip", languageCode, "차트 툴팁", createdBy);
        createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "백분율 보기", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "백분율 (%)", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "개수", createdBy);
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "언어 목록", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "언어 코드", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "원어명", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "기본 언어", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "정렬 순서", createdBy);

        // 26번째 그룹 - 번역 관리 테이블
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "기본값", createdBy);
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "번역 목록", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "키 이름", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "언어", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "컨텍스트", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "활성 상태", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "수정자", createdBy);
        createTranslationIfNotExists("junit.confirm.deleteResult", languageCode, "이 결과를 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode, "테스트 상태 분포", createdBy);
        createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode, "최근 실행 결과", createdBy);

        // 27번째 그룹 - JUnit 테이블 관련
        createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode, "최근 테스트 실행 결과", createdBy);
        createTranslationIfNotExists("junit.table.executionName", languageCode, "실행명", createdBy);
        createTranslationIfNotExists("junit.table.fileName", languageCode, "파일명", createdBy);
        createTranslationIfNotExists("junit.table.totalTests", languageCode, "총 테스트", createdBy);
        createTranslationIfNotExists("junit.table.actions", languageCode, "작업", createdBy);
        createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "상세 테이블 보기", createdBy);
        createTranslationIfNotExists("testResult.tab.tableDescription", languageCode, "테스트 결과를 테이블 형태로 확인", createdBy);
        createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
        createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "실행 목록이 없습니다", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "이 테스트 실행을 삭제하시겠습니까?", createdBy);

        // 28번째 그룹 - 테스트 실행 및 대시보드
        createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "최근 테스트 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "테스트 결과 추이", createdBy);
        createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "최근 15일", createdBy);
        createTranslationIfNotExists("dashboard.loading.chart", languageCode, "차트 로딩 중...", createdBy);
        createTranslationIfNotExists("dashboard.noData.chart", languageCode, "차트 데이터 없음", createdBy);
        createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "열린 테스트 실행 결과", createdBy);
        createTranslationIfNotExists("dashboard.noData.noResults", languageCode, "결과가 없습니다", createdBy);
        createTranslationIfNotExists("dashboard.summary.totalProjects", languageCode, "총 프로젝트", createdBy);

        // 29번째 그룹 - 대시보드 통계 및 요약
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

        // 30번째 그룹 - 빠른 작업 및 네비게이션
        createTranslationIfNotExists("dashboard.quickActions.createTestCase", languageCode, "테스트 케이스 생성", createdBy);
        createTranslationIfNotExists("dashboard.quickActions.runTests", languageCode, "테스트 실행", createdBy);
        createTranslationIfNotExists("dashboard.quickActions.viewReports", languageCode, "리포트 보기", createdBy);
        createTranslationIfNotExists("dashboard.quickActions.manageProjects", languageCode, "프로젝트 관리", createdBy);
        createTranslationIfNotExists("navigation.menu.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("navigation.menu.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("navigation.menu.testCases", languageCode, "테스트 케이스", createdBy);
        createTranslationIfNotExists("navigation.menu.testPlans", languageCode, "테스트 플랜", createdBy);
        createTranslationIfNotExists("navigation.menu.testExecutions", languageCode, "테스트 실행", createdBy);
        createTranslationIfNotExists("navigation.menu.reports", languageCode, "리포트", createdBy);

        // 31번째 그룹 - 네비게이션 및 사용자 메뉴
        createTranslationIfNotExists("navigation.menu.settings", languageCode, "설정", createdBy);
        createTranslationIfNotExists("navigation.menu.help", languageCode, "도움말", createdBy);
        createTranslationIfNotExists("navigation.user.profile", languageCode, "프로필", createdBy);
        createTranslationIfNotExists("navigation.user.preferences", languageCode, "환경설정", createdBy);
        createTranslationIfNotExists("navigation.user.logout", languageCode, "로그아웃", createdBy);
        createTranslationIfNotExists("navigation.breadcrumb.home", languageCode, "홈", createdBy);
        createTranslationIfNotExists("navigation.breadcrumb.back", languageCode, "뒤로", createdBy);
        createTranslationIfNotExists("validation.required", languageCode, "필수 입력 항목입니다", createdBy);
        createTranslationIfNotExists("validation.email.invalid", languageCode, "올바른 이메일 형식이 아닙니다", createdBy);
        createTranslationIfNotExists("validation.password.minLength", languageCode, "비밀번호는 최소 8자 이상이어야 합니다", createdBy);

        // 32번째 그룹 - 검증 및 알림 메시지
        createTranslationIfNotExists("validation.password.complexity", languageCode, "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다", createdBy);
        createTranslationIfNotExists("validation.confirm.password", languageCode, "비밀번호가 일치하지 않습니다", createdBy);
        createTranslationIfNotExists("validation.date.invalid", languageCode, "올바른 날짜 형식이 아닙니다", createdBy);
        createTranslationIfNotExists("validation.number.invalid", languageCode, "올바른 숫자 형식이 아닙니다", createdBy);
        createTranslationIfNotExists("notification.success.saved", languageCode, "성공적으로 저장되었습니다", createdBy);
        createTranslationIfNotExists("notification.success.deleted", languageCode, "성공적으로 삭제되었습니다", createdBy);
        createTranslationIfNotExists("notification.success.updated", languageCode, "성공적으로 수정되었습니다", createdBy);
        createTranslationIfNotExists("notification.error.networkError", languageCode, "네트워크 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("notification.error.serverError", languageCode, "서버 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("notification.info.processing", languageCode, "처리 중입니다...", createdBy);

        // 4차 대량 번역 키 추가 (한국어 - 33-42번째 그룹, 총 100개)
        // 33번째 그룹 - 파일 관리 및 업로드
        createTranslationIfNotExists("file.upload.title", languageCode, "파일 업로드", createdBy);
        createTranslationIfNotExists("file.upload.description", languageCode, "파일을 끌어다 놓거나 클릭하여 업로드하세요", createdBy);
        createTranslationIfNotExists("file.upload.progress", languageCode, "업로드 진행 중...", createdBy);
        createTranslationIfNotExists("file.upload.success", languageCode, "파일이 성공적으로 업로드되었습니다", createdBy);
        createTranslationIfNotExists("file.upload.error", languageCode, "파일 업로드에 실패했습니다", createdBy);
        createTranslationIfNotExists("file.size.limit", languageCode, "파일 크기는 최대 {size}MB입니다", createdBy);
        createTranslationIfNotExists("file.type.invalid", languageCode, "지원하지 않는 파일 형식입니다", createdBy);
        createTranslationIfNotExists("file.download.preparing", languageCode, "다운로드 준비 중...", createdBy);
        createTranslationIfNotExists("file.download.error", languageCode, "파일 다운로드에 실패했습니다", createdBy);
        createTranslationIfNotExists("file.management.title", languageCode, "파일 관리", createdBy);

        // 34번째 그룹 - 사용자 관리 및 팀
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

        // 35번째 그룹 - 보고서 및 분석
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

        // 36번째 그룹 - 설정 및 구성
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

        // 37번째 그룹 - 작업 흐름 및 승인
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

        // 38번째 그룹 - 로그 및 감사
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

        // 39번째 그룹 - 캘린더 및 일정
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

        // 40번째 그룹 - 통계 및 차트
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

        // 41번째 그룹 - 커뮤니케이션 및 협업
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

        // 42번째 그룹 - 모바일 및 반응형
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

        // 콘솔 누락 키들 - 헤더 네비게이션 (한국어)
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);

        // 콘솔 누락 키들 - 조직 대시보드 (한국어)
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "조직 대시보드", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "전체 사용자 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.activeProjects", languageCode, "활성 프로젝트 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.testCases", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.completedTests", languageCode, "완료된 테스트 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.stats.title", languageCode, "조직 통계", createdBy);

        // 콘솔 누락 키들 - JIRA 연동 (한국어)
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA 연결 상태", createdBy);
        createTranslationIfNotExists("jira.status.connected", languageCode, "연결됨", createdBy);
        createTranslationIfNotExists("jira.status.disconnected", languageCode, "연결 안됨", createdBy);
        createTranslationIfNotExists("jira.messages.connectionError", languageCode, "JIRA 연결에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.messages.syncSuccess", languageCode, "JIRA와 성공적으로 동기화되었습니다", createdBy);
        createTranslationIfNotExists("jira.messages.syncError", languageCode, "JIRA 동기화에 실패했습니다", createdBy);

        // 콘솔 누락 키들 - 공통 버튼 (한국어)
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("common.buttons.reset", languageCode, "재설정", createdBy);
        createTranslationIfNotExists("common.buttons.apply", languageCode, "적용", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.buttons.ok", languageCode, "확인", createdBy);
        createTranslationIfNotExists("common.buttons.yes", languageCode, "예", createdBy);
        createTranslationIfNotExists("common.buttons.no", languageCode, "아니오", createdBy);

        // JUnit 결과 대시보드 - 빈 상태 메시지 (한글)
        createTranslationIfNotExists("junit.empty.noResults", languageCode, "테스트 결과가 없습니다", createdBy);
        createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode, "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.", createdBy);
        createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "첫 번째 테스트 결과 업로드", createdBy);

        // JUnit 업로드 다이얼로그 (한글)
        createTranslationIfNotExists("junit.upload.fileSize", languageCode, "크기", createdBy);
        createTranslationIfNotExists("junit.upload.changeFile", languageCode, "다른 파일 선택", createdBy);
        createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "테스트 실행 정보", createdBy);
        createTranslationIfNotExists("junit.placeholder.description", languageCode, "설명 (선택사항)", createdBy);
        createTranslationIfNotExists("junit.upload.uploadingFile", languageCode, "\"{fileName}\" 업로드 중...", createdBy);
        createTranslationIfNotExists("junit.upload.max", languageCode, "최대", createdBy);

        // JUnit 상세 페이지 (한글)
        createTranslationIfNotExists("junit.detail.upload", languageCode, "업로드", createdBy);
        createTranslationIfNotExists("junit.detail.unknownUploader", languageCode, "알 수 없음", createdBy);

        // JUnit 테스트 케이스 에디터 (한글)
        createTranslationIfNotExists("junit.editor.title", languageCode, "테스트 케이스 편집", createdBy);
        createTranslationIfNotExists("junit.editor.viewMode", languageCode, "(보기 모드)", createdBy);
        createTranslationIfNotExists("junit.editor.editMode", languageCode, "(편집 모드)", createdBy);
        createTranslationIfNotExists("junit.editor.viewOriginalData", languageCode, "원본 데이터 보기", createdBy);
        createTranslationIfNotExists("junit.editor.editHistory", languageCode, "편집 이력", createdBy);

        // 상태 설명 (한글)
        createTranslationIfNotExists("junit.editor.status.passedDesc", languageCode, "테스트가 성공적으로 통과했습니다", createdBy);
        createTranslationIfNotExists("junit.editor.status.failedDesc", languageCode, "테스트가 실패했습니다", createdBy);
        createTranslationIfNotExists("junit.editor.status.errorDesc", languageCode, "테스트 실행 중 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("junit.editor.status.skippedDesc", languageCode, "테스트가 건너뛰어졌습니다", createdBy);

        // 우선순위 (한글)
        createTranslationIfNotExists("junit.editor.priority.high", languageCode, "높음", createdBy);
        createTranslationIfNotExists("junit.editor.priority.medium", languageCode, "보통", createdBy);
        createTranslationIfNotExists("junit.editor.priority.low", languageCode, "낮음", createdBy);

        // 태그 및 노트 (한글)
        createTranslationIfNotExists("junit.editor.tags", languageCode, "태그", createdBy);
        createTranslationIfNotExists("junit.editor.tagsPlaceholder", languageCode, "쉼표로 구분하여 입력 (예: 버그, 회귀테스트, API)", createdBy);
        createTranslationIfNotExists("junit.editor.tagsHelp", languageCode, "쉼표로 구분하여 여러 태그를 입력할 수 있습니다", createdBy);
        createTranslationIfNotExists("junit.editor.notes", languageCode, "노트", createdBy);
        createTranslationIfNotExists("junit.editor.notesPlaceholder", languageCode, "테스트 케이스에 대한 추가 메모를 입력하세요", createdBy);

        // 미리보기 및 버튼 (한글)
        createTranslationIfNotExists("junit.editor.preview", languageCode, "미리보기", createdBy);
        createTranslationIfNotExists("junit.editor.saving", languageCode, "저장 중...", createdBy);

        // 오류 메시지 (한글)
        createTranslationIfNotExists("junit.editor.error.noTestCase", languageCode, "테스트 케이스를 찾을 수 없습니다", createdBy);
        createTranslationIfNotExists("junit.editor.error.saveFailed", languageCode, "테스트 케이스 저장에 실패했습니다", createdBy);

        // ===== RAG (Retrieval-Augmented Generation) 관련 번역 =====
        // RAG Manager
        createTranslationIfNotExists("rag.manager.noProject", languageCode, "프로젝트를 먼저 선택해주세요.", createdBy);

        // Document Upload
        createTranslationIfNotExists("rag.upload.title", languageCode, "문서 업로드", createdBy);
        createTranslationIfNotExists("rag.upload.description", languageCode, "PDF, DOCX, DOC, TXT 파일을 업로드하여 RAG 시스템에 등록할 수 있습니다. (최대 50MB)", createdBy);
        createTranslationIfNotExists("rag.upload.dragAndDrop", languageCode, "파일을 이곳에 드래그하거나 클릭하여 선택하세요", createdBy);
        createTranslationIfNotExists("rag.upload.selectFiles", languageCode, "파일 선택", createdBy);
        createTranslationIfNotExists("rag.upload.selectedFiles", languageCode, "선택된 파일", createdBy);
        createTranslationIfNotExists("rag.upload.uploading", languageCode, "업로드 중", createdBy);
        createTranslationIfNotExists("rag.upload.upload", languageCode, "업로드", createdBy);
        createTranslationIfNotExists("rag.upload.error.unsupportedFileType", languageCode, "지원하지 않는 파일 형식입니다. (PDF, DOCX, DOC, TXT만 가능)", createdBy);
        createTranslationIfNotExists("rag.upload.error.fileTooLarge", languageCode, "파일 크기가 너무 큽니다. (최대 {maxSize}MB)", createdBy);
        createTranslationIfNotExists("rag.upload.error.noFilesSelected", languageCode, "업로드할 파일을 선택해주세요.", createdBy);
        createTranslationIfNotExists("rag.upload.parser.label", languageCode, "문서 분석 파서", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pypdf2.description", languageCode, "기본 로컬 파서", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pymupdf.description", languageCode, "다양한 기능을 갖춘 빠른 로컬 파서", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pymupdf4llm.description", languageCode, "LLM 최적화 마크다운 추출", createdBy);
        createTranslationIfNotExists("rag.upload.parser.upstage.description", languageCode, "고급 레이아웃 분석이 가능한 클라우드 API (upstage_api_key 필요)", createdBy);

        // Document List
        createTranslationIfNotExists("rag.document.status.pending", languageCode, "대기 중", createdBy);
        createTranslationIfNotExists("rag.document.status.analyzing", languageCode, "분석 중", createdBy);
        createTranslationIfNotExists("rag.document.status.completed", languageCode, "완료", createdBy);
        createTranslationIfNotExists("rag.document.status.failed", languageCode, "실패", createdBy);
        createTranslationIfNotExists("rag.document.loading", languageCode, "문서 목록을 불러오는 중...", createdBy);
        createTranslationIfNotExists("rag.document.empty", languageCode, "업로드된 문서가 없습니다", createdBy);
        createTranslationIfNotExists("rag.document.emptyDescription", languageCode, "상단의 업로드 영역을 사용하여 문서를 등록하세요", createdBy);
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
        createTranslationIfNotExists("rag.document.deleteDialog.message", languageCode, "이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", createdBy);
        createTranslationIfNotExists("rag.document.pagination.rowsPerPage", languageCode, "페이지당 행 수:", createdBy);
        createTranslationIfNotExists("rag.document.viewChunks", languageCode, "청크 보기", createdBy);
        // ICT-388: 문서/테스트케이스 분리 표시
        createTranslationIfNotExists("rag.document.list.regularDocuments", languageCode, "업로드된 문서", createdBy);
        createTranslationIfNotExists("rag.document.list.testCaseDocuments", languageCode, "테스트케이스 문서", createdBy);

        // Similar Test Cases
        createTranslationIfNotExists("rag.similar.title", languageCode, "유사 검색", createdBy);
        createTranslationIfNotExists("rag.similar.description", languageCode, "키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트 케이스 또는 문서를 찾아줍니다.", createdBy);
        createTranslationIfNotExists("rag.similar.searchQuery", languageCode, "검색어", createdBy);
        createTranslationIfNotExists("rag.similar.searchPlaceholder", languageCode, "예: 로그인 기능 테스트, 회원가입 유효성 검사", createdBy);
        createTranslationIfNotExists("rag.similar.search", languageCode, "검색", createdBy);
        createTranslationIfNotExists("rag.similar.searching", languageCode, "검색 중...", createdBy);
        createTranslationIfNotExists("rag.similar.noResults", languageCode, "검색 결과가 없습니다. 다른 키워드로 시도해보세요.", createdBy);
        createTranslationIfNotExists("rag.similar.resultsCount", languageCode, "검색 결과 ({count}개)", createdBy);
        // ICT-388: 검색 결과 분리 표시
        createTranslationIfNotExists("rag.similar.testCaseResults", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("rag.similar.documentResults", languageCode, "문서", createdBy);
        createTranslationIfNotExists("rag.similar.metadata", languageCode, "문서 ID: {documentId} | 청크 순서: {chunkIndex}", createdBy);
        createTranslationIfNotExists("rag.similar.copy", languageCode, "복사", createdBy);
        createTranslationIfNotExists("rag.similar.addTestCase", languageCode, "테스트케이스로 추가", createdBy);
        createTranslationIfNotExists("rag.similar.unknownDocument", languageCode, "알 수 없음", createdBy);
        createTranslationIfNotExists("rag.similar.testCaseTitle", languageCode, "테스트케이스 - {fileName}", createdBy);
        createTranslationIfNotExists("rag.similar.sourceTestcase", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("rag.similar.sourceDocument", languageCode, "문서", createdBy);
        createTranslationIfNotExists("rag.similar.showDetails", languageCode, "자세히 보기", createdBy);
        createTranslationIfNotExists("rag.similar.noHighSimilarityResults", languageCode, "81% 이상의 유사도를 가진 문서가 없습니다. 아래에서 유사도가 낮은 결과를 확인하세요.", createdBy);
        createTranslationIfNotExists("rag.similar.lowSimilarityCollapsed", languageCode, "유사도 낮음 (클릭하여 보기)", createdBy);

        // ProjectHeader RAG Tab
        createTranslationIfNotExists("projectHeader.tabs.ragDocuments", languageCode, "RAG 문서", createdBy);

        // Attachment - 첨부파일 관련 번역
        // 성공 메시지
        createTranslationIfNotExists("attachment.success.upload", languageCode, "파일이 성공적으로 업로드되었습니다.", createdBy);
        createTranslationIfNotExists("attachment.success.delete", languageCode, "첨부파일이 성공적으로 삭제되었습니다.", createdBy);

        // 에러 메시지 - 인증
        createTranslationIfNotExists("attachment.error.auth.failed", languageCode, "사용자 인증에 실패했습니다.", createdBy);

        // 에러 메시지 - 업로드
        createTranslationIfNotExists("attachment.error.upload.validation", languageCode, "파일 검증에 실패했습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.upload.io", languageCode, "파일 저장 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.upload.general", languageCode, "서버 오류가 발생했습니다.", createdBy);

        // 에러 메시지 - 조회
        createTranslationIfNotExists("attachment.error.list.failed", languageCode, "첨부파일 목록을 조회하는 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.notfound", languageCode, "첨부파일을 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.info.failed", languageCode, "첨부파일 정보를 조회하는 중 오류가 발생했습니다.", createdBy);

        // 에러 메시지 - 다운로드
        createTranslationIfNotExists("attachment.error.download.notfound", languageCode, "파일을 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.download.io", languageCode, "파일 다운로드 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("attachment.error.download.general", languageCode, "파일 다운로드 중 예상치 못한 오류가 발생했습니다.", createdBy);

        // 에러 메시지 - 삭제
        createTranslationIfNotExists("attachment.error.delete.failed", languageCode, "첨부파일을 삭제하는 중 오류가 발생했습니다.", createdBy);

        // 에러 메시지 - 스토리지 정보
        createTranslationIfNotExists("attachment.error.storage.failed", languageCode, "스토리지 정보를 조회하는 중 오류가 발생했습니다.", createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<TranslationKey> key = translationKeyRepository.findByKeyName(keyName);
        if (key.isPresent()) {
            Language lang = languageRepository.findByCode(languageCode)
                    .orElseGet(() -> languageRepository.save(new Language(languageCode, languageCode, languageCode, true, 0)));
            Optional<Translation> existingTranslationOpt = translationRepository.findByTranslationKeyAndLanguage(key.get(), lang);
            if (existingTranslationOpt.isEmpty()) {
                Translation translation = new Translation(key.get(), lang, value, createdBy);
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
        } else {
            log.warn("번역 키를 찾을 수 없음: {}", keyName);
        }
    }
}
