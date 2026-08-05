import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  inlineToHtml,
  markdownToHtml,
  markdownToPlainText,
  parseMarkdownBlocks,
  stripInlineMarkdown,
} from "./markdownRender.js";

describe("parseMarkdownBlocks", () => {
  it("제목·문단·목록·표·인용·코드·수평선을 블록으로 나눈다", () => {
    const md = [
      "# 요약",
      "",
      "첫 문단입니다.",
      "",
      "- 항목 A",
      "  - 하위 항목",
      "",
      "| 구분 | 건수 |",
      "| --- | ---: |",
      "| 실패 | 3 |",
      "",
      "> 인용문",
      "",
      "```sql",
      "SELECT 1;",
      "```",
      "",
      "---",
    ].join("\n");

    expect(parseMarkdownBlocks(md).map((b) => b.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "table",
      "quote",
      "code",
      "hr",
    ]);
  });

  it("코드 펜스 안의 # 는 제목으로 보지 않는다", () => {
    const blocks = parseMarkdownBlocks("```\n# 주석\n```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "code", lines: ["# 주석"] });
  });

  it("목록 들여쓰기 2칸을 한 단계로 세고 번호 목록을 구분한다", () => {
    const [list] = parseMarkdownBlocks("1. 하나\n2. 둘\n    3. 상세");
    expect(list.ordered).toBe(true);
    expect(list.items.map((i) => i.depth)).toEqual([0, 0, 2]);
  });

  it("표는 헤더 열 수에 맞춰 셀을 채우고 정렬을 읽는다", () => {
    const [table] = parseMarkdownBlocks(
      "| A | B | C |\n|:--|:-:|--:|\n| 1 | 2 |",
    );
    expect(table.alignments).toEqual(["left", "center", "right"]);
    expect(table.rows).toEqual([["1", "2", ""]]);
  });
});

describe("markdownToHtml", () => {
  it("제목·목록·표를 태그로 렌더링한다 (원문 기호가 남지 않는다)", () => {
    const html = markdownToHtml(
      "## 결과\n\n- 통과\n\n| 항목 | 값 |\n| --- | --- |\n| 실패 | 3 |",
    );
    expect(html).toContain("<h2>결과</h2>");
    expect(html).toContain("<ul><li>통과</li></ul>");
    expect(html).toContain('<th style="text-align:left">항목</th>');
    expect(html).toContain('<td style="text-align:left">3</td>');
    expect(html).not.toContain("##");
    expect(html).not.toContain("| 항목");
  });

  it("중첩 목록을 하위 리스트로 감싼다", () => {
    expect(markdownToHtml("- 상위\n  - 하위")).toBe(
      "<ul><li>상위</li><ul><li>하위</li></ul></ul>",
    );
  });

  it("강조·인라인 코드·링크를 변환하고, 코드 안 기호는 보존한다", () => {
    const html = markdownToHtml("**굵게** 와 `a**b`, [문서](https://x.dev)");
    expect(html).toContain("<strong>굵게</strong>");
    expect(html).toContain("<code>a**b</code>");
    expect(html).toContain(
      '<a href="https://x.dev" target="_blank" rel="noopener noreferrer">문서</a>',
    );
  });

  it("원문 HTML 태그는 escape 되어 실행되지 않는다", () => {
    const html = markdownToHtml("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
  });

  it("javascript: 링크는 앵커로 만들지 않는다", () => {
    const html = markdownToHtml("[클릭](javascript:alert(1))");
    expect(html).not.toContain("<a ");
    expect(html).toContain("클릭");
  });

  it("코드 블록은 pre/code 로 감싸고 내용을 그대로 둔다", () => {
    expect(markdownToHtml("```js\nconst a = 1 < 2;\n```")).toBe(
      '<pre><code class="language-js">const a = 1 &lt; 2;</code></pre>',
    );
  });

  it("내용이 없으면 빈 문자열", () => {
    expect(markdownToHtml("")).toBe("");
    expect(markdownToHtml(null)).toBe("");
  });
});

describe("markdownToPlainText / stripInlineMarkdown", () => {
  it("마크다운 기호를 벗기고 표는 구분자로 잇는다", () => {
    const text = markdownToPlainText(
      "# 제목\n\n**굵게**\n\n- 항목\n\n| A | B |\n| --- | --- |\n| 1 | 2 |",
    );
    expect(text).toContain("제목");
    expect(text).toContain("굵게");
    expect(text).toContain("• 항목");
    expect(text).toContain("A | B");
    expect(text).not.toContain("#");
    expect(text).not.toContain("**");
  });

  it("인라인 기호만 제거하고 텍스트는 유지한다", () => {
    expect(
      stripInlineMarkdown("`code` 와 [링크](https://x.dev) 와 ~~취소~~"),
    ).toBe("code 와 링크 와 취소");
  });
});

describe("escapeHtml / inlineToHtml", () => {
  it("특수문자를 엔티티로 바꾼다", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;",
    );
  });

  it("스네이크 케이스 식별자를 기울임으로 잘못 변환하지 않는다", () => {
    expect(inlineToHtml("test_case_id 확인")).toBe("test_case_id 확인");
  });
});
