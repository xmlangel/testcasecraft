// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/I18nGapKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.config.i18n.I18nSeedIndex;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 2026-06-06 i18n 전수 감사에서 발견된 누락 번역 키 일괄 등록.
 *
 * <p>프런트엔드 t() 호출 키 중 DB에 없던 키 + ko만 있고 en이 없던 키 481건. 산출 근거: .workspace/i18n-audit (코드 t() 키 추출 vs
 * /api/i18n/translations 비교).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class I18nGapKeysInitializer {

  private final I18nSeedIndex seedIndex;
  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    log.info("i18n gap 번역 키 초기화 시작 (481건)");

    createTranslationKeyIfNotExists(
        "admin.globalDoc.jobHistoryFailed",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "작업 이력을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.message.fetchFailed",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "공통 문서를 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.summary.fetchFailed",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "분석 결과 조회에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.globalDoc.summary.notReady",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "아직 요약을 확인할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.tab.globalDocuments", "admin", "i18n gap 보강 (2026-06-06)", "RAG 공통 문서");
    createTranslationKeyIfNotExists(
        "admin.llmConfig.tab.system", "admin", "i18n gap 보강 (2026-06-06)", "시스템 설정");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.cancel", "admin", "i18n gap 보강 (2026-06-06)", "취소");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.chunkBatchSize", "admin", "i18n gap 보강 (2026-06-06)", "배치 크기");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.chunkBatchSizeHelper",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "한 번에 처리할 청크 개수");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.description",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "RAG 문서 분석 시 사용되는 기본 설정입니다. UI와 Backend 스케줄러가 공통으로 사용합니다.");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.edit", "admin", "i18n gap 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.lastModified", "admin", "i18n gap 보강 (2026-06-06)", "마지막 수정: {0}");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.maxTokens", "admin", "i18n gap 보강 (2026-06-06)", "최대 토큰");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.message.updateFailed",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "LLM 템플릿 업데이트 실패");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.message.updated",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "LLM 분석 템플릿이 업데이트되었습니다");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.pauseAfterBatch", "admin", "i18n gap 보강 (2026-06-06)", "배치마다 일시정지");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.promptTemplate", "admin", "i18n gap 보강 (2026-06-06)", "프롬프트 템플릿");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.promptTemplateHelper",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "{chunk_text} 플레이스홀더를 사용하세요");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.save", "admin", "i18n gap 보강 (2026-06-06)", "저장");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.temperature", "admin", "i18n gap 보강 (2026-06-06)", "온도");
    createTranslationKeyIfNotExists(
        "admin.llmTemplate.title", "admin", "i18n gap 보강 (2026-06-06)", "🤖 LLM 청크 분석 기본 템플릿");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.fetchError",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "설정을 불러오는데 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragTitle", "admin", "i18n gap 보강 (2026-06-06)", "RAG 시스템 설정");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragToggleDesc",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "이 설정을 끄면 시스템 전체에서 RAG 기능 및 LLM 호출이 비활성화됩니다. RAG 시스템이 불안정하거나 유지보수가 필요할 때 사용하세요.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.ragToggleTitle",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "RAG 기능 활성화 상태");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.vectorWriteTitle", "admin", "벡터 색인 분리 옵션 (2026-08-22)", "벡터 색인");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.vectorWriteDesc",
        "admin",
        "벡터 색인 분리 옵션 (2026-08-22)",
        "이 설정을 끄면 새 벡터를 만드는 작업만 멈춥니다. 문서 업로드·분석·임베딩 생성과 테스트케이스·대화 색인이 중지되고, 이미 색인된 자료로 질문하는 것은 그대로"
            + " 됩니다. 임베딩 비용을 묶어 두거나 색인을 잠시 멈출 때 사용하세요.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.vectorWriteRagOff",
        "admin",
        "벡터 색인 분리 옵션 (2026-08-22)",
        "RAG 기능이 꺼져 있어 이 설정은 적용되지 않습니다. 질문과 색인이 모두 중지된 상태입니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.vectorWriteOffNotice",
        "admin",
        "벡터 색인 분리 옵션 (2026-08-22)",
        "색인이 멈춘 동안 추가하거나 수정한 테스트케이스는 검색 결과에 반영되지 않습니다. 다시 켜도 그 사이 변경분은 자동으로 따라잡지 않으므로 필요하면 문서를 다시"
            + " 분석해야 합니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.vectorWriteToggleDescription",
        "admin",
        "벡터 색인 분리 옵션 (2026-08-22)",
        "벡터 색인 활성화 토글");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.saveError", "admin", "i18n gap 보강 (2026-06-06)", "설정 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "admin.systemSettings.saveSuccess",
        "admin",
        "i18n gap 보강 (2026-06-06)",
        "시스템 설정이 성공적으로 저장되었습니다.");
    createTranslationKeyIfNotExists(
        "attachments.button.preview", "attachments", "i18n gap 보강 (2026-06-06)", "미리보기");
    createTranslationKeyIfNotExists(
        "attachments.error.previewError",
        "attachments",
        "i18n gap 보강 (2026-06-06)",
        "미리보기를 생성할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "autoSave.error", "autoSave", "i18n gap 보강 (2026-06-06)", "자동 저장에 실패했습니다.");
    createTranslationKeyIfNotExists("common.add", "common", "i18n gap 보강 (2026-06-06)", "추가");
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
    createTranslationKeyIfNotExists("common.content", "common", "i18n gap 보강 (2026-06-06)", "내용");
    createTranslationKeyIfNotExists("common.copied", "common", "i18n gap 보강 (2026-06-06)", "복사됨!");
    createTranslationKeyIfNotExists("common.copy", "common", "i18n gap 보강 (2026-06-06)", "복사");
    createTranslationKeyIfNotExists(
        "common.description", "common", "i18n gap 보강 (2026-06-06)", "버그 설명");
    createTranslationKeyIfNotExists(
        "common.disabled", "common", "i18n gap 보강 (2026-06-06)", "비활성화됨");
    createTranslationKeyIfNotExists(
        "common.duration", "common", "i18n gap 보강 (2026-06-06)", "수행 시간");
    createTranslationKeyIfNotExists("common.enabled", "common", "i18n gap 보강 (2026-06-06)", "활성화됨");
    createTranslationKeyIfNotExists(
        "common.errors.invalidIssueKey", "common", "i18n gap 보강 (2026-06-06)", "유효하지 않은 이슈 키입니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noAssociatedExecution",
        "common",
        "i18n gap 보강 (2026-06-06)",
        "연결된 테스트 실행 정보를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noDataFound", "common", "i18n gap 보강 (2026-06-06)", "데이터를 찾을 수 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.noExecutionForIssue",
        "common",
        "i18n gap 보강 (2026-06-06)",
        "해당 이슈와 연결된 최근 테스트 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "common.errors.serverError", "common", "i18n gap 보강 (2026-06-06)", "서버와의 통신 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "common.exitFullscreen", "common", "i18n gap 보강 (2026-06-06)", "전체화면 종료");
    createTranslationKeyIfNotExists(
        "common.expectedResult", "common", "i18n gap 보강 (2026-06-06)", "기대 결과");
    createTranslationKeyIfNotExists("common.folder", "common", "i18n gap 보강 (2026-06-06)", "폴더");
    createTranslationKeyIfNotExists(
        "common.fullscreen", "common", "i18n gap 보강 (2026-06-06)", "전체화면");
    createTranslationKeyIfNotExists("common.hide", "common", "i18n gap 보강 (2026-06-06)", "숨기기");
    createTranslationKeyIfNotExists(
        "common.hideAll", "common", "i18n gap 보강 (2026-06-06)", "모두 숨김");
    createTranslationKeyIfNotExists(
        "common.loadingMore", "common", "i18n gap 보강 (2026-06-06)", "더 불러오는 중...");
    createTranslationKeyIfNotExists("common.name", "common", "i18n gap 보강 (2026-06-06)", "이름");
    createTranslationKeyIfNotExists("common.next", "common", "i18n gap 보강 (2026-06-06)", "다음");
    createTranslationKeyIfNotExists(
        "common.noMoreData", "common", "i18n gap 보강 (2026-06-06)", "모든 데이터를 불러왔습니다.");
    createTranslationKeyIfNotExists(
        "common.pagination.rowsPerPage", "common", "i18n gap 보강 (2026-06-06)", "페이지당 행:");
    createTranslationKeyIfNotExists("common.previous", "common", "i18n gap 보강 (2026-06-06)", "이전");
    createTranslationKeyIfNotExists(
        "common.processing", "common", "i18n gap 보강 (2026-06-06)", "처리 중...");
    createTranslationKeyIfNotExists(
        "common.redirecting.failed", "common", "i18n gap 보강 (2026-06-06)", "연결 실패");
    createTranslationKeyIfNotExists(
        "common.redirecting.processing", "common", "i18n gap 보강 (2026-06-06)", "연관 데이터 조회 중...");
    createTranslationKeyIfNotExists("common.refresh", "common", "i18n gap 보강 (2026-06-06)", "새로고침");
    createTranslationKeyIfNotExists("common.reset", "common", "i18n gap 보강 (2026-06-06)", "기본값");
    createTranslationKeyIfNotExists(
        "common.saveError", "common", "i18n gap 보강 (2026-06-06)", "저장 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "common.saveSuccess", "common", "i18n gap 보강 (2026-06-06)", "저장되었습니다.");
    createTranslationKeyIfNotExists(
        "common.saving", "common", "i18n gap 보강 (2026-06-06)", "Saving...");
    createTranslationKeyIfNotExists("common.search", "common", "i18n gap 보강 (2026-06-06)", "검색");
    createTranslationKeyIfNotExists(
        "common.showAll", "common", "i18n gap 보강 (2026-06-06)", "모두 표시");
    createTranslationKeyIfNotExists("common.steps", "common", "i18n gap 보강 (2026-06-06)", "테스트 절차");
    createTranslationKeyIfNotExists(
        "common.testcase", "common", "i18n gap 보강 (2026-06-06)", "테스트케이스");
    createTranslationKeyIfNotExists("common.title", "common", "i18n gap 보강 (2026-06-06)", "제목");
    createTranslationKeyIfNotExists("common.type", "common", "i18n gap 보강 (2026-06-06)", "유형");
    createTranslationKeyIfNotExists("common.update", "common", "i18n gap 보강 (2026-06-06)", "수정");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.missionPlaceholder",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "차터 내용을 마크다운으로 작성하세요.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "등록된 차터가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.checkFields",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "필수 항목을 확인해 주세요.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.missionRequired",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "내용은 필수입니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.error.titleRequired",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "차터 이름은 필수입니다.");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.goal",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "- 목표: 일반/특수 사용자 로그인 안정성 검증");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.notes",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "- 주의점: 토큰 유효성, 다국어 처리, 네트워크 지연");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.login.resources",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "- 자원: 테스트 계정, Postman, 개발자 도구");
    createTranslationKeyIfNotExists(
        "exploratory.charter.examples.templateTitle",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "작성 예시 (로그인 기능)");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.formula",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "무엇을(Target) + 어떤 자원으로(Resources) + 무엇을 찾을 것인지(Information)");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.show", "exploratory", "i18n gap 보강 (2026-06-06)", "작성 가이드 보기");
    createTranslationKeyIfNotExists(
        "exploratory.charter.guide.title", "exploratory", "i18n gap 보강 (2026-06-06)", "차터 기본형 템플릿");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.focus",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "한 번에 한 임무 집중: 세션 중 몰입 환경 확보");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.riskBased",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "리스크 기반 접근: 고위험 영역에 집중 배치");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.specificity",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "적정 수준의 구체성: 테스트 방향을 제시할 수 있을 정도");
    createTranslationKeyIfNotExists(
        "exploratory.charter.principles.title",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "차터 설계 원칙");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.finalSubmit",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "SUBMIT FOR REVIEW");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.achievement",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "차터 달성도");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.nextCharter",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "후속 액션 / 다음 차터 제안");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.evaluation.summary",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "세션 전체 평가");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.artifacts",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "산출물 및 증적");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.bugs", "exploratory", "i18n gap 보강 (2026-06-06)", "발견된 버그");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.notes",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "테스트 수행 노트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.section.tests", "exploratory", "i18n gap 보강 (2026-06-06)", "구조화된 테스트");
    createTranslationKeyIfNotExists(
        "exploratory.detail.empty",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "Select a session to view details");
    createTranslationKeyIfNotExists(
        "exploratory.editor.btn.backToList", "exploratory", "i18n gap 보강 (2026-06-06)", "목록보기");
    createTranslationKeyIfNotExists(
        "exploratory.editor.btn.submit", "exploratory", "i18n gap 보강 (2026-06-06)", "제출");
    createTranslationKeyIfNotExists(
        "exploratory.editor.bugs.empty",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "발견된 버그가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.bugs.title",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "FOUND BUGS / DEFECTS");
    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.empty",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "노트가 없습니다. 추가 버튼을 눌러 기록을 시작하세요.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.section.sessionConfig",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "SESSION CONFIGURATION");
    createTranslationKeyIfNotExists(
        "exploratory.editor.section.timeDistribution",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "테스트 활동 배분");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tab.basic", "exploratory", "i18n gap 보강 (2026-06-06)", "기본 정보");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tab.recording", "exploratory", "i18n gap 보강 (2026-06-06)", "세션 기록");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tests.empty",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "등록된 테스트가 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.tests.title",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "STRUCTURED TESTS");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.currentStatus",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "세션 상태");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.progress",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "TIME ALLOCATION VISUALIZER");
    createTranslationKeyIfNotExists(
        "exploratory.session.approveSuccess",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "세션이 승인되었습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.btn.createNew", "exploratory", "i18n gap 보강 (2026-06-06)", "새 세션 시작");
    createTranslationKeyIfNotExists(
        "exploratory.session.countUnit", "exploratory", "i18n gap 보강 (2026-06-06)", "개의 세션이 있습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.empty", "exploratory", "i18n gap 보강 (2026-06-06)", "조건에 맞는 세션이 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.rejectSuccess",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "보완 요청이 완료되었습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.saveFirst",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "파일을 업로드하려면 먼저 세션을 저장해야 합니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.submitSuccess",
        "exploratory",
        "i18n gap 보강 (2026-06-06)",
        "세션이 제출되었습니다.");
    createTranslationKeyIfNotExists(
        "google.config.email.hint", "google", "i18n gap 보강 (2026-06-06)", "공유 추가할 이메일:");
    createTranslationKeyIfNotExists(
        "jira.issue.open", "jira", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "jira.linker.alreadyLinked", "jira", "i18n gap 보강 (2026-06-06)", "이미 연결됨");
    createTranslationKeyIfNotExists(
        "jira.linker.connectionError",
        "jira",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 연결 상태를 확인할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.createIssue", "jira", "i18n gap 보강 (2026-06-06)", "이슈 생성");
    createTranslationKeyIfNotExists(
        "jira.linker.detailsError", "jira", "i18n gap 보강 (2026-06-06)", "이슈 정보를 불러올 수 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.enterSearchQuery", "jira", "i18n gap 보강 (2026-06-06)", "검색어를 입력하세요.");
    createTranslationKeyIfNotExists(
        "jira.linker.issueNotFound",
        "jira",
        "i18n gap 보강 (2026-06-06)",
        "해당 이슈가 존재하지 않아 검색할 수 없습니다.");
    createTranslationKeyIfNotExists("jira.linker.link", "jira", "i18n gap 보강 (2026-06-06)", "연결");
    createTranslationKeyIfNotExists(
        "jira.linker.linkedIssues", "jira", "i18n gap 보강 (2026-06-06)", "연결된 JIRA 이슈");
    createTranslationKeyIfNotExists(
        "jira.linker.noConfig", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 설정이 없거나 연결에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.noConfigWarning",
        "jira",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 이슈 연동을 사용하려면 먼저 JIRA 설정을 완료해주세요.");
    createTranslationKeyIfNotExists(
        "jira.linker.noResults", "jira", "i18n gap 보강 (2026-06-06)", "검색 결과가 없습니다.");
    createTranslationKeyIfNotExists(
        "jira.linker.openInJira", "jira", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "jira.linker.placeholder",
        "jira",
        "i18n gap 보강 (2026-06-06)",
        "이슈 키, 제목 또는 JIRA URL을 입력하세요 (예: TEST-123)");
    createTranslationKeyIfNotExists(
        "jira.linker.recentIssues", "jira", "i18n gap 보강 (2026-06-06)", "최근 검색한 이슈");
    createTranslationKeyIfNotExists(
        "jira.linker.searchAndLink", "jira", "i18n gap 보강 (2026-06-06)", "JIRA 이슈 검색 및 연결");
    createTranslationKeyIfNotExists(
        "jira.linker.searchResults", "jira", "i18n gap 보강 (2026-06-06)", "검색 결과");
    createTranslationKeyIfNotExists(
        "jira.linker.unlink", "jira", "i18n gap 보강 (2026-06-06)", "연결 해제");
    createTranslationKeyIfNotExists(
        "junit.list.previousExecution", "junit", "i18n gap 보강 (2026-06-06)", "이전 실행");
    createTranslationKeyIfNotExists(
        "login.error.failed", "login", "i18n gap 보강 (2026-06-06)", "로그인에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "login.error.general", "login", "i18n gap 보강 (2026-06-06)", "로그인 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "organization.error.selectMember",
        "organization",
        "i18n gap 보강 (2026-06-06)",
        "이전할 멤버를 선택해주세요.");
    createTranslationKeyIfNotExists(
        "profile.apiToken.dialog.delete.button.cancel",
        "profile",
        "i18n gap 보강 (2026-06-06)",
        "취소");
    createTranslationKeyIfNotExists(
        "profile.tabs.theme", "profile", "i18n gap 보강 (2026-06-06)", "테마 설정");
    createTranslationKeyIfNotExists(
        "profile.theme.description",
        "profile",
        "i18n gap 보강 (2026-06-06)",
        "애플리케이션의 전반적인 디자인 스타일을 선택합니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.glass.desc",
        "profile",
        "i18n gap 보강 (2026-06-06)",
        "화려한 그라데이션과 블러 효과가 적용된 현대적인 스타일입니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.glass.title", "profile", "i18n gap 보강 (2026-06-06)", "Modern Glass (현재)");
    createTranslationKeyIfNotExists(
        "profile.theme.m3.desc",
        "profile",
        "i18n gap 보강 (2026-06-06)",
        "구글의 최신 가이드라인을 따른 정갈하고 체계적인 스타일입니다.");
    createTranslationKeyIfNotExists(
        "profile.theme.m3.title",
        "profile",
        "i18n gap 보강 (2026-06-06)",
        "Material 3 (Design System)");
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
        "project.dialog.deleteWarningMessage1",
        "project",
        "i18n gap 보강 (2026-06-06)",
        "이 작업은 되돌릴 수 없습니다.");
    createTranslationKeyIfNotExists(
        "project.dialog.deleteWarningMessage2",
        "project",
        "i18n gap 보강 (2026-06-06)",
        "프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.");
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
        "project.messages.addOrganizationProjectsHint",
        "project",
        "i18n gap 보강 (2026-06-06)",
        "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.");
    createTranslationKeyIfNotExists(
        "project.messages.noOrganizationProjects",
        "project",
        "i18n gap 보강 (2026-06-06)",
        "조직별 프로젝트가 없습니다");
    createTranslationKeyIfNotExists(
        "project.messages.noProjectsInOrganization",
        "project",
        "i18n gap 보강 (2026-06-06)",
        "이 조직에는 아직 프로젝트가 없습니다.");
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
        "rag.chat.testCaseDocumentTooltip",
        "rag",
        "i18n gap 보강 (2026-06-06)",
        "새 탭에서 테스트케이스 상세 보기");
    createTranslationKeyIfNotExists(
        "rag.chat.threadDeleteConfirm",
        "rag",
        "i18n gap 보강 (2026-06-06)",
        "이 스레드를 삭제하시겠습니까? 대화 내역이 모두 삭제됩니다.");
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
    createTranslationKeyIfNotExists("rag.document.error", "rag", "i18n gap 보강 (2026-06-06)", "에러");
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
    createTranslationKeyIfNotExists("rag.document.status", "rag", "i18n gap 보강 (2026-06-06)", "상태");
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
    createTranslationKeyIfNotExists("rag.document.tokens", "rag", "i18n gap 보강 (2026-06-06)", "토큰");
    createTranslationKeyIfNotExists(
        "rag.llmAnalysis.title", "rag", "i18n gap 보강 (2026-06-06)", "LLM 청크 분석");
    createTranslationKeyIfNotExists(
        "rag.testcase.bulkAddButton", "rag", "i18n gap 보강 (2026-06-06)", "스프레드시트로 일괄 추가");
    createTranslationKeyIfNotExists(
        "rag.testcase.spreadsheet.dialog.subtitle",
        "rag",
        "i18n gap 보강 (2026-06-06)",
        "총 {count}개의 테스트케이스를 스프레드시트에서 편집하고 저장하세요.");
    createTranslationKeyIfNotExists(
        "rag.testcase.spreadsheet.dialog.title",
        "rag",
        "i18n gap 보강 (2026-06-06)",
        "AI 생성 테스트케이스 일괄 추가");
    createTranslationKeyIfNotExists(
        "testCase.export.noData", "testCase", "i18n gap 보강 (2026-06-06)", "내보낼 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "testCase.export.pdfError",
        "testCase",
        "i18n gap 보강 (2026-06-06)",
        "PDF 다운로드 중 오류가 발생했습니다: {message}");
    createTranslationKeyIfNotExists(
        "testCase.export.pdfSuccess",
        "testCase",
        "i18n gap 보강 (2026-06-06)",
        "PDF 파일이 다운로드되었습니다: {filename}");
    createTranslationKeyIfNotExists(
        "testCase.form.tags", "testCase", "i18n gap 보강 (2026-06-06)", "태그");
    createTranslationKeyIfNotExists(
        "testCase.priority.label", "testCase", "i18n gap 보강 (2026-06-06)", "우선순위");
    createTranslationKeyIfNotExists(
        "testCaseResult.page.loadingData",
        "testCaseResult",
        "i18n gap 보강 (2026-06-06)",
        "테스트 케이스 정보를 불러오는 중입니다...");
    createTranslationKeyIfNotExists(
        "testExecution.actions.copyResultLink",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "결과 입력 링크 복사");
    createTranslationKeyIfNotExists(
        "testExecution.actions.linkCopied",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "결과 입력 링크가 클립보드에 복사되었습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.bulk.dialog.jiraHelp",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "여러 개의 이슈 키는 콤마(,)로 구분하여 입력하세요.");
    createTranslationKeyIfNotExists(
        "testExecution.filter.executionDate", "testExecution", "i18n gap 보강 (2026-06-06)", "실행일자");
    createTranslationKeyIfNotExists(
        "testExecution.filter.notes", "testExecution", "i18n gap 보강 (2026-06-06)", "노트");
    createTranslationKeyIfNotExists(
        "testExecution.filter.notes.placeholder",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "search notes");
    // ICT-427: 결과 태그 필터
    createTranslationKeyIfNotExists(
        "testExecution.filter.tags", "testExecution", "ICT-427 결과 태그 필터", "태그");
    createTranslationKeyIfNotExists(
        "testExecution.filter.tags.placeholder",
        "testExecution",
        "ICT-427 결과 태그 필터",
        "태그 선택 또는 입력");
    // ICT-428: 트리 검색 대상 확장 (이름·표시 ID·태그)
    createTranslationKeyIfNotExists(
        "testcase.tree.filter.placeholderAll", "testcase", "ICT-428 트리 ID·태그 검색", "이름·ID·태그 검색");
    // 레이아웃 선택 (현재 가로 탭 / 신규 좌측 메뉴)
    // 3단 작업 화면 (플랜 → 실행)
    createTranslationKeyIfNotExists(
        "testPlan.workspace.backToPlan", "testPlan", "작업 화면", "플랜으로 돌아가기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.runsInTree", "testPlan", "작업 화면", "이 플랜의 실행은 왼쪽 트리에서 볼 수 있습니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.collapseList", "testPlan", "작업 화면", "목록 접기");
    createTranslationKeyIfNotExists("testPlan.workspace.expandList", "testPlan", "작업 화면", "목록 펼치기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.collapseRuns", "testPlan", "작업 화면", "실행 목록 접기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.expandRuns", "testPlan", "작업 화면", "실행 목록 펼치기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.executions", "testPlan", "3단 작업 화면", "이 플랜의 실행");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.newExecution", "testPlan", "3단 작업 화면", "실행 만들기");
    createTranslationKeyIfNotExists("testPlan.workspace.filter", "testPlan", "3단 작업 화면", "이름으로 찾기");
    // 실행 영역 목록 (플랜 영역의 트리와 구분)
    createTranslationKeyIfNotExists(
        "testPlan.workspace.filterExecution", "testPlan", "작업 화면", "실행 이름으로 찾기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.emptyExecutions", "testPlan", "작업 화면", "실행이 없습니다.");
    createTranslationKeyIfNotExists("testPlan.workspace.loadMore", "testPlan", "작업 화면", "더 보기");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.empty", "testPlan", "3단 작업 화면", "항목이 없습니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.selectPlan",
        "testPlan",
        "3단 작업 화면",
        "왼쪽에서 테스트 플랜을 고르면 그 플랜의 실행이 여기에 보입니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.noExecution", "testPlan", "3단 작업 화면", "아직 실행이 없습니다. 실행 만들기로 시작하세요.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.planInfo", "testPlan", "3단 작업 화면", "연결된 플랜");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.caseCount", "testPlan", "3단 작업 화면", "{count}개 케이스");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.selectExecution",
        "testPlan",
        "3단 작업 화면",
        "왼쪽에서 실행을 고르면 연결된 플랜이 여기에 보입니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.detailHint",
        "testPlan",
        "3단 작업 화면",
        "플랜을 고르면 내용이 여기에 열립니다. 실행을 고르면 실행 상세로 바뀝니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.detailHintExecution", "testPlan", "3단 작업 화면", "실행을 고르면 상세가 여기에 열립니다.");
    createTranslationKeyIfNotExists(
        "testPlan.workspace.executionsFailed", "testPlan", "3단 작업 화면", "실행 목록을 불러오지 못했습니다.");
    createTranslationKeyIfNotExists(
        "projectNav.project.select", "projectNav", "레이아웃 선택", "프로젝트 선택");
    createTranslationKeyIfNotExists(
        "projectNav.project.openList", "projectNav", "레이아웃 선택", "프로젝트 목록 보기");
    createTranslationKeyIfNotExists("profile.nav.title", "profile", "레이아웃 선택", "메뉴 구조");
    createTranslationKeyIfNotExists(
        "profile.nav.description",
        "profile",
        "레이아웃 선택",
        "프로젝트 안에서 대시보드·테스트케이스·테스트 플랜 같은 영역을 어떻게 이동할지 고릅니다.");
    createTranslationKeyIfNotExists(
        "profile.nav.tabs.title", "profile", "레이아웃 선택", "현재 레이아웃 — 가로 탭");
    createTranslationKeyIfNotExists(
        "profile.nav.tabs.desc",
        "profile",
        "레이아웃 선택",
        "프로젝트 이름 아래에 영역을 가로로 늘어놓습니다. 지금까지 쓰던 구조이고 기본값입니다.");
    createTranslationKeyIfNotExists(
        "profile.nav.sidebar.title", "profile", "레이아웃 선택", "신규 레이아웃 — 좌측 메뉴");
    createTranslationKeyIfNotExists(
        "profile.nav.sidebar.desc",
        "profile",
        "레이아웃 선택",
        "영역을 화면 왼쪽에 세로로 놓습니다. 영역이 많아도 이름이 잘리지 않고, 접어서 아이콘만 남길 수 있습니다.");
    // 기본값이 좌측 메뉴로 바뀌어 title·desc 의 "현재/신규·기본값" 서술이 뒤집혔다.
    // 기존 키는 DB 에 값이 이미 있어 갱신되지 않으므로 name·summary 로 새로 만든다 (2026-08-16)
    createTranslationKeyIfNotExists(
        "profile.nav.sidebar.name", "profile", "레이아웃 선택 (기본값 전환)", "좌측 메뉴 (기본)");
    createTranslationKeyIfNotExists(
        "profile.nav.sidebar.summary",
        "profile",
        "레이아웃 선택 (기본값 전환)",
        "영역을 화면 왼쪽에 세로로 놓습니다. 영역이 많아도 이름이 잘리지 않고, 접어서 아이콘만 남길 수 있습니다.");
    createTranslationKeyIfNotExists("profile.nav.tabs.name", "profile", "레이아웃 선택 (기본값 전환)", "가로 탭");
    createTranslationKeyIfNotExists(
        "profile.nav.tabs.summary",
        "profile",
        "레이아웃 선택 (기본값 전환)",
        "프로젝트 이름 아래에 영역을 가로로 늘어놓습니다. 영역이 늘어나면 이름이 잘립니다.");
    createTranslationKeyIfNotExists(
        "projectNav.mode.switchToTabs", "projectNav", "레이아웃 선택", "가로 탭 구조로 보기");
    createTranslationKeyIfNotExists(
        "projectNav.mode.switchToSidebar", "projectNav", "레이아웃 선택", "좌측 메뉴 구조로 보기");
    createTranslationKeyIfNotExists("projectNav.sidebar.aria", "projectNav", "레이아웃 선택", "프로젝트 영역");
    createTranslationKeyIfNotExists(
        "projectNav.sidebar.collapse", "projectNav", "레이아웃 선택", "사이드바 접기");
    createTranslationKeyIfNotExists(
        "projectNav.sidebar.expand", "projectNav", "레이아웃 선택", "사이드바 펼치기");
    // ICT-431: 검색 결과 기준 전체 선택
    createTranslationKeyIfNotExists(
        "testcase.tree.checkAll.all", "testcase", "ICT-431 검색 결과 선택", "전체 선택");
    createTranslationKeyIfNotExists(
        "testcase.tree.checkAll.filtered",
        "testcase",
        "ICT-431 검색 결과 선택",
        "검색 결과 전체 선택 (검색 밖 선택은 유지)");
    createTranslationKeyIfNotExists(
        "testExecution.list.noMoreExecutions",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "모든 데이터를 불러왔습니다.");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.currentExecution",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "현재 실행");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.notesView.label",
        "testExecution",
        "이전 결과 노트 보기 형식 토글 (2026-06-10)",
        "노트 보기 형식");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.notesView.markdown",
        "testExecution",
        "이전 결과 노트 보기 형식 토글 (2026-06-10)",
        "마크다운");
    createTranslationKeyIfNotExists(
        "testExecution.prevResults.notesView.text",
        "testExecution",
        "이전 결과 노트 보기 형식 토글 (2026-06-10)",
        "텍스트");
    createTranslationKeyIfNotExists(
        "testExecution.scroll.hint", "testExecution", "i18n gap 보강 (2026-06-06)", "스크롤하여 더 보기");
    createTranslationKeyIfNotExists(
        "testExecution.sections.filters", "testExecution", "i18n gap 보강 (2026-06-06)", "필터");
    createTranslationKeyIfNotExists(
        "testExecution.sections.list", "testExecution", "i18n gap 보강 (2026-06-06)", "테스트 실행 목록");
    createTranslationKeyIfNotExists(
        "testExecution.sections.caseList",
        "testExecution",
        "실행 상세의 케이스 목록 — 좌측 실행 목록과 구분 (2026-08-16)",
        "테스트 케이스 실행 목록");
    createTranslationKeyIfNotExists(
        "testExecution.summary.cases", "testExecution", "i18n gap 보강 (2026-06-06)", "건");
    createTranslationKeyIfNotExists(
        "testExecution.summary.total", "testExecution", "i18n gap 보강 (2026-06-06)", "총");
    createTranslationKeyIfNotExists(
        "testExecution.table.id", "testExecution", "i18n gap 보강 (2026-06-06)", "ID");
    createTranslationKeyIfNotExists(
        "testExecution.table.totalCount",
        "testExecution",
        "i18n gap 보강 (2026-06-06)",
        "전체: {count}건");
    createTranslationKeyIfNotExists(
        "testPlan.linkAutomated.searchPlaceholder",
        "testPlan",
        "i18n gap 보강 (2026-06-06)",
        "실행 이름 또는 파일명으로 검색");
    createTranslationKeyIfNotExists(
        "testPlan.linkAutomated.title", "testPlan", "i18n gap 보강 (2026-06-06)", "자동화 테스트 연결");
    createTranslationKeyIfNotExists(
        "testResult.button.jiraStatusLoading",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 상태 확인 중...");
    createTranslationKeyIfNotExists(
        "testResult.caseAttachments.title",
        "testResult",
        "결과 입력 화면의 케이스 첨부 조회 (2026-07-27)",
        "테스트케이스 첨부파일");
    createTranslationKeyIfNotExists(
        "testResult.caseDetails.expandAll", "testResult", "단계 표 보기 옵션 (2026-06-12)", "모두 펼치기");
    createTranslationKeyIfNotExists(
        "testResult.caseDetails.expandAllTooltip",
        "testResult",
        "단계 표 보기 옵션 (2026-06-12)",
        "단계 내용을 상하 스크롤 없이 모두 표시합니다.");
    createTranslationKeyIfNotExists(
        "testResult.caseDetails.wrap", "testResult", "단계 표 보기 옵션 (2026-06-12)", "줄바꿈");
    createTranslationKeyIfNotExists(
        "testResult.caseDetails.wrapTooltip",
        "testResult",
        "단계 표 보기 옵션 (2026-06-12)",
        "자동 줄바꿈(워드랩) — 작은 화면에서 가로 스크롤 없이 표시합니다.");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.title", "testResult", "실행 QA 총평 (2026-06-10)", "QA 총평");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.write", "testResult", "실행 QA 총평 (2026-06-10)", "총평 작성");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.placeholder",
        "testResult",
        "실행 QA 총평 (2026-06-10)",
        "이 실행에 대한 QA 총평을 마크다운으로 작성하세요.");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.empty",
        "testResult",
        "실행 QA 총평 (2026-06-10)",
        "아직 작성된 QA 총평이 없습니다. 고급 내보내기 PDF의 상세 리스트 위에 함께 출력됩니다.");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.updatedBy",
        "testResult",
        "실행 QA 총평 (2026-06-10)",
        "{user} · {date} 수정");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.saveError",
        "testResult",
        "실행 QA 총평 (2026-06-10)",
        "QA 총평 저장에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.editSection", "testResult", "QA 총평 구간 편집 (2026-08-05)", "이 부분 수정");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.editAll", "testResult", "QA 총평 구간 편집 (2026-08-05)", "전체 수정");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.preamble", "testResult", "QA 총평 구간 편집 (2026-08-05)", "머리글");
    createTranslationKeyIfNotExists(
        "testResult.qaSummary.conflict",
        "testResult",
        "QA 총평 구간 편집 (2026-08-05)",
        "편집하는 동안 총평이 다른 곳에서 바뀌었습니다. 작성한 내용을 복사해 두고 화면을 새로 고친 뒤 다시 저장하세요.");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.qaSummaryTitle", "testResult", "실행 QA 총평 (2026-06-10)", "💬 QA 총평");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.qaSummaryBy", "testResult", "실행 QA 총평 (2026-06-10)", "작성");
    createTranslationKeyIfNotExists(
        "testResult.export.option.includeQaSummary",
        "testResult",
        "내보내기 QA 총평 포함 옵션 (2026-08-05)",
        "QA 총평 포함");
    createTranslationKeyIfNotExists(
        "testResult.export.attachmentsAvailable",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "첨부 있음");
    createTranslationKeyIfNotExists(
        "testResult.export.error.noData",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "내보내기할 데이터가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.detailTitle",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "🔍 상세 테스트 결과 리스트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.generatedAt", "testResult", "i18n gap 보강 (2026-06-06)", "생성일시");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.project", "testResult", "i18n gap 보강 (2026-06-06)", "프로젝트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.executionRate",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "실행률");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.jiraLinked",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 연동");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.noPeriod",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "기간 정보 없음");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.successRate",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "성공률");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summary.total", "testResult", "i18n gap 보강 (2026-06-06)", "총 테스트");
    createTranslationKeyIfNotExists(
        "testResult.export.pdf.summaryTitle",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "📝 테스트 수행 요약");
    createTranslationKeyIfNotExists(
        "testResult.filter.executionView", "testResult", "i18n gap 보강 (2026-06-06)", "실행별");
    createTranslationKeyIfNotExists(
        "testResult.filter.folderView", "testResult", "i18n gap 보강 (2026-06-06)", "폴더별");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.action", "testResult", "i18n gap 보강 (2026-06-06)", "이동");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.folder", "testResult", "i18n gap 보강 (2026-06-06)", "폴더 경로");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.testCase",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "테스트 케이스");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.col.testPlan",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "테스트 플랜");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.count", "testResult", "i18n gap 보강 (2026-06-06)", "{count}건");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.goToExecutionAll",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "실행 페이지로 이동");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.loadError",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "케이스 목록을 불러오는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.noFail",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "실패 케이스가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.noNotRun",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "미실행 케이스가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.filteredCases.unnamed", "testResult", "i18n gap 보강 (2026-06-06)", "(이름 없음)");
    createTranslationKeyIfNotExists(
        "testResult.folder.depthView",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "폴더 트리 (Depth View)");
    createTranslationKeyIfNotExists(
        "testResult.folder.detailStats",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "상세 통계 (선택된 폴더)");
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
        "testResult.form.tagsPlaceholder",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "태그를 입력하고 Enter를 누르세요");
    createTranslationKeyIfNotExists(
        "testResult.helper.tags", "testResult", "i18n gap 보강 (2026-06-06)", "여러 태그를 입력할 수 있습니다");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.caseCount",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "{count}개 케이스");
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
        "testResult.jiraDialog.deduplicatedNote",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "* JIRA 이슈 키 기준 중복 제거된 목록");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.empty",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "연동된 JIRA 이슈가 없습니다.");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.loadError",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 목록을 불러오는 중 오류가 발생했습니다.");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.openJira", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA에서 열기");
    createTranslationKeyIfNotExists(
        "testResult.jiraDialog.title", "testResult", "i18n gap 보강 (2026-06-06)", "JIRA 연동 이슈 목록");
    createTranslationKeyIfNotExists(
        "testResult.message.noChange",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "변경 사항이 없어 저장하지 않았습니다.");
    createTranslationKeyIfNotExists(
        "testResult.status.loading", "testResult", "i18n gap 보강 (2026-06-06)", "불러오는 중...");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.jiraNotConfigured",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "JIRA 설정이 필요합니다");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noJiraTargets",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "연결된 JIRA ID가 없습니다");
    createTranslationKeyIfNotExists(
        "testResult.tooltip.noTestTechnique",
        "testResult",
        "i18n gap 보강 (2026-06-06)",
        "테스트 기법 없음");
    createTranslationKeyIfNotExists(
        "testResultDashboard.chart.executionComparison",
        "testResultDashboard",
        "i18n gap 보강 (2026-06-06)",
        "실행별 결과 비교");
    createTranslationKeyIfNotExists(
        "testResultDashboard.chart.folderComparison",
        "testResultDashboard",
        "i18n gap 보강 (2026-06-06)",
        "폴더별 결과 비교");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.features.edit",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "더블 클릭으로 셀 편집, Enter로 편집 완료 및 다음 행 이동, Tab으로 다음 셀 이동.");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.tips.multiline",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "여러 줄 입력이 필요한 경우 일반 입력 모드를 사용하세요.");
    createTranslationKeyIfNotExists(
        "testcase.advancedGrid.tips.title", "testcase", "i18n gap 보강 (2026-06-06)", "팁:");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoLabel", "testcase", "i18n gap 보강 (2026-06-06)", "자동");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoMode.off",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "자동 생성 OFF - 버튼을 눌러 수동 생성");
    createTranslationKeyIfNotExists(
        "testcase.ai.autoMode.on",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "자동 생성 ON - 스텝 입력 시 자동으로 Name/Description 생성");
    createTranslationKeyIfNotExists(
        "testcase.ai.error.failed", "testcase", "i18n gap 보강 (2026-06-06)", "AI 생성에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.ai.error.noSteps",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "AI 생성을 위해 최소 1개 이상의 스텝을 입력해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.ai.generateTooltip",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "AI로 Name/Description 자동 생성");
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
        "testcase.dialog.delete.folderWarning",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "폴더를 삭제하면 하위 테스트 케이스도 모두 삭제됩니다.");
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
        "testcase.helper.folderTags",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "폴더에 태그를 추가하면 하위 모든 테스트케이스에도 적용됩니다 (자동 전파)");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.altLabel", "testcase", "i18n gap 보강 (2026-06-06)", "대체 텍스트");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.description", "testcase", "i18n gap 보강 (2026-06-06)", "본문에 삽입된 이미지");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.dialogTitle", "testcase", "i18n gap 보강 (2026-06-06)", "클립보드 이미지 옵션");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.helper",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이미지는 MinIO에 업로드되며 공개 토큰 URL로 본문에 삽입됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.insert", "testcase", "i18n gap 보강 (2026-06-06)", "삽입");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.previewUnavailable",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "미리보기를 불러오는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.saveRequired",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이미지를 붙여넣으려면 테스트케이스를 먼저 저장하세요.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.unit", "testcase", "i18n gap 보강 (2026-06-06)", "단위");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.uploadFailed",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이미지 업로드에 실패했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.uploadingProgress",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "클립보드 이미지를 업로드하는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.urlMissing",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이미지 URL을 생성하지 못했습니다.");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.width", "testcase", "i18n gap 보강 (2026-06-06)", "가로 크기");
    createTranslationKeyIfNotExists(
        "testcase.inlineImage.widthHelper",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "비워두면 100%로 표시합니다.");
    createTranslationKeyIfNotExists(
        "testcase.io.export.google.label",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "2. Google Sheets 설정");
    createTranslationKeyIfNotExists(
        "testcase.message.confirmDiscard",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "작성 중인 내용이 있습니다. 새 케이스를 추가하시겠습니까? 기존 내용은 사라집니다.");
    createTranslationKeyIfNotExists(
        "testcase.message.selectTreeItem",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "좌측 트리에서 항목을 선택하면 상세 정보를 볼 수 있습니다.");
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
        "testcase.rag.checking.tooltip",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "RAG 등록 상태를 확인하는 중입니다...");
    createTranslationKeyIfNotExists(
        "testcase.rag.notVectorized.label", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 미등록");
    createTranslationKeyIfNotExists(
        "testcase.rag.notVectorized.tooltip",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이 테스트케이스는 아직 RAG 시스템에 등록되지 않았습니다. 등록하면 유사 테스트케이스 검색에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.rag.register", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 등록");
    createTranslationKeyIfNotExists(
        "testcase.rag.register.tooltip",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "RAG 시스템에 등록하면 유사 테스트케이스 검색 및 AI 추천에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.rag.registering", "testcase", "i18n gap 보강 (2026-06-06)", "등록 중...");
    createTranslationKeyIfNotExists(
        "testcase.rag.vectorized.label", "testcase", "i18n gap 보강 (2026-06-06)", "RAG 등록됨");
    createTranslationKeyIfNotExists(
        "testcase.rag.vectorized.tooltip",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이 테스트케이스는 RAG 시스템에 등록되어 유사도 검색에 활용됩니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.button.addRow", "testcase", "i18n gap 보강 (2026-06-06)", "행 추가");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.button.deleteRows", "testcase", "i18n gap 보강 (2026-06-06)", "선택 삭제");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.delete.description",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "{count}개 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.notification.stepChanged",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "스텝 수가 {count}개로 변경되었습니다.");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.status.batchEdit", "testcase", "i18n gap 보강 (2026-06-06)", "대량 편집");
    createTranslationKeyIfNotExists(
        "testcase.spreadsheet.validation.successTitle",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "검증 통과");
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
        "testcase.tree.action.deleteSelected",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "삭제 ({count})");
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
        "testcase.tree.dialog.deletingMessage",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "하위 항목과 첨부파일을 포함하여 삭제하고 있습니다. 잠시만 기다려주세요.");
    createTranslationKeyIfNotExists(
        "testcase.tree.error.moveFailed", "testcase", "i18n gap 보강 (2026-06-06)", "이동에 실패했습니다.");
    createTranslationKeyIfNotExists("theme.dark", "theme", "i18n gap 보강 (2026-06-06)", "다크 모드");
    createTranslationKeyIfNotExists("theme.light", "theme", "i18n gap 보강 (2026-06-06)", "라이트 모드");
    createTranslationKeyIfNotExists(
        "userList.action.sendVerificationEmail",
        "userList",
        "i18n gap 보강 (2026-06-06)",
        "인증 이메일 발송");
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
        "validation.password.mismatch",
        "validation",
        "i18n gap 보강 (2026-06-06)",
        "비밀번호가 일치하지 않습니다.");
    createTranslationKeyIfNotExists(
        "validation.required.all", "validation", "i18n gap 보강 (2026-06-06)", "모든 필드를 입력해주세요.");
    createTranslationKeyIfNotExists(
        "testcase.message.confirmTagCleanup",
        "testcase",
        "i18n gap 보강 (2026-06-06)",
        "이전 폴더의 태그 [{tags}]를 삭제하시겠습니까?\n'예'를 선택하면 해당 태그가 삭제되고, '아니오'를 선택하면 유지됩니다.");

    log.info("i18n gap 번역 키 초기화 완료");
  }

  private void createTranslationKeyIfNotExists(
      String keyName, String category, String description, String defaultValue) {
    if (seedIndex.createKeyIfAbsent(keyName, category, description, defaultValue)) {}
  }
}
