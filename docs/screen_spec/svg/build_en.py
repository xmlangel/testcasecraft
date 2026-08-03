#!/usr/bin/env python3
"""한국어 배치도의 글자만 영문으로 바꿔 `en/images/` 에 영문 배치도를 만든다.

좌표를 다시 계산하지 않고 텍스트 노드만 갈아 끼운다. 배치는 이미 검증된 것이고,
영문으로 바꾸면서 상자가 넘치는지는 `audit.py` 와 이 스크립트의 폭 검사로 잡는다.

번역은 별도 매핑 파일에서 읽는다. 번역과 적용을 나눈 이유는 적용이 결정적이어야
같은 매핑으로 언제든 같은 결과가 나오기 때문이다.

사용법:
    python3 docs/screen_spec/svg/build_en.py --map <매핑.json>
    python3 docs/screen_spec/svg/build_en.py --map <매핑.json> --check-only
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SPEC = Path(__file__).resolve().parent.parent
EN_IMG = SPEC / "en" / "images"

# 글자 폭 어림. svg_gen 의 tw() 와 같은 기준을 쓴다 —
# 한글·전각은 폰트 크기만큼, 그 외는 0.55배로 본다.
def text_width(s: str, fs: float) -> float:
    w = 0.0
    for ch in s:
        w += fs if ord(ch) > 0x2E7F else fs * 0.55
    return w


def xml_escape(s: str) -> str:
    """SVG 안에 넣어도 XML 이 깨지지 않게 한다.

    번역문에 `&`(Login & Account) 나 `<` 가 그대로 들어오면 문서가 파싱되지 않는다.
    이미 실체 참조(`&lt;` · `&amp;`)로 적힌 것은 두 번 escape 하지 않는다.
    """
    s = re.sub(r"&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);)", "&amp;", s)
    return s.replace("<", "&lt;").replace(">", "&gt;")


def font_size(tag: str, default: float = 12.0) -> float:
    m = re.search(r'font-size="([\d.]+)"', tag)
    if m:
        return float(m.group(1))
    if 'class="tiny"' in tag or "tiny" in tag:
        return 11.0
    return default


def collect_boxes(svg: str) -> list[tuple[float, float, float]]:
    """(x, y, width) 목록 — 글자가 어느 상자 안에 있는지 판정하는 데 쓴다."""
    out = []
    for m in re.finditer(
        r'<rect[^>]*x="([\d.-]+)"[^>]*y="([\d.-]+)"[^>]*width="([\d.]+)"', svg
    ):
        out.append((float(m.group(1)), float(m.group(2)), float(m.group(3))))
    return out


def apply(svg: str, mapping: dict[str, str], canvas_w: float) -> tuple[str, list[str]]:
    """텍스트 노드를 번역으로 갈아 끼우고, 넘칠 만한 것을 돌려준다."""
    warns: list[str] = []
    boxes = collect_boxes(svg)

    def sub(m: re.Match) -> str:
        head, body = m.group(1), m.group(2)
        if not re.search(r"[가-힣]", body):
            return m.group(0)
        new = mapping.get(body)
        if new is None:
            warns.append(f"번역 없음: {body[:50]}")
            return m.group(0)
        fs = font_size(head)
        xm = re.search(r'x="([\d.-]+)"', head)
        x = float(xm.group(1)) if xm else 0.0
        w = text_width(new, fs)
        # 글자가 담긴 가장 좁은 상자를 찾아 그 오른쪽 끝과 견준다
        # 글자가 담긴 상자들 중 오른쪽 끝이 가장 가까운 것을 한계로 본다.
        # 상자가 겹겹이 있으면 가장 안쪽이 실제 한계다.
        limit = canvas_w - x - 8
        for bx, _, bw in boxes:
            if bx <= x < bx + bw:
                limit = min(limit, bx + bw - x - 8)
        if w > limit:
            warns.append(
                f"넘침 위험 {w:.0f}>{limit:.0f}pt (fs{fs:.0f}): {new[:60]}"
            )
        return f"{head}{xml_escape(new)}</text>"

    svg = re.sub(r"(<text[^>]*>)(.*?)</text>", sub, svg, flags=re.S)

    # 그림 전체 설명(aria-label)도 화면 읽기 도구가 읽는 글이다 — 함께 바꾼다
    def sub_aria(m: re.Match) -> str:
        val = m.group(1)
        if not re.search(r"[가-힣]", val):
            return m.group(0)
        new = mapping.get(val)
        if new is None:
            warns.append(f"번역 없음(aria-label): {val[:50]}")
            return m.group(0)
        return f'aria-label="{xml_escape(new)}"'

    svg = re.sub(r'aria-label="([^"]*)"', sub_aria, svg)

    # XML 주석은 그리는 사람이 남긴 한국어 메모다. 화면에 보이지 않지만 영문판 파일에
    # 한국어가 섞여 있으면 검사기가 매번 걸리므로 지운다.
    svg = re.sub(r"<!--.*?-->\s*", "", svg, flags=re.S)
    svg = relayout_legend(svg)
    return svg, warns


LEGEND_SWATCH = 13
LEGEND_GAP_LABEL = 6      # 색 견본과 글자 사이
LEGEND_GAP_ITEM = 18      # 항목 사이


def relayout_legend(svg: str) -> str:
    """범례 한 줄의 x 좌표를 영문 글자폭으로 다시 배치한다.

    범례는 `색 견본 + 라벨` 을 한 줄에 늘어놓은 것이고, 좌표는 한국어 글자폭으로
    계산돼 있었다. 영문은 같은 뜻을 더 넓게 쓰므로 그대로 두면 항목이 서로 겹친다.
    """
    m = re.search(r'<text class="strong" x="([\d.]+)" y="([\d.]+)">Legend</text>', svg)
    if not m:
        return svg
    start_x = float(m.group(1))
    pat = re.compile(
        r'<rect class="(bx[\w-]*)" x="[\d.]+" y="([\d.]+)" width="13" height="13" rx="3"/>\s*'
        r'<text class="tiny" x="[\d.]+" y="([\d.]+)">([^<]*)</text>'
    )
    items = pat.findall(svg)
    if not items:
        return svg

    # "Legend" 글자 뒤에서 시작한다
    x = start_x + text_width("Legend", 12.0) + LEGEND_GAP_ITEM
    parts = []
    for cls, ry, ty, label in items:
        parts.append(
            f'<rect class="{cls}" x="{x:.2f}" y="{ry}" width="13" height="13" rx="3"/>\n'
            f'  <text class="tiny" x="{x + LEGEND_SWATCH + LEGEND_GAP_LABEL:.2f}" '
            f'y="{ty}">{label}</text>'
        )
        x += LEGEND_SWATCH + LEGEND_GAP_LABEL + text_width(label, 11.0) + LEGEND_GAP_ITEM

    # 원래 범례 블록 전체를 새로 배치한 것으로 갈아 끼운다
    first = pat.search(svg)
    last = None
    for last in pat.finditer(svg):
        pass
    return svg[: first.start()] + "\n  ".join(parts) + svg[last.end() :]


def main() -> int:
    ap = argparse.ArgumentParser(description="영문 배치도 생성")
    ap.add_argument("--map", required=True, help="원문→번역 매핑 JSON")
    ap.add_argument(
        "--check-only", action="store_true", help="쓰지 않고 넘침만 검사한다"
    )
    args = ap.parse_args()

    raw = json.loads(Path(args.map).read_text(encoding="utf-8"))
    mapping = {k: v for k, v in raw.items() if not k.startswith("_")}
    print(f"매핑 {len(mapping)}개")

    srcs = sorted(SPEC.rglob("images/*.svg"))
    srcs = [p for p in srcs if EN_IMG not in p.parents]
    EN_IMG.mkdir(parents=True, exist_ok=True)

    total_warn = 0
    missing: set[str] = set()
    for src in srcs:
        svg = src.read_text(encoding="utf-8")
        cw = 960.0
        m = re.search(r'viewBox="0 0 ([\d.]+)', svg)
        if m:
            cw = float(m.group(1))
        out, warns = apply(svg, mapping, cw)
        for w in warns:
            if w.startswith("번역 없음"):
                missing.add(w)
        hard = [w for w in warns if w.startswith("넘침")]
        total_warn += len(hard)
        if hard:
            print(f"\n### {src.name}")
            for w in hard[:6]:
                print(f"   {w}")
            if len(hard) > 6:
                print(f"   … 그 외 {len(hard) - 6}건")
        if not args.check_only:
            (EN_IMG / src.name).write_text(out, encoding="utf-8")

    print(f"\n배치도 {len(srcs)}장 · 넘침 위험 {total_warn}건 · 번역 누락 {len(missing)}건")
    for w in sorted(missing)[:10]:
        print(f"   {w}")
    if not args.check_only:
        print(f"→ {EN_IMG}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
