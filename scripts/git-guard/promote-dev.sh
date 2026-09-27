#!/usr/bin/env bash
# dev 를 master 로 올리는 release 브랜치를 만들고 PR 을 연다.
# dev 전용 경로(dev-only-paths.sh 의 정규식)는 release 브랜치에서만 추적 해제한다. 작업 폴더의 파일은 지우지 않는다.
#
#   usage: promote-dev.sh [--skip-pr]
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
cd "$(git rev-parse --show-toplevel)"

[[ -z "$(git status --porcelain --untracked-files=no)" ]] \
  || { echo "✖ 커밋하지 않은 변경이 있습니다. 정리한 뒤 다시 실행하세요." >&2; exit 1; }

git fetch -q origin
stamp="$(TZ=Asia/Seoul date +%Y%m%d-%H%M)"
branch="release/dev-$stamp"

git switch -q -c "$branch" origin/dev
files=()
while IFS= read -r f; do files+=("$f"); done < <("$here/dev-only-paths.sh" --list HEAD)
if (( ${#files[@]} )); then
  git rm -q --cached -- "${files[@]}"
  git commit -q -m "chore(release): dev 전용 경로 추적 해제 (${#files[@]}개)"
fi

"$here/dev-only-paths.sh" --tree HEAD
"$here/branch-flow.sh" master "$branch"

git push -q -u origin "$branch"
if [[ "${1:-}" != "--skip-pr" ]]; then
  gh pr create --base master --head "$branch" \
    --title "release: dev → master ($stamp KST)" \
    --body "dev(\`$(git rev-parse --short origin/dev)\`)를 master 로 올립니다. dev 전용 경로 ${#files[@]}개는 이 브랜치에서 추적 해제했습니다."
fi
echo "✔ $branch"
