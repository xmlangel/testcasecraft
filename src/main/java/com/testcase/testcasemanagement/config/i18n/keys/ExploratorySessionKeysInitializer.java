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
        "exploratory.session.filter.periodFrom", "exploratory", "세션 기간 시작 필터", "기간 시작");
    createTranslationKeyIfNotExists(
        "exploratory.session.filter.periodTo", "exploratory", "세션 기간 종료 필터", "기간 종료");

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
    createTranslationKeyIfNotExists(
        "exploratory.editor.field.title", "exploratory", "세션 제목 필드", "제목");

    createTranslationKeyIfNotExists(
        "exploratory.editor.charterSection.autoMission", "exploratory", "자동 바인딩 미션", "자동 바인딩된 미션");

    createTranslationKeyIfNotExists(
        "exploratory.editor.field.netDuration", "exploratory", "목표 수행 시간 (분)", "목표 수행 시간 (분)");

    createTranslationKeyIfNotExists(
        "exploratory.editor.notes.title", "exploratory", "테스트 노트 제목", "테스트 노트");

    createTranslationKeyIfNotExists(
        "exploratory.editor.issue.title", "exploratory", "버그 이슈 제목", "버그/이슈");

    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.title", "exploratory", "데이터/산출물 제목", "데이터/산출물");
    createTranslationKeyIfNotExists(
        "exploratory.editor.artifact.upload", "exploratory", "증적 업로드", "증적 업로드");

    createTranslationKeyIfNotExists(
        "exploratory.debrief.report.title", "exploratory", "디브리프 리포트 제목", "디브리프 리포트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.leadComment", "exploratory", "리드 코멘트", "리드 코멘트");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.approve", "exploratory", "디브리프 승인 버튼", "승인");
    createTranslationKeyIfNotExists(
        "exploratory.debrief.action.requestChanges", "exploratory", "디브리프 보완요청 버튼", "보완요청");

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
