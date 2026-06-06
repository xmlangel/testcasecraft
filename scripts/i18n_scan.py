#!/usr/bin/env python3
"""t() 호출 밖 하드코딩 한국어 문자열 스캐너.

사용:
    python3 scripts/i18n_scan.py <파일경로...>          # 파일별 잔여 출력
    python3 scripts/i18n_scan.py --all                  # 프런트 전체 요약

종료 코드: 잔여 0 이면 0, 있으면 1 (CI/자가검증용).
console.* 줄과 주석은 제외한다.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SRC = REPO / "src/main/frontend/src"
HANGUL = re.compile(r"[가-힣]")
STR_RE = re.compile(r"""(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1""")


def strip_t_calls(text: str) -> str:
    out, i, n = [], 0, len(text)
    while i < n:
        m = re.search(r"\bt\(", text[i:])
        if not m:
            out.append(text[i:])
            break
        s = i + m.start()
        out.append(text[i:s])
        j, depth = s + m.end() - m.start(), 1
        while j < n and depth:
            if text[j] == "(":
                depth += 1
            elif text[j] == ")":
                depth -= 1
            j += 1
        out.append(" " * (j - s))
        i = j
    return "".join(out)


def scan(path: Path) -> list[tuple[int, str]]:
    raw = path.read_text(encoding="utf-8", errors="ignore")
    text = re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group(0)), raw, flags=re.S)
    text = re.sub(
        r"(^|\s)//[^\n]*",
        lambda m: m.group(1) + " " * (len(m.group(0)) - len(m.group(1))),
        text,
    )
    stripped = strip_t_calls(text)
    lines = raw.splitlines()
    found = []
    for m in STR_RE.finditer(stripped):
        s = m.group(2)
        if not HANGUL.search(s):
            continue
        line = text[: m.start()].count("\n") + 1
        lt = lines[line - 1] if line <= len(lines) else ""
        if "console." in lt:
            continue
        found.append((line, s))
    return found


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 0
    if args == ["--all"]:
        files = sorted(SRC.rglob("*.jsx")) + sorted(SRC.rglob("*.js"))
    else:
        files = []
        for a in args:
            p = Path(a)
            if not p.is_absolute():
                p = (REPO / a) if (REPO / a).exists() else (SRC / a)
            files.append(p)
    total = 0
    for f in files:
        if not f.exists():
            print(f"!! not found: {f}")
            continue
        found = scan(f)
        if found:
            total += len(found)
            rel = f.relative_to(REPO) if f.is_relative_to(REPO) else f
            print(f"== {rel} ({len(found)}건)")
            for line, s in found:
                print(f"   L{line}: {s[:60]}")
    print(f"TOTAL remaining: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
