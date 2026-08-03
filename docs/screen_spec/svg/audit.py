# -*- coding: utf-8 -*-
"""SVG 배치 감사: viewBox 이탈 · rect 겹침 · text 박스 넘침 추정"""
import re, sys, pathlib, xml.etree.ElementTree as ET
NS = "{http://www.w3.org/2000/svg}"

def w_est(s, fs):
    """텍스트 렌더 폭 추정 — 한글/전각 1.0em, 그 외 0.55em"""
    w = 0.0
    for ch in s:
        w += fs * (1.0 if ord(ch) > 0x1100 else 0.55)
    return w

def num(v, d=0.0):
    try: return float(v)
    except Exception: return d

def audit(path):
    try: root = ET.parse(path).getroot()
    except Exception as e: return [f"PARSE FAIL: {e}"], 0
    vb = root.get("viewBox")
    if not vb: return ["viewBox 없음"], 0
    vx, vy, vw, vh = [float(x) for x in vb.split()]
    issues = []
    rects, texts = [], []
    # 클래스별 font-size 수집
    css = " ".join(e.text or "" for e in root.iter(NS+"style"))
    clsfs = {}
    for m in re.finditer(r'\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}', css):
        fm = re.search(r'font-size:\s*([\d.]+)', m.group(2))
        if fm: clsfs[m.group(1)] = float(fm.group(1))
    for el in root.iter():
        t = el.tag.replace(NS, "")
        if t == "rect":
            x,y,w,h = num(el.get("x")), num(el.get("y")), num(el.get("width")), num(el.get("height"))
            rects.append((x,y,w,h,el.get("class") or ""))
            if x < vx-1 or y < vy-1 or x+w > vx+vw+1 or y+h > vy+vh+1:
                issues.append(f"rect viewBox 이탈: x={x} y={y} w={w} h={h}")
        elif t == "text":
            x,y = num(el.get("x")), num(el.get("y"))
            s = "".join(el.itertext()).strip()
            fs = None
            st = el.get("style") or ""
            fm = re.search(r'font-size:\s*([\d.]+)', st)
            if fm: fs = float(fm.group(1))
            if fs is None:
                for c in (el.get("class") or "").split():
                    if c in clsfs: fs = clsfs[c]; break
            fs = fs or num(el.get("font-size"), 12)
            anc = el.get("text-anchor") or ""
            wd = w_est(s, fs)
            x0 = x - wd if anc == "end" else (x - wd/2 if anc == "middle" else x)
            texts.append((x0,y,s,fs))
            if y < vy-1 or y > vy+vh+1 or x0 < vx-1:
                issues.append(f"text viewBox 이탈: ({x0:.0f},{y}) {s[:30]!r}")
            elif x0 + wd > vx+vw+2:
                issues.append(f"text 우측 이탈 {int(x0+wd)}>{int(vx+vw)}: {s[:40]!r}")
    # rect 겹침 (같은 크기 중복 제외, 면적 20% 이상 겹칠 때만)
    for i in range(len(rects)):
        for j in range(i+1, len(rects)):
            ax,ay,aw,ah,_ = rects[i]; bx,by,bw,bh,_ = rects[j]
            ox = max(0, min(ax+aw,bx+bw)-max(ax,bx)); oy = max(0, min(ay+ah,by+bh)-max(ay,by))
            if ox<=1 or oy<=1: continue
            inter = ox*oy; small = min(aw*ah, bw*bh)
            if small>0 and inter/small > 0.2:
                # 큰 컨테이너가 작은 것을 완전히 감싸면 정상(중첩)
                contained = (ax<=bx and ay<=by and ax+aw>=bx+bw and ay+ah>=by+bh) or \
                            (bx<=ax and by<=ay and bx+bw>=ax+aw and by+bh>=ay+ah)
                if not contained:
                    issues.append(f"rect 겹침 {int(inter/small*100)}%: ({ax},{ay},{aw},{ah}) × ({bx},{by},{bw},{bh})")
    # text 끼리 같은 y대역에서 겹침
    for i in range(len(texts)):
        for j in range(i+1, len(texts)):
            x1,y1,s1,f1 = texts[i]; x2,y2,s2,f2 = texts[j]
            if abs(y1-y2) > max(f1,f2)*0.6: continue
            if x1 <= x2:
                if x1 + w_est(s1,f1) > x2 + 1:
                    issues.append(f"text 겹침 y≈{y1}: {s1[:24]!r} × {s2[:24]!r}")
            else:
                if x2 + w_est(s2,f2) > x1 + 1:
                    issues.append(f"text 겹침 y≈{y1}: {s2[:24]!r} × {s1[:24]!r}")
    return issues, len(rects)+len(texts)

tot=0
for p in sorted(pathlib.Path("docs/screen_spec").rglob("*.svg")):
    iss, n = audit(p)
    rel = str(p.relative_to("docs/screen_spec"))
    if iss:
        print(f"\n### {rel}  (요소 {n}개, 문제 {len(iss)}건)")
        for s in iss[:12]: print("   -", s)
        if len(iss)>12: print(f"   … 외 {len(iss)-12}건")
        tot+=len(iss)
    else:
        print(f"\n### {rel}  (요소 {n}개) — 이상 없음")
print(f"\n총 문제 {tot}건")
