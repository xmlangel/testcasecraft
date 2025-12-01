// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTestExecutionTranslations.java
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
 * 한국어 번역 - 테스트 실행 관련
 * testExecution.* 관련 번역들
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanTestExecutionTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                createTranslationIfNotExists("testExecution.title", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "실행 이력", createdBy);
                createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
                createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "실행 이력이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "실행 삭제", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "정말로 이 실행을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("testExecution.form.title.create", languageCode, "테스트 실행 등록", createdBy);
                createTranslationIfNotExists("testExecution.form.title.edit", languageCode, "테스트 실행: {name}",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.executionName", languageCode, "실행명", createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "테스트 계획", createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan.select", languageCode, "선택", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediately", languageCode, "저장 후 즉시 실행 시작",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediately.description", languageCode,
                                "체크하면 저장과 동시에 테스트 실행이 '진행 중' 상태로 변경되며, 창을 닫지 않고 현재 화면에서 바로 테스트를 시작할 수 있습니다", createdBy);
                createTranslationIfNotExists("testExecution.form.button.list", languageCode, "목록", createdBy);
                createTranslationIfNotExists("testExecution.form.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testExecution.form.button.save", languageCode, "저장", createdBy);
                createTranslationIfNotExists("testExecution.form.button.saveAndStart", languageCode, "저장 및 시작",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.start", languageCode, "실행시작", createdBy);
                createTranslationIfNotExists("testExecution.form.button.complete", languageCode, "실행완료", createdBy);
                createTranslationIfNotExists("testExecution.form.button.restart", languageCode, "재실행", createdBy);
                createTranslationIfNotExists("testExecution.form.button.hideGuide", languageCode, "안내 숨기기", createdBy);
                createTranslationIfNotExists("testExecution.form.button.showGuide", languageCode, "실행 절차", createdBy);
                createTranslationIfNotExists("testExecution.info.title", languageCode, "실행 정보", createdBy);
                createTranslationIfNotExists("testExecution.info.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("testExecution.info.startDate", languageCode, "시작일시", createdBy);
                createTranslationIfNotExists("testExecution.info.endDate", languageCode, "종료일시", createdBy);
                createTranslationIfNotExists("testExecution.info.progress", languageCode, "진행률", createdBy);
                createTranslationIfNotExists("testExecution.info.total", languageCode, "총 {total} 건", createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 테스트 실행 절차 안내", createdBy);
                createTranslationIfNotExists("testExecution.guide.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. 테스트 실행 준비",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.description", languageCode,
                                "실행명, 테스트 계획, 설명을 입력하고 '저장' 버튼을 클릭합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. 실행 시작", createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. 테스트 케이스 실행",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. 실행 완료", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. 결과 확인", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. 재실행 (완료 후)",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "폴더/케이스",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "케이스명", createdBy);
                createTranslationIfNotExists("testExecution.table.header.result", languageCode, "결과", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "실행일시", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "실행자", createdBy);
                createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "비고", createdBy);
                createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
                createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "결과입력", createdBy);
                createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "이전결과",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.table.executionId", languageCode, "실행ID", createdBy);
                createTranslationIfNotExists("testExecution.table.executionName", languageCode, "실행명", createdBy);
                createTranslationIfNotExists("testExecution.table.button.resultInput", languageCode, "결과입력", createdBy);
                createTranslationIfNotExists("testExecution.table.button.previousResults", languageCode, "이전결과",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.button.attachments", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.pagination.info", languageCode,
                                "총 {totalItems}개 항목 중 {start}-{end}개 표시", createdBy);
                createTranslationIfNotExists("testExecution.pagination.page", languageCode, "페이지 {current} / {total}",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.noTestCases", languageCode, "표시할 테스트 케이스가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.title", languageCode, "이전 실행 결과",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.noResults", languageCode, "이전 실행 결과가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executedAt", languageCode, "실행일시",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.result", languageCode, "결과",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executionId", languageCode, "실행ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executionName", languageCode, "실행명",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executedBy", languageCode, "실행자",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.notes", languageCode, "비고",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.jiraId", languageCode, "JIRA ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.attachments", languageCode, "첨부파일",
                                createdBy);
                createTranslationIfNotExists("testExecution.attachments.title", languageCode, "테스트 결과 첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.attachments.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testExecution.jira.urlNotSet", languageCode, "{issueKey} (JIRA URL 미설정)",
                                createdBy);
                createTranslationIfNotExists("testExecution.success.savedAndStarted", languageCode,
                                "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testExecution.form.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("testExecution.table.folderCase", languageCode, "폴더/케이스", createdBy);
                createTranslationIfNotExists("testExecution.form.titleNew", languageCode, "테스트 실행 등록", createdBy);
                createTranslationIfNotExists("testExecution.form.titleEdit", languageCode, "테스트 실행: {name}", createdBy);
                createTranslationIfNotExists("testExecution.actions.enterResult", languageCode, "결과입력", createdBy);
                createTranslationIfNotExists("testExecution.actions.prevResults", languageCode, "이전 결과", createdBy);
                createTranslationIfNotExists("testExecution.table.prevResults", languageCode, "이전 결과", createdBy);
                createTranslationIfNotExists("testExecution.actions.startExecution", languageCode, "실행시작", createdBy);
                createTranslationIfNotExists("testExecution.actions.completeExecution", languageCode, "실행완료",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.rerunExecution", languageCode, "재실행", createdBy);
                createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "폴더/케이스",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "케이스명", createdBy);
                createTranslationIfNotExists("testExecution.table.header.result", languageCode, "결과", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "실행일시", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "실행자", createdBy);
                createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "비고", createdBy);
                createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
                createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "결과입력", createdBy);
                createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "이전결과",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.dialog.attachments.title", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.dialog.attachments.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testExecution.progress.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("testExecution.progress.total", languageCode, "전체", createdBy);
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
                createTranslationIfNotExists("testExecution.form.saveAndStart", languageCode, "저장 후 시작", createdBy);
                createTranslationIfNotExists("testExecution.form.executionName", languageCode, "실행명", createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "테스트플랜", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testExecution.form.progress", languageCode, "진행률", createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediatelyLabel", languageCode, "즉시 시작",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediatelyDescription", languageCode,
                                "저장 후 바로 실행을 시작합니다.", createdBy);
                createTranslationIfNotExists("testExecution.actions.restartExecution", languageCode, "재실행", createdBy);
                createTranslationIfNotExists("testExecution.prevResults.title", languageCode, "이전 실행 결과", createdBy);
                createTranslationIfNotExists("testExecution.prevResults.noResults", languageCode, "이전 실행 결과가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "시작 전", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "진행 중", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "테스트 실행", createdBy);
                createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
                createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "등록된 테스트 실행이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "실행 삭제", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "이 테스트 실행을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 테스트 실행 절차 안내", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. 실행 정보 입력", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.description", languageCode,
                                "실행명, 테스트플랜, 설명 등 기본 정보를 입력합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. 실행 시작", createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "'실행시작' 버튼을 클릭하면 테스트 실행이 '진행 중' 상태로 변경됩니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. 테스트 케이스 실행",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "각 테스트 케이스의 '결과입력' 버튼을 클릭하여 테스트 결과를 기록합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. 실행 완료", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "모든 테스트가 완료되면 '실행완료' 버튼을 클릭하여 실행을 완료합니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. 결과 확인", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "진행률과 결과 통계를 확인하고, 필요시 '이전결과' 버튼으로 과거 실행 내역을 조회할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. 재실행 (완료 후)",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "완료된 테스트 실행은 '재실행' 버튼을 클릭하여 다시 진행 중 상태로 변경하고 추가 테스트를 수행할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testExecution.table.viewAttachments", languageCode, "첨부파일 보기", createdBy);
                createTranslationIfNotExists("testExecution.form.registerTitle", languageCode, "테스트 실행 등록", createdBy);
                createTranslationIfNotExists("testExecution.form.executionInfo", languageCode, "실행 정보", createdBy);
                createTranslationIfNotExists("testExecution.form.startDate", languageCode, "시작일시", createdBy);
                createTranslationIfNotExists("testExecution.form.endDate", languageCode, "종료일시", createdBy);
                createTranslationIfNotExists("testExecution.form.editTitle", languageCode, "테스트 실행: {name}", createdBy);
                createTranslationIfNotExists("testExecution.table.attachments", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.attachments.title", languageCode, "테스트 결과 첨부파일", createdBy);
                createTranslationIfNotExists("testExecution.form.totalCount", languageCode, "총 {count}건", createdBy);
                createTranslationIfNotExists("testExecution.table.noData", languageCode, "표시할 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode, "테스트 실행 가이드", createdBy);
                createTranslationIfNotExists("testExecution.guide.hideGuide", languageCode, "가이드 숨기기", createdBy);
                createTranslationIfNotExists("testExecution.guide.showGuide", languageCode, "가이드 보기", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "단계 1: 테스트 플랜 선택",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "단계 2: 실행 정보 입력",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "테스트 실행명, 설명, 담당자 등 기본 정보를 입력합니다", createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "단계 3: 테스트 케이스 확인",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "선택된 테스트 플랜의 케이스들을 확인하고 실행 순서를 조정할 수 있습니다", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "단계 4: 실행 시작", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "모든 정보를 확인 후 테스트 실행을 시작합니다",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "단계 5: 결과 입력", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "각 테스트 케이스별로 실행 결과를 입력합니다",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "단계 6: 실행 완료", createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "모든 테스트 케이스 실행이 완료되면 전체 실행을 종료합니다", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "테스트 실행 목록", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "테스트 실행 삭제", createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "시작 안됨", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "진행중", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "새 실행", createdBy);
                createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "실행 목록이 없습니다", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "이 테스트 실행을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "삭제", createdBy);

                createTranslationIfNotExists("testExecution.form.tags", languageCode, "태그", createdBy);
                createTranslationIfNotExists("testExecution.form.tagsPlaceholder", languageCode, "태그를 입력하고 Enter를 누르세요",
                                createdBy);
                createTranslationIfNotExists("testExecution.helper.tags", languageCode, "여러 태그를 입력할 수 있습니다.",
                                createdBy);

                // 일괄 결과 입력 관련 한글 번역
                createTranslationIfNotExists("testExecution.bulk.selectAll", languageCode, "전체 선택", createdBy);
                createTranslationIfNotExists("testExecution.bulk.deselectAll", languageCode, "전체 해제", createdBy);
                createTranslationIfNotExists("testExecution.bulk.selectedCount", languageCode, "{count}개 선택됨",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.actionToolbar.title", languageCode, "일괄 작업",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.actionToolbar.deselect", languageCode, "선택 해제",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.title", languageCode, "일괄 결과 입력", createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.selectedCases", languageCode, "선택된 테스트케이스",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.selectResult", languageCode, "결과 선택",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonNotes", languageCode, "공통 비고", createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonTags", languageCode, "공통 태그", createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonJiraId", languageCode, "공통 JIRA ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.confirm", languageCode, "확인", createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testExecution.bulk.success", languageCode, "{count}개 테스트케이스 결과가 저장되었습니다",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.error", languageCode, "일괄 결과 저장 중 오류 발생: {error}",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.processing", languageCode, "{current}/{total} 처리 중...",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.partialSuccess", languageCode,
                                "{success}개 성공, {failed}개 실패",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.select", languageCode, "선택", createdBy);
                createTranslationIfNotExists("testExecution.table.priority", languageCode, "우선순위", createdBy);

                // 필터 관련 번역 추가
                createTranslationIfNotExists("testExecution.filter.title", languageCode, "필터", createdBy);
                createTranslationIfNotExists("testExecution.filter.active", languageCode, "적용 중", createdBy);
                createTranslationIfNotExists("testExecution.filter.all", languageCode, "전체", createdBy);
                createTranslationIfNotExists("testExecution.filter.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority", languageCode, "우선순위", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.high", languageCode, "높음", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.medium", languageCode, "중간", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.low", languageCode, "낮음", createdBy);
                createTranslationIfNotExists("testExecution.filter.result", languageCode, "결과", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.pass", languageCode, "PASS", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.fail", languageCode, "FAIL", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.blocked", languageCode, "BLOCKED", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.notRun", languageCode, "NOT RUN", createdBy);
                createTranslationIfNotExists("testExecution.filter.executedBy", languageCode, "실행자", createdBy);
                createTranslationIfNotExists("testExecution.filter.executedBy.placeholder", languageCode, "username", createdBy);
                createTranslationIfNotExists("testExecution.filter.dateFrom", languageCode, "실행일자 (시작)", createdBy);
                createTranslationIfNotExists("testExecution.filter.dateTo", languageCode, "실행일자 (종료)", createdBy);
                createTranslationIfNotExists("testExecution.filter.jiraIssueKey", languageCode, "JIRA 아이디", createdBy);
                createTranslationIfNotExists("testExecution.filter.apply", languageCode, "적용", createdBy);
                createTranslationIfNotExists("testExecution.filter.clear", languageCode, "초기화", createdBy);
                createTranslationIfNotExists("testExecution.filter.noResults", languageCode, "필터 조건에 맞는 테스트 실행이 없습니다.", createdBy);
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
