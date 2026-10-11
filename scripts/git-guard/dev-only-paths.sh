#!/usr/bin/env bash
# dev 브랜치에서만 관리하는 경로(에이전트·하네스 설정과 AI 지침 문서)가 master 에 들어가는 것을 막는다.
#
#   --staged      : 스테이징된 변경을 검사한다 (pre-commit · pre-merge-commit 훅)
#   --tree <ref>  : 해당 커밋의 트리 전체를 검사한다 (CI)
#   --list <ref>  : 해당 커밋에서 dev 전용 경로에 해당하는 파일을 출력한다 (promote-dev.sh)
#   --match       : 표준 입력의 경로 중 dev 전용 경로만 출력한다 (branch-flow.sh)
#
# 막을 경로를 늘리려면 DEV_ONLY_REGEX 만 고친다. 훅·CI·승격 스크립트가 모두 이 정규식을 쓴다.
set -euo pipefail

DEV_ONLY_REGEX='^(\.claude|\.agent|\.agents)/|(^|/)(AGENTS|CLAUDE|GEMINI)[^/]*\.md$|^\.github/copilot-instructions\.md$'
PROTECTED_BRANCHES=(master main)

match() { grep -E "$DEV_ONLY_REGEX" || true; }

mode="${1:-}"

case "$mode" in
  --staged)
    branch="$(git symbolic-ref --short -q HEAD || true)"
    protected=0
    for b in "${PROTECTED_BRANCHES[@]}"; do
      [[ "$branch" == "$b" ]] && protected=1
    done
    [[ $protected -eq 1 ]] || exit 0
    # 추가·수정만 막는다. 삭제(D)는 master 에서 정리하는 커밋이므로 허용한다.
    hits="$(git diff --cached --name-only --diff-filter=ACMRT | match)"
    ;;
  --tree)
    ref="${2:?--tree 뒤에 커밋을 지정한다}"
    hits="$(git ls-tree -r --name-only "$ref" | match)"
    branch="$ref"
    ;;
  --list)
    ref="${2:?--list 뒤에 커밋을 지정한다}"
    git ls-tree -r --name-only "$ref" | match
    exit 0
    ;;
  --match)
    match
    exit 0
    ;;
  *)
    echo "usage: $0 --staged | --tree <ref> | --list <ref> | --match" >&2
    exit 2
    ;;
esac

if [[ -n "$hits" ]]; then
  echo "✖ '$branch' 에는 dev 전용 경로를 커밋할 수 없습니다." >&2
  echo "$hits" | sed 's/^/    /' >&2
  echo "  feat/·core/·doc/ 브랜치에서 커밋해 dev 로 보내고, master 반영은 scripts/git-guard/promote-dev.sh 로 합니다." >&2
  exit 1
fi
