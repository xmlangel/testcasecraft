#!/usr/bin/env python3
"""Docker Hub 의 저장소 누적 pull 횟수를 조회해 docs/dockerhub-pull-stats.md 표에 한 줄 기록한다.

크론에 걸지 않는다. 필요할 때 사람이 직접 실행한다.
같은 날짜 행이 이미 있으면 그 행을 새 값으로 갈아 끼우므로 여러 번 실행해도 안전하다.

사용법:
    python3 scripts/dockerhub_pull_stats.py            기록한다
    python3 scripts/dockerhub_pull_stats.py --dry-run  조회만 하고 문서를 고치지 않는다
    python3 scripts/dockerhub_pull_stats.py --note "1.0.126 배포"   비고를 함께 남긴다
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
REPOS = ["xmlangel/testcasecraft", "xmlangel/testcasecraft-rag-service"]
DOC = Path(__file__).resolve().parent.parent / "docs" / "dockerhub-pull-stats.md"
ROW_RE = re.compile(r"^\|\s*(\d{4}-\d{2}-\d{2})\s*\|")


def fetch(repo: str) -> dict:
    url = f"https://hub.docker.com/v2/repositories/{repo}/"
    req = urllib.request.Request(url, headers={"User-Agent": "testcasecraft-pull-stats"})
    with urllib.request.urlopen(req, timeout=20) as res:
        return json.load(res)


def parse_rows(text: str) -> list[list[str]]:
    rows = []
    for line in text.splitlines():
        if ROW_RE.match(line):
            rows.append([c.strip() for c in line.strip().strip("|").split("|")])
    return rows


def to_int(cell: str) -> int | None:
    digits = cell.replace(",", "").strip()
    return int(digits) if digits.isdigit() else None


def delta(current: int, previous: int | None) -> str:
    if previous is None:
        return "-"
    diff = current - previous
    return f"+{diff:,}" if diff > 0 else f"{diff:,}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--note", default="")
    args = ap.parse_args()

    try:
        data = {repo: fetch(repo) for repo in REPOS}
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"조회에 실패했다: {exc}", file=sys.stderr)
        return 1

    now = datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    counts = [data[repo]["pull_count"] for repo in REPOS]

    if not DOC.exists():
        print(f"문서가 없다: {DOC}", file=sys.stderr)
        return 1
    text = DOC.read_text(encoding="utf-8")
    rows = parse_rows(text)

    # 오늘 행을 갱신하는 경우, 증감의 기준은 오늘 이전의 마지막 기록이다.
    prior = [r for r in rows if r[0] != today]
    prev = [to_int(prior[-1][2]), to_int(prior[-1][4])] if prior else [None, None]

    cells = [
        today,
        now.strftime("%H:%M"),
        f"{counts[0]:,}",
        delta(counts[0], prev[0]),
        f"{counts[1]:,}",
        delta(counts[1], prev[1]),
        args.note or "-",
    ]
    row = "| " + " | ".join(cells) + " |"

    for repo, cnt in zip(REPOS, counts):
        print(f"{repo}: {cnt:,}")
    print(row)
    if args.dry_run:
        print("(드라이런이라 문서를 고치지 않았다)")
        return 0

    lines = text.splitlines()
    replaced = False
    for i, line in enumerate(lines):
        m = ROW_RE.match(line)
        if m and m.group(1) == today:
            lines[i] = row
            replaced = True
            break
    if not replaced:
        last = max(i for i, line in enumerate(lines) if ROW_RE.match(line) or set(line.strip()) <= set("|-: ") and line.strip().startswith("|"))
        lines.insert(last + 1, row)

    stamp = now.strftime("%Y-%m-%d %H:%M KST")
    lines = [re.sub(r"^(최종 갱신: ).*$", r"\g<1>" + stamp, l) for l in lines]
    DOC.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"기록했다: {DOC.relative_to(Path.cwd()) if DOC.is_relative_to(Path.cwd()) else DOC}"
          + (" (같은 날 기록을 갱신했다)" if replaced else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
