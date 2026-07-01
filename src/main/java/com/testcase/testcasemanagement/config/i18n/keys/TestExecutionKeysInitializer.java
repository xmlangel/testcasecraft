// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TestExecutionKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TestExecutionKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 테스트 실행 관련 키들
    createTranslationKeyIfNotExists(
        "testExecution.createTitle", "testExecution", "테스트 실행 등록 제목", "테스트 실행 등록");
    createTranslationKeyIfNotExists(
        "testExecution.list.title", "testExecution", "실행 이력 제목", "실행 이력");
    createTranslationKeyIfNotExists(
        "testExecution.list.newExecution", "testExecution", "새 실행 버튼", "새 실행");
    createTranslationKeyIfNotExists(
        "testExecution.list.noExecutions", "testExecution", "실행 이력 없음 메시지", "실행 이력이 없습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.list.delete", "testExecution", "실행 삭제 확인", "실행 삭제");
    createTranslationKeyIfNotExists(
        "testExecution.list.deleteConfirm", "testExecution", "실행 삭제 확인 메시지", "정말로 이 실행을 삭제하시겠습니까?");

    // 테스트 실행 폼 관련
    createTranslationKeyIfNotExists("testExecution.form.name", "testExecution", "실행명 라벨", "실행명");
    createTranslationKeyIfNotExists(
        "testExecution.form.testPlan", "testExecution", "테스트 계획 라벨", "테스트 계획");
    createTranslationKeyIfNotExists(
        "testExecution.form.description", "testExecution", "설명 라벨", "설명");
    createTranslationKeyIfNotExists("testExecution.form.status", "testExecution", "상태 라벨", "상태");
    createTranslationKeyIfNotExists(
        "testExecution.form.startDate", "testExecution", "시작일시 라벨", "시작일시");
    createTranslationKeyIfNotExists(
        "testExecution.form.endDate", "testExecution", "종료일시 라벨", "종료일시");
    createTranslationKeyIfNotExists(
        "testExecution.form.progress", "testExecution", "진행률 라벨", "진행률");
    createTranslationKeyIfNotExists(
        "testExecution.form.executionInfo", "testExecution", "실행 정보 제목", "실행 정보");
    createTranslationKeyIfNotExists(
        "testExecution.executionSummary", "testExecution", "실행 요약 제목", "실행 요약");

    // 테스트 실행 버튼들
    createTranslationKeyIfNotExists("testExecution.buttons.save", "testExecution", "저장 버튼", "저장");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.saveAndStart", "testExecution", "저장 및 시작 버튼", "저장 및 시작");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.start", "testExecution", "실행시작 버튼", "실행시작");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.complete", "testExecution", "실행완료 버튼", "실행완료");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.restart", "testExecution", "재실행 버튼", "재실행");
    createTranslationKeyIfNotExists("testExecution.buttons.list", "testExecution", "목록 버튼", "목록");
    createTranslationKeyIfNotExists("testExecution.buttons.cancel", "testExecution", "취소 버튼", "취소");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.resultInput", "testExecution", "결과입력 버튼", "결과입력");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.previousResults", "testExecution", "이전결과 버튼", "이전결과");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.attachments", "testExecution", "첨부파일 버튼", "첨부파일");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.executionGuide", "testExecution", "실행 절차 버튼", "실행 절차");
    createTranslationKeyIfNotExists(
        "testExecution.buttons.hideGuide", "testExecution", "안내 숨기기 버튼", "안내 숨기기");
    createTranslationKeyIfNotExists("testExecution.buttons.close", "testExecution", "닫기 버튼", "닫기");

    // 테스트 실행 테이블 헤더
    createTranslationKeyIfNotExists(
        "testExecution.table.folderCase", "testExecution", "폴더/케이스 컬럼", "폴더/케이스");
    createTranslationKeyIfNotExists(
        "testExecution.table.caseName", "testExecution", "케이스명 컬럼", "케이스명");
    createTranslationKeyIfNotExists("testExecution.table.result", "testExecution", "결과 컬럼", "결과");
    createTranslationKeyIfNotExists(
        "testExecution.table.executedAt", "testExecution", "실행일시 컬럼", "실행일시");
    createTranslationKeyIfNotExists(
        "testExecution.table.executedBy", "testExecution", "실행자 컬럼", "실행자");
    createTranslationKeyIfNotExists("testExecution.table.notes", "testExecution", "비고 컬럼", "비고");
    createTranslationKeyIfNotExists(
        "testExecution.table.jiraId", "testExecution", "JIRA ID 컬럼", "JIRA ID");
    createTranslationKeyIfNotExists(
        "testExecution.table.attachments", "testExecution", "첨부파일 컬럼", "첨부파일");
    createTranslationKeyIfNotExists(
        "testExecution.table.executionId", "testExecution", "실행 ID 컬럼", "실행ID");
    createTranslationKeyIfNotExists(
        "testExecution.table.executionName", "testExecution", "실행명 컬럼", "실행명");
    createTranslationKeyIfNotExists("testExecution.table.folder", "testExecution", "폴더 컬럼", "폴더");
    createTranslationKeyIfNotExists("testExecution.table.tags", "testExecution", "태그 컬럼", "태그");
    // Checkbox aria-labels for accessibility
    createTranslationKeyIfNotExists(
        "testExecution.table.selectAll", "testExecution", "전체 선택 체크박스 aria-label", "모든 테스트케이스 선택");
    createTranslationKeyIfNotExists(
        "testExecution.table.selectTestCase",
        "testExecution",
        "개별 테스트케이스 선택 체크박스 aria-label",
        "테스트케이스 선택:");

    // 테스트 실행 상태 칩
    createTranslationKeyIfNotExists(
        "testExecution.status.notStarted", "testExecution", "시작 전 상태", "Not Started");
    createTranslationKeyIfNotExists(
        "testExecution.status.inProgress", "testExecution", "진행 중 상태", "In Progress");
    createTranslationKeyIfNotExists(
        "testExecution.status.completed", "testExecution", "완료 상태", "Completed");

    // 테스트 실행 통계
    createTranslationKeyIfNotExists(
        "testExecution.stats.pass", "testExecution", "통과 통계", "Pass: {count}");
    createTranslationKeyIfNotExists(
        "testExecution.stats.fail", "testExecution", "실패 통계", "Fail: {count}");
    createTranslationKeyIfNotExists(
        "testExecution.stats.notrun", "testExecution", "미실행 통계", "NotRun: {count}");
    createTranslationKeyIfNotExists(
        "testExecution.stats.blocked", "testExecution", "블록됨 통계", "Blocked: {count}");
    createTranslationKeyIfNotExists(
        "testExecution.stats.total", "testExecution", "총 개수", "총 {count} 건");

    // 테스트 실행 즉시 시작 옵션
    createTranslationKeyIfNotExists(
        "testExecution.options.startImmediately", "testExecution", "즉시 실행 시작 옵션", "저장 후 즉시 실행 시작");
    createTranslationKeyIfNotExists(
        "testExecution.options.startImmediately.description",
        "testExecution",
        "즉시 실행 시작 설명",
        "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다");

    // 추가 누락 키들

    // 이전 결과 다이얼로그
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.executionDate", "testExecution", "실행일시 컬럼", "실행일시");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.executionId", "testExecution", "실행ID 컬럼", "실행ID");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.executionName", "testExecution", "실행명 컬럼", "실행명");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.executor", "testExecution", "실행자 컬럼", "실행자");

    // 페이지네이션 관련
    createTranslationKeyIfNotExists(
        "testExecution.pagination.showing",
        "testExecution",
        "페이지 정보 표시",
        "총 {total}개 항목 중 {start}-{end}개 표시");
    createTranslationKeyIfNotExists(
        "testExecution.pagination.page", "testExecution", "페이지 정보", "페이지 {current} / {total}");

    // 첨부파일 관련
    createTranslationKeyIfNotExists(
        "testExecution.attachments.title", "testExecution", "테스트 결과 첨부파일 제목", "테스트 결과 첨부파일");
    createTranslationKeyIfNotExists(
        "testExecution.attachments.view", "testExecution", "첨부파일 보기", "첨부파일 보기");

    // 추가 누락된 키들 (dialog, progress)
    createTranslationKeyIfNotExists("testExecution.progress", "testExecution", "진행률", "진행률");

    // 추가 번역 키 (누락된 것들)
    createTranslationKeyIfNotExists(
        "testExecution.list.delete.title", "testExecution", "실행 삭제 제목", "실행 삭제");
    createTranslationKeyIfNotExists(
        "testExecution.list.delete.confirm",
        "testExecution",
        "실행 삭제 확인 메시지",
        "정말로 이 실행을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "testExecution.list.delete.cancel", "testExecution", "취소", "취소");
    createTranslationKeyIfNotExists(
        "testExecution.list.delete.delete", "testExecution", "삭제", "삭제");
    createTranslationKeyIfNotExists(
        "testExecution.list.searchPlaceholder", "testExecution", "검색 플레이스홀더", "제목 검색");
    createTranslationKeyIfNotExists(
        "testExecution.list.refresh", "testExecution", "목록 새로고침 버튼", "새로고침");

    createTranslationKeyIfNotExists(
        "testExecution.form.executionName", "testExecution", "실행명", "실행명");



    // 테스트 실행 가이드
    createTranslationKeyIfNotExists(
        "testExecution.guide.title", "testExecution", "테스트 실행 절차 안내", "📋 테스트 실행 절차 안내");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step1.title", "testExecution", "1단계 제목", "1. 테스트 실행 준비");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step1.description",
        "testExecution",
        "1단계 설명",
        "실행명, 테스트 계획, 설명을 입력하고 '저장' 버튼을 클릭합니다.");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step2.title", "testExecution", "2단계 제목", "2. 실행 시작");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step2.description",
        "testExecution",
        "2단계 설명",
        "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step3.title", "testExecution", "3단계 제목", "3. 테스트 케이스 실행");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step3.description",
        "testExecution",
        "3단계 설명",
        "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step4.title", "testExecution", "4단계 제목", "4. 실행 완료");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step4.description",
        "testExecution",
        "4단계 설명",
        "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step5.title", "testExecution", "5단계 제목", "5. 결과 확인");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step5.description",
        "testExecution",
        "5단계 설명",
        "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step6.title", "testExecution", "6단계 제목", "6. 재실행 (완료 후)");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step6.description",
        "testExecution",
        "6단계 설명",
        "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.");

    // 새로 추가된 번역 키들
    createTranslationKeyIfNotExists(
        "testExecution.table.viewAttachments", "testExecution", "첨부파일 보기 툴팁", "첨부파일 보기");
    createTranslationKeyIfNotExists(
        "testExecution.form.registerTitle", "testExecution", "테스트 실행 등록 제목", "테스트 실행 등록");
    createTranslationKeyIfNotExists(
        "testExecution.form.editTitle", "testExecution", "테스트 실행 편집 제목", "테스트 실행: {name}");
    createTranslationKeyIfNotExists(
        "testExecution.table.attachments", "testExecution", "첨부파일", "첨부파일");
    createTranslationKeyIfNotExists(
        "testExecution.attachments.title", "testExecution", "첨부파일 다이얼로그 제목", "테스트 결과 첨부파일");

    // Common 키들
    createTranslationKeyIfNotExists("common.list", "common", "목록", "목록");
    createTranslationKeyIfNotExists("common.cancel", "common", "취소", "취소");

    // 테스트 케이스 테이블 헤더

    // 테스트 케이스 테이블 버튼

    // 페이지네이션
    createTranslationKeyIfNotExists(
        "testExecution.pagination.info",
        "testExecution",
        "페이지 정보",
        "총 {totalItems}개 항목 중 {start}-{end}개 표시");
    createTranslationKeyIfNotExists(
        "testExecution.pagination.page", "testExecution", "페이지", "페이지 {current} / {total}");

    // 이전 결과 다이얼로그 테이블
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.table.tags", "testExecution", "태그", "태그");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.table.actions", "testExecution", "작업", "작업");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.action.edit", "testExecution", "수정", "수정");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.action.delete", "testExecution", "삭제", "삭제");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.title", "testExecution", "테스트 결과 삭제 제목", "테스트 결과 삭제");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.confirm",
        "testExecution",
        "테스트 결과 삭제 확인",
        "정말로 이 테스트 결과를 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.info",
        "testExecution",
        "삭제할 결과 정보",
        "결과: {result} | 실행일시: {executedAt}");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.cancel", "testExecution", "취소", "취소");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.delete", "testExecution", "삭제 버튼", "삭제");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.delete.deleting", "testExecution", "삭제 중", "삭제 중...");
    createTranslationKeyIfNotExists(
        "testExecution.previousResults.attachments.title",
        "testExecution",
        "테스트 결과 첨부파일 다이얼로그 제목",
        "테스트 결과 첨부파일");

    // JIRA 이슈 링크
    createTranslationKeyIfNotExists(
        "testExecution.jira.urlNotSet",
        "testExecution",
        "JIRA URL 미설정",
        "{issueKey} (JIRA URL 미설정)");
    createTranslationKeyIfNotExists(
        "testExecution.jira.historical", "testExecution", "JIRA 과거 연결 이력 안내", "과거 연결 이력");

    // 성공 메시지

    // 누락된 키들 추가
    createTranslationKeyIfNotExists(
        "testExecution.form.saveAndStart", "testExecution", "저장 및 시작", "저장 및 시작");
    createTranslationKeyIfNotExists(
        "testExecution.form.startImmediatelyLabel", "testExecution", "즉시 실행 시작", "저장 후 즉시 실행 시작");
    createTranslationKeyIfNotExists(
        "testExecution.form.startImmediatelyDescription",
        "testExecution",
        "즉시 실행 시작 설명",
        "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다");

    createTranslationKeyIfNotExists(
        "testExecution.guide.hide", "testExecution", "안내 숨기기", "안내 숨기기");
    createTranslationKeyIfNotExists("testExecution.guide.show", "testExecution", "실행 절차", "실행 절차");

    createTranslationKeyIfNotExists(
        "testExecution.actions.enterResult", "testExecution", "결과입력", "결과입력");
    createTranslationKeyIfNotExists(
        "testExecution.actions.prevResults", "testExecution", "이전결과", "이전결과");
    createTranslationKeyIfNotExists(
        "testExecution.actions.startExecution", "testExecution", "실행시작", "실행시작");
    createTranslationKeyIfNotExists(
        "testExecution.actions.completeExecution", "testExecution", "실행완료", "실행완료");
    createTranslationKeyIfNotExists(
        "testExecution.actions.restartExecution", "testExecution", "재실행", "재실행");

    createTranslationKeyIfNotExists(
        "testExecution.table.enterResult", "testExecution", "결과입력", "결과입력");
    createTranslationKeyIfNotExists(
        "testExecution.table.prevResults", "testExecution", "이전결과", "이전결과");

    createTranslationKeyIfNotExists(
        "testExecution.prevResults.title", "testExecution", "이전 실행 결과", "이전 실행 결과");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.noResults", "testExecution", "이전 실행 결과 없음", "이전 실행 결과가 없습니다.");

    createTranslationKeyIfNotExists(
        "testExecution.attachments.dialogTitle", "testExecution", "테스트 결과 첨부파일", "테스트 결과 첨부파일");

    // 새로 추가된 테스트 실행 관련 번역 키들 (11-12번째 그룹)
    createTranslationKeyIfNotExists(
        "testExecution.guide.title", "testExecution", "테스트 실행 가이드", "테스트 실행 가이드");
    createTranslationKeyIfNotExists(
        "testExecution.guide.hideGuide", "testExecution", "가이드 숨기기", "가이드 숨기기");
    createTranslationKeyIfNotExists(
        "testExecution.guide.showGuide", "testExecution", "가이드 보기", "가이드 보기");
    createTranslationKeyIfNotExists("testExecution.form.description", "testExecution", "설명", "설명");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step1.title", "testExecution", "단계 1 제목", "단계 1: 테스트 플랜 선택");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step2.title", "testExecution", "단계 2 제목", "단계 2: 실행 정보 입력");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step2.description",
        "testExecution",
        "단계 2 설명",
        "테스트 실행명, 설명, 담당자 등 기본 정보를 입력합니다");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step3.title", "testExecution", "단계 3 제목", "단계 3: 테스트 케이스 확인");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step3.description",
        "testExecution",
        "단계 3 설명",
        "선택된 테스트 플랜의 케이스들을 확인하고 실행 순서를 조정할 수 있습니다");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step4.title", "testExecution", "단계 4 제목", "단계 4: 실행 시작");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step4.description",
        "testExecution",
        "단계 4 설명",
        "모든 정보를 확인 후 테스트 실행을 시작합니다");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step5.title", "testExecution", "단계 5 제목", "단계 5: 결과 입력");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step5.description",
        "testExecution",
        "단계 5 설명",
        "각 테스트 케이스별로 실행 결과를 입력합니다");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step6.title", "testExecution", "단계 6 제목", "단계 6: 실행 완료");
    createTranslationKeyIfNotExists(
        "testExecution.guide.step6.description",
        "testExecution",
        "단계 6 설명",
        "모든 테스트 케이스 실행이 완료되면 전체 실행을 종료합니다");

    // 추가 testExecution 키들
    createTranslationKeyIfNotExists(
        "testExecution.form.totalCount", "testExecution", "총 개수", "총 {count}건");
    createTranslationKeyIfNotExists(
        "testExecution.table.noData", "testExecution", "데이터 없음", "표시할 데이터가 없습니다.");
    createTranslationKeyIfNotExists("testExecution.form.tags", "testExecution", "태그 라벨", "태그");
    createTranslationKeyIfNotExists(
        "testExecution.form.tagsPlaceholder", "testExecution", "태그 입력 안내", "태그를 입력하고 Enter를 누르세요");
    createTranslationKeyIfNotExists(
        "testExecution.helper.tags", "testExecution", "태그 도움말", "여러 태그를 입력할 수 있습니다.");

    // 일괄 결과 입력 관련
    createTranslationKeyIfNotExists(
        "testExecution.bulk.selectedCount", "testExecution", "선택된 개수", "{count}개 선택됨");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.actionToolbar.deselect", "testExecution", "선택 해제 버튼", "선택 해제");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.title", "testExecution", "일괄 결과 입력 다이얼로그 제목", "일괄 결과 입력");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.selectedCases", "testExecution", "선택된 테스트케이스", "선택된 테스트케이스");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.selectResult", "testExecution", "결과 선택", "결과 선택");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.commonNotes", "testExecution", "공통 비고", "공통 비고");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.commonTags", "testExecution", "공통 태그", "공통 태그");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.commonJiraId", "testExecution", "공통 JIRA ID", "공통 JIRA ID");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.confirm", "testExecution", "확인 버튼", "확인");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.cancel", "testExecution", "취소 버튼", "취소");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.success",
        "testExecution",
        "일괄 결과 저장 성공",
        "{count}개 테스트케이스 결과가 저장되었습니다");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.error", "testExecution", "일괄 결과 저장 오류", "일괄 결과 저장 중 오류 발생: {error}");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.processing",
        "testExecution",
        "일괄 처리 진행 중",
        "{current}/{total} 처리 중...");
    createTranslationKeyIfNotExists(
        "testExecution.table.priority", "testExecution", "우선순위 컬럼", "우선순위");

    // 필터 관련 번역 키 추가
    createTranslationKeyIfNotExists("testExecution.filter.title", "testExecution", "필터 제목", "필터");
    createTranslationKeyIfNotExists(
        "testExecution.filter.active", "testExecution", "필터 적용 중 표시", "적용 중");
    createTranslationKeyIfNotExists("testExecution.filter.all", "testExecution", "전체 선택", "전체");
    createTranslationKeyIfNotExists(
        "testExecution.filter.priority", "testExecution", "우선순위 필터", "우선순위");
    createTranslationKeyIfNotExists(
        "testExecution.filter.priority.high", "testExecution", "높은 우선순위", "높음");
    createTranslationKeyIfNotExists(
        "testExecution.filter.priority.medium", "testExecution", "중간 우선순위", "중간");
    createTranslationKeyIfNotExists(
        "testExecution.filter.priority.low", "testExecution", "낮은 우선순위", "낮음");
    createTranslationKeyIfNotExists("testExecution.filter.result", "testExecution", "결과 필터", "결과");
    createTranslationKeyIfNotExists(
        "testExecution.filter.result.pass", "testExecution", "통과 결과", "PASS");
    createTranslationKeyIfNotExists(
        "testExecution.filter.result.fail", "testExecution", "실패 결과", "FAIL");
    createTranslationKeyIfNotExists(
        "testExecution.filter.result.blocked", "testExecution", "블록 결과", "BLOCKED");
    createTranslationKeyIfNotExists(
        "testExecution.filter.result.notRun", "testExecution", "미실행 결과", "NOT RUN");
    createTranslationKeyIfNotExists(
        "testExecution.filter.executedBy", "testExecution", "실행자 필터", "실행자");
    createTranslationKeyIfNotExists(
        "testExecution.filter.executedBy.placeholder", "testExecution", "실행자 입력 안내", "username");
    createTranslationKeyIfNotExists(
        "testExecution.filter.jiraIssueKey", "testExecution", "JIRA 아이디 필터", "JIRA 아이디");
    createTranslationKeyIfNotExists(
        "testExecution.filter.apply", "testExecution", "필터 적용 버튼", "적용");
    createTranslationKeyIfNotExists(
        "testExecution.filter.clear", "testExecution", "필터 초기화 버튼", "초기화");
    createTranslationKeyIfNotExists(
        "testExecution.filter.testCaseName", "testExecution", "테스트 케이스명 필터", "테스트 케이스명");
    createTranslationKeyIfNotExists(
        "testExecution.filter.testCaseName.placeholder",
        "testExecution",
        "테스트 케이스명 입력 안내",
        "케이스명 검색");

    // 작업 컬럼 헤더 (통합)
    createTranslationKeyIfNotExists(
        "testExecution.table.actions", "testExecution", "작업 컬럼 헤더", "작업");

    createTranslationKeyIfNotExists(
        "testExecution.error.alreadyCompleted",
        "testExecution",
        "완료된 실행 결과 업데이트 차단 오류",
        "이미 완료된 테스트 실행입니다. 결과를 입력하거나 수정할 수 없습니다.");
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
