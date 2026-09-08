package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 이미 심어진 안내 문구를 새 문구로 정정한다.
 *
 * <p>번역 시드는 값이 이미 있으면 건너뛴다. 사용자가 번역 관리 화면에서 고친 문구를 기동할 때마다
 * 지우지 않으려는 설계이고 그 동작은 옳다. 그런데 그 탓에 우리가 문구를 고쳐도 이미 돌던 곳에는
 * 옛 문구가 그대로 남는다. 도커로 배포하므로 SQL 을 손으로 돌릴 사람이 없다.
 *
 * <p><b>옛 값과 정확히 같을 때만 바꾼다.</b> 한 글자라도 다르면 누군가 손을 댄 것이므로 남긴다.
 * 그래서 이 클래스는 여러 번 돌아도 안전하고, 정정이 끝난 뒤에는 아무 일도 하지 않는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AgentConnectionHintRevisions {

  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;
  private final LanguageRepository languageRepository;

  /** 키, 언어, 바꾸기 전 값(이것과 같을 때만 갱신), 바꿀 값. */
  private record Revision(String key, String lang, String from, String to) {}

  private static final List<Revision> REVISIONS =
      List.of(
          new Revision(
              "agentConnection.field.serverUrlHint",
              "ko",
              "http 또는 https 로 시작하는 주소를 넣습니다.",
              "제품 서버가 에이전트로 나갈 때 쓰는 주소입니다. 둘 다 도커로 띄웠다면"
                  + " http://host.docker.internal:8090 을 넣습니다 — 제품도 컨테이너라 localhost 는 자기"
                  + " 자신을 가리킵니다. 제품을 도커 밖에서 돌리면 http://localhost:8090 입니다."),
          new Revision(
              "agentConnection.field.serverUrlHint",
              "en",
              "Enter a URL that starts with http or https.",
              "The address the product server uses to reach the agent. With both in Docker, use"
                  + " http://host.docker.internal:8090 — the product is a container too, so localhost"
                  + " points at itself. Running the product outside Docker, use"
                  + " http://localhost:8090."),
          new Revision(
              "agentConnection.field.isActiveRunStep1",
              "ko",
              "에이전트를 내려받아 .env 를 채우고 docker compose up -d 로 띄웁니다. 기본 포트는 8090 입니다.",
              "docker pull xmlangel/testcasecraft-agent 로 이미지를 받아 띄웁니다. 기본 포트는 8090 입니다."),
          new Revision(
              "agentConnection.field.isActiveRunStep1",
              "en",
              "Get the agent, fill in its .env, and start it with docker compose up -d."
                  + " The default port is 8090.",
              "Pull the image with docker pull xmlangel/testcasecraft-agent and start it."
                  + " The default port is 8090."),
          new Revision(
              "agentConnection.field.isActiveRunNotice",
              "ko",
              "에이전트는 제품과 별개로 도는 스택입니다. 켜는 것만으로 실행되지 않고, 에이전트 컨테이너를 띄운 뒤 위"
                  + " 주소로 연결을 확인해야 자동화 화면에서 쓸 수 있습니다.",
              "켜는 것만으로 실행되지 않습니다. 에이전트는 제품 밖에서 도는 별도 스택이라 그쪽을 먼저 띄워야 합니다."),
          new Revision(
              "agentConnection.field.isActiveRunNotice",
              "en",
              "The agent runs as a separate stack. Turning this on does not start it — bring up the"
                  + " agent container and verify the connection above before the automation screen"
                  + " can use it.",
              "Turning this on does not run anything. The agent is a separate stack outside the"
                  + " product, so bring that up first."),
          new Revision(
              "agentConnection.field.isActiveRunStep2",
              "ko",
              "위 인증 토큰에는 그 .env 의 AGENT_API_TOKEN 과 같은 값을 넣습니다. 값이 다르면 연결 확인에서 막힙니다.",
              "위 인증 토큰에는 그 .env 의 AGENT_API_TOKEN 과 같은 값을 넣습니다. 값이 다르면 연결 확인이 되지 않습니다."),
          new Revision(
              "agentConnection.field.isActiveRunStep2",
              "en",
              "Put the same value as AGENT_API_TOKEN from that .env into the auth token above."
                  + " A different value fails the connection test.",
              "Put the same value as AGENT_API_TOKEN from that .env into the auth token above."
                  + " The connection test does not pass when the values differ."),
          new Revision(
              "agentConnection.field.browserUrlHint",
              "ko",
              "비워 두면 위 주소를 그대로 씁니다. 서버가 닿는 주소와 브라우저가 닿는 주소가 다를 때만 채웁니다 — 실행 버튼은 이"
                  + " 주소를 엽니다.",
              "실행 버튼이 여는 주소입니다. 위에 host.docker.internal 을 넣었다면 여기에 http://localhost:8090 을"
                  + " 넣습니다 — 그 이름은 컨테이너 안에서만 풀리고 사람의 브라우저는 알지 못합니다. 두 주소가 같으면 비워 둡니다."),
          new Revision(
              "agentConnection.field.browserUrlHint",
              "en",
              "Leave it blank to reuse the address above. Fill it only when the server and the"
                  + " browser reach the agent at different addresses — the run button opens this"
                  + " one.",
              "The address the run button opens. If you put host.docker.internal above, use"
                  + " http://localhost:8090 here — that name resolves only inside containers and a"
                  + " person's browser does not know it. Leave empty when both addresses match."),
          new Revision(
              "agentConnection.field.tokenHint",
              "en",
              "Leave it blank to keep the current token. A saved token is never shown.",
              "Use the same value as AGENT_API_TOKEN in the agent's .env. Leave empty to keep the"
                  + " stored token; it is never shown here."),
          new Revision(
              "agentConnection.field.tokenHint",
              "ko",
              "비워 두면 기존 값을 그대로 씁니다. 저장된 토큰은 화면에 보이지 않습니다.",
              "에이전트 쪽 .env 의 AGENT_API_TOKEN 과 같은 값을 넣습니다. 비워 두면 기존 값을 그대로 쓰고, 저장된"
                  + " 토큰은 화면에 보이지 않습니다."),
          new Revision(
              "agentConnection.field.defaultProfileHint",
              "ko",
              "에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있습니다.",
              "에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있고, 처음 설치하면 local 하나가 들어"
                  + " 있습니다."),
          new Revision(
              "agentConnection.field.defaultProfileHint",
              "en",
              "The profile identifier registered in the agent app. Its policy and context live"
                  + " there.",
              "The profile identifier registered in the agent app. Its policy and context live"
                  + " there, and a fresh install ships one named local."));

  public void initialize() {
    int changed = 0;
    for (Revision r : REVISIONS) {
      if (apply(r)) {
        changed++;
      }
    }
    if (changed > 0) {
      log.info("에이전트 연동 안내 문구 {}건을 새 문구로 정정했다", changed);
    }
  }

  private boolean apply(Revision r) {
    Optional<TranslationKey> keyOpt = translationKeyRepository.findByKeyName(r.key());
    Optional<Language> langOpt = languageRepository.findByCode(r.lang());
    if (keyOpt.isEmpty() || langOpt.isEmpty()) {
      return false;
    }
    Optional<Translation> existing =
        translationRepository.findByTranslationKeyAndLanguage(keyOpt.get(), langOpt.get());
    if (existing.isEmpty()) {
      return false; // 아직 없으면 시드가 새 문구로 넣는다
    }
    Translation t = existing.get();
    if (!r.from().equals(t.getValue())) {
      return false; // 누군가 고쳤거나 이미 정정됐다
    }
    t.setValue(r.to());
    t.setUpdatedBy("system");
    translationRepository.save(t);
    return true;
  }
}
