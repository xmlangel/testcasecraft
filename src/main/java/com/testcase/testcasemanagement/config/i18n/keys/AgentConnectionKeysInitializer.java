// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/AgentConnectionKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 프로젝트 설정 · 에이전트 연동 탭 번역 키 초기화. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AgentConnectionKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 탭·제목
    createKey("projectSettings.tab.agent", "에이전트 연동 탭", "에이전트 연동");
    createKey("agentConnection.title", "에이전트 연동 영역 제목", "외부 QA 에이전트");
    createKey(
        "agentConnection.intro",
        "에이전트 연동 안내",
        "자연어 테스트 케이스를 브라우저에서 실행하는 외부 에이전트를 연결합니다. 에이전트는 제품 밖에서 돌고, 결과만 테스트실행으로 들어옵니다.");
    createKey("agentConnection.unset", "미설정 안내", "아직 연결된 에이전트가 없습니다.");
    createKey("agentConnection.readonly", "읽기 전용 안내", "에이전트 연동 설정은 프로젝트 매니저와 시스템 관리자만 바꿀 수 있습니다.");

    // 입력
    createKey("agentConnection.field.name", "이름 라벨", "에이전트 이름");
    createKey("agentConnection.field.nameHint", "이름 안내", "자동화 화면 버튼에 이 이름이 그대로 나옵니다.");
    createKey("agentConnection.field.serverUrl", "주소 라벨", "에이전트 주소");
    createKey("agentConnection.field.serverUrlHint", "주소 안내", "http 또는 https 로 시작하는 주소를 넣습니다.");
    createKey("agentConnection.field.token", "토큰 라벨", "인증 토큰");
    createKey(
        "agentConnection.field.tokenHint", "토큰 안내", "비워 두면 기존 값을 그대로 씁니다. 저장된 토큰은 화면에 보이지 않습니다.");
    createKey("agentConnection.field.tokenSaved", "토큰 저장됨 표시", "토큰이 저장되어 있습니다.");
    createKey("agentConnection.field.defaultProfile", "기본 프로필 라벨", "기본 프로필");
    createKey(
        "agentConnection.field.defaultProfileHint",
        "기본 프로필 안내",
        "에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있습니다.");
    createKey("agentConnection.field.isActive", "활성 토글 라벨", "이 프로젝트에서 사용");
    createKey(
        "agentConnection.field.isActiveHint", "활성 토글 안내", "꺼 두면 자동화 화면에 에이전트 관련 항목이 나타나지 않습니다.");

    // 동작
    createKey("agentConnection.save", "저장 버튼", "저장");
    createKey("agentConnection.saved", "저장 완료", "에이전트 연동 설정을 저장했습니다.");
    createKey("agentConnection.test", "연결 테스트 버튼", "연결 테스트");
    createKey("agentConnection.testing", "연결 테스트 진행", "확인하는 중...");
    createKey("agentConnection.delete", "삭제 버튼", "연동 삭제");
    createKey(
        "agentConnection.deleteConfirm", "삭제 확인", "이 프로젝트의 에이전트 연동 설정을 삭제하시겠습니까?");
    createKey("agentConnection.deleted", "삭제 완료", "에이전트 연동 설정을 삭제했습니다.");
    createKey(
        "agentConnection.requestFailed", "요청 실패 접두", "요청을 처리하지 못했습니다");

    // 상태
    createKey("agentConnection.status.verified", "연결 확인됨", "연결됨");
    createKey("agentConnection.status.failed", "연결 실패", "연결할 수 없음");
    createKey("agentConnection.status.unknown", "미확인", "확인하지 않음");
    createKey("agentConnection.status.version", "에이전트 버전 라벨", "에이전트 버전");
    createKey("agentConnection.status.lastTest", "마지막 확인 시각 라벨", "마지막 확인");
    createKey("agentConnection.status.latency", "응답 시간 라벨", "응답 시간");
    createKey("agentConnection.status.saveFirst", "저장 먼저 안내", "먼저 저장한 뒤 연결을 확인합니다.");

    // 자동화 화면 버튼
    createKey("agentConnection.run.button", "에이전트 실행 버튼", "{name}으로 실행");
    createKey(
        "agentConnection.run.disabled", "실행 버튼 비활성 안내", "에이전트 서버에 연결할 수 없습니다");
    createKey(
        "agentConnection.run.newTab", "새 창 안내", "에이전트 앱이 새 창에서 열립니다. 결과는 테스트실행으로 들어옵니다.");

    // 한계 고지 — 화면에도 적는다
    createKey(
        "agentConnection.limits",
        "에이전트 한계 고지",
        "케이스 하나에 30초에서 1분이 걸리고 비용이 듭니다. 같은 케이스를 다시 돌리면 행동이 조금씩 달라집니다. 판정은 초안이며 확정은 사람이 합니다. 파일 업로드와 캡차가 들어간 시나리오는 지원하지 않습니다.");
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "agentConnection", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
