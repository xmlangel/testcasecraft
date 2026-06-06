// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/I18nGapKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 2026-06-06 i18n 전수 감사에서 발견된 누락 번역 키 일괄 등록.
 *
 * <p>프런트엔드 t() 호출 키 중 DB에 없던 키 + ko만 있고 en이 없던 키 481건. 산출 근거:
 * _workspace/i18n-audit (코드 t() 키 추출 vs /api/i18n/translations 비교).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class I18nGapKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    log.info("i18n gap 번역 키 초기화 시작 (481건)");

    createTranslationKeyIfNotExists(
        "admin.globalDoc.jobHistoryFailed", "admin", "i18n gap 보강 (2026-06-06)", "작업 이력을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.message.fetchFailed", "admin", "i18n gap 보강 (2026-06-06)", "공통 문서를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.summary.fetchFailed", "admin", "i18n gap 보강 (2026-06-06)", "분석 결과 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.summary.notReady", "admin", "i18n gap 보강 (2026-06-06)", "아직 요약을 확인할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.tab.globalDocuments", "admin", "i18n gap 보강 (2026-06-06)", "RAG 공통 문서");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.tab.system", "admin", "i18n gap 보강 (2026-06-06)", "시스템 설정");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.cancel", "admin", "i18n gap 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.chunkBatchSize", "admin", "i18n gap 보강 (2026-06-06)", "배치 크기");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.chunkBatchSizeHelper", "admin", "i18n gap 보강 (2026-06-06)", "한 번에 처리할 청크 개수");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.description", "admin", "i18n gap 보강 (2026-06-06)", "RAG 문서 분석 시 사용되는 기본 설정입니다. UI와 Backend 스케줄러가 공통으로 사용합니다.");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.edit", "admin", "i18n gap 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.lastModified", "admin", "i18n gap 보강 (2026-06-06)", "마지막 수정: {0}");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.maxTokens", "admin", "i18n gap 보강 (2026-06-06)", "최대 토큰");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.message.updateFailed", "admin", "i18n gap 보강 (2026-06-06)", "LLM 템플릿 업데이트 실패");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.message.updated", "admin", "i18n gap 보강 (2026-06-06)", "LLM 분석 템플릿이 업데이트되었습니다");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.pauseAfterBatch", "admin", "i18n gap 보강 (2026-06-06)", "배치마다 일시정지");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.promptTemplate", "admin", "i18n gap 보강 (2026-06-06)", "프롬프트 템플릿");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.promptTemplateHelper", "admin", "i18n gap 보강 (2026-06-06)", "{chunk_text} 플레이스홀더를 사용하세요");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.save", "admin", "i18n gap 보강 (2026-06-06)", "저장");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.temperature", "admin", "i18n gap 보강 (2026-06-06)", "온도");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.title", "admin", "i18n gap 보강 (2026-06-06)", "🤖 LLM 청크 분석 기본 템플릿");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.fetchError", "admin", "i18n gap 보강 (2026-06-06)", "설정을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragTitle", "admin", "i18n gap 보강 (2026-06-06)", "RAG 시스템 설정");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragToggleDesc", "admin", "i18n gap 보강 (2026-06-06)", "이 설정을 끄면 시스템 전체에서 RAG 기능 및 LLM 호출이 비활성화됩니다. RAG 시스템이 불안정하거나 유지보수가 필요할 때 사용하세요.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragToggleTitle", "admin", "i18n gap 보강 (2026-06-06)", "RAG 기능 활성화 상태");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.saveError", "admin", "i18n gap 보강 (2026-06-06)", "설정 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.saveSuccess", "admin", "i18n gap 보강 (2026-06-06)", "시스템 설정이 성공적으로 저장되었습니다.");
    createTranslationKeyIfNotExists(
        "attachments.button.preview", "attachments", "i18n gap 보강 (2026-06-06)", "미리보기");
    createTranslationKeyIfNotExists(
        "attachments.error.previewError", "attachments", "i18n gap 보강 (2026-06-06)", "미리보기를 생성할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "autoSave.error", "autoSave", "i18n gap 보강 (2026-06-06)", "자동 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "common.add", "common", "i18n gap 보강 (2026-06-06)", "추가");
    createTranslationKeyIfNotExists(
        "common.backToProjects", "common", "i18n gap 보강 (2026-06-06)", "프로젝트 목록으로 이동");
    createTranslationKeyIfNotExists(
        "common.boolean.no", "common", "i18n gap 보강 (2026-06-06)", "아니오");
    createTranslationKeyIfNotExists(
        "common.boolean.yes", "common", "i18n gap 보강 (2026-06-06)", "예");
    createTranslationKeyIfNotExists(
        "common.button.back", "common", "i18n gap 보강 (2026-06-06)", "뒤로가기");
    createTranslationKeyIfNotExists(
        "common.button.next", "common", "i18n gap 보강 (2026-06-06)", "다음");
    createTranslationKeyIfNotExists(
        "common.button.previous", "common", "i18n gap 보강 (2026-06-06)", "이전");
    createTranslationKeyIfNotExists(
        "common.button.search", "common", "i18n gap 보강 (2026-06-06)", "검색");
    createTranslationKeyIfNotExists(
        "common.confirmDelete", "common", "i18n gap 보강 (2026-06-06)", "삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "common.content", "common", "i18n gap 보강 (2026-06-06)", "내용");
    createTranslationKeyIfNotExists(
        "common.copied", "common", "i18n gap 보강 (2026-06-06)", "복사됨!");
    createTranslationKeyIfNotExists(
        "common.copy", "common", "i18n gap 보강 (2026-06-06)", "복사");
    createTranslationKeyIfNotExists(
        "common.description", "common", "i18n gap 보강 (2026-06-06)", "버그 설명");
    createTranslationKeyIfNotExists(
        "common.disabled", "common", "i18n gap 보강 (2026-06-06)", "비활성화됨");
    createTranslationKeyIfNotExists(
        "common.duration", "common", "i18n gap 보강 (2026-06-06)", "수행 시간");
    createTranslationKeyIfNotExists(
        "common.enabled", "common", "i18n gap 보강 (2026-06-06)", "활성화됨");
    createTranslationKeyIfNotExists(
        "common.errors.invalidIssueKey", "common", "i18n gap 보강 (2026-06-06)", "유효하지 않은 이슈 키입니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noAssociatedExecution", "common", "i18n gap 보강 (2026-06-06)", "연결된 테스트 실행 정보를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noDataFound", "common", "i18n gap 보강 (2026-06-06)", "데이터를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noExecutionForIssue", "common", "i18n gap 보강 (2026-06-06)", "해당 이슈와 연결된 최근 테스트 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.serverError", "common", "i18n gap 보강 (2026-06-06)", "서버와의 통신 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "common.exitFullscreen", "common", "i18n gap 보강 (2026-06-06)", "전체화면 종료");
    createTranslationKeyIfNotExists(
        "common.expectedResult", "common", "i18n gap 보강 (2026-06-06)", "기대 결과");
    createTranslationKeyIfNotExists(
        "common.folder", "common", "i18n gap 보강 (2026-06-06)", "폴더");
    createTranslationKeyIfNotExists(
        "common.fullscreen", "common", "i18n gap 보강 (2026-06-06)", "전체화면");
    createTranslationKeyIfNotExists(
        "common.hide", "common", "i18n gap 보강 (2026-06-06)", "숨기기");
    createTranslationKeyIfNotExists(
        "common.hideAll", "common", "i18n gap 보강 (2026-06-06)", "모두 숨김");
    createTranslationKeyIfNotExists(
        "common.loadingMore", "common", "i18n gap 보강 (2026-06-06)", "더 불러오는 중...");
    createTranslationKeyIfNotExists(
        "common.name", "common", "i18n gap 보강 (2026-06-06)", "이름");
    createTranslationKeyIfNotExists(
        "common.next", "common", "i18n gap 보강 (2026-06-06)", "다음");
    createTranslationKeyIfNotExists(
        "common.noMoreData", "common", "i18n gap 보강 (2026-06-06)", "모든 데이터를 불러왔습니다.");
    createTranslationKeyIfNotExists(
        "common.pagination.rowsPerPage", "common", "i18n gap 보강 (2026-06-06)", "페이지당 행:");
    createTranslationKeyIfNotExists(
        "common.previous", "common", "i18n gap 보강 (2026-06-06)", "이전");
    createTranslationKeyIfNotExists(
        "common.processing", "common", "i18n gap 보강 (2026-06-06)", "처리 중...");
    createTranslationKeyIfNotExists(
        "common.redirecting.failed", "common", "i18n gap 보강 (2026-06-06)", "연결 실패");
    createTranslationKeyIfNotExists(
        "common.redirecting.processing", "common", "i18n gap 보강 (2026-06-06)", "연관 데이터 조회 중...");
    createTranslationKeyIfNotExists(
        "common.refresh", "common", "i18n gap 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists(
        "common.reset", "common", "i18n gap 보강 (2026-06-06)", "기본값");
    createTranslationKeyIfNotExists(
        "common.saveError", "common", "i18n gap 보강 (2026-06-06)", "저장 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "common.saveSuccess", "common", "i18n gap 보강 (2026-06-06)", "저장되었습니다.");
    createTranslationKeyIfNotExists(
        "common.saving", "common", "i18n gap 보강 (2026-06-06)", "Saving...");
    createTranslationKeyIfNotExists(
        "common.search", "common", "i18n gap 보강 (2026-06-06)", "검색");
    createTranslationKeyIfNotExists(
        "common.showAll", "common", "i18n gap 보강 (2026-06-06)", "모두 표시");
    createTranslationKeyIfNotExists(
        "common.steps", "common", "i18n gap 보강 (2026-06-06)", "테스트 절차");
    createTranslationKeyIfNotExists(
        "common.testcase", "common", "i18n gap 보강 (2026-06-06)", "테스트케이스");
    createTranslationKeyIfNotExists(
        "common.title", "common", "i18n gap 보강 (2026-06-06)", "제목");
    createTranslationKeyIfNotExists(
        "common.type", "common", "i18n gap 보강 (2026-06-06)", "유형");
    createTranslationKeyIfNotExists(
        "common.update", "common", "i18n gap 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "dashboard.activity.completedPlans", "dashboard", "i18n gap 보강 (2026-06-06)", "완료된 계획");
    createTranslationKeyIfNotExists(
        "dashboard.activity.newTestCases", "dashboard", "i18n gap 보강 (2026-06-06)", "새 테스트 케이스");
    createTranslationKeyIfNotExists(
        "dashboard.activity.recentActivities", "dashboard", "i18n gap 보강 (2026-06-06)", "최근 활동");
    createTranslationKeyIfNotExists(
        "dashboard.activity.testExecutions", "dashboard", "i18n gap 보강 (2026-06-06)", "테스트 실행");
    createTranslationKeyIfNotExists(
        "dashboard.noData.noResults", "dashboard", "i18n gap 보강 (2026-06-06)", "결과가 없습니다");
    createTranslationKeyIfNotExists(
        "dashboard.quickActions.createTestCase", "dashboard", "i18n gap 보강 (2026-06-06)", "테스트 케이스 생성");
    createTranslationKeyIfNotExists(
        "dashboard.quickActions.manageProjects", "dashboard", "i18n gap 보강 (2026-06-06)", "프로젝트 관리");
    createTranslationKeyIfNotExists(
        "dashboard.quickActions.runTests", "dashboard", "i18n gap 보강 (2026-06-06)", "테스트 실행");
    createTranslationKeyIfNotExists(
        "dashboard.quickActions.title", "dashboard", "i18n gap 보강 (2026-06-06)", "빠른 작업");
    createTranslationKeyIfNotExists(
        "dashboard.quickActions.viewReports", "dashboard", "i18n gap 보강 (2026-06-06)", "리포트 보기");
    createTranslationKeyIfNotExists(
        "dashboard.summary.activeProjects", "dashboard", "i18n gap 보강 (2026-06-06)", "활성 프로젝트");
    createTranslationKeyIfNotExists(
        "dashboard.summary.failedTests", "dashboard", "i18n gap 보강 (2026-06-06)", "실패한 테스트");
    createTranslationKeyIfNotExists(
        "dashboard.summary.passedTests", "dashboard", "i18n gap 보강 (2026-06-06)", "통과된 테스트");
    createTranslationKeyIfNotExists(
        "dashboard.summary.testCoverage", "dashboard", "i18n gap 보강 (2026-06-06)", "테스트 커버리지");
    createTranslationKeyIfNotExists(
        "dashboard.summary.totalProjects", "dashboard", "i18n gap 보강 (2026-06-06)", "총 프로젝트");
    createTranslationKeyIfNotExists(
        "dashboard.summary.totalTestCases", "dashboard", "i18n gap 보강 (2026-06-06)", "총 테스트 케이스");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.missionPlaceholder", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 내용을 마크다운으로 작성하세요.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "등록된 차터가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.checkFields", "exploratory", "i18n gap 보강 (2026-06-06)", "필수 항목을 확인해 주세요.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.missionRequired", "exploratory", "i18n gap 보강 (2026-06-06)", "내용은 필수입니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.titleRequired", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 이름은 필수입니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.goal", "exploratory", "i18n gap 보강 (2026-06-06)", "- 목표: 일반/특수 사용자 로그인 안정성 검증");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.notes", "exploratory", "i18n gap 보강 (2026-06-06)", "- 주의점: 토큰 유효성, 다국어 처리, 네트워크 지연");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.resources", "exploratory", "i18n gap 보강 (2026-06-06)", "- 자원: 테스트 계정, Postman, 개발자 도구");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.templateTitle", "exploratory", "i18n gap 보강 (2026-06-06)", "작성 예시 (로그인 기능)");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.formula", "exploratory", "i18n gap 보강 (2026-06-06)", "무엇을(Target) + 어떤 자원으로(Resources) + 무엇을 찾을 것인지(Information)");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.show", "exploratory", "i18n gap 보강 (2026-06-06)", "작성 가이드 보기");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.title", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 기본형 템플릿");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.focus", "exploratory", "i18n gap 보강 (2026-06-06)", "한 번에 한 임무 집중: 세션 중 몰입 환경 확보");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.riskBased", "exploratory", "i18n gap 보강 (2026-06-06)", "리스크 기반 접근: 고위험 영역에 집중 배치");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.specificity", "exploratory", "i18n gap 보강 (2026-06-06)", "적정 수준의 구체성: 테스트 방향을 제시할 수 있을 정도");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.title", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 설계 원칙");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.finalSubmit", "exploratory", "i18n gap 보강 (2026-06-06)", "SUBMIT FOR REVIEW");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.achievement", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 달성도");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.nextCharter", "exploratory", "i18n gap 보강 (2026-06-06)", "후속 액션 / 다음 차터 제안");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.summary", "exploratory", "i18n gap 보강 (2026-06-06)", "세션 전체 평가");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.artifacts", "exploratory", "i18n gap 보강 (2026-06-06)", "산출물 및 증적");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.bugs", "exploratory", "i18n gap 보강 (2026-06-06)", "발견된 버그");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.notes", "exploratory", "i18n gap 보강 (2026-06-06)", "테스트 수행 노트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.tests", "exploratory", "i18n gap 보강 (2026-06-06)", "구조화된 테스트");
    createTranslationKeyIfNotExists(
        "exploratory.detail.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "Select a session to view details");
    createTranslationKeyIfNotExists(
        "exploratory.editor.btn.backToList", "exploratory", "i18n gap 보강 (2026-06-06)", "목록보기");
    createTranslationKeyIfNotExists(
        "exploratory.editor.btn.submit", "exploratory", "i18n gap 보강 (2026-06-06)", "제출");
    createTranslationKeyIfNotExists(
        "exploratory.editor.bugs.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "발견된 버그가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.bugs.title", "exploratory", "i18n gap 보강 (2026-06-06)", "FOUND BUGS / DEFECTS");
    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "노트가 없습니다. 추가 버튼을 눌러 기록을 시작하세요.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.section.sessionConfig", "exploratory", "i18n gap 보강 (2026-06-06)", "SESSION CONFIGURATION");
    createTranslationKeyIfNotExists(
        "exploratory.editor.section.timeDistribution", "exploratory", "i18n gap 보강 (2026-06-06)", "테스트 활동 배분");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tab.basic", "exploratory", "i18n gap 보강 (2026-06-06)", "기본 정보");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tab.recording", "exploratory", "i18n gap 보강 (2026-06-06)", "세션 기록");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tests.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "등록된 테스트가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tests.title", "exploratory", "i18n gap 보강 (2026-06-06)", "STRUCTURED TESTS");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.currentStatus", "exploratory", "i18n gap 보강 (2026-06-06)", "세션 상태");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.progress", "exploratory", "i18n gap 보강 (2026-06-06)", "TIME ALLOCATION VISUALIZER");
    createTranslationKeyIfNotExists(
        "exploratory.session.approveSuccess", "exploratory", "i18n gap 보강 (2026-06-06)", "세션이 승인되었습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.btn.createNew", "exploratory", "i18n gap 보강 (2026-06-06)", "새 세션 시작");
    createTranslationKeyIfNotExists(
        "exploratory.session.countUnit", "exploratory", "i18n gap 보강 (2026-06-06)", "개의 세션이 있습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "조건에 맞는 세션이 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.rejectSuccess", "exploratory", "i18n gap 보강 (2026-06-06)", "보완 요청이 완료되었습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.saveFirst", "exploratory", "i18n gap 보강 (2026-06-06)", "파일을 업로드하려면 먼저 세션을 저장해야 합니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.submitSuccess", "exploratory", "i18n gap 보강 (2026-06-06)", "세션이 제출되었습니다.");
    createTranslationKeyIfNotExists(
        "google.config.email.hint", "google", "i18n gap 보강 (2026-06-06)", "공유 추가할 이메일:");
    createTranslationKeyIfNotExists(
        "jira.issue.open", "jira", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "jira.linker.alreadyLinked", "jira", "i18n gap 보강 (2026-06-06)", "이미 연결됨");
    createTranslationKeyIfNotExists(
        "jira.linker.connectionError", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 연결 상태를 확인할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.createIssue", "jira", "i18n gap 보강 (2026-06-06)", "이슈 생성");
    createTranslationKeyIfNotExists(
        "jira.linker.detailsError", "jira", "i18n gap 보강 (2026-06-06)", "이슈 정보를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.enterSearchQuery", "jira", "i18n gap 보강 (2026-06-06)", "검색어를 입력하세요.");
    createTranslationKeyIfNotExists(
        "jira.linker.issueNotFound", "jira", "i18n gap 보강 (2026-06-06)", "해당 이슈가 존재하지 않아 검색할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.link", "jira", "i18n gap 보강 (2026-06-06)", "연결");
    createTranslationKeyIfNotExists(
        "jira.linker.linkedIssues", "jira", "i18n gap 보강 (2026-06-06)", "연결된 JIRA 이슈");
    createTranslationKeyIfNotExists(
        "jira.linker.noConfig", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 설정이 없거나 연결에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.noConfigWarning", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 이슈 연동을 사용하려면 먼저 JIRA 설정을 완료해주세요.");
    createTranslationKeyIfNotExists(
        "jira.linker.noResults", "jira", "i18n gap 보강 (2026-06-06)", "검색 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.openInJira", "jira", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "jira.linker.placeholder", "jira", "i18n gap 보강 (2026-06-06)", "이슈 키, 제목 또는 JIRA URL을 입력하세요 (예: TEST-123)");
    createTranslationKeyIfNotExists(
        "jira.linker.recentIssues", "jira", "i18n gap 보강 (2026-06-06)", "최근 검색한 이슈");
    createTranslationKeyIfNotExists(
        "jira.linker.searchAndLink", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 이슈 검색 및 연결");
    createTranslationKeyIfNotExists(
        "jira.linker.searchResults", "jira", "i18n gap 보강 (2026-06-06)", "검색 결과");
    createTranslationKeyIfNotExists(
        "jira.linker.unlink", "jira", "i18n gap 보강 (2026-06-06)", "연결 해제");
    createTranslationKeyIfNotExists(
        "jira.summary.activeIssues", "jira", "i18n gap 보강 (2026-06-06)", "활성 이슈");
    createTranslationKeyIfNotExists(
        "jira.summary.allPassed", "jira", "i18n gap 보강 (2026-06-06)", "전체 통과");
    createTranslationKeyIfNotExists(
        "jira.summary.filterActive", "jira", "i18n gap 보강 (2026-06-06)", "진행중");
    createTranslationKeyIfNotExists(
        "jira.summary.loading", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 상태 정보를 불러오는 중...");
    createTranslationKeyIfNotExists(
        "junit.list.previousExecution", "junit", "i18n gap 보강 (2026-06-06)", "이전 실행");
    createTranslationKeyIfNotExists(
        "login.error.failed", "login", "i18n gap 보강 (2026-06-06)", "로그인에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "login.error.general", "login", "i18n gap 보강 (2026-06-06)", "로그인 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "navigation.breadcrumb.back", "navigation", "i18n gap 보강 (2026-06-06)", "뒤로");
    createTranslationKeyIfNotExists(
        "navigation.menu.help", "navigation", "i18n gap 보강 (2026-06-06)", "도움말");
    createTranslationKeyIfNotExists(
        "navigation.menu.settings", "navigation", "i18n gap 보강 (2026-06-06)", "설정");
    createTranslationKeyIfNotExists(
        "navigation.menu.testExecutions", "navigation", "i18n gap 보강 (2026-06-06)", "테스트 실행");
    createTranslationKeyIfNotExists(
        "navigation.user.logout", "navigation", "i18n gap 보강 (2026-06-06)", "로그아웃");
    createTranslationKeyIfNotExists(
        "navigation.user.preferences", "navigation", "i18n gap 보강 (2026-06-06)", "환경설정");
    createTranslationKeyIfNotExists(
        "navigation.user.profile", "navigation", "i18n gap 보강 (2026-06-06)", "프로필");
    createTranslationKeyIfNotExists(
        "organization.buttons.back", "organization", "i18n gap 보강 (2026-06-06)", "조직 목록으로");
    createTranslationKeyIfNotExists(
        "organization.detail.organizationMembers", "organization", "i18n gap 보강 (2026-06-06)", "조직 멤버");
    createTranslationKeyIfNotExists(
        "organization.detail.organizationProjects", "organization", "i18n gap 보강 (2026-06-06)", "조직 프로젝트");
    createTranslationKeyIfNotExists(
        "organization.dialog.editInfo.title", "organization", "i18n gap 보강 (2026-06-06)", "조직 정보 수정");
    createTranslationKeyIfNotExists(
        "organization.dialog.project.title", "organization", "i18n gap 보강 (2026-06-06)", "조직별 프로젝트 생성");
    createTranslationKeyIfNotExists(
        "organization.error.selectMember", "organization", "i18n gap 보강 (2026-06-06)", "이전할 멤버를 선택해주세요.");
    createTranslationKeyIfNotExists(
        "organization.form.codeRequired", "organization", "i18n gap 보강 (2026-06-06)", "프로젝트 코드를 입력해주세요.");
    createTranslationKeyIfNotExists(
        "organization.member.remove", "organization", "i18n gap 보강 (2026-06-06)", "멤버 제거");
    createTranslationKeyIfNotExists(
        "organization.member.role", "organization", "i18n gap 보강 (2026-06-06)", "역할");
    createTranslationKeyIfNotExists(
        "organization.member.username", "organization", "i18n gap 보강 (2026-06-06)", "사용자명");
    createTranslationKeyIfNotExists(
        "organization.messages.notFound", "organization", "i18n gap 보강 (2026-06-06)", "조직을 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "organization.project.belongsTo", "organization", "i18n gap 보강 (2026-06-06)", "이 프로젝트는 조직에 속하게 됩니다.");
    createTranslationKeyIfNotExists(
        "organization.project.code", "organization", "i18n gap 보강 (2026-06-06)", "프로젝트 코드");
    createTranslationKeyIfNotExists(
        "organization.project.codeHelperText", "organization", "i18n gap 보강 (2026-06-06)", "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능");
    createTranslationKeyIfNotExists(
        "organization.project.codePlaceholder", "organization", "i18n gap 보강 (2026-06-06)", "예: WEB_APP_TEST");
    createTranslationKeyIfNotExists(
        "organization.project.description", "organization", "i18n gap 보강 (2026-06-06)", "프로젝트 설명");
    createTranslationKeyIfNotExists(
        "organization.project.descriptionPlaceholder", "organization", "i18n gap 보강 (2026-06-06)", "프로젝트에 대한 간단한 설명을 입력하세요...");
    createTranslationKeyIfNotExists(
        "organization.project.name", "organization", "i18n gap 보강 (2026-06-06)", "프로젝트 이름");
    createTranslationKeyIfNotExists(
        "organization.project.namePlaceholder", "organization", "i18n gap 보강 (2026-06-06)", "예: 웹 애플리케이션 테스트");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.button.cancel", "profile", "i18n gap 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "profile.tabs.theme", "profile", "i18n gap 보강 (2026-06-06)", "테마 설정");
    createTranslationKeyIfNotExists(
        "profile.theme.description", "profile", "i18n gap 보강 (2026-06-06)", "애플리케이션의 전반적인 디자인 스타일을 선택합니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.glass.desc", "profile", "i18n gap 보강 (2026-06-06)", "화려한 그라데이션과 블러 효과가 적용된 현대적인 스타일입니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.glass.title", "profile", "i18n gap 보강 (2026-06-06)", "Modern Glass (현재)");
    createTranslationKeyIfNotExists(
        "profile.theme.m3.desc", "profile", "i18n gap 보강 (2026-06-06)", "구글의 최신 가이드라인을 따른 정갈하고 체계적인 스타일입니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.m3.title", "profile", "i18n gap 보강 (2026-06-06)", "Material 3 (Design System)");
    createTranslationKeyIfNotExists(
        "profile.theme.mode.desc", "profile", "i18n gap 보강 (2026-06-06)", "전체 화면의 밝기를 조절합니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.mode.title", "profile", "i18n gap 보강 (2026-06-06)", "화면 모드");
    createTranslationKeyIfNotExists(
        "profile.theme.systemLabel", "profile", "i18n gap 보강 (2026-06-06)", "디자인 시스템");
    createTranslationKeyIfNotExists(
        "profile.theme.title", "profile", "i18n gap 보강 (2026-06-06)", "디자인 시스템 설정");
    createTranslationKeyIfNotExists(
        "project.buttons.forceDelete", "project", "i18n gap 보강 (2026-06-06)", "강제 삭제");
    createTranslationKeyIfNotExists(
        "project.buttons.transfer", "project", "i18n gap 보강 (2026-06-06)", "이전");
    createTranslationKeyIfNotExists(
        "project.dialog.deleteTitle", "project", "i18n gap 보강 (2026-06-06)", "프로젝트 삭제 확인");
    createTranslationKeyIfNotExists(
        "project.dialog.deleteWarningMessage1", "project", "i18n gap 보강 (2026-06-06)", "이 작업은 되돌릴 수 없습니다.");
    createTranslationKeyIfNotExists(
        "project.dialog.deleteWarningMessage2", "project", "i18n gap 보강 (2026-06-06)", "프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.");
    createTranslationKeyIfNotExists(
        "project.form.codeRequired", "project", "i18n gap 보강 (2026-06-06)", "프로젝트 코드를 입력해주세요.");
    createTranslationKeyIfNotExists(
        "project.form.convertToIndependent", "project", "i18n gap 보강 (2026-06-06)", "독립 프로젝트로 전환");
    createTranslationKeyIfNotExists(
        "project.form.nameRequired", "project", "i18n gap 보강 (2026-06-06)", "프로젝트 이름을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "project.form.targetOrganization", "project", "i18n gap 보강 (2026-06-06)", "대상 조직");
    createTranslationKeyIfNotExists(
        "project.members.more", "project", "i18n gap 보강 (2026-06-06)", "외 {count}명");
    createTranslationKeyIfNotExists(
        "project.members.noMembers", "project", "i18n gap 보강 (2026-06-06)", "멤버가 없습니다");
    createTranslationKeyIfNotExists(
        "project.members.title", "project", "i18n gap 보강 (2026-06-06)", "프로젝트 멤버");
    createTranslationKeyIfNotExists(
        "project.menu.forceDelete", "project", "i18n gap 보강 (2026-06-06)", "강제 삭제");
    createTranslationKeyIfNotExists(
        "project.menu.transfer", "project", "i18n gap 보강 (2026-06-06)", "조직 이전");
    createTranslationKeyIfNotExists(
        "project.messages.addOrganizationProjectsHint", "project", "i18n gap 보강 (2026-06-06)", "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.");
    createTranslationKeyIfNotExists(
        "project.messages.noOrganizationProjects", "project", "i18n gap 보강 (2026-06-06)", "조직별 프로젝트가 없습니다");
    createTranslationKeyIfNotExists(
        "project.messages.noProjectsInOrganization", "project", "i18n gap 보강 (2026-06-06)", "이 조직에는 아직 프로젝트가 없습니다.");
    createTranslationKeyIfNotExists(
        "project.types.independent", "project", "i18n gap 보강 (2026-06-06)", "독립 프로젝트");
    createTranslationKeyIfNotExists(
        "rag.analysis.chunkNumber.header", "rag", "i18n gap 보강 (2026-06-06)", "청크 #");
    createTranslationKeyIfNotExists(
        "rag.analysis.costHeader", "rag", "i18n gap 보강 (2026-06-06)", "비용");
    createTranslationKeyIfNotExists(
        "rag.chat.conversationThreadLabel", "rag", "i18n gap 보강 (2026-06-06)", "대화 스레드: {title}");
    createTranslationKeyIfNotExists(
        "rag.chat.conversationThreadTooltip", "rag", "i18n gap 보강 (2026-06-06)", "참조된 대화 스레드");
    createTranslationKeyIfNotExists(
        "rag.chat.documentFallback", "rag", "i18n gap 보강 (2026-06-06)", "문서 {index}");
    createTranslationKeyIfNotExists(
        "rag.chat.documentTooltip", "rag", "i18n gap 보강 (2026-06-06)", "문서 상세 정보 보기");
    createTranslationKeyIfNotExists(
        "rag.chat.generatedTestCases", "rag", "i18n gap 보강 (2026-06-06)", "생성된 테스트 케이스 ({count})");
    createTranslationKeyIfNotExists(
        "rag.chat.hideJson", "rag", "i18n gap 보강 (2026-06-06)", "JSON 원본 숨기기");
    createTranslationKeyIfNotExists(
        "rag.chat.jsonHidden", "rag", "i18n gap 보강 (2026-06-06)", "테스트 케이스 데이터가 감지되었습니다.");
    createTranslationKeyIfNotExists(
        "rag.chat.showJson", "rag", "i18n gap 보강 (2026-06-06)", "JSON 원본 보기");
    createTranslationKeyIfNotExists(
        "rag.chat.stopStreaming", "rag", "i18n gap 보강 (2026-06-06)", "전송 중지");
    createTranslationKeyIfNotExists(
        "rag.chat.testCaseDocumentLabel", "rag", "i18n gap 보강 (2026-06-06)", "테스트케이스: {name}");
    createTranslationKeyIfNotExists(
        "rag.chat.testCaseDocumentTooltip", "rag", "i18n gap 보강 (2026-06-06)", "새 탭에서 테스트케이스 상세 보기");
    createTranslationKeyIfNotExists(
        "rag.chat.threadDeleteConfirm", "rag", "i18n gap 보강 (2026-06-06)", "이 스레드를 삭제하시겠습니까? 대화 내역이 모두 삭제됩니다.");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.chunkNumber", "rag", "i18n gap 보강 (2026-06-06)", "청크 #{number}");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.conversationThread", "rag", "i18n gap 보강 (2026-06-06)", "대화 스레드");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.copy", "rag", "i18n gap 보강 (2026-06-06)", "복사");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.similarity", "rag", "i18n gap 보강 (2026-06-06)", "유사도: {score}%");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.title", "rag", "i18n gap 보강 (2026-06-06)", "청크 상세 보기");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.typeConversation", "rag", "i18n gap 보강 (2026-06-06)", "대화");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.typeDocument", "rag", "i18n gap 보강 (2026-06-06)", "문서");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.typeTestCase", "rag", "i18n gap 보강 (2026-06-06)", "테스트케이스");
    createTranslationKeyIfNotExists(
        "rag.chunk.preview.viewDocument", "rag", "i18n gap 보강 (2026-06-06)", "전체 문서 보기");
    createTranslationKeyIfNotExists(
        "rag.document.analyze", "rag", "i18n gap 보강 (2026-06-06)", "문서 분석");
    createTranslationKeyIfNotExists(
        "rag.document.completedAt", "rag", "i18n gap 보강 (2026-06-06)", "완료 시각");
    createTranslationKeyIfNotExists(
        "rag.document.cost", "rag", "i18n gap 보강 (2026-06-06)", "비용 (USD)");
    createTranslationKeyIfNotExists(
        "rag.document.error", "rag", "i18n gap 보강 (2026-06-06)", "에러");
    createTranslationKeyIfNotExists(
        "rag.document.errorPresent", "rag", "i18n gap 보강 (2026-06-06)", "에러 있음");
    createTranslationKeyIfNotExists(
        "rag.document.generateEmbedding", "rag", "i18n gap 보강 (2026-06-06)", "임베딩 생성");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistory", "rag", "i18n gap 보강 (2026-06-06)", "작업 이력");
    createTranslationKeyIfNotExists(
        "rag.document.jobHistoryEmpty", "rag", "i18n gap 보강 (2026-06-06)", "이 문서에 대한 작업 이력이 없습니다.");
    createTranslationKeyIfNotExists(
        "rag.document.jobId", "rag", "i18n gap 보강 (2026-06-06)", "작업 ID");
    createTranslationKeyIfNotExists(
        "rag.document.list.loading", "rag", "i18n gap 보강 (2026-06-06)", "로딩 중");
    createTranslationKeyIfNotExists(
        "rag.document.list.parserAuto", "rag", "i18n gap 보강 (2026-06-06)", "자동 선택");
    createTranslationKeyIfNotExists(
        "rag.document.list.parserUnknown", "rag", "i18n gap 보강 (2026-06-06)", "알 수 없음");
    createTranslationKeyIfNotExists(
        "rag.document.llmAnalysis", "rag", "i18n gap 보강 (2026-06-06)", "LLM 분석");
    createTranslationKeyIfNotExists(
        "rag.document.llmModel", "rag", "i18n gap 보강 (2026-06-06)", "LLM 모델");
    createTranslationKeyIfNotExists(
        "rag.document.llmProvider", "rag", "i18n gap 보강 (2026-06-06)", "LLM 제공자");
    createTranslationKeyIfNotExists(
        "rag.document.pausedAt", "rag", "i18n gap 보강 (2026-06-06)", "일시정지 시각");
    createTranslationKeyIfNotExists(
        "rag.document.preview", "rag", "i18n gap 보강 (2026-06-06)", "PDF 미리보기");
    createTranslationKeyIfNotExists(
        "rag.document.startedAt", "rag", "i18n gap 보강 (2026-06-06)", "시작 시각");
    createTranslationKeyIfNotExists(
        "rag.document.status", "rag", "i18n gap 보강 (2026-06-06)", "상태");
    createTranslationKeyIfNotExists(
        "rag.document.summary", "rag", "i18n gap 보강 (2026-06-06)", "LLM 분석 요약 보기");
    createTranslationKeyIfNotExists(
        "rag.document.summary.analyzedChunks", "rag", "i18n gap 보강 (2026-06-06)", "분석 완료: {0}개");
    createTranslationKeyIfNotExists(
        "rag.document.summary.progress", "rag", "i18n gap 보강 (2026-06-06)", "진행률: {0}%");
    createTranslationKeyIfNotExists(
        "rag.document.summary.totalChunks", "rag", "i18n gap 보강 (2026-06-06)", "총 {0}개 청크");
    createTranslationKeyIfNotExists(
        "rag.document.summaryProgress", "rag", "i18n gap 보강 (2026-06-06)", "진행률");
    createTranslationKeyIfNotExists(
        "rag.document.tokens", "rag", "i18n gap 보강 (2026-06-06)", "토큰");
    createTranslationKeyIfNotExists(
        "rag.llmAnalysis.title", "rag", "i18n gap 보강 (2026-06-06)", "LLM 청크 분석");
    createTranslationKeyIfNotExists(
        "rag.testcase.bulkAddButton", "rag", "i18n gap 보강 (2026-06-06)", "스프레드시트로 일괄 추가");
    createTranslationKeyIfNotExists(
        "rag.testcase.spreadsheet.dialog.subtitle", "rag", "i18n gap 보강 (2026-06-06)", "총 {count}개의 테스트케이스를 스프레드시트에서 편집하고 저장하세요.");
    createTranslationKeyIfNotExists(
        "rag.testcase.spreadsheet.dialog.title", "rag", "i18n gap 보강 (2026-06-06)", "AI 생성 테스트케이스 일괄 추가");
    createTranslationKeyIfNotExists(
        "testCase.export.noData", "testCase", "i18n gap 보강 (2026-06-06)", "내보낼 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "testCase.export.pdfError", "testCase", "i18n gap 보강 (2026-06-06)", "PDF 다운로드 중 오류가 발생했습니다: {message}");
    createTranslationKeyIfNotExists(
        "testCase.export.pdfSuccess", "testCase", "i18n gap 보강 (2026-06-06)", "PDF 파일이 다운로드되었습니다: {filename}");
    createTranslationKeyIfNotExists(
        "testCase.form.tags", "testCase", "i18n gap 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "testCase.priority.label", "testCase", "i18n gap 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testCaseResult.page.loadingData", "testCaseResult", "i18n gap 보강 (2026-06-06)", "테스트 케이스 정보를 불러오는 중입니다...");
    createTranslationKeyIfNotExists(
        "testExecution.actions.copyResultLink", "testExecution", "i18n gap 보강 (2026-06-06)", "결과 입력 링크 복사");
    createTranslationKeyIfNotExists(
        "testExecution.actions.linkCopied", "testExecution", "i18n gap 보강 (2026-06-06)", "결과 입력 링크가 클립보드에 복사되었습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.jiraHelp", "testExecution", "i18n gap 보강 (2026-06-06)", "여러 개의 이슈 키는 콤마(,)로 구분하여 입력하세요.");
    createTranslationKeyIfNotExists(
        "testExecution.filter.executionDate", "testExecution", "i18n gap 보강 (2026-06-06)", "실행일자");
    createTranslationKeyIfNotExists(
        "testExecution.filter.notes", "testExecution", "i18n gap 보강 (2026-06-06)", "노트");
    createTranslationKeyIfNotExists(
        "testExecution.filter.notes.placeholder", "testExecution", "i18n gap 보강 (2026-06-06)", "search notes");
    createTranslationKeyIfNotExists(
        "testExecution.list.noMoreExecutions", "testExecution", "i18n gap 보강 (2026-06-06)", "모든 데이터를 불러왔습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.currentExecution", "testExecution", "i18n gap 보강 (2026-06-06)", "현재 실행");
    createTranslationKeyIfNotExists(
        "testExecution.scroll.hint", "testExecution", "i18n gap 보강 (2026-06-06)", "스크롤하여 더 보기");
    createTranslationKeyIfNotExists(
        "testExecution.sections.filters", "testExecution", "i18n gap 보강 (2026-06-06)", "필터");
    createTranslationKeyIfNotExists(
        "testExecution.sections.list", "testExecution", "i18n gap 보강 (2026-06-06)", "테스트 실행 목록");
    createTranslationKeyIfNotExists(
        "testExecution.summary.cases", "testExecution", "i18n gap 보강 (2026-06-06)", "건");
    createTranslationKeyIfNotExists(
        "testExecution.summary.total", "testExecution", "i18n gap 보강 (2026-06-06)", "총");
    createTranslationKeyIfNotExists(
        "testExecution.table.id", "testExecution", "i18n gap 보강 (2026-06-06)", "ID");
    createTranslationKeyIfNotExists(
        "testExecution.table.totalCount", "testExecution", "i18n gap 보강 (2026-06-06)", "전체: {count}건");
    createTranslationKeyIfNotExists(
        "testPlan.linkAutomated.searchPlaceholder", "testPlan", "i18n gap 보강 (2026-06-06)", "실행 이름 또는 파일명으로 검색");
    createTranslationKeyIfNotExists(
        "testPlan.linkAutomated.title", "testPlan", "i18n gap 보강 (2026-06-06)", "자동화 테스트 연결");
    createTranslationKeyIfNotExists(
        "testResult.button.delete", "testResult", "i18n gap 보강 (2026-06-06)", "삭제");
    createTranslationKeyIfNotExists(
        "testResult.button.jiraStatusLoading", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 상태 확인 중...");
    createTranslationKeyIfNotExists(
        "testResult.button.refresh", "testResult", "i18n gap 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists(
        "testResult.button.view", "testResult", "i18n gap 보강 (2026-06-06)", "보기");
    createTranslationKeyIfNotExists(
        "testResult.default.noData", "testResult", "i18n gap 보강 (2026-06-06)", "데이터 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noExecutor", "testResult", "i18n gap 보강 (2026-06-06)", "실행자 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noExpectedResult", "testResult", "i18n gap 보강 (2026-06-06)", "기대 결과 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noFolder", "testResult", "i18n gap 보강 (2026-06-06)", "폴더 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noNotes", "testResult", "i18n gap 보강 (2026-06-06)", "노트 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noPreCondition", "testResult", "i18n gap 보강 (2026-06-06)", "사전설정 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noSteps", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 단계 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noTestCase", "testResult", "i18n gap 보강 (2026-06-06)", "테스트케이스 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noTestExecution", "testResult", "i18n gap 보강 (2026-06-06)", "테스트실행 없음");
    createTranslationKeyIfNotExists(
        "testResult.default.noTestPlan", "testResult", "i18n gap 보강 (2026-06-06)", "테스트플랜 없음");
    createTranslationKeyIfNotExists(
        "testResult.export.attachmentsAvailable", "testResult", "i18n gap 보강 (2026-06-06)", "첨부 있음");
    createTranslationKeyIfNotExists(
        "testResult.export.error.noData", "testResult", "i18n gap 보강 (2026-06-06)", "내보내기할 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.detailTitle", "testResult", "i18n gap 보강 (2026-06-06)", "🔍 상세 테스트 결과 리스트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.generatedAt", "testResult", "i18n gap 보강 (2026-06-06)", "생성일시");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.project", "testResult", "i18n gap 보강 (2026-06-06)", "프로젝트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.executionRate", "testResult", "i18n gap 보강 (2026-06-06)", "실행률");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.jiraLinked", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 연동");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.noPeriod", "testResult", "i18n gap 보강 (2026-06-06)", "기간 정보 없음");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.successRate", "testResult", "i18n gap 보강 (2026-06-06)", "성공률");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.total", "testResult", "i18n gap 보강 (2026-06-06)", "총 테스트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summaryTitle", "testResult", "i18n gap 보강 (2026-06-06)", "📝 테스트 수행 요약");
    createTranslationKeyIfNotExists(
        "testResult.filter.executionView", "testResult", "i18n gap 보강 (2026-06-06)", "실행별");
    createTranslationKeyIfNotExists(
        "testResult.filter.folderView", "testResult", "i18n gap 보강 (2026-06-06)", "폴더별");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.action", "testResult", "i18n gap 보강 (2026-06-06)", "이동");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.folder", "testResult", "i18n gap 보강 (2026-06-06)", "폴더 경로");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.testCase", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.testPlan", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 플랜");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.count", "testResult", "i18n gap 보강 (2026-06-06)", "{count}건");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.goToExecutionAll", "testResult", "i18n gap 보강 (2026-06-06)", "실행 페이지로 이동");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.loadError", "testResult", "i18n gap 보강 (2026-06-06)", "케이스 목록을 불러오는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.noFail", "testResult", "i18n gap 보강 (2026-06-06)", "실패 케이스가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.noNotRun", "testResult", "i18n gap 보강 (2026-06-06)", "미실행 케이스가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.unnamed", "testResult", "i18n gap 보강 (2026-06-06)", "(이름 없음)");
    createTranslationKeyIfNotExists(
        "testResult.folder.depthView", "testResult", "i18n gap 보강 (2026-06-06)", "폴더 트리 (Depth View)");
    createTranslationKeyIfNotExists(
        "testResult.folder.detailStats", "testResult", "i18n gap 보강 (2026-06-06)", "상세 통계 (선택된 폴더)");
    createTranslationKeyIfNotExists(
        "testResult.folder.executionCount", "testResult", "i18n gap 보강 (2026-06-06)", "수행 횟수");
    createTranslationKeyIfNotExists(
        "testResult.folder.name", "testResult", "i18n gap 보강 (2026-06-06)", "폴더명");
    createTranslationKeyIfNotExists(
        "testResult.folder.root", "testResult", "i18n gap 보강 (2026-06-06)", "전체");
    createTranslationKeyIfNotExists(
        "testResult.folder.successRate", "testResult", "i18n gap 보강 (2026-06-06)", "성공률");
    createTranslationKeyIfNotExists(
        "testResult.folder.total", "testResult", "i18n gap 보강 (2026-06-06)", "전체");
    createTranslationKeyIfNotExists(
        "testResult.folder.totalCases", "testResult", "i18n gap 보강 (2026-06-06)", "전체 케이스");
    createTranslationKeyIfNotExists(
        "testResult.folder.totalSuccessRate", "testResult", "i18n gap 보강 (2026-06-06)", "전체 성공률");
    createTranslationKeyIfNotExists(
        "testResult.form.priority", "testResult", "i18n gap 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testResult.form.tagsPlaceholder", "testResult", "i18n gap 보강 (2026-06-06)", "태그를 입력하고 Enter를 누르세요");
    createTranslationKeyIfNotExists(
        "testResult.helper.tags", "testResult", "i18n gap 보강 (2026-06-06)", "여러 태그를 입력할 수 있습니다");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.caseCount", "testResult", "i18n gap 보강 (2026-06-06)", "{count}개 케이스");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.col.folder", "testResult", "i18n gap 보강 (2026-06-06)", "폴더 경로");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.col.jiraKey", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 이슈");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.col.result", "testResult", "i18n gap 보강 (2026-06-06)", "결과");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.col.testCase", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.count", "testResult", "i18n gap 보강 (2026-06-06)", "{count}건");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.deduplicatedNote", "testResult", "i18n gap 보강 (2026-06-06)", "* JIRA 이슈 키 기준 중복 제거된 목록");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.empty", "testResult", "i18n gap 보강 (2026-06-06)", "연동된 JIRA 이슈가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.loadError", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 목록을 불러오는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.openJira", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.title", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 연동 이슈 목록");
    createTranslationKeyIfNotExists(
        "testResult.message.deleteConfirm", "testResult", "i18n gap 보강 (2026-06-06)", "이 테스트 결과를 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "testResult.message.deleteSuccess", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 결과가 성공적으로 삭제되었습니다.");
    createTranslationKeyIfNotExists(
        "testResult.message.exportFailed", "testResult", "i18n gap 보강 (2026-06-06)", "CSV 내보내기에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.message.exportSuccess", "testResult", "i18n gap 보강 (2026-06-06)", "CSV 파일이 성공적으로 내보내졌습니다.");
    createTranslationKeyIfNotExists(
        "testResult.message.loading", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 결과를 불러오는 중...");
    createTranslationKeyIfNotExists(
        "testResult.message.noChange", "testResult", "i18n gap 보강 (2026-06-06)", "변경 사항이 없어 저장하지 않았습니다.");
    createTranslationKeyIfNotExists(
        "testResult.message.noData", "testResult", "i18n gap 보강 (2026-06-06)", "표시할 테스트 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.status.loading", "testResult", "i18n gap 보강 (2026-06-06)", "불러오는 중...");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.delete", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 결과 삭제");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.edit", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 결과 편집");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.export", "testResult", "i18n gap 보강 (2026-06-06)", "CSV로 내보내기");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.jiraNotConfigured", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 설정이 필요합니다");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noExpectedResult", "testResult", "i18n gap 보강 (2026-06-06)", "기대 결과 없음");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noJiraTargets", "testResult", "i18n gap 보강 (2026-06-06)", "연결된 JIRA ID가 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noSteps", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 단계 없음");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noTestTechnique", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 기법 없음");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.refresh", "testResult", "i18n gap 보강 (2026-06-06)", "데이터 새로고침");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.view", "testResult", "i18n gap 보강 (2026-06-06)", "테스트 결과 보기");
    createTranslationKeyIfNotExists(
        "testResultDashboard.chart.executionComparison", "testResultDashboard", "i18n gap 보강 (2026-06-06)", "실행별 결과 비교");
    createTranslationKeyIfNotExists(
        "testResultDashboard.chart.folderComparison", "testResultDashboard", "i18n gap 보강 (2026-06-06)", "폴더별 결과 비교");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.features.edit", "testcase", "i18n gap 보강 (2026-06-06)", "더블 클릭으로 셀 편집, Enter로 편집 완료 및 다음 행 이동, Tab으로 다음 셀 이동.");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.tips.multiline", "testcase", "i18n gap 보강 (2026-06-06)", "여러 줄 입력이 필요한 경우 일반 입력 모드를 사용하세요.");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.tips.title", "testcase", "i18n gap 보강 (2026-06-06)", "팁:");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoLabel", "testcase", "i18n gap 보강 (2026-06-06)", "자동");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoMode.off", "testcase", "i18n gap 보강 (2026-06-06)", "자동 생성 OFF - 버튼을 눌러 수동 생성");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoMode.on", "testcase", "i18n gap 보강 (2026-06-06)", "자동 생성 ON - 스텝 입력 시 자동으로 Name/Description 생성");
    createTranslationKeyIfNotExists(
        "testcase.ai.error.failed", "testcase", "i18n gap 보강 (2026-06-06)", "AI 생성에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.ai.error.noSteps", "testcase", "i18n gap 보강 (2026-06-06)", "AI 생성을 위해 최소 1개 이상의 스텝을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.ai.generateTooltip", "testcase", "i18n gap 보강 (2026-06-06)", "AI로 Name/Description 자동 생성");
    createTranslationKeyIfNotExists(
        "testcase.ai.generating", "testcase", "i18n gap 보강 (2026-06-06)", "AI 생성 중...");
    createTranslationKeyIfNotExists(
        "testcase.ai.manualLabel", "testcase", "i18n gap 보강 (2026-06-06)", "수동");
    createTranslationKeyIfNotExists(
        "testcase.autoSave.error", "testcase", "i18n gap 보강 (2026-06-06)", "자동 저장 실패");
    createTranslationKeyIfNotExists(
        "testcase.autoSave.saved", "testcase", "i18n gap 보강 (2026-06-06)", "저장됨");
    createTranslationKeyIfNotExists(
        "testcase.autoSave.saving", "testcase", "i18n gap 보강 (2026-06-06)", "저장 중...");
    createTranslationKeyIfNotExists(
        "testcase.column.createdBy", "testcase", "i18n gap 보강 (2026-06-06)", "작성자");
    createTranslationKeyIfNotExists(
        "testcase.column.description", "testcase", "i18n gap 보강 (2026-06-06)", "설명");
    createTranslationKeyIfNotExists(
        "testcase.column.name", "testcase", "i18n gap 보강 (2026-06-06)", "이름");
    createTranslationKeyIfNotExists(
        "testcase.column.notes", "testcase", "i18n gap 보강 (2026-06-06)", "비고");
    createTranslationKeyIfNotExists(
        "testcase.column.priority", "testcase", "i18n gap 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testcase.column.steps", "testcase", "i18n gap 보강 (2026-06-06)", "스텝");
    createTranslationKeyIfNotExists(
        "testcase.column.tags", "testcase", "i18n gap 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "testcase.column.updatedBy", "testcase", "i18n gap 보강 (2026-06-06)", "수정자");
    createTranslationKeyIfNotExists(
        "testcase.description", "testcase", "i18n gap 보강 (2026-06-06)", "설명");
    createTranslationKeyIfNotExists(
        "testcase.dialog.delete.folderWarning", "testcase", "i18n gap 보강 (2026-06-06)", "폴더를 삭제하면 하위 테스트 케이스도 모두 삭제됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.expectedResults", "testcase", "i18n gap 보강 (2026-06-06)", "예상 결과 (전체)");
    createTranslationKeyIfNotExists(
        "testcase.field.description", "testcase", "i18n gap 보강 (2026-06-06)", "설명");
    createTranslationKeyIfNotExists(
        "testcase.field.expectedResults", "testcase", "i18n gap 보강 (2026-06-06)", "예상 결과");
    createTranslationKeyIfNotExists(
        "testcase.field.name", "testcase", "i18n gap 보강 (2026-06-06)", "테스트케이스명");
    createTranslationKeyIfNotExists(
        "testcase.field.preCondition", "testcase", "i18n gap 보강 (2026-06-06)", "전제조건");
    createTranslationKeyIfNotExists(
        "testcase.field.priority", "testcase", "i18n gap 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testcase.field.steps", "testcase", "i18n gap 보강 (2026-06-06)", "테스트 스텝");
    createTranslationKeyIfNotExists(
        "testcase.field.tags", "testcase", "i18n gap 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "testcase.form.button.cancel", "testcase", "i18n gap 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "testcase.form.button.save", "testcase", "i18n gap 보강 (2026-06-06)", "저장");
    createTranslationKeyIfNotExists(
        "testcase.form.button.saving", "testcase", "i18n gap 보강 (2026-06-06)", "저장 중...");
    createTranslationKeyIfNotExists(
        "testcase.form.button.update", "testcase", "i18n gap 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "testcase.form.fieldVisibility", "testcase", "i18n gap 보강 (2026-06-06)", "표시할 필드 선택");
    createTranslationKeyIfNotExists(
        "testcase.form.readOnly", "testcase", "i18n gap 보강 (2026-06-06)", "읽기 전용");
    createTranslationKeyIfNotExists(
        "testcase.form.reorder", "testcase", "i18n gap 보강 (2026-06-06)", "순서");
    createTranslationKeyIfNotExists(
        "testcase.helper.enterContent", "testcase", "i18n gap 보강 (2026-06-06)", "내용을 입력하세요.");
    createTranslationKeyIfNotExists(
        "testcase.helper.folderTags", "testcase", "i18n gap 보강 (2026-06-06)", "폴더에 태그를 추가하면 하위 모든 테스트케이스에도 적용됩니다 (자동 전파)");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.altLabel", "testcase", "i18n gap 보강 (2026-06-06)", "대체 텍스트");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.description", "testcase", "i18n gap 보강 (2026-06-06)", "본문에 삽입된 이미지");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.dialogTitle", "testcase", "i18n gap 보강 (2026-06-06)", "클립보드 이미지 옵션");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.helper", "testcase", "i18n gap 보강 (2026-06-06)", "이미지는 MinIO에 업로드되며 공개 토큰 URL로 본문에 삽입됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.insert", "testcase", "i18n gap 보강 (2026-06-06)", "삽입");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.previewUnavailable", "testcase", "i18n gap 보강 (2026-06-06)", "미리보기를 불러오는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.saveRequired", "testcase", "i18n gap 보강 (2026-06-06)", "이미지를 붙여넣으려면 테스트케이스를 먼저 저장하세요.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.unit", "testcase", "i18n gap 보강 (2026-06-06)", "단위");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.uploadFailed", "testcase", "i18n gap 보강 (2026-06-06)", "이미지 업로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.uploadingProgress", "testcase", "i18n gap 보강 (2026-06-06)", "클립보드 이미지를 업로드하는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.urlMissing", "testcase", "i18n gap 보강 (2026-06-06)", "이미지 URL을 생성하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.width", "testcase", "i18n gap 보강 (2026-06-06)", "가로 크기");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.widthHelper", "testcase", "i18n gap 보강 (2026-06-06)", "비워두면 100%로 표시합니다.");
    createTranslationKeyIfNotExists(
        "testcase.io.export.google.label", "testcase", "i18n gap 보강 (2026-06-06)", "2. Google Sheets 설정");
    createTranslationKeyIfNotExists(
        "testcase.io.import.url.required", "testcase", "i18n gap 보강 (2026-06-06)", "Google Sheets URL을 입력하세요");
    createTranslationKeyIfNotExists(
        "testcase.message.confirmDiscard", "testcase", "i18n gap 보강 (2026-06-06)", "작성 중인 내용이 있습니다. 새 케이스를 추가하시겠습니까? 기존 내용은 사라집니다.");
    createTranslationKeyIfNotExists(
        "testcase.message.selectTreeItem", "testcase", "i18n gap 보강 (2026-06-06)", "좌측 트리에서 항목을 선택하면 상세 정보를 볼 수 있습니다.");
    createTranslationKeyIfNotExists(
        "testcase.metadata", "testcase", "i18n gap 보강 (2026-06-06)", "메타데이터");
    createTranslationKeyIfNotExists(
        "testcase.noSteps", "testcase", "i18n gap 보강 (2026-06-06)", "스텝이 없습니다.");
    createTranslationKeyIfNotExists(
        "testcase.postCondition", "testcase", "i18n gap 보강 (2026-06-06)", "사후 조건");
    createTranslationKeyIfNotExists(
        "testcase.preCondition", "testcase", "i18n gap 보강 (2026-06-06)", "전제 조건");
    createTranslationKeyIfNotExists(
        "testcase.rag.checking.label", "testcase", "i18n gap 보강 (2026-06-06)", "상태 확인 중...");
    createTranslationKeyIfNotExists(
        "testcase.rag.checking.tooltip", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 등록 상태를 확인하는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.rag.notVectorized.label", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 미등록");
    createTranslationKeyIfNotExists(
        "testcase.rag.notVectorized.tooltip", "testcase", "i18n gap 보강 (2026-06-06)", "이 테스트케이스는 아직 RAG 시스템에 등록되지 않았습니다. 등록하면 유사 테스트케이스 검색에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.rag.register", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 등록");
    createTranslationKeyIfNotExists(
        "testcase.rag.register.tooltip", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 시스템에 등록하면 유사 테스트케이스 검색 및 AI 추천에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.rag.registering", "testcase", "i18n gap 보강 (2026-06-06)", "등록 중...");
    createTranslationKeyIfNotExists(
        "testcase.rag.vectorized.label", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 등록됨");
    createTranslationKeyIfNotExists(
        "testcase.rag.vectorized.tooltip", "testcase", "i18n gap 보강 (2026-06-06)", "이 테스트케이스는 RAG 시스템에 등록되어 유사도 검색에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.button.addRow", "testcase", "i18n gap 보강 (2026-06-06)", "행 추가");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.button.deleteRows", "testcase", "i18n gap 보강 (2026-06-06)", "선택 삭제");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.delete.description", "testcase", "i18n gap 보강 (2026-06-06)", "{count}개 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.notification.stepChanged", "testcase", "i18n gap 보강 (2026-06-06)", "스텝 수가 {count}개로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.status.batchEdit", "testcase", "i18n gap 보강 (2026-06-06)", "대량 편집");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validation.successTitle", "testcase", "i18n gap 보강 (2026-06-06)", "검증 통과");
    createTranslationKeyIfNotExists(
        "testcase.step.action", "testcase", "i18n gap 보강 (2026-06-06)", "설명");
    createTranslationKeyIfNotExists(
        "testcase.step.expected", "testcase", "i18n gap 보강 (2026-06-06)", "예상 결과");
    createTranslationKeyIfNotExists(
        "testcase.step.number", "testcase", "i18n gap 보강 (2026-06-06)", "번호");
    createTranslationKeyIfNotExists(
        "testcase.steps", "testcase", "i18n gap 보강 (2026-06-06)", "스텝 상세");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.addTestCase", "testcase", "i18n gap 보강 (2026-06-06)", "테스트케이스 추가");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.cancelOrder", "testcase", "i18n gap 보강 (2026-06-06)", "순서 변경 취소");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.deleteSelected", "testcase", "i18n gap 보강 (2026-06-06)", "삭제 ({count})");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.editOrder", "testcase", "i18n gap 보강 (2026-06-06)", "순서 변경");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.refresh", "testcase", "i18n gap 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists(
        "testcase.tree.action.saveOrder", "testcase", "i18n gap 보강 (2026-06-06)", "순서 저장");
    createTranslationKeyIfNotExists(
        "testcase.tree.count.folder", "testcase", "i18n gap 보강 (2026-06-06)", "Folder: {count}");
    createTranslationKeyIfNotExists(
        "testcase.tree.count.testcase", "testcase", "i18n gap 보강 (2026-06-06)", "TC: {count}");
    createTranslationKeyIfNotExists(
        "testcase.tree.dialog.deleting", "testcase", "i18n gap 보강 (2026-06-06)", "삭제 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.tree.dialog.deletingMessage", "testcase", "i18n gap 보강 (2026-06-06)", "하위 항목과 첨부파일을 포함하여 삭제하고 있습니다. 잠시만 기다려주세요.");
    createTranslationKeyIfNotExists(
        "testcase.tree.error.moveFailed", "testcase", "i18n gap 보강 (2026-06-06)", "이동에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "theme.dark", "theme", "i18n gap 보강 (2026-06-06)", "다크 모드");
    createTranslationKeyIfNotExists(
        "theme.light", "theme", "i18n gap 보강 (2026-06-06)", "라이트 모드");
    createTranslationKeyIfNotExists(
        "userList.action.sendVerificationEmail", "userList", "i18n gap 보강 (2026-06-06)", "인증 이메일 발송");
    createTranslationKeyIfNotExists(
        "userList.email.error", "userList", "i18n gap 보강 (2026-06-06)", "이메일 발송 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "userList.email.failed", "userList", "i18n gap 보강 (2026-06-06)", "이메일 발송에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "userList.email.notVerified", "userList", "i18n gap 보강 (2026-06-06)", "미인증");
    createTranslationKeyIfNotExists(
        "userList.email.sent", "userList", "i18n gap 보강 (2026-06-06)", "인증 이메일이 발송되었습니다.");
    createTranslationKeyIfNotExists(
        "userList.email.verified", "userList", "i18n gap 보강 (2026-06-06)", "인증됨");
    createTranslationKeyIfNotExists(
        "userList.table.emailVerified", "userList", "i18n gap 보강 (2026-06-06)", "이메일 인증");
    createTranslationKeyIfNotExists(
        "validation.email.invalid", "validation", "i18n gap 보강 (2026-06-06)", "올바른 이메일 형식이 아닙니다");
    createTranslationKeyIfNotExists(
        "validation.password.minLength", "validation", "i18n gap 보강 (2026-06-06)", "비밀번호는 최소 8자 이상이어야 합니다");
    createTranslationKeyIfNotExists(
        "validation.password.mismatch", "validation", "i18n gap 보강 (2026-06-06)", "비밀번호가 일치하지 않습니다.");
    createTranslationKeyIfNotExists(
        "validation.required", "validation", "i18n gap 보강 (2026-06-06)", "필수 입력 항목입니다");
    createTranslationKeyIfNotExists(
        "validation.required.all", "validation", "i18n gap 보강 (2026-06-06)", "모든 필드를 입력해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.message.confirmTagCleanup", "testcase", "i18n gap 보강 (2026-06-06)", "이전 폴더의 태그 [{tags}]를 삭제하시겠습니까?\n'예'를 선택하면 해당 태그가 삭제되고, '아니오'를 선택하면 유지됩니다.");

    log.info("i18n gap 번역 키 초기화 완료");
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
