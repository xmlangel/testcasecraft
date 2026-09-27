#!/usr/bin/env bash
# 브랜치 흐름을 고정한다:  feat/* · core/* · doc/*  →  dev  →  master
#
#   usage: branch-flow.sh <base> <head> [<head-ref>]
#
# - base 가 dev    : head 는 feat/ · core/ · doc/ 로 시작해야 한다.
# - base 가 master : head 는 release/ 로 시작해야 한다(promote-dev.sh 가 만든다).
#                    그리고 origin/dev 에 없는 커밋은 dev 전용 경로를 지우는 것만 허용한다.
#                    dev 는 dev 전용 파일을 추적하므로 master 로 직접 병합하지 않는다.
# - 그 밖의 base   : 검사하지 않는다.
#
# head-ref 는 검사할 커밋이다. 생략하면 HEAD 를 쓴다.
set -euo pipefail

base="${1:?base 브랜치를 지정한다}"
head="${2:?head 브랜치를 지정한다}"
ref="${3:-HEAD}"
here="$(cd "$(dirname "$0")" && pwd)"

fail() { echo "✖ $*" >&2; exit 1; }

case "$base" in
  dev)
    [[ "$head" =~ ^(feat|core|doc)/ ]] \
      || fail "dev 로는 feat/ · core/ · doc/ 브랜치만 병합할 수 있습니다 (받은 값: $head)"
    ;;
  master|main)
    [[ "$head" =~ ^release/ ]] \
      || fail "master 로는 release/ 브랜치만 병합할 수 있습니다 (받은 값: $head). scripts/git-guard/promote-dev.sh 로 만드세요"
    for c in $(git rev-list --no-merges "origin/dev..$ref"); do
      # 삭제가 아닌 변경, 그리고 dev 전용 경로가 아닌 파일의 삭제를 모은다.
      changed="$(git diff-tree --no-commit-id --name-only --diff-filter=d -r "$c")"
      deleted="$(git diff-tree --no-commit-id --name-only --diff-filter=D -r "$c")"
      stray="$(comm -23 <(sort <<<"$deleted") <("$here/dev-only-paths.sh" --match <<<"$deleted" | sort))"
      other="$(printf '%s\n%s\n' "$changed" "$stray" | sed '/^$/d')"
      [[ -z "$other" ]] \
        || fail "release 브랜치에 dev 에 없는 변경이 있습니다 ($(git log -1 --format=%h "$c")): $(tr '\n' ' ' <<<"$other")"
    done
    ;;
esac
echo "✔ 브랜치 흐름 통과: $head → $base"
