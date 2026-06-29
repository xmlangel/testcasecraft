#!/usr/bin/env python3
"""PG17 실패 케이스 HTML → 표준 테스트케이스 문서(MD + HTML) 변환기.

입력 HTML 의 각 <section class="case"> 를 파싱하여
TC ID / PG ID / 제목 / 설명 / 출처 / 테스트 단계(코드) / 예상 vs 실제 diff 를 추출하고
표준 TC 문서 형태(요약 표 + 케이스별 상세 섹션)로 출력한다.
"""
import json
import re
import sys
from html import escape
from pathlib import Path

from bs4 import BeautifulSoup

SRC = Path(sys.argv[1])
OUT_DIR = Path(sys.argv[2])
OUT_DIR.mkdir(parents=True, exist_ok=True)

soup = BeautifulSoup(SRC.read_text(encoding="utf-8"), "html.parser")

# 헤더 메타
header = soup.find("header")
deck_title = soup.title.get_text(strip=True) if soup.title else "PG17 실패 케이스"
header_lines = [p.get_text(" ", strip=True) for p in header.find_all("p")] if header else []
exec_link = ""
if header:
    a = header.find("a")
    if a and a.get("href"):
        exec_link = a["href"]


def clean_code(pre_text: str) -> str:
    """테스트 단계 pre 블록에서 선행 '[1] ```lang' 과 끝 '```' 를 제거하고 언어를 추출."""
    txt = pre_text
    lang = ""
    m = re.match(r"\s*\[\d+\]\s*```(\w+)?\s*\n", txt)
    if m:
        lang = m.group(1) or ""
        txt = txt[m.end():]
    txt = re.sub(r"\n?```\s*$", "", txt)
    return lang, txt.rstrip("\n")


def parse_field(section, label):
    for f in section.find_all("div", class_="field"):
        lbl = f.find("span", class_="lbl")
        if lbl and lbl.get_text(strip=True) == label:
            return f
    return None


def parse_diff(table):
    """side-by-side diff 테이블 → 행 리스트. 각 행: (kind, lno_exp, exp, lno_act, act)
    kind: hunk | ctx | chg
    """
    rows = []
    for tr in table.find("tbody").find_all("tr"):
        if "hunk" in (tr.get("class") or []):
            rows.append(("hunk", "", tr.get_text(strip=True), "", ""))
            continue
        tds = tr.find_all("td")
        if len(tds) != 4:
            continue
        lno_e = tds[0].get_text(strip=True)
        exp = tds[1].get_text()
        lno_a = tds[2].get_text(strip=True)
        act = tds[3].get_text()
        cls = tr.get("class") or []
        kind = "chg" if "chg" in cls else "ctx"
        rows.append((kind, lno_e, exp, lno_a, act))
    return rows


cases = []
for section in soup.find_all("section", class_="case"):
    h2 = section.find("h2")
    did_span = h2.find("span", class_="did")
    pg_id = did_span.get_text(strip=True) if did_span else ""
    if did_span:
        did_span.extract()
    head_txt = h2.get_text(" ", strip=True)
    m = re.match(r"(tc\d+)\s+(.*)", head_txt)
    tc_id = m.group(1) if m else head_txt
    title = m.group(2) if m else head_txt

    desc_field = parse_field(section, "테스트 설명")
    desc_full = desc_field.find("div", class_="val").get_text("\n", strip=True) if desc_field else ""
    src_url = ""
    desc = desc_full
    sm = re.search(r"출처:\s*(\S+.*)", desc_full)
    if sm:
        src_url = sm.group(1).strip()
        desc = desc_full[:sm.start()].strip()

    steps_field = parse_field(section, "테스트 단계")
    steps_pre = steps_field.find("pre", class_="val").get_text() if steps_field else ""
    lang, steps_code = clean_code(steps_pre)

    diff_field = parse_field(section, "예상결과 vs 실제결과 (줄 정렬)")
    diff_rows = parse_diff(diff_field.find("table", class_="sbs")) if diff_field else []

    cases.append({
        "tc_id": tc_id,
        "pg_id": pg_id,
        "title": title,
        "description": desc,
        "source": src_url,
        "lang": lang,
        "steps": steps_code,
        "diff": diff_rows,
        "result": "FAIL",
    })

# ---------- JSON (중간 산출물) ----------
(OUT_DIR / "pg17_fail_cases.json").write_text(
    json.dumps({"title": deck_title, "meta": header_lines, "exec_link": exec_link, "cases": cases},
               ensure_ascii=False, indent=2), encoding="utf-8")


# ---------- Markdown ----------
def diff_to_md(diff):
    """diff 행을 unified-diff 스타일 코드블록으로."""
    out = []
    for kind, le, exp, la, act in diff:
        if kind == "hunk":
            out.append(exp)
        elif kind == "ctx":
            out.append("  " + exp.rstrip())
        else:  # chg
            e = exp.rstrip("\n")
            a = act.rstrip("\n")
            if e.strip():
                out.append("- " + e)
            if a.strip():
                out.append("+ " + a)
            if not e.strip() and not a.strip():
                out.append("  ")
    return "\n".join(out)


md = []
md.append(f"# {deck_title}")
md.append("")
for line in header_lines:
    if "TestcaseCraft" in line and exec_link:
        continue
    md.append(f"> {line}")
if exec_link:
    md.append(f">")
    md.append(f"> 🔗 [TestcaseCraft 실행 보기]({exec_link})")
md.append("")
md.append("## 요약")
md.append("")
md.append("| TC ID | PG ID | 제목 | 판정 |")
md.append("|-------|-------|------|------|")
for c in cases:
    md.append(f"| `{c['tc_id']}` | {c['pg_id']} | {c['title']} | ❌ {c['result']} |")
md.append("")
md.append(f"**총 {len(cases)}건 · 전부 FAIL**")
md.append("")
md.append("---")
md.append("")

for c in cases:
    md.append(f"## {c['tc_id']} · {c['title']}  `{c['pg_id']}`")
    md.append("")
    md.append(f"- **TC ID**: `{c['tc_id']}`")
    md.append(f"- **PG ID**: {c['pg_id']}")
    md.append(f"- **판정**: ❌ {c['result']}")
    if c["source"]:
        md.append(f"- **출처**: {c['source']}")
    md.append("")
    md.append("### 설명")
    md.append("")
    md.append(c["description"])
    md.append("")
    md.append("### 테스트 단계")
    md.append("")
    md.append(f"```{c['lang']}")
    md.append(c["steps"])
    md.append("```")
    md.append("")
    md.append("### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)")
    md.append("")
    md.append("```diff")
    md.append(diff_to_md(c["diff"]))
    md.append("```")
    md.append("")
    md.append("---")
    md.append("")

(OUT_DIR / "PG17_FAIL_CASES.md").write_text("\n".join(md), encoding="utf-8")


# ---------- HTML ----------
def diff_to_html(diff):
    rows = []
    for kind, le, exp, la, act in diff:
        if kind == "hunk":
            rows.append(f'<tr class="hunk"><td colspan="4">{escape(exp)}</td></tr>')
        elif kind == "ctx":
            rows.append(f'<tr><td class="ln">{escape(le)}</td><td class="ctx">{escape(exp)}</td>'
                        f'<td class="ln">{escape(la)}</td><td class="ctx">{escape(act)}</td></tr>')
        else:
            rows.append(f'<tr class="chg"><td class="ln">{escape(le)}</td><td class="exp">{escape(exp)}</td>'
                        f'<td class="ln">{escape(la)}</td><td class="act">{escape(act)}</td></tr>')
    return "\n".join(rows)


# ---------- 통계 (앱 computeStatisticsSummary 와 동일 규칙) ----------
total = len(cases)
n_pass = sum(1 for c in cases if c["result"] == "PASS")
n_fail = sum(1 for c in cases if c["result"] == "FAIL")
n_blocked = sum(1 for c in cases if c["result"] == "BLOCKED")
n_notrun = total - n_pass - n_fail - n_blocked
executed = total - n_notrun
jira_linked = sum(1 for c in cases if c["pg_id"])


def rate(value, base):
    return f"{(value / base * 100):.1f}" if base > 0 else "0.0"


stats = {
    "total": total, "pass": n_pass, "fail": n_fail, "blocked": n_blocked,
    "notRun": n_notrun, "executed": executed, "jiraLinked": jira_linked,
    "executionRate": rate(executed, total), "successRate": rate(n_pass, executed),
    "passRate": rate(n_pass, total), "failRate": rate(n_fail, total),
    "blockedRate": rate(n_blocked, total), "notRunRate": rate(n_notrun, total),
}

# 앱 PDF export 색상 토큰 (MUI 표준) — 출력 테마와 독립적인 액센트 색
total_sub = (header_lines[0].split("·")[0].strip() if header_lines else "") or "전체 케이스"
KPI = [
    ("총 테스트", f"{stats['total']}건", total_sub, "info", "📊"),
    ("실행률", f"{stats['executionRate']}%", f"{stats['executed']}건 실행됨", "success", "⚡"),
    ("성공률", f"{stats['successRate']}%", f"{stats['pass']}건 통과됨", "warning", "🎯"),
    ("JIRA 연동", f"{stats['jiraLinked']}건", "결함 및 티켓 링크", "error", "🔗"),
]
BREAKDOWN = [
    ("성공", stats["pass"], stats["passRate"], "success"),
    ("실패", stats["fail"], stats["failRate"], "error"),
    ("차단", stats["blocked"], stats["blockedRate"], "warning"),
    ("미실행", stats["notRun"], stats["notRunRate"], "grey"),
]

# ---------- HTML (앱 "테스트 결과 리포트" 출력 레이아웃 + light/dark 테마) ----------
STYLE = """<style>
:root{
  --primary:#1976D2;--primary-light:#E8F5FF;
  --success:#2E7D32;--success-light:#E8F7EE;
  --error:#D32F2F;--error-light:#FFEBEC;
  --warning:#ED6C02;--warning-light:#FFF3E0;
  --info:#0288D1;--info-light:#EBF8FF;
  --grey:#9E9E9E;--grey-dark:#424242;--grey-light:#F5F7FA;
  --bg:#f5f7fa;--surface:#ffffff;--surface-2:#f6f8fa;--border:#e0e4e8;
  --text:#212121;--text-sub:#57606a;--code-bg:#0d1117;--code-fg:#e6edf3;
  --exp-bg:#ffebe9;--act-bg:#e6ffec;--hunk-bg:#ddf4ff;--hunk-fg:#0550ae;
}
[data-theme="dark"]{
  --primary-light:rgba(25,118,210,.18);--success-light:rgba(46,125,50,.18);
  --error-light:rgba(211,47,47,.18);--warning-light:rgba(237,108,2,.18);
  --info-light:rgba(2,136,209,.18);--grey-light:rgba(158,158,158,.14);
  --bg:#121212;--surface:#1e1e1e;--surface-2:#262626;--border:#383838;
  --text:#e6e6e6;--text-sub:#a0a6ad;--code-bg:#0b0e13;--code-fg:#e6edf3;
  --exp-bg:rgba(211,47,47,.22);--act-bg:rgba(46,125,50,.22);
  --hunk-bg:rgba(2,136,209,.22);--hunk-fg:#79c0ff;
}
*{box-sizing:border-box}
body{font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo",sans-serif;margin:0;color:var(--text);background:var(--bg)}
header.report{background:var(--primary);color:#fff;padding:24px 28px;position:relative}
header.report h1{margin:0 0 4px;font-size:22px}
header.report .sub{font-size:12px;opacity:.92;margin:2px 0}
header.report a{color:#fff}
.theme-toggle{position:absolute;top:18px;right:24px;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:6px 14px;font-size:12px;cursor:pointer}
.theme-toggle:hover{background:rgba(255,255,255,.3)}
.wrap{max-width:1200px;margin:0 auto;padding:22px}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 0 16px}
.kpi{background:var(--surface);border-radius:8px;padding:14px 16px 12px 18px;position:relative;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}
.kpi .lbl{font-size:12px;color:var(--text-sub)}
.kpi .ico{position:absolute;top:12px;right:14px;font-size:18px}
.kpi .val{font-size:24px;font-weight:700;margin:6px 0 2px;color:var(--text)}
.kpi .sub{font-size:11px;color:var(--grey)}
.bd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 0 26px}
.bd{border-radius:8px;padding:12px 16px;background:var(--bd-bg);border-left:4px solid var(--accent)}
.bd .lbl{font-size:12px;color:var(--text-sub)}
.bd .val{font-size:20px;font-weight:700;color:var(--accent)}
.bd .rate{font-size:11px;color:var(--grey)}
h2.sec{font-size:16px;border-bottom:2px solid var(--border);padding-bottom:6px;margin:30px 0 12px}
table.summary{border-collapse:collapse;width:100%;background:var(--surface);box-shadow:0 1px 3px rgba(0,0,0,.08);border-radius:6px;overflow:hidden}
table.summary th{background:var(--grey-dark);color:#fff;padding:9px 10px;text-align:left;font-size:12px}
table.summary td{border-bottom:1px solid var(--border);padding:8px 10px;font-size:13px}
table.summary tr:last-child td{border-bottom:none}
table.summary td.id{font-family:ui-monospace,Menlo,monospace;white-space:nowrap}
table.summary td.id a{color:var(--primary);text-decoration:none}
.pg{color:var(--info);font-size:12px}
.badge{display:inline-block;border-radius:12px;padding:2px 10px;font-size:11px;font-weight:700}
.badge.fail{background:var(--error-light);color:var(--error)}
.badge.pass{background:var(--success-light);color:var(--success)}
section.case{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px 18px;margin:0 0 18px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
section.case h3.title{margin:0 0 12px;font-size:15px;font-family:ui-monospace,Menlo,monospace;display:flex;align-items:center;gap:10px}
section.case h3.title .num{color:var(--grey)}
.meta{background:var(--surface-2);border-radius:6px;padding:10px 14px;margin:0 0 12px;font-size:12.5px}
.meta b{color:var(--text-sub)}.meta a{color:var(--info)}
h4.fld{font-size:11px;color:var(--text-sub);margin:14px 0 6px;text-transform:uppercase;letter-spacing:.05em}
.desc{white-space:pre-wrap;font-size:13px}
pre.code{background:var(--code-bg);color:var(--code-fg);padding:12px;border-radius:6px;overflow:auto;font-size:12px;white-space:pre-wrap;word-break:break-word}
table.sbs{border-collapse:collapse;width:100%;font-family:ui-monospace,Menlo,monospace;font-size:11px;table-layout:fixed}
table.sbs th{background:var(--surface-2);color:var(--text);padding:5px 8px;text-align:left;border:1px solid var(--border)}
table.sbs td{border:1px solid var(--border);padding:2px 6px;vertical-align:top;white-space:pre-wrap;word-break:break-word}
td.ln{width:40px;text-align:right;color:var(--grey);background:var(--surface-2);user-select:none}
td.exp{background:var(--exp-bg)}td.act{background:var(--act-bg)}
tr.hunk td{background:var(--hunk-bg);color:var(--hunk-fg);font-weight:600}
td.ctx{color:var(--text-sub)}
footer.report{border-top:1px solid var(--border);margin-top:30px;padding:18px 28px;text-align:center;color:var(--grey);font-size:11px}
@media (max-width:760px){.kpi-grid,.bd-grid{grid-template-columns:repeat(2,1fr)}}
</style>"""

THEME_JS = """<script>
(function(){
  // 사용자가 앱에서 선택한 테마(themeMode: light|dark)를 유지. 없으면 light.
  var mode = localStorage.getItem('themeMode') || 'light';
  document.documentElement.setAttribute('data-theme', mode);
  window.__toggleTheme=function(){
    var cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',cur);
    localStorage.setItem('themeMode',cur);
    var b=document.getElementById('themeBtn'); if(b) b.textContent = cur==='dark'?'☀️ 라이트':'🌙 다크';
  };
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeBtn');
    if(b) b.textContent = (localStorage.getItem('themeMode')||'light')==='dark'?'☀️ 라이트':'🌙 다크';
  });
})();
</script>"""

h = []
h.append("<!doctype html><html lang='ko'><head><meta charset='utf-8'>")
h.append("<meta name='viewport' content='width=device-width,initial-scale=1'>")
h.append(f"<title>테스트 결과 리포트 — {escape(deck_title)}</title>")
h.append(THEME_JS)
h.append(STYLE)
h.append("</head><body>")

# 헤더 바 (앱 PDF 헤더와 동일 구성)
h.append("<header class='report'>")
h.append("<button id='themeBtn' class='theme-toggle' onclick='__toggleTheme()'>🌙 다크</button>")
h.append("<h1>테스트 결과 리포트</h1>")
h.append(f"<p class='sub'>{escape(deck_title)}</p>")
for line in header_lines:
    if "TestcaseCraft" in line and exec_link:
        continue
    h.append(f"<p class='sub'>{escape(line)}</p>")
if exec_link:
    h.append(f"<p class='sub'>🔗 <a href='{escape(exec_link)}'>TestcaseCraft 실행 보기</a></p>")
h.append("</header><div class='wrap'>")

# KPI 카드
h.append("<div class='kpi-grid'>")
for label, value, sub, accent, icon in KPI:
    h.append(f"<div class='kpi' style='--accent:var(--{accent})'>"
             f"<div class='ico'>{icon}</div><div class='lbl'>{escape(label)}</div>"
             f"<div class='val'>{escape(value)}</div><div class='sub'>{escape(sub)}</div></div>")
h.append("</div>")

# 상태 브레이크다운
h.append("<div class='bd-grid'>")
for label, count, r, accent in BREAKDOWN:
    h.append(f"<div class='bd' style='--accent:var(--{accent});--bd-bg:var(--{accent}-light)'>"
             f"<div class='lbl'>{escape(label)}</div><div class='val'>{count}건</div>"
             f"<div class='rate'>{r}%</div></div>")
h.append("</div>")

# 요약 표
h.append("<h2 class='sec' id='summary'>케이스 요약</h2>")
h.append("<table class='summary'><thead><tr><th>#</th><th>TC ID</th><th>PG ID</th><th>제목</th><th>판정</th></tr></thead><tbody>")
for i, c in enumerate(cases, 1):
    badge = "fail" if c["result"] == "FAIL" else "pass"
    h.append(f"<tr><td>{i}</td><td class='id'><a href='#{c['tc_id']}'>{c['tc_id']}</a></td>"
             f"<td class='pg'>{escape(c['pg_id'])}</td><td>{escape(c['title'])}</td>"
             f"<td><span class='badge {badge}'>{c['result']}</span></td></tr>")
h.append("</tbody></table>")

# 케이스 상세
h.append("<h2 class='sec'>케이스 상세</h2>")
for i, c in enumerate(cases, 1):
    badge = "fail" if c["result"] == "FAIL" else "pass"
    h.append(f"<section class='case' id='{c['tc_id']}'>")
    h.append(f"<h3 class='title'><span class='num'>#{i}</span> {escape(c['tc_id'])} · {escape(c['title'])} "
             f"<span class='badge {badge}'>{c['result']}</span></h3>")
    h.append("<div class='meta'>")
    h.append(f"<div><b>TC ID</b> {escape(c['tc_id'])} &nbsp;|&nbsp; <b>PG ID</b> "
             f"<span class='pg'>{escape(c['pg_id'])}</span> &nbsp;|&nbsp; <b>판정</b> "
             f"<span class='badge {badge}'>{c['result']}</span></div>")
    if c["source"]:
        h.append(f"<div style='margin-top:4px'><b>출처</b> <a href='{escape(c['source'])}'>{escape(c['source'])}</a></div>")
    h.append("</div>")
    h.append("<h4 class='fld'>설명</h4>")
    h.append(f"<div class='desc'>{escape(c['description'])}</div>")
    h.append("<h4 class='fld'>테스트 단계</h4>")
    h.append(f"<pre class='code'>{escape(c['steps'])}</pre>")
    h.append("<h4 class='fld'>예상결과 vs 실제결과 (줄 정렬)</h4>")
    h.append("<table class='sbs'><thead><tr><th>#</th><th>예상결과 (vanilla PG17)</th>"
             "<th>#</th><th>실제결과 (AgensSQL -47)</th></tr></thead><tbody>")
    h.append(diff_to_html(c["diff"]))
    h.append("</tbody></table>")
    h.append("</section>")

h.append("</div>")
h.append("<footer class='report'>Generated by TestCaseCraft - Professional QA Reporting "
         "&nbsp;|&nbsp; Powered by TestCaseCraft</footer>")
h.append("</body></html>")
(OUT_DIR / "PG17_FAIL_CASES.html").write_text("\n".join(h), encoding="utf-8")

print(f"파싱 완료: {len(cases)}건")
print(f"  - {OUT_DIR/'PG17_FAIL_CASES.md'}")
print(f"  - {OUT_DIR/'PG17_FAIL_CASES.html'}")
print(f"  - {OUT_DIR/'pg17_fail_cases.json'}")
