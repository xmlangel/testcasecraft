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

        // TestCaseForm 컴포넌트 번역 키들
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "테스트케이스 수정", createdBy);
        createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "순서", createdBy);
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

        // 공통 버튼
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);

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