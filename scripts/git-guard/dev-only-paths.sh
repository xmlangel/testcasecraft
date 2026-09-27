#!/usr/bin/env bash
# dev 브랜치에서만 관리하는 경로(에이전트·하네스 설정)가 master 에 들어가는 것을 막는다.
#
#   --staged      : 스테이징된 변경을 검사한다 (pre-commit · pre-merge-commit 훅)
#   --tree <ref>  : 해당 커밋의 트리 전체를 검사한다 (CI)
#
# 막을 경로를 늘리려면 DEV_ONLY_PATHS 만 고친다. 훅과 CI 가 모두 이 목록을 쓴다.
set -euo pipefail

DEV_ONLY_PATHS=(.claude .agent .agents)
PROTECTED_BRANCHES=(master main)

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
    hits="$(git diff --cached --name-only --diff-filter=ACMRT -- "${DEV_ONLY_PATHS[@]}")"
    ;;
  --tree)
    ref="${2:?--tree 뒤에 커밋을 지정한다}"
    hits="$(git ls-tree -r --name-only "$ref" -- "${DEV_ONLY_PATHS[@]}")"
    branch="$ref"
    ;;
  *)
    echo "usage: $0 --staged | --tree <ref>" >&2
    exit 2
    ;;
esac

if [[ -n "$hits" ]]; then
  echo "✖ '$branch' 에는 dev 전용 경로(${DEV_ONLY_PATHS[*]})를 커밋할 수 없습니다." >&2
  echo "$hits" | sed 's/^/    /' >&2
  echo "  dev 브랜치에서 커밋하거나, 스테이징을 풀어 주세요: git restore --staged ${DEV_ONLY_PATHS[*]}" >&2
  exit 1
fi
