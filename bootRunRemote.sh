#!/usr/bin/env bash
# 원격 DB(remote 프로파일)를 붙여 로컬 실행.
#
# 원격 DB 의 jira_config 는 서버 키로 암호화돼 있다. 커밋된 DEV 기본 키로는
# 복호화가 BadPaddingException 으로 실패하고, JiraConfigService 가 그 예외를
# 삼켜 빈 결과를 돌려주므로 Jira 이슈 검색·존재확인이 조용히 0건이 된다.
# 그래서 서버와 동일한 JIRA_ENCRYPTION_KEY 를 함께 넣어야 한다.
#
# 키는 저장소에 커밋하지 않는다(이 스크립트는 git 추적 대상) —
# .env.local(gitignore 대상)에 두고 여기서 읽는다.
#
#   $ cat .env.local
#   JIRA_ENCRYPTION_KEY=<서버와 동일한 AES-256 Base64 키>
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${JIRA_ENCRYPTION_KEY:-}" ]]; then
  echo "경고: JIRA_ENCRYPTION_KEY 가 없습니다 — 원격 DB 의 Jira 토큰을 복호화할 수 없어" >&2
  echo "      Jira 이슈 검색·연결 상태가 실패합니다. .env.local 에 키를 넣으세요." >&2
fi

SHOW_EXPLORATORY_SESSION_TAB=true ./gradlew bootRunRemote
