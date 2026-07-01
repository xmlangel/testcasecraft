// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanI18nHardcodedTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 2026-06-06 하드코딩 보강 — ko 번역 (712건). */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanI18nHardcodedTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String languageCode = "ko";
    String createdBy = "system";

    createTranslationIfNotExists(
        "admin.llmConfig.apiKeyPlaceholder", languageCode, "(변경하지 않으려면 비워두세요)", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.apiUrlHelperOllama",
        languageCode,
        "Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenai",
        languageCode,
        "기본 URL: https://api.openai.com",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenrouter",
        languageCode,
        "기본 URL: https://openrouter.ai",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.apiUrlHelperOpenwebui",
        languageCode,
        "Docker 환경: http://host.docker.internal:3000 | 로컬: http://localhost:3000",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.apiUrlHelperPerplexity",
        languageCode,
        "기본 URL: https://api.perplexity.ai",
        createdBy);
    createTranslationIfNotExists("admin.llmConfig.connected", languageCode, "연결됨", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.connectionFailed", languageCode, "연결 실패", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.defaultConfigCurrent", languageCode, "현재 기본 설정", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.modelHelperOllama",
        languageCode,
        "예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.modelHelperOpenai",
        languageCode,
        "예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.modelHelperOpenrouter",
        languageCode,
        "예시: anthropic/claude-3.5-sonnet, openai/gpt-4, google/gemini-pro",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.modelHelperOpenwebui",
        languageCode,
        "예시: llama3.1, granite3.1-dense:8b",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.modelHelperPerplexity",
        languageCode,
        "예시: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.setAsDefaultTooltip", languageCode, "기본 설정으로 지정", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.status.connected", languageCode, "연결 성공", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.description",
        languageCode,
        "AI에게 테스트 케이스 생성을 요청할 때 이 템플릿을 참고합니다",
        createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.ragToggleDescription", languageCode, "RAG(AI) 기능 활성화 토글", createdBy);
    createTranslationIfNotExists("chat.source.chunk", languageCode, " - 청크 #{number}", createdBy);
    createTranslationIfNotExists(
        "chat.source.citation", languageCode, "[출처{sourceNum}] {baseName}{chunkInfo}", createdBy);
    createTranslationIfNotExists("common.details", languageCode, "상세 정보", createdBy);
    createTranslationIfNotExists("common.export", languageCode, "내보내기", createdBy);
    createTranslationIfNotExists("common.notSpecified", languageCode, "미지정", createdBy);
    createTranslationIfNotExists("common.retry", languageCode, "다시 시도", createdBy);
    createTranslationIfNotExists("common.selectLanguage", languageCode, "언어 선택", createdBy);
    createTranslationIfNotExists("common.unknown", languageCode, "알 수 없는 오류", createdBy);
    createTranslationIfNotExists("common.unknownError", languageCode, "알 수 없는 오류", createdBy);
    createTranslationIfNotExists("common.unspecified", languageCode, "미지정", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.assigneeComparison", languageCode, "실행자별 비교", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.assigneeLimitWarning", languageCode, " (최대 10개까지 선택 가능)", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.assigneeStats", languageCode, "{cases}건 (완료율 {rate}%)", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.authError", languageCode, "인증이 필요합니다. 다시 로그인해주세요.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.autoApplyNote", languageCode, "필터 설정이 자동으로 차트에 적용됩니다.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.criterion", languageCode, "비교 기준", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.itemsSelected", languageCode, "{count}개 항목이 선택됨", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.loadError", languageCode, "필터 데이터를 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.loadingOptions", languageCode, "필터 옵션을 불러오는 중...", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.networkError", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.noProject", languageCode, "프로젝트가 선택되지 않았습니다.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.notFoundError", languageCode, "프로젝트 데이터를 찾을 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.overallTrend", languageCode, "전체 추이", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.planComparison", languageCode, "플랜별 비교", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.planLimitWarning", languageCode, " (최대 5개까지 선택 가능)", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.selectAssignee", languageCode, "비교할 실행자", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.selectAssigneePrompt",
        languageCode,
        "비교할 실행자를 선택해주세요 (최대 10개)",
        createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.selectPlanPrompt",
        languageCode,
        "비교할 테스트 플랜을 선택해주세요 (최대 5개)",
        createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.selectTestPlan", languageCode, "비교할 테스트 플랜", createdBy);
    createTranslationIfNotExists(
        "comparisonFilterPanel.title", languageCode, "비교 분석 필터", createdBy);
    createTranslationIfNotExists(
        "deleteConfirmationDialog.description", languageCode, "다음 항목들을 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "deleteConfirmationDialog.noItems", languageCode, "선택된 항목이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "deleteConfirmationDialog.title", languageCode, "삭제 확인", createdBy);
    createTranslationIfNotExists(
        "emailVerification.message.invalidLink", languageCode, "유효하지 않은 인증 링크입니다.", createdBy);
    createTranslationIfNotExists(
        "emailVerification.message.processingError",
        languageCode,
        "인증 처리 중 오류가 발생했습니다.",
        createdBy);
    createTranslationIfNotExists(
        "emailVerification.message.resendInfo",
        languageCode,
        "재발송 기능은 로그인 후 프로필 설정에서 이용 가능합니다.",
        createdBy);
    createTranslationIfNotExists(
        "emailVerification.status.alreadyUsed", languageCode, "이미 사용됨", createdBy);
    createTranslationIfNotExists(
        "emailVerification.status.completed", languageCode, "인증 완료!", createdBy);
    createTranslationIfNotExists(
        "emailVerification.status.linkExpired", languageCode, "링크 만료", createdBy);
    createTranslationIfNotExists(
        "emailVerification.status.processing", languageCode, "이메일 인증 처리 중...", createdBy);
    createTranslationIfNotExists(
        "emailVerification.status.verificationFailed", languageCode, "인증 실패", createdBy);
    createTranslationIfNotExists(
        "exploratory.artifacts.empty", languageCode, "업로드된 산출물이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.bugs.empty", languageCode, "발견된 상세 버그가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.createError", languageCode, "차터 생성에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.editError", languageCode, "차터 수정에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.guide.example",
        languageCode,
        "\"{Target}\"를 대상으로, \"{Resources}\"를 사용해, \"{Information}\"를 찾는다.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.networkError", languageCode, "차터 저장 중 네트워크 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.noProjectInfo",
        languageCode,
        "프로젝트 정보가 없어 차터를 저장할 수 없습니다.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charterList.loadError", languageCode, "차터 목록을 불러오지 못했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charterList.networkError",
        languageCode,
        "차터 목록을 불러오는 중 네트워크 오류가 발생했습니다.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.checklist.q1", languageCode, "차터 범위 내에서 탐색이 이루어졌는가?", createdBy);
    createTranslationIfNotExists(
        "exploratory.checklist.q2", languageCode, "수행 중 발견된 모든 리스크가 기록되었는가?", createdBy);
    createTranslationIfNotExists(
        "exploratory.checklist.q3", languageCode, "버그 재현을 위한 정보 및 증적이 충분한가?", createdBy);
    createTranslationIfNotExists(
        "exploratory.checklist.q4", languageCode, "다음 단계에 대한 제안이 포함되었는가?", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.evaluation.nextCharterPlaceholder",
        languageCode,
        "추가 조사가 필요한 영역이나 다음 테스팅 목표를 제안해 주세요.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.evaluation.summaryPlaceholder",
        languageCode,
        "차터 달성 여부, 발견된 품질 위험 및 테스팅 총평을 요약해 주세요.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.leadCommentPlaceholder", languageCode, "리뷰 의견을 입력해 주세요...", createdBy);
    createTranslationIfNotExists(
        "exploratory.file.deleteError", languageCode, "파일 삭제에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.file.descriptionError", languageCode, "파일 설명 수정에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.file.uploadError", languageCode, "파일 업로드에 실패했습니다.", createdBy);
    createTranslationIfNotExists("exploratory.noData", languageCode, "기록된 데이터 없음", createdBy);
    createTranslationIfNotExists(
        "exploratory.notes.empty", languageCode, "기록된 세션 노트가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.actionError", languageCode, "세션 {action} 요청에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.amendmentError", languageCode, "보완 요청에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.approveError", languageCode, "세션 승인에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.deleteError", languageCode, "세션 삭제에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.deleteErrorOccurred", languageCode, "세션 삭제 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.mustSaveFirst", languageCode, "세션을 먼저 저장해야 합니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.noId", languageCode, "세션 ID가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.saveError", languageCode, "세션 저장에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.submitError", languageCode, "세션 제출에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.sessionInfo.loadError", languageCode, "세션 정보를 불러오지 못했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.sessionList.loadError", languageCode, "세션 목록을 불러오지 못했습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.sessionList.networkError",
        languageCode,
        "세션 목록을 불러오는 중 네트워크 오류가 발생했습니다.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.testData.empty", languageCode, "기록된 테스트 데이터가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratory.tests.empty", languageCode, "수행된 구조화된 테스트가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.addDescription", languageCode, "설명 추가...", createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.coverageScope", languageCode, "커버리지 범위", createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.environmentActivityDetails",
        languageCode,
        "환경/설정/활동 상세",
        createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.flowScenario", languageCode, "수행 흐름 / 시나리오", createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.testDataLabel", languageCode, "테스트 데이터", createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.testDataPlaceholder",
        languageCode,
        "사용한 테스트 데이터 정보...",
        createdBy);
    createTranslationIfNotExists(
        "exploratorySessionEditorTab.testOracleExpectedResult",
        languageCode,
        "테스트 오라클 / 기대 결과",
        createdBy);
    createTranslationIfNotExists(
        "export.column.defectsAndTickets", languageCode, "결함 및 티켓 링크", createdBy);
    createTranslationIfNotExists("export.export.error", languageCode, "내보내기 오류:", createdBy);
    createTranslationIfNotExists(
        "export.font.setupError", languageCode, "⚠️ 나눔고딕 폰트 설정 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists("globalDocumentManager.chunk", languageCode, "청크", createdBy);
    createTranslationIfNotExists(
        "globalDocumentManager.ragDisabled",
        languageCode,
        "시스템 관리자에 의해 RAG 기능이 임시 비활성화되어 있습니다.",
        createdBy);
    createTranslationIfNotExists("google.delete.error", languageCode, "삭제 실패:", createdBy);
    createTranslationIfNotExists("google.settings.loadError", languageCode, "설정 로딩 실패:", createdBy);
    createTranslationIfNotExists("google.settings.saveError", languageCode, "설정 저장 실패:", createdBy);
    createTranslationIfNotExists(
        "hierarchical.status.caseCount", languageCode, "{count}건", createdBy);
    createTranslationIfNotExists("hierarchical.status.executing", languageCode, "실행", createdBy);
    createTranslationIfNotExists(
        "hierarchical.status.passRate", languageCode, "{passRate}% 통과", createdBy);
    createTranslationIfNotExists("jira.action.openInJira", languageCode, "JIRA에서 열기", createdBy);
    createTranslationIfNotExists("jira.active", languageCode, "활성", createdBy);
    createTranslationIfNotExists("jira.addNewConfig", languageCode, "새 설정 추가", createdBy);
    createTranslationIfNotExists("jira.autoRefresh", languageCode, "자동 새로고침", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.authExpired", languageCode, "🔑 인증 만료", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.checkFields", languageCode, "모든 필드를 올바르게 입력했는지 확인해주세요.", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.detailLabel", languageCode, "📋 상세 정보: ", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionConfigContact",
        languageCode,
        "관리자에게 문의하여 JIRA_ENCRYPTION_KEY 환경변수를 설정하도록 요청하세요.",
        createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionConfigInvalid",
        languageCode,
        "서버에서 JIRA 암호화 키가 올바르게 설정되지 않았습니다.",
        createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionConfigIssue", languageCode, "🔐 암호화 키 설정 문제", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionError", languageCode, "🔐 JIRA 암호화 설정 오류", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionNotSet",
        languageCode,
        "서버에서 JIRA 암호화 키가 설정되지 않았습니다.",
        createdBy);
    createTranslationIfNotExists(
        "jira.config.error.encryptionSetupRequired",
        languageCode,
        "관리자에게 JIRA_ENCRYPTION_KEY 환경변수 설정을 요청하세요.",
        createdBy);
    createTranslationIfNotExists(
        "jira.config.error.invalidInput", languageCode, "📝 입력 데이터 오류", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.invalidInputDetail", languageCode, "입력한 정보에 문제가 있습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.loginAgain", languageCode, "다시 로그인해주세요.", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.retryOrContact", languageCode, "잠시 후 다시 시도하거나 관리자에게 문의하세요.", createdBy);
    createTranslationIfNotExists("jira.config.error.saveFailed", languageCode, "저장 실패", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.serverError", languageCode, "🚨 서버 오류", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.serverErrorOccurred", languageCode, "서버에서 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.sessionExpired", languageCode, "로그인 세션이 만료되었습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.config.error.solutionLabel", languageCode, "💡 해결 방법: ", createdBy);
    createTranslationIfNotExists(
        "jira.configDeleteConfirm", languageCode, "이 JIRA 설정을 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "jira.configDeleteError", languageCode, "설정 삭제에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.configList", languageCode, "JIRA 설정 목록 ({count}개)", createdBy);
    createTranslationIfNotExists(
        "jira.configListDescription", languageCode, "모든 JIRA 설정을 관리할 수 있습니다", createdBy);
    createTranslationIfNotExists(
        "jira.configLoadError", languageCode, "JIRA 설정을 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.configRefreshError", languageCode, "설정 목록 새로고침에 실패했습니다.", createdBy);
    createTranslationIfNotExists("jira.connected", languageCode, "연결됨", createdBy);
    createTranslationIfNotExists("jira.connectionFailed", languageCode, "연결 실패", createdBy);
    createTranslationIfNotExists(
        "jira.connectionRefreshError", languageCode, "연결 상태 새로고침에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "jira.connectionStatus.title", languageCode, "현재 JIRA 연결 상태", createdBy);
    createTranslationIfNotExists("jira.connectionVerified", languageCode, "연결 확인됨", createdBy);
    createTranslationIfNotExists(
        "jira.data.refreshError", languageCode, "JIRA 데이터 새로고침 실패:", createdBy);
    createTranslationIfNotExists("jira.deleteConfig", languageCode, "설정 삭제", createdBy);
    createTranslationIfNotExists("jira.editConfig", languageCode, "설정 수정", createdBy);
    createTranslationIfNotExists("jira.issueList", languageCode, "JIRA 이슈 목록", createdBy);
    createTranslationIfNotExists("jira.linker.issueExists", languageCode, "이슈가 존재합니다", createdBy);
    createTranslationIfNotExists(
        "jira.linker.validationError", languageCode, "이슈 검증 중 오류가 발생했습니다", createdBy);
    createTranslationIfNotExists("jira.management.title", languageCode, "JIRA 설정 관리", createdBy);
    createTranslationIfNotExists("jira.noConfig", languageCode, "JIRA 설정이 없습니다", createdBy);
    createTranslationIfNotExists("jira.refreshAll", languageCode, "전체 새로고침", createdBy);
    createTranslationIfNotExists("jira.refreshStatus", languageCode, "연결 상태 새로고침", createdBy);
    createTranslationIfNotExists("jira.statistics", languageCode, "통계 및 분석", createdBy);
    createTranslationIfNotExists("jira.statusChecking", languageCode, "상태 확인 중...", createdBy);
    createTranslationIfNotExists(
        "junit.editor.userDefinedDescription", languageCode, "사용자 정의 설명", createdBy);
    createTranslationIfNotExists(
        "junit.error.deleteFailed", languageCode, "삭제 실패: {errorMsg}", createdBy);
    createTranslationIfNotExists(
        "junit.error.fileTooLarge",
        languageCode,
        "파일 크기가 너무 큽니다. ({current} / 최대 {max})",
        createdBy);
    createTranslationIfNotExists(
        "junit.error.noProjectSelected", languageCode, "프로젝트가 선택되지 않았습니다.", createdBy);
    createTranslationIfNotExists(
        "junit.error.uploadFailed", languageCode, "파일 업로드 실패: {errorMsg}", createdBy);
    createTranslationIfNotExists("junit.notes.label", languageCode, "노트 {count}개", createdBy);
    createTranslationIfNotExists(
        "junit.processing.calculating", languageCode, "계산 중...", createdBy);
    createTranslationIfNotExists(
        "junit.processing.completionMessage",
        languageCode,
        "파일 처리가 성공적으로 완료되었습니다. 테스트 결과를 확인할 수 있습니다.",
        createdBy);
    createTranslationIfNotExists(
        "junit.processing.continueBackground", languageCode, "백그라운드에서 계속", createdBy);
    createTranslationIfNotExists(
        "junit.processing.errorFetchingProgress", languageCode, "진행률을 가져올 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "junit.processing.estimatedTime", languageCode, "예상 처리 시간", createdBy);
    createTranslationIfNotExists(
        "junit.processing.failureMessage",
        languageCode,
        "파일 처리 중 오류가 발생했습니다. 관리자에게 문의하시기 바랍니다.",
        createdBy);
    createTranslationIfNotExists("junit.processing.fileId", languageCode, "파일 ID", createdBy);
    createTranslationIfNotExists(
        "junit.processing.lastUpdated", languageCode, "마지막 업데이트", createdBy);
    createTranslationIfNotExists(
        "junit.processing.loadingProgress", languageCode, "진행률 정보를 불러오는 중...", createdBy);
    createTranslationIfNotExists(
        "junit.processing.overallProgress", languageCode, "전체 진행률", createdBy);
    createTranslationIfNotExists(
        "junit.processing.parsingProgress",
        languageCode,
        "테스트 스위트 파싱: {current}/{total}",
        createdBy);
    createTranslationIfNotExists("junit.processing.status", languageCode, "상태", createdBy);
    createTranslationIfNotExists(
        "junit.processing.status.completed", languageCode, "완료", createdBy);
    createTranslationIfNotExists("junit.processing.status.failed", languageCode, "실패", createdBy);
    createTranslationIfNotExists(
        "junit.processing.status.processing", languageCode, "처리 중", createdBy);
    createTranslationIfNotExists(
        "junit.processing.step.completed", languageCode, "처리 완료", createdBy);
    createTranslationIfNotExists("junit.processing.step.loading", languageCode, "파일 로딩", createdBy);
    createTranslationIfNotExists(
        "junit.processing.step.parsing", languageCode, "XML 파싱", createdBy);
    createTranslationIfNotExists(
        "junit.processing.step.preparing", languageCode, "준비 중...", createdBy);
    createTranslationIfNotExists("junit.processing.step.saving", languageCode, "데이터 저장", createdBy);
    createTranslationIfNotExists(
        "junit.processing.step.validating", languageCode, "데이터 검증", createdBy);
    createTranslationIfNotExists("junit.processing.steps", languageCode, "처리 단계", createdBy);
    createTranslationIfNotExists(
        "junit.processing.title", languageCode, "대용량 파일 처리 진행 상황", createdBy);
    createTranslationIfNotExists("junit.version.autoBackup", languageCode, "자동 백업", createdBy);
    createTranslationIfNotExists(
        "junit.version.backupCreateDialog", languageCode, "백업 생성", createdBy);
    createTranslationIfNotExists(
        "junit.version.backupCreated", languageCode, "백업이 생성되었습니다.", createdBy);
    createTranslationIfNotExists("junit.version.backupFiles", languageCode, "백업 파일", createdBy);
    createTranslationIfNotExists(
        "junit.version.backupInfo",
        languageCode,
        "백업은 버전과 별도로 관리되며, 시스템 장애 시 데이터 복구에 사용됩니다. 정기적인 백업을 통해 데이터 손실을 방지할 수 있습니다.",
        createdBy);
    createTranslationIfNotExists(
        "junit.version.backupRecommended", languageCode, "백업 권장", createdBy);
    createTranslationIfNotExists("junit.version.backupTab", languageCode, "백업 관리", createdBy);
    createTranslationIfNotExists(
        "junit.version.backupVersionLabel", languageCode, "백업할 버전", createdBy);
    createTranslationIfNotExists("junit.version.cancel", languageCode, "취소", createdBy);
    createTranslationIfNotExists("junit.version.close", languageCode, "닫기", createdBy);
    createTranslationIfNotExists("junit.version.compare", languageCode, "버전 비교", createdBy);
    createTranslationIfNotExists("junit.version.compareBtn", languageCode, "비교", createdBy);
    createTranslationIfNotExists("junit.version.compareDialog", languageCode, "버전 비교", createdBy);
    createTranslationIfNotExists(
        "junit.version.comparisonResult", languageCode, "비교 결과", createdBy);
    createTranslationIfNotExists("junit.version.compression", languageCode, "압축", createdBy);
    createTranslationIfNotExists("junit.version.createBackup", languageCode, "백업 생성", createdBy);
    createTranslationIfNotExists("junit.version.createBackupBtn", languageCode, "백업 생성", createdBy);
    createTranslationIfNotExists(
        "junit.version.created", languageCode, "새 버전이 생성되었습니다.", createdBy);
    createTranslationIfNotExists("junit.version.createdDate", languageCode, "생성일", createdBy);
    createTranslationIfNotExists("junit.version.disabled", languageCode, "비활성화", createdBy);
    createTranslationIfNotExists("junit.version.enabled", languageCode, "활성화", createdBy);
    createTranslationIfNotExists("junit.version.files", languageCode, "버전 파일", createdBy);
    createTranslationIfNotExists("junit.version.firstVersion", languageCode, "첫 번째 버전", createdBy);
    createTranslationIfNotExists("junit.version.historyTab", languageCode, "버전 히스토리", createdBy);
    createTranslationIfNotExists("junit.version.latestVersion", languageCode, "최신 버전", createdBy);
    createTranslationIfNotExists("junit.version.management", languageCode, "버전 관리", createdBy);
    createTranslationIfNotExists("junit.version.manualCreate", languageCode, "수동 버전 생성", createdBy);
    createTranslationIfNotExists("junit.version.newVersion", languageCode, "새 버전 생성", createdBy);
    createTranslationIfNotExists("junit.version.noDescription", languageCode, "설명 없음", createdBy);
    createTranslationIfNotExists(
        "junit.version.noStoragePermission",
        languageCode,
        "스토리지 통계를 조회할 권한이 없습니다. (관리자 권한 필요)",
        createdBy);
    createTranslationIfNotExists(
        "junit.version.noVersions", languageCode, "아직 생성된 버전이 없습니다. 새 버전을 생성해보세요.", createdBy);
    createTranslationIfNotExists("junit.version.refresh", languageCode, "새로고침", createdBy);
    createTranslationIfNotExists("junit.version.restoreBtn", languageCode, "복원", createdBy);
    createTranslationIfNotExists(
        "junit.version.restoreConfirm", languageCode, "버전 {versionNumber}을 복원하시겠습니까?", createdBy);
    createTranslationIfNotExists("junit.version.restoreDialog", languageCode, "버전 복원", createdBy);
    createTranslationIfNotExists("junit.version.restorePath", languageCode, "복원 경로", createdBy);
    createTranslationIfNotExists("junit.version.restoreTooltip", languageCode, "복원", createdBy);
    createTranslationIfNotExists(
        "junit.version.restored", languageCode, "버전 {versionNumber}이 성공적으로 복원되었습니다.", createdBy);
    createTranslationIfNotExists(
        "junit.version.restoredWithWarning",
        languageCode,
        "버전 {versionNumber}이 복원되었지만 체크섬 검증에 실패했습니다.",
        createdBy);
    createTranslationIfNotExists("junit.version.secondVersion", languageCode, "두 번째 버전", createdBy);
    createTranslationIfNotExists("junit.version.settings", languageCode, "설정 상태", createdBy);
    createTranslationIfNotExists("junit.version.sizeDiff", languageCode, "크기 차이", createdBy);
    createTranslationIfNotExists("junit.version.statsTab", languageCode, "스토리지 통계", createdBy);
    createTranslationIfNotExists("junit.version.suggestions", languageCode, "최적화 제안", createdBy);
    createTranslationIfNotExists("junit.version.timeDiff", languageCode, "시간 차이", createdBy);
    createTranslationIfNotExists("junit.version.totalUsage", languageCode, "총 사용량", createdBy);
    createTranslationIfNotExists("junit.version.versionNumber", languageCode, "버전", createdBy);
    createTranslationIfNotExists("mail.button.refreshSettings", languageCode, "설정 새로고침", createdBy);
    createTranslationIfNotExists("org.error.accessDenied", languageCode, "조직 접근 권한 없음", createdBy);
    createTranslationIfNotExists(
        "org.error.accessDeniedDescription",
        languageCode,
        "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.",
        createdBy);
    createTranslationIfNotExists("preset.all.desc", languageCode, "모든 테스트 결과 표시", createdBy);
    createTranslationIfNotExists("preset.all.name", languageCode, "전체 결과", createdBy);
    createTranslationIfNotExists("preset.apply", languageCode, "적용", createdBy);
    createTranslationIfNotExists(
        "preset.cannotDeleteDefault", languageCode, "기본 프리셋은 삭제할 수 없습니다.", createdBy);
    createTranslationIfNotExists("preset.defaultLabel", languageCode, "기본", createdBy);
    createTranslationIfNotExists("preset.delete", languageCode, "삭제", createdBy);
    createTranslationIfNotExists("preset.editDialog.confirm", languageCode, "수정", createdBy);
    createTranslationIfNotExists("preset.editDialog.title", languageCode, "프리셋 이름 수정", createdBy);
    createTranslationIfNotExists("preset.editName", languageCode, "이름 수정", createdBy);
    createTranslationIfNotExists(
        "preset.failedOnly.desc", languageCode, "실패한 테스트 케이스만 표시", createdBy);
    createTranslationIfNotExists("preset.failedOnly.name", languageCode, "실패 케이스만", createdBy);
    createTranslationIfNotExists(
        "preset.loadError", languageCode, "프리셋을 불러오는 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "preset.nameDuplicate", languageCode, "이미 존재하는 프리셋 이름입니다.", createdBy);
    createTranslationIfNotExists("preset.nameLabel", languageCode, "프리셋 이름", createdBy);
    createTranslationIfNotExists("preset.nameRequired", languageCode, "프리셋 이름을 입력해주세요.", createdBy);
    createTranslationIfNotExists(
        "preset.recent7days.desc", languageCode, "최근 7일간의 테스트 결과", createdBy);
    createTranslationIfNotExists("preset.recent7days.name", languageCode, "최근 7일", createdBy);
    createTranslationIfNotExists("preset.saveCurrentFilter", languageCode, "현재 필터 저장", createdBy);
    createTranslationIfNotExists(
        "preset.saveDialog.hint", languageCode, "현재 설정된 필터 조건이 프리셋으로 저장됩니다.", createdBy);
    createTranslationIfNotExists("preset.saveDialog.title", languageCode, "필터 프리셋 저장", createdBy);
    createTranslationIfNotExists(
        "preset.saveError", languageCode, "프리셋 저장 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists("preset.title", languageCode, "필터 프리셋", createdBy);
    createTranslationIfNotExists("preset.userDefined", languageCode, "사용자 정의 프리셋", createdBy);
    createTranslationIfNotExists(
        "preset.withJira.desc", languageCode, "JIRA 이슈가 연결된 테스트 케이스", createdBy);
    createTranslationIfNotExists("preset.withJira.name", languageCode, "JIRA 연동", createdBy);
    createTranslationIfNotExists(
        "projectManager.memberLoadError", languageCode, "멤버 목록 조회 실패", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.defaultPrompt", languageCode, "다음 텍스트를 요약하세요:\n\n{chunk_text}", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.selectConfig",
        languageCode,
        "LLM 설정을 먼저 선택하고 필수 항목을 입력해주세요.",
        createdBy);
    createTranslationIfNotExists("rag.analysisJobList.cancel", languageCode, "취소", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.cancelConfirm",
        languageCode,
        "분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.displayedRows", languageCode, "{from}-{to} / 전체 {count}개", createdBy);
    createTranslationIfNotExists("rag.analysisJobList.filter.all", languageCode, "전체", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.loadFailed", languageCode, "작업 목록을 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.noJobs", languageCode, "분석 작업이 없습니다.", createdBy);
    createTranslationIfNotExists("rag.analysisJobList.pause", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists("rag.analysisJobList.refresh", languageCode, "새로고침", createdBy);
    createTranslationIfNotExists("rag.analysisJobList.resume", languageCode, "재개", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.rowsPerPage", languageCode, "페이지당 행 수:", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.status.cancelled", languageCode, "취소됨", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.status.completed", languageCode, "완료", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.status.failed", languageCode, "실패", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.status.paused", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.status.processing", languageCode, "진행중", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.statusFilter", languageCode, "상태 필터", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.title", languageCode, "LLM 분석 작업 목록", createdBy);
    createTranslationIfNotExists(
        "rag.analysisJobList.viewDetails", languageCode, "상세보기", createdBy);
    createTranslationIfNotExists(
        "rag.analysisSummaryManager.loadError", languageCode, "요약 목록을 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.analysisSummaryManager.noAnalysisResults", languageCode, "분석 결과가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.analysisSummaryManager.noResults", languageCode, "분석이 완료되었지만 결과가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.analysisSummaryManager.noResultsError",
        languageCode,
        "분석이 완료되었지만 결과 조회에 실패했습니다.",
        createdBy);
    createTranslationIfNotExists("rag.batch.actualCost", languageCode, "실제 사용 비용", createdBy);
    createTranslationIfNotExists("rag.batch.buttonContinue", languageCode, "계속", createdBy);
    createTranslationIfNotExists("rag.batch.buttonPause", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists("rag.batch.buttonStop", languageCode, "중단", createdBy);
    createTranslationIfNotExists(
        "rag.batch.chunksRemaining", languageCode, "{remainingChunks} 개 청크 남음", createdBy);
    createTranslationIfNotExists("rag.batch.continue", languageCode, "계속", createdBy);
    createTranslationIfNotExists("rag.batch.continueDesc", languageCode, "다음 배치 처리", createdBy);
    createTranslationIfNotExists(
        "rag.batch.info", languageCode, "배치 단위 처리가 완료되었습니다. 계속 진행하면 다음 배치가 처리됩니다.", createdBy);
    createTranslationIfNotExists("rag.batch.pause", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists("rag.batch.pauseDesc", languageCode, "나중에 재개 가능", createdBy);
    createTranslationIfNotExists(
        "rag.batch.processed",
        languageCode,
        "{processedChunks} / {totalChunks} 청크 처리 완료",
        createdBy);
    createTranslationIfNotExists("rag.batch.processing", languageCode, "처리 중...", createdBy);
    createTranslationIfNotExists("rag.batch.progress", languageCode, "진행 상황", createdBy);
    createTranslationIfNotExists("rag.batch.remainingWork", languageCode, "남은 작업", createdBy);
    createTranslationIfNotExists("rag.batch.stop", languageCode, "중단", createdBy);
    createTranslationIfNotExists(
        "rag.batch.stopDesc", languageCode, "분석 완전 종료 (지금까지 결과는 보존)", createdBy);
    createTranslationIfNotExists(
        "rag.batch.title", languageCode, "배치 처리 완료 - 계속하시겠습니까?", createdBy);
    createTranslationIfNotExists("rag.batch.tokensUsed", languageCode, "사용된 토큰", createdBy);
    createTranslationIfNotExists("rag.batch.totalCost", languageCode, "누적 비용", createdBy);
    createTranslationIfNotExists("rag.document.action.download", languageCode, "다운로드", createdBy);
    createTranslationIfNotExists("rag.document.action.preview", languageCode, "미리보기", createdBy);
    createTranslationIfNotExists(
        "rag.document.chunk.loadError", languageCode, "청크 조회에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.document.chunk.loadMoreError", languageCode, "추가 청크 조회에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.document.file.downloadError", languageCode, "파일 다운로드에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteFailed", languageCode, "공통 문서 이동에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestFailed", languageCode, "공통 문서 등록 요청에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.document.pdf.loadError", languageCode, "PDF를 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.manager.disabled",
        languageCode,
        "RAG (AI 문서) 기능이 시스템 관리자에 의해 임시 비활성화되었습니다.",
        createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.chunks", languageCode, "청크", createdBy);
    createTranslationIfNotExists(
        "rag.resumeAnalysis.description",
        languageCode,
        "이 문서에 대한 LLM 분석이 이미 진행 중이거나 일시정지되어 있습니다.",
        createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.paused", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.processing", languageCode, "진행 중", createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.progress", languageCode, "분석 진행률", createdBy);
    createTranslationIfNotExists(
        "rag.resumeAnalysis.question", languageCode, "어떻게 하시겠습니까?", createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.restart", languageCode, "처음부터 시작", createdBy);
    createTranslationIfNotExists(
        "rag.resumeAnalysis.restartDescription",
        languageCode,
        "기존 진행 내역을 모두 삭제하고 1번 청크부터 다시 분석합니다. (이미 분석된 {count}개 청크의 비용이 다시 발생합니다)",
        createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.resume", languageCode, "이어서 하기", createdBy);
    createTranslationIfNotExists(
        "rag.resumeAnalysis.resumeDescription",
        languageCode,
        "기존 진행 내역을 유지하고 {nextChunk}번 청크부터 계속 분석합니다.",
        createdBy);
    createTranslationIfNotExists("rag.resumeAnalysis.status", languageCode, "진행 상태:", createdBy);
    createTranslationIfNotExists(
        "rag.resumeAnalysis.title", languageCode, "기존 분석 진행 내역 발견", createdBy);
    createTranslationIfNotExists(
        "rag.similar.disabled",
        languageCode,
        "RAG (AI 문서) 기능이 시스템 관리자에 의해 임시 비활성화되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchFailed", languageCode, "검색에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.analysisResults", languageCode, "LLM 분석 결과 요약", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.analyzedChunks", languageCode, "분석 완료: {count}개", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.errorMessage", languageCode, "분석 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.notStartedMessage",
        languageCode,
        "아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.",
        createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.processingMessage",
        languageCode,
        "LLM 분석이 진행 중입니다. 잠시 후 다시 확인해주세요.",
        createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.title", languageCode, "LLM 분석 요약 - {name}", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.totalChunks", languageCode, "총 {count}개 청크", createdBy);
    createTranslationIfNotExists(
        "rag.summary.dialog.uploadDate", languageCode, "업로드: {date}", createdBy);
    createTranslationIfNotExists(
        "rag.summary.empty", languageCode, "LLM 분석이 완료된 문서가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "rag.summary.emptyDescription", languageCode, "문서를 업로드하고 LLM 분석을 실행해주세요.", createdBy);
    createTranslationIfNotExists(
        "rag.summary.loading", languageCode, "요약 목록을 불러오는 중...", createdBy);
    createTranslationIfNotExists(
        "rag.summary.pagination.rowsPerPage", languageCode, "페이지당 행 수:", createdBy);
    createTranslationIfNotExists("rag.summary.status.cancelled", languageCode, "취소됨", createdBy);
    createTranslationIfNotExists("rag.summary.status.completed", languageCode, "완료", createdBy);
    createTranslationIfNotExists("rag.summary.status.error", languageCode, "실패", createdBy);
    createTranslationIfNotExists("rag.summary.status.notStarted", languageCode, "미분석", createdBy);
    createTranslationIfNotExists("rag.summary.status.paused", languageCode, "일시정지", createdBy);
    createTranslationIfNotExists("rag.summary.status.processing", languageCode, "진행 중", createdBy);
    createTranslationIfNotExists("rag.summary.status.unknown", languageCode, "알 수 없음", createdBy);
    createTranslationIfNotExists("rag.summary.table.actions", languageCode, "작업", createdBy);
    createTranslationIfNotExists("rag.summary.table.chunks", languageCode, "청크 수", createdBy);
    createTranslationIfNotExists("rag.summary.table.fileName", languageCode, "문서명", createdBy);
    createTranslationIfNotExists("rag.summary.table.progress", languageCode, "진행률", createdBy);
    createTranslationIfNotExists("rag.summary.table.status", languageCode, "상태", createdBy);
    createTranslationIfNotExists("rag.summary.table.uploadDate", languageCode, "업로드 일시", createdBy);
    createTranslationIfNotExists(
        "rag.summary.title", languageCode, "분석 요약 관리 ({count}개 문서)", createdBy);
    createTranslationIfNotExists(
        "rag.summary.tooltip.exitFullscreen", languageCode, "전체화면 종료", createdBy);
    createTranslationIfNotExists("rag.summary.tooltip.fullscreen", languageCode, "전체화면", createdBy);
    createTranslationIfNotExists(
        "rag.summary.tooltip.startAnalysis", languageCode, "LLM 분석 시작", createdBy);
    createTranslationIfNotExists(
        "rag.summary.tooltip.viewSummary", languageCode, "요약 보기", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.addBtn", languageCode, "추가", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.cancelBtn", languageCode, "취소", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.contentField", languageCode, "요약 내용", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.contentPlaceholder", languageCode, "분석 결과를 요약하여 작성해주세요...", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.contentRequired", languageCode, "요약 내용을 입력해주세요.", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.editTitle", languageCode, "요약 편집", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.newTagField", languageCode, "새 태그", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.newTitle", languageCode, "새 요약 작성", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.noTags", languageCode, "태그가 없습니다", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.private", languageCode, "비공개", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.privateDesc", languageCode, "나만 이 요약을 볼 수 있습니다", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.public", languageCode, "공개", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.publicDesc", languageCode, "모든 사용자가 이 요약을 볼 수 있습니다", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.saveBtn", languageCode, "저장", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.saveFailed", languageCode, "요약 저장에 실패했습니다.", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.saving", languageCode, "저장 중...", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.tagExists", languageCode, "이미 추가된 태그입니다.", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.tagPlaceholder", languageCode, "태그 입력 후 Enter 또는 추가 버튼", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.tagsLabel", languageCode, "태그", createdBy);
    createTranslationIfNotExists("rag.summaryEdit.titleField", languageCode, "제목", createdBy);
    createTranslationIfNotExists(
        "rag.summaryEdit.titleRequired", languageCode, "제목을 입력해주세요.", createdBy);
    createTranslationIfNotExists(
        "rag.upload.error.uploadFailed", languageCode, "문서 업로드에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "ragChatInterface.sendError", languageCode, "메시지 전송에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "rateLimitDialog.retryCountdown",
        languageCode,
        "재시도 ({countdown}초) / Retry ({countdown}s)",
        createdBy);
    createTranslationIfNotExists(
        "rateLimitDialog.retryNow", languageCode, "지금 재시도 / Retry now", createdBy);
    createTranslationIfNotExists(
        "rateLimitDialog.title", languageCode, "🚨 요청 제한 초과 / Request Limit Exceeded", createdBy);
    createTranslationIfNotExists(
        "rateLimitDialog.tooManyRequests",
        languageCode,
        "동일 IP에서 1초에 60번 이상 요청이 발생했습니다.",
        createdBy);
    createTranslationIfNotExists("scheduler.activeStatus", languageCode, "활성 상태", createdBy);
    createTranslationIfNotExists("scheduler.detailsTitle", languageCode, "스케줄 상세 정보", createdBy);
    createTranslationIfNotExists(
        "scheduler.lastUpdated", languageCode, "최근 업데이트: {time}", createdBy);
    createTranslationIfNotExists(
        "scheduler.loadFailed", languageCode, "스케줄러 정보를 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists("scheduler.normalOperation", languageCode, "정상 동작", createdBy);
    createTranslationIfNotExists("scheduler.timezone", languageCode, "서버 시간대", createdBy);
    createTranslationIfNotExists("scheduler.totalTasks", languageCode, "총 스케줄 작업", createdBy);
    createTranslationIfNotExists(
        "systemDashboard.independentProject", languageCode, "독립 프로젝트", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.loadFailed", languageCode, "실행 정보를 불러오지 못했습니다.", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.saveSuccessBut", languageCode, "저장은 성공했으나", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.startFailed", languageCode, "실행 시작 중 오류", createdBy);
    createTranslationIfNotExists("testExecution.error.status", languageCode, "상태", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.testPlanFetchFailed", languageCode, "API에서 테스트플랜 조회 실패", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.testPlanNotFound", languageCode, "테스트 플랜을 찾을 수 없습니다", createdBy);
    createTranslationIfNotExists(
        "testExecution.error.unknown", languageCode, "알 수 없는 오류", createdBy);
    createTranslationIfNotExists(
        "testExecution.form.fullPageNavError",
        languageCode,
        "전체 화면 네비게이션 실패: projectId, executionId, testCaseId 중 하나가 없습니다",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.deleteError", languageCode, "삭제 실패", createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.deleteErrorOccurred",
        languageCode,
        "삭제 중 오류가 발생했습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.deleteSuccess", languageCode, "테스트 결과가 삭제되었습니다.", createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.unknownError", languageCode, "알 수 없는 오류", createdBy);
    createTranslationIfNotExists(
        "testExecution.success.immediateStart",
        languageCode,
        "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.",
        createdBy);
    createTranslationIfNotExists("testResult.chart.cases", languageCode, "건", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.advancedFilter", languageCode, "고급 필터", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.advancedSearchOptions", languageCode, "복합 검색 옵션", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.avgExecutionTime", languageCode, "평균 실행시간", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.cachedItems", languageCode, "캐시된 항목: {size}/10", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.caseSensitive", languageCode, "대소문자 구분", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.clearCache", languageCode, "캐시 초기화", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnExecutedAt", languageCode, "실행 일시", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnExecutor", languageCode, "실행자", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnFolderPath", languageCode, "폴더 경로", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnNotes", languageCode, "비고", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnResult", languageCode, "결과", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.columnTestCase", languageCode, "테스트 케이스", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.custom", languageCode, "사용자 정의", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.dateRange", languageCode, "날짜 범위", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.endDate", languageCode, "종료 날짜", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.exactMatch", languageCode, "완전 일치", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.excludeTerms", languageCode, "제외할 검색어", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.excludeTermsHelper",
        languageCode,
        "이 단어들이 포함된 결과는 제외됩니다",
        createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.excludeTermsPlaceholder", languageCode, "쉼표로 구분하여 입력", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.executionRate", languageCode, "실행률", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.filterApplied", languageCode, "필터 적용됨", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.hasJiraIssue", languageCode, "JIRA 이슈 연결됨", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.hasNotes", languageCode, "비고 있음", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.lazyLoading", languageCode, "지연 로딩", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.minutesUnit", languageCode, "분", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.noResults", languageCode, "조건에 맞는 테스트 결과가 없습니다", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.passRate", languageCode, "통과율", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.performanceOptimization", languageCode, "성능 최적화", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.recentDays", languageCode, "최근 7일 이내", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.resetFilter", languageCode, "필터 초기화", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.resultLabel", languageCode, "테스트 결과", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.searchLabel", languageCode, "통합 검색", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.startDate", languageCode, "시작 날짜", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.thisMonth", languageCode, "이번 달", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.thisWeek", languageCode, "이번 주", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.title", languageCode, "상세 리포트", createdBy);
    createTranslationIfNotExists("testResult.detailReport.today", languageCode, "오늘", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.totalTestCases", languageCode, "총 테스트 케이스", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.useRegex", languageCode, "정규표현식 사용", createdBy);
    createTranslationIfNotExists(
        "testResult.detailReport.virtualScrolling", languageCode, "가상 스크롤링", createdBy);
    createTranslationIfNotExists(
        "testResult.error.fileUploadError", languageCode, "파일 업로드 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "testResult.error.uploadErrorDetail",
        languageCode,
        "파일 업로드 중 오류가 발생했습니다: {error}",
        createdBy);
    createTranslationIfNotExists(
        "testResult.error.uploadFailed", languageCode, "파일 업로드 실패: {filename}", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.executedValue", languageCode, "{count}건 실행됨", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.jiraLinkedValue", languageCode, "{count}건", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.passValue", languageCode, "{count}건 통과됨", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.totalValue", languageCode, "{count}건", createdBy);
    createTranslationIfNotExists(
        "testResult.form.detectedIssues", languageCode, "감지된 이슈:", createdBy);
    createTranslationIfNotExists(
        "testResult.form.jiraCommentTooltip", languageCode, "JIRA 이슈에 테스트 결과 코멘트 추가", createdBy);
    createTranslationIfNotExists(
        "testResult.header.saveError", languageCode, "자동 저장 실패", createdBy);
    createTranslationIfNotExists(
        "testResult.header.saveFailed", languageCode, "자동 저장 실패", createdBy);
    createTranslationIfNotExists("testResult.header.saved", languageCode, "저장됨", createdBy);
    createTranslationIfNotExists("testResult.header.saving", languageCode, "저장 중...", createdBy);
    createTranslationIfNotExists(
        "testResult.pieChart.totalCaseCountWithCount",
        languageCode,
        "{label}: {count}건",
        createdBy);
    createTranslationIfNotExists(
        "testResultDashboard.chart.executionCount", languageCode, "{count}개 실행", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.active", languageCode, "활성", createdBy);
    createTranslationIfNotExists("testResultEdit.permissions.apply", languageCode, "적용", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.applyFailed", languageCode, "편집본 적용 실패", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.approve", languageCode, "승인", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.approveFailed", languageCode, "편집본 승인 처리 실패", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.loadFailed", languageCode, "권한 데이터 로드 실패", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.myEdits", languageCode, "내 편집본", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.myEditsTab", languageCode, "내 편집본", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.noMyEdits", languageCode, "생성한 편집본이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.noPendingEdits",
        languageCode,
        "승인 대기 중인 편집본이 없습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.pendingApprovals", languageCode, "승인 대기 중인 편집본", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.pendingTab", languageCode, "승인 대기", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.reject", languageCode, "거부", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.statistics", languageCode, "편집 통계", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.statisticsTab", languageCode, "통계", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.testCase", languageCode, "테스트케이스", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.permissions.title", languageCode, "편집 권한 관리", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.applied", languageCode, "적용됨", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.approvalRate", languageCode, "승인율", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.approved", languageCode, "승인됨: {count}", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.detailed", languageCode, "상세 통계", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.draft", languageCode, "임시저장: {count}", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.pending", languageCode, "승인 대기", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.rejected", languageCode, "거부됨: {count}", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.reverted", languageCode, "되돌림: {count}", createdBy);
    createTranslationIfNotExists(
        "testResultEdit.statistics.totalEdits", languageCode, "전체 편집본", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.activeEditExists", languageCode, "활성 편집본({name})이 존재합니다.", createdBy);
    createTranslationIfNotExists("testResultEditDialog.add", languageCode, "추가", createdBy);
    createTranslationIfNotExists("testResultEditDialog.addTag", languageCode, "태그 추가", createdBy);
    createTranslationIfNotExists("testResultEditDialog.apply", languageCode, "적용", createdBy);
    createTranslationIfNotExists("testResultEditDialog.approve", languageCode, "승인", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.blocked", languageCode, "차단됨 (BLOCKED)", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editContent", languageCode, "편집 내용", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editHistory", languageCode, "편집 이력", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editHistoryToggle", languageCode, "편집 이력 {action}", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editReasonLabel", languageCode, "편집 이유", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editReasonPlaceholder",
        languageCode,
        "편집하는 이유를 입력해주세요...",
        createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.editReasonRequired", languageCode, "편집 이유는 필수입니다", createdBy);
    createTranslationIfNotExists("testResultEditDialog.fail", languageCode, "실패 (FAIL)", createdBy);
    createTranslationIfNotExists("testResultEditDialog.jiraId", languageCode, "JIRA ID", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueExists", languageCode, "이슈가 존재합니다", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueInvalid",
        languageCode,
        "존재하지 않는 JIRA 이슈입니다: {msg}",
        createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueKey", languageCode, "JIRA 이슈 키", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueKeyExample", languageCode, "예: PRJ-123", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueKeyHelper",
        languageCode,
        "JIRA 이슈 키를 입력하면 존재 여부를 확인합니다",
        createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueNotFound", languageCode, "이슈를 찾을 수 없습니다", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueUrl", languageCode, "JIRA 이슈 URL", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraValidationError", languageCode, "이슈 검증 중 오류가 발생했습니다", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraValidationFailed",
        languageCode,
        "JIRA 이슈 검증 실패: {msg}",
        createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.noEditHistory", languageCode, "편집 이력이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.noEditPermission", languageCode, "현재 편집 권한이 없습니다.", createdBy);
    createTranslationIfNotExists("testResultEditDialog.none", languageCode, "없음", createdBy);
    createTranslationIfNotExists("testResultEditDialog.noneAlt", languageCode, "없음", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.notRun", languageCode, "실행 안됨 (NOT_RUN)", createdBy);
    createTranslationIfNotExists("testResultEditDialog.notes", languageCode, "비고", createdBy);
    createTranslationIfNotExists("testResultEditDialog.notesLabel", languageCode, "비고", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.originalData", languageCode, "원본 데이터", createdBy);
    createTranslationIfNotExists("testResultEditDialog.pass", languageCode, "통과 (PASS)", createdBy);
    createTranslationIfNotExists("testResultEditDialog.reject", languageCode, "거부", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.requestApproval", languageCode, "승인 요청", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.requestApprovalDescription",
        languageCode,
        "승인 요청하면 관리자의 승인 후 적용됩니다",
        createdBy);
    createTranslationIfNotExists("testResultEditDialog.result", languageCode, "결과", createdBy);
    createTranslationIfNotExists("testResultEditDialog.revert", languageCode, "되돌리기", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.saveAsDraft", languageCode, "임시저장", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.saveAsDraftDescription",
        languageCode,
        "임시저장하면 나중에 계속 편집할 수 있습니다",
        createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.testCaseName", languageCode, "테스트케이스명", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.testCaseNameLabel", languageCode, "테스트케이스명", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.testResultLabel", languageCode, "테스트 결과", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.title", languageCode, "테스트 결과 편집", createdBy);
    createTranslationIfNotExists("testResultEditDialog.unknown", languageCode, "알 수 없음", createdBy);
    createTranslationIfNotExists("testcase.details.executedAt", languageCode, "실행 일시", createdBy);
    createTranslationIfNotExists("testcase.details.executor", languageCode, "실행자", createdBy);
    createTranslationIfNotExists("testcase.details.folderPath", languageCode, "폴더 경로", createdBy);
    createTranslationIfNotExists("testcase.details.result", languageCode, "실행 결과", createdBy);
    createTranslationIfNotExists(
        "testcase.details.title", languageCode, "테스트 케이스 상세 정보", createdBy);
    createTranslationIfNotExists(
        "testcase.dragMultiple", languageCode, "{name} 외 {count}개", createdBy);
    createTranslationIfNotExists("testcase.dragToMove", languageCode, "드래그해서 위치 이동", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.activeFilters", languageCode, "활성 필터:", createdBy);
    createTranslationIfNotExists("testcase.filter.allOption", languageCode, "전체", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.createdDateFrom", languageCode, "생성일 시작", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.createdDateTo", languageCode, "생성일 종료", createdBy);
    createTranslationIfNotExists("testcase.filter.hasResults", languageCode, "실행 결과 있음", createdBy);
    createTranslationIfNotExists("testcase.filter.hasSteps", languageCode, "테스트 단계 있음", createdBy);
    createTranslationIfNotExists("testcase.filter.priority.high", languageCode, "높음", createdBy);
    createTranslationIfNotExists("testcase.filter.priority.low", languageCode, "낮음", createdBy);
    createTranslationIfNotExists("testcase.filter.priority.medium", languageCode, "보통", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.priorityChip", languageCode, "우선순위: {label}", createdBy);
    createTranslationIfNotExists("testcase.filter.priorityLabel", languageCode, "우선순위", createdBy);
    createTranslationIfNotExists("testcase.filter.projectLabel", languageCode, "프로젝트", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.projectsChip", languageCode, "프로젝트: {count}개", createdBy);
    createTranslationIfNotExists("testcase.filter.resetButton", languageCode, "필터 초기화", createdBy);
    createTranslationIfNotExists("testcase.filter.status.fail", languageCode, "실패", createdBy);
    createTranslationIfNotExists("testcase.filter.status.pass", languageCode, "통과", createdBy);
    createTranslationIfNotExists("testcase.filter.status.pending", languageCode, "대기", createdBy);
    createTranslationIfNotExists("testcase.filter.status.skip", languageCode, "건너뜀", createdBy);
    createTranslationIfNotExists("testcase.filter.statusLabel", languageCode, "실행 상태", createdBy);
    createTranslationIfNotExists("testcase.filter.tagLabel", languageCode, "태그", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.tagPlaceholder", languageCode, "태그를 선택하세요...", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.tagsChip", languageCode, "태그: {count}개", createdBy);
    createTranslationIfNotExists("testcase.filter.type.folder", languageCode, "폴더", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.type.systemFolder", languageCode, "시스템 폴더", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.type.testcase", languageCode, "테스트케이스", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.typeChip", languageCode, "유형: {label}", createdBy);
    createTranslationIfNotExists("testcase.filter.typeLabel", languageCode, "유형", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.updatedDateFrom", languageCode, "수정일 시작", createdBy);
    createTranslationIfNotExists(
        "testcase.filter.updatedDateTo", languageCode, "수정일 종료", createdBy);
    createTranslationIfNotExists(
        "testcase.message.confirmTagCleanup",
        languageCode,
        "이전 폴더의 태그 [{tags}]를 삭제하시겠습니까?\n'예'를 선택하면 해당 태그가 삭제되고, '아니오'를 선택하면 유지됩니다.",
        createdBy);
    createTranslationIfNotExists("testcase.noParent", languageCode, "상위없음", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.batchSavePartialFailure",
        languageCode,
        "⚠️ 배치 저장 부분 실패:\n✅ 성공: {success}개\n❌ 실패: {failure}개",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.batchSaveSuccess",
        languageCode,
        "✅ 배치 저장 완료: 폴더 {folders}개, 테스트케이스 {testcases}개",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.deleteError", languageCode, "항목 삭제 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.deleteRowsTooltip", languageCode, "{count}개 행 삭제", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.errorsTitle", languageCode, "🚨 해결이 필요한 오류", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.excelExportError",
        languageCode,
        "Excel 내보내기 중 오류가 발생했습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.folderAdded",
        languageCode,
        "폴더 \"{folderName}\"이 추가되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.folderNameFormat", languageCode, "{name} 폴더", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.insertAboveTooltip", languageCode, "{row}번 행 위에 추가", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.insertBelowTooltip", languageCode, "{row}번 행 아래에 추가", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.loadingData", languageCode, "테스트케이스 데이터를 불러오고 있습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.noValidItemsToDelete", languageCode, "삭제할 유효한 항목이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.pdfExportError", languageCode, "PDF 내보내기 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.refreshError", languageCode, "새로고침 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.refreshSuccess", languageCode, "최신 데이터로 새로고침되었습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.renderError", languageCode, "스프레드시트 렌더링 오류", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.rowsAddedAbove",
        languageCode,
        "{rowNum}번 행 위에 {count}개 새 행이 추가되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.rowsAddedBelow",
        languageCode,
        "{rowNum}번 행 아래에 {count}개 새 행이 추가되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.rowsAddedBottom",
        languageCode,
        "{count}개 행이 맨 아래에 추가되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.rowsDeleted", languageCode, "{count}개 행이 삭제되었습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.saveError", languageCode, "저장 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.selectRowFirst", languageCode, "행을 먼저 선택해주세요.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.selectRowFirstTooltip", languageCode, "행을 먼저 선택하세요", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.selectRowToDelete", languageCode, "삭제할 행을 선택해주세요.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.stepCountChanged",
        languageCode,
        "스텝 수가 {count}개로 변경되었습니다.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validationError",
        languageCode,
        "검증 중 오류가 발생했습니다: {error}",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validationFailedTitle", languageCode, "⚠️ 데이터 검증 실패", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validationFailure",
        languageCode,
        "검증 완료: {errors}개 오류, {warnings}개 경고 발견",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validationSuccess",
        languageCode,
        "검증 완료: 모든 데이터가 유효합니다 ({rows}개 행)",
        createdBy);
    createTranslationIfNotExists(
        "testcase.tree.error.conflictingPositions",
        languageCode,
        "beforeId와 afterId는 동시에 지정할 수 없습니다.",
        createdBy);
    createTranslationIfNotExists("testcaseAttachments.closeButton", languageCode, "닫기", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.deleteConfirm", languageCode, "이 파일을 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.deleteError", languageCode, "파일 삭제에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.deleteTooltip", languageCode, "삭제", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.descriptionLabel", languageCode, "파일 설명 (선택사항)", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.descriptionPlaceholder",
        languageCode,
        "이 파일에 대한 간단한 설명을 입력하세요",
        createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.downloadError", languageCode, "파일 다운로드에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.downloadToPreview", languageCode, "파일을 다운로드하여 확인해주세요.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.downloadTooltip", languageCode, "다운로드", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.fetchError", languageCode, "첨부파일 목록을 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.imageLoadError", languageCode, "이미지를 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.loadingFile", languageCode, "파일을 불러오는 중...", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.noFiles", languageCode, "첨부된 파일이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.pdfLoadError", languageCode, "PDF를 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.previewDownloadButton", languageCode, "다운로드", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.previewTooltip", languageCode, "미리보기", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.selectedFile", languageCode, "선택한 파일", createdBy);
    createTranslationIfNotExists("testcaseAttachments.tableAction", languageCode, "작업", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.tableFileName", languageCode, "파일명", createdBy);
    createTranslationIfNotExists("testcaseAttachments.tableSize", languageCode, "크기", createdBy);
    createTranslationIfNotExists("testcaseAttachments.tableType", languageCode, "종류", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.tableUploadTime", languageCode, "업로드 일시", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.tableUploadedBy", languageCode, "업로드자", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.textFileLoadError", languageCode, "텍스트 파일을 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists("testcaseAttachments.title", languageCode, "첨부파일", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.unsupportedFormat", languageCode, "미리보기를 지원하지 않는 파일 형식입니다", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.uploadButton", languageCode, "파일 업로드", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.uploadDialogTitle", languageCode, "파일 업로드", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.uploadError", languageCode, "파일 업로드에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.uploading", languageCode, "업로드 중...", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.uploadingButton", languageCode, "업로드 중...", createdBy);
    createTranslationIfNotExists("testresult.notExecuted", languageCode, "미실행", createdBy);
    createTranslationIfNotExists(
        "translation.cacheRefreshError", languageCode, "캐시 초기화 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.cacheRefreshSuccess", languageCode, "캐시가 성공적으로 초기화되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.categoryLabel", languageCode, "카테고리: {category}", createdBy);
    createTranslationIfNotExists(
        "translation.categoryLoadError", languageCode, "카테고리 목록 로드 실패:", createdBy);
    createTranslationIfNotExists("translation.completeness", languageCode, "완성도", createdBy);
    createTranslationIfNotExists(
        "translation.csvExportError", languageCode, "CSV 내보내기 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.csvExportSuccess", languageCode, "CSV 파일이 성공적으로 다운로드되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.csvFileRequired", languageCode, "CSV 파일을 선택해주세요", createdBy);
    createTranslationIfNotExists(
        "translation.csvImportError", languageCode, "CSV 가져오기 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.csvImportErrorDetails", languageCode, "오류 세부사항:", createdBy);
    createTranslationIfNotExists(
        "translation.csvImportMoreErrors", languageCode, "그 외 {count}개 오류", createdBy);
    createTranslationIfNotExists(
        "translation.keyCreateError", languageCode, "번역 키 생성 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.keyCreateSuccess", languageCode, "번역 키가 성공적으로 생성되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.keyDeleteConfirm", languageCode, "정말로 이 번역 키를 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "translation.keyDeleteError", languageCode, "번역 키 삭제 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.keyDeleteSuccess", languageCode, "번역 키가 성공적으로 삭제되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.keyLoadError", languageCode, "번역 키 목록을 로드할 수 없습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.keyUpdateError", languageCode, "번역 키 업데이트 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.keyUpdateSuccess", languageCode, "번역 키가 성공적으로 업데이트되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.languageCreateError", languageCode, "언어 생성 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.languageCreateSuccess", languageCode, "언어가 성공적으로 생성되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.languageDeleteConfirm", languageCode, "정말로 이 언어를 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "translation.languageDeleteError", languageCode, "언어 삭제 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.languageDeleteSuccess", languageCode, "언어가 성공적으로 삭제되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.languageLoadError", languageCode, "언어 목록을 로드할 수 없습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.languageUpdateError", languageCode, "언어 업데이트 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.languageUpdateSuccess", languageCode, "언어가 성공적으로 업데이트되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.statisticsLoadError", languageCode, "통계를 로드할 수 없습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.translationDeleteConfirm", languageCode, "정말로 이 번역을 삭제하시겠습니까?", createdBy);
    createTranslationIfNotExists(
        "translation.translationDeleteError", languageCode, "번역 삭제 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.translationDeleteSuccess", languageCode, "번역이 성공적으로 삭제되었습니다", createdBy);
    createTranslationIfNotExists(
        "translation.translationLoadError", languageCode, "번역 목록을 로드할 수 없습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.translationSaveError", languageCode, "번역 저장 실패: {error}", createdBy);
    createTranslationIfNotExists(
        "translation.translationSaveSuccess", languageCode, "번역이 성공적으로 저장되었습니다", createdBy);
    createTranslationIfNotExists(
        "tree.orphan.description", languageCode, "상위 폴더가 삭제되거나 접근할 수 없어 길을 잃은 항목들입니다.", createdBy);
    createTranslationIfNotExists("tree.orphan.name", languageCode, "[미할당 항목]", createdBy);
    createTranslationIfNotExists("trend.analysisType.byExecutor", languageCode, "실행자별", createdBy);
    createTranslationIfNotExists(
        "trend.analysisType.byTestPlan", languageCode, "테스트플랜별", createdBy);
    createTranslationIfNotExists("trend.analysisType.timeline", languageCode, "시간별 추이", createdBy);
    createTranslationIfNotExists("trend.common.notSpecified", languageCode, "미지정", createdBy);
    createTranslationIfNotExists(
        "trend.dateFormat.yearMonth", languageCode, "yyyy년 MM월", createdBy);
    createTranslationIfNotExists("trend.filter.period", languageCode, "기간", createdBy);
    createTranslationIfNotExists("trend.filter.unit", languageCode, "단위", createdBy);
    createTranslationIfNotExists("trend.grouping.daily", languageCode, "일별", createdBy);
    createTranslationIfNotExists("trend.grouping.monthly", languageCode, "월별", createdBy);
    createTranslationIfNotExists("trend.grouping.weekly", languageCode, "주별", createdBy);
    createTranslationIfNotExists("trend.period.last30days", languageCode, "최근 30일", createdBy);
    createTranslationIfNotExists("trend.period.last7days", languageCode, "최근 7일", createdBy);
    createTranslationIfNotExists("trend.period.last90days", languageCode, "최근 90일", createdBy);
    createTranslationIfNotExists("trend.plan.default", languageCode, "기본 플랜", createdBy);
    createTranslationIfNotExists(
        "trend.trendData.refreshError", languageCode, "트렌드 데이터 새로고침 실패:", createdBy);
    createTranslationIfNotExists("versionComparison.changeType", languageCode, "변경 유형", createdBy);
    createTranslationIfNotExists(
        "versionComparison.changesCount", languageCode, "{count}개 변경", createdBy);
    createTranslationIfNotExists("versionComparison.closeButton", languageCode, "닫기", createdBy);
    createTranslationIfNotExists(
        "versionComparison.comparing", languageCode, "버전을 비교하고 있습니다...", createdBy);
    createTranslationIfNotExists("versionComparison.description", languageCode, "설명:", createdBy);
    createTranslationIfNotExists(
        "versionComparison.expectedResults", languageCode, "예상 결과:", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fetchError", languageCode, "버전 비교 데이터 조회에 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fieldChanges", languageCode, "필드 변경", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fieldDescription", languageCode, "설명", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fieldExpectedResults", languageCode, "예상 결과", createdBy);
    createTranslationIfNotExists("versionComparison.fieldName", languageCode, "테스트 이름", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fieldPreCondition", languageCode, "사전 조건", createdBy);
    createTranslationIfNotExists(
        "versionComparison.fieldPriority", languageCode, "우선순위", createdBy);
    createTranslationIfNotExists(
        "versionComparison.identicalVersions", languageCode, "두 버전이 동일합니다", createdBy);
    createTranslationIfNotExists("versionComparison.name", languageCode, "이름:", createdBy);
    createTranslationIfNotExists(
        "versionComparison.noChanges", languageCode, "변경 사항 없음", createdBy);
    createTranslationIfNotExists(
        "versionComparison.noDifferences", languageCode, "선택한 버전들 간에 차이점이 없습니다.", createdBy);
    createTranslationIfNotExists(
        "versionComparison.preCondition", languageCode, "사전 조건:", createdBy);
    createTranslationIfNotExists("versionComparison.priority", languageCode, "우선순위:", createdBy);
    createTranslationIfNotExists(
        "versionComparison.showDetails", languageCode, "상세 내용 보기", createdBy);
    createTranslationIfNotExists("versionComparison.stepChanges", languageCode, "스텝 변경", createdBy);
    createTranslationIfNotExists("versionComparison.summary", languageCode, "변경 사항 요약", createdBy);
    createTranslationIfNotExists("versionComparison.testSteps", languageCode, "테스트 스텝:", createdBy);
    createTranslationIfNotExists(
        "versionComparison.testStepsChanges", languageCode, "테스트 스텝", createdBy);
    createTranslationIfNotExists("versionComparison.title", languageCode, "버전 비교", createdBy);
    createTranslationIfNotExists(
        "versionComparison.totalChanges", languageCode, "총 {count}개 변경", createdBy);
    createTranslationIfNotExists(
        "testResultEditDialog.jiraIssueNotFoundAgain", languageCode, "이슈를 찾을 수 없습니다", createdBy);
    createTranslationIfNotExists(
        "testResult.chart.countWithPct", languageCode, "{count}건 ({pct}%)", createdBy);
    createTranslationIfNotExists(
        "testResult.chart.totalCount", languageCode, "총 {count}건", createdBy);
    createTranslationIfNotExists("testResult.chart.countOnly", languageCode, "{count}건", createdBy);
    createTranslationIfNotExists("rag.chat.defaultConfigSuffix", languageCode, "(기본)", createdBy);
    createTranslationIfNotExists("header.userMenu.manual", languageCode, "사용자 매뉴얼", createdBy);
    createTranslationIfNotExists("login.manualLink", languageCode, "사용자 매뉴얼", createdBy);
    createTranslationIfNotExists("manual.viewer.title", languageCode, "사용자 매뉴얼", createdBy);
    createTranslationIfNotExists("manual.viewer.loading", languageCode, "매뉴얼 로딩 중...", createdBy);
    createTranslationIfNotExists(
        "manual.viewer.error", languageCode, "매뉴얼을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", createdBy);
    createTranslationIfNotExists("manual.viewer.retry", languageCode, "다시 시도", createdBy);
    createTranslationIfNotExists("manual.viewer.print", languageCode, "인쇄", createdBy);
    createTranslationIfNotExists("manual.viewer.relatedGuides", languageCode, "관련 가이드", createdBy);
    createTranslationIfNotExists(
        "manual.viewer.backToManual", languageCode, "매뉴얼로 돌아가기", createdBy);
    createTranslationIfNotExists(
        "manual.viewer.guideError", languageCode, "가이드 문서를 불러오지 못했습니다.", createdBy);
    createTranslationIfNotExists("manual.viewer.intro", languageCode, "소개", createdBy);

    // 하드코딩 i18n 정리 (2026-06-30)
    createTranslationIfNotExists("rag.chat.relatedDocuments", languageCode, "참고 문서:", createdBy);
    createTranslationIfNotExists("rag.chat.similarity", languageCode, "유사도: {percent}%", createdBy);
    createTranslationIfNotExists("testResult.barChart.title", languageCode, "테스트 결과 비교", createdBy);
    createTranslationIfNotExists(
        "testCaseResult.error.executionLoad", languageCode, "테스트 실행 정보를 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testCaseResult.error.caseLoad", languageCode, "테스트케이스 정보를 불러올 수 없습니다.", createdBy);
    createTranslationIfNotExists("junit.version.compressed", languageCode, "압축됨", createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.loadError", languageCode, "QA 총평용 실행 정보 로드 실패:", createdBy);
    createTranslationIfNotExists("testResult.qaSummary.saveFailed", languageCode, "QA 총평 저장 실패:", createdBy);
    createTranslationIfNotExists(
        "testResult.error.filteredResultsLoad", languageCode, "필터링된 테스트 결과를 불러올 수 없습니다", createdBy);
    createTranslationIfNotExists(
        "testResult.error.resultsLoad", languageCode, "테스트 결과를 불러올 수 없습니다", createdBy);
    createTranslationIfNotExists(
        "testResult.error.jiraConfig", languageCode, "JIRA 설정을 불러올 수 없습니다:", createdBy);
    createTranslationIfNotExists("testResult.defaultValue.root", languageCode, "루트", createdBy);
    createTranslationIfNotExists("testResult.label.editVersion", languageCode, "편집본", createdBy);
    createTranslationIfNotExists(
        "testcaseAttachments.fetchError", languageCode, "첨부파일 목록을 불러오는데 실패했습니다.", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.deleteError", languageCode, "항목 삭제 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validationError", languageCode, "검증 중 오류가 발생했습니다: {error}", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.pdfExportError", languageCode, "PDF 내보내기 중 오류가 발생했습니다.", createdBy);
    createTranslationIfNotExists("testCase.export.noData", languageCode, "내보낼 데이터가 없습니다.", createdBy);
    createTranslationIfNotExists(
        "testCase.export.csvSuccess", languageCode, "CSV 파일이 다운로드되었습니다: {filename}", createdBy);
    createTranslationIfNotExists(
        "testCase.export.csvError", languageCode, "CSV 다운로드 중 오류가 발생했습니다: {message}", createdBy);
    createTranslationIfNotExists(
        "testCase.export.excelSuccess", languageCode, "Excel 파일이 다운로드되었습니다: {filename}", createdBy);
    createTranslationIfNotExists(
        "testCase.export.excelError", languageCode, "Excel 다운로드 중 오류가 발생했습니다: {message}", createdBy);

    log.info("i18n 하드코딩 보강 ko 번역 초기화 완료");
  }

  private void createTranslationIfNotExists(
      String keyName, String languageCode, String value, String createdBy) {
    Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
    if (translationKeyOpt.isPresent()) {
      TranslationKey translationKey = translationKeyOpt.get();
      Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
      if (languageOpt.isPresent()) {
        Language language = languageOpt.get();
        Optional<Translation> existingTranslationOpt =
            translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
        if (existingTranslationOpt.isEmpty()) {
          Translation translation = new Translation();
          translation.setTranslationKey(translationKey);
          translation.setLanguage(language);
          translation.setValue(value);
          translation.setCreatedBy(createdBy);
          translation.setUpdatedBy(createdBy);
          translation.setIsActive(true);
          translationRepository.save(translation);
        }
      }
    } else {
      log.warn("Translation key not found: {}", keyName);
    }
  }
}
