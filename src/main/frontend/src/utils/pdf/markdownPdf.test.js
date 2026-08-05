import { describe, it, expect } from "vitest";
import { drawMarkdownBlocks } from "./markdownPdf.js";
import { parseMarkdownBlocks } from "../markdownRender.js";

const COLORS = {
  black: [33, 33, 33],
  greyDark: [66, 66, 66],
  grey: [158, 158, 158],
  greyLight: [245, 247, 250],
};

// jsPDF 대역 — 그려진 텍스트와 도형만 기록한다 (폭은 글자수 * 5pt 로 근사)
const createPdfStub = () => {
  const texts = [];
  const rects = [];
  const lines = [];
  return {
    texts,
    rects,
    lines,
    text: (value, x, y) => texts.push({ value, x, y }),
    rect: (x, y, w, h, style) => rects.push({ x, y, w, h, style }),
    line: (x1, y1, x2, y2) => lines.push({ x1, y1, x2, y2 }),
    setFont: () => {},
    setFontSize: () => {},
    setTextColor: () => {},
    setFillColor: () => {},
    setDrawColor: () => {},
    setLineWidth: () => {},
    getTextWidth: (value) => String(value).length * 5,
    // 폭을 넘기면 단어 단위로 접는 최소 구현
    splitTextToSize: (value, maxWidth) => {
      const words = String(value).split(" ");
      const out = [];
      let current = "";
      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length * 5 > maxWidth && current) {
          out.push(current);
          current = word;
        } else {
          current = candidate;
        }
      });
      out.push(current);
      return out;
    },
  };
};

const draw = (markdown, { pageHeight = 10000 } = {}) => {
  const pdf = createPdfStub();
  let y = 100;
  let pageBreaks = 0;
  drawMarkdownBlocks(parseMarkdownBlocks(markdown), {
    pdf,
    x: 40,
    width: 500,
    colors: COLORS,
    getY: () => y,
    setY: (next) => {
      y = next;
    },
    ensureSpace: (height) => {
      if (y + height > pageHeight) {
        y = 100;
        pageBreaks += 1;
        return true;
      }
      return false;
    },
  });
  return { pdf, endY: y, pageBreaks };
};

const drawnText = (pdf) => pdf.texts.map((entry) => entry.value).join("\n");

describe("drawMarkdownBlocks", () => {
  it("제목의 # 기호는 그리지 않고 제목 글자만 그린다", () => {
    const { pdf } = draw("## 실패 분석\n본문입니다.");
    expect(drawnText(pdf)).toContain("실패 분석");
    expect(drawnText(pdf)).not.toContain("##");
  });

  it("목록은 글머리표를 붙이고 번호 목록은 순번을 매긴다", () => {
    const bullet = draw("- 항목 A\n- 항목 B");
    expect(drawnText(bullet.pdf)).toContain("•");

    const ordered = draw("1. 하나\n2. 둘");
    const values = ordered.pdf.texts.map((e) => e.value);
    expect(values).toContain("1.");
    expect(values).toContain("2.");
  });

  it("표는 셀마다 격자를 그리고 파이프 기호는 남기지 않는다", () => {
    const { pdf } = draw("| 구분 | 건수 |\n| --- | ---: |\n| 실패 | 3 |");
    // 헤더 2셀(배경 F + 테두리 S) + 본문 2셀(테두리 S)
    expect(pdf.rects.filter((r) => r.style === "S")).toHaveLength(4);
    expect(pdf.rects.filter((r) => r.style === "F")).toHaveLength(2);
    expect(drawnText(pdf)).toContain("구분");
    expect(drawnText(pdf)).not.toContain("|");
  });

  it("코드 블록은 음영 배경과 함께 원문을 그대로 그린다", () => {
    const { pdf } = draw("```sql\nSELECT 1;\n```");
    expect(drawnText(pdf)).toContain("SELECT 1;");
    expect(drawnText(pdf)).not.toContain("```");
    expect(pdf.rects.some((r) => r.style === "F")).toBe(true);
  });

  it("강조·링크 기호는 벗기고 텍스트만 남긴다", () => {
    const { pdf } = draw("**중요** 항목은 [문서](https://x.dev) 참고");
    const text = drawnText(pdf);
    expect(text).toContain("중요");
    expect(text).toContain("문서");
    expect(text).not.toContain("**");
    expect(text).not.toContain("https://x.dev");
  });

  it("페이지 높이를 넘으면 ensureSpace 로 페이지를 넘긴다", () => {
    const long = Array.from({ length: 40 }, (_, i) => `- 항목 ${i}`).join("\n");
    const { pageBreaks } = draw(long, { pageHeight: 300 });
    expect(pageBreaks).toBeGreaterThan(0);
  });

  it("빈 내용은 아무것도 그리지 않고 커서를 움직이지 않는다", () => {
    const { pdf, endY } = draw("");
    expect(pdf.texts).toHaveLength(0);
    expect(endY).toBe(100);
  });
});
