// 마크다운을 내보내기 산출물(HTML·PDF)에서 쓸 수 있는 형태로 변환하는 유틸.
//
// 화면의 MarkdownViewer(react-markdown)는 React 트리를 그리므로 파일로
// 저장하는 HTML 문자열이나 jsPDF 캔버스에는 쓸 수 없다. 그래서 같은 GFM 부분집합
// (제목·목록·표·코드·인용·수평선·강조·링크)을 문자열/블록으로 변환한다.
//
// - parseMarkdownBlocks: 마크다운 → 블록 배열 (HTML·PDF 렌더러 공통 입력)
// - markdownToHtml: 블록 → HTML 문자열 (내보낸 HTML 리포트용)
// - markdownToPlainText: 블록 → 순수 텍스트 (서식 없는 출력용)

// 자리표시자 구분자. 사용자가 입력할 수 없는 제어문자를 쓴다.
// 원시 NUL 바이트를 파일에 박으면 git·grep 이 이 소스를 바이너리로 취급하므로
// 반드시 이스케이프 표기로 둔다.
const CODE_TOKEN = "\u0000";

// 링크로 허용할 스킴. 그 외(javascript: 등)는 링크를 만들지 않고 라벨만 남긴다.
const SAFE_LINK = /^(?:https?:\/\/|mailto:|tel:|#|\/)/i;

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const HR = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+#-]*)\s*$/;
const TABLE_SEP = /^\s*\|?(?:\s*:?-{1,}:?\s*\|)+\s*:?-{1,}:?\s*\|?\s*$/;

const isBlank = (line) => !line || !line.trim();

// 표 한 줄을 셀 배열로 분리 (양끝 파이프는 선택)
const splitTableRow = (line) => {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);
  return text.split("|").map((cell) => cell.trim());
};

const parseAlignments = (separatorLine) =>
  splitTableRow(separatorLine).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });

/**
 * 마크다운 원문을 블록 배열로 파싱한다.
 * 블록 타입: heading | paragraph | list | code | quote | table | hr
 */
export const parseMarkdownBlocks = (markdown = "") => {
  const lines = String(markdown ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // 코드 펜스 — 내부는 마크업으로 해석하지 않는다
    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1][0] === "`" ? "`" : "~";
      const closing = new RegExp(`^\\s*${marker}{3,}\\s*$`);
      const body = [];
      i += 1;
      while (i < lines.length && !closing.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1; // 닫는 펜스 소비
      blocks.push({ type: "code", lang: fence[2] || "", lines: body });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // 인용 — 연속된 > 줄을 모아 내용을 재귀 파싱
    if (/^\s*>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({
        type: "quote",
        blocks: parseMarkdownBlocks(quoted.join("\n")),
      });
      continue;
    }

    // 표 — 헤더 줄 + 구분 줄이 붙어 있어야 표로 본다
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      TABLE_SEP.test(lines[i + 1])
    ) {
      const header = splitTableRow(line);
      const alignments = parseAlignments(lines[i + 1]);
      i += 2;
      const rows = [];
      while (i < lines.length && !isBlank(lines[i]) && lines[i].includes("|")) {
        const cells = splitTableRow(lines[i]);
        // 열 수를 헤더에 맞춘다 (부족하면 채우고 넘치면 자른다)
        while (cells.length < header.length) cells.push("");
        rows.push(cells.slice(0, header.length));
        i += 1;
      }
      blocks.push({ type: "table", header, alignments, rows });
      continue;
    }

    // 목록 — 들여쓰기 2칸을 한 단계로 본다
    if (LIST_ITEM.test(line)) {
      const items = [];
      const ordered = /\d/.test(LIST_ITEM.exec(line)[2]);
      while (i < lines.length) {
        const match = LIST_ITEM.exec(lines[i]);
        if (match) {
          items.push({
            depth: Math.min(
              Math.floor(match[1].replace(/\t/g, "  ").length / 2),
              5,
            ),
            text: match[3].trim(),
            ordered: /\d/.test(match[2]),
          });
          i += 1;
          continue;
        }
        // 항목에 이어지는 들여쓴 줄은 같은 항목의 본문으로 붙인다
        if (!isBlank(lines[i]) && /^\s{2,}/.test(lines[i]) && items.length) {
          items[items.length - 1].text += `\n${lines[i].trim()}`;
          i += 1;
          continue;
        }
        break;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 문단 — 빈 줄 또는 다른 블록이 시작될 때까지
    const paragraph = [];
    while (i < lines.length && !isBlank(lines[i])) {
      const current = lines[i];
      if (
        paragraph.length &&
        (HEADING.test(current) ||
          HR.test(current) ||
          FENCE.test(current) ||
          LIST_ITEM.test(current) ||
          /^\s*>/.test(current))
      ) {
        break;
      }
      paragraph.push(current.trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
};

// 인라인 코드를 자리표시자로 빼내 강조 변환에서 보호한다
const extractInlineCode = (text) => {
  const codes = [];
  const masked = String(text ?? "").replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `${CODE_TOKEN}${codes.length - 1}${CODE_TOKEN}`;
  });
  return { masked, codes };
};

const restoreInlineCode = (text, codes, wrap) =>
  text.replace(
    new RegExp(`${CODE_TOKEN}(\\d+)${CODE_TOKEN}`, "g"),
    (_, index) => wrap(codes[Number(index)] ?? ""),
  );

const applyEmphasis = (text, tags) =>
  text
    .replace(/\*\*\*([^*]+)\*\*\*/g, tags.boldItalic ?? ((_, inner) => inner))
    .replace(/\*\*([^*]+)\*\*/g, tags.bold)
    .replace(/__([^_]+)__/g, tags.bold)
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, tags.italic)
    .replace(/(^|[^_\w])_([^_\n]+)_/g, tags.italic)
    .replace(/~~([^~]+)~~/g, tags.strike);

/** 인라인 마크업(강조·링크·이미지·코드)을 HTML로 변환. 텍스트는 escape 된다. */
export const inlineToHtml = (text = "") => {
  const { masked, codes } = extractInlineCode(text);
  let out = escapeHtml(masked);

  // 이미지 — 내보낸 파일이 외부 리소스에 의존하지 않도록 alt 텍스트만 남긴다
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");

  // 링크 — 허용 스킴만 앵커로, 나머지는 라벨만
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+[^)]*)?\)/g,
    (_, label, href) => {
      const url = href.replace(/&quot;|&#39;/g, "").trim();
      if (!SAFE_LINK.test(url)) return label;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
  );

  out = applyEmphasis(out, {
    boldItalic: "<strong><em>$1</em></strong>",
    bold: "<strong>$1</strong>",
    italic: "$1<em>$2</em>",
    strike: "<del>$1</del>",
  });

  return restoreInlineCode(
    out,
    codes,
    (code) => `<code>${escapeHtml(code)}</code>`,
  );
};

/** 인라인 마크업을 벗겨 순수 텍스트로. PDF 텍스트 등 서식 없는 출력용. */
export const stripInlineMarkdown = (text = "") => {
  const { masked, codes } = extractInlineCode(text);
  const out = applyEmphasis(
    masked
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"),
    { boldItalic: "$1", bold: "$1", italic: "$1$2", strike: "$1" },
  );
  return restoreInlineCode(out, codes, (code) => code);
};

// 같은 depth의 목록 항목을 중첩 <ul>/<ol>로 조립.
// 하위 목록은 앞선 <li> **안에** 넣는다 — <ul>의 자식으로 <ul>을 직접 두면
// HTML 규격 위반이라 엄격한 파서에서 구조가 재배치되거나 항목이 사라진다.
const listToHtml = (items, ordered, depth = 0) => {
  const tag = ordered ? "ol" : "ul";
  let html = `<${tag}>`;
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (item.depth < depth) break;
    index += 1;

    // 이 항목보다 깊은 뒤쪽 항목들은 이 항목의 하위 목록이다
    const nested = [];
    while (index < items.length && items[index].depth > depth) {
      nested.push(items[index]);
      index += 1;
    }
    const child = nested.length
      ? listToHtml(nested, nested[0].ordered, nested[0].depth)
      : "";

    html += `<li>${inlineToHtml(item.text)}${child}</li>`;
  }

  return `${html}</${tag}>`;
};

const blockToHtml = (block) => {
  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(block.level, 1), 6);
      return `<h${level}>${inlineToHtml(block.text)}</h${level}>`;
    }
    case "paragraph":
      return `<p>${inlineToHtml(block.text)}</p>`;
    case "list":
      return listToHtml(block.items, block.ordered, block.items[0]?.depth ?? 0);
    case "code": {
      const lang = block.lang
        ? ` class="language-${escapeHtml(block.lang)}"`
        : "";
      return `<pre><code${lang}>${escapeHtml(block.lines.join("\n"))}</code></pre>`;
    }
    case "quote":
      return `<blockquote>${block.blocks.map(blockToHtml).join("")}</blockquote>`;
    case "table": {
      const head = block.header
        .map(
          (cell, idx) =>
            `<th style="text-align:${block.alignments[idx] || "left"}">${inlineToHtml(cell)}</th>`,
        )
        .join("");
      const body = block.rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell, idx) =>
                  `<td style="text-align:${block.alignments[idx] || "left"}">${inlineToHtml(cell)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("");
      return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }
    case "hr":
      return "<hr>";
    default:
      return "";
  }
};

/** 마크다운 → HTML 문자열. 원문 HTML 태그는 escape 되어 실행되지 않는다. */
export const markdownToHtml = (markdown = "") =>
  parseMarkdownBlocks(markdown).map(blockToHtml).join("");

const blockToPlainLines = (block) => {
  switch (block.type) {
    case "heading":
      return [stripInlineMarkdown(block.text)];
    case "paragraph":
      return stripInlineMarkdown(block.text).split("\n");
    case "list":
      return block.items.map(
        (item, idx) =>
          `${"  ".repeat(item.depth)}${block.ordered ? `${idx + 1}.` : "•"} ` +
          stripInlineMarkdown(item.text).replace(/\n/g, " "),
      );
    case "code":
      return [...block.lines];
    case "quote":
      return block.blocks.flatMap(blockToPlainLines);
    case "table":
      return [block.header, ...block.rows].map((row) =>
        row.map((cell) => stripInlineMarkdown(cell)).join(" | "),
      );
    case "hr":
      return ["────────"];
    default:
      return [];
  }
};

/** 마크다운 → 순수 텍스트 (블록 사이 빈 줄 유지) */
export const markdownToPlainText = (markdown = "") =>
  parseMarkdownBlocks(markdown)
    .map((block) => blockToPlainLines(block).join("\n"))
    .join("\n\n")
    .trim();
