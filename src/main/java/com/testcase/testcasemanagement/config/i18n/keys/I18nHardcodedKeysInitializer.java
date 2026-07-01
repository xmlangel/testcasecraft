// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/I18nHardcodedKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 2026-06-06 프런트엔드 하드코딩 한국어 전수 래핑(t() 적용)에서 신설된 번역 키 712건.
 *
 * <p>산출 근거: .workspace/i18n-audit (에이전트 래핑 + 코드 t() 키 기준 검증 병합).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class I18nHardcodedKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    log.info("i18n 하드코딩 보강 번역 키 초기화 시작 (712건)");

    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiKeyPlaceholder",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "(변경하지 않으려면 비워두세요)");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiUrlHelperOllama",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenai",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기본 URL: https://api.openai.com");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenrouter",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기본 URL: https://openrouter.ai");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenwebui",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "Docker 환경: http://host.docker.internal:3000 | 로컬: http://localhost:3000");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.apiUrlHelperPerplexity",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기본 URL: https://api.perplexity.ai");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.connected", "admin", "i18n 하드코딩 보강 (2026-06-06)", "연결됨");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.connectionFailed", "admin", "i18n 하드코딩 보강 (2026-06-06)", "연결 실패");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.defaultConfigCurrent", "admin", "i18n 하드코딩 보강 (2026-06-06)", "현재 기본 설정");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.modelHelperOllama",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.modelHelperOpenai",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.modelHelperOpenrouter",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예시: anthropic/claude-3.5-sonnet, openai/gpt-4, google/gemini-pro");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.modelHelperOpenwebui",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예시: llama3.1, granite3.1-dense:8b");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.modelHelperPerplexity",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예시: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.setAsDefaultTooltip", "admin", "i18n 하드코딩 보강 (2026-06-06)", "기본 설정으로 지정");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.status.connected", "admin", "i18n 하드코딩 보강 (2026-06-06)", "연결 성공");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.template.description",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "AI에게 테스트 케이스 생성을 요청할 때 이 템플릿을 참고합니다");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragToggleDescription",
        "admin",
        "i18n 하드코딩 보강 (2026-06-06)",
        "RAG(AI) 기능 활성화 토글");
    createTranslationKeyIfNotExists(
        "chat.source.chunk", "chat", "i18n 하드코딩 보강 (2026-06-06)", " - 청크 #{number}");
    createTranslationKeyIfNotExists(
        "chat.source.citation",
        "chat",
        "i18n 하드코딩 보강 (2026-06-06)",
        "[출처{sourceNum}] {baseName}{chunkInfo}");
    createTranslationKeyIfNotExists(
        "common.details", "common", "i18n 하드코딩 보강 (2026-06-06)", "상세 정보");
    createTranslationKeyIfNotExists("common.export", "common", "i18n 하드코딩 보강 (2026-06-06)", "내보내기");
    createTranslationKeyIfNotExists(
        "common.notSpecified", "common", "i18n 하드코딩 보강 (2026-06-06)", "미지정");
    createTranslationKeyIfNotExists("common.retry", "common", "i18n 하드코딩 보강 (2026-06-06)", "다시 시도");
    createTranslationKeyIfNotExists(
        "common.selectLanguage", "common", "i18n 하드코딩 보강 (2026-06-06)", "언어 선택");
    createTranslationKeyIfNotExists(
        "common.unknown", "common", "i18n 하드코딩 보강 (2026-06-06)", "알 수 없는 오류");
    createTranslationKeyIfNotExists(
        "common.unknownError", "common", "i18n 하드코딩 보강 (2026-06-06)", "알 수 없는 오류");
    createTranslationKeyIfNotExists(
        "common.unspecified", "common", "i18n 하드코딩 보강 (2026-06-06)", "미지정");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.assigneeComparison",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실행자별 비교");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.assigneeLimitWarning",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        " (최대 10개까지 선택 가능)");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.assigneeStats",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{cases}건 (완료율 {rate}%)");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.authError",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "인증이 필요합니다. 다시 로그인해주세요.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.autoApplyNote",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "필터 설정이 자동으로 차트에 적용됩니다.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.criterion",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교 기준");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.itemsSelected",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 항목이 선택됨");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.loadError",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "필터 데이터를 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.loadingOptions",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "필터 옵션을 불러오는 중...");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.networkError",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "네트워크 연결을 확인해주세요.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.noProject",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "프로젝트가 선택되지 않았습니다.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.notFoundError",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "프로젝트 데이터를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.overallTrend",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "전체 추이");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.planComparison",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "플랜별 비교");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.planLimitWarning",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        " (최대 5개까지 선택 가능)");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.selectAssignee",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교할 실행자");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.selectAssigneePrompt",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교할 실행자를 선택해주세요 (최대 10개)");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.selectPlanPrompt",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교할 테스트 플랜을 선택해주세요 (최대 5개)");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.selectTestPlan",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교할 테스트 플랜");
    createTranslationKeyIfNotExists(
        "comparisonFilterPanel.title",
        "comparisonFilterPanel",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비교 분석 필터");
    createTranslationKeyIfNotExists(
        "deleteConfirmationDialog.description",
        "deleteConfirmationDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "다음 항목들을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "deleteConfirmationDialog.noItems",
        "deleteConfirmationDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "선택된 항목이 없습니다.");
    createTranslationKeyIfNotExists(
        "deleteConfirmationDialog.title",
        "deleteConfirmationDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제 확인");
    createTranslationKeyIfNotExists(
        "emailVerification.message.invalidLink",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "유효하지 않은 인증 링크입니다.");
    createTranslationKeyIfNotExists(
        "emailVerification.message.processingError",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "인증 처리 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "emailVerification.message.resendInfo",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "재발송 기능은 로그인 후 프로필 설정에서 이용 가능합니다.");
    createTranslationKeyIfNotExists(
        "emailVerification.status.alreadyUsed",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이미 사용됨");
    createTranslationKeyIfNotExists(
        "emailVerification.status.completed",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "인증 완료!");
    createTranslationKeyIfNotExists(
        "emailVerification.status.linkExpired",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "링크 만료");
    createTranslationKeyIfNotExists(
        "emailVerification.status.processing",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이메일 인증 처리 중...");
    createTranslationKeyIfNotExists(
        "emailVerification.status.verificationFailed",
        "emailVerification",
        "i18n 하드코딩 보강 (2026-06-06)",
        "인증 실패");
    createTranslationKeyIfNotExists(
        "exploratory.artifacts.empty",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "업로드된 산출물이 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.bugs.empty", "exploratory", "i18n 하드코딩 보강 (2026-06-06)", "발견된 상세 버그가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.createError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 생성에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.editError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 수정에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.example",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "\"{Target}\"를 대상으로, \"{Resources}\"를 사용해, \"{Information}\"를 찾는다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.networkError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 저장 중 네트워크 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.noProjectInfo",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "프로젝트 정보가 없어 차터를 저장할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charterList.loadError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 목록을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charterList.networkError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 목록을 불러오는 중 네트워크 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.checklist.q1",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 범위 내에서 탐색이 이루어졌는가?");
    createTranslationKeyIfNotExists(
        "exploratory.checklist.q2",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "수행 중 발견된 모든 리스크가 기록되었는가?");
    createTranslationKeyIfNotExists(
        "exploratory.checklist.q3",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버그 재현을 위한 정보 및 증적이 충분한가?");
    createTranslationKeyIfNotExists(
        "exploratory.checklist.q4",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "다음 단계에 대한 제안이 포함되었는가?");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.nextCharterPlaceholder",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "추가 조사가 필요한 영역이나 다음 테스팅 목표를 제안해 주세요.");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.summaryPlaceholder",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차터 달성 여부, 발견된 품질 위험 및 테스팅 총평을 요약해 주세요.");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.leadCommentPlaceholder",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "리뷰 의견을 입력해 주세요...");
    createTranslationKeyIfNotExists(
        "exploratory.file.deleteError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 삭제에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.file.descriptionError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 설명 수정에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.file.uploadError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.noData", "exploratory", "i18n 하드코딩 보강 (2026-06-06)", "기록된 데이터 없음");
    createTranslationKeyIfNotExists(
        "exploratory.notes.empty", "exploratory", "i18n 하드코딩 보강 (2026-06-06)", "기록된 세션 노트가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.actionError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 {action} 요청에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.amendmentError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "보완 요청에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.approveError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 승인에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.deleteError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 삭제에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.deleteErrorOccurred",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 삭제 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.mustSaveFirst",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션을 먼저 저장해야 합니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.noId", "exploratory", "i18n 하드코딩 보강 (2026-06-06)", "세션 ID가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.saveError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.submitError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 제출에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.sessionInfo.loadError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 정보를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.sessionList.loadError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 목록을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.sessionList.networkError",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "세션 목록을 불러오는 중 네트워크 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.testData.empty",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기록된 테스트 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.tests.empty",
        "exploratory",
        "i18n 하드코딩 보강 (2026-06-06)",
        "수행된 구조화된 테스트가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.addDescription",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "설명 추가...");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.coverageScope",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "커버리지 범위");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.environmentActivityDetails",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "환경/설정/활동 상세");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.flowScenario",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "수행 흐름 / 시나리오");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.testDataLabel",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 데이터");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.testDataPlaceholder",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "사용한 테스트 데이터 정보...");
    createTranslationKeyIfNotExists(
        "exploratorySessionEditorTab.testOracleExpectedResult",
        "exploratorySessionEditorTab",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 오라클 / 기대 결과");
    createTranslationKeyIfNotExists(
        "export.column.defectsAndTickets", "export", "i18n 하드코딩 보강 (2026-06-06)", "결함 및 티켓 링크");
    createTranslationKeyIfNotExists(
        "export.export.error", "export", "i18n 하드코딩 보강 (2026-06-06)", "내보내기 오류:");
    createTranslationKeyIfNotExists(
        "export.font.setupError",
        "export",
        "i18n 하드코딩 보강 (2026-06-06)",
        "⚠️ 나눔고딕 폰트 설정 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "globalDocumentManager.chunk", "globalDocumentManager", "i18n 하드코딩 보강 (2026-06-06)", "청크");
    createTranslationKeyIfNotExists(
        "globalDocumentManager.ragDisabled",
        "globalDocumentManager",
        "i18n 하드코딩 보강 (2026-06-06)",
        "시스템 관리자에 의해 RAG 기능이 임시 비활성화되어 있습니다.");
    createTranslationKeyIfNotExists(
        "google.delete.error", "google", "i18n 하드코딩 보강 (2026-06-06)", "삭제 실패:");
    createTranslationKeyIfNotExists(
        "google.settings.loadError", "google", "i18n 하드코딩 보강 (2026-06-06)", "설정 로딩 실패:");
    createTranslationKeyIfNotExists(
        "google.settings.saveError", "google", "i18n 하드코딩 보강 (2026-06-06)", "설정 저장 실패:");
    createTranslationKeyIfNotExists(
        "hierarchical.status.caseCount", "hierarchical", "i18n 하드코딩 보강 (2026-06-06)", "{count}건");
    createTranslationKeyIfNotExists(
        "hierarchical.status.executing", "hierarchical", "i18n 하드코딩 보강 (2026-06-06)", "실행");
    createTranslationKeyIfNotExists(
        "hierarchical.status.passRate",
        "hierarchical",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{passRate}% 통과");
    createTranslationKeyIfNotExists(
        "jira.action.openInJira", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists("jira.active", "jira", "i18n 하드코딩 보강 (2026-06-06)", "활성");
    createTranslationKeyIfNotExists(
        "jira.addNewConfig", "jira", "i18n 하드코딩 보강 (2026-06-06)", "새 설정 추가");
    createTranslationKeyIfNotExists(
        "jira.autoRefresh", "jira", "i18n 하드코딩 보강 (2026-06-06)", "자동 새로고침");
    createTranslationKeyIfNotExists(
        "jira.config.error.authExpired", "jira", "i18n 하드코딩 보강 (2026-06-06)", "🔑 인증 만료");
    createTranslationKeyIfNotExists(
        "jira.config.error.checkFields",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "모든 필드를 올바르게 입력했는지 확인해주세요.");
    createTranslationKeyIfNotExists(
        "jira.config.error.detailLabel", "jira", "i18n 하드코딩 보강 (2026-06-06)", "📋 상세 정보: ");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionConfigContact",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "관리자에게 문의하여 JIRA_ENCRYPTION_KEY 환경변수를 설정하도록 요청하세요.");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionConfigInvalid",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "서버에서 JIRA 암호화 키가 올바르게 설정되지 않았습니다.");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionConfigIssue",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "🔐 암호화 키 설정 문제");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionError",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "🔐 JIRA 암호화 설정 오류");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionNotSet",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "서버에서 JIRA 암호화 키가 설정되지 않았습니다.");
    createTranslationKeyIfNotExists(
        "jira.config.error.encryptionSetupRequired",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "관리자에게 JIRA_ENCRYPTION_KEY 환경변수 설정을 요청하세요.");
    createTranslationKeyIfNotExists(
        "jira.config.error.invalidInput", "jira", "i18n 하드코딩 보강 (2026-06-06)", "📝 입력 데이터 오류");
    createTranslationKeyIfNotExists(
        "jira.config.error.invalidInputDetail",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "입력한 정보에 문제가 있습니다.");
    createTranslationKeyIfNotExists(
        "jira.config.error.loginAgain", "jira", "i18n 하드코딩 보강 (2026-06-06)", "다시 로그인해주세요.");
    createTranslationKeyIfNotExists(
        "jira.config.error.retryOrContact",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "잠시 후 다시 시도하거나 관리자에게 문의하세요.");
    createTranslationKeyIfNotExists(
        "jira.config.error.saveFailed", "jira", "i18n 하드코딩 보강 (2026-06-06)", "저장 실패");
    createTranslationKeyIfNotExists(
        "jira.config.error.serverError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "🚨 서버 오류");
    createTranslationKeyIfNotExists(
        "jira.config.error.serverErrorOccurred",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "서버에서 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "jira.config.error.sessionExpired",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "로그인 세션이 만료되었습니다.");
    createTranslationKeyIfNotExists(
        "jira.config.error.solutionLabel", "jira", "i18n 하드코딩 보강 (2026-06-06)", "💡 해결 방법: ");
    createTranslationKeyIfNotExists(
        "jira.configDeleteConfirm", "jira", "i18n 하드코딩 보강 (2026-06-06)", "이 JIRA 설정을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "jira.configDeleteError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "설정 삭제에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "jira.configList", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 설정 목록 ({count}개)");
    createTranslationKeyIfNotExists(
        "jira.configListDescription",
        "jira",
        "i18n 하드코딩 보강 (2026-06-06)",
        "모든 JIRA 설정을 관리할 수 있습니다");
    createTranslationKeyIfNotExists(
        "jira.configLoadError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 설정을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "jira.configRefreshError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "설정 목록 새로고침에 실패했습니다.");
    createTranslationKeyIfNotExists("jira.connected", "jira", "i18n 하드코딩 보강 (2026-06-06)", "연결됨");
    createTranslationKeyIfNotExists(
        "jira.connectionFailed", "jira", "i18n 하드코딩 보강 (2026-06-06)", "연결 실패");
    createTranslationKeyIfNotExists(
        "jira.connectionRefreshError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "연결 상태 새로고침에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "jira.connectionStatus.title", "jira", "i18n 하드코딩 보강 (2026-06-06)", "현재 JIRA 연결 상태");
    createTranslationKeyIfNotExists(
        "jira.connectionVerified", "jira", "i18n 하드코딩 보강 (2026-06-06)", "연결 확인됨");
    createTranslationKeyIfNotExists(
        "jira.data.refreshError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 데이터 새로고침 실패:");
    createTranslationKeyIfNotExists(
        "jira.deleteConfig", "jira", "i18n 하드코딩 보강 (2026-06-06)", "설정 삭제");
    createTranslationKeyIfNotExists(
        "jira.editConfig", "jira", "i18n 하드코딩 보강 (2026-06-06)", "설정 수정");
    createTranslationKeyIfNotExists(
        "jira.issueList", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 이슈 목록");
    createTranslationKeyIfNotExists(
        "jira.linker.issueExists", "jira", "i18n 하드코딩 보강 (2026-06-06)", "이슈가 존재합니다");
    createTranslationKeyIfNotExists(
        "jira.linker.validationError", "jira", "i18n 하드코딩 보강 (2026-06-06)", "이슈 검증 중 오류가 발생했습니다");
    createTranslationKeyIfNotExists(
        "jira.management.title", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 설정 관리");
    createTranslationKeyIfNotExists(
        "jira.noConfig", "jira", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 설정이 없습니다");
    createTranslationKeyIfNotExists(
        "jira.refreshAll", "jira", "i18n 하드코딩 보강 (2026-06-06)", "전체 새로고침");
    createTranslationKeyIfNotExists(
        "jira.refreshStatus", "jira", "i18n 하드코딩 보강 (2026-06-06)", "연결 상태 새로고침");
    createTranslationKeyIfNotExists(
        "jira.statistics", "jira", "i18n 하드코딩 보강 (2026-06-06)", "통계 및 분석");
    createTranslationKeyIfNotExists(
        "jira.statusChecking", "jira", "i18n 하드코딩 보강 (2026-06-06)", "상태 확인 중...");
    createTranslationKeyIfNotExists(
        "junit.editor.userDefinedDescription", "junit", "i18n 하드코딩 보강 (2026-06-06)", "사용자 정의 설명");
    createTranslationKeyIfNotExists(
        "junit.error.deleteFailed", "junit", "i18n 하드코딩 보강 (2026-06-06)", "삭제 실패: {errorMsg}");
    createTranslationKeyIfNotExists(
        "junit.error.fileTooLarge",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 크기가 너무 큽니다. ({current} / 최대 {max})");
    createTranslationKeyIfNotExists(
        "junit.error.noProjectSelected", "junit", "i18n 하드코딩 보강 (2026-06-06)", "프로젝트가 선택되지 않았습니다.");
    createTranslationKeyIfNotExists(
        "junit.error.uploadFailed", "junit", "i18n 하드코딩 보강 (2026-06-06)", "파일 업로드 실패: {errorMsg}");
    createTranslationKeyIfNotExists(
        "junit.notes.label", "junit", "i18n 하드코딩 보강 (2026-06-06)", "노트 {count}개");
    createTranslationKeyIfNotExists(
        "junit.processing.calculating", "junit", "i18n 하드코딩 보강 (2026-06-06)", "계산 중...");
    createTranslationKeyIfNotExists(
        "junit.processing.completionMessage",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 처리가 성공적으로 완료되었습니다. 테스트 결과를 확인할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "junit.processing.continueBackground", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백그라운드에서 계속");
    createTranslationKeyIfNotExists(
        "junit.processing.errorFetchingProgress",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "진행률을 가져올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "junit.processing.estimatedTime", "junit", "i18n 하드코딩 보강 (2026-06-06)", "예상 처리 시간");
    createTranslationKeyIfNotExists(
        "junit.processing.failureMessage",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 처리 중 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.");
    createTranslationKeyIfNotExists(
        "junit.processing.fileId", "junit", "i18n 하드코딩 보강 (2026-06-06)", "파일 ID");
    createTranslationKeyIfNotExists(
        "junit.processing.lastUpdated", "junit", "i18n 하드코딩 보강 (2026-06-06)", "마지막 업데이트");
    createTranslationKeyIfNotExists(
        "junit.processing.loadingProgress",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "진행률 정보를 불러오는 중...");
    createTranslationKeyIfNotExists(
        "junit.processing.overallProgress", "junit", "i18n 하드코딩 보강 (2026-06-06)", "전체 진행률");
    createTranslationKeyIfNotExists(
        "junit.processing.parsingProgress",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 스위트 파싱: {current}/{total}");
    createTranslationKeyIfNotExists(
        "junit.processing.status", "junit", "i18n 하드코딩 보강 (2026-06-06)", "상태");
    createTranslationKeyIfNotExists(
        "junit.processing.status.completed", "junit", "i18n 하드코딩 보강 (2026-06-06)", "완료");
    createTranslationKeyIfNotExists(
        "junit.processing.status.failed", "junit", "i18n 하드코딩 보강 (2026-06-06)", "실패");
    createTranslationKeyIfNotExists(
        "junit.processing.status.processing", "junit", "i18n 하드코딩 보강 (2026-06-06)", "처리 중");
    createTranslationKeyIfNotExists(
        "junit.processing.step.completed", "junit", "i18n 하드코딩 보강 (2026-06-06)", "처리 완료");
    createTranslationKeyIfNotExists(
        "junit.processing.step.loading", "junit", "i18n 하드코딩 보강 (2026-06-06)", "파일 로딩");
    createTranslationKeyIfNotExists(
        "junit.processing.step.parsing", "junit", "i18n 하드코딩 보강 (2026-06-06)", "XML 파싱");
    createTranslationKeyIfNotExists(
        "junit.processing.step.preparing", "junit", "i18n 하드코딩 보강 (2026-06-06)", "준비 중...");
    createTranslationKeyIfNotExists(
        "junit.processing.step.saving", "junit", "i18n 하드코딩 보강 (2026-06-06)", "데이터 저장");
    createTranslationKeyIfNotExists(
        "junit.processing.step.validating", "junit", "i18n 하드코딩 보강 (2026-06-06)", "데이터 검증");
    createTranslationKeyIfNotExists(
        "junit.processing.steps", "junit", "i18n 하드코딩 보강 (2026-06-06)", "처리 단계");
    createTranslationKeyIfNotExists(
        "junit.processing.title", "junit", "i18n 하드코딩 보강 (2026-06-06)", "대용량 파일 처리 진행 상황");
    createTranslationKeyIfNotExists(
        "junit.version.autoBackup", "junit", "i18n 하드코딩 보강 (2026-06-06)", "자동 백업");
    createTranslationKeyIfNotExists(
        "junit.version.backupCreateDialog", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 생성");
    createTranslationKeyIfNotExists(
        "junit.version.backupCreated", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업이 생성되었습니다.");
    createTranslationKeyIfNotExists(
        "junit.version.backupFiles", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 파일");
    createTranslationKeyIfNotExists(
        "junit.version.backupInfo",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "백업은 버전과 별도로 관리되며, 시스템 장애 시 데이터 복구에 사용됩니다. 정기적인 백업을 통해 데이터 손실을 방지할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "junit.version.backupRecommended", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 권장");
    createTranslationKeyIfNotExists(
        "junit.version.backupTab", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 관리");
    createTranslationKeyIfNotExists(
        "junit.version.backupVersionLabel", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업할 버전");
    createTranslationKeyIfNotExists(
        "junit.version.cancel", "junit", "i18n 하드코딩 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "junit.version.close", "junit", "i18n 하드코딩 보강 (2026-06-06)", "닫기");
    createTranslationKeyIfNotExists(
        "junit.version.compare", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 비교");
    createTranslationKeyIfNotExists(
        "junit.version.compareBtn", "junit", "i18n 하드코딩 보강 (2026-06-06)", "비교");
    createTranslationKeyIfNotExists(
        "junit.version.compareDialog", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 비교");
    createTranslationKeyIfNotExists(
        "junit.version.comparisonResult", "junit", "i18n 하드코딩 보강 (2026-06-06)", "비교 결과");
    createTranslationKeyIfNotExists(
        "junit.version.compression", "junit", "i18n 하드코딩 보강 (2026-06-06)", "압축");
    createTranslationKeyIfNotExists(
        "junit.version.createBackup", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 생성");
    createTranslationKeyIfNotExists(
        "junit.version.createBackupBtn", "junit", "i18n 하드코딩 보강 (2026-06-06)", "백업 생성");
    createTranslationKeyIfNotExists(
        "junit.version.created", "junit", "i18n 하드코딩 보강 (2026-06-06)", "새 버전이 생성되었습니다.");
    createTranslationKeyIfNotExists(
        "junit.version.createdDate", "junit", "i18n 하드코딩 보강 (2026-06-06)", "생성일");
    createTranslationKeyIfNotExists(
        "junit.version.disabled", "junit", "i18n 하드코딩 보강 (2026-06-06)", "비활성화");
    createTranslationKeyIfNotExists(
        "junit.version.enabled", "junit", "i18n 하드코딩 보강 (2026-06-06)", "활성화");
    createTranslationKeyIfNotExists(
        "junit.version.files", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 파일");
    createTranslationKeyIfNotExists(
        "junit.version.firstVersion", "junit", "i18n 하드코딩 보강 (2026-06-06)", "첫 번째 버전");
    createTranslationKeyIfNotExists(
        "junit.version.historyTab", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 히스토리");
    createTranslationKeyIfNotExists(
        "junit.version.latestVersion", "junit", "i18n 하드코딩 보강 (2026-06-06)", "최신 버전");
    createTranslationKeyIfNotExists(
        "junit.version.management", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 관리");
    createTranslationKeyIfNotExists(
        "junit.version.manualCreate", "junit", "i18n 하드코딩 보강 (2026-06-06)", "수동 버전 생성");
    createTranslationKeyIfNotExists(
        "junit.version.newVersion", "junit", "i18n 하드코딩 보강 (2026-06-06)", "새 버전 생성");
    createTranslationKeyIfNotExists(
        "junit.version.noDescription", "junit", "i18n 하드코딩 보강 (2026-06-06)", "설명 없음");
    createTranslationKeyIfNotExists(
        "junit.version.noStoragePermission",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "스토리지 통계를 조회할 권한이 없습니다. (관리자 권한 필요)");
    createTranslationKeyIfNotExists(
        "junit.version.noVersions",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "아직 생성된 버전이 없습니다. 새 버전을 생성해보세요.");
    createTranslationKeyIfNotExists(
        "junit.version.refresh", "junit", "i18n 하드코딩 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists(
        "junit.version.restoreBtn", "junit", "i18n 하드코딩 보강 (2026-06-06)", "복원");
    createTranslationKeyIfNotExists(
        "junit.version.restoreConfirm",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버전 {versionNumber}을 복원하시겠습니까?");
    createTranslationKeyIfNotExists(
        "junit.version.restoreDialog", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전 복원");
    createTranslationKeyIfNotExists(
        "junit.version.restorePath", "junit", "i18n 하드코딩 보강 (2026-06-06)", "복원 경로");
    createTranslationKeyIfNotExists(
        "junit.version.restoreTooltip", "junit", "i18n 하드코딩 보강 (2026-06-06)", "복원");
    createTranslationKeyIfNotExists(
        "junit.version.restored",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버전 {versionNumber}이 성공적으로 복원되었습니다.");
    createTranslationKeyIfNotExists(
        "junit.version.restoredWithWarning",
        "junit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버전 {versionNumber}이 복원되었지만 체크섬 검증에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "junit.version.secondVersion", "junit", "i18n 하드코딩 보강 (2026-06-06)", "두 번째 버전");
    createTranslationKeyIfNotExists(
        "junit.version.settings", "junit", "i18n 하드코딩 보강 (2026-06-06)", "설정 상태");
    createTranslationKeyIfNotExists(
        "junit.version.sizeDiff", "junit", "i18n 하드코딩 보강 (2026-06-06)", "크기 차이");
    createTranslationKeyIfNotExists(
        "junit.version.statsTab", "junit", "i18n 하드코딩 보강 (2026-06-06)", "스토리지 통계");
    createTranslationKeyIfNotExists(
        "junit.version.suggestions", "junit", "i18n 하드코딩 보강 (2026-06-06)", "최적화 제안");
    createTranslationKeyIfNotExists(
        "junit.version.timeDiff", "junit", "i18n 하드코딩 보강 (2026-06-06)", "시간 차이");
    createTranslationKeyIfNotExists(
        "junit.version.totalUsage", "junit", "i18n 하드코딩 보강 (2026-06-06)", "총 사용량");
    createTranslationKeyIfNotExists(
        "junit.version.versionNumber", "junit", "i18n 하드코딩 보강 (2026-06-06)", "버전");
    createTranslationKeyIfNotExists(
        "mail.button.refreshSettings", "mail", "i18n 하드코딩 보강 (2026-06-06)", "설정 새로고침");
    createTranslationKeyIfNotExists(
        "org.error.accessDenied", "org", "i18n 하드코딩 보강 (2026-06-06)", "조직 접근 권한 없음");
    createTranslationKeyIfNotExists(
        "org.error.accessDeniedDescription",
        "org",
        "i18n 하드코딩 보강 (2026-06-06)",
        "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.");
    createTranslationKeyIfNotExists(
        "preset.all.desc", "preset", "i18n 하드코딩 보강 (2026-06-06)", "모든 테스트 결과 표시");
    createTranslationKeyIfNotExists(
        "preset.all.name", "preset", "i18n 하드코딩 보강 (2026-06-06)", "전체 결과");
    createTranslationKeyIfNotExists("preset.apply", "preset", "i18n 하드코딩 보강 (2026-06-06)", "적용");
    createTranslationKeyIfNotExists(
        "preset.cannotDeleteDefault", "preset", "i18n 하드코딩 보강 (2026-06-06)", "기본 프리셋은 삭제할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "preset.defaultLabel", "preset", "i18n 하드코딩 보강 (2026-06-06)", "기본");
    createTranslationKeyIfNotExists("preset.delete", "preset", "i18n 하드코딩 보강 (2026-06-06)", "삭제");
    createTranslationKeyIfNotExists(
        "preset.editDialog.confirm", "preset", "i18n 하드코딩 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "preset.editDialog.title", "preset", "i18n 하드코딩 보강 (2026-06-06)", "프리셋 이름 수정");
    createTranslationKeyIfNotExists(
        "preset.editName", "preset", "i18n 하드코딩 보강 (2026-06-06)", "이름 수정");
    createTranslationKeyIfNotExists(
        "preset.failedOnly.desc", "preset", "i18n 하드코딩 보강 (2026-06-06)", "실패한 테스트 케이스만 표시");
    createTranslationKeyIfNotExists(
        "preset.failedOnly.name", "preset", "i18n 하드코딩 보강 (2026-06-06)", "실패 케이스만");
    createTranslationKeyIfNotExists(
        "preset.loadError", "preset", "i18n 하드코딩 보강 (2026-06-06)", "프리셋을 불러오는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "preset.nameDuplicate", "preset", "i18n 하드코딩 보강 (2026-06-06)", "이미 존재하는 프리셋 이름입니다.");
    createTranslationKeyIfNotExists(
        "preset.nameLabel", "preset", "i18n 하드코딩 보강 (2026-06-06)", "프리셋 이름");
    createTranslationKeyIfNotExists(
        "preset.nameRequired", "preset", "i18n 하드코딩 보강 (2026-06-06)", "프리셋 이름을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "preset.recent7days.desc", "preset", "i18n 하드코딩 보강 (2026-06-06)", "최근 7일간의 테스트 결과");
    createTranslationKeyIfNotExists(
        "preset.recent7days.name", "preset", "i18n 하드코딩 보강 (2026-06-06)", "최근 7일");
    createTranslationKeyIfNotExists(
        "preset.saveCurrentFilter", "preset", "i18n 하드코딩 보강 (2026-06-06)", "현재 필터 저장");
    createTranslationKeyIfNotExists(
        "preset.saveDialog.hint",
        "preset",
        "i18n 하드코딩 보강 (2026-06-06)",
        "현재 설정된 필터 조건이 프리셋으로 저장됩니다.");
    createTranslationKeyIfNotExists(
        "preset.saveDialog.title", "preset", "i18n 하드코딩 보강 (2026-06-06)", "필터 프리셋 저장");
    createTranslationKeyIfNotExists(
        "preset.saveError", "preset", "i18n 하드코딩 보강 (2026-06-06)", "프리셋 저장 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "preset.title", "preset", "i18n 하드코딩 보강 (2026-06-06)", "필터 프리셋");
    createTranslationKeyIfNotExists(
        "preset.userDefined", "preset", "i18n 하드코딩 보강 (2026-06-06)", "사용자 정의 프리셋");
    createTranslationKeyIfNotExists(
        "preset.withJira.desc", "preset", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 이슈가 연결된 테스트 케이스");
    createTranslationKeyIfNotExists(
        "preset.withJira.name", "preset", "i18n 하드코딩 보강 (2026-06-06)", "JIRA 연동");
    createTranslationKeyIfNotExists(
        "projectManager.memberLoadError",
        "projectManager",
        "i18n 하드코딩 보강 (2026-06-06)",
        "멤버 목록 조회 실패");
    createTranslationKeyIfNotExists(
        "rag.analysis.defaultPrompt",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "다음 텍스트를 요약하세요:\n\n{chunk_text}");
    createTranslationKeyIfNotExists(
        "rag.analysis.error.selectConfig",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "LLM 설정을 먼저 선택하고 필수 항목을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.cancel", "rag", "i18n 하드코딩 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.cancelConfirm",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.displayedRows",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{from}-{to} / 전체 {count}개");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.filter.all", "rag", "i18n 하드코딩 보강 (2026-06-06)", "전체");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.loadFailed",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "작업 목록을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.noJobs", "rag", "i18n 하드코딩 보강 (2026-06-06)", "분석 작업이 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.pause", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.refresh", "rag", "i18n 하드코딩 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.resume", "rag", "i18n 하드코딩 보강 (2026-06-06)", "재개");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.rowsPerPage", "rag", "i18n 하드코딩 보강 (2026-06-06)", "페이지당 행 수:");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.status.cancelled", "rag", "i18n 하드코딩 보강 (2026-06-06)", "취소됨");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.status.completed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "완료");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.status.failed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "실패");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.status.paused", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.status.processing", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행중");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.statusFilter", "rag", "i18n 하드코딩 보강 (2026-06-06)", "상태 필터");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.title", "rag", "i18n 하드코딩 보강 (2026-06-06)", "LLM 분석 작업 목록");
    createTranslationKeyIfNotExists(
        "rag.analysisJobList.viewDetails", "rag", "i18n 하드코딩 보강 (2026-06-06)", "상세보기");
    createTranslationKeyIfNotExists(
        "rag.analysisSummaryManager.loadError",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "요약 목록을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisSummaryManager.noAnalysisResults",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisSummaryManager.noResults",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석이 완료되었지만 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.analysisSummaryManager.noResultsError",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석이 완료되었지만 결과 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.batch.actualCost", "rag", "i18n 하드코딩 보강 (2026-06-06)", "실제 사용 비용");
    createTranslationKeyIfNotExists(
        "rag.batch.buttonContinue", "rag", "i18n 하드코딩 보강 (2026-06-06)", "계속");
    createTranslationKeyIfNotExists(
        "rag.batch.buttonPause", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.batch.buttonStop", "rag", "i18n 하드코딩 보강 (2026-06-06)", "중단");
    createTranslationKeyIfNotExists(
        "rag.batch.chunksRemaining",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{remainingChunks} 개 청크 남음");
    createTranslationKeyIfNotExists("rag.batch.continue", "rag", "i18n 하드코딩 보강 (2026-06-06)", "계속");
    createTranslationKeyIfNotExists(
        "rag.batch.continueDesc", "rag", "i18n 하드코딩 보강 (2026-06-06)", "다음 배치 처리");
    createTranslationKeyIfNotExists(
        "rag.batch.info",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "배치 단위 처리가 완료되었습니다. 계속 진행하면 다음 배치가 처리됩니다.");
    createTranslationKeyIfNotExists("rag.batch.pause", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.batch.pauseDesc", "rag", "i18n 하드코딩 보강 (2026-06-06)", "나중에 재개 가능");
    createTranslationKeyIfNotExists(
        "rag.batch.processed",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{processedChunks} / {totalChunks} 청크 처리 완료");
    createTranslationKeyIfNotExists(
        "rag.batch.processing", "rag", "i18n 하드코딩 보강 (2026-06-06)", "처리 중...");
    createTranslationKeyIfNotExists(
        "rag.batch.progress", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행 상황");
    createTranslationKeyIfNotExists(
        "rag.batch.remainingWork", "rag", "i18n 하드코딩 보강 (2026-06-06)", "남은 작업");
    createTranslationKeyIfNotExists("rag.batch.stop", "rag", "i18n 하드코딩 보강 (2026-06-06)", "중단");
    createTranslationKeyIfNotExists(
        "rag.batch.stopDesc", "rag", "i18n 하드코딩 보강 (2026-06-06)", "분석 완전 종료 (지금까지 결과는 보존)");
    createTranslationKeyIfNotExists(
        "rag.batch.title", "rag", "i18n 하드코딩 보강 (2026-06-06)", "배치 처리 완료 - 계속하시겠습니까?");
    createTranslationKeyIfNotExists(
        "rag.batch.tokensUsed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "사용된 토큰");
    createTranslationKeyIfNotExists(
        "rag.batch.totalCost", "rag", "i18n 하드코딩 보강 (2026-06-06)", "누적 비용");
    createTranslationKeyIfNotExists(
        "rag.document.action.download", "rag", "i18n 하드코딩 보강 (2026-06-06)", "다운로드");
    createTranslationKeyIfNotExists(
        "rag.document.action.preview", "rag", "i18n 하드코딩 보강 (2026-06-06)", "미리보기");
    createTranslationKeyIfNotExists(
        "rag.document.chunk.loadError", "rag", "i18n 하드코딩 보강 (2026-06-06)", "청크 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.chunk.loadMoreError",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "추가 청크 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.file.downloadError", "rag", "i18n 하드코딩 보강 (2026-06-06)", "파일 다운로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.global.promoteFailed",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "공통 문서 이동에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.global.requestFailed",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "공통 문서 등록 요청에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.pdf.loadError", "rag", "i18n 하드코딩 보강 (2026-06-06)", "PDF를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.manager.disabled",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "RAG (AI 문서) 기능이 시스템 관리자에 의해 임시 비활성화되었습니다.");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.chunks", "rag", "i18n 하드코딩 보강 (2026-06-06)", "청크");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.description",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이 문서에 대한 LLM 분석이 이미 진행 중이거나 일시정지되어 있습니다.");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.paused", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.processing", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행 중");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.progress", "rag", "i18n 하드코딩 보강 (2026-06-06)", "분석 진행률");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.question", "rag", "i18n 하드코딩 보강 (2026-06-06)", "어떻게 하시겠습니까?");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.restart", "rag", "i18n 하드코딩 보강 (2026-06-06)", "처음부터 시작");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.restartDescription",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기존 진행 내역을 모두 삭제하고 1번 청크부터 다시 분석합니다. (이미 분석된 {count}개 청크의 비용이 다시 발생합니다)");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.resume", "rag", "i18n 하드코딩 보강 (2026-06-06)", "이어서 하기");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.resumeDescription",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "기존 진행 내역을 유지하고 {nextChunk}번 청크부터 계속 분석합니다.");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.status", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행 상태:");
    createTranslationKeyIfNotExists(
        "rag.resumeAnalysis.title", "rag", "i18n 하드코딩 보강 (2026-06-06)", "기존 분석 진행 내역 발견");
    createTranslationKeyIfNotExists(
        "rag.similar.disabled",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "RAG (AI 문서) 기능이 시스템 관리자에 의해 임시 비활성화되었습니다.");
    createTranslationKeyIfNotExists(
        "rag.similar.searchFailed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "검색에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.analysisResults", "rag", "i18n 하드코딩 보강 (2026-06-06)", "LLM 분석 결과 요약");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.analyzedChunks", "rag", "i18n 하드코딩 보강 (2026-06-06)", "분석 완료: {count}개");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.errorMessage",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.notStartedMessage",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.processingMessage",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "LLM 분석이 진행 중입니다. 잠시 후 다시 확인해주세요.");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.title", "rag", "i18n 하드코딩 보강 (2026-06-06)", "LLM 분석 요약 - {name}");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.totalChunks", "rag", "i18n 하드코딩 보강 (2026-06-06)", "총 {count}개 청크");
    createTranslationKeyIfNotExists(
        "rag.summary.dialog.uploadDate", "rag", "i18n 하드코딩 보강 (2026-06-06)", "업로드: {date}");
    createTranslationKeyIfNotExists(
        "rag.summary.empty", "rag", "i18n 하드코딩 보강 (2026-06-06)", "LLM 분석이 완료된 문서가 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.summary.emptyDescription",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "문서를 업로드하고 LLM 분석을 실행해주세요.");
    createTranslationKeyIfNotExists(
        "rag.summary.loading", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 목록을 불러오는 중...");
    createTranslationKeyIfNotExists(
        "rag.summary.pagination.rowsPerPage", "rag", "i18n 하드코딩 보강 (2026-06-06)", "페이지당 행 수:");
    createTranslationKeyIfNotExists(
        "rag.summary.status.cancelled", "rag", "i18n 하드코딩 보강 (2026-06-06)", "취소됨");
    createTranslationKeyIfNotExists(
        "rag.summary.status.completed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "완료");
    createTranslationKeyIfNotExists(
        "rag.summary.status.error", "rag", "i18n 하드코딩 보강 (2026-06-06)", "실패");
    createTranslationKeyIfNotExists(
        "rag.summary.status.notStarted", "rag", "i18n 하드코딩 보강 (2026-06-06)", "미분석");
    createTranslationKeyIfNotExists(
        "rag.summary.status.paused", "rag", "i18n 하드코딩 보강 (2026-06-06)", "일시정지");
    createTranslationKeyIfNotExists(
        "rag.summary.status.processing", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행 중");
    createTranslationKeyIfNotExists(
        "rag.summary.status.unknown", "rag", "i18n 하드코딩 보강 (2026-06-06)", "알 수 없음");
    createTranslationKeyIfNotExists(
        "rag.summary.table.actions", "rag", "i18n 하드코딩 보강 (2026-06-06)", "작업");
    createTranslationKeyIfNotExists(
        "rag.summary.table.chunks", "rag", "i18n 하드코딩 보강 (2026-06-06)", "청크 수");
    createTranslationKeyIfNotExists(
        "rag.summary.table.fileName", "rag", "i18n 하드코딩 보강 (2026-06-06)", "문서명");
    createTranslationKeyIfNotExists(
        "rag.summary.table.progress", "rag", "i18n 하드코딩 보강 (2026-06-06)", "진행률");
    createTranslationKeyIfNotExists(
        "rag.summary.table.status", "rag", "i18n 하드코딩 보강 (2026-06-06)", "상태");
    createTranslationKeyIfNotExists(
        "rag.summary.table.uploadDate", "rag", "i18n 하드코딩 보강 (2026-06-06)", "업로드 일시");
    createTranslationKeyIfNotExists(
        "rag.summary.title", "rag", "i18n 하드코딩 보강 (2026-06-06)", "분석 요약 관리 ({count}개 문서)");
    createTranslationKeyIfNotExists(
        "rag.summary.tooltip.exitFullscreen", "rag", "i18n 하드코딩 보강 (2026-06-06)", "전체화면 종료");
    createTranslationKeyIfNotExists(
        "rag.summary.tooltip.fullscreen", "rag", "i18n 하드코딩 보강 (2026-06-06)", "전체화면");
    createTranslationKeyIfNotExists(
        "rag.summary.tooltip.startAnalysis", "rag", "i18n 하드코딩 보강 (2026-06-06)", "LLM 분석 시작");
    createTranslationKeyIfNotExists(
        "rag.summary.tooltip.viewSummary", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 보기");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.addBtn", "rag", "i18n 하드코딩 보강 (2026-06-06)", "추가");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.cancelBtn", "rag", "i18n 하드코딩 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.contentField", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 내용");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.contentPlaceholder",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "분석 결과를 요약하여 작성해주세요...");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.contentRequired", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 내용을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.editTitle", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 편집");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.newTagField", "rag", "i18n 하드코딩 보강 (2026-06-06)", "새 태그");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.newTitle", "rag", "i18n 하드코딩 보강 (2026-06-06)", "새 요약 작성");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.noTags", "rag", "i18n 하드코딩 보강 (2026-06-06)", "태그가 없습니다");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.private", "rag", "i18n 하드코딩 보강 (2026-06-06)", "비공개");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.privateDesc", "rag", "i18n 하드코딩 보강 (2026-06-06)", "나만 이 요약을 볼 수 있습니다");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.public", "rag", "i18n 하드코딩 보강 (2026-06-06)", "공개");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.publicDesc", "rag", "i18n 하드코딩 보강 (2026-06-06)", "모든 사용자가 이 요약을 볼 수 있습니다");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.saveBtn", "rag", "i18n 하드코딩 보강 (2026-06-06)", "저장");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.saveFailed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "요약 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.saving", "rag", "i18n 하드코딩 보강 (2026-06-06)", "저장 중...");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.tagExists", "rag", "i18n 하드코딩 보강 (2026-06-06)", "이미 추가된 태그입니다.");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.tagPlaceholder",
        "rag",
        "i18n 하드코딩 보강 (2026-06-06)",
        "태그 입력 후 Enter 또는 추가 버튼");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.tagsLabel", "rag", "i18n 하드코딩 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.titleField", "rag", "i18n 하드코딩 보강 (2026-06-06)", "제목");
    createTranslationKeyIfNotExists(
        "rag.summaryEdit.titleRequired", "rag", "i18n 하드코딩 보강 (2026-06-06)", "제목을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "rag.upload.error.uploadFailed", "rag", "i18n 하드코딩 보강 (2026-06-06)", "문서 업로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "ragChatInterface.sendError",
        "ragChatInterface",
        "i18n 하드코딩 보강 (2026-06-06)",
        "메시지 전송에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "rateLimitDialog.retryCountdown",
        "rateLimitDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "재시도 ({countdown}초) / Retry ({countdown}s)");
    createTranslationKeyIfNotExists(
        "rateLimitDialog.retryNow",
        "rateLimitDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "지금 재시도 / Retry now");
    createTranslationKeyIfNotExists(
        "rateLimitDialog.title",
        "rateLimitDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "🚨 요청 제한 초과 / Request Limit Exceeded");
    createTranslationKeyIfNotExists(
        "rateLimitDialog.tooManyRequests",
        "rateLimitDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "동일 IP에서 1초에 60번 이상 요청이 발생했습니다.");
    createTranslationKeyIfNotExists(
        "scheduler.activeStatus", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "활성 상태");
    createTranslationKeyIfNotExists(
        "scheduler.detailsTitle", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "스케줄 상세 정보");
    createTranslationKeyIfNotExists(
        "scheduler.lastUpdated", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "최근 업데이트: {time}");
    createTranslationKeyIfNotExists(
        "scheduler.loadFailed", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "스케줄러 정보를 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "scheduler.normalOperation", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "정상 동작");
    createTranslationKeyIfNotExists(
        "scheduler.timezone", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "서버 시간대");
    createTranslationKeyIfNotExists(
        "scheduler.totalTasks", "scheduler", "i18n 하드코딩 보강 (2026-06-06)", "총 스케줄 작업");
    createTranslationKeyIfNotExists(
        "systemDashboard.independentProject",
        "systemDashboard",
        "i18n 하드코딩 보강 (2026-06-06)",
        "독립 프로젝트");
    createTranslationKeyIfNotExists(
        "testExecution.error.loadFailed",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실행 정보를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.error.saveSuccessBut",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "저장은 성공했으나");
    createTranslationKeyIfNotExists(
        "testExecution.error.startFailed",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실행 시작 중 오류");
    createTranslationKeyIfNotExists(
        "testExecution.error.status", "testExecution", "i18n 하드코딩 보강 (2026-06-06)", "상태");
    createTranslationKeyIfNotExists(
        "testExecution.error.testPlanFetchFailed",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "API에서 테스트플랜 조회 실패");
    createTranslationKeyIfNotExists(
        "testExecution.error.testPlanNotFound",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 플랜을 찾을 수 없습니다");
    createTranslationKeyIfNotExists(
        "testExecution.error.unknown", "testExecution", "i18n 하드코딩 보강 (2026-06-06)", "알 수 없는 오류");
    createTranslationKeyIfNotExists(
        "testExecution.form.fullPageNavError",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "전체 화면 네비게이션 실패: projectId, executionId, testCaseId 중 하나가 없습니다");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.deleteError",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제 실패");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.deleteErrorOccurred",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.deleteSuccess",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 결과가 삭제되었습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.unknownError",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "알 수 없는 오류");
    createTranslationKeyIfNotExists(
        "testExecution.success.immediateStart",
        "testExecution",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.");
    createTranslationKeyIfNotExists(
        "testResult.chart.cases", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "건");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.advancedFilter",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "고급 필터");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.advancedSearchOptions",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "복합 검색 옵션");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.avgExecutionTime",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "평균 실행시간");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.cachedItems",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "캐시된 항목: {size}/10");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.caseSensitive",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "대소문자 구분");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.clearCache", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "캐시 초기화");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnExecutedAt",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실행 일시");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnExecutor", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "실행자");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnFolderPath",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "폴더 경로");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnNotes", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "비고");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnResult", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "결과");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.columnTestCase",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.custom", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "사용자 정의");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.dateRange", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "날짜 범위");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.endDate", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "종료 날짜");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.exactMatch", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "완전 일치");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.excludeTerms",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "제외할 검색어");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.excludeTermsHelper",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이 단어들이 포함된 결과는 제외됩니다");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.excludeTermsPlaceholder",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "쉼표로 구분하여 입력");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.executionRate", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "실행률");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.filterApplied",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "필터 적용됨");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.hasJiraIssue",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈 연결됨");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.hasNotes", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "비고 있음");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.lazyLoading", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "지연 로딩");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.minutesUnit", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "분");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.noResults",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "조건에 맞는 테스트 결과가 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.passRate", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "통과율");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.performanceOptimization",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "성능 최적화");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.recentDays",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "최근 7일 이내");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.resetFilter", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "필터 초기화");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.resultLabel", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "테스트 결과");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.searchLabel", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "통합 검색");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.startDate", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "시작 날짜");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.thisMonth", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "이번 달");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.thisWeek", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "이번 주");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.title", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "상세 리포트");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.today", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "오늘");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.totalTestCases",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "총 테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.useRegex", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "정규표현식 사용");
    createTranslationKeyIfNotExists(
        "testResult.detailReport.virtualScrolling",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "가상 스크롤링");
    createTranslationKeyIfNotExists(
        "testResult.error.fileUploadError",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.error.uploadErrorDetail",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testResult.error.uploadFailed",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드 실패: {filename}");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.executedValue",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}건 실행됨");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.jiraLinkedValue",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}건");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.passValue",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}건 통과됨");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.totalValue",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}건");
    createTranslationKeyIfNotExists(
        "testResult.form.detectedIssues", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "감지된 이슈:");
    createTranslationKeyIfNotExists(
        "testResult.form.jiraCommentTooltip",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈에 테스트 결과 코멘트 추가");
    createTranslationKeyIfNotExists(
        "testResult.header.saveError", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "자동 저장 실패");
    createTranslationKeyIfNotExists(
        "testResult.header.saveFailed", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "자동 저장 실패");
    createTranslationKeyIfNotExists(
        "testResult.header.saved", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "저장됨");
    createTranslationKeyIfNotExists(
        "testResult.header.saving", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "저장 중...");
    createTranslationKeyIfNotExists(
        "testResult.pieChart.totalCaseCountWithCount",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{label}: {count}건");
    createTranslationKeyIfNotExists(
        "testResultDashboard.chart.executionCount",
        "testResultDashboard",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 실행");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.active", "testResultEdit", "i18n 하드코딩 보강 (2026-06-06)", "활성");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.apply", "testResultEdit", "i18n 하드코딩 보강 (2026-06-06)", "적용");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.applyFailed",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집본 적용 실패");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.approve", "testResultEdit", "i18n 하드코딩 보강 (2026-06-06)", "승인");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.approveFailed",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집본 승인 처리 실패");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.loadFailed",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "권한 데이터 로드 실패");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.myEdits",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "내 편집본");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.myEditsTab",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "내 편집본");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.noMyEdits",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "생성한 편집본이 없습니다.");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.noPendingEdits",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 대기 중인 편집본이 없습니다.");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.pendingApprovals",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 대기 중인 편집본");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.pendingTab",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 대기");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.reject", "testResultEdit", "i18n 하드코딩 보강 (2026-06-06)", "거부");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.statistics",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 통계");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.statisticsTab",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "통계");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.testCase",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트케이스");
    createTranslationKeyIfNotExists(
        "testResultEdit.permissions.title",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 권한 관리");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.applied", "testResultEdit", "i18n 하드코딩 보강 (2026-06-06)", "적용됨");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.approvalRate",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인율");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.approved",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인됨: {count}");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.detailed",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "상세 통계");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.draft",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "임시저장: {count}");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.pending",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 대기");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.rejected",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "거부됨: {count}");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.reverted",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "되돌림: {count}");
    createTranslationKeyIfNotExists(
        "testResultEdit.statistics.totalEdits",
        "testResultEdit",
        "i18n 하드코딩 보강 (2026-06-06)",
        "전체 편집본");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.activeEditExists",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "활성 편집본({name})이 존재합니다.");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.add", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "추가");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.addTag",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "태그 추가");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.apply", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "적용");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.approve", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "승인");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.blocked",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "차단됨 (BLOCKED)");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editContent",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 내용");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editHistory",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 이력");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editHistoryToggle",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 이력 {action}");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editReasonLabel",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 이유");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editReasonPlaceholder",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집하는 이유를 입력해주세요...");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.editReasonRequired",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 이유는 필수입니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.fail",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실패 (FAIL)");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraId",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA ID");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueExists",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이슈가 존재합니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueInvalid",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "존재하지 않는 JIRA 이슈입니다: {msg}");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueKey",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈 키");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueKeyExample",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예: PRJ-123");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueKeyHelper",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈 키를 입력하면 존재 여부를 확인합니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueNotFound",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이슈를 찾을 수 없습니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueUrl",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈 URL");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraValidationError",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이슈 검증 중 오류가 발생했습니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraValidationFailed",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "JIRA 이슈 검증 실패: {msg}");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.noEditHistory",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "편집 이력이 없습니다.");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.noEditPermission",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "현재 편집 권한이 없습니다.");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.none", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "없음");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.noneAlt", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "없음");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.notRun",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "실행 안됨 (NOT_RUN)");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.notes", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "비고");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.notesLabel",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "비고");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.originalData",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "원본 데이터");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.pass",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "통과 (PASS)");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.reject", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "거부");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.requestApproval",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 요청");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.requestApprovalDescription",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "승인 요청하면 관리자의 승인 후 적용됩니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.result", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "결과");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.revert", "testResultEditDialog", "i18n 하드코딩 보강 (2026-06-06)", "되돌리기");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.saveAsDraft",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "임시저장");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.saveAsDraftDescription",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "임시저장하면 나중에 계속 편집할 수 있습니다");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.testCaseName",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트케이스명");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.testCaseNameLabel",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트케이스명");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.testResultLabel",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 결과");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.title",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 결과 편집");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.unknown",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "알 수 없음");
    createTranslationKeyIfNotExists(
        "testcase.details.executedAt", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실행 일시");
    createTranslationKeyIfNotExists(
        "testcase.details.executor", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실행자");
    createTranslationKeyIfNotExists(
        "testcase.details.folderPath", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "폴더 경로");
    createTranslationKeyIfNotExists(
        "testcase.details.result", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실행 결과");
    createTranslationKeyIfNotExists(
        "testcase.details.title", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "테스트 케이스 상세 정보");
    createTranslationKeyIfNotExists(
        "testcase.dragMultiple", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "{name} 외 {count}개");
    createTranslationKeyIfNotExists(
        "testcase.dragToMove", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "드래그해서 위치 이동");
    createTranslationKeyIfNotExists(
        "testcase.filter.activeFilters", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "활성 필터:");
    createTranslationKeyIfNotExists(
        "testcase.filter.allOption", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "전체");
    createTranslationKeyIfNotExists(
        "testcase.filter.createdDateFrom", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "생성일 시작");
    createTranslationKeyIfNotExists(
        "testcase.filter.createdDateTo", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "생성일 종료");
    createTranslationKeyIfNotExists(
        "testcase.filter.hasResults", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실행 결과 있음");
    createTranslationKeyIfNotExists(
        "testcase.filter.hasSteps", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "테스트 단계 있음");
    createTranslationKeyIfNotExists(
        "testcase.filter.priority.high", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "높음");
    createTranslationKeyIfNotExists(
        "testcase.filter.priority.low", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "낮음");
    createTranslationKeyIfNotExists(
        "testcase.filter.priority.medium", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "보통");
    createTranslationKeyIfNotExists(
        "testcase.filter.priorityChip", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "우선순위: {label}");
    createTranslationKeyIfNotExists(
        "testcase.filter.priorityLabel", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testcase.filter.projectLabel", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "프로젝트");
    createTranslationKeyIfNotExists(
        "testcase.filter.projectsChip", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "프로젝트: {count}개");
    createTranslationKeyIfNotExists(
        "testcase.filter.resetButton", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "필터 초기화");
    createTranslationKeyIfNotExists(
        "testcase.filter.status.fail", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실패");
    createTranslationKeyIfNotExists(
        "testcase.filter.status.pass", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "통과");
    createTranslationKeyIfNotExists(
        "testcase.filter.status.pending", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "대기");
    createTranslationKeyIfNotExists(
        "testcase.filter.status.skip", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "건너뜀");
    createTranslationKeyIfNotExists(
        "testcase.filter.statusLabel", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "실행 상태");
    createTranslationKeyIfNotExists(
        "testcase.filter.tagLabel", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "testcase.filter.tagPlaceholder", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "태그를 선택하세요...");
    createTranslationKeyIfNotExists(
        "testcase.filter.tagsChip", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "태그: {count}개");
    createTranslationKeyIfNotExists(
        "testcase.filter.type.folder", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "폴더");
    createTranslationKeyIfNotExists(
        "testcase.filter.type.systemFolder", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "시스템 폴더");
    createTranslationKeyIfNotExists(
        "testcase.filter.type.testcase", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "테스트케이스");
    createTranslationKeyIfNotExists(
        "testcase.filter.typeChip", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "유형: {label}");
    createTranslationKeyIfNotExists(
        "testcase.filter.typeLabel", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "유형");
    createTranslationKeyIfNotExists(
        "testcase.filter.updatedDateFrom", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "수정일 시작");
    createTranslationKeyIfNotExists(
        "testcase.filter.updatedDateTo", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "수정일 종료");
    createTranslationKeyIfNotExists(
        "testcase.message.confirmTagCleanup",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이전 폴더의 태그 [{tags}]를 삭제하시겠습니까?\n'예'를 선택하면 해당 태그가 삭제되고, '아니오'를 선택하면 유지됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.noParent", "testcase", "i18n 하드코딩 보강 (2026-06-06)", "상위없음");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.batchSavePartialFailure",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "⚠️ 배치 저장 부분 실패:\n✅ 성공: {success}개\n❌ 실패: {failure}개");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.batchSaveSuccess",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "✅ 배치 저장 완료: 폴더 {folders}개, 테스트케이스 {testcases}개");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.deleteError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "항목 삭제 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.deleteRowsTooltip",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 행 삭제");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.errorsTitle",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "🚨 해결이 필요한 오류");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.excelExportError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "Excel 내보내기 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.folderAdded",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "폴더 \"{folderName}\"이 추가되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.folderNameFormat",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{name} 폴더");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.insertAboveTooltip",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{row}번 행 위에 추가");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.insertBelowTooltip",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{row}번 행 아래에 추가");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.loadingData",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트케이스 데이터를 불러오고 있습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.noValidItemsToDelete",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제할 유효한 항목이 없습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.pdfExportError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "PDF 내보내기 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.refreshError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "새로고침 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.refreshSuccess",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "최신 데이터로 새로고침되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.renderError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "스프레드시트 렌더링 오류");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.rowsAddedAbove",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{rowNum}번 행 위에 {count}개 새 행이 추가되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.rowsAddedBelow",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{rowNum}번 행 아래에 {count}개 새 행이 추가되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.rowsAddedBottom",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 행이 맨 아래에 추가되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.rowsDeleted",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 행이 삭제되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.saveError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "저장 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.selectRowFirst",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "행을 먼저 선택해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.selectRowFirstTooltip",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "행을 먼저 선택하세요");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.selectRowToDelete",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제할 행을 선택해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.stepCountChanged",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "스텝 수가 {count}개로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validationError",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "검증 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validationFailedTitle",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "⚠️ 데이터 검증 실패");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validationFailure",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "검증 완료: {errors}개 오류, {warnings}개 경고 발견");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validationSuccess",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "검증 완료: 모든 데이터가 유효합니다 ({rows}개 행)");
    createTranslationKeyIfNotExists(
        "testcase.tree.error.conflictingPositions",
        "testcase",
        "i18n 하드코딩 보강 (2026-06-06)",
        "beforeId와 afterId는 동시에 지정할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.closeButton",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "닫기");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.deleteConfirm",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이 파일을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.deleteError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 삭제에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.deleteTooltip",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "삭제");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.descriptionLabel",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 설명 (선택사항)");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.descriptionPlaceholder",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이 파일에 대한 간단한 설명을 입력하세요");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.downloadError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 다운로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.downloadToPreview",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일을 다운로드하여 확인해주세요.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.downloadTooltip",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "다운로드");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.fetchError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "첨부파일 목록을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.imageLoadError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이미지를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.loadingFile",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일을 불러오는 중...");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.noFiles",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "첨부된 파일이 없습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.pdfLoadError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "PDF를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.previewDownloadButton",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "다운로드");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.previewTooltip",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "미리보기");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.selectedFile",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "선택한 파일");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableAction",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "작업");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableFileName",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일명");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableSize", "testcaseAttachments", "i18n 하드코딩 보강 (2026-06-06)", "크기");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableType", "testcaseAttachments", "i18n 하드코딩 보강 (2026-06-06)", "종류");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableUploadTime",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "업로드 일시");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.tableUploadedBy",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "업로드자");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.textFileLoadError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "텍스트 파일을 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.title", "testcaseAttachments", "i18n 하드코딩 보강 (2026-06-06)", "첨부파일");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.unsupportedFormat",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "미리보기를 지원하지 않는 파일 형식입니다");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.uploadButton",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.uploadDialogTitle",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.uploadError",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "파일 업로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.uploading",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "업로드 중...");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.uploadingButton",
        "testcaseAttachments",
        "i18n 하드코딩 보강 (2026-06-06)",
        "업로드 중...");
    createTranslationKeyIfNotExists(
        "testresult.notExecuted", "testresult", "i18n 하드코딩 보강 (2026-06-06)", "미실행");
    createTranslationKeyIfNotExists(
        "translation.cacheRefreshError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "캐시 초기화 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.cacheRefreshSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "캐시가 성공적으로 초기화되었습니다");
    createTranslationKeyIfNotExists(
        "translation.categoryLabel",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "카테고리: {category}");
    createTranslationKeyIfNotExists(
        "translation.categoryLoadError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "카테고리 목록 로드 실패:");
    createTranslationKeyIfNotExists(
        "translation.completeness", "translation", "i18n 하드코딩 보강 (2026-06-06)", "완성도");
    createTranslationKeyIfNotExists(
        "translation.csvExportError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "CSV 내보내기 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.csvExportSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "CSV 파일이 성공적으로 다운로드되었습니다");
    createTranslationKeyIfNotExists(
        "translation.csvFileRequired",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "CSV 파일을 선택해주세요");
    createTranslationKeyIfNotExists(
        "translation.csvImportError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "CSV 가져오기 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.csvImportErrorDetails",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "오류 세부사항:");
    createTranslationKeyIfNotExists(
        "translation.csvImportMoreErrors",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "그 외 {count}개 오류");
    createTranslationKeyIfNotExists(
        "translation.keyCreateError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키 생성 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.keyCreateSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키가 성공적으로 생성되었습니다");
    createTranslationKeyIfNotExists(
        "translation.keyDeleteConfirm",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "정말로 이 번역 키를 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "translation.keyDeleteError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키 삭제 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.keyDeleteSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키가 성공적으로 삭제되었습니다");
    createTranslationKeyIfNotExists(
        "translation.keyLoadError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키 목록을 로드할 수 없습니다: {error}");
    createTranslationKeyIfNotExists(
        "translation.keyUpdateError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키 업데이트 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.keyUpdateSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 키가 성공적으로 업데이트되었습니다");
    createTranslationKeyIfNotExists(
        "translation.languageCreateError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어 생성 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.languageCreateSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어가 성공적으로 생성되었습니다");
    createTranslationKeyIfNotExists(
        "translation.languageDeleteConfirm",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "정말로 이 언어를 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "translation.languageDeleteError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어 삭제 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.languageDeleteSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어가 성공적으로 삭제되었습니다");
    createTranslationKeyIfNotExists(
        "translation.languageLoadError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어 목록을 로드할 수 없습니다: {error}");
    createTranslationKeyIfNotExists(
        "translation.languageUpdateError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어 업데이트 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.languageUpdateSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "언어가 성공적으로 업데이트되었습니다");
    createTranslationKeyIfNotExists(
        "translation.statisticsLoadError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "통계를 로드할 수 없습니다: {error}");
    createTranslationKeyIfNotExists(
        "translation.translationDeleteConfirm",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "정말로 이 번역을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "translation.translationDeleteError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 삭제 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.translationDeleteSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역이 성공적으로 삭제되었습니다");
    createTranslationKeyIfNotExists(
        "translation.translationLoadError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 목록을 로드할 수 없습니다: {error}");
    createTranslationKeyIfNotExists(
        "translation.translationSaveError",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역 저장 실패: {error}");
    createTranslationKeyIfNotExists(
        "translation.translationSaveSuccess",
        "translation",
        "i18n 하드코딩 보강 (2026-06-06)",
        "번역이 성공적으로 저장되었습니다");
    createTranslationKeyIfNotExists(
        "tree.orphan.description",
        "tree",
        "i18n 하드코딩 보강 (2026-06-06)",
        "상위 폴더가 삭제되거나 접근할 수 없어 길을 잃은 항목들입니다.");
    createTranslationKeyIfNotExists(
        "tree.orphan.name", "tree", "i18n 하드코딩 보강 (2026-06-06)", "[미할당 항목]");
    createTranslationKeyIfNotExists(
        "trend.analysisType.byExecutor", "trend", "i18n 하드코딩 보강 (2026-06-06)", "실행자별");
    createTranslationKeyIfNotExists(
        "trend.analysisType.byTestPlan", "trend", "i18n 하드코딩 보강 (2026-06-06)", "테스트플랜별");
    createTranslationKeyIfNotExists(
        "trend.analysisType.timeline", "trend", "i18n 하드코딩 보강 (2026-06-06)", "시간별 추이");
    createTranslationKeyIfNotExists(
        "trend.common.notSpecified", "trend", "i18n 하드코딩 보강 (2026-06-06)", "미지정");
    createTranslationKeyIfNotExists(
        "trend.dateFormat.yearMonth", "trend", "i18n 하드코딩 보강 (2026-06-06)", "yyyy년 MM월");
    createTranslationKeyIfNotExists(
        "trend.filter.period", "trend", "i18n 하드코딩 보강 (2026-06-06)", "기간");
    createTranslationKeyIfNotExists(
        "trend.filter.unit", "trend", "i18n 하드코딩 보강 (2026-06-06)", "단위");
    createTranslationKeyIfNotExists(
        "trend.grouping.daily", "trend", "i18n 하드코딩 보강 (2026-06-06)", "일별");
    createTranslationKeyIfNotExists(
        "trend.grouping.monthly", "trend", "i18n 하드코딩 보강 (2026-06-06)", "월별");
    createTranslationKeyIfNotExists(
        "trend.grouping.weekly", "trend", "i18n 하드코딩 보강 (2026-06-06)", "주별");
    createTranslationKeyIfNotExists(
        "trend.period.last30days", "trend", "i18n 하드코딩 보강 (2026-06-06)", "최근 30일");
    createTranslationKeyIfNotExists(
        "trend.period.last7days", "trend", "i18n 하드코딩 보강 (2026-06-06)", "최근 7일");
    createTranslationKeyIfNotExists(
        "trend.period.last90days", "trend", "i18n 하드코딩 보강 (2026-06-06)", "최근 90일");
    createTranslationKeyIfNotExists(
        "trend.plan.default", "trend", "i18n 하드코딩 보강 (2026-06-06)", "기본 플랜");
    createTranslationKeyIfNotExists(
        "trend.trendData.refreshError", "trend", "i18n 하드코딩 보강 (2026-06-06)", "트렌드 데이터 새로고침 실패:");
    createTranslationKeyIfNotExists(
        "versionComparison.changeType", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "변경 유형");
    createTranslationKeyIfNotExists(
        "versionComparison.changesCount",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}개 변경");
    createTranslationKeyIfNotExists(
        "versionComparison.closeButton", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "닫기");
    createTranslationKeyIfNotExists(
        "versionComparison.comparing",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버전을 비교하고 있습니다...");
    createTranslationKeyIfNotExists(
        "versionComparison.description", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "설명:");
    createTranslationKeyIfNotExists(
        "versionComparison.expectedResults",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예상 결과:");
    createTranslationKeyIfNotExists(
        "versionComparison.fetchError",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "버전 비교 데이터 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldChanges",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "필드 변경");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldDescription",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "설명");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldExpectedResults",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "예상 결과");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldName", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "테스트 이름");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldPreCondition",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "사전 조건");
    createTranslationKeyIfNotExists(
        "versionComparison.fieldPriority",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "우선순위");
    createTranslationKeyIfNotExists(
        "versionComparison.identicalVersions",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "두 버전이 동일합니다");
    createTranslationKeyIfNotExists(
        "versionComparison.name", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "이름:");
    createTranslationKeyIfNotExists(
        "versionComparison.noChanges",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "변경 사항 없음");
    createTranslationKeyIfNotExists(
        "versionComparison.noDifferences",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "선택한 버전들 간에 차이점이 없습니다.");
    createTranslationKeyIfNotExists(
        "versionComparison.preCondition",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "사전 조건:");
    createTranslationKeyIfNotExists(
        "versionComparison.priority", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "우선순위:");
    createTranslationKeyIfNotExists(
        "versionComparison.showDetails",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "상세 내용 보기");
    createTranslationKeyIfNotExists(
        "versionComparison.stepChanges", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "스텝 변경");
    createTranslationKeyIfNotExists(
        "versionComparison.summary", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "변경 사항 요약");
    createTranslationKeyIfNotExists(
        "versionComparison.testSteps", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "테스트 스텝:");
    createTranslationKeyIfNotExists(
        "versionComparison.testStepsChanges",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "테스트 스텝");
    createTranslationKeyIfNotExists(
        "versionComparison.title", "versionComparison", "i18n 하드코딩 보강 (2026-06-06)", "버전 비교");
    createTranslationKeyIfNotExists(
        "versionComparison.totalChanges",
        "versionComparison",
        "i18n 하드코딩 보강 (2026-06-06)",
        "총 {count}개 변경");
    createTranslationKeyIfNotExists(
        "testResultEditDialog.jiraIssueNotFoundAgain",
        "testResultEditDialog",
        "i18n 하드코딩 보강 (2026-06-06)",
        "이슈를 찾을 수 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.chart.countWithPct",
        "testResult",
        "i18n 하드코딩 보강 (2026-06-06)",
        "{count}건 ({pct}%)");
    createTranslationKeyIfNotExists(
        "testResult.chart.totalCount", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "총 {count}건");
    createTranslationKeyIfNotExists(
        "testResult.chart.countOnly", "testResult", "i18n 하드코딩 보강 (2026-06-06)", "{count}건");
    createTranslationKeyIfNotExists(
        "rag.chat.defaultConfigSuffix", "rag", "i18n 하드코딩 보강 (2026-06-06)", "(기본)");
    createTranslationKeyIfNotExists(
        "header.userMenu.manual", "header", "사용자 매뉴얼 뷰어 (2026-06-06)", "사용자 매뉴얼");
    createTranslationKeyIfNotExists(
        "login.manualLink", "login", "사용자 매뉴얼 뷰어 (2026-06-06)", "사용자 매뉴얼");
    createTranslationKeyIfNotExists(
        "manual.viewer.title", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "사용자 매뉴얼");
    createTranslationKeyIfNotExists(
        "manual.viewer.loading", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "매뉴얼 로딩 중...");
    createTranslationKeyIfNotExists(
        "manual.viewer.error",
        "manual",
        "사용자 매뉴얼 뷰어 (2026-06-06)",
        "매뉴얼을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    createTranslationKeyIfNotExists(
        "manual.viewer.retry", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "다시 시도");
    createTranslationKeyIfNotExists(
        "manual.viewer.print", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "인쇄");
    createTranslationKeyIfNotExists(
        "manual.viewer.relatedGuides", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "관련 가이드");
    createTranslationKeyIfNotExists(
        "manual.viewer.backToManual", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "매뉴얼로 돌아가기");
    createTranslationKeyIfNotExists(
        "manual.viewer.guideError", "manual", "사용자 매뉴얼 뷰어 (2026-06-06)", "가이드 문서를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists("manual.viewer.intro", "manual", "사용자 매뉴얼 뷰어 소개 라벨", "소개");

    // 하드코딩 i18n 정리 (2026-06-30) — 컴포넌트 하드코딩 한국어 t() 래핑 보강
    createTranslationKeyIfNotExists("rag.chat.relatedDocuments", "rag", "RAG 채팅 참고문서 라벨", "참고 문서:");
    createTranslationKeyIfNotExists("rag.chat.similarity", "rag", "RAG 채팅 유사도", "유사도: {percent}%");
    createTranslationKeyIfNotExists("testResult.barChart.title", "testResult", "결과 비교 차트 제목", "테스트 결과 비교");
    createTranslationKeyIfNotExists(
        "testCaseResult.error.executionLoad", "testResult", "실행정보 로드 실패", "테스트 실행 정보를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testCaseResult.error.caseLoad", "testResult", "케이스정보 로드 실패", "테스트케이스 정보를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists("junit.version.compressed", "junit", "버전 압축됨 칩", "압축됨");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.loadError", "testResult", "QA총평 실행정보 로드 실패", "QA 총평용 실행 정보 로드 실패:");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.saveFailed", "testResult", "QA총평 저장 실패", "QA 총평 저장 실패:");
    createTranslationKeyIfNotExists(
        "testResult.error.filteredResultsLoad", "testResult", "필터 결과 로드 실패", "필터링된 테스트 결과를 불러올 수 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.error.resultsLoad", "testResult", "결과 로드 실패", "테스트 결과를 불러올 수 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.error.jiraConfig", "testResult", "JIRA 설정 로드 실패", "JIRA 설정을 불러올 수 없습니다:");
    createTranslationKeyIfNotExists("testResult.defaultValue.root", "testResult", "루트 폴더 표시", "루트");
    createTranslationKeyIfNotExists("testResult.label.editVersion", "testResult", "편집본 라벨", "편집본");
    createTranslationKeyIfNotExists(
        "testcaseAttachments.fetchError", "testcase", "첨부 목록 로드 실패", "첨부파일 목록을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.deleteError", "testcase", "스프레드시트 삭제 오류", "항목 삭제 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validationError", "testcase", "스프레드시트 검증 오류", "검증 중 오류가 발생했습니다: {error}");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.pdfExportError", "testcase", "스프레드시트 PDF 오류", "PDF 내보내기 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testCase.export.noData", "testcase", "내보낼 데이터 없음", "내보낼 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "testCase.export.csvSuccess", "testcase", "CSV 다운로드 성공", "CSV 파일이 다운로드되었습니다: {filename}");
    createTranslationKeyIfNotExists(
        "testCase.export.csvError", "testcase", "CSV 다운로드 오류", "CSV 다운로드 중 오류가 발생했습니다: {message}");
    createTranslationKeyIfNotExists(
        "testCase.export.excelSuccess", "testcase", "Excel 다운로드 성공", "Excel 파일이 다운로드되었습니다: {filename}");
    createTranslationKeyIfNotExists(
        "testCase.export.excelError", "testcase", "Excel 다운로드 오류", "Excel 다운로드 중 오류가 발생했습니다: {message}");

    
    // 유틸 레벨 i18n (2026-06-30)
    createTranslationKeyIfNotExists("error.networkError", "error", "util i18n (2026-06-30)", "네트워크 연결을 확인해주세요.");
    createTranslationKeyIfNotExists("error.authRequired", "error", "util i18n (2026-06-30)", "로그인이 필요하거나 권한이 없습니다.");
    createTranslationKeyIfNotExists("error.validationError", "error", "util i18n (2026-06-30)", "입력한 정보를 확인해주세요.");
    createTranslationKeyIfNotExists("error.serverError", "error", "util i18n (2026-06-30)", "서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    createTranslationKeyIfNotExists("error.unknownError", "error", "util i18n (2026-06-30)", "알 수 없는 오류가 발생했습니다.");
    createTranslationKeyIfNotExists("error.sessionExpired", "error", "util i18n (2026-06-30)", "세션이 만료되었습니다. 다시 로그인해주세요.");
    createTranslationKeyIfNotExists("error.renderingError", "error", "util i18n (2026-06-30)", "화면을 표시하는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists("time.justNow", "time", "util i18n (2026-06-30)", "방금 전");
    createTranslationKeyIfNotExists("time.minutesAgo", "time", "util i18n (2026-06-30)", "{n}분 전");
    createTranslationKeyIfNotExists("time.hoursAgo", "time", "util i18n (2026-06-30)", "{n}시간 전");
    createTranslationKeyIfNotExists("time.daysAgo", "time", "util i18n (2026-06-30)", "{n}일 전");
    createTranslationKeyIfNotExists("time.zeroSeconds", "time", "util i18n (2026-06-30)", "0초");
    createTranslationKeyIfNotExists("time.daysAndHours", "time", "util i18n (2026-06-30)", "{days}일 {hours}시간");
    createTranslationKeyIfNotExists("time.daysOnly", "time", "util i18n (2026-06-30)", "{days}일");
    createTranslationKeyIfNotExists("time.hoursAndMinutes", "time", "util i18n (2026-06-30)", "{hours}시간 {minutes}분");
    createTranslationKeyIfNotExists("time.hoursOnly", "time", "util i18n (2026-06-30)", "{hours}시간");
    createTranslationKeyIfNotExists("time.minutesAndSeconds", "time", "util i18n (2026-06-30)", "{minutes}분 {seconds}초");
    createTranslationKeyIfNotExists("time.minutesOnly", "time", "util i18n (2026-06-30)", "{minutes}분");
    createTranslationKeyIfNotExists("time.secondsOnly", "time", "util i18n (2026-06-30)", "{seconds}초");
    createTranslationKeyIfNotExists("validation.password.required", "validation", "util i18n (2026-06-30)", "비밀번호를 입력해주세요.");
    createTranslationKeyIfNotExists("validation.password.minLength", "validation", "util i18n (2026-06-30)", "비밀번호는 8자 이상이어야 합니다.");
    createTranslationKeyIfNotExists("validation.password.lowercase", "validation", "util i18n (2026-06-30)", "소문자를 포함해야 합니다.");
    createTranslationKeyIfNotExists("validation.password.uppercase", "validation", "util i18n (2026-06-30)", "대문자를 포함해야 합니다.");
    createTranslationKeyIfNotExists("validation.password.number", "validation", "util i18n (2026-06-30)", "숫자를 포함해야 합니다.");
    createTranslationKeyIfNotExists("validation.password.special", "validation", "util i18n (2026-06-30)", "특수문자를 포함해야 합니다.");
    createTranslationKeyIfNotExists("validation.username.required", "validation", "util i18n (2026-06-30)", "사용자명을 입력해주세요.");
    createTranslationKeyIfNotExists("validation.username.minLength", "validation", "util i18n (2026-06-30)", "사용자명은 3자 이상이어야 합니다.");
    createTranslationKeyIfNotExists("validation.username.maxLength", "validation", "util i18n (2026-06-30)", "사용자명은 20자 이하여야 합니다.");
    createTranslationKeyIfNotExists("validation.username.invalidChars", "validation", "util i18n (2026-06-30)", "사용자명은 영문, 숫자, 언더스코어, 하이픈만 사용할 수 있습니다.");
    createTranslationKeyIfNotExists("validation.required.message", "validation", "util i18n (2026-06-30)", "{fieldName}는 필수 입력 항목입니다.");
    createTranslationKeyIfNotExists("validation.length.notString", "validation", "util i18n (2026-06-30)", "{fieldName}는 문자열이어야 합니다.");
    createTranslationKeyIfNotExists("validation.length.tooShort", "validation", "util i18n (2026-06-30)", "{fieldName}는 {minLength}자 이상이어야 합니다.");
    createTranslationKeyIfNotExists("validation.length.tooLong", "validation", "util i18n (2026-06-30)", "{fieldName}는 {maxLength}자 이하여야 합니다.");
    createTranslationKeyIfNotExists("validation.number.notValid", "validation", "util i18n (2026-06-30)", "{fieldName}는 유효한 숫자여야 합니다.");
    createTranslationKeyIfNotExists("validation.number.tooSmall", "validation", "util i18n (2026-06-30)", "{fieldName}는 {min} 이상이어야 합니다.");
    createTranslationKeyIfNotExists("validation.number.tooLarge", "validation", "util i18n (2026-06-30)", "{fieldName}는 {max} 이하여야 합니다.");

    log.info("i18n 하드코딩 보강 번역 키 초기화 완료");
  }

  private void createTranslationKeyIfNotExists(
      String keyName, String category, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      TranslationKey translationKey =
          new TranslationKey(keyName, category, description, defaultValue);
      translationKeyRepository.save(translationKey);
    }
  }
}
