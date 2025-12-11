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
                createTranslationKeyIfNotExists("testcase.folder.title.create", "testcase", "테스트 폴더 생성 제목",
                                "테스트 폴더 생성");

                // 버전 관련 키들
                createTranslationKeyIfNotExists("testcase.version.dialog.title", "testcase", "수동 버전 생성 다이얼로그 제목",
                                "수동 버전 생성");
                createTranslationKeyIfNotExists("testcase.version.button.cancel", "testcase", "버전 생성 취소 버튼", "취소");
                createTranslationKeyIfNotExists("testcase.version.button.creating", "testcase", "버전 생성 중 버튼",
                                "생성 중...");

                // 플레이스홀더 및 헬퍼 텍스트
                createTranslationKeyIfNotExists("testcase.form.descriptionHelper", "testcase", "설명 헬퍼 텍스트",
                                "설명을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.form.preConditionHelper", "testcase", "사전 조건 헬퍼 텍스트",
                                "사전 조건을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.form.expectedResultsHelper", "testcase", "예상 결과 헬퍼 텍스트",
                                "전체 예상 결과를 입력하세요.");

                // 헬퍼 텍스트 추가 (플레이스홀더)
                createTranslationKeyIfNotExists("testcase.helper.enterContent", "testcase", "내용 입력 플레이스홀더",
                                "내용을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.helper.markdownSupported", "testcase", "마크다운 지원 헬퍼",
                                "Markdown 문법을 사용할 수 있습니다.");

                // 섹션 제목
                createTranslationKeyIfNotExists("testcase.sections.basicInfo", "testcase", "기본 정보 섹션", "기본 정보");
                createTranslationKeyIfNotExists("testcase.sections.steps", "testcase", "테스트 단계 섹션", "테스트 단계");
                createTranslationKeyIfNotExists("testcase.sections.expectedResults", "testcase", "기대 결과 섹션", "기대 결과");
                createTranslationKeyIfNotExists("testcase.sections.attachments", "testcase", "첨부 파일 섹션", "첨부 파일");

                createTranslationKeyIfNotExists("testcase.form.order", "testcase", "테스트케이스 순서 필드", "순서");
                createTranslationKeyIfNotExists("testcase.form.preCondition", "testcase", "테스트 사전 조건 필드", "사전 조건");
                createTranslationKeyIfNotExists("testcase.form.postCondition", "testcase", "테스트 사후 조건 필드", "사후 조건");
                createTranslationKeyIfNotExists("testcase.form.expectedResults", "testcase", "기대 결과 필드", "기대 결과");
                createTranslationKeyIfNotExists("testcase.form.isAutomated", "testcase", "자동화 여부 필드", "자동화 여부");
                createTranslationKeyIfNotExists("testcase.form.executionType", "testcase", "수행 유형 필드",
                                "Manual/Automation");
                createTranslationKeyIfNotExists("testcase.form.testTechnique", "testcase", "테스트 기법 필드", "테스트 기법");

                // Placeholder 텍스트들
                createTranslationKeyIfNotExists("testcase.form.name.placeholder", "testcase", "테스트케이스 이름 입력 안내",
                                "테스트케이스 이름");
                createTranslationKeyIfNotExists("testcase.form.folder.name.placeholder", "testcase", "폴더 이름 입력 안내",
                                "폴더 이름");
                createTranslationKeyIfNotExists("testcase.form.description.placeholder", "testcase", "설명 입력 안내",
                                "설명을 입력하세요");
                createTranslationKeyIfNotExists("testcase.form.folder.description.placeholder", "testcase",
                                "폴더 설명 입력 안내",
                                "폴더 설명");
                createTranslationKeyIfNotExists("testcase.form.postConditionPlaceholder", "testcase", "사후 조건 입력 안내",
                                "사후 조건");
                createTranslationKeyIfNotExists("testcase.form.testTechniquePlaceholder", "testcase", "테스트 기법 입력 안내",
                                "예: 경계값 분석, 의사결정 테이블");
                createTranslationKeyIfNotExists("testcase.executionType.manual", "testcase", "테스트 수행 유형 수동", "Manual");
                createTranslationKeyIfNotExists("testcase.executionType.automation", "testcase", "테스트 수행 유형 자동화",
                                "Automation");
                createTranslationKeyIfNotExists("testcase.executionType.hybrid", "testcase", "테스트 수행 유형 하이브리드",
                                "Hybrid");

                // 버튼들
                createTranslationKeyIfNotExists("testcase.form.button.save", "testcase", "저장 버튼", "저장");
                createTranslationKeyIfNotExists("testcase.form.button.saving", "testcase", "저장 중 버튼", "저장 중...");
                createTranslationKeyIfNotExists("testcase.form.button.cancel", "testcase", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("testcase.form.button.close", "testcase", "닫기 버튼", "닫기");
                createTranslationKeyIfNotExists("testcase.form.button.create", "testcase", "버전 생성 버튼", "버전 생성");
                createTranslationKeyIfNotExists("testcase.form.button.add", "testcase", "추가 버튼", "새 케이스 추가");

                // 추가 폼 필드들
                createTranslationKeyIfNotExists("testcase.form.folderName", "testcase", "폴더 이름 플레이스홀더", "폴더 이름");
                createTranslationKeyIfNotExists("testcase.form.folderDescription", "testcase", "폴더 설명 플레이스홀더", "폴더 설명");
                createTranslationKeyIfNotExists("testcase.form.testcaseName", "testcase", "테스트케이스 이름 플레이스홀더",
                                "테스트케이스 이름");
                createTranslationKeyIfNotExists("testcase.form.testcaseDescription", "testcase", "테스트케이스 설명 플레이스홀더",
                                "테스트케이스 설명");
                createTranslationKeyIfNotExists("testcase.form.preConditionPlaceholder", "testcase", "사전 조건 플레이스홀더",
                                "사전 조건");
                createTranslationKeyIfNotExists("testcase.form.overallExpectedResults", "testcase", "전체 예상 결과 플레이스홀더",
                                "전체 예상 결과");

                // 테스트 스텝 관련
                createTranslationKeyIfNotExists("testcase.form.testSteps", "testcase", "테스트 스텝 필드", "테스트 스텝");
                createTranslationKeyIfNotExists("testcase.form.stepNumber", "testcase", "스텝 번호", "No.");
                createTranslationKeyIfNotExists("testcase.form.step", "testcase", "스텝", "Step");
                createTranslationKeyIfNotExists("testcase.form.expected", "testcase", "예상 결과", "Expected");
                createTranslationKeyIfNotExists("testcase.form.reorder", "testcase", "순서 변경", "순서");
                createTranslationKeyIfNotExists("testcase.form.stepDescription", "testcase", "스텝 설명 플레이스홀더", "Step 설명");
                createTranslationKeyIfNotExists("testcase.form.expectedResult", "testcase", "예상 결과 플레이스홀더", "예상 결과");
                createTranslationKeyIfNotExists("testcase.button.addStep", "testcase", "스텝 추가 버튼", "스텝 추가");

                // 메시지들
                createTranslationKeyIfNotExists("testcase.message.addSteps", "testcase", "스텝 추가 안내 메시지", "스텝을 추가하세요.");

                // 헬퍼 텍스트들
                createTranslationKeyIfNotExists("testcase.helper.description", "testcase", "설명 헬퍼 텍스트", "설명을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.helper.preCondition", "testcase", "사전 조건 헬퍼 텍스트",
                                "사전 조건을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.validation.expectedResultsRequired", "testcase",
                                "예상 결과 필수 입력 메시지",
                                "전체 예상 결과를 입력하세요.");

                createTranslationKeyIfNotExists("testcase.form.continueAdding", "testcase", "계속 추가 체크박스", "계속 추가");

                // InputModeToggle 관련 키들
                createTranslationKeyIfNotExists("testcase.inputMode.title", "testcase", "입력 모드 선택 제목", "입력 모드 선택");
                createTranslationKeyIfNotExists("testcase.inputMode.form.title", "testcase", "개별 폼 모드 제목", "개별 폼");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.title", "testcase", "스프레드시트 모드 제목",
                                "스프레드시트");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.title", "testcase",
                                "고급 스프레드시트 모드 제목",
                                "고급 스프레드시트");

                // 모드별 설명
                createTranslationKeyIfNotExists("testcase.inputMode.form.description", "testcase", "개별 폼 모드 설명",
                                "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.description", "testcase",
                                "스프레드시트 모드 설명",
                                "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.description", "testcase",
                                "고급 스프레드시트 모드 설명", "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.");

                // 툴팁 텍스트들
                createTranslationKeyIfNotExists("testcase.inputMode.form.tooltip", "testcase", "개별 폼 툴팁",
                                "개별 폼으로 상세 입력 (기존 방식)");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.tooltip", "testcase", "스프레드시트 툴팁",
                                "스프레드시트로 일괄 입력 (기본 버전)");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", "testcase",
                                "고급 스프레드시트 툴팁",
                                "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)");
                createTranslationKeyIfNotExists("testcase.inputMode.form.ariaLabel", "testcase", "개별 폼 ARIA 라벨",
                                "개별 폼 모드");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.ariaLabel", "testcase",
                                "스프레드시트 ARIA 라벨", "스프레드시트 모드");

                // 상태 메시지들
                createTranslationKeyIfNotExists("testcase.inputMode.form.status", "testcase", "폼 모드 상태",
                                "📝 현재 {count}개의 테스트케이스가 있습니다.");
                createTranslationKeyIfNotExists("testcase.inputMode.form.features", "testcase", "폼 모드 기능",
                                "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.status", "testcase", "스프레드시트 모드 상태",
                                "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)");
                createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.features", "testcase", "스프레드시트 모드 기능",
                                "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.status", "testcase",
                                "고급 스프레드시트 모드 상태",
                                "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.features", "testcase",
                                "고급 스프레드시트 모드 기능", "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기");

                // 경고 메시지
                createTranslationKeyIfNotExists("testcase.inputMode.warning.modeSwitch", "testcase", "모드 전환 경고",
                                "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.");

                // 스프레드시트 사용법 관련 키들
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.title", "testcase", "스프레드시트 사용법 제목",
                                "사용법:");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.basicUsage", "testcase", "기본 사용법",
                                "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.folderFunction", "testcase", "폴더 기능 설명",
                                "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.stepManagement", "testcase", "스텝 관리 설명",
                                "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).");

                // TestCaseDatasheetGrid 고급 기능 관련
                createTranslationKeyIfNotExists("testcase.advancedGrid.features.title", "testcase", "고급 기능 제목",
                                "고급 기능:");
                createTranslationKeyIfNotExists("testcase.advancedGrid.features.lineBreak", "testcase", "줄바꿈 기능",
                                "셀 내에서 Enter로 줄바꿈이 가능합니다.");
                createTranslationKeyIfNotExists("testcase.advancedGrid.features.navigation", "testcase", "네비게이션 기능",
                                "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.");
                createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.title", "testcase", "다중 선택 제목",
                                "다중 선택:");
                createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.range", "testcase", "범위 선택",
                                "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.");
                createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.resize", "testcase", "크기 조정",
                                "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.");

                // 스프레드시트 공통 버튼 및 액션
                createTranslationKeyIfNotExists("testcase.spreadsheet.header.title", "testcase", "스프레드시트 헤더 제목",
                                "테스트케이스 스프레드시트");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.refresh", "testcase", "새로고침 버튼", "새로고침");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.addRows", "testcase", "행 추가 버튼", "행 추가");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.addFolder", "testcase", "폴더 추가 버튼",
                                "폴더 추가");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.validate", "testcase", "검증 버튼", "검증");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.export", "testcase", "내보내기 버튼", "Export");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.save", "testcase", "저장 버튼", "일괄 저장");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.saving", "testcase", "저장 중", "저장 중...");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.stepManagement", "testcase", "스텝 관리 버튼",
                                "스텝 관리");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.fullscreen", "testcase", "전체화면 버튼",
                                "전체화면");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.exitFullscreen", "testcase", "전체화면 종료 버튼",
                                "전체화면 종료");

                // 스프레드시트 컬럼 헤더
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.createdBy", "testcase", "작성자 컬럼", "작성자");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.updatedBy", "testcase", "수정자 컬럼", "수정자");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.order", "testcase", "순서 컬럼", "순서");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.type", "testcase", "타입 컬럼", "타입");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.parentFolder", "testcase", "상위폴더 컬럼",
                                "상위폴더");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.name", "testcase", "이름 컬럼", "이름");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.description", "testcase", "설명 컬럼", "설명");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.preCondition", "testcase", "사전조건 컬럼",
                                "사전조건");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.postCondition", "testcase", "사후조건 컬럼",
                                "사후조건");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.expectedResults", "testcase", "예상결과 컬럼",
                                "예상결과");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.isAutomated", "testcase", "자동화 여부 컬럼",
                                "자동화여부");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.executionType", "testcase", "수행 유형 컬럼",
                                "Manual/Automation");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.testTechnique", "testcase", "테스트 기법 컬럼",
                                "테스트기법");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.step", "testcase", "스텝 컬럼",
                                "Step {number}");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.expected", "testcase", "예상 컬럼",
                                "Expected {number}");

                // 테스트케이스 타입
                createTranslationKeyIfNotExists("testcase.type.folder", "testcase", "폴더 타입", "폴더");
                createTranslationKeyIfNotExists("testcase.type.testcase", "testcase", "테스트케이스 타입", "테스트케이스");

                // 스프레드시트 상태 정보
                createTranslationKeyIfNotExists("testcase.spreadsheet.status.rows", "testcase", "행 개수", "{count}개 행");
                createTranslationKeyIfNotExists("testcase.spreadsheet.status.steps", "testcase", "스텝 개수",
                                "{count}개 스텝");
                createTranslationKeyIfNotExists("testcase.spreadsheet.status.changed", "testcase", "변경됨 상태", "변경됨");
                createTranslationKeyIfNotExists("testcase.spreadsheet.status.lineBreakSupport", "testcase", "줄바꿈 지원",
                                "줄바꿈 지원");

                // 스텝 관리 메뉴
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.addStep", "testcase", "스텝 추가 메뉴",
                                "스텝 추가 ({count}개)");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.removeStep", "testcase", "스텝 제거 메뉴",
                                "스텝 제거 ({count}개)");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.settings", "testcase", "스텝 설정 메뉴",
                                "스텝 수 직접 설정...");

                // 스텝 설정 다이얼로그
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.title", "testcase", "스텝 설정 제목",
                                "스텝 수 설정");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.description", "testcase", "스텝 설정 설명",
                                "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.label", "testcase", "스텝 수 입력", "스텝 수");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.helper", "testcase", "스텝 범위 안내",
                                "1개부터 10개까지 설정 가능합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.cancel", "testcase", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.apply", "testcase", "적용 버튼", "적용");

                // 폴더 생성 다이얼로그
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.title", "testcase", "폴더 생성 제목",
                                "새 폴더 생성");
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.description", "testcase", "폴더 생성 설명",
                                "새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.label", "testcase", "폴더명 입력", "폴더명");
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.placeholder", "testcase",
                                "폴더명 플레이스홀더",
                                "예: API 테스트, UI 테스트");
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.cancel", "testcase", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.create", "testcase", "생성 버튼", "생성");

                // Export 메뉴
                createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.title", "testcase", "CSV 내보내기 제목",
                                "CSV로 내보내기");
                createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.description", "testcase",
                                "CSV 내보내기 설명",
                                "스프레드시트 호환 형식");
                createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.title", "testcase", "Excel 내보내기 제목",
                                "Excel로 내보내기");
                createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.description", "testcase",
                                "Excel 내보내기 설명",
                                "Microsoft Excel 형식 (.xlsx)");

                // 검증 시스템 관련
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.title", "testcase", "검증 결과 제목",
                                "데이터 검증 결과");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.titleSuccess", "testcase", "검증 성공 제목",
                                "데이터 검증 완료");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.summary", "testcase", "검증 요약",
                                "검증 요약");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.errors", "testcase", "해결 필요 오류",
                                "해결이 필요한 오류 ({count}개)");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warnings", "testcase", "권장 사항",
                                "권장 사항 ({count}개)");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.close", "testcase", "닫기 버튼", "닫기");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.gotoError", "testcase", "오류 위치 이동",
                                "오류 위치로 이동");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.rows", "testcase", "행 개수",
                                "{count}개 행");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.folders", "testcase", "폴더 개수",
                                "{count}개 폴더");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.testcases", "testcase", "테스트케이스 개수",
                                "{count}개 테스트케이스");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.errorCount", "testcase", "오류 개수",
                                "{count}개 오류");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warningCount", "testcase", "경고 개수",
                                "{count}개 경고");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.column", "testcase", "컬럼", "컬럼");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.row", "testcase", "행", "행");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.solution", "testcase", "해결 방법",
                                "💡 해결 방법:");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.improvement", "testcase", "개선 방법",
                                "💡 개선 방법:");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.successMessage", "testcase",
                                "검증 성공 메시지",
                                "모든 데이터가 유효합니다! 저장할 준비가 완료되었습니다.");

                // 검증 오류/경고 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.error.nameRequired", "testcase",
                                "이름 필수 오류", "{row}번 행: 이름은 필수 입력 항목입니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.error.duplicateFolder", "testcase",
                                "폴더명 중복 오류", "{row}번 행: 폴더명 \"{name}\"이 중복됩니다. 폴더명은 고유해야 합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.error.duplicateTestCase", "testcase",
                                "테스트케이스명 중복 오류",
                                "{row}번 행: 테스트케이스명 \"{name}\"이 같은 폴더에서 중복됩니다. 같은 폴더 내에서 테스트케이스명은 고유해야 합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.error.circularReference", "testcase",
                                "순환 참조 오류", "{row}번 행: \"{name}\"이 자기 자신을 상위폴더로 지정했습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.error.missingParentFolder", "testcase",
                                "상위폴더 없음 오류", "{row}번 행: 상위폴더 \"{parent}\"을 찾을 수 없습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warning.invalidType", "testcase",
                                "잘못된 타입 경고", "{row}번 행: 타입 \"{type}\"이 표준 형식이 아닙니다. '폴더' 또는 '테스트케이스'를 사용하세요.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warning.invalidParentType", "testcase",
                                "상위폴더 타입 오류", "{row}번 행: \"{parent}\"은 폴더가 아닙니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warning.missingExpectedResult",
                                "testcase", "예상 결과 누락 경고", "{row}번 행: Step {step}의 예상 결과가 비어있습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warning.noSteps", "testcase",
                                "스텝 없음 경고", "{row}번 행: 테스트케이스에 실행 단계가 정의되지 않았습니다.");

                // 검증 제안 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.suggestion.changeParent", "testcase",
                                "상위폴더 변경 제안", "다른 폴더를 상위폴더로 지정하거나 상위폴더 필드를 비워두세요.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.suggestion.createParentFolder",
                                "testcase", "상위폴더 생성 제안", "\"{parent}\" 폴더를 먼저 생성하거나 올바른 폴더명/ID를 입력하세요.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.suggestion.addExpectedResult",
                                "testcase", "예상 결과 추가 제안", "각 스텝에 대한 예상 결과를 입력하면 테스트의 명확성이 향상됩니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.suggestion.addSteps", "testcase",
                                "스텝 추가 제안", "최소 하나 이상의 테스트 단계를 추가하세요.");

                // 검증 컬럼명
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.name", "testcase", "이름 컬럼",
                                "이름");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.type", "testcase", "타입 컬럼",
                                "타입");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.parentFolder", "testcase",
                                "상위폴더 컬럼", "상위폴더");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.step", "testcase", "스텝 컬럼",
                                "Step {number}");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.expected", "testcase",
                                "예상 결과 컬럼", "Expected {number}");
                createTranslationKeyIfNotExists("testcase.spreadsheet.validation.columnName.all", "testcase", "전체 컬럼",
                                "전체");

                // 알림 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.refreshed", "testcase", "새로고침 완료",
                                "최신 데이터로 새로고침되었습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.saved", "testcase", "저장 완료",
                                "저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개");
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.folderAdded", "testcase", "폴더 추가됨",
                                "폴더 \"{name}\"이 추가되었습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.stepChanged", "testcase", "스텝 변경됨",
                                "스텝 수가 {count}개로 변경되었습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.exportComplete", "testcase",
                                "내보내기 완료",
                                "{type} 파일이 다운로드되었습니다: {filename}");
                createTranslationKeyIfNotExists("testcase.spreadsheet.notification.unsavedChanges", "testcase",
                                "저장되지 않은 변경사항",
                                "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.");

                // 하단 정보 텍스트
                createTranslationKeyIfNotExists("testcase.spreadsheet.footer.stepInfo", "testcase", "스텝 정보",
                                "현재 {maxSteps}개 스텝으로 설정되어 있습니다. 최대 10개 스텝까지 확장 가능합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.footer.advancedInfo", "testcase", "고급 스프레드시트 정보",
                                "react-datasheet-grid 기반 고급 스프레드시트 • {maxSteps}개 스텝 • 줄바꿈 및 고급 편집 지원");

                // 고급 스프레드시트 전용
                createTranslationKeyIfNotExists("testcase.advancedGrid.title", "testcase", "고급 스프레드시트 제목",
                                "고급 스프레드시트 (react-datasheet-grid)");
                createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.title", "testcase", "로드 오류 제목",
                                "DataSheetGrid 로드 실패");
                createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.description", "testcase", "로드 오류 설명",
                                "react-datasheet-grid 라이브러리에 오류가 있습니다. 기본 테이블로 표시합니다.");
                createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.header", "testcase", "폴백 테이블 헤더",
                                "스프레드시트 로딩 오류");
                createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.message", "testcase", "폴백 테이블 메시지",
                                "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.");
                createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.retry", "testcase", "다시 시도 버튼",
                                "다시 시도");

                // 플레이스홀더 텍스트
                createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.multiline", "testcase", "다중 줄 플레이스홀더",
                                "여러 줄 입력 가능...");
                createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.text", "testcase", "텍스트 플레이스홀더",
                                "텍스트 입력...");
                createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.cellInput", "testcase", "셀 입력 플레이스홀더",
                                "{title} 입력...");
                createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.columnInput", "testcase",
                                "컬럼 입력 플레이스홀더",
                                "{title} 입력...");

                // Fallback 모드
                createTranslationKeyIfNotExists("testcase.spreadsheet.fallback.title", "testcase", "향상된 스프레드시트 모드 제목",
                                "향상된 스프레드시트 모드");
                createTranslationKeyIfNotExists("testcase.spreadsheet.fallback.description", "testcase",
                                "향상된 스프레드시트 모드 설명",
                                "모든 기능이 정상적으로 작동합니다. 셀 편집, 복사/붙여넣기, 일괄 저장을 지원합니다.");

                // 에러 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.error.title", "testcase", "스프레드시트 로딩 오류 제목",
                                "스프레드시트 로딩 오류");
                createTranslationKeyIfNotExists("testcase.spreadsheet.error.description", "testcase", "스프레드시트 로딩 오류 설명",
                                "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.retry", "testcase", "다시 시도 버튼", "다시 시도");

                // 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.saveSuccess", "testcase", "저장 성공 메시지",
                                "{count}개의 테스트케이스가 저장되었습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.saveError", "testcase", "저장 오류 메시지",
                                "저장 중 오류가 발생했습니다: {error}");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.refreshSuccess", "testcase",
                                "새로고침 성공 메시지",
                                "최신 데이터로 새로고침되었습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.refreshError", "testcase", "새로고침 오류 메시지",
                                "새로고침 중 오류가 발생했습니다: {error}");

                // ICT-373: 배치 저장 관련 메시지
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.noChanges", "testcase", "변경 없음 메시지",
                                "변경된 항목이 없습니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.batchSaveSuccess", "testcase",
                                "배치 저장 성공 메시지",
                                "✅ 배치 저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.batchSavePartialFailure", "testcase",
                                "배치 저장 부분 실패 메시지", "⚠️ 배치 저장 부분 실패:\n✅ 성공: {successCount}개\n❌ 실패: {failureCount}개\n\n");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.failureDetails", "testcase", "실패 내역 제목",
                                "실패 내역:\n");
                createTranslationKeyIfNotExists("testcase.spreadsheet.message.moreErrors", "testcase", "추가 오류 메시지",
                                "... 외 {count}개 오류\n");

                // 푸터 정보
                createTranslationKeyIfNotExists("testcase.spreadsheet.footer.info", "testcase", "스프레드시트 푸터 정보",
                                "* react-datasheet-grid 기반 고급 스프레드시트 • {count}개 스텝 • 줄바꿈 및 고급 편집 지원");
                createTranslationKeyIfNotExists("testcase.spreadsheet.footer.warning", "testcase", "저장 경고",
                                "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.");

                // InputModeToggle - 고급 스프레드시트 모드
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.title", "testcase",
                                "고급 스프레드시트 제목",
                                "고급 스프레드시트");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.description", "testcase",
                                "고급 스프레드시트 설명", "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", "testcase",
                                "고급 스프레드시트 툴팁",
                                "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", "testcase",
                                "고급 스프레드시트 ARIA 라벨", "고급 스프레드시트 모드");
                createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.status", "testcase",
                                "고급 스프레드시트 상태",
                                "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.");

                // 버전 관련
                createTranslationKeyIfNotExists("testcase.version.create", "testcase", "버전 생성 버튼", "버전 생성");
                createTranslationKeyIfNotExists("testcase.version.creating", "testcase", "버전 생성 중", "생성 중...");
                createTranslationKeyIfNotExists("testcase.version.label", "testcase", "버전 라벨 필드", "버전 라벨");
                createTranslationKeyIfNotExists("testcase.version.description", "testcase", "버전 설명 필드", "버전 설명");
                createTranslationKeyIfNotExists("testcase.version.defaultDescription", "testcase", "기본 버전 설명",
                                "수동 버전 생성");
                createTranslationKeyIfNotExists("testcase.version.helper", "testcase", "버전 생성 도움말",
                                "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.");
                createTranslationKeyIfNotExists("testcase.version.form.label", "testcase", "버전 라벨 폼 필드", "버전 라벨");
                createTranslationKeyIfNotExists("testcase.version.form.description", "testcase", "버전 설명 폼 필드", "버전 설명");

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
                createTranslationKeyIfNotExists("testcase.tree.ragVectorized", "testcase", "RAG 벡터화 상태 표시", "RAG 벡터화됨");

                // 삭제 확인 다이얼로그
                createTranslationKeyIfNotExists("testcase.delete.confirm.title", "testcase", "삭제 확인 제목", "삭제 확인");
                createTranslationKeyIfNotExists("testcase.delete.confirm.message", "testcase", "삭제 확인 메시지",
                                "정말로 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("testcase.delete.confirm.yes", "testcase", "삭제 확인", "삭제");
                createTranslationKeyIfNotExists("testcase.delete.confirm.no", "testcase", "삭제 취소", "취소");

                // 상태 메시지들
                createTranslationKeyIfNotExists("testcase.message.saveSuccess", "testcase", "저장 성공 메시지",
                                "테스트케이스가 성공적으로 저장되었습니다.");
                createTranslationKeyIfNotExists("testcase.message.saveFailed", "testcase", "저장 실패 메시지",
                                "테스트케이스 저장에 실패했습니다.");
                createTranslationKeyIfNotExists("testcase.message.deleteSuccess", "testcase", "삭제 성공 메시지",
                                "테스트케이스가 성공적으로 삭제되었습니다.");
                createTranslationKeyIfNotExists("testcase.message.deleteFailed", "testcase", "삭제 실패 메시지",
                                "테스트케이스 삭제에 실패했습니다.");

                // 유효성 검사 메시지들
                createTranslationKeyIfNotExists("testcase.validation.nameRequired", "testcase", "이름 필수 검증",
                                "이름은 필수 입력 항목입니다.");
                createTranslationKeyIfNotExists("testcase.validation.nameLength", "testcase", "이름 길이 검증",
                                "이름은 1자 이상 100자 이하로 입력해주세요.");
                createTranslationKeyIfNotExists("testcase.validation.descriptionLength", "testcase", "설명 길이 검증",
                                "설명은 500자 이하로 입력해주세요.");

                // 권한 관련 메시지들
                createTranslationKeyIfNotExists("testcase.permission.readOnly", "testcase", "읽기 전용 메시지",
                                "읽기 전용 권한입니다.");
                createTranslationKeyIfNotExists("testcase.permission.noEdit", "testcase", "편집 불가 메시지", "편집 권한이 없습니다.");
                createTranslationKeyIfNotExists("testcase.permission.noDelete", "testcase", "삭제 불가 메시지",
                                "삭제 권한이 없습니다.");

                // 새로 추가된 테스트케이스 폼 관련 번역 키들
                // TestCaseTree 컴포넌트 번역 키들
                createTranslationKeyIfNotExists("testcase.tree.selectAll", "testcase", "전체 선택", "전체 선택");
                createTranslationKeyIfNotExists("testcase.tree.root", "testcase", "루트", "루트");
                createTranslationKeyIfNotExists("testcase.tree.title.select", "testcase", "테스트케이스 선택", "테스트케이스 선택");
                createTranslationKeyIfNotExists("testcase.tree.title.manage", "testcase", "테스트케이스", "테스트케이스");
                createTranslationKeyIfNotExists("testcase.tree.message.selectProject", "testcase", "프로젝트를 선택하세요.",
                                "프로젝트를 선택하세요.");
                createTranslationKeyIfNotExists("testcase.tree.message.loading", "testcase", "로딩 중...", "로딩 중...");
                createTranslationKeyIfNotExists("testcase.tree.message.noTestcases", "testcase", "테스트케이스가 없습니다.",
                                "테스트케이스가 없습니다.");
                createTranslationKeyIfNotExists("testcase.tree.validation.nameRequired", "testcase", "이름을 입력하세요.",
                                "이름을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.tree.error.renameFailed", "testcase", "이름 변경에 실패했습니다: ",
                                "이름 변경에 실패했습니다: ");
                createTranslationKeyIfNotExists("testcase.tree.error.deleteFailed", "testcase", "삭제 중 오류가 발생했습니다.",
                                "삭제 중 오류가 발생했습니다.");

                // 트리 액션 버튼들
                createTranslationKeyIfNotExists("testcase.tree.button.batchDelete", "testcase", "선택 삭제", "선택 삭제");
                createTranslationKeyIfNotExists("testcase.tree.button.refresh", "testcase", "리프레시", "리프레시");
                createTranslationKeyIfNotExists("testcase.tree.button.saveOrder", "testcase", "순서 저장", "순서 저장");
                createTranslationKeyIfNotExists("testcase.tree.button.editOrder", "testcase", "순서 편집", "순서 편집");
                createTranslationKeyIfNotExists("testcase.tree.button.cancel", "testcase", "취소", "취소");
                createTranslationKeyIfNotExists("testcase.tree.button.delete", "testcase", "삭제", "삭제");
                createTranslationKeyIfNotExists("testcase.tree.button.close", "testcase", "닫기", "닫기");

                // 트리 액션 메뉴
                createTranslationKeyIfNotExists("testcase.tree.action.addFolder", "testcase", "폴더 추가", "폴더 추가");
                createTranslationKeyIfNotExists("testcase.tree.action.addTestcase", "testcase", "테스트케이스 추가",
                                "테스트케이스 추가");
                createTranslationKeyIfNotExists("testcase.tree.action.addSubFolder", "testcase", "하위 폴더 추가",
                                "하위 폴더 추가");
                createTranslationKeyIfNotExists("testcase.tree.action.addSubTestcase", "testcase", "하위 테스트케이스 추가",
                                "하위 테스트케이스 추가");
                createTranslationKeyIfNotExists("testcase.tree.action.rename", "testcase", "이름 변경", "이름 변경");
                createTranslationKeyIfNotExists("testcase.tree.action.delete", "testcase", "삭제", "삭제");
                createTranslationKeyIfNotExists("testcase.tree.action.versionHistory", "testcase", "버전 히스토리",
                                "버전 히스토리");

                // 트리 다이얼로그들
                createTranslationKeyIfNotExists("testcase.tree.dialog.batchDelete.title", "testcase", "선택 삭제", "선택 삭제");
                createTranslationKeyIfNotExists("testcase.tree.dialog.batchDelete.message", "testcase",
                                "{count}개 항목(하위 포함)을 삭제하시겠습니까?", "{count}개 항목(하위 포함)을 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("testcase.tree.dialog.deleteConfirm.title", "testcase", "삭제 확인",
                                "삭제 확인");
                createTranslationKeyIfNotExists("testcase.tree.dialog.deleteConfirm.message", "testcase",
                                "정말로 삭제하시겠습니까? (하위 항목 포함)", "정말로 삭제하시겠습니까? (하위 항목 포함)");
                createTranslationKeyIfNotExists("testcase.tree.dialog.error.title", "testcase", "오류", "오류");

                // 트리 토글 버튼 툴팁
                createTranslationKeyIfNotExists("testcase.tree.tooltip.open", "testcase", "테스트케이스 트리 열기 툴팁",
                                "테스트케이스 트리 열기");
                createTranslationKeyIfNotExists("testcase.tree.tooltip.close", "testcase", "테스트케이스 트리 닫기 툴팁",
                                "테스트케이스 트리 닫기");

                // 트리 통계 카운트
                createTranslationKeyIfNotExists("testcase.tree.count.testcases", "testcase", "테스트케이스 수",
                                "테스트케이스: {count}개");
                createTranslationKeyIfNotExists("testcase.tree.count.folders", "testcase", "폴더 수", "폴더: {count}개");
                createTranslationKeyIfNotExists("testcase.tree.count.total", "testcase", "전체 항목 수", "전체: {count}개");

                // TestCaseForm 컴포넌트 추가 번역 키들
                createTranslationKeyIfNotExists("testcase.form.displayId", "testcase", "Display ID", "Display ID");
                createTranslationKeyIfNotExists("testcase.form.createdBy", "testcase", "작성자", "작성자");
                createTranslationKeyIfNotExists("testcase.form.updatedBy", "testcase", "수정자", "수정자");
                createTranslationKeyIfNotExists("testcase.button.save", "testcase", "저장", "저장");
                createTranslationKeyIfNotExists("testcase.button.saving", "testcase", "저장 중...", "저장 중...");
                createTranslationKeyIfNotExists("testcase.message.selectProject", "testcase", "프로젝트를 먼저 선택하세요.",
                                "프로젝트를 먼저 선택하세요.");
                createTranslationKeyIfNotExists("testcase.message.selectOrCreate", "testcase", "테스트케이스를 선택하거나 새로 만드세요.",
                                "테스트케이스를 선택하거나 새로 만드세요.");
                createTranslationKeyIfNotExists("testcase.message.noSelection", "testcase", "선택 없음 메시지",
                                "Please select a folder or test case.");
                createTranslationKeyIfNotExists("testcase.message.saved", "testcase", "저장되었습니다.", "저장되었습니다.");
                createTranslationKeyIfNotExists("testcase.validation.stepRequired", "testcase", "Step을 입력하세요.",
                                "Step을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.error.saveError", "testcase", "저장 중 오류가 발생했습니다.",
                                "저장 중 오류가 발생했습니다.");

                // 버전 관리 관련 추가 키들
                createTranslationKeyIfNotExists("testcase.version.current.fetchError", "testcase", "현재 버전 조회 실패:",
                                "현재 버전 조회 실패:");
                createTranslationKeyIfNotExists("testcase.version.error.notSaved", "testcase",
                                "저장된 테스트케이스에만 버전을 생성할 수 있습니다.",
                                "저장된 테스트케이스에만 버전을 생성할 수 있습니다.");
                createTranslationKeyIfNotExists("testcase.version.error.folderNotAllowed", "testcase",
                                "폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.", "폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.");
                createTranslationKeyIfNotExists("testcase.version.error.createFailed", "testcase", "버전 생성에 실패했습니다.",
                                "버전 생성에 실패했습니다.");
                createTranslationKeyIfNotExists("testcase.version.error.createError", "testcase", "버전 생성 실패:",
                                "버전 생성 실패:");
                createTranslationKeyIfNotExists("testcase.version.validation.labelRequired", "testcase",
                                "버전 라벨을 입력하세요.",
                                "버전 라벨을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.version.form.labelPlaceholder", "testcase", "예: v2.1 수정사항 반영",
                                "예: v2.1 수정사항 반영");
                createTranslationKeyIfNotExists("testcase.version.form.labelHelperText", "testcase",
                                "버전을 식별할 수 있는 라벨을 입력하세요.",
                                "버전을 식별할 수 있는 라벨을 입력하세요.");
                createTranslationKeyIfNotExists("testcase.version.form.descriptionPlaceholder", "testcase",
                                "이 버전에서 변경된 내용을 상세히 설명하세요.", "이 버전에서 변경된 내용을 상세히 설명하세요.");
                createTranslationKeyIfNotExists("testcase.version.form.descriptionHelperText", "testcase",
                                "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.", "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.");

                // Attachments 첨부파일 관련 키들
                createTranslationKeyIfNotExists("attachments.loading", "attachments", "첨부파일 로딩 메시지", "첨부파일을 불러오는 중...");
                createTranslationKeyIfNotExists("attachments.empty", "attachments", "첨부파일 없음 메시지", "첨부파일이 없습니다.");
                createTranslationKeyIfNotExists("attachments.title", "attachments", "첨부파일 제목", "첨부파일");
                createTranslationKeyIfNotExists("attachments.button.download", "attachments", "다운로드 버튼", "다운로드");
                createTranslationKeyIfNotExists("attachments.button.delete", "attachments", "삭제 버튼", "삭제");
                createTranslationKeyIfNotExists("attachments.delete.title", "attachments", "첨부파일 삭제 다이얼로그 제목",
                                "첨부파일 삭제");
                createTranslationKeyIfNotExists("attachments.delete.message", "attachments", "첨부파일 삭제 확인 메시지",
                                "다음 파일을 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("attachments.delete.warning", "attachments", "첨부파일 삭제 경고",
                                "삭제된 파일은 복구할 수 없습니다.");
                createTranslationKeyIfNotExists("attachments.error.loadFailed", "attachments", "첨부파일 로드 실패",
                                "첨부파일 목록을 불러올 수 없습니다.");
                createTranslationKeyIfNotExists("attachments.error.loadError", "attachments", "첨부파일 로드 오류",
                                "첨부파일 목록을 불러오는 중 오류가 발생했습니다.");
                createTranslationKeyIfNotExists("attachments.error.downloadError", "attachments", "파일 다운로드 오류",
                                "파일 다운로드 중 오류가 발생했습니다.");
                createTranslationKeyIfNotExists("attachments.error.deleteError", "attachments", "파일 삭제 오류",
                                "파일 삭제 중 오류가 발생했습니다.");

                // Common 공통 버튼 키들
                createTranslationKeyIfNotExists("common.button.retry", "common", "다시 시도 버튼", "다시 시도");
                createTranslationKeyIfNotExists("common.button.cancel", "common", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("common.button.delete", "common", "삭제 버튼", "삭제");
                createTranslationKeyIfNotExists("common.button.refresh", "common", "새로고침 버튼", "새로고침");
                createTranslationKeyIfNotExists("common.button.close", "common", "닫기 버튼", "닫기");

                // TestResult 테스트 결과 관련 키들
                // 컬럼 헤더들
                createTranslationKeyIfNotExists("testResult.column.folder", "testResult", "폴더 컬럼", "폴더");
                createTranslationKeyIfNotExists("testResult.column.testCase", "testResult", "테스트케이스 컬럼", "테스트케이스");
                createTranslationKeyIfNotExists("testResult.column.result", "testResult", "결과 컬럼", "결과");
                createTranslationKeyIfNotExists("testResult.column.preCondition", "testResult", "사전설정 컬럼", "사전설정");
                createTranslationKeyIfNotExists("testResult.column.steps", "testResult", "스텝 정보 컬럼", "스텝 정보");
                createTranslationKeyIfNotExists("testResult.column.expectedResults", "testResult", "전체 예상결과 컬럼",
                                "전체 예상결과");
                createTranslationKeyIfNotExists("testResult.column.executor", "testResult", "실행자 컬럼", "실행자");
                createTranslationKeyIfNotExists("testResult.column.notes", "testResult", "비고 컬럼", "비고");
                createTranslationKeyIfNotExists("testResult.column.attachments", "testResult", "첨부파일 컬럼", "첨부파일");
                createTranslationKeyIfNotExists("testResult.column.executedDate", "testResult", "시행일자 컬럼", "시행일자");
                createTranslationKeyIfNotExists("testResult.column.jiraStatus", "testResult", "JIRA 상태 컬럼", "JIRA 상태");

                // 버튼들
                createTranslationKeyIfNotExists("testResult.button.edit", "testResult", "편집 버튼", "편집");
                createTranslationKeyIfNotExists("testResult.button.viewDetail", "testResult", "상세보기 버튼", "상세보기");
                createTranslationKeyIfNotExists("testResult.button.viewAttachments", "testResult", "첨부파일 보기 버튼",
                                "첨부파일 보기");
                createTranslationKeyIfNotExists("testResult.button.columnSettings", "testResult", "컬럼 설정 버튼", "컬럼 설정");
                createTranslationKeyIfNotExists("testResult.button.changeOrder", "testResult", "순서 변경 버튼", "순서 변경");
                createTranslationKeyIfNotExists("testResult.button.reset", "testResult", "기본값 버튼", "기본값");
                createTranslationKeyIfNotExists("testResult.button.advancedExport", "testResult", "고급 내보내기 버튼",
                                "고급 내보내기");
                createTranslationKeyIfNotExists("testResult.button.column", "testResult", "컬럼 버튼", "컬럼");
                createTranslationKeyIfNotExists("testResult.button.order", "testResult", "순서 버튼", "순서");
                createTranslationKeyIfNotExists("testResult.button.export", "testResult", "내보내기 버튼", "내보내기");

                // 툴팁들
                createTranslationKeyIfNotExists("testResult.tooltip.noPreCondition", "testResult", "사전설정 없음 툴팁",
                                "사전설정 없음");
                createTranslationKeyIfNotExists("testResult.tooltip.noExpectedResults", "testResult", "전체 예상결과 없음 툴팁",
                                "전체 예상결과 없음");
                createTranslationKeyIfNotExists("testResult.tooltip.noNotes", "testResult", "비고 없음 툴팁", "비고 없음");
                createTranslationKeyIfNotExists("testResult.tooltip.multipleJiraIds", "testResult", "다중 JIRA ID 툴팁",
                                "총 {count}개의 JIRA ID");

                // 상태들
                createTranslationKeyIfNotExists("testResult.status.unknown", "testResult", "알 수 없음 상태", "알 수 없음");
                createTranslationKeyIfNotExists("testResult.status.filtered", "testResult", "필터됨 상태", "필터됨");

                // 제목과 메시지들
                createTranslationKeyIfNotExists("testResult.title.detailList", "testResult", "상세 목록 제목",
                                "테스트 결과 상세 목록");
                createTranslationKeyIfNotExists("testResult.count.results", "testResult", "결과 개수 메시지",
                                "{count}개의 테스트 결과{filtered}");
                createTranslationKeyIfNotExists("testResult.error.loadFailure", "testResult", "로드 실패 오류",
                                "테스트 결과를 불러올 수 없습니다");

                // 기본값들
                createTranslationKeyIfNotExists("testResult.defaultValue.root", "testResult", "루트 기본값", "루트");
                createTranslationKeyIfNotExists("testResult.defaultValue.unknownTestCase", "testResult",
                                "알 수 없는 테스트케이스 기본값",
                                "알 수 없는 테스트케이스");
                createTranslationKeyIfNotExists("testResult.defaultValue.system", "testResult", "시스템 기본값", "시스템");

                // 스텝 관련
                createTranslationKeyIfNotExists("testResult.steps.empty", "testResult", "스텝 없음", "스텝 없음");
                createTranslationKeyIfNotExists("testResult.steps.description", "testResult", "스텝 설명", "설명");
                createTranslationKeyIfNotExists("testResult.steps.expectedResult", "testResult", "스텝 예상결과", "예상결과");

                // 다이얼로그 제목들
                createTranslationKeyIfNotExists("testResult.dialog.attachmentsTitle", "testResult", "첨부파일 다이얼로그 제목",
                                "테스트 결과 첨부파일");

                // JUnit 결과 대시보드 관련 키들
                createTranslationKeyIfNotExists("junit.dashboard.title", "junit", "JUnit 테스트 결과 대시보드 제목",
                                "테스트 결과 대시보드");
                createTranslationKeyIfNotExists("junit.dashboard.subtitle", "junit", "JUnit 대시보드 부제목",
                                "{projectName} - 자동화 테스트 결과 분석");
                createTranslationKeyIfNotExists("junit.dashboard.upload", "junit", "업로드 버튼", "업로드");
                createTranslationKeyIfNotExists("junit.dashboard.uploading", "junit", "업로드 중", "업로드 중...");
                createTranslationKeyIfNotExists("junit.dashboard.uploadResult", "junit", "테스트 결과 업로드 버튼", "테스트 결과 업로드");
                createTranslationKeyIfNotExists("junit.dashboard.refresh", "junit", "새로고침 버튼", "새로고침");

                // JUnit 편집기 관련 키들
                createTranslationKeyIfNotExists("junit.editor.originalJunitData", "junit", "원본 JUnit 데이터",
                                "원본 JUnit 데이터");
                createTranslationKeyIfNotExists("junit.editor.testName", "junit", "테스트 이름", "테스트 이름");
                createTranslationKeyIfNotExists("junit.editor.className", "junit", "클래스명", "클래스명");
                createTranslationKeyIfNotExists("junit.editor.executionTime", "junit", "실행 시간", "실행 시간");
                createTranslationKeyIfNotExists("junit.editor.originalStatus", "junit", "원본 상태", "원본 상태");
                createTranslationKeyIfNotExists("junit.editor.failureMessage", "junit", "실패 메시지", "실패 메시지");
                createTranslationKeyIfNotExists("junit.editor.stackTrace", "junit", "스택 트레이스", "스택 트레이스");
                createTranslationKeyIfNotExists("junit.editor.userEditInfo", "junit", "사용자 편집 정보", "사용자 편집 정보");
                createTranslationKeyIfNotExists("junit.editor.userDefinedTitle", "junit", "사용자 정의 제목", "사용자 정의 제목");
                createTranslationKeyIfNotExists("junit.editor.userDefinedTitleHelp", "junit", "사용자 정의 제목 헬프",
                                "테스트 케이스에 대한 사용자 정의 제목을 입력하세요.");
                createTranslationKeyIfNotExists("junit.editor.userDefinedStatus", "junit", "사용자 정의 상태", "사용자 정의 상태");
                createTranslationKeyIfNotExists("junit.editor.useOriginalStatus", "junit", "원본 상태 사용", "원본 상태 사용");
                createTranslationKeyIfNotExists("junit.editor.priorityLabel", "junit", "우선순위 라벨", "우선순위");

                // 헤더와 제목들
                createTranslationKeyIfNotExists("junit.header.testResultDashboard", "junit", "테스트 결과 대시보드 헤더",
                                "테스트 결과 대시보드");
                createTranslationKeyIfNotExists("junit.header.automationAnalysis", "junit", "자동화 테스트 분석 헤더",
                                "자동화 테스트 결과 분석");

                // 통계 카드들
                createTranslationKeyIfNotExists("junit.stats.passed", "junit", "통과 상태", "통과");
                createTranslationKeyIfNotExists("junit.stats.failed", "junit", "실패 상태", "실패");
                createTranslationKeyIfNotExists("junit.stats.error", "junit", "에러 상태", "에러");
                createTranslationKeyIfNotExists("junit.stats.skipped", "junit", "스킵 상태", "스킵");
                createTranslationKeyIfNotExists("junit.stats.successRate", "junit", "성공률", "성공률");
                createTranslationKeyIfNotExists("junit.stats.passedTests", "junit", "통과한 테스트", "통과한 테스트");
                createTranslationKeyIfNotExists("junit.stats.failedTests", "junit", "실패한 테스트", "실패한 테스트");
                createTranslationKeyIfNotExists("junit.stats.errorTests", "junit", "에러 발생", "에러 발생");
                createTranslationKeyIfNotExists("junit.stats.averageSuccessRate", "junit", "평균 성공률", "평균 성공률");

                // 탭 레이블들
                createTranslationKeyIfNotExists("junit.tab.overview", "junit", "개요 탭", "개요");
                createTranslationKeyIfNotExists("junit.tab.recentResults", "junit", "최근 결과 탭", "최근 결과");
                createTranslationKeyIfNotExists("junit.tab.statisticsChart", "junit", "통계 차트 탭", "통계 차트");
                createTranslationKeyIfNotExists("junit.tab.trendAnalysis", "junit", "트렌드 분석 탭", "트렌드 분석");

                // 차트 제목들
                createTranslationKeyIfNotExists("junit.chart.testStatusDistribution", "junit", "테스트 상태 분포 차트",
                                "테스트 상태 분포");
                createTranslationKeyIfNotExists("junit.chart.recentExecutionResults", "junit", "최근 실행 결과 차트",
                                "최근 실행 결과");
                createTranslationKeyIfNotExists("junit.chart.successRateTrend", "junit", "성공률 트렌드 차트", "성공률 트렌드");
                createTranslationKeyIfNotExists("junit.chart.detailedStatistics", "junit", "상세 통계 정보", "상세 통계 정보");

                // 테이블 헤더들
                createTranslationKeyIfNotExists("junit.table.executionName", "junit", "실행 이름 컬럼", "실행 이름");
                createTranslationKeyIfNotExists("junit.table.fileName", "junit", "파일명 컬럼", "파일명");
                createTranslationKeyIfNotExists("junit.table.totalTests", "junit", "총 테스트 컬럼", "총 테스트");
                createTranslationKeyIfNotExists("junit.table.successRate", "junit", "성공률 컬럼", "성공률");
                createTranslationKeyIfNotExists("junit.table.status", "junit", "상태 컬럼", "상태");
                createTranslationKeyIfNotExists("junit.table.uploadTime", "junit", "업로드 시간 컬럼", "업로드 시간");
                createTranslationKeyIfNotExists("junit.table.actions", "junit", "작업 컬럼", "작업");

                // JUnit 섹션 관련 키들
                createTranslationKeyIfNotExists("junit.sections.statistics", "junit", "통계 섹션", "통계");
                createTranslationKeyIfNotExists("junit.sections.charts", "junit", "차트 섹션", "차트");
                createTranslationKeyIfNotExists("junit.sections.list", "junit", "목록 섹션", "목록");

                // JUnit 대시보드 리스트 관련 키들
                createTranslationKeyIfNotExists("junit.dashboard.list.fileName", "junit", "파일명 리스트 헤더", "파일명");
                createTranslationKeyIfNotExists("junit.dashboard.list.testPlan", "junit", "테스트 플랜 리스트 헤더", "테스트 플랜");
                createTranslationKeyIfNotExists("junit.dashboard.list.executionName", "junit", "실행명 리스트 헤더", "실행명");

                // 버튼들과 액션들
                createTranslationKeyIfNotExists("junit.button.viewDetail", "junit", "상세 보기 버튼", "상세 보기");
                createTranslationKeyIfNotExists("junit.button.delete", "junit", "삭제 버튼", "삭제");
                createTranslationKeyIfNotExists("junit.button.backToAutomation", "junit", "자동화 테스트로 돌아가기",
                                "자동화 테스트로 돌아가기");

                // 메시지들
                createTranslationKeyIfNotExists("junit.message.noResults", "junit", "결과 없음 메시지", "테스트 결과가 없습니다");
                createTranslationKeyIfNotExists("junit.message.uploadFirst", "junit", "첫 업로드 안내",
                                "JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.");
                createTranslationKeyIfNotExists("junit.message.firstUpload", "junit", "첫 번째 업로드 버튼", "첫 번째 테스트 결과 업로드");
                createTranslationKeyIfNotExists("junit.message.loadingResults", "junit", "결과 로딩 중",
                                "테스트 결과를 불러오는 중...");
                createTranslationKeyIfNotExists("junit.message.loadFailed", "junit", "로드 실패", "테스트 결과를 불러오는데 실패했습니다.");
                createTranslationKeyIfNotExists("junit.message.noData", "junit", "데이터 없음", "테스트 결과가 없습니다.");
                createTranslationKeyIfNotExists("junit.message.trendDataInsufficient", "junit", "트렌드 데이터 부족",
                                "트렌드 분석을 위한 데이터가 부족합니다.");
                createTranslationKeyIfNotExists("junit.message.statisticsImplementing", "junit", "통계 구현 예정",
                                "통계 차트 구현 예정");
                createTranslationKeyIfNotExists("junit.message.selectProject", "junit", "프로젝트 선택 안내",
                                "프로젝트를 먼저 선택해주세요.");
                createTranslationKeyIfNotExists("junit.message.deletingResult", "junit", "결과 삭제 확인",
                                "정말로 이 테스트 결과를 삭제하시겠습니까?");

                // 업로드 다이얼로그 관련
                createTranslationKeyIfNotExists("junit.upload.dialog.title", "junit", "업로드 다이얼로그 제목",
                                "JUnit XML 파일 업로드");
                createTranslationKeyIfNotExists("junit.upload.dragDrop", "junit", "드래그 드롭 안내",
                                "JUnit XML 파일을 드래그하거나 클릭하여 선택");
                createTranslationKeyIfNotExists("junit.upload.selectFile", "junit", "파일 선택 버튼", "파일 선택");
                createTranslationKeyIfNotExists("junit.upload.selectAnother", "junit", "다른 파일 선택", "다른 파일 선택");
                createTranslationKeyIfNotExists("junit.upload.maxSize", "junit", "최대 크기 안내", "최대 {maxSize}까지 업로드 가능");
                createTranslationKeyIfNotExists("junit.upload.allowedFormats", "junit", "허용 형식", "허용 형식: {formats}");
                createTranslationKeyIfNotExists("junit.upload.executionInfo", "junit", "테스트 실행 정보", "테스트 실행 정보");
                createTranslationKeyIfNotExists("junit.upload.executionName", "junit", "실행 이름 플레이스홀더",
                                "실행 이름 (예: Sprint 24 Integration Tests)");
                createTranslationKeyIfNotExists("junit.upload.description", "junit", "설명 플레이스홀더", "설명 (선택사항)");
                createTranslationKeyIfNotExists("junit.upload.cancel", "junit", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("junit.upload.fileSize", "junit", "파일 크기", "크기: {size}");

                // 날짜 관련
                createTranslationKeyIfNotExists("junit.date.noInfo", "junit", "날짜 정보 없음", "날짜 정보 없음");
                createTranslationKeyIfNotExists("junit.date.unknown", "junit", "알 수 없는 날짜", "알 수 없는 날짜 형식");
                createTranslationKeyIfNotExists("junit.date.invalid", "junit", "유효하지 않은 날짜", "유효하지 않은 날짜");
                createTranslationKeyIfNotExists("junit.date.error", "junit", "날짜 처리 오류", "날짜 처리 오류");

                // JUnit 결과 상세 페이지 관련
                createTranslationKeyIfNotExists("junit.detail.title", "junit", "상세 페이지 제목", "JUnit 테스트 결과 상세");
                createTranslationKeyIfNotExists("junit.detail.uploadInfo", "junit", "업로드 정보",
                                "업로드: {date} | {uploader}");
                createTranslationKeyIfNotExists("junit.detail.loadingDetail", "junit", "상세 정보 로딩",
                                "테스트 결과 상세 정보를 불러오는 중...");
                createTranslationKeyIfNotExists("junit.detail.loadFailedDetail", "junit", "상세 정보 로드 실패",
                                "테스트 결과 상세 정보를 불러오는데 실패했습니다.");
                createTranslationKeyIfNotExists("junit.detail.notFound", "junit", "결과 찾을 수 없음", "테스트 결과를 찾을 수 없습니다.");
                createTranslationKeyIfNotExists("junit.detail.exportPDF", "junit", "PDF 내보내기", "PDF 내보내기");
                createTranslationKeyIfNotExists("junit.detail.exportingPDF", "junit", "PDF 생성 중", "PDF 생성 중...");
                createTranslationKeyIfNotExists("junit.detail.exportCSV", "junit", "CSV 내보내기", "CSV 내보내기");
                createTranslationKeyIfNotExists("junit.detail.exportingCSV", "junit", "CSV 생성 중", "CSV 생성 중...");
                createTranslationKeyIfNotExists("junit.detail.versionManagement", "junit", "버전 관리", "버전 관리");

                // 탭 - JUnit 상세
                createTranslationKeyIfNotExists("junit.detail.tab.testCases", "junit", "테스트 케이스 탭", "테스트 케이스");
                createTranslationKeyIfNotExists("junit.detail.tab.failedTests", "junit", "실패한 테스트 탭", "실패한 테스트");
                createTranslationKeyIfNotExists("junit.detail.tab.slowTests", "junit", "느린 테스트 탭", "느린 테스트");

                // JUnit 상세 페이지 추가 번역 키
                createTranslationKeyIfNotExists("junit.detail.backToAutomation", "junit", "자동화 테스트로 돌아가기",
                                "자동화 테스트로 돌아가기");
                createTranslationKeyIfNotExists("junit.detail.refresh", "junit", "새로고침", "새로고침");
                createTranslationKeyIfNotExists("junit.detail.noDateInfo", "junit", "날짜 정보 없음", "날짜 정보 없음");
                createTranslationKeyIfNotExists("junit.detail.unknownDateFormat", "junit", "알 수 없는 날짜 형식",
                                "알 수 없는 날짜 형식");
                createTranslationKeyIfNotExists("junit.detail.invalidDate", "junit", "유효하지 않은 날짜", "유효하지 않은 날짜");
                createTranslationKeyIfNotExists("junit.detail.dateProcessingError", "junit", "날짜 처리 오류", "날짜 처리 오류");
                createTranslationKeyIfNotExists("junit.detail.loadTestCasesFailed", "junit", "테스트 케이스 로드 실패",
                                "테스트 케이스를 불러오는데 실패했습니다.");
                createTranslationKeyIfNotExists("junit.detail.testSuite", "junit", "테스트 스위트", "테스트 스위트");
                createTranslationKeyIfNotExists("junit.detail.testCaseSearch", "junit", "테스트 케이스 검색", "테스트 케이스 검색...");
                createTranslationKeyIfNotExists("junit.detail.testName", "junit", "테스트명", "테스트명");
                createTranslationKeyIfNotExists("junit.detail.edit", "junit", "수정", "수정");
                createTranslationKeyIfNotExists("junit.detail.original", "junit", "원본", "원본");
                createTranslationKeyIfNotExists("junit.detail.failedTestCases", "junit", "실패한 테스트 케이스", "실패한 테스트 케이스");
                createTranslationKeyIfNotExists("junit.detail.noFailedTests", "junit", "실패한 테스트 없음",
                                "실패한 테스트 케이스가 없습니다!");
                createTranslationKeyIfNotExists("junit.detail.failureMessagePreview", "junit", "실패 메시지 미리보기",
                                "실패 메시지 미리보기:");
                createTranslationKeyIfNotExists("junit.detail.clickForDetails", "junit", "상세 내용 안내",
                                "상세 내용을 보려면 테스트명을 클릭하세요");
                createTranslationKeyIfNotExists("junit.detail.slowestTests", "junit", "가장 느린 테스트", "가장 느린 테스트 케이스");
                createTranslationKeyIfNotExists("junit.detail.slowestTestsTop", "junit", "상위 느린 테스트",
                                "가장 느린 테스트 케이스 (상위 {count}개)");
                createTranslationKeyIfNotExists("junit.detail.noExecutionTimeData", "junit", "실행 시간 데이터 없음",
                                "실행 시간 데이터가 없습니다.");
                createTranslationKeyIfNotExists("junit.detail.exportPDFAlert", "junit", "PDF 내보내기 알림",
                                "테스트 결과를 찾을 수 없습니다.");
                createTranslationKeyIfNotExists("junit.detail.exportPDFComplete", "junit", "PDF 내보내기 완료",
                                "PDF 내보내기 완료");
                createTranslationKeyIfNotExists("junit.detail.exportPDFFailed", "junit", "PDF 내보내기 실패", "PDF 내보내기 실패");
                createTranslationKeyIfNotExists("junit.detail.exportPDFError", "junit", "PDF 내보내기 오류",
                                "PDF 내보내기 중 오류가 발생했습니다");
                createTranslationKeyIfNotExists("junit.detail.exportCSVAlert", "junit", "CSV 내보내기 알림",
                                "내보낼 테스트 결과가 없습니다.");
                createTranslationKeyIfNotExists("junit.detail.exportCSVComplete", "junit", "CSV 내보내기 완료",
                                "CSV 내보내기 완료");
                createTranslationKeyIfNotExists("junit.detail.exportCSVFailed", "junit", "CSV 내보내기 실패", "CSV 내보내기 실패");
                createTranslationKeyIfNotExists("junit.detail.exportCSVError", "junit", "CSV 내보내기 오류",
                                "CSV 내보내기 중 오류가 발생했습니다");

                // 공통 용어
                createTranslationKeyIfNotExists("common.unit.count", "common", "개수 단위", "개");
                createTranslationKeyIfNotExists("common.status", "common", "상태", "상태");
                createTranslationKeyIfNotExists("common.all", "common", "전체", "전체");

                // 테스트 스위트 관련
                createTranslationKeyIfNotExists("junit.suite.testSuite", "junit", "테스트 스위트", "테스트 스위트");
                createTranslationKeyIfNotExists("junit.suite.all", "junit", "전체", "전체");
                createTranslationKeyIfNotExists("junit.suite.search", "junit", "테스트 케이스 검색", "테스트 케이스 검색...");

                // 실패한 테스트 관련
                createTranslationKeyIfNotExists("junit.failed.title", "junit", "실패한 테스트 제목", "실패한 테스트 케이스 ({count}개)");
                createTranslationKeyIfNotExists("junit.failed.noFailures", "junit", "실패 없음", "실패한 테스트 케이스가 없습니다!");
                createTranslationKeyIfNotExists("junit.failed.failureMessage", "junit", "실패 메시지", "실패 메시지 미리보기:");
                createTranslationKeyIfNotExists("junit.failed.clickForDetail", "junit", "상세 보기 클릭",
                                "상세 내용을 보려면 테스트명을 클릭하세요");

                // 느린 테스트 관련
                createTranslationKeyIfNotExists("junit.slow.title", "junit", "느린 테스트 제목",
                                "가장 느린 테스트 케이스 (상위 {count}개)");
                createTranslationKeyIfNotExists("junit.slow.noData", "junit", "실행 시간 데이터 없음", "실행 시간 데이터가 없습니다.");

                // 테스트 케이스 상세 패널 관련
                createTranslationKeyIfNotExists("junit.testcase.selectCase", "junit", "테스트 케이스 선택", "테스트 케이스를 선택하세요");
                createTranslationKeyIfNotExists("junit.testcase.loadingDetail", "junit", "상세 정보 로딩",
                                "테스트 케이스 상세 정보 로드 중...");
                createTranslationKeyIfNotExists("junit.testcase.errorOccurred", "junit", "오류 발생", "오류 발생");
                createTranslationKeyIfNotExists("junit.testcase.noData", "junit", "데이터 없음", "데이터 없음");
                createTranslationKeyIfNotExists("junit.testcase.noDetailInfo", "junit", "상세 정보 없음",
                                "테스트 케이스 상세 정보가 없습니다.");
                createTranslationKeyIfNotExists("junit.testcase.edit", "junit", "테스트 케이스 편집", "테스트 케이스 편집");
                createTranslationKeyIfNotExists("junit.testcase.close", "junit", "닫기", "닫기");
                createTranslationKeyIfNotExists("junit.testcase.previous", "junit", "이전 테스트 케이스", "이전 테스트 케이스");
                createTranslationKeyIfNotExists("junit.testcase.next", "junit", "다음 테스트 케이스", "다음 테스트 케이스");

                // Tracelog 탭 관련
                createTranslationKeyIfNotExists("junit.tracelog.tab", "junit", "Tracelog 탭", "Tracelog");
                createTranslationKeyIfNotExists("junit.tracelog.failureMessage", "junit", "실패 메시지", "Failure Message");
                createTranslationKeyIfNotExists("junit.tracelog.stackTrace", "junit", "스택 트레이스", "Stack Trace");
                createTranslationKeyIfNotExists("junit.tracelog.skipMessage", "junit", "스킵 메시지", "Skip Message");
                createTranslationKeyIfNotExists("junit.tracelog.noErrorLog", "junit", "오류 로그 없음",
                                "이 테스트 케이스에는 오류 로그가 없습니다.");

                // Test Body 탭 관련
                createTranslationKeyIfNotExists("junit.testbody.tab", "junit", "Test Body 탭", "Test Body");
                createTranslationKeyIfNotExists("junit.testbody.systemOut", "junit", "시스템 출력", "System Out");
                createTranslationKeyIfNotExists("junit.testbody.systemErr", "junit", "시스템 오류", "System Error");
                createTranslationKeyIfNotExists("junit.testbody.noOutput", "junit", "시스템 출력 없음",
                                "이 테스트 케이스에는 시스템 출력이 없습니다.");
                createTranslationKeyIfNotExists("junit.testbody.fullscreen", "junit", "전체화면으로 보기", "전체화면으로 보기");
                createTranslationKeyIfNotExists("junit.testbody.fullscreenTitle", "junit", "전체화면 제목",
                                "Test Body - {testName}");

                // RecentTestResults 컴포넌트 관련 키들
                createTranslationKeyIfNotExists("recentResults.status.notRun", "recentResults", "미실행 상태", "미실행");
                createTranslationKeyIfNotExists("recentResults.status.unknown", "recentResults", "알 수 없는 상태", "알 수 없음");
                createTranslationKeyIfNotExists("recentResults.message.noResults", "recentResults", "결과 없음 메시지",
                                "최근 테스트 결과가 없습니다.");
                createTranslationKeyIfNotExists("recentResults.title.withCount", "recentResults", "결과 제목 (개수 포함)",
                                "최근 테스트 결과 ({count}개)");
                createTranslationKeyIfNotExists("recentResults.button.refresh", "recentResults", "새로고침 버튼", "새로고침");
                createTranslationKeyIfNotExists("recentResults.label.testcase", "recentResults", "테스트케이스 라벨", "테스트케이스");
                createTranslationKeyIfNotExists("recentResults.label.project", "recentResults", "프로젝트 라벨", "프로젝트:");
                createTranslationKeyIfNotExists("recentResults.label.execution", "recentResults", "실행 라벨", "실행:");
                createTranslationKeyIfNotExists("recentResults.label.executor", "recentResults", "실행자 라벨", "실행자:");
                createTranslationKeyIfNotExists("recentResults.label.notes", "recentResults", "메모 라벨", "메모:");
                createTranslationKeyIfNotExists("recentResults.testcase.fallback", "recentResults", "테스트케이스 대체 이름",
                                "테스트케이스 {id}");

                // JunitResultDashboard 추가 하드코딩 텍스트들
                createTranslationKeyIfNotExists("junit.table.recentTestExecutionResults", "junit", "최근 테스트 실행 결과 제목",
                                "최근 테스트 실행 결과");
                createTranslationKeyIfNotExists("junit.fallback.noName", "junit", "이름 없음 폴백", "(이름 없음)");
                createTranslationKeyIfNotExists("junit.error.loadFailed", "junit", "결과 로드 실패", "테스트 결과를 불러오는데 실패했습니다.");
                createTranslationKeyIfNotExists("junit.confirm.deleteResult", "junit", "결과 삭제 확인",
                                "정말로 이 테스트 결과를 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("junit.comment.fileNameExtraction", "junit", "파일명에서 실행 이름 추출 코멘트",
                                "파일명에서 실행 이름 추출");

                // TestResult 상태 라벨 번역 키들 (testResultConstants.js에서 사용)
                createTranslationKeyIfNotExists("testResult.status.pass", "testResult", "성공 상태 라벨", "성공");
                createTranslationKeyIfNotExists("testResult.status.fail", "testResult", "실패 상태 라벨", "실패");
                createTranslationKeyIfNotExists("testResult.status.blocked", "testResult", "차단됨 상태 라벨", "차단됨");
                createTranslationKeyIfNotExists("testResult.status.notRun", "testResult", "미실행 상태 라벨", "미실행");
                createTranslationKeyIfNotExists("testResult.status.skipped", "testResult", "건너뜀 상태 라벨", "건너뜀");

                // JUnit 상태 라벨 번역 키들 (junitResultService.js에서 사용)
                createTranslationKeyIfNotExists("junit.status.uploading", "junit", "업로드중 상태", "업로드중");
                createTranslationKeyIfNotExists("junit.status.parsing", "junit", "파싱중 상태", "파싱중");
                createTranslationKeyIfNotExists("junit.status.completed", "junit", "완료 상태", "완료");
                createTranslationKeyIfNotExists("junit.status.unknown", "junit", "알 수 없음 상태", "알 수 없음");

                // JUnit 입력 필드 placeholder 번역 키들
                createTranslationKeyIfNotExists("junit.placeholder.executionName", "junit", "실행 이름 입력 placeholder",
                                "실행 이름 (예: Sprint 24 Integration Tests)");

                // JUnit 테스트 케이스 편집기 placeholder 번역 키들
                createTranslationKeyIfNotExists("junit.editor.userDescriptionPlaceholder", "junit",
                                "사용자 정의 설명 placeholder",
                                "이 테스트 케이스에 대한 상세한 설명을 입력하세요...");

                // 테스트케이스 고급 필터 placeholder 번역 키들
                createTranslationKeyIfNotExists("testcase.advancedFilter.searchPlaceholder", "testcase",
                                "고급 필터 검색 placeholder",
                                "테스트케이스 이름, 설명, 단계 내용 검색...");

                // 테스트 결과 상세 리포트 placeholder 번역 키들
                createTranslationKeyIfNotExists("testResult.detailReport.searchPlaceholder", "testResult",
                                "상세 리포트 검색 placeholder", "테스트 케이스명, 폴더 경로, 실행자 등");

                // 프리셋 관리 placeholder 번역 키들
                createTranslationKeyIfNotExists("preset.name.placeholder", "preset", "프리셋 이름 placeholder",
                                "예: 내 테스트 케이스");

                // RAG AI 생성 테스트케이스 관련 번역 키들
                createTranslationKeyIfNotExists("rag.testcase.preview.title", "rag", "AI 생성 테스트케이스 프리뷰 제목",
                                "✨ AI 생성 테스트케이스");
                createTranslationKeyIfNotExists("rag.testcase.addButton", "rag", "테스트케이스 추가 버튼", "테스트케이스 추가");
                createTranslationKeyIfNotExists("rag.testcase.addToProject", "rag", "프로젝트에 추가 버튼", "테스트케이스로 추가");
                createTranslationKeyIfNotExists("rag.testcase.created", "rag", "생성 완료 상태", "생성 완료");
                createTranslationKeyIfNotExists("rag.testcase.creating", "rag", "생성 중 상태", "생성 중...");
                createTranslationKeyIfNotExists("rag.testcase.createSuccess", "rag", "생성 성공 메시지",
                                "테스트케이스가 성공적으로 생성되었습니다!");
                createTranslationKeyIfNotExists("rag.testcase.createError", "rag", "생성 실패 메시지", "테스트케이스 생성에 실패했습니다.");
                createTranslationKeyIfNotExists("rag.testcase.dialog.title", "rag", "테스트케이스 추가 다이얼로그 제목", "테스트케이스 추가");

                // 태그 관련 번역 키들
                createTranslationKeyIfNotExists("testcase.form.tags", "testcase", "태그 필드 라벨", "태그");
                createTranslationKeyIfNotExists("testcase.form.tagsPlaceholder", "testcase", "태그 입력 placeholder",
                                "태그를 입력하고 Enter를 누르세요");
                createTranslationKeyIfNotExists("testcase.helper.tags", "testcase", "태그 헬퍼 텍스트", "여러 태그를 입력할 수 있습니다");

                // 우선순위 관련 번역 키들
                createTranslationKeyIfNotExists("testcase.form.priority", "testcase", "우선순위 필드 라벨", "우선순위");
                createTranslationKeyIfNotExists("testcase.priority.high", "testcase", "높은 우선순위", "높음");
                createTranslationKeyIfNotExists("testcase.priority.medium", "testcase", "보통 우선순위", "보통");
                createTranslationKeyIfNotExists("testcase.priority.low", "testcase", "낮은 우선순위", "낮음");

                // 연결된 RAG 문서 관련 번역 키들
                createTranslationKeyIfNotExists("testcase.form.linkedDocuments", "testcase", "연결된 RAG 문서 필드",
                                "연결된 RAG 문서");
                createTranslationKeyIfNotExists("testcase.form.linkedDocumentsPlaceholder", "testcase",
                                "RAG 문서 선택 placeholder",
                                "RAG 문서를 선택하세요");
                createTranslationKeyIfNotExists("testcase.helper.linkedDocuments", "testcase", "RAG 문서 헬퍼 텍스트",
                                "RAG 문서를 연결하면 AI가 참고할 수 있습니다");

                // 사후 조건 헬퍼 텍스트
                createTranslationKeyIfNotExists("testcase.helper.postCondition", "testcase", "사후 조건 헬퍼 텍스트",
                                "사후 조건을 입력하세요.");

                // Markdown 지원 안내 메시지
                createTranslationKeyIfNotExists("testcase.helper.markdownSupported", "testcase", "Markdown 지원 안내",
                                "Markdown 문법을 사용할 수 있습니다.");

                // 버전 히스토리 관련 번역 키들
                createTranslationKeyIfNotExists("testcase.versionHistory.title", "testcase", "버전 히스토리 다이얼로그 제목",
                                "테스트케이스 버전 히스토리");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.fetchFailed", "testcase", "버전 조회 실패 에러",
                                "버전 히스토리 조회에 실패했습니다.");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.fetchError", "testcase", "버전 조회 오류",
                                "버전 히스토리 조회 실패:");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.restoreFailed", "testcase", "버전 복원 실패",
                                "버전 복원에 실패했습니다.");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.restoreError", "testcase", "버전 복원 오류",
                                "버전 복원 실패:");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.viewFailed", "testcase", "버전 상세 조회 실패",
                                "버전 상세 조회에 실패했습니다.");
                createTranslationKeyIfNotExists("testcase.versionHistory.error.viewError", "testcase", "버전 상세 조회 오류",
                                "버전 상세 조회 실패:");
                createTranslationKeyIfNotExists("testcase.versionHistory.empty", "testcase", "버전 히스토리 없음",
                                "버전 히스토리가 없습니다.");

                // 버전 변경 타입 라벨
                createTranslationKeyIfNotExists("testcase.versionHistory.changeType.create", "testcase", "생성 타입", "생성");
                createTranslationKeyIfNotExists("testcase.versionHistory.changeType.update", "testcase", "수정 타입", "수정");
                createTranslationKeyIfNotExists("testcase.versionHistory.changeType.manualSave", "testcase", "수동 저장 타입",
                                "수동 저장");
                createTranslationKeyIfNotExists("testcase.versionHistory.changeType.restore", "testcase", "복원 타입",
                                "복원");
                createTranslationKeyIfNotExists("testcase.versionHistory.changeType.unknown", "testcase", "알 수 없는 타입",
                                "알 수 없음");

                // 버전 상태 및 정보
                createTranslationKeyIfNotExists("testcase.versionHistory.current", "testcase", "현재 버전 뱃지", "현재");
                createTranslationKeyIfNotExists("testcase.versionHistory.changeSummary.empty", "testcase", "변경 내용 없음",
                                "변경 내용 없음");
                createTranslationKeyIfNotExists("testcase.versionHistory.creator.unknown", "testcase", "알 수 없는 작성자",
                                "알 수 없음");
                createTranslationKeyIfNotExists("testcase.versionHistory.time.unknown", "testcase", "시간 정보 없음",
                                "시간 정보 없음");

                // 버전 액션 버튼 툴팁
                createTranslationKeyIfNotExists("testcase.versionHistory.action.view", "testcase", "상세 보기 툴팁", "상세 보기");
                createTranslationKeyIfNotExists("testcase.versionHistory.action.restore", "testcase", "복원 툴팁",
                                "이 버전으로 복원");
                createTranslationKeyIfNotExists("testcase.versionHistory.action.compare", "testcase", "비교 툴팁",
                                "다음 버전과 비교");

                // 버전 상세 다이얼로그
                createTranslationKeyIfNotExists("testcase.versionDetail.title", "testcase", "버전 상세 다이얼로그 제목",
                                "버전 상세 정보");
                createTranslationKeyIfNotExists("testcase.versionDetail.section.basic", "testcase", "기본 정보 섹션",
                                "기본 정보");
                createTranslationKeyIfNotExists("testcase.versionDetail.section.steps", "testcase", "테스트 스텝 섹션",
                                "테스트 스텝");
                createTranslationKeyIfNotExists("testcase.versionDetail.section.version", "testcase", "버전 정보 섹션",
                                "버전 정보");

                // 버전 상세 필드
                createTranslationKeyIfNotExists("testcase.versionDetail.field.name", "testcase", "이름 필드", "이름:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.description", "testcase", "설명 필드", "설명:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.preCondition", "testcase", "사전 조건 필드",
                                "사전 조건:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.expectedResults", "testcase", "예상 결과 필드",
                                "예상 결과:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.priority", "testcase", "우선순위 필드",
                                "우선순위:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.versionNumber", "testcase", "버전 번호 필드",
                                "버전 번호:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.changeType", "testcase", "변경 유형 필드",
                                "변경 유형:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.changeSummary", "testcase", "변경 요약 필드",
                                "변경 요약:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.creator", "testcase", "생성자 필드", "생성자:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.createdAt", "testcase", "생성 시간 필드",
                                "생성 시간:");
                createTranslationKeyIfNotExists("testcase.versionDetail.field.none", "testcase", "없음 기본값", "없음");

                // 버전 상세 스텝 정보
                createTranslationKeyIfNotExists("testcase.versionDetail.step.number", "testcase", "단계 번호", "단계");
                createTranslationKeyIfNotExists("testcase.versionDetail.step.expectedResult", "testcase", "스텝 예상 결과",
                                "예상 결과:");

                // 버전 상세 버튼
                // 버전 상세 버튼
                createTranslationKeyIfNotExists("testcase.versionDetail.button.close", "testcase", "닫기 버튼", "닫기");

                // 버전 인디케이터 - 상태
                createTranslationKeyIfNotExists("testcase.version.status.current", "testcase", "버전 상태: 최신", "최신 버전");
                createTranslationKeyIfNotExists("testcase.version.status.outdated", "testcase", "버전 상태: 이전", "이전 버전");
                createTranslationKeyIfNotExists("testcase.version.status.draft", "testcase", "버전 상태: 임시 저장", "임시 저장");
                createTranslationKeyIfNotExists("testcase.version.status.none", "testcase", "버전 상태: 없음", "버전 없음");

                // 버전 인디케이터 - 툴팁
                createTranslationKeyIfNotExists("testcase.version.tooltip.current", "testcase", "현재 버전 툴팁",
                                "현재 최신 버전입니다");
                createTranslationKeyIfNotExists("testcase.version.tooltip.outdated", "testcase", "이전 버전 툴팁",
                                "더 새로운 버전이 있습니다");
                createTranslationKeyIfNotExists("testcase.version.tooltip.draft", "testcase", "임시 저장 툴팁",
                                "임시 저장된 버전입니다");
                createTranslationKeyIfNotExists("testcase.version.tooltip.none", "testcase", "버전 없음 툴팁",
                                "버전이 생성되지 않았습니다");

                // 버전 인디케이터 - 메뉴
                createTranslationKeyIfNotExists("testcase.version.menu.history", "testcase", "버전 히스토리 메뉴", "버전 히스토리");
                createTranslationKeyIfNotExists("testcase.version.menu.createNew", "testcase", "새 버전 생성 메뉴", "새 버전 생성");
                createTranslationKeyIfNotExists("testcase.version.menu.restore", "testcase", "버전 복원 메뉴", "이 버전으로 복원");
                createTranslationKeyIfNotExists("testcase.version.menu.restoreDescription", "testcase", "버전 복원 설명",
                                "현재 버전으로 설정");

                // 버전 인디케이터 - 기타
                createTranslationKeyIfNotExists("testcase.version.noChanges", "testcase", "변경 내용 없음", "변경 내용 없음");

                // 대량 작업 관련 키들
                createTranslationKeyIfNotExists("testcase.bulkOps.dialog.title", "testcase", "일괄 작업 다이얼로그 제목",
                                "테스트케이스 일괄 작업");
                createTranslationKeyIfNotExists("testcase.bulkOps.dialog.selectedCount", "testcase", "선택된 항목 개수",
                                "선택된 항목: {count}개");
                createTranslationKeyIfNotExists("testcase.bulkOps.dialog.moreItems", "testcase", "추가 항목 표시",
                                "외 {count}개");

                // 작업 유형
                createTranslationKeyIfNotExists("testcase.bulkOps.operation.label", "testcase", "작업 유형 라벨", "작업 유형");
                createTranslationKeyIfNotExists("testcase.bulkOps.operation.update", "testcase", "속성 일괄 수정",
                                "속성 일괄 수정");
                createTranslationKeyIfNotExists("testcase.bulkOps.operation.copy", "testcase", "복사 작업", "복사");
                createTranslationKeyIfNotExists("testcase.bulkOps.operation.move", "testcase", "이동 작업", "이동");
                createTranslationKeyIfNotExists("testcase.bulkOps.operation.delete", "testcase", "삭제 작업", "삭제");

                // 작업 설명
                createTranslationKeyIfNotExists("testcase.bulkOps.description.update", "testcase", "속성 일괄 수정 설명",
                                "선택된 테스트케이스들의 속성을 일괄 수정합니다.");
                createTranslationKeyIfNotExists("testcase.bulkOps.description.delete", "testcase", "삭제 작업 설명",
                                "선택된 테스트케이스들을 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.");
                createTranslationKeyIfNotExists("testcase.bulkOps.description.move", "testcase", "이동 작업 설명",
                                "선택된 테스트케이스들을 다른 프로젝트 또는 폴더로 이동합니다.");
                createTranslationKeyIfNotExists("testcase.bulkOps.description.copy", "testcase", "복사 작업 설명",
                                "선택된 테스트케이스들을 다른 프로젝트 또는 폴더에 복사합니다.");

                // 필드 라벨
                createTranslationKeyIfNotExists("testcase.bulkOps.field.priority", "testcase", "우선순위 필드", "우선순위");
                createTranslationKeyIfNotExists("testcase.bulkOps.field.type", "testcase", "유형 필드", "유형");
                createTranslationKeyIfNotExists("testcase.bulkOps.field.description", "testcase", "설명 필드",
                                "설명 (기존 내용에 추가)");
                createTranslationKeyIfNotExists("testcase.bulkOps.field.targetProject", "testcase", "대상 프로젝트 필드",
                                "대상 프로젝트");
                createTranslationKeyIfNotExists("testcase.bulkOps.field.targetFolder", "testcase", "대상 폴더 필드",
                                "대상 폴더 (선택사항)");
                createTranslationKeyIfNotExists("testcase.bulkOps.field.rootFolder", "testcase", "루트 폴더", "루트 폴더");

                // 옵션값
                createTranslationKeyIfNotExists("testcase.bulkOps.option.noChange", "testcase", "변경하지 않음", "변경하지 않음");
                createTranslationKeyIfNotExists("testcase.bulkOps.priority.high", "testcase", "높은 우선순위", "높음");
                createTranslationKeyIfNotExists("testcase.bulkOps.priority.medium", "testcase", "보통 우선순위", "보통");
                createTranslationKeyIfNotExists("testcase.bulkOps.priority.low", "testcase", "낮은 우선순위", "낮음");
                createTranslationKeyIfNotExists("testcase.bulkOps.type.testcase", "testcase", "테스트케이스 타입", "테스트케이스");
                createTranslationKeyIfNotExists("testcase.bulkOps.type.folder", "testcase", "폴더 타입", "폴더");

                // 플레이스홀더
                createTranslationKeyIfNotExists("testcase.bulkOps.placeholder.description", "testcase", "설명 플레이스홀더",
                                "이 내용이 기존 설명에 추가됩니다...");

                // 에러 메시지
                createTranslationKeyIfNotExists("testcase.bulkOps.error.selectOperation", "testcase", "작업 유형 선택 오류",
                                "작업 유형을 선택해주세요.");
                createTranslationKeyIfNotExists("testcase.bulkOps.error.selectProject", "testcase", "프로젝트 선택 오류",
                                "대상 프로젝트를 선택해주세요.");
                createTranslationKeyIfNotExists("testcase.bulkOps.error.confirmDelete", "testcase", "삭제 확인 오류",
                                "삭제 확인을 체크해주세요.");
                createTranslationKeyIfNotExists("testcase.bulkOps.error.unknownOperation", "testcase", "알 수 없는 작업 오류",
                                "알 수 없는 작업 유형입니다.");
                createTranslationKeyIfNotExists("testcase.bulkOps.error.executionFailed", "testcase", "작업 실행 실패",
                                "작업 실행 중 오류가 발생했습니다.");

                // 확인 메시지
                createTranslationKeyIfNotExists("testcase.bulkOps.confirm.deleteMessage", "testcase", "삭제 확인 메시지",
                                "선택된 테스트케이스들을 완전히 삭제할 것을 확인합니다.");

                // 상태 메시지
                createTranslationKeyIfNotExists("testcase.bulkOps.status.processing", "testcase", "처리 중 상태", "처리 중...");
                createTranslationKeyIfNotExists("testcase.bulkOps.button.execute", "testcase", "실행 버튼", "실행");

                // 스프레드시트 행 삽입/삭제 버튼
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.insertAbove", "testcase", "위에 추가 버튼", "위에 추가");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.insertBelow", "testcase", "아래에 추가 버튼", "아래에 추가");
                createTranslationKeyIfNotExists("testcase.spreadsheet.button.delete", "testcase", "삭제 버튼", "삭제");

                // 스프레드시트 추가 컬럼
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.priority", "testcase", "우선순위 컬럼", "우선순위");
                createTranslationKeyIfNotExists("testcase.spreadsheet.column.tags", "testcase", "태그 컬럼", "태그");

                // 입력 모드 선택 접기/펼치기
                createTranslationKeyIfNotExists("testcase.inputMode.title", "testcase", "입력 모드 선택 제목", "입력 모드 선택");
                createTranslationKeyIfNotExists("testcase.inputMode.expand", "testcase", "펼치기", "펼치기");
                createTranslationKeyIfNotExists("testcase.inputMode.collapse", "testcase", "접기", "접기");

                // 사용법 안내 접기/펼치기
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.title", "testcase", "사용법 제목", "사용법");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.expand", "testcase", "펼치기", "펼치기");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.collapse", "testcase", "접기", "접기");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.basicUsage", "testcase", "기본 사용법",
                                "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.folderFunction", "testcase", "폴더 기능 설명",
                                "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.");
                createTranslationKeyIfNotExists("testcase.spreadsheet.usage.stepManagement", "testcase", "스텝 관리 설명",
                                "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).");
        }

        private void createTranslationKeyIfNotExists(String keyName, String category, String description,
                        String defaultValue) {
                Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
                if (existingKey.isEmpty()) {
                        TranslationKey translationKey = new TranslationKey(keyName, category, description,
                                        defaultValue);
                        translationKeyRepository.save(translationKey);
                        log.debug("번역 키 생성: {}", keyName);
                } else {
                        log.debug("번역 키 이미 존재: {}", keyName);
                }
        }
}
