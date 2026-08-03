# -*- coding: utf-8 -*-
"""화면 배치도 SVG 생성기.

좌표를 손으로 쓰지 않는다. 밴드를 위에서 아래로 쌓고, 열은 폭 가중치로 나눈다.
텍스트는 상자 안쪽 폭에 맞춰 잘라 넣으므로 겹침·이탈이 생기지 않는다.
"""
from xml.sax.saxutils import escape

W = 960          # 기본 캔버스 폭
PAD = 16         # 캔버스 여백
GAP = 10         # 밴드 간격
IN = 12          # 상자 안쪽 여백
LH = 19          # 줄 높이
FS_AREA = 13     # 영역 라벨
FS_DESC = 12     # 설명
FS_TINY = 11     # 보조

CSS = """
    .bx    { fill:#fff; stroke:#d0d5dd; stroke-width:1 }
    .bx-ac { fill:#f7f9ff; stroke:#c7d2fe; stroke-width:1 }
    .bx-ch { fill:#f3f4f6; stroke:#d0d5dd; stroke-width:1 }
    .bx-dq { fill:#fff; stroke:#d0d5dd; stroke-width:1; stroke-dasharray:4 3 }
    .bx-bt { fill:#eef2ff; stroke:#c7d2fe; stroke-width:1 }
    .bx-hd { fill:#f9fafb; stroke:#e5e7eb; stroke-width:1 }
    .area  { font-family:-apple-system,'Malgun Gothic',sans-serif; font-size:13px; font-weight:bold; fill:#111827 }
    .desc  { font-family:-apple-system,'Malgun Gothic',sans-serif; font-size:12px; fill:#475467 }
    .tiny  { font-family:-apple-system,'Malgun Gothic',sans-serif; font-size:11px; fill:#6b7280 }
    .strong{ font-family:-apple-system,'Malgun Gothic',sans-serif; font-size:12px; font-weight:bold; fill:#111827 }
"""


def tw(s, fs):
    """텍스트 렌더 폭 추정 — 한글·전각 1.0em, 그 외 0.55em"""
    return sum(fs * (1.0 if ord(c) > 0x1100 else 0.55) for c in s)


def fit(s, maxw, fs):
    """상자 폭에 맞춰 자른다"""
    if tw(s, fs) <= maxw:
        return s
    out = ""
    for c in s:
        if tw(out + c + "…", fs) > maxw:
            break
        out += c
    return out + "…"


class Doc:
    def __init__(self, width=W, title=None):
        self.w = width
        self.y = PAD
        self.parts = []
        self.title = title

    # ---------- 원시 도형 ----------
    def _rect(self, x, y, w, h, cls="bx", rx=6):
        self.parts.append(f'  <rect class="{cls}" x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{rx}"/>')

    def _text(self, x, y, s, cls="desc", anchor=None):
        if not s:
            return
        a = f' text-anchor="{anchor}"' if anchor else ""
        self.parts.append(f'  <text class="{cls}" x="{x:g}" y="{y:g}"{a}>{escape(s)}</text>')

    def _box_body(self, x, y, w, h, label, lines, right=None, cls="bx"):
        """상자 하나: 좌상단 라벨 + 아래 설명 줄들 + (선택) 우상단 라벨"""
        self._rect(x, y, w, h, cls)
        inner = w - IN * 2
        ty = y + IN + FS_AREA - 2
        if label:
            lab = label
            if right:
                rw = tw(right, FS_DESC)
                lab = fit(label, inner - rw - 12, FS_AREA)
            else:
                lab = fit(label, inner, FS_AREA)
            self._text(x + IN, ty, lab, "area")
            if right:
                self._text(x + w - IN, ty, fit(right, inner * 0.45, FS_DESC), "desc", "end")
            ty += LH + 2
        for ln in lines or []:
            if ty > y + h - 4:
                break
            cls_l, txt = ("desc", ln) if isinstance(ln, str) else ln
            fs = FS_TINY if cls_l == "tiny" else FS_DESC
            self._text(x + IN, ty, fit(txt, inner, fs), cls_l)
            ty += LH

    @staticmethod
    def _need(label, lines):
        n = (1 if label else 0) + len(lines or [])
        return IN * 2 + max(1, n) * LH + 2

    # ---------- 밴드 ----------
    def band(self, label, lines=None, h=None, cls="bx", right=None):
        lines = lines or []
        h = h or self._need(label, lines)
        self._box_body(PAD, self.y, self.w - PAD * 2, h, label, lines, right, cls)
        self.y += h + GAP
        return self

    def cols(self, specs, h=None, gap=GAP):
        """specs: [(label, lines, weight, cls), ...]"""
        norm = []
        for sp in specs:
            label, lines = sp[0], sp[1] or []
            weight = sp[2] if len(sp) > 2 else 1
            cls = sp[3] if len(sp) > 3 else "bx"
            norm.append((label, lines, weight, cls))
        h = h or max(self._need(l, ln) for l, ln, _, _ in norm)
        total = self.w - PAD * 2 - gap * (len(norm) - 1)
        wsum = sum(n[2] for n in norm)
        x = PAD
        for label, lines, weight, cls in norm:
            bw = total * weight / wsum
            self._box_body(x, self.y, bw, h, label, lines, None, cls)
            x += bw + gap
        self.y += h + GAP
        return self

    def table(self, label, headers, rows, widths=None, note=None):
        """표 형태 영역"""
        n = len(headers)
        widths = widths or [1] * n
        head_h, row_h = 26, 24
        h = IN * 2 + (LH if label else 0) + head_h + row_h * len(rows) + (LH if note else 0) + 4
        x0, y0, bw = PAD, self.y, self.w - PAD * 2
        self._rect(x0, y0, bw, h, "bx")
        ty = y0 + IN + FS_AREA - 2
        if label:
            self._text(x0 + IN, ty, fit(label, bw - IN * 2, FS_AREA), "area")
            ty += LH
        tx0, tw_all = x0 + IN, bw - IN * 2
        wsum = sum(widths)
        self._rect(tx0, ty - 2, tw_all, head_h, "bx-hd", 4)
        cx = tx0
        for hd, wt in zip(headers, widths):
            cw = tw_all * wt / wsum
            self._text(cx + 8, ty + 15, fit(hd, cw - 12, FS_TINY), "tiny")
            cx += cw
        ty += head_h
        for r in rows:
            cx = tx0
            for cell, wt in zip(r, widths):
                cw = tw_all * wt / wsum
                self._text(cx + 8, ty + 15, fit(str(cell), cw - 12, FS_DESC), "desc")
                cx += cw
            ty += row_h
        if note:
            self._text(tx0, ty + 12, fit(note, tw_all, FS_TINY), "tiny")
        self.y = y0 + h + GAP
        return self

    def note(self, *lines):
        for ln in lines:
            self._text(PAD, self.y + FS_TINY, fit(ln, self.w - PAD * 2, FS_TINY), "tiny")
            self.y += LH
        self.y += 2
        return self

    def legend(self, items):
        """items: [(cls, 설명), ...] — 한 줄에 배치, 폭 초과 시 다음 줄"""
        x, y = PAD, self.y + 6
        self._text(x, y + FS_TINY, "범례", "strong")
        x += tw("범례", 12) + 14
        for cls, label in items:
            need = 14 + 6 + tw(label, FS_TINY) + 18
            if x + need > self.w - PAD:
                y += LH
                x = PAD + tw("범례", 12) + 14
            self._rect(x, y + 2, 13, 13, cls, 3)
            self._text(x + 19, y + FS_TINY + 1, label, "tiny")
            x += need
        self.y = y + LH + 4
        return self

    def render(self, path, aria):
        h = self.y - GAP + PAD
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w:g} {h:g}" '
                f'width="100%" role="img" aria-label="{escape(aria)}">')
        body = "\n".join([head, "  <defs>", f'    <style>{CSS}    </style>', "  </defs>"] + self.parts + ["</svg>", ""])
        import pathlib
        pathlib.Path(path).write_text(body, encoding="utf-8")
        print(f"생성 {path}  ({self.w:g}×{h:g})")
