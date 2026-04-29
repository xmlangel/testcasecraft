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
public class ExploratorySessionKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    log.info("탐색 세션 번역 키 초기화 시작");

    createTranslationKeyIfNotExists(
        "projectHeader.tabs.exploratorySessions", "project", "탐색 세션 탭", "탐색 세션");

    createTranslationKeyIfNotExists(
        "exploratory.workspace.title", "exploratory", "탐색 세션 워크스페이스 제목", "탐색 세션 워크스페이스");
    createTranslationKeyIfNotExists(
        "exploratory.workspace.badgeDraft", "exploratory", "초안 배지", "UI 초안");
    createTranslationKeyIfNotExists(
        "exploratory.view.charterManagement", "exploratory", "차터 관리 탭", "차터 관리");
    createTranslationKeyIfNotExists(
        "exploratory.view.sessionList", "exploratory", "세션 목록 탭", "세션 목록");
    createTranslationKeyIfNotExists(
        "exploratory.view.sessionEditor", "exploratory", "세션 작성/편집 탭", "세션 작성/편집");
    createTranslationKeyIfNotExists(
        "exploratory.view.debriefApproval", "exploratory", "디브리프/승인 탭", "디브리프/승인");
    createTranslationKeyIfNotExists(
        "exploratory.view.sessionDetail", "exploratory", "세션 상세 탭", "세션 상세");

    createTranslationKeyIfNotExists(
        "exploratory.charter.filter.status", "exploratory", "차터 상태 필터", "상태 필터");
    createTranslationKeyIfNotExists(
        "exploratory.charter.create", "exploratory", "차터 생성 버튼", "차터 생성");
    createTranslationKeyIfNotExists("exploratory.charter.mission", "exploratory", "차터 미션 라벨", "미션");
    createTranslationKeyIfNotExists(
        "exploratory.charter.sessionCount", "exploratory", "차터 수행 횟수", "수행 횟수 {count}");
    createTranslationKeyIfNotExists(
        "exploratory.charter.totalBugs", "exploratory", "차터 총 버그 수", "총 버그 {count}");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.createTitle", "exploratory", "차터 생성 다이얼로그 제목", "차터 생성");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.editTitle", "exploratory", "차터 편집 다이얼로그 제목", "차터 편집");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.name", "exploratory", "차터 이름", "차터 이름");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.mission", "exploratory", "차터 미션", "미션");
    createTranslationKeyIfNotExists(
        "exploratory.charter.dialog.status", "exploratory", "차터 상태", "상태");

    createTranslationKeyIfNotExists(
        "exploratory.session.filter.tester", "exploratory", "세션 테스터 필터", "테스터");
    createTranslationKeyIfNotExists(
        "exploratory.session.filter.linkedCharter", "exploratory", "세션 연결 차터 필터", "연결 차터");
    createTranslationKeyIfNotExists(
        "exploratory.session.filter.minBugs", "exploratory", "세션 최소 버그 필터", "버그 수(이상)");
    createTranslationKeyIfNotExists(
        "exploratory.session.filter.periodFrom", "exploratory", "세션 기간 시작 필터", "기간 시작");
    createTranslationKeyIfNotExists(
        "exploratory.session.filter.periodTo", "exploratory", "세션 기간 종료 필터", "기간 종료");
    createTranslationKeyIfNotExists(
        "exploratory.session.label.bugs", "exploratory", "세션 버그 수 라벨", "버그 {count}");
    createTranslationKeyIfNotExists(
        "exploratory.session.label.meta",
        "exploratory",
        "세션 메타 정보",
        "기간 {date} | 테스터 {tester} | 차터 {charter}");

    createTranslationKeyIfNotExists(
        "exploratory.editor.header.title", "exploratory", "에디터 헤더 제목", "헤더");
    createTranslationKeyIfNotExists(
        "exploratory.editor.header.elapsed", "exploratory", "에디터 실행 시간", "실행 시간 {value}");
    createTranslationKeyIfNotExists(
        "exploratory.editor.header.paused", "exploratory", "에디터 중단 시간", "중단 시간 {value}");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.start", "exploratory", "타이머 시작", "Start");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.pause", "exploratory", "타이머 일시정지", "Pause");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timer.resume", "exploratory", "타이머 재개", "Resume");
    createTranslationKeyIfNotExists("exploratory.editor.timer.end", "exploratory", "타이머 종료", "End");
    createTranslationKeyIfNotExists(
        "exploratory.editor.field.environment", "exploratory", "환경 필드", "환경");
    createTranslationKeyIfNotExists(
        "exploratory.editor.field.version", "exploratory", "버전 필드", "버전");
    createTranslationKeyIfNotExists("exploratory.editor.field.tags", "exploratory", "태그 필드", "태그");
    createTranslationKeyIfNotExists(
        "exploratory.editor.field.title", "exploratory", "세션 제목 필드", "제목");

    createTranslationKeyIfNotExists(
        "exploratory.editor.charterSection.title", "exploratory", "차터 섹션 제목", "차터 섹션");
    createTranslationKeyIfNotExists(
        "exploratory.editor.charterSection.assigned", "exploratory", "할당 차터", "할당 차터");
    createTranslationKeyIfNotExists(
        "exploratory.editor.charterSection.autoMission", "exploratory", "자동 바인딩 미션", "자동 바인딩된 미션");

    createTranslationKeyIfNotExists(
        "exploratory.editor.field.netDuration", "exploratory", "목표 수행 시간 (분)", "목표 수행 시간 (분)");

    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.title", "exploratory", "시간 배분 제목", "시간 배분");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.execution",
        "exploratory",
        "테스트 실행 비율",
        "Test Execution (%)");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.bugInvestigation",
        "exploratory",
        "버그 조사 비율",
        "Bug Investigation (%)");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.setupAdmin", "exploratory", "셋업/관리 비율", "Setup/Admin (%)");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.total", "exploratory", "시간 배분 합계", "합계 {total}%");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.pausedMinutes",
        "exploratory",
        "자동 반영 중단 시간",
        "자동 반영된 중단 시간 {minutes}분");
    createTranslationKeyIfNotExists(
        "exploratory.editor.timeSection.ratioWarning",
        "exploratory",
        "시간 비율 경고",
        "시간 배분 합계가 100%가 아닙니다.");

    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.title", "exploratory", "테스트 노트 제목", "테스트 노트");
    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.flow", "exploratory", "수행 흐름", "수행 흐름");
    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.coverage", "exploratory", "커버리지", "커버리지");
    createTranslationKeyIfNotExists("exploratory.editor.notes.oracle", "exploratory", "오라클", "오라클");
    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.activity", "exploratory", "활동 상세", "활동 상세");

    createTranslationKeyIfNotExists(
        "exploratory.editor.issue.title", "exploratory", "버그 이슈 제목", "버그/이슈");
    createTranslationKeyIfNotExists(
        "exploratory.editor.issue.bugHeadline", "exploratory", "버그 헤드라인 연동", "버그 헤드라인 연동");
    createTranslationKeyIfNotExists(
        "exploratory.editor.issue.blockers", "exploratory", "방해 이슈", "방해 이슈");
    createTranslationKeyIfNotExists(
        "exploratory.editor.issue.questions", "exploratory", "남은 질문", "남은 질문");

    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.title", "exploratory", "데이터/산출물 제목", "데이터/산출물");
    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.testData", "exploratory", "테스트 데이터", "테스트 데이터");
    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.upload", "exploratory", "증적 업로드", "증적 업로드");
    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.empty", "exploratory", "업로드 파일 없음", "업로드된 파일이 없습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.sizeKb", "exploratory", "파일 크기 KB", "{size} KB");

    createTranslationKeyIfNotExists(
        "exploratory.editor.evaluation.title", "exploratory", "평가/액션 제목", "평가/액션");
    createTranslationKeyIfNotExists(
        "exploratory.editor.evaluation.achievement", "exploratory", "차터 달성도", "차터 달성도 {value}%");
    createTranslationKeyIfNotExists(
        "exploratory.editor.evaluation.overall", "exploratory", "전체 평가", "전체 평가");
    createTranslationKeyIfNotExists(
        "exploratory.editor.evaluation.nextCharter", "exploratory", "다음 세션 제안 차터", "다음 세션 제안 차터");

    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.title", "exploratory", "디브리프 리포트 제목", "디브리프 리포트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.meta",
        "exploratory",
        "디브리프 리포트 메타",
        "세션: Sprint 22 결제 탐색 | 테스터: Kim QA | 상태: DONE");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.summary",
        "exploratory",
        "디브리프 리포트 요약",
        "요약: 결제 승인 단계에서 간헐적 타임아웃 재현. 재시도 경로에서 중복 승인 위험 발견.");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.keyBugs",
        "exploratory",
        "디브리프 주요 버그",
        "주요 버그: PAY-421, PAY-433");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.evidence",
        "exploratory",
        "디브리프 증적",
        "증적: screenshot_0210.png, payment-retry.log");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.checklist.title", "exploratory", "디브리프 체크리스트 제목", "체크리스트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.checklist.scope", "exploratory", "체크리스트 범위", "차터 범위 준수");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.checklist.timebox", "exploratory", "체크리스트 타임박스", "타임박스/중단 시간 기록");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.checklist.evidence", "exploratory", "체크리스트 증적", "버그 근거 자료 첨부");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.checklist.action", "exploratory", "체크리스트 액션", "후속 액션 제안 포함");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.leadComment", "exploratory", "리드 코멘트", "리드 코멘트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.approve", "exploratory", "디브리프 승인 버튼", "승인");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.requestChanges", "exploratory", "디브리프 보완요청 버튼", "보완요청");

    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.title", "exploratory", "세션 타임라인 제목", "세션 활동 타임라인 (Read-only)");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.start.primary", "exploratory", "타임라인 시작 제목", "10:02 세션 시작");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.start.secondary",
        "exploratory",
        "타임라인 시작 설명",
        "차터 바인딩: 결제 실패 복구 시나리오 탐색");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.bug.primary", "exploratory", "타임라인 버그 제목", "10:27 버그 발견");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.bug.secondary",
        "exploratory",
        "타임라인 버그 설명",
        "PAY-421 생성, 증적 2건 첨부");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.pause.primary", "exploratory", "타임라인 중단/재개 제목", "10:41 중단/재개");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.pause.secondary",
        "exploratory",
        "타임라인 중단/재개 설명",
        "환경 불안정으로 4분 중단 후 재개");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.done.primary",
        "exploratory",
        "타임라인 종료 제목",
        "11:03 종료 및 승인 완료");
    createTranslationKeyIfNotExists(
        "exploratory.detail.timeline.done.secondary",
        "exploratory",
        "타임라인 종료 설명",
        "리드 승인자: Choi Lead (2026-02-10)");
    createTranslationKeyIfNotExists(
        "exploratory.detail.archive.title", "exploratory", "리포트 아카이브 제목", "최종 승인 리포트 아카이브");

    createTranslationKeyIfNotExists(
        "exploratory.editor.field.netDuration", "exploratory", "목표 수행 시간 (분)", "목표 수행 시간 (분)");

    createTranslationKeyIfNotExists(
        "exploratory.session.status.draft", "exploratory", "세션 상태: 작성 중", "작성 중");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.running", "exploratory", "세션 상태: 수행 중", "수행 중");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.paused", "exploratory", "세션 상태: 일시 정지", "일시 정지");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.completed", "exploratory", "세션 상태: 수행 완료", "수행 완료");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.submitted", "exploratory", "세션 상태: 제출됨", "제출됨");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.approved", "exploratory", "세션 상태: 승인됨", "승인됨");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.archived", "exploratory", "세션 상태: 보관됨", "보관됨");
    createTranslationKeyIfNotExists(
        "exploratory.session.status.needsUpdate", "exploratory", "세션 상태: 보완 필요", "보완 필요");

    createTranslationKeyIfNotExists(
        "exploratory.session.confirmDelete", "exploratory", "세션 삭제 확인 메시지", "정말로 이 세션을 삭제하시겠습니까?");
    createTranslationKeyIfNotExists(
        "exploratory.session.saveSuccess", "exploratory", "세션 저장 성공 메시지", "세션이 저장되었습니다.");
    createTranslationKeyIfNotExists(
        "exploratory.session.error.charterRequired",
        "exploratory",
        "차터 필수 선택 에러",
        "할당된 테스트 차터를 선택해야 합니다.");

    log.info("탐색 세션 번역 키 초기화 완료");
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
