// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanCommonAndExtendedUITranslationsPart2.java
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
 * 한국어 번역 - 테스트케이스, 자동화 테스트, 첨부파일
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanTestCaseAndAutomationTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "ko";
                String createdBy = "system";

                // 섹션 번역
                createTranslationIfNotExists("testcase.sections.basicInfo", languageCode, "기본 정보", createdBy);
                createTranslationIfNotExists("testcase.sections.steps", languageCode, "테스트 단계", createdBy);
                createTranslationIfNotExists("testcase.sections.expectedResults", languageCode, "기대 결과", createdBy);
                createTranslationIfNotExists("testcase.sections.attachments", languageCode, "첨부 파일", createdBy);

                createTranslationIfNotExists("testcase.spreadsheet.button.addFolder", languageCode, "폴더 추가", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.validate", languageCode, "검증", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.export", languageCode, "Export", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.save", languageCode, "일괄 저장", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.saving", languageCode, "저장 중...", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.stepManagement", languageCode, "스텝 관리",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.fullscreen", languageCode, "전체화면", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.exitFullscreen", languageCode, "전체화면 종료",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.createdBy", languageCode, "작성자", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.updatedBy", languageCode, "수정자", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.order", languageCode, "순서", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.type", languageCode, "타입", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.parentFolder", languageCode, "상위폴더",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.description", languageCode, "설명", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.preCondition", languageCode, "사전조건",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.postCondition", languageCode, "사후조건",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.expectedResults", languageCode, "예상결과",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.isAutomated", languageCode, "자동화여부",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.executionType", languageCode,
                                "Manual/Automation",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.testTechnique", languageCode, "테스트기법",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.step", languageCode, "Step {number}",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.expected", languageCode, "Expected {number}",
                                createdBy);
                createTranslationIfNotExists("testcase.type.folder", languageCode, "폴더", createdBy);
                createTranslationIfNotExists("testcase.type.testcase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "사용법:", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode,
                                "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode,
                                "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode,
                                "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "고급 기능:", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode,
                                "셀 내에서 Enter로 줄바꿈이 가능합니다.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode,
                                "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode, "다중 선택:",
                                createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode,
                                "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode,
                                "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "스텝 추가 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode,
                                "스텝 제거 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "스텝 수 직접 설정...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "스텝 수 설정",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode,
                                "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "스텝 수", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode,
                                "1개부터 10개까지 설정 가능합니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "적용", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.title", languageCode, "새 폴더 생성",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.description", languageCode,
                                "새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.label", languageCode, "폴더명", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.placeholder", languageCode,
                                "예: API 테스트, UI 테스트", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.create", languageCode, "생성", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.csv.title", languageCode, "CSV로 내보내기",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.csv.description", languageCode,
                                "스프레드시트 호환 형식",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.excel.title", languageCode, "Excel로 내보내기",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.excel.description", languageCode,
                                "Microsoft  Excel 형식 (.xlsx)", createdBy);

                // 검증 시스템 관련 한글 번역
                createTranslationIfNotExists("testcase.spreadsheet.validation.title", languageCode, "데이터 검증 결과",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.titleSuccess", languageCode, "데이터 검증 완료",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.summary", languageCode, "검증 요약",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.errors", languageCode,
                                "해결이 필요한 오류 ({count}개)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warnings", languageCode,
                                "권장 사항 ({count}개)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.gotoError", languageCode, "오류 위치로 이동",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.rows", languageCode, "{count}개 행",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.folders", languageCode, "{count}개 폴더",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.testcases", languageCode,
                                "{count}개 테스트케이스", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.errorCount", languageCode, "{count}개 오류",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warningCount", languageCode,
                                "{count}개 경고", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.column", languageCode, "컬럼", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.row", languageCode, "행", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.solution", languageCode, "💡 해결 방법:",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.improvement", languageCode, "💡 개선 방법:",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.successMessage", languageCode,
                                "모든 데이터가 유효합니다! 저장할 준비가 완료되었습니다.", createdBy);

                // 검증 오류/경고 메시지 한글
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.nameRequired", languageCode,
                                "{row}번 행: 이름은 필수 입력 항목입니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.duplicateFolder", languageCode,
                                "{row}번 행: 폴더명 \"{name}\"이 중복됩니다. 폴더명은 고유해야 합니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.duplicateTestCase", languageCode,
                                "{row}번 행: 테스트케이스명 \"{name}\"이 같은 폴더에서 중복됩니다. 같은 폴더 내에서 테스트케이스명은 고유해야 합니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.circularReference", languageCode,
                                "{row}번 행: \"{name}\"이 자기 자신을 상위폴더로 지정했습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.missingParentFolder", languageCode,
                                "{row}번 행: 상위폴더 \"{parent}\"을 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.invalidType", languageCode,
                                "{row}번 행: 타입 \"{type}\"이 표준 형식이 아닙니다. '폴더' 또는 '테스트케이스'를 사용하세요.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.invalidParentType", languageCode,
                                "{row}번 행: \"{parent}\"은 폴더가 아닙니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.missingExpectedResult",
                                languageCode, "{row}번 행: Step {step}의 예상 결과가 비어있습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.noSteps", languageCode,
                                "{row}번 행: 테스트케이스에 실행 단계가 정의되지 않았습니다.", createdBy);

                createTranslationIfNotExists("testcase.form.continueAdding", languageCode, "계속 추가", createdBy);
                createTranslationIfNotExists("testcase.form.button.add", languageCode, "새 케이스 추가", createdBy);

                // 검증 제안 메시지 한글
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.changeParent", languageCode,
                                "다른 폴더를 상위폴더로 지정하거나 상위폴더 필드를 비워두세요.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.createParentFolder",
                                languageCode, "\"{parent}\" 폴더를 먼저 생성하거나 올바른 폴더명/ID를 입력하세요.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.addExpectedResult",
                                languageCode, "각 스텝에 대한 예상 결과를 입력하면 테스트의 명확성이 향상됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.addSteps", languageCode,
                                "최소 하나 이상의 테스트 단계를 추가하세요.", createdBy);

                // 검증 컬럼명 한글
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.name", languageCode, "이름",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.type", languageCode, "타입",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.parentFolder", languageCode,
                                "상위폴더", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.step", languageCode,
                                "Step {number}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.expected", languageCode,
                                "Expected {number}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.all", languageCode, "전체",
                                createdBy);

                createTranslationIfNotExists("testcase.spreadsheet.fallback.title", languageCode, "향상된 스프레드시트 모드",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.fallback.description", languageCode,
                                "모든 기능이 정상적으로 작동합니다. 셀 편집, 복사/붙여넣기, 일괄 저장을 지원합니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.error.title", languageCode, "스프레드시트 로딩 오류",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.error.description", languageCode,
                                "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.multiline", languageCode,
                                "여러 줄 입력 가능...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.text", languageCode, "텍스트 입력...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.columnInput", languageCode,
                                "{title} 입력...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.saveSuccess", languageCode,
                                "{count}개의 테스트케이스가 저장되었습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.saveError", languageCode,
                                "저장 중 오류가 발생했습니다: {error}",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.refreshSuccess", languageCode,
                                "최신 데이터로 새로고침되었습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.refreshError", languageCode,
                                "새로고침 중 오류가 발생했습니다: {error}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.noChanges", languageCode, "변경된 항목이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.batchSaveSuccess", languageCode,
                                "✅ 배치 저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.batchSavePartialFailure", languageCode,
                                "⚠️ 배치 저장 부분 실패:\n✅ 성공: {successCount}개\n❌ 실패: {failureCount}개\n\n", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.failureDetails", languageCode, "실패 내역:\n",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.moreErrors", languageCode,
                                "... 외 {count}개 오류\n",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "스텝 추가 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode,
                                "스텝 제거 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "스텝 수 직접 설정...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "스텝 수 설정",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode,
                                "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "스텝 수", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode,
                                "1개부터 10개까지 설정 가능합니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "적용", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.footer.info", languageCode,
                                "* react-datasheet-grid 기반 고급 스프레드시트 • {count}개 스텝 • 줄바꿈 및 고급 편집 지원", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.footer.warning", languageCode,
                                "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.lineBreakSupport", languageCode, "줄바꿈 지원",
                                createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.title", languageCode, "고급 스프레드시트", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "고급 스프레드시트",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode,
                                "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode,
                                "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode,
                                "고급 스프레드시트 모드",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode,
                                "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.", createdBy);
                createTranslationIfNotExists("attachments.loading", languageCode, "첨부파일을 불러오는 중...", createdBy);
                createTranslationIfNotExists("attachments.empty", languageCode, "첨부파일이 없습니다.", createdBy);
                createTranslationIfNotExists("attachments.title", languageCode, "첨부파일", createdBy);
                createTranslationIfNotExists("attachments.button.download", languageCode, "다운로드", createdBy);
                createTranslationIfNotExists("attachments.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("attachments.delete.title", languageCode, "첨부파일 삭제", createdBy);
                createTranslationIfNotExists("attachments.delete.message", languageCode, "다음 파일을 삭제하시겠습니까?", createdBy);
                createTranslationIfNotExists("attachments.delete.warning", languageCode, "삭제된 파일은 복구할 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.loadFailed", languageCode, "첨부파일 목록을 불러올 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.loadError", languageCode, "첨부파일 목록을 불러오는 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.downloadError", languageCode, "파일 다운로드 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.deleteError", languageCode, "파일 삭제 중 오류가 발생했습니다.",
                                createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "다시 시도", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("common.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("testcase.inputMode.title", languageCode, "입력 모드 선택", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "개별 폼", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "스프레드시트", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "고급 스프레드시트",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.description", languageCode,
                                "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode,
                                "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode,
                                "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode, "개별 폼으로 상세 입력 (기존 방식)",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode,
                                "스프레드시트로 일괄 입력 (기본 버전)",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode,
                                "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.ariaLabel", languageCode, "폼 모드", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.ariaLabel", languageCode, "스프레드시트 모드",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode,
                                "고급 스프레드시트 모드",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.status", languageCode,
                                "📝 현재 {count}개의 테스트케이스가 있습니다.",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.features", languageCode,
                                "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode,
                                "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode,
                                "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode,
                                "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode,
                                "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기", createdBy);
                createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode,
                                "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.", createdBy);
                createTranslationIfNotExists("junit.dashboard.title", languageCode, "테스트 결과 대시보드", createdBy);
                createTranslationIfNotExists("junit.dashboard.subtitle", languageCode, "{projectName} - 자동화 테스트 결과 분석",
                                createdBy);
                createTranslationIfNotExists("junit.dashboard.upload", languageCode, "업로드", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "업로드 중...", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "테스트 결과 업로드", createdBy);
                createTranslationIfNotExists("junit.dashboard.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("junit.header.testResultDashboard", languageCode, "테스트 결과 대시보드",
                                createdBy);
                createTranslationIfNotExists("junit.header.automationAnalysis", languageCode, "자동화 테스트 결과 분석",
                                createdBy);
                createTranslationIfNotExists("junit.stats.passed", languageCode, "통과", createdBy);
                createTranslationIfNotExists("junit.stats.failed", languageCode, "실패", createdBy);
                createTranslationIfNotExists("junit.stats.error", languageCode, "에러", createdBy);
                createTranslationIfNotExists("junit.stats.skipped", languageCode, "스킵", createdBy);
                createTranslationIfNotExists("junit.stats.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("junit.stats.passedTests", languageCode, "통과한 테스트", createdBy);
                createTranslationIfNotExists("junit.stats.failedTests", languageCode, "실패한 테스트", createdBy);
                createTranslationIfNotExists("junit.stats.errorTests", languageCode, "에러 발생", createdBy);
                createTranslationIfNotExists("junit.stats.averageSuccessRate", languageCode, "평균 성공률", createdBy);
                createTranslationIfNotExists("junit.tab.overview", languageCode, "개요", createdBy);
                createTranslationIfNotExists("junit.tab.recentResults", languageCode, "최근 결과", createdBy);
                createTranslationIfNotExists("junit.tab.statisticsChart", languageCode, "통계 차트", createdBy);
                createTranslationIfNotExists("junit.tab.trendAnalysis", languageCode, "트렌드 분석", createdBy);
                createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode, "테스트 상태 분포",
                                createdBy);
                createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode, "최근 실행 결과", createdBy);
                createTranslationIfNotExists("junit.chart.successRateTrend", languageCode, "성공률 트렌드", createdBy);
                createTranslationIfNotExists("junit.chart.detailedStatistics", languageCode, "상세 통계 정보", createdBy);
                createTranslationIfNotExists("junit.table.executionName", languageCode, "실행 이름", createdBy);
                createTranslationIfNotExists("junit.table.fileName", languageCode, "파일명", createdBy);
                createTranslationIfNotExists("junit.table.totalTests", languageCode, "총 테스트", createdBy);
                createTranslationIfNotExists("junit.table.successRate", languageCode, "성공률", createdBy);
                createTranslationIfNotExists("junit.table.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("junit.table.uploadTime", languageCode, "업로드 시간", createdBy);
                createTranslationIfNotExists("junit.table.actions", languageCode, "작업", createdBy);
                createTranslationIfNotExists("junit.button.viewDetail", languageCode, "상세 보기", createdBy);
                createTranslationIfNotExists("junit.button.delete", languageCode, "삭제", createdBy);
                createTranslationIfNotExists("junit.button.backToAutomation", languageCode, "자동화 테스트로 돌아가기", createdBy);
                createTranslationIfNotExists("junit.message.noResults", languageCode, "테스트 결과가 없습니다", createdBy);
                createTranslationIfNotExists("junit.message.uploadFirst", languageCode,
                                "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.",
                                createdBy);
                createTranslationIfNotExists("junit.message.firstUpload", languageCode, "첫 번째 테스트 결과 업로드", createdBy);
                createTranslationIfNotExists("junit.message.loadingResults", languageCode, "테스트 결과를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("junit.message.loadFailed", languageCode, "테스트 결과를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.message.noData", languageCode, "테스트 결과가 없습니다.", createdBy);
                createTranslationIfNotExists("junit.message.trendDataInsufficient", languageCode,
                                "트렌드 분석을 위한 데이터가 부족합니다.",
                                createdBy);
                createTranslationIfNotExists("junit.message.statisticsImplementing", languageCode, "통계 차트 구현 예정",
                                createdBy);
                createTranslationIfNotExists("junit.message.selectProject", languageCode, "프로젝트를 먼저 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("junit.message.deletingResult", languageCode, "정말로 이 테스트 결과를 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "JUnit XML 파일 업로드", createdBy);
                createTranslationIfNotExists("junit.upload.dragDrop", languageCode, "JUnit XML 파일을 드래그하거나 클릭하여 선택",
                                createdBy);
                createTranslationIfNotExists("junit.upload.selectFile", languageCode, "파일 선택", createdBy);
                createTranslationIfNotExists("junit.upload.selectAnother", languageCode, "다른 파일 선택", createdBy);
                createTranslationIfNotExists("junit.upload.maxSize", languageCode, "최대 {maxSize}까지 업로드 가능", createdBy);
                createTranslationIfNotExists("junit.upload.allowedFormats", languageCode, "허용 형식: {formats}",
                                createdBy);
                createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "테스트 실행 정보", createdBy);
                createTranslationIfNotExists("junit.upload.executionName", languageCode,
                                "실행 이름 (예: Sprint 24 Integration Tests)", createdBy);
                createTranslationIfNotExists("junit.upload.description", languageCode, "설명 (선택사항)", createdBy);
                createTranslationIfNotExists("junit.upload.cancel", languageCode, "취소", createdBy);
                createTranslationIfNotExists("junit.upload.fileSize", languageCode, "크기: {size}", createdBy);
                createTranslationIfNotExists("junit.date.noInfo", languageCode, "날짜 정보 없음", createdBy);
                createTranslationIfNotExists("junit.date.unknown", languageCode, "알 수 없는 날짜 형식", createdBy);
                createTranslationIfNotExists("junit.date.invalid", languageCode, "유효하지 않은 날짜", createdBy);
                createTranslationIfNotExists("junit.date.error", languageCode, "날짜 처리 오류", createdBy);
                createTranslationIfNotExists("junit.detail.title", languageCode, "JUnit 테스트 결과 상세", createdBy);
                createTranslationIfNotExists("junit.detail.uploadInfo", languageCode, "업로드: {date} | {uploader}",
                                createdBy);
                createTranslationIfNotExists("junit.detail.loadingDetail", languageCode, "테스트 결과 상세 정보를 불러오는 중...",
                                createdBy);
                createTranslationIfNotExists("junit.detail.loadFailedDetail", languageCode,
                                "테스트 결과 상세 정보를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.notFound", languageCode, "테스트 결과를 찾을 수 없습니다.", createdBy);
                createTranslationIfNotExists("junit.detail.exportPDF", languageCode, "PDF 내보내기", createdBy);
                createTranslationIfNotExists("junit.detail.exportingPDF", languageCode, "PDF 생성 중...", createdBy);
                createTranslationIfNotExists("junit.detail.exportCSV", languageCode, "CSV 내보내기", createdBy);
                createTranslationIfNotExists("junit.detail.exportingCSV", languageCode, "CSV 생성 중...", createdBy);
                createTranslationIfNotExists("junit.detail.versionManagement", languageCode, "버전 관리", createdBy);
                createTranslationIfNotExists("junit.detail.tab.testCases", languageCode, "테스트 케이스", createdBy);
                createTranslationIfNotExists("junit.detail.tab.failedTests", languageCode, "실패한 테스트", createdBy);
                createTranslationIfNotExists("junit.detail.tab.slowTests", languageCode, "느린 테스트", createdBy);
                createTranslationIfNotExists("junit.detail.backToAutomation", languageCode, "자동화 테스트로 돌아가기", createdBy);
                createTranslationIfNotExists("junit.detail.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("junit.detail.noDateInfo", languageCode, "날짜 정보 없음", createdBy);
                createTranslationIfNotExists("junit.detail.unknownDateFormat", languageCode, "알 수 없는 날짜 형식", createdBy);
                createTranslationIfNotExists("junit.detail.invalidDate", languageCode, "유효하지 않은 날짜", createdBy);
                createTranslationIfNotExists("junit.detail.dateProcessingError", languageCode, "날짜 처리 오류", createdBy);
                createTranslationIfNotExists("junit.detail.loadTestCasesFailed", languageCode, "테스트 케이스를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.testSuite", languageCode, "테스트 스위트", createdBy);
                createTranslationIfNotExists("junit.detail.testCaseSearch", languageCode, "테스트 케이스 검색...", createdBy);
                createTranslationIfNotExists("junit.detail.testName", languageCode, "테스트명", createdBy);
                createTranslationIfNotExists("junit.detail.edit", languageCode, "수정", createdBy);
                createTranslationIfNotExists("junit.detail.original", languageCode, "원본", createdBy);
                createTranslationIfNotExists("junit.detail.failedTestCases", languageCode, "실패한 테스트 케이스", createdBy);
                createTranslationIfNotExists("junit.detail.noFailedTests", languageCode, "실패한 테스트 케이스가 없습니다!",
                                createdBy);
                createTranslationIfNotExists("junit.detail.failureMessagePreview", languageCode, "실패 메시지 미리보기:",
                                createdBy);
                createTranslationIfNotExists("junit.detail.clickForDetails", languageCode, "상세 내용을 보려면 테스트명을 클릭하세요",
                                createdBy);
                createTranslationIfNotExists("junit.detail.slowestTests", languageCode, "가장 느린 테스트 케이스", createdBy);
                createTranslationIfNotExists("junit.detail.slowestTestsTop", languageCode,
                                "가장 느린 테스트 케이스 (상위 {count}개)",
                                createdBy);
                createTranslationIfNotExists("junit.detail.noExecutionTimeData", languageCode, "실행 시간 데이터가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFAlert", languageCode, "테스트 결과를 찾을 수 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFComplete", languageCode, "PDF 내보내기 완료", createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFFailed", languageCode, "PDF 내보내기 실패", createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFError", languageCode, "PDF 내보내기 중 오류가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVAlert", languageCode, "내보낼 테스트 결과가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVComplete", languageCode, "CSV 내보내기 완료", createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVFailed", languageCode, "CSV 내보내기 실패", createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVError", languageCode, "CSV 내보내기 중 오류가 발생했습니다",
                                createdBy);
                createTranslationIfNotExists("common.unit.count", languageCode, "개", createdBy);
                createTranslationIfNotExists("common.status", languageCode, "상태", createdBy);
                createTranslationIfNotExists("common.all", languageCode, "전체", createdBy);
                createTranslationIfNotExists("junit.suite.testSuite", languageCode, "테스트 스위트", createdBy);
                createTranslationIfNotExists("junit.suite.all", languageCode, "전체", createdBy);
                createTranslationIfNotExists("junit.suite.search", languageCode, "테스트 케이스 검색...", createdBy);
                createTranslationIfNotExists("junit.failed.title", languageCode, "실패한 테스트 케이스 ({count}개)", createdBy);
                createTranslationIfNotExists("junit.failed.noFailures", languageCode, "실패한 테스트 케이스가 없습니다!", createdBy);
                createTranslationIfNotExists("junit.failed.failureMessage", languageCode, "실패 메시지 미리보기:", createdBy);
                createTranslationIfNotExists("junit.failed.clickForDetail", languageCode, "상세 내용을 보려면 테스트명을 클릭하세요",
                                createdBy);
                createTranslationIfNotExists("junit.slow.title", languageCode, "가장 느린 테스트 케이스 (상위 {count}개)",
                                createdBy);
                createTranslationIfNotExists("junit.slow.noData", languageCode, "실행 시간 데이터가 없습니다.", createdBy);
                createTranslationIfNotExists("testcase.message.selectProject", languageCode, "프로젝트를 먼저 선택하세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.selectOrCreate", languageCode, "테스트케이스를 선택하거나 새로 만드세요.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.noSelection", languageCode, "폴더나 테스트 케이스를 선택해주세요.",
                                createdBy);
                createTranslationIfNotExists("junit.testcase.errorOccurred", languageCode, "오류 발생", createdBy);
                createTranslationIfNotExists("junit.testcase.noData", languageCode, "데이터 없음", createdBy);
                createTranslationIfNotExists("junit.testcase.noDetailInfo", languageCode, "테스트 케이스 상세 정보가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.testcase.edit", languageCode, "테스트 케이스 편집", createdBy);
                createTranslationIfNotExists("junit.testcase.close", languageCode, "닫기", createdBy);
                createTranslationIfNotExists("junit.testcase.previous", languageCode, "이전 테스트 케이스", createdBy);
                createTranslationIfNotExists("junit.testcase.next", languageCode, "다음 테스트 케이스", createdBy);
                createTranslationIfNotExists("junit.tracelog.tab", languageCode, "Tracelog", createdBy);
                createTranslationIfNotExists("junit.tracelog.failureMessage", languageCode, "Failure Message",
                                createdBy);
                createTranslationIfNotExists("junit.tracelog.stackTrace", languageCode, "Stack Trace", createdBy);
                createTranslationIfNotExists("junit.tracelog.skipMessage", languageCode, "Skip Message", createdBy);
                createTranslationIfNotExists("junit.tracelog.noErrorLog", languageCode, "이 테스트 케이스에는 오류 로그가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.testbody.tab", languageCode, "Test Body", createdBy);
                createTranslationIfNotExists("junit.testbody.systemOut", languageCode, "System Out", createdBy);
                createTranslationIfNotExists("junit.testbody.systemErr", languageCode, "System Error", createdBy);
                createTranslationIfNotExists("junit.testbody.noOutput", languageCode, "이 테스트 케이스에는 시스템 출력이 없습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.testbody.fullscreen", languageCode, "전체화면으로 보기", createdBy);
                createTranslationIfNotExists("junit.testbody.fullscreenTitle", languageCode, "Test Body - {testName}",
                                createdBy);
                createTranslationIfNotExists("recentResults.status.notRun", languageCode, "미실행", createdBy);
                createTranslationIfNotExists("recentResults.status.unknown", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("recentResults.message.noResults", languageCode, "최근 테스트 결과가 없습니다.",
                                createdBy);
                createTranslationIfNotExists("recentResults.title.withCount", languageCode, "최근 테스트 결과 ({count}개)",
                                createdBy);
                createTranslationIfNotExists("recentResults.button.refresh", languageCode, "새로고침", createdBy);
                createTranslationIfNotExists("recentResults.label.testcase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("recentResults.label.project", languageCode, "프로젝트:", createdBy);
                createTranslationIfNotExists("recentResults.label.execution", languageCode, "실행:", createdBy);
                createTranslationIfNotExists("recentResults.label.executor", languageCode, "실행자:", createdBy);
                createTranslationIfNotExists("recentResults.label.notes", languageCode, "메모:", createdBy);
                createTranslationIfNotExists("recentResults.testcase.fallback", languageCode, "테스트케이스 {id}", createdBy);
                createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode, "최근 테스트 실행 결과",
                                createdBy);
                createTranslationIfNotExists("junit.fallback.noName", languageCode, "(이름 없음)", createdBy);
                createTranslationIfNotExists("junit.error.loadFailed", languageCode, "테스트 결과를 불러오는데 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("junit.confirm.deleteResult", languageCode, "정말로 이 테스트 결과를 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("junit.comment.fileNameExtraction", languageCode, "파일명에서 실행 이름 추출",
                                createdBy);
                createTranslationIfNotExists("junit.status.uploading", languageCode, "업로드중", createdBy);
                createTranslationIfNotExists("junit.status.parsing", languageCode, "파싱중", createdBy);
                createTranslationIfNotExists("junit.status.completed", languageCode, "완료", createdBy);
                createTranslationIfNotExists("junit.status.unknown", languageCode, "알 수 없음", createdBy);
                createTranslationIfNotExists("junit.placeholder.executionName", languageCode,
                                "실행 이름 (예: Sprint 24 Integration Tests)", createdBy);
                createTranslationIfNotExists("profile.title", languageCode, "사용자 프로필", createdBy);
                createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "기본 정보", createdBy);
                createTranslationIfNotExists("profile.tabs.password", languageCode, "비밀번호", createdBy);
                createTranslationIfNotExists("profile.tabs.language", languageCode, "언어 설정", createdBy);
                createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA 설정", createdBy);
                createTranslationIfNotExists("profile.form.name", languageCode, "이름", createdBy);
                createTranslationIfNotExists("profile.form.email", languageCode, "이메일", createdBy);
                createTranslationIfNotExists("profile.validation.allRequired", languageCode, "이름과 이메일을 모두 입력하세요.",
                                createdBy);
                createTranslationIfNotExists("profile.success.updated", languageCode, "정보가 성공적으로 변경되었습니다.", createdBy);
                createTranslationIfNotExists("profile.error.updateFailed", languageCode, "정보 변경에 실패했습니다.", createdBy);
                createTranslationIfNotExists("language.settings.title", languageCode, "언어 설정", createdBy);
                createTranslationIfNotExists("language.settings.description", languageCode,
                                "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.", createdBy);
                createTranslationIfNotExists("language.interface", languageCode, "인터페이스 언어", createdBy);
                createTranslationIfNotExists("language.helperText", languageCode, "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.",
                                createdBy);
                createTranslationIfNotExists("language.current", languageCode, "현재 언어", createdBy);
                createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
                createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
                createTranslationIfNotExists("profile.jira.settings.title", languageCode, "JIRA 통합 설정", createdBy);
                createTranslationIfNotExists("profile.jira.settings.description", languageCode,
                                "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.", createdBy);
                createTranslationIfNotExists("profile.jira.button.configure", languageCode, "설정 수정", createdBy);
                createTranslationIfNotExists("profile.jira.button.delete", languageCode, "설정 삭제", createdBy);
                createTranslationIfNotExists("profile.jira.confirm.delete", languageCode, "JIRA 설정을 삭제하시겠습니까?",
                                createdBy);
                createTranslationIfNotExists("profile.jira.success.saved", languageCode, "JIRA 설정이 저장되었습니다.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.success.deleted", languageCode, "JIRA 설정이 삭제되었습니다.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.saveFailed", languageCode, "JIRA 설정 저장에 실패했습니다.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.deleteFailed", languageCode, "JIRA 설정 삭제 실패",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.network", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
                createTranslationIfNotExists("profile.jira.error.authentication", languageCode,
                                "로그인이 만료되었습니다. 다시 로그인해주세요.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.encryption", languageCode,
                                "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.",
                                createdBy);
                createTranslationIfNotExists("password.requirements.title", languageCode, "비밀번호 요구사항:", createdBy);
                createTranslationIfNotExists("password.requirements.length", languageCode, "8-100자 길이", createdBy);
                createTranslationIfNotExists("password.requirements.letter", languageCode, "영문 포함", createdBy);

                // RAG AI 생성 테스트케이스 관련 한글 번역
                createTranslationIfNotExists("rag.testcase.preview.title", languageCode, "✨ AI 생성 테스트케이스", createdBy);
                createTranslationIfNotExists("rag.testcase.addButton", languageCode, "테스트케이스 추가", createdBy);
                createTranslationIfNotExists("rag.testcase.addToProject", languageCode, "테스트케이스로 추가", createdBy);
                createTranslationIfNotExists("rag.testcase.created", languageCode, "생성 완료", createdBy);
                createTranslationIfNotExists("rag.testcase.creating", languageCode, "생성 중...", createdBy);
                createTranslationIfNotExists("rag.testcase.createSuccess", languageCode, "테스트케이스가 성공적으로 생성되었습니다!",
                                createdBy);
                createTranslationIfNotExists("rag.testcase.createError", languageCode, "테스트케이스 생성에 실패했습니다.", createdBy);
                createTranslationIfNotExists("rag.testcase.dialog.title", languageCode, "테스트케이스 추가", createdBy);

                // 태그 관련 한글 번역
                createTranslationIfNotExists("testcase.form.tags", languageCode, "태그", createdBy);
                createTranslationIfNotExists("testcase.form.tagsPlaceholder", languageCode, "태그를 입력하고 Enter를 누르세요",
                                createdBy);
                createTranslationIfNotExists("testcase.helper.tags", languageCode, "여러 태그를 입력할 수 있습니다", createdBy);

                // 우선순위 관련 한글 번역
                createTranslationIfNotExists("testcase.form.priority", languageCode, "우선순위", createdBy);
                createTranslationIfNotExists("testcase.priority.high", languageCode, "높음", createdBy);
                createTranslationIfNotExists("testcase.priority.medium", languageCode, "보통", createdBy);
                createTranslationIfNotExists("testcase.priority.low", languageCode, "낮음", createdBy);

                // 연결된 RAG 문서 관련 한글 번역
                createTranslationIfNotExists("testcase.form.linkedDocuments", languageCode, "연결된 RAG 문서", createdBy);
                createTranslationIfNotExists("testcase.form.linkedDocumentsPlaceholder", languageCode, "RAG 문서를 선택하세요",
                                createdBy);
                createTranslationIfNotExists("testcase.helper.linkedDocuments", languageCode,
                                "RAG 문서를 연결하면 AI가 참고할 수 있습니다",
                                createdBy);

                // 사후 조건 헬퍼 텍스트 한글 번역
                createTranslationIfNotExists("testcase.helper.postCondition", languageCode, "사후 조건을 입력하세요.", createdBy);

                // Markdown 지원 안내 메시지 한글 번역
                createTranslationIfNotExists("testcase.helper.markdownSupported", languageCode,
                                "Markdown 문법을 사용할 수 있습니다.",
                                createdBy);

                // JUnit 대시보드 섹션
                createTranslationIfNotExists("junit.sections.statistics", languageCode, "통계 개요", createdBy);
                createTranslationIfNotExists("junit.sections.charts", languageCode, "차트 분석", createdBy);
                createTranslationIfNotExists("junit.sections.list", languageCode, "테스트 실행 목록", createdBy);

                // JUnit 대시보드 리스트 테이블 헤더
                createTranslationIfNotExists("junit.dashboard.list.fileName", languageCode, "파일명", createdBy);
                createTranslationIfNotExists("junit.dashboard.list.testPlan", languageCode, "테스트 플랜", createdBy);
                createTranslationIfNotExists("junit.dashboard.list.executionName", languageCode, "실행 이름", createdBy);

                // JUnit 빈 상태 메시지
                createTranslationIfNotExists("junit.empty.noResults", languageCode, "테스트 결과가 없습니다", createdBy);
                createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode,
                                "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.",
                                createdBy);
                createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "첫 번째 테스트 결과 업로드", createdBy);

                // 버전 히스토리 관련 한글 번역
                createTranslationIfNotExists("testcase.versionHistory.title", languageCode, "테스트케이스 버전 히스토리",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.fetchFailed", languageCode,
                                "버전 히스토리 조회에 실패했습니다.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.fetchError", languageCode,
                                "버전 히스토리 조회 실패:", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.restoreFailed", languageCode,
                                "버전 복원에 실패했습니다.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.restoreError", languageCode, "버전 복원 실패:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.viewFailed", languageCode,
                                "버전 상세 조회에 실패했습니다.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.viewError", languageCode,
                                "버전 상세 조회 실패:", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.empty", languageCode, "버전 히스토리가 없습니다.",
                                createdBy);

                // 버전 변경 타입 라벨 한글
                createTranslationIfNotExists("testcase.versionHistory.changeType.create", languageCode, "생성",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.update", languageCode, "수정",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.manualSave", languageCode, "수동 저장",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.restore", languageCode, "복원",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.unknown", languageCode, "알 수 없음",
                                createdBy);

                // 버전 상태 및 정보 한글
                createTranslationIfNotExists("testcase.versionHistory.current", languageCode, "현재", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeSummary.empty", languageCode, "변경 내용 없음",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.creator.unknown", languageCode, "알 수 없음",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.time.unknown", languageCode, "시간 정보 없음",
                                createdBy);

                // 버전 액션 버튼 툴팁 한글
                createTranslationIfNotExists("testcase.versionHistory.action.view", languageCode, "상세 보기", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.action.restore", languageCode, "이 버전으로 복원",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.action.compare", languageCode, "다음 버전과 비교",
                                createdBy);

                // 버전 상세 다이얼로그 한글
                createTranslationIfNotExists("testcase.versionDetail.title", languageCode, "버전 상세 정보", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.basic", languageCode, "기본 정보", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.steps", languageCode, "테스트 스텝", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.version", languageCode, "버전 정보",
                                createdBy);

                // 버전 상세 필드 한글
                createTranslationIfNotExists("testcase.versionDetail.field.name", languageCode, "이름:", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.description", languageCode, "설명:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.preCondition", languageCode, "사전 조건:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.expectedResults", languageCode, "예상 결과:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.priority", languageCode, "우선순위:", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.versionNumber", languageCode, "버전 번호:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.changeType", languageCode, "변경 유형:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.changeSummary", languageCode, "변경 요약:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.creator", languageCode, "생성자:", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.createdAt", languageCode, "생성 시간:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.none", languageCode, "없음", createdBy);

                // 버전 상세 스텝 정보 한글
                createTranslationIfNotExists("testcase.versionDetail.step.number", languageCode, "단계", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.step.expectedResult", languageCode, "예상 결과:",
                                createdBy);

                // 버전 상세 버튼 한글
                // 버전 상세 버튼 한글
                createTranslationIfNotExists("testcase.versionDetail.button.close", languageCode, "닫기", createdBy);

                // 버전 인디케이터 - 상태 한글
                createTranslationIfNotExists("testcase.version.status.current", languageCode, "최신 버전", createdBy);
                createTranslationIfNotExists("testcase.version.status.outdated", languageCode, "이전 버전", createdBy);
                createTranslationIfNotExists("testcase.version.status.draft", languageCode, "임시 저장", createdBy);
                createTranslationIfNotExists("testcase.version.status.none", languageCode, "버전 없음", createdBy);

                // 버전 인디케이터 - 툴팁 한글
                createTranslationIfNotExists("testcase.version.tooltip.current", languageCode, "현재 최신 버전입니다",
                                createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.outdated", languageCode, "더 새로운 버전이 있습니다",
                                createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.draft", languageCode, "임시 저장된 버전입니다", createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.none", languageCode, "버전이 생성되지 않았습니다",
                                createdBy);

                // 버전 인디케이터 - 메뉴 한글
                createTranslationIfNotExists("testcase.version.menu.history", languageCode, "버전 히스토리", createdBy);
                createTranslationIfNotExists("testcase.version.menu.createNew", languageCode, "새 버전 생성", createdBy);
                createTranslationIfNotExists("testcase.version.menu.restore", languageCode, "이 버전으로 복원", createdBy);
                createTranslationIfNotExists("testcase.version.menu.restoreDescription", languageCode, "현재 버전으로 설정",
                                createdBy);

                // 버전 인디케이터 - 기타 한글
                createTranslationIfNotExists("testcase.version.noChanges", languageCode, "변경 내용 없음", createdBy);

                // 대량 작업 관련 한글 번역
                createTranslationIfNotExists("testcase.bulkOps.dialog.title", languageCode, "테스트케이스 일괄 작업", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.dialog.selectedCount", languageCode, "선택된 항목: {count}개",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.dialog.moreItems", languageCode, "외 {count}개",
                                createdBy);

                // 작업 유형 한글
                createTranslationIfNotExists("testcase.bulkOps.operation.label", languageCode, "작업 유형", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.update", languageCode, "속성 일괄 수정", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.copy", languageCode, "복사", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.move", languageCode, "이동", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.delete", languageCode, "삭제", createdBy);

                // 작업 설명 한글
                createTranslationIfNotExists("testcase.bulkOps.description.update", languageCode,
                                "선택된 테스트케이스들의 속성을 일괄 수정합니다.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.delete", languageCode,
                                "선택된 테스트케이스들을 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.move", languageCode,
                                "선택된 테스트케이스들을 다른 프로젝트 또는 폴더로 이동합니다.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.copy", languageCode,
                                "선택된 테스트케이스들을 다른 프로젝트 또는 폴더에 복사합니다.", createdBy);

                // 필드 라벨 한글
                createTranslationIfNotExists("testcase.bulkOps.field.priority", languageCode, "우선순위", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.type", languageCode, "유형", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.description", languageCode, "설명 (기존 내용에 추가)",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.targetProject", languageCode, "대상 프로젝트",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.targetFolder", languageCode, "대상 폴더 (선택사항)",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.rootFolder", languageCode, "루트 폴더", createdBy);

                // 옵션값 한글
                createTranslationIfNotExists("testcase.bulkOps.option.noChange", languageCode, "변경하지 않음", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.high", languageCode, "높음", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.medium", languageCode, "보통", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.low", languageCode, "낮음", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.type.testcase", languageCode, "테스트케이스", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.type.folder", languageCode, "폴더", createdBy);

                // 플레이스홀더 한글
                createTranslationIfNotExists("testcase.bulkOps.placeholder.description", languageCode,
                                "이 내용이 기존 설명에 추가됩니다...", createdBy);

                // 에러 메시지 한글
                createTranslationIfNotExists("testcase.bulkOps.error.selectOperation", languageCode,
                                "작업 유형을 선택해주세요.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.selectProject", languageCode,
                                "대상 프로젝트를 선택해주세요.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.confirmDelete", languageCode,
                                "삭제 확인을 체크해주세요.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.unknownOperation", languageCode,
                                "알 수 없는 작업 유형입니다.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.executionFailed", languageCode,
                                "작업 실행 중 오류가 발생했습니다.", createdBy);

                // 확인 메시지 한글
                createTranslationIfNotExists("testcase.bulkOps.confirm.deleteMessage", languageCode,
                                "선택된 테스트케이스들을 완전히 삭제할 것을 확인합니다.", createdBy);

                // 상태 메시지 한글
                createTranslationIfNotExists("testcase.bulkOps.status.processing", languageCode, "처리 중...", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.button.execute", languageCode, "실행", createdBy);

                // 스프레드시트 행 삽입/삭제 버튼 한글
                createTranslationIfNotExists("testcase.spreadsheet.button.insertAbove", languageCode, "위에 추가", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.insertBelow", languageCode, "아래에 추가", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.delete", languageCode, "삭제", createdBy);

                // 스프레드시트 추가 컬럼 한글
                createTranslationIfNotExists("testcase.spreadsheet.column.priority", languageCode, "우선순위", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.tags", languageCode, "태그", createdBy);

                // 입력 모드 선택 접기/펼치기 한글
                createTranslationIfNotExists("testcase.inputMode.title", languageCode, "입력 모드 선택", createdBy);
                createTranslationIfNotExists("testcase.inputMode.expand", languageCode, "펼치기", createdBy);
                createTranslationIfNotExists("testcase.inputMode.collapse", languageCode, "접기", createdBy);

                // 사용법 안내 접기/펼치기 한글
                createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "사용법", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.expand", languageCode, "펼치기", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.collapse", languageCode, "접기", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode,
                                "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode,
                                "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode,
                                "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).", createdBy);
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
