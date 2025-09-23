// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TestCaseKeysInitializer.java
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
public class TestCaseKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // TestCase 관련 키들
        createTranslationKeyIfNotExists("testcase.form.title.create", "testcase", "테스트케이스 생성 제목", "테스트케이스 생성");
        createTranslationKeyIfNotExists("testcase.form.title.edit", "testcase", "테스트케이스 수정 제목", "테스트케이스 수정");
        createTranslationKeyIfNotExists("testcase.form.folder.create", "testcase", "테스트 폴더 생성 제목", "테스트 폴더 생성");
        createTranslationKeyIfNotExists("testcase.form.folder.edit", "testcase", "테스트 폴더 수정 제목", "테스트 폴더 수정");
        createTranslationKeyIfNotExists("testcase.info.title", "testcase", "테스트케이스 정보 섹션 제목", "테스트케이스 정보");

        // Form 필드들
        createTranslationKeyIfNotExists("testcase.form.name", "testcase", "테스트케이스 이름 필드", "이름");
        createTranslationKeyIfNotExists("testcase.form.description", "testcase", "테스트케이스 설명 필드", "설명");
        createTranslationKeyIfNotExists("testcase.form.displayOrder", "testcase", "테스트케이스 순서 필드", "순서");

        // 폴더 관련 키들
        createTranslationKeyIfNotExists("testcase.folder.info.title", "testcase", "폴더 정보 제목", "폴더 정보");
        createTranslationKeyIfNotExists("testcase.folder.title.edit", "testcase", "테스트 폴더 수정 제목", "테스트 폴더 수정");
        createTranslationKeyIfNotExists("testcase.folder.title.create", "testcase", "테스트 폴더 생성 제목", "테스트 폴더 생성");

        // 버전 관련 키들
        createTranslationKeyIfNotExists("testcase.version.dialog.title", "testcase", "수동 버전 생성 다이얼로그 제목", "수동 버전 생성");
        createTranslationKeyIfNotExists("testcase.version.button.cancel", "testcase", "버전 생성 취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.version.button.creating", "testcase", "버전 생성 중 버튼", "생성 중...");

        // 플레이스홀더 및 헬퍼 텍스트
        createTranslationKeyIfNotExists("testcase.form.descriptionHelper", "testcase", "설명 헬퍼 텍스트", "설명을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.preConditionHelper", "testcase", "사전 조건 헬퍼 텍스트", "사전 조건을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.expectedResultsHelper", "testcase", "예상 결과 헬퍼 텍스트", "전체 예상 결과를 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.order", "testcase", "테스트케이스 순서 필드", "순서");
        createTranslationKeyIfNotExists("testcase.form.preCondition", "testcase", "테스트 사전 조건 필드", "사전 조건");
        createTranslationKeyIfNotExists("testcase.form.expectedResults", "testcase", "기대 결과 필드", "기대 결과");

        // Placeholder 텍스트들
        createTranslationKeyIfNotExists("testcase.form.name.placeholder", "testcase", "테스트케이스 이름 입력 안내", "테스트케이스 이름");
        createTranslationKeyIfNotExists("testcase.form.folder.name.placeholder", "testcase", "폴더 이름 입력 안내", "폴더 이름");
        createTranslationKeyIfNotExists("testcase.form.description.placeholder", "testcase", "설명 입력 안내", "설명을 입력하세요");
        createTranslationKeyIfNotExists("testcase.form.folder.description.placeholder", "testcase", "폴더 설명 입력 안내", "폴더 설명");

        // 버튼들
        createTranslationKeyIfNotExists("testcase.form.button.save", "testcase", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("testcase.form.button.saving", "testcase", "저장 중 버튼", "저장 중...");
        createTranslationKeyIfNotExists("testcase.form.button.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.form.button.close", "testcase", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("testcase.version.button.create", "testcase", "버전 생성 버튼", "버전 생성");

        // 추가 폼 필드들
        createTranslationKeyIfNotExists("testcase.form.folderName", "testcase", "폴더 이름 플레이스홀더", "폴더 이름");
        createTranslationKeyIfNotExists("testcase.form.folderDescription", "testcase", "폴더 설명 플레이스홀더", "폴더 설명");
        createTranslationKeyIfNotExists("testcase.form.testcaseName", "testcase", "테스트케이스 이름 플레이스홀더", "테스트케이스 이름");
        createTranslationKeyIfNotExists("testcase.form.testcaseDescription", "testcase", "테스트케이스 설명 플레이스홀더", "테스트케이스 설명");
        createTranslationKeyIfNotExists("testcase.form.preConditionPlaceholder", "testcase", "사전 조건 플레이스홀더", "사전 조건");
        createTranslationKeyIfNotExists("testcase.form.overallExpectedResults", "testcase", "전체 예상 결과 플레이스홀더", "전체 예상 결과");

        // 테스트 스텝 관련
        createTranslationKeyIfNotExists("testcase.form.testSteps", "testcase", "테스트 스텝 섹션 제목", "테스트 스텝");
        createTranslationKeyIfNotExists("testcase.form.stepNumber", "testcase", "스텝 번호 컬럼", "No.");
        createTranslationKeyIfNotExists("testcase.form.step", "testcase", "스텝 컬럼", "Step");
        createTranslationKeyIfNotExists("testcase.form.expected", "testcase", "예상 결과 컬럼", "Expected");
        createTranslationKeyIfNotExists("testcase.form.stepDescription", "testcase", "스텝 설명 플레이스홀더", "Step 설명");
        createTranslationKeyIfNotExists("testcase.form.expectedResult", "testcase", "예상 결과 플레이스홀더", "예상 결과");
        createTranslationKeyIfNotExists("testcase.button.addStep", "testcase", "스텝 추가 버튼", "스텝 추가");

        // 메시지들
        createTranslationKeyIfNotExists("testcase.message.addSteps", "testcase", "스텝 추가 안내 메시지", "스텝을 추가하세요.");

        // 헬퍼 텍스트들
        createTranslationKeyIfNotExists("testcase.helper.description", "testcase", "설명 헬퍼 텍스트", "설명을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.helper.preCondition", "testcase", "사전 조건 헬퍼 텍스트", "사전 조건을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.validation.expectedResultsRequired", "testcase", "예상 결과 필수 입력 메시지", "전체 예상 결과를 입력하세요.");

        // InputModeToggle 관련 키들
        createTranslationKeyIfNotExists("testcase.inputMode.title", "testcase", "입력 모드 선택 제목", "입력 모드 선택");
        createTranslationKeyIfNotExists("testcase.inputMode.form.title", "testcase", "개별 폼 모드 제목", "개별 폼");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.title", "testcase", "스프레드시트 모드 제목", "스프레드시트");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.title", "testcase", "고급 스프레드시트 모드 제목", "고급 스프레드시트");

        // 모드별 설명
        createTranslationKeyIfNotExists("testcase.inputMode.form.description", "testcase", "개별 폼 모드 설명", "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.description", "testcase", "스프레드시트 모드 설명", "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.description", "testcase", "고급 스프레드시트 모드 설명", "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.");

        // 툴팁 텍스트들
        createTranslationKeyIfNotExists("testcase.inputMode.form.tooltip", "testcase", "개별 폼 툴팁", "개별 폼으로 상세 입력 (기존 방식)");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.tooltip", "testcase", "스프레드시트 툴팁", "스프레드시트로 일괄 입력 (기본 버전)");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", "testcase", "고급 스프레드시트 툴팁", "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)");

        // 상태 메시지들
        createTranslationKeyIfNotExists("testcase.inputMode.form.status", "testcase", "폼 모드 상태", "📝 현재 {count}개의 테스트케이스가 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.form.features", "testcase", "폼 모드 기능", "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.status", "testcase", "스프레드시트 모드 상태", "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.features", "testcase", "스프레드시트 모드 기능", "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.status", "testcase", "고급 스프레드시트 모드 상태", "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.features", "testcase", "고급 스프레드시트 모드 기능", "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기");

        // 경고 메시지
        createTranslationKeyIfNotExists("testcase.inputMode.warning.modeSwitch", "testcase", "모드 전환 경고", "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.");

        // 스프레드시트 사용법 관련 키들
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.title", "testcase", "스프레드시트 사용법 제목", "사용법:");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.basicUsage", "testcase", "기본 사용법", "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.folderFunction", "testcase", "폴더 기능 설명", "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.stepManagement", "testcase", "스텝 관리 설명", "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).");

        // TestCaseDatasheetGrid 고급 기능 관련
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.title", "testcase", "고급 기능 제목", "고급 기능:");
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.lineBreak", "testcase", "줄바꿈 기능", "셀 내에서 Enter로 줄바꿈이 가능합니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.navigation", "testcase", "네비게이션 기능", "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.title", "testcase", "다중 선택 제목", "다중 선택:");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.range", "testcase", "범위 선택", "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.resize", "testcase", "크기 조정", "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.");

        // 스프레드시트 공통 버튼 및 액션
        createTranslationKeyIfNotExists("testcase.spreadsheet.header.title", "testcase", "스프레드시트 헤더 제목", "테스트케이스 스프레드시트");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.refresh", "testcase", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.addRows", "testcase", "행 추가 버튼", "행 추가");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.addFolder", "testcase", "폴더 추가 버튼", "폴더 추가");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.validate", "testcase", "검증 버튼", "검증");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.export", "testcase", "내보내기 버튼", "Export");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.save", "testcase", "저장 버튼", "일괄 저장");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.saving", "testcase", "저장 중", "저장 중...");

        // 스프레드시트 상태 정보
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.rows", "testcase", "행 개수", "{count}개 행");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.steps", "testcase", "스텝 개수", "{count}개 스텝");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.changed", "testcase", "변경됨 상태", "변경됨");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.lineBreakSupport", "testcase", "줄바꿈 지원", "줄바꿈 지원");

        // 스텝 관리 메뉴
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.addStep", "testcase", "스텝 추가 메뉴", "스텝 추가 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.removeStep", "testcase", "스텝 제거 메뉴", "스텝 제거 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.settings", "testcase", "스텝 설정 메뉴", "스텝 수 직접 설정...");

        // 스텝 설정 다이얼로그
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.title", "testcase", "스텝 설정 제목", "스텝 수 설정");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.description", "testcase", "스텝 설정 설명", "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.label", "testcase", "스텝 수 입력", "스텝 수");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.helper", "testcase", "스텝 범위 안내", "1개부터 10개까지 설정 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.apply", "testcase", "적용 버튼", "적용");

        // 폴더 생성 다이얼로그
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.title", "testcase", "폴더 생성 제목", "새 폴더 생성");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.description", "testcase", "폴더 생성 설명", "새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.label", "testcase", "폴더명 입력", "폴더명");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.placeholder", "testcase", "폴더명 플레이스홀더", "예: API 테스트, UI 테스트");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.create", "testcase", "생성 버튼", "생성");

        // Export 메뉴
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.title", "testcase", "CSV 내보내기 제목", "CSV로 내보내기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.description", "testcase", "CSV 내보내기 설명", "스프레드시트 호환 형식");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.title", "testcase", "Excel 내보내기 제목", "Excel로 내보내기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.description", "testcase", "Excel 내보내기 설명", "Microsoft Excel 형식 (.xlsx)");

        // 검증 시스템 관련
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.title", "testcase", "검증 결과 제목", "데이터 검증 결과");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.titleSuccess", "testcase", "검증 성공 제목", "데이터 검증 완료");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.summary", "testcase", "검증 요약", "📊 검증 요약");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.errors", "testcase", "해결 필요 오류", "해결이 필요한 오류 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warnings", "testcase", "권장 사항", "권장 사항 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.close", "testcase", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.gotoError", "testcase", "오류 위치 이동", "오류 위치로 이동");

        // 알림 메시지
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.refreshed", "testcase", "새로고침 완료", "최신 데이터로 새로고침되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.saved", "testcase", "저장 완료", "저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.folderAdded", "testcase", "폴더 추가됨", "폴더 \"{name}\"이 추가되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.stepChanged", "testcase", "스텝 변경됨", "스텝 수가 {count}개로 변경되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.exportComplete", "testcase", "내보내기 완료", "{type} 파일이 다운로드되었습니다: {filename}");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.unsavedChanges", "testcase", "저장되지 않은 변경사항", "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.");

        // 하단 정보 텍스트
        createTranslationKeyIfNotExists("testcase.spreadsheet.footer.stepInfo", "testcase", "스텝 정보", "현재 {maxSteps}개 스텝으로 설정되어 있습니다. 최대 10개 스텝까지 확장 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.footer.advancedInfo", "testcase", "고급 스프레드시트 정보", "react-datasheet-grid 기반 고급 스프레드시트 • {maxSteps}개 스텝 • 줄바꿈 및 고급 편집 지원");

        // 고급 스프레드시트 전용
        createTranslationKeyIfNotExists("testcase.advancedGrid.title", "testcase", "고급 스프레드시트 제목", "고급 스프레드시트 (react-datasheet-grid)");
        createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.title", "testcase", "로드 오류 제목", "DataSheetGrid 로드 실패");
        createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.description", "testcase", "로드 오류 설명", "react-datasheet-grid 라이브러리에 오류가 있습니다. 기본 테이블로 표시합니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.header", "testcase", "폴백 테이블 헤더", "스프레드시트 로딩 오류");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.message", "testcase", "폴백 테이블 메시지", "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.retry", "testcase", "다시 시도 버튼", "다시 시도");

        // 플레이스홀더 텍스트
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.multiline", "testcase", "다중 줄 플레이스홀더", "여러 줄 입력 가능...");
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.text", "testcase", "텍스트 플레이스홀더", "텍스트 입력...");
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.cellInput", "testcase", "셀 입력 플레이스홀더", "{title} 입력...");

        // 버전 관련
        createTranslationKeyIfNotExists("testcase.version.create", "testcase", "버전 생성 버튼", "버전 생성");
        createTranslationKeyIfNotExists("testcase.version.creating", "testcase", "버전 생성 중", "생성 중...");
        createTranslationKeyIfNotExists("testcase.version.label", "testcase", "버전 라벨 필드", "버전 라벨");
        createTranslationKeyIfNotExists("testcase.version.description", "testcase", "버전 설명 필드", "버전 설명");
        createTranslationKeyIfNotExists("testcase.version.defaultDescription", "testcase", "기본 버전 설명", "수동 버전 생성");
        createTranslationKeyIfNotExists("testcase.version.helper", "testcase", "버전 생성 도움말", "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.");

        // 테스트 스텝 관련
        createTranslationKeyIfNotExists("testcase.steps.title", "testcase", "테스트 스텝 섹션 제목", "테스트 스텝");
        createTranslationKeyIfNotExists("testcase.steps.add", "testcase", "스텝 추가 버튼", "스텝 추가");
        createTranslationKeyIfNotExists("testcase.steps.number", "testcase", "스텝 번호", "번호");
        createTranslationKeyIfNotExists("testcase.steps.action", "testcase", "스텝 액션", "액션");
        createTranslationKeyIfNotExists("testcase.steps.expected", "testcase", "예상 결과", "예상 결과");
        createTranslationKeyIfNotExists("testcase.steps.delete", "testcase", "스텝 삭제", "삭제");

        // Tree 관련
        createTranslationKeyIfNotExists("testcase.tree.add", "testcase", "테스트케이스 추가", "추가");
        createTranslationKeyIfNotExists("testcase.tree.edit", "testcase", "테스트케이스 편집", "편집");
        createTranslationKeyIfNotExists("testcase.tree.delete", "testcase", "테스트케이스 삭제", "삭제");
        createTranslationKeyIfNotExists("testcase.tree.moveUp", "testcase", "위로 이동", "위로 이동");
        createTranslationKeyIfNotExists("testcase.tree.moveDown", "testcase", "아래로 이동", "아래로 이동");
        createTranslationKeyIfNotExists("testcase.tree.refresh", "testcase", "새로고침", "새로고침");
        createTranslationKeyIfNotExists("testcase.tree.history", "testcase", "버전 히스토리", "히스토리");

        // 삭제 확인 다이얼로그
        createTranslationKeyIfNotExists("testcase.delete.confirm.title", "testcase", "삭제 확인 제목", "삭제 확인");
        createTranslationKeyIfNotExists("testcase.delete.confirm.message", "testcase", "삭제 확인 메시지", "정말로 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("testcase.delete.confirm.yes", "testcase", "삭제 확인", "삭제");
        createTranslationKeyIfNotExists("testcase.delete.confirm.no", "testcase", "삭제 취소", "취소");

        // 상태 메시지들
        createTranslationKeyIfNotExists("testcase.message.saveSuccess", "testcase", "저장 성공 메시지", "테스트케이스가 성공적으로 저장되었습니다.");
        createTranslationKeyIfNotExists("testcase.message.saveFailed", "testcase", "저장 실패 메시지", "테스트케이스 저장에 실패했습니다.");
        createTranslationKeyIfNotExists("testcase.message.deleteSuccess", "testcase", "삭제 성공 메시지", "테스트케이스가 성공적으로 삭제되었습니다.");
        createTranslationKeyIfNotExists("testcase.message.deleteFailed", "testcase", "삭제 실패 메시지", "테스트케이스 삭제에 실패했습니다.");

        // 유효성 검사 메시지들
        createTranslationKeyIfNotExists("testcase.validation.nameRequired", "testcase", "이름 필수 검증", "이름은 필수 입력 항목입니다.");
        createTranslationKeyIfNotExists("testcase.validation.nameLength", "testcase", "이름 길이 검증", "이름은 1자 이상 100자 이하로 입력해주세요.");
        createTranslationKeyIfNotExists("testcase.validation.descriptionLength", "testcase", "설명 길이 검증", "설명은 500자 이하로 입력해주세요.");

        // 권한 관련 메시지들
        createTranslationKeyIfNotExists("testcase.permission.readOnly", "testcase", "읽기 전용 메시지", "읽기 전용 권한입니다.");
        createTranslationKeyIfNotExists("testcase.permission.noEdit", "testcase", "편집 불가 메시지", "편집 권한이 없습니다.");
        createTranslationKeyIfNotExists("testcase.permission.noDelete", "testcase", "삭제 불가 메시지", "삭제 권한이 없습니다.");
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
