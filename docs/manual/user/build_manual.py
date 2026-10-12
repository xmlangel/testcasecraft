#!/usr/bin/env python3
"""장 파일(docs/manual/user/NN_*.md)을 이어 붙여 docs/manual/new/USER_MANUAL.md 합본을 만든다.

앱의 매뉴얼 뷰어(/manual)는 합본 한 파일을 읽고 `## N. 제목` 을 기준으로 목차를 나눈다.
장 파일끼리의 링크(`05_테스트케이스_작성.md#5-1-...`)는 합본 안의 앵커(`#5-1-...`)로,
그림 경로(`../new/images/`)는 합본 기준(`images/`)으로 바꾼다.

사용:
    python3 docs/manual/user/build_manual.py          # 합본 생성
    python3 docs/manual/user/build_manual.py --check  # 합본이 최신인지 확인(다르면 종료 코드 1)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "new" / "USER_MANUAL.md"
CHAPTER_FILE = re.compile(r"^\d{2}_.+\.md$")
PARTS = {1: "1부 시작하기", 4: "2부 테스트 작업", 12: "3부 확장 기능", 15: "4부 관리", 19: "5부 참조"}


def slugify(text: str) -> str:
    """매뉴얼 뷰어(ManualViewer.jsx)의 slugify 와 같은 규칙."""
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text).replace("_", "")
    return re.sub(r"\s", "-", text)


def chapter_files() -> list[Path]:
    return sorted(p for p in HERE.iterdir() if CHAPTER_FILE.match(p.name))


def chapter_title(path: Path) -> str:
    first = path.read_text(encoding="utf-8").split("\n", 1)[0]
    if not first.startswith("## "):
        raise SystemExit(f"{path.name}: 첫 줄이 '## N. 제목' 이 아닙니다")
    return first[3:].strip()


def rewrite_links(text: str, chapter_anchor: dict[str, str]) -> str:
    def repl(m: re.Match) -> str:
        name, anchor = m.group(1), m.group(2)
        if name == "CHANGELOG.md":
            return "](#변경-이력)"
        if name not in chapter_anchor:
            return m.group(0)
        return f"](#{anchor or chapter_anchor[name]})"

    text = re.sub(r"\]\(((?:\d{2}_[^)#]+|CHANGELOG)\.md)(?:#([^)]+))?\)", repl, text)
    text = text.replace("](../new/images/", "](images/")
    return text.replace("](../new/USER_MANUAL_EN.md)", "](USER_MANUAL_EN.md)")


def header() -> list[str]:
    """README 의 머리말과 '읽는 방법' 절(목차 앞까지)."""
    lines = (HERE / "README.md").read_text(encoding="utf-8").split("\n")
    end = lines.index("### 목차")
    return lines[:end]


def build() -> str:
    files = chapter_files()
    titles = {p.name: chapter_title(p) for p in files}
    anchors = {name: slugify(t) for name, t in titles.items()}

    toc = ["## 목차", ""]
    for p in files:
        num = int(p.name[:2])
        if num in PARTS:
            toc += ["", f"**{PARTS[num]}**", ""]
        toc.append(f"- [{titles[p.name]}](#{anchors[p.name]})")
    toc += ["", "---", ""]

    body: list[str] = []
    for p in files:
        body += [p.read_text(encoding="utf-8").rstrip(), "", "---", ""]
    body.append((HERE / "CHANGELOG.md").read_text(encoding="utf-8").rstrip())

    note = [
        "",
        "<!-- 이 파일은 docs/manual/user/build_manual.py 가 만든 합본입니다. 본문은 docs/manual/user/ 에서 고치세요. -->",
        "",
    ]
    text = "\n".join(header() + note + toc + body) + "\n"
    text = rewrite_links(text, anchors)
    return re.sub(r"\n{3,}", "\n\n", text)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="합본이 최신인지 확인만 한다")
    args = ap.parse_args()
    text = build()
    if args.check:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != text:
            print("합본이 장 파일과 다릅니다. build_manual.py 로 다시 만드세요")
            return 1
        print("합본이 최신입니다")
        return 0
    OUT.write_text(text, encoding="utf-8")
    print(f"저장: {OUT} ({len(chapter_files())}개 장, {text.count(chr(10))}줄)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
