#!/usr/bin/env bash
# 스테이징된 변경분을 claude CLI(헤드리스)로 리뷰한다.
#
# pre-commit 훅 `claude-code-review` 에서 커밋 직전에 실행된다.
# 리뷰는 권고다 — 지적이 있어도 커밋을 막지 않는다. LLM 판정은 매번 달라서
# 차단 근거로 쓰면 정상 커밋이 막히고, 그러면 사람들이 --no-verify 를 쓰게 되어
# 훅 전체가 무력해진다. 차단이 필요하면 CLAUDE_REVIEW_BLOCK=1.
#
# claude CLI 가 없거나 응답에 실패하면 안내만 남기고 통과한다(exit 0).
#
# 환경변수:
#   CLAUDE_REVIEW_MAX_LINES  리뷰에 넘길 diff 최대 줄 수 (기본 800)
#   CLAUDE_REVIEW_TIMEOUT    응답 대기 초 (기본 180, timeout 명령이 있을 때만 적용)
#   CLAUDE_REVIEW_MODEL      사용할 모델 (기본: CLI 기본값)
#   CLAUDE_REVIEW_BLOCK=1    VERDICT: ISSUES 면 커밋 중단
#
# 이번 커밋만 건너뛰기: SKIP=claude-code-review git commit ...
#
# 알려진 부작용: 헤드리스 호출도 하나의 Claude 세션이라, 이 프로젝트의 SessionEnd
# 훅이 `.claude/SESSION_LOG.md` 의 "미요약 세션" 표에 리뷰 1회당 한 줄을 남긴다.
# 커밋을 막지도 리뷰를 망가뜨리지도 않지만, 큐를 정리할 때 이 줄들은 지우면 된다.

set -uo pipefail

YELLOW=$'\033[93m'
GREEN=$'\033[92m'
RED=$'\033[91m'
CYAN=$'\033[96m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

MAX_LINES="${CLAUDE_REVIEW_MAX_LINES:-800}"
TIMEOUT_SEC="${CLAUDE_REVIEW_TIMEOUT:-180}"

if ! command -v claude >/dev/null 2>&1; then
  echo "${YELLOW}claude CLI 가 없어 리뷰를 건너뜁니다 (npm i -g @anthropic-ai/claude-code).${RESET}"
  exit 0
fi

diff_text="$(git diff --cached)"
if [ -z "${diff_text//[[:space:]]/}" ]; then
  echo "${YELLOW}스테이징된 변경이 없어 리뷰를 건너뜁니다.${RESET}"
  exit 0
fi

total_lines="$(printf '%s\n' "$diff_text" | wc -l | tr -d ' ')"
if [ "$total_lines" -gt "$MAX_LINES" ]; then
  echo "${YELLOW}diff 가 ${total_lines}줄이라 앞 ${MAX_LINES}줄만 리뷰합니다 (뒤 $((total_lines - MAX_LINES))줄 제외).${RESET}"
  diff_text="$(printf '%s\n' "$diff_text" | head -n "$MAX_LINES")"
fi

# 모델·타임아웃은 있을 때만 붙인다 (macOS 기본 환경엔 timeout 명령이 없다)
model_args=()
if [ -n "${CLAUDE_REVIEW_MODEL:-}" ]; then
  model_args=(--model "$CLAUDE_REVIEW_MODEL")
fi

runner=()
if command -v timeout >/dev/null 2>&1; then
  runner=(timeout "${TIMEOUT_SEC}s")
elif command -v gtimeout >/dev/null 2>&1; then
  runner=(gtimeout "${TIMEOUT_SEC}s")
fi

read -r -d '' PROMPT <<'EOF' || true
stdin 으로 들어온 git diff(스테이징된 변경분)를 코드리뷰해라.

규칙:
- 한국어로 답한다.
- diff 에 실제로 보이는 근거만 지적한다. 추측·일반론·칭찬은 쓰지 않는다.
- 지적마다 `파일:줄 — 무엇이 문제이고 어떻게 깨지는가` 로 쓰고, 필요하면 수정안을 한두 줄 보탠다.
- 심각한 것부터 최대 5건. 사소한 스타일은 생략한다.
- 문제가 없으면 "지적할 것 없음" 한 줄만 쓴다.
- 파일을 열거나 명령을 실행하지 말고 diff 만 보고 판단한다.
- 마지막 줄에 VERDICT: OK 또는 VERDICT: ISSUES 만 단독으로 출력한다.
EOF

echo
echo "${BOLD}${CYAN}────────────────────────────────────────────────────────────${RESET}"
echo "${BOLD}${CYAN} 🤖 Claude Code Review (staged)${RESET}"
echo "${BOLD}${CYAN}────────────────────────────────────────────────────────────${RESET}"
echo

# macOS 기본 bash 3.2 는 set -u 에서 빈 배열 확장("${arr[@]}")을 오류로 본다.
# 길이를 먼저 재서 비어 있지 않을 때만 붙인다.
cmd=()
if [ ${#runner[@]} -gt 0 ]; then
  cmd+=("${runner[@]}")
fi
cmd+=(claude -p "$PROMPT")
if [ ${#model_args[@]} -gt 0 ]; then
  cmd+=("${model_args[@]}")
fi

review="$(printf '%s' "$diff_text" | "${cmd[@]}" 2>&1)"
status=$?

if [ $status -ne 0 ] || [ -z "${review//[[:space:]]/}" ]; then
  echo "${YELLOW}리뷰를 마치지 못했습니다 (종료코드 ${status}). 커밋은 계속합니다.${RESET}"
  if [ -n "${review//[[:space:]]/}" ]; then
    printf '%s\n' "$review" | tail -3
  fi
  exit 0
fi

printf '%s\n' "$review"

if printf '%s' "$review" | grep -q "VERDICT: ISSUES"; then
  echo
  echo "${BOLD}${YELLOW}⚠️  지적된 항목이 있습니다. 확인해 주세요.${RESET}"
  if [ "${CLAUDE_REVIEW_BLOCK:-}" = "1" ]; then
    echo "${RED}CLAUDE_REVIEW_BLOCK=1 이라 커밋을 멈춥니다.${RESET}"
    echo "${YELLOW}건너뛰려면: SKIP=claude-code-review git commit ...${RESET}"
    exit 1
  fi
else
  echo
  echo "${GREEN}✅ 리뷰에서 지적된 항목이 없습니다.${RESET}"
fi

exit 0
