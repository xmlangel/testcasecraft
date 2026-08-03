#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""화면 기획 문서 정합 검증.

    python3 docs/screen_spec/validate.py

문서를 손본 뒤 이 스크립트를 돌려 규격에서 벗어난 곳을 찾는다.
검사 항목은 아래 CHECKS 목록에 있고, 하나라도 어긋나면 종료 코드 1을 돌려준다.
"""
import re
import sys
import pathlib
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent
MANUAL_IMG = ROOT.parent / "manual" / "new"
SVG_NS = "{http://www.w3.org/2000/svg}"
KINDS = {"01": "업무프로세스", "02": "화면정의", "03": "컴포넌트", "04": "요건반영목록"}

# 폴더 → (화면 ID, 표시 이름). README 2절 화면 목록과 같아야 한다.
SCREENS = {
    "0.로그인계정": ("S0", "로그인·계정"),
    "1.프로젝트": ("S1", "프로젝트"),
    "2.공통레이아웃": ("S2", "공통 레이아웃"),
    "3.대시보드": ("S3", "대시보드"),
    "4.테스트케이스": ("S4", "테스트케이스"),
    "5.테스트플랜": ("S5", "테스트 플랜"),
    "6.테스트실행": ("S6", "테스트 실행"),
    "7.테스트결과": ("S7", "테스트 결과"),
    "8.자동화테스트": ("S8", "자동화 테스트"),
    "9.RAG문서": ("S9", "RAG 문서"),
    "10.탐색세션": ("S10", "탐색 세션"),
    "11.관리자설정": ("S11", "관리자 설정"),
}
# 조건부로 노출되는 화면은 01 머리말에 노출 조건 줄을 둔다.
CONDITIONAL = {"9.RAG문서", "10.탐색세션"}

# 기획 문서에 남으면 안 되는 것
FORBIDDEN = [
    ("소스 파일명·행번호", re.compile(r'[A-Za-z][A-Za-z0-9_.]*\.(?:jsx?|java|tsx?|py)\b')),
    ("테스트 식별자", re.compile(r'testid|testId')),
    ("내부 식별자", re.compile(r'\btabIndex\b|\buseState\b|React\.lazy|\bslotProps\b|\blocalStorage\b|'
                              r'\bDataGrid\b|\bAccordion\b|\bTabPanel\b|has(?:Edit|Management|ResultEntry)Role|'
                              r'can[A-Z][a-zA-Z]*Project|isRagEnabled|getVisibleNavItems')),
    ("절 기호 §", re.compile(r'§')),
    ("비유어", re.compile(r'골격|껍데기')),
    ("목업 잔재", re.compile(r'정본 입력|\(개발 중\)|\(가정\)')),
]

# README 만 예외로 두는 파일 이름. 이 폴더의 도구와 화면 ID 판별 규칙의 위치다.
README_ALLOW = {"validate.py", "build_html.py", "screenIds.js"}

errs, warns = [], []


def err(msg):
    errs.append(msg)


def warn(msg):
    warns.append(msg)


def md_files():
    for d in sorted(ROOT.iterdir()):
        if d.is_dir() and d.name in SCREENS:
            for k in KINDS:
                fs = list(d.glob(f"{k}_*.md"))
                if fs:
                    yield d.name, k, fs[0]


# ── 1. 구조 ────────────────────────────────────────────────
def check_structure():
    for name in SCREENS:
        d = ROOT / name
        if not d.is_dir():
            err(f"[구조] 폴더 없음: {name}")
            continue
        for k, dn in KINDS.items():
            if not list(d.glob(f"{k}_*.md")):
                err(f"[구조] {name}: {k}_*{dn}.md 없음")
        if not list((d / "images").glob("*.svg")):
            err(f"[구조] {name}: images/*.svg 없음")
    for f in ("README.md", "00_전체_업무프로세스.md"):
        if not (ROOT / f).exists():
            err(f"[구조] 루트 문서 없음: {f}")


# ── 2. 제목·머리말 ──────────────────────────────────────────
def head_block(text):
    lines = text.split("\n")
    h1 = next((i for i, l in enumerate(lines) if l.startswith("# ")), None)
    if h1 is None:
        return None, []
    j, blk = h1 + 1, []
    while j < len(lines) and not lines[j].startswith("---"):
        if lines[j].strip():
            blk.append(lines[j].strip())
        j += 1
    return lines[h1], blk


def check_head():
    for folder, kind, p in md_files():
        sid, disp = SCREENS[folder]
        text = p.read_text(encoding="utf-8")
        h1, blk = head_block(text)
        want = f"# {disp}({sid}) {KINDS[kind]}"
        if h1 != want:
            err(f"[제목] {folder}/{p.name}: {h1!r} ≠ {want!r}")
        keys = []
        for l in blk:
            t = l.lstrip("> ").strip()
            for key in ("화면 ID", "라우트", "노출 조건", "캡처", "기준 버전", "상태 표기와 참조 규약"):
                if t.startswith(key):
                    keys.append(key)
                    break
            else:
                err(f"[머리말] {folder}/{p.name}: 규격 밖 줄 — {l[:60]!r}")
        expect = {
            "01": ["화면 ID", "라우트"] + (["노출 조건"] if folder in CONDITIONAL else []),
            "02": ["화면 ID", "라우트", "캡처"],
            "03": ["화면 ID"],
            "04": ["화면 ID", "기준 버전", "상태 표기와 참조 규약"],
        }[kind]
        if keys != expect:
            err(f"[머리말] {folder}/{p.name}: {keys} ≠ {expect}")
        if f"**{sid}**" not in text.split("---")[0]:
            err(f"[화면 ID] {folder}/{p.name}: 머리말에 {sid} 없음")


# ── 3. 라우트·요건 ID ───────────────────────────────────────
def route_line(p):
    for l in p.read_text(encoding="utf-8").split("\n"):
        if l.startswith("> 라우트:"):
            return l.strip()
    return None


def check_route_and_reqid():
    for name in SCREENS:
        d = ROOT / name
        r1, r2 = [route_line(list(d.glob(f"{k}_*.md"))[0]) for k in ("01", "02")]
        if r1 != r2:
            err(f"[라우트] {name}: 01과 02의 라우트 줄이 다르다")
        sid = SCREENS[name][0]
        f04 = list(d.glob("04_*.md"))[0]
        found = set(re.findall(r'\b(S\d+)-', f04.read_text(encoding="utf-8")))
        if found - {sid}:
            err(f"[요건 ID] {name}/04: {sorted(found)} — {sid} 만 써야 한다")


# ── 4. 표·코드블록·링크 ─────────────────────────────────────
def ncols(line):
    s = line.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|"):
        s = s[:-1]
    return len(s.replace("\\|", "\x00").split("|"))


def check_markdown():
    for p in sorted(ROOT.rglob("*.md")):
        rel = p.relative_to(ROOT)
        text = p.read_text(encoding="utf-8")
        lines = text.split("\n")
        if sum(1 for l in lines if l.lstrip().startswith("```")) % 2:
            err(f"[코드블록] {rel}: 여는 표시와 닫는 표시 수가 맞지 않는다")
        i, in_fence = 0, False
        while i < len(lines):
            if lines[i].lstrip().startswith("```"):
                in_fence = not in_fence
                i += 1
                continue
            if (not in_fence and lines[i].strip().startswith("|") and i + 1 < len(lines)
                    and re.match(r'^\|[\s:\-|]+\|?$', lines[i + 1].strip())):
                hc, sc, j, probs = ncols(lines[i]), ncols(lines[i + 1]), i + 2, []
                if hc != sc:
                    probs.append(f"구분선 {sc}열")
                while j < len(lines) and lines[j].strip().startswith("|"):
                    if ncols(lines[j]) != hc:
                        probs.append(f"{j+1}행 {ncols(lines[j])}열")
                    j += 1
                if probs:
                    err(f"[표] {rel}:{i+1} 헤더 {hc}열인데 {', '.join(probs[:4])}")
                i = j
                continue
            i += 1
        for m in re.finditer(r'\[[^\]]*\]\(([^)#][^)]*)\)', text):
            t = m.group(1).strip()
            if t.startswith(("http", "mailto")):
                continue
            if not (p.parent / t).resolve().exists():
                err(f"[링크] {rel} → {t} 없음")


# ── 5. 캡처·SVG ────────────────────────────────────────────
def check_assets():
    have = {q.name for q in (MANUAL_IMG / "images").glob("*.png")} | \
           {q.name for q in (MANUAL_IMG / "images_en").glob("*.png")}
    for p in sorted(ROOT.rglob("*.md")):
        text = p.read_text(encoding="utf-8")
        for m in re.finditer(r'`([0-9A-Za-z_]+\.png)`', text):
            if m.group(1) not in have:
                err(f"[캡처] {p.relative_to(ROOT)}: 매뉴얼에 {m.group(1)} 없음")
        for m in re.finditer(r'!\[[^\]]*\]\((images/[^)]+\.svg)\)', text):
            if not (p.parent / m.group(1)).exists():
                err(f"[배치도] {p.relative_to(ROOT)} → {m.group(1)} 없음")

    def width(s, fs):
        return sum(fs * (1.0 if ord(c) > 0x1100 else 0.55) for c in s)

    for svg in sorted(ROOT.rglob("*.svg")):
        rel = svg.relative_to(ROOT)
        try:
            root = ET.parse(svg).getroot()
        except Exception as e:
            err(f"[배치도] {rel}: XML 오류 — {e}")
            continue
        vb = root.get("viewBox")
        if not vb:
            err(f"[배치도] {rel}: viewBox 없음")
            continue
        vx, vy, vw, vh = (float(x) for x in vb.split())
        css = " ".join(e.text or "" for e in root.iter(SVG_NS + "style"))
        clsfs = {m.group(1): float(m.group(2)) for m in
                 re.finditer(r'\.([A-Za-z0-9_-]+)\s*\{[^}]*font-size:\s*([\d.]+)', css)}
        rects, texts = [], []
        for el in root.iter():
            tag = el.tag.replace(SVG_NS, "")
            g = lambda k: float(el.get(k) or 0)
            if tag == "rect":
                x, y, w, h = g("x"), g("y"), g("width"), g("height")
                rects.append((x, y, w, h))
                if x < vx - 1 or y < vy - 1 or x + w > vx + vw + 1 or y + h > vy + vh + 1:
                    err(f"[배치도] {rel}: 상자가 그림 밖으로 나간다 ({x:g},{y:g})")
            elif tag == "text":
                s = "".join(el.itertext()).strip()
                fs = next((clsfs[c] for c in (el.get("class") or "").split() if c in clsfs), 12)
                m = re.search(r'font-size:\s*([\d.]+)', el.get("style") or "")
                if m:
                    fs = float(m.group(1))
                wd = width(s, fs)
                anc = el.get("text-anchor") or ""
                x0 = g("x") - wd if anc == "end" else (g("x") - wd / 2 if anc == "middle" else g("x"))
                texts.append((x0, g("y"), s, fs, wd))
                if g("y") < vy - 1 or g("y") > vy + vh + 1 or x0 < vx - 1 or x0 + wd > vx + vw + 2:
                    err(f"[배치도] {rel}: 글자가 그림 밖으로 나간다 — {s[:24]!r}")
        for a in range(len(rects)):
            for b in range(a + 1, len(rects)):
                ax, ay, aw, ah = rects[a]
                bx, by, bw, bh = rects[b]
                ox = max(0, min(ax + aw, bx + bw) - max(ax, bx))
                oy = max(0, min(ay + ah, by + bh) - max(ay, by))
                small = min(aw * ah, bw * bh)
                if ox > 1 and oy > 1 and small > 0 and ox * oy / small > 0.2:
                    nested = (ax <= bx and ay <= by and ax + aw >= bx + bw and ay + ah >= by + bh) or \
                             (bx <= ax and by <= ay and bx + bw >= ax + aw and by + bh >= ay + ah)
                    if not nested:
                        err(f"[배치도] {rel}: 상자가 겹친다 ({ax:g},{ay:g}) × ({bx:g},{by:g})")
        for a in range(len(texts)):
            for b in range(a + 1, len(texts)):
                x1, y1, s1, f1, w1 = texts[a]
                x2, y2, s2, f2, w2 = texts[b]
                if abs(y1 - y2) > max(f1, f2) * 0.6:
                    continue
                lo, hi = ((x1, w1, s1), (x2, w2, s2)) if x1 <= x2 else ((x2, w2, s2), (x1, w1, s1))
                if lo[0] + lo[1] > hi[0] + 1:
                    err(f"[배치도] {rel}: 글자가 겹친다 — {lo[2][:20]!r} × {hi[2][:20]!r}")


# ── 6. 금지 항목·문체 ───────────────────────────────────────
def check_style():
    quoted = re.compile(r'`[^`\n]*`|"[^"\n]*"|“[^”\n]*”')
    for p in sorted(ROOT.rglob("*.md")):
        rel = p.relative_to(ROOT)
        text = p.read_text(encoding="utf-8")
        for label, pat in FORBIDDEN:
            for m in pat.finditer(text):
                if rel.name == "README.md" and (
                        label == "절 기호 §"           # 규약을 설명하는 문장에서 한 번 쓴다
                        or m.group(0) in README_ALLOW   # 유지보수자가 찾아가야 하는 파일 두 개
                ):
                    continue
                line = text[:m.start()].count("\n") + 1
                err(f"[금지:{label}] {rel}:{line} — {m.group(0)[:40]!r}")
        in_fence = False
        for i, l in enumerate(text.split("\n"), 1):
            if l.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            if re.search(r'습니다|입니다', quoted.sub("", l)):
                warn(f"[문체] {rel}:{i} 합니다체 — {l.strip()[:70]!r}")


def check_readme():
    text = (ROOT / "README.md").read_text(encoding="utf-8")
    for folder, (sid, disp) in SCREENS.items():
        if f"`{folder}`" not in text:
            err(f"[README] 2절 화면 목록에 {folder} 없음")
        if f"**{sid}**" not in text:
            err(f"[README] 2절 화면 목록에 {sid} 없음")


CHECKS = [
    ("구조", check_structure), ("제목·머리말", check_head),
    ("라우트·요건 ID", check_route_and_reqid), ("표·코드블록·링크", check_markdown),
    ("캡처·배치도", check_assets), ("금지 항목·문체", check_style), ("README 목록", check_readme),
]

if __name__ == "__main__":
    print(f"검증 대상: {ROOT}")
    for label, fn in CHECKS:
        before = len(errs)
        fn()
        print(f"  {label:<16} {'통과' if len(errs) == before else f'{len(errs)-before}건'}")
    docs = len(list(ROOT.rglob("*.md")))
    svgs = len(list(ROOT.rglob("*.svg")))
    lines = sum(len(p.read_text(encoding='utf-8').splitlines()) for p in ROOT.rglob("*.md"))
    print(f"\n문서 {docs}개 · 배치도 {svgs}장 · {lines:,}행")
    if warns:
        print(f"\n확인 권고 {len(warns)}건")
        for w in warns[:20]:
            print("  ", w)
    if errs:
        print(f"\n어긋난 곳 {len(errs)}건")
        for e in errs[:60]:
            print("  ", e)
        if len(errs) > 60:
            print(f"   … 외 {len(errs)-60}건")
        sys.exit(1)
    print("\n모든 검사 통과")
