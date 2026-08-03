#!/usr/bin/env python3
"""화면 기획 문서를 GitHub wiki 저장소로 발행한다.

wiki 는 페이지가 모두 한 층에 놓이는 별도 git 저장소다. 폴더 구조가 사라지므로
`4.테스트케이스/02_테스트케이스_화면정의.md` 같은 경로를 `S4-화면정의` 라는 하나의
페이지 이름으로 눌러 담고, 문서끼리 가리키던 상대 경로 링크를 그 이름으로 고쳐 쓴다.

배치도(SVG)는 wiki 저장소의 `images/` 에 함께 넣는다. 페이지가 모두 한 층에 있으니
`images/S4_layout.svg` 는 어느 페이지에서든 같은 자리를 가리킨다.

사용법:
    python3 docs/screen_spec/publish_wiki.py --wiki <wiki 저장소 경로>
    python3 docs/screen_spec/publish_wiki.py --wiki <경로> --push

`--push` 없이 돌리면 파일만 쓰고 멈춘다. 무엇이 바뀌는지 `git diff` 로 본 다음
올리는 편이 안전하다. 여러 번 돌려도 결과는 같다.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

SPEC_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SPEC_ROOT.parent.parent
REPO_URL = "https://github.com/xmlangel/testcasecraft"
BRANCH = "master"

INDEX_PAGE = "화면기획서"
OVERVIEW_PAGE = "화면기획서-전체업무프로세스"

# 영문판. 한국어판과 파일이 따로이므로 페이지 이름도 겹치지 않게 둔다.
EN_DIR = SPEC_ROOT / "en"
EN_INDEX_PAGE = "Screen-Spec"
EN_OVERVIEW_PAGE = "Screen-Spec-Overview"
EN_IMG_PREFIX = "en"  # wiki images/en/ 로 넣어 한국어 배치도와 같은 파일명이 부딪히지 않게 한다

# 문서 종류 → 페이지 이름 꼬리. 번호 접두사는 wiki 에서 의미가 없어 뗀다.
DOC_KINDS = {
    "01": "업무프로세스",
    "02": "화면정의",
    "03": "컴포넌트",
    "04": "요건반영목록",
}

# Home 에 덧붙이는 안내 블록을 다시 찾기 위한 표식. 두 번 붙지 않게 한다.
HOME_MARKER = "<!-- screen-spec-links -->"


def screen_folders() -> list[tuple[str, Path]]:
    """(화면 ID, 폴더) 목록을 폴더 번호 순으로 돌려준다."""
    out = []
    for d in SPEC_ROOT.iterdir():
        if not d.is_dir() or not d.name[0].isdigit():
            continue
        num = d.name.split(".")[0]
        out.append((f"S{num}", d))
    return sorted(out, key=lambda x: int(x[0][1:]))


def screen_names() -> dict[str, str]:
    """ID → 짧은 화면 이름. 폴더 이름에서 번호를 뗀 것이 그대로 짧은 이름이다.

    README 표의 화면 칸은 설명문(`트리 · 폴더 케이스 목록 · …`)이라 길잡이 줄이나
    사이드바에 쓰면 한 줄을 넘긴다. 설명문은 인덱스 표에서만 쓴다.
    """
    return {sid: d.name.split(".", 1)[1] for sid, d in screen_folders()}


def screen_captions() -> dict[str, str]:
    """README 화면 목록 표에서 ID → 화면 설명문을 읽는다 (인덱스·Home 표에 쓴다)."""
    text = (SPEC_ROOT / "README.md").read_text(encoding="utf-8")
    caps = {}
    for m in re.finditer(
        r"^\|\s*\*\*(S\d+)\*\*\s*\|\s*`[^`]+`\s*\|\s*([^|]+?)\s*\|", text, re.M
    ):
        caps[m.group(1)] = m.group(2)
    return caps


def page_name(screen: str, kind_num: str) -> str:
    return f"{screen}-{DOC_KINDS[kind_num]}"


def build_link_map(screen: str) -> dict[str, str]:
    """어떤 화면 폴더 안에서 쓰이는 상대 링크 → wiki 페이지 이름."""
    m: dict[str, str] = {
        "00_전체_업무프로세스.md": OVERVIEW_PAGE,
        "../README.md": INDEX_PAGE,
        "README.md": INDEX_PAGE,
    }
    for f in (SPEC_ROOT / screen_dir_of(screen)).glob("*.md"):
        num = f.name.split("_")[0]
        if num in DOC_KINDS:
            m[f.name] = page_name(screen, num)
    return m


_DIR_CACHE: dict[str, str] = {}


def screen_dir_of(screen: str) -> str:
    if not _DIR_CACHE:
        for sid, d in screen_folders():
            _DIR_CACHE[sid] = d.name
    return _DIR_CACHE[screen]


def page_label(page: str) -> str:
    """페이지 이름 → 사람이 읽는 이름. 링크 글자가 옛 파일명일 때 갈아 끼운다."""
    if page == INDEX_PAGE:
        return "화면 기획서"
    if page == OVERVIEW_PAGE:
        return "전체 업무프로세스"
    screen, _, kind = page.partition("-")
    return f"{screen} {kind}"


def link_repo_paths(body: str, depth: int) -> str:
    """저장소 안 다른 문서를 가리키는 코드 스팬을 GitHub 링크로 바꾼다.

    `연관 문서` 표처럼 `` `../manual/new/USER_MANUAL.md` `` 로만 적힌 자리는 원본
    저장소에서도 클릭되지 않고, wiki 에서는 상대 경로 자체가 통하지 않는다. 경로를
    저장소 기준으로 풀어 절대 주소를 건다.

    depth 는 그 문서가 `docs/screen_spec` 에서 몇 단 아래인가다. 화면 폴더 안의
    문서는 `../../plan/...` 처럼 한 단을 더 올라간다.

    `*` 가 들어간 글로브는 파일 하나를 가리키지 않으므로 폴더로 연결한다.
    """
    base = ["docs", "screen_spec"] + ["x"] * depth

    def resolve(rel: str) -> str | None:
        parts = base[:]
        for seg in rel.split("/"):
            if seg == "..":
                if not parts:
                    return None
                parts.pop()
            elif seg not in ("", "."):
                parts.append(seg)
        if "x" in parts:  # 올라간 단수가 모자라 자리표시자가 남았다
            return None
        return "/".join(parts)

    def sub(m: re.Match) -> str:
        rel = m.group(1)
        target = resolve(rel)
        if target is None:
            return m.group(0)
        if "*" in target:  # 글로브는 파일 하나가 아니므로 폴더로
            target = target.rsplit("/", 1)[0]
            kind = "tree"
        elif rel.endswith("/"):  # 원문이 폴더로 적혀 있다 (`../release_note/`)
            kind = "tree"
        else:
            kind = "blob"
        return f"[`{rel}`]({REPO_URL}/{kind}/{BRANCH}/{target})"

    # `../README.md` 는 wiki 인덱스가 따로 있으므로 여기서 다루지 않는다
    return re.sub(
        r"`((?:\.\./)+(?!README\.md`)[^`]+)`",
        sub,
        body,
    )


def rewrite_links(body: str, link_map: dict[str, str]) -> tuple[str, list[str]]:
    """마크다운 링크의 타깃을 wiki 페이지 이름으로 바꾼다.

    앵커(`#5-권한-모델`)는 페이지 이름 뒤에 그대로 붙인다. 지도에 없는 `.md` 타깃은
    고치지 않고 이름을 돌려줘, 호출한 쪽이 발행을 멈추고 살펴볼 수 있게 한다.

    링크 글자가 파일명(`` `01_테스트케이스_업무프로세스.md` `` 처럼)이면 함께 바꾼다.
    wiki 에는 그 파일이 없으니 파일명을 보여 줘도 독자가 찾아갈 수 없다. 사람이 붙인
    글자는 그대로 둔다.
    """
    unknown: list[str] = []

    def sub(m: re.Match) -> str:
        text, target = m.group(1), m.group(2)
        if target.startswith(("http://", "https://", "#")):
            return m.group(0)
        path, _, anchor = target.partition("#")
        if path.startswith("images/"):
            return m.group(0)  # 배치도는 같은 경로로 함께 복사한다
        if path in link_map:
            new = link_map[path]
            stripped = text.strip("`")
            if stripped.endswith(".md") or stripped == path:
                text = page_label(new)
            return f"[{text}]({new + (f'#{anchor}' if anchor else '')})"
        if path.endswith(".md"):
            unknown.append(path)
        return m.group(0)

    return re.sub(r"\[([^\]]*)\]\(([^)]+)\)", sub, body), unknown


def nav_line(screen: str, name: str, current: str) -> str:
    """페이지 머리에 붙이는 길잡이 줄. 현재 문서는 링크 없이 굵게 둔다."""
    parts = []
    for num, kind in DOC_KINDS.items():
        if kind == current:
            parts.append(f"**{kind}**")
        else:
            parts.append(f"[{kind}]({page_name(screen, num)})")
    return (
        f"[화면 기획서]({INDEX_PAGE}) › **{screen} {name}** › " + " · ".join(parts)
    )


def build_index(caps: dict[str, str]) -> str:
    """README 를 인덱스 페이지로 바꾼다. 화면 목록 표 뒤에 문서 바로가기를 끼운다."""
    body = (SPEC_ROOT / "README.md").read_text(encoding="utf-8")
    body = link_repo_paths(body, depth=0)
    body, unknown = rewrite_links(body, {"00_전체_업무프로세스.md": OVERVIEW_PAGE})
    if unknown:
        print(f"  ⚠ 인덱스에서 못 고친 링크: {sorted(set(unknown))}")

    rows = ["", "### 문서 바로가기", "", "| 화면 | 4문서 |", "|---|---|"]
    for screen, _ in screen_folders():
        links = " · ".join(
            f"[{kind}]({page_name(screen, num)})" for num, kind in DOC_KINDS.items()
        )
        rows.append(f"| **{screen}** {caps.get(screen, '')} | {links} |")
    rows.append("")
    nav = "\n".join(rows)

    # 화면 목록 표 바로 뒤에 끼운다. 링크는 이미 페이지 이름으로 바뀌어 있으므로
    # 원본 파일명이 아니라 바뀐 뒤의 형태로 찾는다.
    marker = f"]({OVERVIEW_PAGE})"
    idx = body.find(marker)
    if idx == -1:
        print("  ⚠ 화면 목록 표를 못 찾아 바로가기를 문서 끝에 붙였다")
        return body.rstrip() + "\n" + nav
    line_end = body.find("\n", idx)
    return body[:line_end] + "\n" + nav + body[line_end:]


def build_sidebar(names: dict[str, str]) -> str:
    lines = [
        "### 화면 기획서",
        "",
        f"- [들어가기]({INDEX_PAGE})",
        f"- [전체 업무프로세스]({OVERVIEW_PAGE})",
        f"- [English edition]({EN_INDEX_PAGE})",
        "",
        "**화면별**",
        "",
    ]
    for screen, _ in screen_folders():
        lines.append(
            f"- [{screen} {names.get(screen, '')}]({page_name(screen, '01')})"
        )
    lines.append("")
    return "\n".join(lines)


def patch_home(wiki: Path, names: dict[str, str], caps: dict[str, str]) -> str:
    """기존 Home 을 살리고 기획서 안내만 덧붙인다. 이미 있으면 그 블록만 갈아 끼운다."""
    home = wiki / "Home.md"
    text = home.read_text(encoding="utf-8") if home.exists() else "# TestcaseCraft\n"
    block = "\n".join(
        [
            HOME_MARKER,
            "",
            "***",
            "",
            "## 화면 기획서",
            "",
            f"실제 화면을 화면 단위로 분해한 기획 문서다. 화면 12개(S0~S11)마다 "
            f"업무프로세스 · 화면정의 · 컴포넌트 · 요건반영목록 네 문서를 둔다.",
            "",
            f"👉 **[화면 기획서 들어가기]({INDEX_PAGE})** · "
            f"[전체 업무프로세스]({OVERVIEW_PAGE}) · "
            f"[English edition]({EN_INDEX_PAGE})",
            "",
            "| 화면 | |",
            "|---|---|",
        ]
    )
    rows = []
    for screen, _ in screen_folders():
        label = f"{screen} {names.get(screen, '')}"
        rows.append(
            f"| [{label}]({page_name(screen, '01')}) | {caps.get(screen, '')} |"
        )
    block = block + "\n" + "\n".join(rows) + "\n"

    if HOME_MARKER in text:
        head = text.split(HOME_MARKER)[0].rstrip() + "\n\n"
        return head + block
    return text.rstrip() + "\n\n" + block


def publish_en(wiki: Path) -> tuple[list[str], list[str]]:
    """영문판을 발행한다. 파일이 이미 한 층에 평평하게 있어 눌러 담을 것이 없다.

    바꿀 것은 셋뿐이다 — `.md` 확장자를 뗀 페이지 이름, 배치도 경로를 `images/en/` 로,
    저장소 경로 코드 스팬을 GitHub 링크로.
    """
    written: list[str] = []
    problems: list[str] = []
    if not EN_DIR.is_dir():
        return written, ["docs/screen_spec/en 이 없다 — 영문판을 건너뛴다"]

    docs = sorted(p for p in EN_DIR.glob("*.md") if not p.name.startswith("_"))
    names = {p.stem for p in docs}

    def to_page(m: re.Match) -> str:
        text, target = m.group(1), m.group(2)
        if target.startswith(("http://", "https://", "#")):
            return m.group(0)
        path, _, anchor = target.partition("#")
        # 배치도 — 어느 경로로 적혀 있든 파일명만 살려 wiki 자리로 보낸다
        img = re.match(r"(?:.*/)?images/(.+\.svg)$", path)
        if img:
            return f"[{text}](images/{EN_IMG_PREFIX}/{img.group(1)})"
        # 영문 문서가 한국어판을 가리키는 자리(`../README.md`) — 한국어 인덱스로 보낸다
        if path in ("../README.md", "README.md"):
            return f"[{text}]({INDEX_PAGE})"
        stem = path[:-3] if path.endswith(".md") else path
        # 인덱스·전체문서는 파일 이름과 발행 페이지 이름이 다르다
        if stem == EN_INDEX_PAGE_SRC:
            return f"[{text}]({EN_INDEX_PAGE})"
        if stem == EN_OVERVIEW_PAGE_SRC:
            return f"[{text}]({EN_OVERVIEW_PAGE + (f'#{anchor}' if anchor else '')})"
        if stem in names:
            return f"[{text}]({stem + (f'#{anchor}' if anchor else '')})"
        if path.endswith(".md"):
            problems.append(f"en/{m.group(0)[:60]} — 가리키는 영문 페이지가 없다")
        return m.group(0)

    for src in docs:
        body = src.read_text(encoding="utf-8")
        body = link_repo_paths(body, depth=1)  # en/ 은 screen_spec 한 단 아래다
        body = re.sub(r"\[([^\]]*)\]\(([^)]+)\)", to_page, body)
        if src.stem == EN_INDEX_PAGE_SRC:
            page, nav = EN_INDEX_PAGE, f"**English** · [한국어]({INDEX_PAGE})"
        elif src.stem == EN_OVERVIEW_PAGE_SRC:
            page = EN_OVERVIEW_PAGE
            nav = f"[Screen Specification]({EN_INDEX_PAGE}) › **Overall Workflow**"
        else:
            m = re.match(r"EN-(S\d+)-(\w+)$", src.stem)
            if not m:
                problems.append(f"en/{src.name} — 페이지 이름 규칙에 안 맞는다")
                continue
            page, nav = src.stem, en_nav_line(m.group(1), m.group(2))
        (wiki / f"{page}.md").write_text(f"{nav}\n\n{body.lstrip()}", encoding="utf-8")
        written.append(f"{page}.md")

    # 배치도 — 영문 세트를 wiki images/en/ 으로
    dst = wiki / "images" / EN_IMG_PREFIX
    dst.mkdir(parents=True, exist_ok=True)
    svgs = sorted((EN_DIR / "images").glob("*.svg"))
    for svg in svgs:
        shutil.copy2(svg, dst / svg.name)
    if not svgs:
        problems.append("en/images 에 배치도가 없다")

    return written, problems


EN_INDEX_PAGE_SRC = "EN-Index"
EN_OVERVIEW_PAGE_SRC = "EN-Overview"
EN_KINDS = ["Workflow", "Screen", "Components", "Requirements"]


def en_nav_line(screen: str, current: str) -> str:
    parts = [
        f"**{k}**" if k == current else f"[{k}](EN-{screen}-{k})" for k in EN_KINDS
    ]
    return (
        f"[Screen Specification]({EN_INDEX_PAGE}) › **{screen}** › " + " · ".join(parts)
    )


def publish(wiki: Path, push: bool) -> int:
    if not (wiki / ".git").is_dir():
        print(f"✗ wiki git 저장소가 아니다: {wiki}")
        return 1

    names = screen_names()
    caps = screen_captions()
    if len(names) != 12:
        print(f"✗ README 화면 목록에서 12개를 못 읽었다 (읽은 수 {len(names)})")
        return 1

    written: list[str] = []
    problems: list[str] = []

    # 1) 화면별 4문서
    for screen, folder in screen_folders():
        for src in sorted(folder.glob("*.md")):
            num = src.name.split("_")[0]
            if num not in DOC_KINDS:
                problems.append(f"{folder.name}/{src.name} — 문서 번호를 모르겠다")
                continue
            body = src.read_text(encoding="utf-8")
            body = link_repo_paths(body, depth=1)
            body, unknown = rewrite_links(body, build_link_map(screen))
            if unknown:
                problems.append(
                    f"{folder.name}/{src.name} — 못 고친 링크 {sorted(set(unknown))}"
                )
            nav = nav_line(screen, names[screen], DOC_KINDS[num])
            out = f"{nav}\n\n{body.lstrip()}"
            name = f"{page_name(screen, num)}.md"
            (wiki / name).write_text(out, encoding="utf-8")
            written.append(name)

    # 2) 전체 업무프로세스
    body = (SPEC_ROOT / "00_전체_업무프로세스.md").read_text(encoding="utf-8")
    body = link_repo_paths(body, depth=0)
    body, unknown = rewrite_links(body, {"README.md": INDEX_PAGE, "../README.md": INDEX_PAGE})
    if unknown:
        problems.append(f"00_전체_업무프로세스.md — 못 고친 링크 {sorted(set(unknown))}")
    (wiki / f"{OVERVIEW_PAGE}.md").write_text(
        f"[화면 기획서]({INDEX_PAGE}) › **전체 업무프로세스**\n\n{body.lstrip()}",
        encoding="utf-8",
    )
    written.append(f"{OVERVIEW_PAGE}.md")

    # 3) 인덱스 · 사이드바 · Home
    (wiki / f"{INDEX_PAGE}.md").write_text(build_index(caps), encoding="utf-8")
    written.append(f"{INDEX_PAGE}.md")
    (wiki / "_Sidebar.md").write_text(build_sidebar(names), encoding="utf-8")
    written.append("_Sidebar.md")
    (wiki / "Home.md").write_text(patch_home(wiki, names, caps), encoding="utf-8")
    written.append("Home.md")

    # 4) 배치도
    img_dst = wiki / "images"
    img_dst.mkdir(exist_ok=True)
    # 영문 배치도는 publish_en 이 images/en/ 으로 따로 넣는다 — 여기서는 제외한다
    svgs = [p for p in sorted(SPEC_ROOT.rglob("images/*.svg"))
            if (EN_DIR / "images") not in p.parents]
    seen: dict[str, Path] = {}
    for svg in svgs:
        if svg.name in seen:
            problems.append(f"배치도 이름이 겹친다: {svg} 와 {seen[svg.name]}")
            continue
        seen[svg.name] = svg
        shutil.copy2(svg, img_dst / svg.name)

    # 5) 영문판
    en_written, en_problems = publish_en(wiki)
    written += en_written
    problems += en_problems

    print(
        f"페이지 {len(written)}개 (한국어 {len(written) - len(en_written)} · "
        f"영문 {len(en_written)}) · 배치도 {len(seen)}장 → {wiki}"
    )
    if problems:
        print("\n확인할 것:")
        for p in problems:
            print(f"  ⚠ {p}")

    if not push:
        print("\n--push 없이 돌렸다. 올리려면 같은 명령에 --push 를 붙인다.")
        return 0

    subprocess.run(["git", "-C", str(wiki), "add", "-A"], check=True)
    st = subprocess.run(
        ["git", "-C", str(wiki), "status", "--porcelain"],
        capture_output=True,
        text=True,
        check=True,
    )
    if not st.stdout.strip():
        print("\n바뀐 것이 없다.")
        return 0
    subprocess.run(
        ["git", "-C", str(wiki), "commit", "-q", "-m", "docs: 화면 기획서 발행"],
        check=True,
    )
    subprocess.run(["git", "-C", str(wiki), "push", "-q", "origin", BRANCH], check=True)
    print(f"\n올렸다 → {REPO_URL}/wiki/{INDEX_PAGE}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="화면 기획 문서를 GitHub wiki 로 발행")
    ap.add_argument("--wiki", required=True, help="wiki 저장소를 clone 해 둔 경로")
    ap.add_argument("--push", action="store_true", help="커밋하고 올린다")
    args = ap.parse_args()
    return publish(Path(args.wiki).resolve(), args.push)


if __name__ == "__main__":
    sys.exit(main())
