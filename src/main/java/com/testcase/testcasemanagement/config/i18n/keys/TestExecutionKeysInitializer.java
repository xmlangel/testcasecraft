// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TestExecutionKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TestExecutionKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 테스트 실행 관련 키들
        createTranslationKeyIfNotExists("testExecution.title", "testExecution", "테스트 실행 페이지 제목", "테스트 실행");
        createTranslationKeyIfNotExists("testExecution.createTitle", "testExecution", "테스트 실행 등록 제목", "테스트 실행 등록");
        createTranslationKeyIfNotExists("testExecution.list.title", "testExecution", "실행 이력 제목", "실행 이력");
        createTranslationKeyIfNotExists("testExecution.list.newExecution", "testExecution", "새 실행 버튼", "새 실행");
        createTranslationKeyIfNotExists("testExecution.list.noExecutions", "testExecution", "실행 이력 없음 메시지", "실행 이력이 없습니다.");
        createTranslationKeyIfNotExists("testExecution.list.delete", "testExecution", "실행 삭제 확인", "실행 삭제");
        createTranslationKeyIfNotExists("testExecution.list.deleteConfirm", "testExecution", "실행 삭제 확인 메시지", "정말로 이 실행을 삭제하시겠습니까?");

        // 테스트 실행 폼 관련
        createTranslationKeyIfNotExists("testExecution.form.name", "testExecution", "실행명 라벨", "실행명");
        createTranslationKeyIfNotExists("testExecution.form.testPlan", "testExecution", "테스트 계획 라벨", "테스트 계획");
        createTranslationKeyIfNotExists("testExecution.form.description", "testExecution", "설명 라벨", "설명");
        createTranslationKeyIfNotExists("testExecution.form.status", "testExecution", "상태 라벨", "상태");
        createTranslationKeyIfNotExists("testExecution.form.startDate", "testExecution", "시작일시 라벨", "시작일시");
        createTranslationKeyIfNotExists("testExecution.form.endDate", "testExecution", "종료일시 라벨", "종료일시");
        createTranslationKeyIfNotExists("testExecution.form.progress", "testExecution", "진행률 라벨", "진행률");
        createTranslationKeyIfNotExists("testExecution.form.executionInfo", "testExecution", "실행 정보 제목", "실행 정보");

        // 테스트 실행 버튼들
        createTranslationKeyIfNotExists("testExecution.buttons.save", "testExecution", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("testExecution.buttons.saveAndStart", "testExecution", "저장 및 시작 버튼", "저장 및 시작");
        createTranslationKeyIfNotExists("testExecution.buttons.start", "testExecution", "실행시작 버튼", "실행시작");
        createTranslationKeyIfNotExists("testExecution.buttons.complete", "testExecution", "실행완료 버튼", "실행완료");
        createTranslationKeyIfNotExists("testExecution.buttons.restart", "testExecution", "재실행 버튼", "재실행");
        createTranslationKeyIfNotExists("testExecution.buttons.list", "testExecution", "목록 버튼", "목록");
        createTranslationKeyIfNotExists("testExecution.buttons.cancel", "testExecution", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testExecution.buttons.resultInput", "testExecution", "결과입력 버튼", "결과입력");
        createTranslationKeyIfNotExists("testExecution.buttons.previousResults", "testExecution", "이전결과 버튼", "이전결과");
        createTranslationKeyIfNotExists("testExecution.buttons.attachments", "testExecution", "첨부파일 버튼", "첨부파일");
        createTranslationKeyIfNotExists("testExecution.buttons.executionGuide", "testExecution", "실행 절차 버튼", "실행 절차");
        createTranslationKeyIfNotExists("testExecution.buttons.hideGuide", "testExecution", "안내 숨기기 버튼", "안내 숨기기");
        createTranslationKeyIfNotExists("testExecution.buttons.close", "testExecution", "닫기 버튼", "닫기");

        // 테스트 실행 테이블 헤더
        createTranslationKeyIfNotExists("testExecution.table.folderCase", "testExecution", "폴더/케이스 컬럼", "폴더/케이스");
        createTranslationKeyIfNotExists("testExecution.table.caseName", "testExecution", "케이스명 컬럼", "케이스명");
        createTranslationKeyIfNotExists("testExecution.table.result", "testExecution", "결과 컬럼", "결과");
        createTranslationKeyIfNotExists("testExecution.table.executedAt", "testExecution", "실행일시 컬럼", "실행일시");
        createTranslationKeyIfNotExists("testExecution.table.executedBy", "testExecution", "실행자 컬럼", "실행자");
        createTranslationKeyIfNotExists("testExecution.table.notes", "testExecution", "비고 컬럼", "비고");
        createTranslationKeyIfNotExists("testExecution.table.jiraId", "testExecution", "JIRA ID 컬럼", "JIRA ID");
        createTranslationKeyIfNotExists("testExecution.table.attachments", "testExecution", "첨부파일 컬럼", "첨부파일");
        createTranslationKeyIfNotExists("testExecution.table.noTestCases", "testExecution", "테스트케이스 없음 메시지", "표시할 테스트 케이스가 없습니다.");

        // 테스트 실행 상태 칩
        createTranslationKeyIfNotExists("testExecution.status.notStarted", "testExecution", "시작 전 상태", "Not Started");
        createTranslationKeyIfNotExists("testExecution.status.inProgress", "testExecution", "진행 중 상태", "In Progress");
        createTranslationKeyIfNotExists("testExecution.status.completed", "testExecution", "완료 상태", "Completed");

        // 테스트 실행 통계
        createTranslationKeyIfNotExists("testExecution.stats.pass", "testExecution", "통과 통계", "Pass: {count}");
        createTranslationKeyIfNotExists("testExecution.stats.fail", "testExecution", "실패 통계", "Fail: {count}");
        createTranslationKeyIfNotExists("testExecution.stats.notrun", "testExecution", "미실행 통계", "NotRun: {count}");
        createTranslationKeyIfNotExists("testExecution.stats.blocked", "testExecution", "블록됨 통계", "Blocked: {count}");
        createTranslationKeyIfNotExists("testExecution.stats.total", "testExecution", "총 개수", "총 {count} 건");

        // 테스트 실행 즉시 시작 옵션
        createTranslationKeyIfNotExists("testExecution.options.startImmediately", "testExecution", "즉시 실행 시작 옵션", "저장 후 즉시 실행 시작");
        createTranslationKeyIfNotExists("testExecution.options.startImmediately.description", "testExecution", "즉시 실행 시작 설명", "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다");

        // 이전 결과 다이얼로그
        createTranslationKeyIfNotExists("testExecution.previousResults.title", "testExecution", "이전 실행 결과 제목", "이전 실행 결과");
        createTranslationKeyIfNotExists("testExecution.previousResults.noResults", "testExecution", "이전 실행 결과 없음", "이전 실행 결과가 없습니다.");
        createTranslationKeyIfNotExists("testExecution.previousResults.executionDate", "testExecution", "실행일시 컬럼", "실행일시");
        createTranslationKeyIfNotExists("testExecution.previousResults.executionId", "testExecution", "실행ID 컬럼", "실행ID");
        createTranslationKeyIfNotExists("testExecution.previousResults.executionName", "testExecution", "실행명 컬럼", "실행명");
        createTranslationKeyIfNotExists("testExecution.previousResults.executor", "testExecution", "실행자 컬럼", "실행자");

        // 페이지네이션 관련
        createTranslationKeyIfNotExists("testExecution.pagination.showing", "testExecution", "페이지 정보 표시", "총 {total}개 항목 중 {start}-{end}개 표시");
        createTranslationKeyIfNotExists("testExecution.pagination.page", "testExecution", "페이지 정보", "페이지 {current} / {total}");

        // 첨부파일 관련
        createTranslationKeyIfNotExists("testExecution.attachments.title", "testExecution", "테스트 결과 첨부파일 제목", "테스트 결과 첨부파일");
        createTranslationKeyIfNotExists("testExecution.attachments.view", "testExecution", "첨부파일 보기", "첨부파일 보기");

        // 추가 번역 키 (누락된 것들)
        createTranslationKeyIfNotExists("testExecution.list.delete.title", "testExecution", "실행 삭제 제목", "실행 삭제");
        createTranslationKeyIfNotExists("testExecution.list.delete.confirm", "testExecution", "실행 삭제 확인 메시지", "정말로 이 실행을 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("testExecution.list.delete.cancel", "testExecution", "취소", "취소");
        createTranslationKeyIfNotExists("testExecution.list.delete.delete", "testExecution", "삭제", "삭제");

        createTranslationKeyIfNotExists("testExecution.form.title.create", "testExecution", "테스트 실행 등록 제목", "테스트 실행 등록");
        createTranslationKeyIfNotExists("testExecution.form.title.edit", "testExecution", "테스트 실행 편집 제목", "테스트 실행: {name}");
        createTranslationKeyIfNotExists("testExecution.form.executionName", "testExecution", "실행명", "실행명");
        createTranslationKeyIfNotExists("testExecution.form.testPlan.select", "testExecution", "선택", "선택");

        createTranslationKeyIfNotExists("testExecution.form.button.list", "testExecution", "목록", "목록");
        createTranslationKeyIfNotExists("testExecution.form.button.cancel", "testExecution", "취소", "취소");
        createTranslationKeyIfNotExists("testExecution.form.button.save", "testExecution", "저장", "저장");
        createTranslationKeyIfNotExists("testExecution.form.button.saveAndStart", "testExecution", "저장 및 시작", "저장 및 시작");
        createTranslationKeyIfNotExists("testExecution.form.button.start", "testExecution", "실행시작", "실행시작");
        createTranslationKeyIfNotExists("testExecution.form.button.complete", "testExecution", "실행완료", "실행완료");
        createTranslationKeyIfNotExists("testExecution.form.button.restart", "testExecution", "재실행", "재실행");
        createTranslationKeyIfNotExists("testExecution.form.button.hideGuide", "testExecution", "안내 숨기기", "안내 숨기기");
        createTranslationKeyIfNotExists("testExecution.form.button.showGuide", "testExecution", "실행 절차", "실행 절차");

        createTranslationKeyIfNotExists("testExecution.info.title", "testExecution", "실행 정보", "실행 정보");
        createTranslationKeyIfNotExists("testExecution.info.status", "testExecution", "상태", "상태");
        createTranslationKeyIfNotExists("testExecution.info.startDate", "testExecution", "시작일시", "시작일시");
        createTranslationKeyIfNotExists("testExecution.info.endDate", "testExecution", "종료일시", "종료일시");
        createTranslationKeyIfNotExists("testExecution.info.progress", "testExecution", "진행률", "진행률");
        createTranslationKeyIfNotExists("testExecution.info.total", "testExecution", "총 건수", "총 {total} 건");

        // 테스트 실행 가이드
        createTranslationKeyIfNotExists("testExecution.guide.title", "testExecution", "테스트 실행 절차 안내", "📋 테스트 실행 절차 안내");
        createTranslationKeyIfNotExists("testExecution.guide.close", "testExecution", "닫기", "닫기");
        createTranslationKeyIfNotExists("testExecution.guide.step1.title", "testExecution", "1단계 제목", "1. 테스트 실행 준비");
        createTranslationKeyIfNotExists("testExecution.guide.step1.description", "testExecution", "1단계 설명", "실행명, 테스트 계획, 설명을 입력하고 '저장' 버튼을 클릭합니다.");
        createTranslationKeyIfNotExists("testExecution.guide.step2.title", "testExecution", "2단계 제목", "2. 실행 시작");
        createTranslationKeyIfNotExists("testExecution.guide.step2.description", "testExecution", "2단계 설명", "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.");
        createTranslationKeyIfNotExists("testExecution.guide.step3.title", "testExecution", "3단계 제목", "3. 테스트 케이스 실행");
        createTranslationKeyIfNotExists("testExecution.guide.step3.description", "testExecution", "3단계 설명", "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.");
        createTranslationKeyIfNotExists("testExecution.guide.step4.title", "testExecution", "4단계 제목", "4. 실행 완료");
        createTranslationKeyIfNotExists("testExecution.guide.step4.description", "testExecution", "4단계 설명", "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.");
        createTranslationKeyIfNotExists("testExecution.guide.step5.title", "testExecution", "5단계 제목", "5. 결과 확인");
        createTranslationKeyIfNotExists("testExecution.guide.step5.description", "testExecution", "5단계 설명", "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.");
        createTranslationKeyIfNotExists("testExecution.guide.step6.title", "testExecution", "6단계 제목", "6. 재실행 (완료 후)");
        createTranslationKeyIfNotExists("testExecution.guide.step6.description", "testExecution", "6단계 설명", "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.");

        // 새로 추가된 번역 키들
        createTranslationKeyIfNotExists("testExecution.table.viewAttachments", "testExecution", "첨부파일 보기 툴팁", "첨부파일 보기");
        createTranslationKeyIfNotExists("testExecution.form.registerTitle", "testExecution", "테스트 실행 등록 제목", "테스트 실행 등록");
        createTranslationKeyIfNotExists("testExecution.form.editTitle", "testExecution", "테스트 실행 편집 제목", "테스트 실행: {name}");
        createTranslationKeyIfNotExists("testExecution.table.attachments", "testExecution", "첨부파일", "첨부파일");
        createTranslationKeyIfNotExists("testExecution.attachments.title", "testExecution", "첨부파일 다이얼로그 제목", "테스트 결과 첨부파일");

        // Common 키들
        createTranslationKeyIfNotExists("common.list", "common", "목록", "목록");
        createTranslationKeyIfNotExists("common.cancel", "common", "취소", "취소");

        // 테스트 케이스 테이블 헤더
        createTranslationKeyIfNotExists("testExecution.table.header.folderCase", "testExecution", "폴더/케이스", "폴더/케이스");
        createTranslationKeyIfNotExists("testExecution.table.header.caseName", "testExecution", "케이스명", "케이스명");
        createTranslationKeyIfNotExists("testExecution.table.header.result", "testExecution", "결과", "결과");
        createTranslationKeyIfNotExists("testExecution.table.header.executedAt", "testExecution", "실행일시", "실행일시");
        createTranslationKeyIfNotExists("testExecution.table.header.executedBy", "testExecution", "실행자", "실행자");
        createTranslationKeyIfNotExists("testExecution.table.header.notes", "testExecution", "비고", "비고");
        createTranslationKeyIfNotExists("testExecution.table.header.jiraId", "testExecution", "JIRA ID", "JIRA ID");
        createTranslationKeyIfNotExists("testExecution.table.header.resultInput", "testExecution", "결과입력", "결과입력");
        createTranslationKeyIfNotExists("testExecution.table.header.previousResults", "testExecution", "이전결과", "이전결과");
        createTranslationKeyIfNotExists("testExecution.table.header.attachments", "testExecution", "첨부파일", "첨부파일");

        // 테스트 케이스 테이블 버튼
        createTranslationKeyIfNotExists("testExecution.table.button.resultInput", "testExecution", "결과입력", "결과입력");
        createTranslationKeyIfNotExists("testExecution.table.button.previousResults", "testExecution", "이전결과", "이전결과");
        createTranslationKeyIfNotExists("testExecution.table.button.attachments", "testExecution", "첨부파일", "첨부파일");

        // 페이지네이션
        createTranslationKeyIfNotExists("testExecution.pagination.info", "testExecution", "페이지 정보", "총 {totalItems}개 항목 중 {start}-{end}개 표시");
        createTranslationKeyIfNotExists("testExecution.pagination.page", "testExecution", "페이지", "페이지 {current} / {total}");

        // 이전 결과 다이얼로그 테이블
        createTranslationKeyIfNotExists("testExecution.previousResults.table.executedAt", "testExecution", "실행일시", "실행일시");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.result", "testExecution", "결과", "결과");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.executionId", "testExecution", "실행ID", "실행ID");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.executionName", "testExecution", "실행명", "실행명");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.executedBy", "testExecution", "실행자", "실행자");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.notes", "testExecution", "비고", "비고");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.jiraId", "testExecution", "JIRA ID", "JIRA ID");
        createTranslationKeyIfNotExists("testExecution.previousResults.table.attachments", "testExecution", "첨부파일", "첨부파일");
        createTranslationKeyIfNotExists("testExecution.previousResults.close", "testExecution", "닫기", "닫기");

        // JIRA 이슈 링크
        createTranslationKeyIfNotExists("testExecution.jira.urlNotSet", "testExecution", "JIRA URL 미설정", "{issueKey} (JIRA URL 미설정)");

        // 성공 메시지
        createTranslationKeyIfNotExists("testExecution.success.savedAndStarted", "testExecution", "저장 및 시작 성공", "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.");

        // 누락된 키들 추가
        createTranslationKeyIfNotExists("testExecution.form.titleNew", "testExecution", "새 테스트 실행 제목", "테스트 실행 등록");
        createTranslationKeyIfNotExists("testExecution.form.titleEdit", "testExecution", "테스트 실행 편집 제목", "테스트 실행: {name}");
        createTranslationKeyIfNotExists("testExecution.form.saveAndStart", "testExecution", "저장 및 시작", "저장 및 시작");
        createTranslationKeyIfNotExists("testExecution.form.startImmediatelyLabel", "testExecution", "즉시 실행 시작", "저장 후 즉시 실행 시작");
        createTranslationKeyIfNotExists("testExecution.form.startImmediatelyDescription", "testExecution", "즉시 실행 시작 설명", "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다");

        createTranslationKeyIfNotExists("testExecution.guide.hide", "testExecution", "안내 숨기기", "안내 숨기기");
        createTranslationKeyIfNotExists("testExecution.guide.show", "testExecution", "실행 절차", "실행 절차");

        createTranslationKeyIfNotExists("testExecution.actions.enterResult", "testExecution", "결과입력", "결과입력");
        createTranslationKeyIfNotExists("testExecution.actions.prevResults", "testExecution", "이전결과", "이전결과");
        createTranslationKeyIfNotExists("testExecution.actions.startExecution", "testExecution", "실행시작", "실행시작");
        createTranslationKeyIfNotExists("testExecution.actions.completeExecution", "testExecution", "실행완료", "실행완료");
        createTranslationKeyIfNotExists("testExecution.actions.restartExecution", "testExecution", "재실행", "재실행");

        createTranslationKeyIfNotExists("testExecution.table.enterResult", "testExecution", "결과입력", "결과입력");
        createTranslationKeyIfNotExists("testExecution.table.prevResults", "testExecution", "이전결과", "이전결과");

        createTranslationKeyIfNotExists("testExecution.prevResults.title", "testExecution", "이전 실행 결과", "이전 실행 결과");
        createTranslationKeyIfNotExists("testExecution.prevResults.noResults", "testExecution", "이전 실행 결과 없음", "이전 실행 결과가 없습니다.");

        createTranslationKeyIfNotExists("testExecution.attachments.dialogTitle", "testExecution", "테스트 결과 첨부파일", "테스트 결과 첨부파일");

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
