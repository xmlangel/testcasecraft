#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""화면 커버리지 감사 — 코드 · 실제 화면 · 사용자 매뉴얼 · 화면 기획 문서 4자 대조.

    python3 .claude/skills/screen-coverage-audit/scripts/audit.py code      # 코드가 가진 화면(분모)
    python3 .claude/skills/screen-coverage-audit/scripts/audit.py spec      # 기획 문서
    python3 .claude/skills/screen-coverage-audit/scripts/audit.py manual    # 사용자 매뉴얼
    python3 .claude/skills/screen-coverage-audit/scripts/audit.py app       # 실제 화면 실측(앱 실행 필요)
    python3 .claude/skills/screen-coverage-audit/scripts/audit.py matrix    # 넷을 합쳐 갭 리포트
    python3 .claude/skills/screen-coverage-audit/scripts/audit.py all

분모는 코드다. 코드가 가진 라우트·영역·화면이 기획 문서와 매뉴얼과 캡처에 없으면 누락이다.

수집은 이 스크립트가 결정적으로 한다. 무엇이 진짜 누락이고 무엇이 의도된 미노출인지는
사람이나 에이전트가 판정한다 — 스크립트는 판정하지 않고 사실만 모은다.

산출물은 `.workspace/screen-coverage-audit/` 에 남는다.
  00_code.json · 01_spec.json · 02_manual.json · 03_app.json · 04_matrix.json · REPORT.md
"""
import json
import os
import re
import subprocess
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[4]
SPEC = ROOT / "docs/screen_spec"
MANUAL = ROOT / "docs/manual/new"
FRONT = ROOT / "src/main/frontend/src"
WS = ROOT / ".workspace/screen-coverage-audit"

APP_BASE = os.environ.get("SCA_BASE", "http://localhost:8080")
APP_USER = os.environ.get("SCA_USER", "admin")
APP_PASS = os.environ.get("SCA_PASS", "admin123")

# 자체 화면이 아니라 다른 화면을 담는 자리인 라우트. 배지는 담긴 화면의 ID 로 뜨는 것이 맞다.
SHELL_ROUTES = {"S2": {"/projects/{projectId}"}}


def save(name, obj):
    WS.mkdir(parents=True, exist_ok=True)
    (WS / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  → {WS.relative_to(ROOT)}/{name}")


def load(name):
    p = WS / name
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


# ──────────────────────────────── 코드 ────────────────────────────────
def collect_code():
    """코드가 실제로 가진 화면을 뽑는다. 이 목록이 감사의 분모다.

    라우트 정의 · 프로젝트 영역 목록 · 화면 단위로 나눠 받는 컴포넌트 · 관리 메뉴 항목.
    여기 있는 것이 기획 문서·매뉴얼·캡처에 없으면 누락이다.
    """
    app = (FRONT / "App.jsx").read_text(encoding="utf-8")
    nav = (FRONT / "components/navigation/projectNavItems.js").read_text(encoding="utf-8")
    sids = (FRONT / "constants/screenIds.js").read_text(encoding="utf-8")

    routes = sorted({m.group(1) for m in re.finditer(r'<Route\s+path="([^"]+)"', app)} - {"/*"})
    areas = [{"key": m.group(1), "label": m.group(2)}
             for m in re.finditer(r'key:\s*"([a-z]+)",[\s\S]{0,240}?label:\s*"([^"]+)"', nav)]
    lazy = sorted({m.group(1) for m in re.finditer(r'const\s+(\w+)\s*=\s*React\.lazy', app)})
    admin = sorted({m.group(1) for m in re.finditer(r'handleManagementNavigate\("([^"]+)"\)', app)})
    admin_off = sorted({m.group(1) for m in re.finditer(
        r"handleManagementNavigate\('([^']+)'\)", app)})
    ids = sorted({m.group(1) for m in re.finditer(r'"(S\d+)"\]', sids)}, key=lambda x: int(x[1:]))
    rules = len(re.findall(r'"S\d+"\]', sids))
    out = {"routes": routes, "areas": areas, "lazyScreens": lazy,
           "adminMenu": admin, "adminMenuCommented": admin_off,
           "screenIdRules": rules, "screenIds": ids}
    print(f"코드: 라우트 {len(routes)}개 · 영역 {len(areas)}개 · 화면 컴포넌트 {len(lazy)}개 · "
          f"관리 메뉴 {len(admin)}개 · 화면 ID {len(ids)}개/규칙 {rules}개")
    save("00_code.json", out)
    return out


# ──────────────────────────────── 기획 문서 ────────────────────────────────
def collect_spec():
    """화면 12개의 라우트·영역·요건·캡처·확인 필요 항목을 모은다."""
    out = {}
    for d in sorted([x for x in SPEC.iterdir() if x.is_dir() and x.name[0].isdigit()],
                    key=lambda p: int(p.name.split(".")[0])):
        sid = "S" + d.name.split(".")[0]
        rec = {"folder": d.name, "routes": [], "areas": [], "reqs": [], "shots": [],
               "checks": [], "hidden": [], "docs": {}}
        for kind in ("01", "02", "03", "04"):
            fs = list(d.glob(f"{kind}_*.md"))
            if not fs:
                continue
            raw = fs[0].read_text(encoding="utf-8")
            rec["docs"][kind] = {"file": fs[0].name, "lines": len(raw.splitlines())}
            if kind == "01":
                m = re.search(r'^> 라우트:\s*(.+)$', raw, re.M)
                if m:
                    rec["routes"] = [r for r in re.findall(r'`([^`]+)`', m.group(1)) if r.startswith("/")]
            if kind == "02":
                m = re.search(r'^> 캡처\(매뉴얼 `images/`\):\s*(.+)$', raw, re.M)
                if m:
                    rec["shots"] = re.findall(r'`([0-9A-Za-z_]+\.png)`', m.group(1))
                # 영역 표: | **A** | 이름 | … 또는 | A | 이름 |
                for mm in re.finditer(r'^\|\s*\*{0,2}([A-Z](?:[.\-]\d+)?|좌측(?:-\d+)?|우측(?:-\d+)?|영역\s*\d+(?:\.\d+)?)\*{0,2}\s*\|\s*([^|]+?)\s*\|', raw, re.M):
                    label, name = mm.group(1), mm.group(2).strip()
                    if name and name not in ("이름", "---") and label not in [a["label"] for a in rec["areas"]]:
                        rec["areas"].append({"label": label, "name": name})
            if kind == "04":
                rec["reqs"] = sorted(set(re.findall(rf'\b({sid}-N?\d+)\b', raw)),
                                     key=lambda s: (("N" in s), int(re.sub(r'\D', "", s.split("-")[1]))))
                rec["checks"] = sorted(set(re.findall(rf'\b(V-{sid}-[\w.]+)', raw)))
                rec["hidden"] = len(re.findall(r'\*\*숨김\*\*|\| 숨김 \|', raw))
        out[sid] = rec
    # 루트 문서의 라우트 표가 정본이므로 함께 분모에 넣는다
    root = (SPEC / "00_전체_업무프로세스.md").read_text(encoding="utf-8")
    out["_root"] = {"folder": "(루트)", "routes": sorted({
        r for r in re.findall(r'\|\s*`([^`]+)`', root) if r.startswith("/")}),
        "areas": [], "reqs": [], "shots": [], "checks": [], "hidden": 0, "docs": {}}
    print(f"기획 문서: 화면 {len(out)-1}개 · 라우트 {sum(len(v['routes']) for k, v in out.items() if k != '_root')}개"
          f"(루트 표 {len(out['_root']['routes'])}개) · "
          f"영역 {sum(len(v['areas']) for v in out.values())}개 · "
          f"요건 {sum(len(v['reqs']) for v in out.values())}개 · "
          f"캡처 {sum(len(v['shots']) for v in out.values())}건")
    save("01_spec.json", out)
    return out


# ──────────────────────────────── 매뉴얼 ────────────────────────────────
def collect_manual():
    """매뉴얼의 절·경로·캡처를 모은다. 한/영 짝도 함께 본다."""
    ko = (MANUAL / "USER_MANUAL.md").read_text(encoding="utf-8")
    en_p = MANUAL / "USER_MANUAL_EN.md"
    en = en_p.read_text(encoding="utf-8") if en_p.exists() else ""
    secs = [{"num": m.group(1), "title": m.group(2).strip()}
            for m in re.finditer(r'^##\s+(\d+(?:-\d+)?)\.\s*(.+)$', ko, re.M)]
    subs = [{"num": m.group(1), "title": m.group(2).strip()}
            for m in re.finditer(r'^###\s+(\d+-\d+)\.\s*(.+)$', ko, re.M)]
    out = {
        "sections": secs, "subsections": subs,
        "routes": sorted({r for r in re.findall(r'`(/[A-Za-z0-9{}/_\-:]*)`', ko) if len(r) > 1}),
        "shots_used": sorted(set(re.findall(r'!\[[^\]]*\]\(images/([0-9A-Za-z_]+\.png)\)', ko))),
        "shots_ko": sorted({p.name for p in (MANUAL / "images").glob("*.png")}),
        "shots_en": sorted({p.name for p in (MANUAL / "images_en").glob("*.png")}),
        "en_sections": len(re.findall(r'^##\s+\d+', en, re.M)),
    }
    print(f"매뉴얼: 절 {len(secs)}개 · 하위절 {len(subs)}개 · 경로 {len(out['routes'])}개 · "
          f"본문 캡처 {len(out['shots_used'])}장 / 보유 한국어 {len(out['shots_ko'])}장 영문 {len(out['shots_en'])}장")
    save("02_manual.json", out)
    return out


# ──────────────────────────────── 실제 화면 ────────────────────────────────
PROBE = r'''
import asyncio, json, os, sys
from playwright.async_api import async_playwright

BASE, USER, PW = sys.argv[1], sys.argv[2], sys.argv[3]
ROUTES = json.loads(sys.argv[4])

async def main():
    res = {"base": BASE, "login": False, "projectId": None, "visits": []}
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto(BASE + "/login", wait_until="domcontentloaded")
        await pg.wait_for_timeout(1200)
        try:
            await pg.fill('[data-testid="login-username-input"]', USER)
            await pg.fill('[data-testid="login-password-input"]', PW)
            await pg.click('[data-testid="login-submit-button"]')
            await pg.wait_for_timeout(2500)
            res["login"] = "/projects" in pg.url or "login" not in pg.url
        except Exception as e:
            res["loginError"] = str(e)[:200]
        # 프로젝트 ID 확보
        try:
            await pg.goto(BASE + "/projects", wait_until="domcontentloaded")
            await pg.wait_for_timeout(2000)
            card = pg.locator('[data-testid^="project-card-"]').first
            if await card.count():
                tid = await card.get_attribute("data-testid")
                res["projectId"] = tid.replace("project-card-", "")
        except Exception as e:
            res["projectError"] = str(e)[:200]

        # 로그아웃 상태에서만 제 모습이 나오는 화면은 새 컨텍스트로 따로 본다
        anon_routes = [r for r in ROUTES if r in ("/login", "/", "/verify-email", "/manual")]
        if anon_routes:
            ac = await b.new_context(viewport={"width": 1440, "height": 900})
            ap = await ac.new_page()
            for route in anon_routes:
                try:
                    r = await ap.goto(BASE + route, wait_until="domcontentloaded")
                    await ap.wait_for_timeout(1500)
                    badge = ap.locator('[data-testid="screen-id-badge"]')
                    sid = (await badge.inner_text()).strip() if await badge.count() else None
                    res["visits"].append({"route": route, "url": BASE + route,
                                          "status": r.status if r else None, "screenId": sid,
                                          "anon": True, "pageErrors": []})
                except Exception as e:
                    res["visits"].append({"route": route, "anon": True, "error": str(e)[:200]})
            await ac.close()

        pid = res["projectId"] or ""
        for route in ROUTES:
            if route in anon_routes:
                continue
            if "{" in route and not pid:
                res["visits"].append({"route": route, "skipped": "프로젝트 ID 없음"}); continue
            url = BASE + route.replace("{projectId}", pid)
            if "{" in url:
                res["visits"].append({"route": route, "skipped": "치환 못한 자리표시자"}); continue
            n0 = len(errs)
            try:
                r = await pg.goto(url, wait_until="domcontentloaded")
                await pg.wait_for_timeout(1800)
                badge = pg.locator('[data-testid="screen-id-badge"]')
                sid = (await badge.inner_text()).strip() if await badge.count() else None
                res["visits"].append({
                    "route": route, "url": url, "status": r.status if r else None,
                    "screenId": sid, "title": (await pg.title())[:80],
                    "bodyChars": len((await pg.inner_text("body"))[:200000]),
                    "pageErrors": errs[n0:],
                })
            except Exception as e:
                res["visits"].append({"route": route, "url": url, "error": str(e)[:200]})
        await b.close()
    print(json.dumps(res, ensure_ascii=False))

asyncio.run(main())
'''


def collect_app(spec):
    """앱을 실제로 돌며 라우트가 열리는지와 화면 ID 배지를 실측한다."""
    routes, seen = [], set()
    for sid, rec in spec.items():
        if sid.startswith("_"): continue
        for r in rec["routes"]:
            if r not in seen:
                seen.add(r); routes.append(r)
    tmp = WS / "_probe.py"
    WS.mkdir(parents=True, exist_ok=True)
    tmp.write_text(PROBE, encoding="utf-8")
    print(f"실제 화면: {APP_BASE} 에서 라우트 {len(routes)}개 방문")
    try:
        p = subprocess.run([sys.executable, str(tmp), APP_BASE, APP_USER, APP_PASS,
                            json.dumps(routes, ensure_ascii=False)],
                           capture_output=True, text=True, timeout=600)
        data = json.loads(p.stdout.strip().split("\n")[-1])
    except Exception as e:
        print(f"  실측 실패: {e}")
        data = {"base": APP_BASE, "error": str(e)[:300], "visits": []}
    finally:
        tmp.unlink(missing_ok=True)
    ok = [v for v in data.get("visits", []) if v.get("status") == 200]
    print(f"  로그인 {data.get('login')} · 프로젝트 {data.get('projectId')} · "
          f"열린 화면 {len(ok)}/{len(data.get('visits', []))}")
    save("03_app.json", data)
    return data


# ──────────────────────────────── 3자 대조 ────────────────────────────────
def norm(route):
    """라우트를 비교 가능한 형태로. 파라미터 이름은 무시하고 자리만 본다."""
    r = re.sub(r':\w+|\{\w+\}', "{}", route).rstrip("/")
    return r or "/"


def build_matrix():
    spec, man, app = load("01_spec.json"), load("02_manual.json"), load("03_app.json")
    code = load("00_code.json")
    if not (spec and man):
        sys.exit("먼저 spec·manual 을 수집한다")
    app = app or {"visits": []}
    visits = {v["route"]: v for v in app.get("visits", [])}
    shots_ko = set(man["shots_ko"]); shots_en = set(man["shots_en"])
    used_spec = {s for v in spec.values() for s in v["shots"]}
    gaps, rows = [], []

    for sid, rec in spec.items():
        if sid.startswith("_"): continue
        row = {"screen": sid, "folder": rec["folder"], "areas": len(rec["areas"]),
               "reqs": len(rec["reqs"]), "checks": len(rec["checks"]),
               "shots": len(rec["shots"]), "routes": len(rec["routes"]), "probe": []}
        if not rec["areas"]:
            gaps.append((sid, "기획", "02 문서에 영역 표가 없다"))
        if not rec["reqs"]:
            gaps.append((sid, "기획", "04 문서에 요건이 없다"))
        if not rec["shots"]:
            gaps.append((sid, "캡처", "가리키는 매뉴얼 캡처가 없다"))
        for s in rec["shots"]:
            if s not in shots_ko:
                gaps.append((sid, "캡처", f"매뉴얼에 없는 캡처를 가리킨다: {s}"))
            elif s not in shots_en:
                gaps.append((sid, "캡처", f"영문 캡처 짝이 없다: {s}"))
        for r in rec["routes"]:
            v = visits.get(r)
            if v is None:
                row["probe"].append({"route": r, "result": "미실측"})
                continue
            if v.get("skipped"):
                row["probe"].append({"route": r, "result": "건너뜀", "why": v["skipped"]}); continue
            if v.get("error") or v.get("status") != 200:
                gaps.append((sid, "화면", f"열리지 않는다: {r} — {v.get('error') or v.get('status')}"))
                row["probe"].append({"route": r, "result": "실패"}); continue
            if v.get("pageErrors"):
                gaps.append((sid, "화면", f"콘솔 오류: {r} — {v['pageErrors'][0][:90]}"))
            shell = r in SHELL_ROUTES.get(sid, set())
            if v.get("screenId") is None:
                gaps.append((sid, "배지", f"화면 ID 배지가 없다: {r}"))
            elif v["screenId"] != sid and not shell:
                gaps.append((sid, "배지", f"배지가 {v['screenId']} 로 뜬다: {r}"))
            row["probe"].append({"route": r, "result": "정상", "screenId": v.get("screenId"),
                                 "shell": r in SHELL_ROUTES.get(sid, set())})
        rows.append(row)

    # 코드 축 — 코드가 가진 것이 기획 문서·매뉴얼에 있는가
    code_gaps = []
    if code:
        spec_norm = {norm(r) for v in spec.values() for r in v["routes"]}
        man_norm = {norm(r) for r in man["routes"] if r.startswith("/")}
        for r in code["routes"]:
            n = norm(r)
            if n not in spec_norm:
                code_gaps.append({"kind": "라우트", "what": r, "missing": "기획 문서"})
            if n not in man_norm:
                code_gaps.append({"kind": "라우트", "what": r, "missing": "매뉴얼"})
        spec_txt = "\n".join(
            f.read_text(encoding="utf-8") for d in SPEC.iterdir() if d.is_dir()
            for f in d.glob("*.md")) + (SPEC / "00_전체_업무프로세스.md").read_text(encoding="utf-8")
        man_txt = (MANUAL / "USER_MANUAL.md").read_text(encoding="utf-8")
        for a in code["areas"]:
            if a["label"] not in spec_txt:
                code_gaps.append({"kind": "영역", "what": a["label"], "missing": "기획 문서"})
            if a["label"] not in man_txt:
                code_gaps.append({"kind": "영역", "what": a["label"], "missing": "매뉴얼"})
        for p in code["adminMenu"]:
            if norm(p) not in spec_norm:
                code_gaps.append({"kind": "관리 메뉴", "what": p, "missing": "기획 문서"})
        want_ids = sorted([k for k in spec if not k.startswith("_")], key=lambda x: int(x[1:]))
        if code["screenIds"] != want_ids:
            code_gaps.append({"kind": "화면 ID", "what": f"코드 {code['screenIds']} ≠ 문서 {want_ids}",
                              "missing": "일치"})

    # 매뉴얼 쪽에서 본 누락
    man_used = set(man["shots_used"])
    only_manual = sorted(man_used - used_spec)
    orphan = sorted(shots_ko - man_used - used_spec)
    spec_routes = {r for v in spec.values() for r in v["routes"]}
    man_routes = {r for r in man["routes"] if r.startswith("/")}
    m = {"rows": rows, "gaps": [{"screen": a, "kind": b, "what": c} for a, b, c in gaps],
         "code": code or {}, "codeGaps": code_gaps,
         "captures": {"spec_used": len(used_spec), "manual_used": len(man_used),
                      "only_manual": only_manual, "orphan": orphan,
                      "ko_only": sorted(shots_ko - shots_en)},
         "routes": {"spec": sorted(spec_routes),
                    "manual_only": sorted(man_routes - spec_routes),
                    "spec_only": sorted(spec_routes - man_routes)}}
    save("04_matrix.json", m)
    write_report(spec, man, app, m)
    return m


def write_report(spec, man, app, m):
    L = ["# 화면 커버리지 감사", "",
         f"> 앱 {app.get('base', '미실측')} · 로그인 {app.get('login')} · "
         f"프로젝트 {app.get('projectId') or '없음'}", "",
         "## 1. 화면별 현황", "",
         "| 화면 | 폴더 | 영역 | 요건 | 확인 필요 | 캡처 | 라우트 | 실측 |",
         "|---|---|---|---|---|---|---|---|"]
    for r in m["rows"]:
        pr = r["probe"]
        okc = sum(1 for p in pr if p["result"] == "정상")
        note = f"{okc}/{len(pr)} 정상" if pr else "미실측"
        L.append(f"| {r['screen']} | `{r['folder']}` | {r['areas']} | {r['reqs']} | "
                 f"{r['checks']} | {r['shots']} | {r['routes']} | {note} |")
    L += ["", "## 2. 갭", ""]
    if not m["gaps"]:
        L.append("갭 없음.")
    else:
        L += ["| 화면 | 종류 | 내용 |", "|---|---|---|"]
        for g in m["gaps"]:
            L.append(f"| {g['screen']} | {g['kind']} | {g['what']} |")
    c = m["captures"]
    L += ["", "## 3. 캡처", "",
          f"- 기획문서가 가리키는 캡처 **{c['spec_used']}장** · 매뉴얼 본문이 쓰는 캡처 **{c['manual_used']}장**",
          f"- 매뉴얼은 쓰지만 기획문서가 안 가리키는 캡처 **{len(c['only_manual'])}장**",
          f"- 어디에도 안 쓰이는 캡처 **{len(c['orphan'])}장**",
          f"- 영문 짝이 없는 캡처 **{len(c['ko_only'])}장**", ""]
    for k, label in (("only_manual", "기획문서가 안 가리킴"), ("orphan", "미사용"), ("ko_only", "영문 짝 없음")):
        if c[k]:
            L.append(f"**{label}**: " + " · ".join(f"`{x}`" for x in c[k][:40]))
            L.append("")
    cg, cd = m.get("codeGaps", []), (m.get("code") or {})
    L += ["## 4. 코드가 가진 것이 문서·캡처에 있는가", ""]
    if cd:
        L += [f"코드 분모 — 라우트 {len(cd.get('routes', []))}개 · 영역 {len(cd.get('areas', []))}개 · "
              f"화면 컴포넌트 {len(cd.get('lazyScreens', []))}개 · 관리 메뉴 {len(cd.get('adminMenu', []))}개", ""]
        if not cg:
            L.append("코드의 라우트·영역·관리 메뉴가 모두 기획 문서와 매뉴얼에 있다.")
        else:
            L += ["| 종류 | 대상 | 빠진 곳 |", "|---|---|---|"]
            for g in cg:
                L.append(f"| {g['kind']} | `{g['what']}` | {g['missing']} |")
    else:
        L.append("코드 수집을 하지 않았다. `audit.py code` 를 먼저 돌린다.")
    L.append("")
    rt = m["routes"]
    L += ["## 5. 라우트", "",
          f"- 기획문서 라우트 **{len(rt['spec'])}개**",
          f"- 매뉴얼만 언급 **{len(rt['manual_only'])}개**: " + (" · ".join(f"`{x}`" for x in rt["manual_only"][:30]) or "없음"),
          f"- 기획문서만 언급 **{len(rt['spec_only'])}개**: " + (" · ".join(f"`{x}`" for x in rt["spec_only"][:30]) or "없음"),
          "", "## 6. 판정이 필요한 것", "",
          "이 스크립트는 사실만 모은다. 아래는 사람이나 에이전트가 판정한다.", "",
          "- 어디에도 안 쓰이는 캡처가 버려도 되는 것인지, 문서에 넣어야 하는 것인지",
          "- 영문 짝이 없는 캡처를 영문 매뉴얼에 채울 것인지",
          "- 매뉴얼만 언급한 라우트가 기획 문서에 빠진 화면인지, 매뉴얼의 예시 표기인지",
          "- 실측에서 건너뛴 라우트를 어떻게 확인할 것인지", ""]
    (WS / "REPORT.md").write_text("\n".join(L), encoding="utf-8")
    print(f"  → {(WS / 'REPORT.md').relative_to(ROOT)}")
    print(f"\n문서·화면 갭 {len(m['gaps'])}건 · 코드 축 갭 {len(m.get('codeGaps', []))}건")
    for g in m["gaps"][:12]:
        print(f"  · [{g['screen']}/{g['kind']}] {g['what']}")
    if len(m["gaps"]) > 12:
        print(f"  … 외 {len(m['gaps'])-12}건")
    for g in m.get("codeGaps", [])[:12]:
        print(f"  · [코드/{g['kind']}] {g['what']} → {g['missing']}에 없다")
    if len(m.get("codeGaps", [])) > 12:
        print(f"  … 외 {len(m['codeGaps'])-12}건")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    if cmd == "code":
        collect_code()
    elif cmd == "spec":
        collect_spec()
    elif cmd == "manual":
        collect_manual()
    elif cmd == "app":
        collect_app(load("01_spec.json") or collect_spec())
    elif cmd == "matrix":
        build_matrix()
    elif cmd == "all":
        collect_code(); s = collect_spec(); collect_manual(); collect_app(s); build_matrix()
    else:
        sys.exit(__doc__)
