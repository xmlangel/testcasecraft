// 마크다운 블록을 jsPDF 캔버스에 서식대로 그린다.
//
// 화면의 MarkdownViewer가 하는 일(제목은 크게, 목록은 들여쓰기와 글머리, 표는 격자,
// 코드는 음영 박스)을 PDF에서도 같게 보이도록 한 것. 마크다운 기호만 지운 평문을
// 흘리면 표가 뭉개지고 남은 기호(`|`, `#`)가 그대로 노출된다.
//
// 호출자가 페이지 커서(cursorY)와 페이지 넘김 로직을 소유하고, 이 모듈은
// getY/setY/ensureSpace 세 콜백으로 그 커서를 조작한다.

import { stripInlineMarkdown } from "../markdownRender.js";

const HEADING_SIZE = { 1: 13, 2: 12, 3: 11, 4: 10, 5: 10, 6: 10 };
const BODY_SIZE = 9;
const BODY_LINE = 13;
const TABLE_SIZE = 8.5;
const TABLE_LINE = 12;
const TABLE_PAD = 4;
const MIN_COL_WIDTH = 44;

/**
 * @param {Array} blocks parseMarkdownBlocks 결과
 * @param {object} ctx
 * @param {object} ctx.pdf jsPDF 인스턴스
 * @param {number} ctx.x 좌측 시작 좌표
 * @param {number} ctx.width 사용 가능 폭
 * @param {object} ctx.colors 색상 팔레트 ([r,g,b] 배열)
 * @param {string} [ctx.fontName] 등록된 폰트명 (기본 NanumGothic)
 * @param {() => number} ctx.getY 현재 커서 Y
 * @param {(y: number) => void} ctx.setY 커서 Y 설정
 * @param {(height: number) => boolean} ctx.ensureSpace 공간 확보(부족하면 페이지 추가)
 */
export const drawMarkdownBlocks = (blocks = [], ctx) => {
  const {
    pdf,
    x,
    width,
    colors,
    fontName = "NanumGothic",
    getY,
    setY,
    ensureSpace,
  } = ctx;

  const border = [224, 228, 232];

  // 굵게 표현 — 한글 폰트에 bold 페이스가 없어 미세 오프셋으로 겹쳐 그린다
  // (푸터의 사용자 정의 문구와 같은 방식)
  const drawLine = (text, tx, ty, bold) => {
    pdf.text(text, tx, ty);
    if (bold) {
      pdf.text(text, tx + 0.3, ty);
      pdf.text(text, tx + 0.6, ty);
    }
  };

  const drawWrapped = (
    text,
    {
      indent = 0,
      size = BODY_SIZE,
      color,
      lineHeight = BODY_LINE,
      bold = false,
    } = {},
  ) => {
    const applyStyle = () => {
      pdf.setFont(fontName, "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...(color || colors.greyDark));
    };
    applyStyle();
    const maxWidth = Math.max(width - indent, 40);
    const lines = pdf.splitTextToSize(String(text ?? ""), maxWidth);
    lines.forEach((line) => {
      ensureSpace(lineHeight);
      applyStyle(); // 페이지가 넘어가면 헤더가 폰트를 바꿔놓으므로 매 줄 복원
      drawLine(line, x + indent, getY(), bold);
      setY(getY() + lineHeight);
    });
    return lines.length;
  };

  const drawHeading = (block) => {
    const size = HEADING_SIZE[block.level] || BODY_SIZE;
    setY(getY() + (block.level <= 2 ? 6 : 4));
    drawWrapped(stripInlineMarkdown(block.text), {
      size,
      color: colors.black,
      lineHeight: size + 6,
      bold: true,
    });
    setY(getY() + 3);
  };

  const drawList = (block) => {
    const counters = [];
    block.items.forEach((item) => {
      const depth = item.depth || 0;
      counters[depth] = (counters[depth] || 0) + 1;
      counters.length = depth + 1; // 더 깊은 단계의 번호는 초기화
      const marker = block.ordered
        ? `${counters[depth]}.`
        : depth % 2
          ? "-"
          : "•";
      const indent = 6 + depth * 14;

      pdf.setFont(fontName, "normal");
      pdf.setFontSize(BODY_SIZE);
      const markerWidth = pdf.getTextWidth(`${marker} `);

      // 글머리표는 첫 줄에만 붙이고, 본문은 그만큼 들여써서 잇는다
      ensureSpace(BODY_LINE);
      pdf.setFont(fontName, "normal");
      pdf.setFontSize(BODY_SIZE);
      pdf.setTextColor(...colors.greyDark);
      pdf.text(marker, x + indent, getY());

      drawWrapped(stripInlineMarkdown(item.text).replace(/\n/g, " "), {
        indent: indent + markerWidth,
      });
    });
    setY(getY() + 6);
  };

  const drawCode = (block) => {
    const lines = block.lines.length ? block.lines : [""];
    lines.forEach((raw) => {
      pdf.setFont(fontName, "normal");
      pdf.setFontSize(BODY_SIZE - 0.5);
      const wrapped = pdf.splitTextToSize(raw || " ", width - 16);
      wrapped.forEach((line) => {
        ensureSpace(BODY_LINE);
        const y = getY();
        pdf.setFillColor(...colors.greyLight);
        pdf.rect(x, y - 9, width, BODY_LINE, "F");
        pdf.setFont(fontName, "normal");
        pdf.setFontSize(BODY_SIZE - 0.5);
        pdf.setTextColor(...colors.greyDark);
        pdf.text(line, x + 8, y);
        setY(y + BODY_LINE);
      });
    });
    setY(getY() + 8);
  };

  const drawQuote = (block) => {
    block.blocks.forEach((inner) => {
      const startY = getY();
      const lineCount = drawWrapped(
        stripInlineMarkdown(inner.text || "").replace(/\n/g, " "),
        { indent: 14, color: colors.grey },
      );
      // 페이지가 넘어가지 않은 경우에만 인용 막대를 그린다 (좌표 어긋남 방지)
      if (getY() > startY) {
        pdf.setFillColor(...colors.grey);
        pdf.rect(x + 2, startY - 9, 2.5, lineCount * BODY_LINE, "F");
      }
    });
    setY(getY() + 6);
  };

  const drawTable = (block) => {
    const colCount = block.header.length;
    if (!colCount) return;

    // 열 폭은 내용 길이에 비례하되, 좁은 열이 뭉개지지 않도록 하한을 둔다
    const weights = block.header.map((head, idx) => {
      const lengths = [
        String(head ?? "").length,
        ...block.rows.map((row) => String(row[idx] ?? "").length),
      ];
      return Math.min(Math.max(...lengths, 1), 40);
    });
    const weightSum = weights.reduce((sum, w) => sum + w, 0) || 1;
    const raw = weights.map((w) =>
      Math.max((w / weightSum) * width, MIN_COL_WIDTH),
    );
    const rawSum = raw.reduce((sum, w) => sum + w, 0);
    const colWidths = raw.map((w) => (w * width) / rawSum);

    const drawRow = (cells, isHeader) => {
      pdf.setFont(fontName, "normal");
      pdf.setFontSize(TABLE_SIZE);
      const cellLines = cells.map((cell, idx) =>
        pdf.splitTextToSize(
          stripInlineMarkdown(String(cell ?? "")).replace(/\n/g, " ") || " ",
          colWidths[idx] - TABLE_PAD * 2,
        ),
      );
      const rowHeight =
        Math.max(...cellLines.map((lines) => lines.length), 1) * TABLE_LINE +
        TABLE_PAD * 2;

      ensureSpace(rowHeight);
      const y = getY();
      let cellX = x;

      cellLines.forEach((lines, idx) => {
        const colWidth = colWidths[idx];
        if (isHeader) {
          pdf.setFillColor(...colors.greyLight);
          pdf.rect(cellX, y, colWidth, rowHeight, "F");
        }
        pdf.setDrawColor(...border);
        pdf.setLineWidth(0.5);
        pdf.rect(cellX, y, colWidth, rowHeight, "S");

        pdf.setFont(fontName, "normal");
        pdf.setFontSize(TABLE_SIZE);
        pdf.setTextColor(...(isHeader ? colors.black : colors.greyDark));

        lines.forEach((line, lineIdx) => {
          const textY = y + TABLE_PAD + 9 + lineIdx * TABLE_LINE;
          const align = block.alignments?.[idx] || "left";
          let textX = cellX + TABLE_PAD;
          if (align === "right") {
            textX = cellX + colWidth - TABLE_PAD - pdf.getTextWidth(line);
          } else if (align === "center") {
            textX = cellX + (colWidth - pdf.getTextWidth(line)) / 2;
          }
          drawLine(line, textX, textY, isHeader);
        });

        cellX += colWidth;
      });

      setY(y + rowHeight);
    };

    drawRow(block.header, true);
    block.rows.forEach((row) => drawRow(row, false));
    setY(getY() + 18); // 표 아래는 넉넉히 — 다음 문단·제목이 표에 붙어 보인다
  };

  const drawHr = () => {
    ensureSpace(12);
    const y = getY();
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.5);
    pdf.line(x, y, x + width, y);
    setY(y + 12);
  };

  blocks.forEach((block) => {
    switch (block.type) {
      case "heading":
        drawHeading(block);
        break;
      case "paragraph":
        drawWrapped(stripInlineMarkdown(block.text));
        setY(getY() + 6);
        break;
      case "list":
        drawList(block);
        break;
      case "code":
        drawCode(block);
        break;
      case "quote":
        drawQuote(block);
        break;
      case "table":
        drawTable(block);
        break;
      case "hr":
        drawHr();
        break;
      default:
        break;
    }
  });
};

export default drawMarkdownBlocks;
