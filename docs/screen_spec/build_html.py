#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""화면 기획 문서를 하나의 HTML 뷰어로 묶는다.

    python3 docs/screen_spec/build_html.py

산출물은 `index.html` 한 파일이다. 외부 리소스를 쓰지 않으므로 파일을 그대로 열거나
공유해도 되고, 배치도 SVG는 본문에 심는다.

뷰어에서 하는 일
  - 화면 12개를 왼쪽 목록에서 골라 배치도와 4문서를 탭으로 넘겨 본다
  - 화면의 라우트를 눌러 **실제 화면을 새 탭으로 연다**. 앱 주소와 프로젝트 ID는
    상단에서 한 번 넣어 두면 브라우저에 남는다
  - 전문 검색으로 문서를 가로질러 찾는다

필요한 것: `markdown` 패키지(표·코드블록 확장을 쓴다)
"""
import html
import json
import pathlib
import re
import sys

try:
    import markdown
except ImportError:
    sys.exit("markdown 패키지가 필요하다: pip install markdown")

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "index.html"

# 폴더 → (화면 ID, 이름). validate.py · constants/screenIds.js 와 같아야 한다.
SCREENS = [
    ("0.로그인계정", "S0", "로그인·계정"),
    ("1.프로젝트", "S1", "프로젝트"),
    ("2.공통레이아웃", "S2", "공통 레이아웃"),
    ("3.대시보드", "S3", "대시보드"),
    ("4.테스트케이스", "S4", "테스트케이스"),
    ("5.테스트플랜", "S5", "테스트 플랜"),
    ("6.테스트실행", "S6", "테스트 실행"),
    ("7.테스트결과", "S7", "테스트 결과"),
    ("8.자동화테스트", "S8", "자동화 테스트"),
    ("9.RAG문서", "S9", "RAG 문서"),
    ("10.탐색세션", "S10", "탐색 세션"),
    ("11.관리자설정", "S11", "관리자 설정"),
]
KINDS = [("01", "업무프로세스"), ("02", "화면정의"), ("03", "컴포넌트"), ("04", "요건반영목록")]

MD = markdown.Markdown(extensions=["tables", "fenced_code", "sane_lists", "attr_list"])


def strip_front(text):
    """H1 제목과 머리말 인용 블록을 걷어낸다.

    뷰어가 화면 ID·이름·라우트를 이미 위에 보여주므로 본문에 두면 두 번 읽게 된다.
    """
    lines = text.split("\n")
    out, i = [], 0
    while i < len(lines) and not lines[i].startswith("# "):
        i += 1
    i += 1                                    # H1 버린다
    while i < len(lines) and (not lines[i].strip() or lines[i].startswith(">")):
        i += 1                                # 머리말 인용 블록 버린다
    if i < len(lines) and lines[i].startswith("---"):
        i += 1                                # 머리말 뒤 구분선도 함께
    return "\n".join(lines[i:]).lstrip("\n")


def render(text, folder=None):
    """마크다운을 HTML로. 배치도 SVG는 본문에 심고, 문서 사이 링크는 뷰어 경로로 바꾼다."""
    text = strip_front(text)
    def inline_svg(m):
        alt, rel = m.group(1), m.group(2)
        p = (ROOT / folder / rel) if folder else (ROOT / rel)
        if not p.exists():
            return f'<p class="miss">배치도 없음: {html.escape(rel)}</p>'
        svg = p.read_text(encoding="utf-8")
        svg = re.sub(r'<\?xml[^>]*\?>', "", svg).strip()
        return f'<figure class="dia">{svg}<figcaption>{html.escape(alt)}</figcaption></figure>'

    text = re.sub(r'!\[([^\]]*)\]\((images/[^)]+\.svg)\)', inline_svg, text)

    # 같은 폴더의 다른 문서로 가는 링크 → 뷰어 안 이동
    def doc_link(m):
        label, target = m.group(1), m.group(2)
        mm = re.match(r'(0[1-4])_', target)
        if mm and folder:
            sid = next(s for f, s, _ in SCREENS if f == folder)
            return f'<a href="#/{sid}/{mm.group(1)}">{label}</a>'
        if target == "README.md" or target == "../README.md":
            return f'<a href="#/README">{label}</a>'
        if target.endswith("00_전체_업무프로세스.md"):
            return f'<a href="#/FLOW">{label}</a>'
        return f'<code>{html.escape(label)}</code>'

    text = re.sub(r'\[([^\]]+)\]\(((?:\.\./)?[^)]+\.md)\)', doc_link, text)
    MD.reset()
    return MD.convert(text)


def read_docs():
    """화면별 4문서와 루트 문서를 읽어 렌더한 결과와 검색용 본문을 함께 담는다."""
    data, index = {}, []
    for folder, sid, name in SCREENS:
        d = ROOT / folder
        route = ""
        docs = {}
        for kind, dn in KINDS:
            fs = list(d.glob(f"{kind}_*.md"))
            if not fs:
                continue
            raw = fs[0].read_text(encoding="utf-8")
            if kind == "01":
                m = re.search(r'^> 라우트:\s*(.+)$', raw, re.M)
                route = m.group(1).strip() if m else ""
            docs[kind] = render(raw, folder)
            index.append({"screen": sid, "kind": kind, "label": f"{sid} {name} · {dn}",
                          "text": re.sub(r'\s+', " ", re.sub(r'[`*|>#\-]', " ", raw))[:60000]})
        svgs = sorted((d / "images").glob("*.svg")) if (d / "images").exists() else []
        data[sid] = {"name": name, "folder": folder, "route": route, "docs": docs,
                     "diagrams": [s.name for s in svgs]}
    for key, fname, label in (("README", "README.md", "문서 안내"),
                              ("FLOW", "00_전체_업무프로세스.md", "전체 업무프로세스")):
        raw = (ROOT / fname).read_text(encoding="utf-8")
        data[key] = {"name": label, "folder": None, "route": "", "docs": {"doc": render(raw)},
                     "diagrams": []}
        index.append({"screen": key, "kind": "doc", "label": label,
                      "text": re.sub(r'\s+', " ", re.sub(r'[`*|>#\-]', " ", raw))[:60000]})
    return data, index


def routes_of(route_line):
    """머리말 라우트 줄에서 주소만 뽑는다"""
    return [r for r in re.findall(r'`([^`]+)`', route_line) if r.startswith("/")]


CSS = """
:root{--bg:#fff;--fg:#111827;--dim:#475467;--faint:#6b7280;--line:#e5e7eb;
--accent:#315efb;--soft:#f7f9ff;--chrome:#f9fafb;--code:#f3f4f6}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e5e7eb;--dim:#a3adbb;--faint:#8b95a3;
--line:#252a33;--accent:#6b8afd;--soft:#161a22;--chrome:#141821;--code:#1a1f28}}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,'Malgun Gothic',sans-serif;background:var(--bg);color:var(--fg);font-size:14px;line-height:1.65}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
header{position:sticky;top:0;z-index:20;background:var(--chrome);border-bottom:1px solid var(--line);
padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header .t{font-weight:700}header .v{color:var(--faint);font-size:12px}
header input{background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:5px 8px;font-size:12px}
#q{width:200px}#base{width:190px}#pid{width:170px}
.layout{display:flex;align-items:flex-start}
nav{width:210px;min-width:210px;border-right:1px solid var(--line);padding:10px 0;position:sticky;top:53px;
height:calc(100vh - 53px);overflow:auto}
nav h3{font-size:11px;color:var(--faint);margin:12px 12px 6px;font-weight:600;letter-spacing:.04em}
nav a{display:flex;gap:8px;align-items:baseline;padding:5px 12px;color:var(--fg);border-left:3px solid transparent}
nav a:hover{background:var(--soft);text-decoration:none}
nav a.on{background:var(--soft);border-left-color:var(--accent);font-weight:600}
nav a .id{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--faint);min-width:28px}
main{flex:1;min-width:0;padding:18px 24px 60px;max-width:1100px}
.sh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:4px}
.sh .sid{font-family:ui-monospace,Consolas,monospace;font-size:12px;background:var(--code);
border:1px solid var(--line);border-radius:5px;padding:2px 7px;color:var(--dim)}
.sh h1{font-size:20px;margin:0}
.rts{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 14px}
.rts a,.rts span{font-family:ui-monospace,Consolas,monospace;font-size:11.5px;border:1px solid var(--line);
border-radius:5px;padding:3px 8px;background:var(--bg);color:var(--dim)}
.rts a:hover{border-color:var(--accent);color:var(--accent);text-decoration:none}
.rts a::after{content:" ↗";opacity:.6}
.tabs{display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:16px;flex-wrap:wrap}
.tabs button{background:none;border:0;border-bottom:2px solid transparent;padding:7px 12px;
font:inherit;font-size:13px;color:var(--dim);cursor:pointer}
.tabs button:hover{color:var(--fg)}.tabs button.on{color:var(--accent);border-bottom-color:var(--accent);font-weight:600}
.md h1{font-size:19px;margin:22px 0 10px}.md h2{font-size:16px;margin:24px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--line)}
.md h3{font-size:14px;margin:18px 0 6px}.md h4{font-size:13px;margin:14px 0 4px;color:var(--dim)}
.md table{border-collapse:collapse;width:100%;margin:10px 0;font-size:12.5px;display:block;overflow-x:auto}
.md th,.md td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}
.md th{background:var(--chrome);font-weight:600;white-space:nowrap}
.md code{background:var(--code);border-radius:4px;padding:1px 5px;font-family:ui-monospace,Consolas,monospace;font-size:.9em}
.md pre{background:var(--code);border:1px solid var(--line);border-radius:7px;padding:11px 13px;overflow-x:auto}
.md pre code{background:none;padding:0;font-size:11.5px;line-height:1.5}
.md blockquote{margin:10px 0;padding:8px 13px;background:var(--soft);border-left:3px solid var(--accent);color:var(--dim)}
.md blockquote p{margin:3px 0}
.md hr{border:0;border-top:1px solid var(--line);margin:22px 0}
.md ul,.md ol{padding-left:22px}.md li{margin:3px 0}
.dia{margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--bg)}
.dia svg{display:block;width:100%;height:auto}
.dia figcaption{margin-top:8px;font-size:11.5px;color:var(--faint);text-align:center}
.miss{color:#b91c1c;font-size:12px}
.hit{padding:8px 10px;border:1px solid var(--line);border-radius:7px;margin:7px 0;cursor:pointer;background:var(--bg)}
.hit:hover{border-color:var(--accent)}
.hit b{font-size:12.5px}.hit p{margin:4px 0 0;font-size:12px;color:var(--dim)}
.hit mark{background:#fde68a;color:#111827;border-radius:2px}
.note{font-size:12px;color:var(--faint);margin:10px 0 0}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:14px 0}
.card{border:1px solid var(--line);border-radius:8px;padding:11px 13px;background:var(--bg)}
.card:hover{border-color:var(--accent)}
.card .id{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--faint)}
.card .nm{display:block;font-weight:600;margin:3px 0 5px;color:var(--fg)}
.card .rt{font-family:ui-monospace,Consolas,monospace;font-size:10.5px;color:var(--dim);word-break:break-all}
"""

JS = r"""
const $=s=>document.querySelector(s), esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store=(k,v)=>{try{v===undefined?0:localStorage.setItem(k,v);return localStorage.getItem(k)||""}catch(e){return""}};
let cur={s:null,k:null};

function appUrl(route){
  const base=($('#base').value||"").replace(/\/+$/,""), pid=$('#pid').value.trim();
  if(!base) return null;
  let r=route.replace(/\{projectId\}/g,pid||"{projectId}");
  if(!pid && /\{projectId\}/.test(r)) return null;
  r=r.replace(/\{[^}]+\}/g,"");
  return base+r;
}

function renderNav(){
  const n=$('#nav'); let h='<h3>개요</h3>';
  h+=`<a href="#/README" data-s="README"><span class="id">·</span><span>문서 안내</span></a>`;
  h+=`<a href="#/FLOW" data-s="FLOW"><span class="id">·</span><span>전체 업무프로세스</span></a>`;
  h+='<h3>화면</h3>';
  ORDER.forEach(id=>{h+=`<a href="#/${id}" data-s="${id}"><span class="id">${id}</span><span>${esc(DATA[id].name)}</span></a>`});
  n.innerHTML=h;
}

function show(sid,kind){
  const d=DATA[sid]; if(!d){location.hash="#/README";return}
  const kinds=Object.keys(d.docs);
  const hasDia=d.diagrams.length>0;
  if(!kind||(!kinds.includes(kind)&&kind!=="dia")) kind=hasDia?"dia":kinds[0];
  cur={s:sid,k:kind};
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.s===sid));

  let h='<div class="sh">';
  if(sid.startsWith("S")) h+=`<span class="sid">${sid}</span>`;
  h+=`<h1>${esc(d.name)}</h1></div>`;

  if(d.route){
    h+='<div class="rts">';
    (ROUTES[sid]||[]).forEach(r=>{
      const u=appUrl(r);
      h+=u?`<a href="${esc(u)}" target="_blank" rel="noopener" title="실제 화면 열기">${esc(r)}</a>`
          :`<span title="상단에 앱 주소와 프로젝트 ID를 넣으면 눌러서 열 수 있다">${esc(r)}</span>`;
    });
    h+='</div>';
  }

  h+='<div class="tabs">';
  if(hasDia) h+=`<button data-k="dia" class="${kind==="dia"?"on":""}">배치도</button>`;
  KINDS.forEach(([k,label])=>{ if(d.docs[k]) h+=`<button data-k="${k}" class="${kind===k?"on":""}">${label}</button>`});
  if(d.docs.doc) h+=`<button data-k="doc" class="${kind==="doc"?"on":""}">본문</button>`;
  h+='</div>';

  h+='<div class="md">'+(kind==="dia"?DIAGRAMS[sid]:d.docs[kind])+'</div>';
  const m=$('#main'); m.innerHTML=h; m.scrollTop=0; window.scrollTo(0,0);
  m.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{location.hash=`#/${sid}/${b.dataset.k}`});
  if(sid==="README") addMap(m);
}

function addMap(m){
  let h='<h2>화면 지도</h2><div class="cards">';
  ORDER.forEach(id=>{
    const r=(ROUTES[id]||[])[0]||"", u=appUrl(r);
    h+=`<div class="card"><span class="id">${id}</span>
        <a class="nm" href="#/${id}">${esc(DATA[id].name)}</a>
        ${r?(u?`<a class="rt" href="${esc(u)}" target="_blank" rel="noopener">${esc(r)} ↗</a>`:`<span class="rt">${esc(r)}</span>`):""}
        </div>`;
  });
  h+='</div><p class="note">카드의 이름을 누르면 그 화면의 기획 문서로, 주소를 누르면 실제 화면으로 간다.</p>';
  m.insertAdjacentHTML('beforeend',h);
}

function search(q){
  q=q.trim(); if(q.length<2){route();return}
  const low=q.toLowerCase(), hits=[];
  INDEX.forEach(it=>{
    const i=it.text.toLowerCase().indexOf(low);
    if(i<0) return;
    hits.push({...it,snip:it.text.slice(Math.max(0,i-70),i+130)});
  });
  let h=`<div class="sh"><h1>검색 — ${esc(q)}</h1></div><p class="note">${hits.length}건</p>`;
  hits.slice(0,60).forEach(it=>{
    const s=esc(it.snip).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>`<mark>${m}</mark>`);
    h+=`<div class="hit" data-go="#/${it.screen}/${it.kind}"><b>${esc(it.label)}</b><p>…${s}…</p></div>`;
  });
  $('#main').innerHTML=h;
  document.querySelectorAll('.hit').forEach(e=>e.onclick=()=>{location.hash=e.dataset.go;$('#q').value=""});
}

function route(){
  const p=(location.hash||"#/README").slice(2).split("/");
  show(p[0]||"README",p[1]);
}

window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',()=>{
  renderNav();
  $('#base').value=store('ss.base')||"http://localhost:8080";
  $('#pid').value=store('ss.pid')||"";
  ['base','pid'].forEach(k=>$('#'+k).oninput=()=>{store('ss.'+k,$('#'+k).value);route()});
  $('#q').oninput=e=>search(e.target.value);
  route();
});
"""


def main():
    data, index = read_docs()
    order = [sid for _, sid, _ in SCREENS]
    routes = {sid: routes_of(data[sid]["route"]) for sid in order}
    diagrams = {}
    for folder, sid, _ in SCREENS:
        parts = []
        for name in data[sid]["diagrams"]:
            svg = (ROOT / folder / "images" / name).read_text(encoding="utf-8")
            svg = re.sub(r'<\?xml[^>]*\?>', "", svg).strip()
            parts.append(f'<figure class="dia">{svg}<figcaption>{html.escape(name)}</figcaption></figure>')
        diagrams[sid] = "".join(parts) or '<p class="note">배치도가 없다.</p>'

    payload = {
        "DATA": {k: {"name": v["name"], "route": v["route"], "docs": v["docs"],
                     "diagrams": v["diagrams"]} for k, v in data.items()},
        "ORDER": order, "ROUTES": routes, "KINDS": KINDS, "INDEX": index, "DIAGRAMS": diagrams,
    }
    # 본문에 </script> 나 <!-- 가 섞여도 스크립트가 끊기지 않게 '<' 를 이스케이프한다
    def js_const(k, v):
        return f"const {k}={json.dumps(v, ensure_ascii=False).replace('<', chr(92) + 'u003c')};"

    js_data = "\n".join(js_const(k, v) for k, v in payload.items())

    OUT.write_text(f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TestcaseCraft 화면 기획</title>
<style>{CSS}</style></head><body>
<header>
  <span class="t">TestcaseCraft 화면 기획</span>
  <span class="v">v1.0.102 · 화면 12개</span>
  <input id="q" type="search" placeholder="문서 전문 검색" aria-label="문서 검색">
  <input id="base" placeholder="앱 주소 (예: http://localhost:8080)" aria-label="앱 주소">
  <input id="pid" placeholder="프로젝트 ID" aria-label="프로젝트 ID">
</header>
<div class="layout"><nav id="nav"></nav><main id="main"></main></div>
<script>{js_data}</script>
<script>{JS}</script>
</body></html>
""", encoding="utf-8")
    size = OUT.stat().st_size
    print(f"생성 {OUT.relative_to(ROOT.parent.parent)}  ({size/1024:.0f} KB)")
    print(f"  화면 {len(order)}개 · 문서 {len(index)}개 · 배치도 {sum(len(d['diagrams']) for d in data.values())}장")


if __name__ == "__main__":
    main()
