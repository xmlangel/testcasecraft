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
        createTranslationIfNotExists("testExecution.actions.prevResults", languageCode, "이전결과", createdBy);
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
        createTranslationIfNotExists("testExecution.table.notes", languageCode, "비고", createdBy);
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
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "긴 내용은 파일 첨부를 권장합니다.", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode, "{remaining}자 남음", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "10,000자를 초과했습니다. 긴 내용은 파일로 첨부해주세요.", createdBy);

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
        createTranslationIfNotExists("jira.summary.testResult", languageCode, "테스트 결과 ({count}개)", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "최근 테스트:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "실행 시간:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "동기화:", createdBy);
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

    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<Language> language = languageRepository.findByCode(languageCode);
        if (language.isEmpty()) {
            log.warn("번역 추가 실패: 언어 '{}'를 찾을 수 없습니다.", languageCode);
            return;
        }

        Optional<TranslationKey> translationKey = translationKeyRepository.findByKeyName(keyName);
        if (translationKey.isEmpty()) {
            log.warn("번역 추가 실패: 번역 키 '{}'를 찾을 수 없습니다.", keyName);
            return;
        }

        Optional<Translation> existingTranslation = translationRepository.findByTranslationKeyAndLanguage(translationKey.get(), language.get());
        if (existingTranslation.isEmpty()) {
            Translation translation = new Translation(translationKey.get(), language.get(), value, createdBy);
            translationRepository.save(translation);
            log.debug("번역 생성: {} -> {} = '{}'", languageCode, keyName, value);
        } else {
            log.debug("번역 이미 존재: {} -> {} = '{}'", languageCode, keyName, value);
        }
    }
}