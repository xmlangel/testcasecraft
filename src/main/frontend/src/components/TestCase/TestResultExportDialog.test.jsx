import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ICT-469·470·472: 내보내기 대화상자가 실제로 만드는 파일 내용을 검사한다.
// 변환 규칙(markdownToExportText·preserveLineBreaks·formatStepResultsText)은 utils 테스트가 검사하므로
// 여기서는 대화상자를 렌더하고 형식을 골라 내보내기 버튼을 누른 뒤, 파일이 나가는 경계에서 내용을 잡는다.
//   CSV·HTML: URL.createObjectURL 로 넘어온 Blob
//   엑셀: xlsx 의 aoa_to_sheet 인자와 book_append_sheet 시트 이름 (writeFile 은 막는다)
//   PDF: jsPDF 의 text() 인자
const { xlsxCalls, pdfTexts } = vi.hoisted(() => ({
  xlsxCalls: { aoa: [], sheetNames: [] },
  pdfTexts: [],
}));

vi.mock("xlsx", async () => {
  const actual = await vi.importActual("xlsx");
  return {
    ...actual,
    utils: {
      ...actual.utils,
      aoa_to_sheet: (aoa) => {
        xlsxCalls.aoa.push(aoa);
        return actual.utils.aoa_to_sheet(aoa);
      },
      book_append_sheet: (wb, ws, name) => {
        xlsxCalls.sheetNames.push(name);
        return actual.utils.book_append_sheet(wb, ws, name);
      },
    },
    writeFile: () => {},
  };
});

// jsPDF 는 그리는 메서드가 많아 Proxy 로 받는다. 값을 돌려줘야 하는 메서드만 따로 정의하고
// text() 로 그린 문자열은 모두 기록한다.
vi.mock("jspdf", () => {
  function FakePdf() {
    const pageSize = { getWidth: () => 842, getHeight: () => 595 };
    const known = {
      internal: { pageSize, getNumberOfPages: () => 1 },
      text: (value) => {
        pdfTexts.push(Array.isArray(value) ? value.join("\n") : String(value));
      },
      splitTextToSize: (value) => String(value ?? "").split("\n"),
      getTextWidth: (value) => String(value ?? "").length * 5,
      getFontSize: () => 10,
      getNumberOfPages: () => 1,
      getTextDimensions: () => ({ w: 10, h: 10 }),
      getStringUnitWidth: () => 1,
      save: () => {},
    };
    const proxy = new Proxy(known, {
      get: (target, prop) => (prop in target ? target[prop] : () => proxy),
    });
    return proxy;
  }
  return { default: FakePdf, jsPDF: FakePdf };
});

vi.mock("../../assets/fonts/nanumGothicFont.js", () => ({
  addNanumGothicToJsPDF: async () => true,
  setupKoreanFontFallback: () => {},
}));

const fill = (text, params) =>
  Object.entries(params || {}).reduce(
    (acc, [k, v]) => acc.replace(`{${k}}`, v),
    text,
  );
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, fallback, params) => fill(fallback || key, params),
  }),
}));
vi.mock("../../context/AppContext.jsx", () => ({
  useAppContext: () => ({ api: vi.fn() }),
}));
vi.mock("../../context/ThemeContext.jsx", () => ({
  useTheme: () => ({ mode: "light" }),
}));

import TestResultExportDialog from "./TestResultExportDialog.jsx";

const IMAGE_URL = "/api/testcase-attachments/public/att-9";
const TOKEN = "SECRET-TOKEN-123";

const COLUMNS = {
  displayId: { field: "displayId", headerName: "ID" },
  testCase: { field: "testCase", headerName: "케이스" },
  result: { field: "result", headerName: "결과" },
  notes: { field: "notes", headerName: "비고" },
  tags: { field: "tags", headerName: "태그" },
  executionType: { field: "executionType", headerName: "실행 타입" },
  stepResults: { field: "stepResults", headerName: "스텝 결과" },
};

const baseRow = (overrides = {}) => ({
  displayId: "TC-1",
  testCase: "로그인 케이스",
  result: "FAIL",
  notes: `화면 확인\n![로그인 화면](${IMAGE_URL}?token=${TOKEN})`,
  tags: ["회귀"],
  executionType: "MANUAL",
  stepResults: [
    { stepNumber: 2, result: "FAIL", actualResult: "첫 줄\n둘째 줄" },
    { stepNumber: 1, result: "PASS", actualResult: "" },
  ],
  ...overrides,
});

let blobs = [];
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

const readBlob = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(blob);
  });

const exportAs = async (format, { columns, rows }) => {
  const onClose = vi.fn();
  render(
    <TestResultExportDialog
      open
      onClose={onClose}
      projectId="proj-1"
      visibleColumns={columns}
      rows={rows}
      totalRows={rows.length}
      activeProject={{ name: "데모" }}
    />,
  );
  const title = {
    EXCEL: "Excel (.xlsx)",
    PDF: "PDF (.pdf)",
    CSV: "CSV (.csv)",
    HTML: "HTML (.html)",
  }[format];
  fireEvent.click(screen.getByText(title));
  fireEvent.click(screen.getByRole("button", { name: `${format} 내보내기` }));
  // 대화상자는 파일을 다 만든 뒤에 닫힌다
  await waitFor(() => expect(onClose).toHaveBeenCalled());
};

const htmlDoc = async () => {
  expect(blobs).toHaveLength(1);
  const text = await readBlob(blobs[0]);
  return { text, doc: new DOMParser().parseFromString(text, "text/html") };
};

describe("TestResultExportDialog 파일 내용", () => {
  beforeEach(() => {
    blobs = [];
    xlsxCalls.aoa.length = 0;
    xlsxCalls.sheetNames.length = 0;
    pdfTexts.length = 0;
    URL.createObjectURL = (blob) => {
      blobs.push(blob);
      return "blob:test";
    };
    URL.revokeObjectURL = () => {};
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    vi.restoreAllMocks();
  });

  describe("본문 이미지 주소·공개 토큰 (ICT-470)", () => {
    const columns = [COLUMNS.displayId, COLUMNS.testCase, COLUMNS.notes];

    it("CSV 의 비고 셀에는 이미지 주소와 토큰 대신 [이미지: 대체텍스트] 표기가 들어간다", async () => {
      await exportAs("CSV", { columns, rows: [baseRow()] });

      expect(blobs).toHaveLength(1);
      const csv = await readBlob(blobs[0]);
      expect(csv).toContain("화면 확인");
      expect(csv).toContain("[이미지: 로그인 화면]");
      expect(csv).not.toContain(TOKEN);
      expect(csv).not.toContain(IMAGE_URL);
    });

    it("이미지가 없는 비고는 CSV 에 그대로 들어간다", async () => {
      await exportAs("CSV", {
        columns,
        rows: [baseRow({ notes: "평문 비고 그대로" })],
      });

      const csv = await readBlob(blobs[0]);
      expect(csv).toContain("평문 비고 그대로");
      expect(csv).not.toContain("이미지");
    });

    it("엑셀 결과 시트의 비고 셀에도 이미지 주소와 토큰이 남지 않는다", async () => {
      await exportAs("EXCEL", { columns, rows: [baseRow()] });

      expect(xlsxCalls.sheetNames[0]).toBe("TestResults");
      const [header, row] = xlsxCalls.aoa[0];
      const notesCell = row[header.indexOf("Notes")];
      expect(notesCell).toContain("[이미지: 로그인 화면]");
      expect(notesCell).not.toContain(TOKEN);
      expect(notesCell).not.toContain(IMAGE_URL);
    });

    it("HTML 리포트 어디에도 이미지 주소와 토큰이 남지 않는다", async () => {
      await exportAs("HTML", { columns, rows: [baseRow()] });

      const { text } = await htmlDoc();
      expect(text).toContain("[이미지: 로그인 화면]");
      expect(text).not.toContain(TOKEN);
      expect(text).not.toContain(IMAGE_URL);
    });

    it("PDF 리포트에 그린 글자에도 이미지 주소와 토큰이 남지 않는다", async () => {
      await exportAs("PDF", { columns, rows: [baseRow()] });

      const drawn = pdfTexts.join("\n");
      expect(drawn).toContain("화면 확인");
      expect(drawn).not.toContain(TOKEN);
      expect(drawn).not.toContain(IMAGE_URL);
    });
  });

  describe("스텝 결과 (ICT-469·472)", () => {
    const columns = [
      COLUMNS.displayId,
      COLUMNS.testCase,
      COLUMNS.result,
      COLUMNS.stepResults,
    ];

    it("엑셀은 스텝 결과 시트를 따로 만들고 스텝마다 한 줄씩 싣는다", async () => {
      await exportAs("EXCEL", { columns, rows: [baseRow()] });

      expect(xlsxCalls.sheetNames).toHaveLength(2);
      const stepSheet = xlsxCalls.aoa[1];
      const body = stepSheet.slice(1);
      expect(body).toHaveLength(2);
      expect(body.map((r) => r.join("|")).join("\n")).toContain("FAIL");
      expect(body.map((r) => r.join("|")).join("\n")).toContain("첫 줄");
    });

    it("HTML 카드에 스텝 결과 표가 스텝 번호 순서대로 실린다", async () => {
      await exportAs("HTML", { columns, rows: [baseRow()] });

      const { doc } = await htmlDoc();
      const rows = [
        ...doc.querySelectorAll("section.case table.steps tbody tr"),
      ];
      expect(rows.map((tr) => tr.querySelector("td.no").textContent)).toEqual([
        "1",
        "2",
      ]);
      expect(rows[1].querySelector("td.md").textContent).toContain("첫 줄");
    });

    it("HTML 카드의 스텝 실제 결과는 줄바꿈을 유지한다", async () => {
      await exportAs("HTML", { columns, rows: [baseRow()] });

      // 리포트는 문단 안의 줄바꿈 문자를 .md p{white-space:pre-wrap} 로 그대로 보여 준다
      const { doc } = await htmlDoc();
      const cell = doc.querySelectorAll("section.case table.steps td.md")[1];
      expect(cell.querySelector("p").textContent).toBe("첫 줄\n둘째 줄");
      expect(doc.querySelector("style").textContent).toMatch(
        /\.md p\{[^}]*white-space:pre-wrap/,
      );
    });

    it("스텝 결과가 없는 행은 HTML 카드에 스텝 결과 표가 없다", async () => {
      await exportAs("HTML", {
        columns,
        rows: [baseRow({ stepResults: [] })],
      });

      const { doc } = await htmlDoc();
      expect(doc.querySelector("section.case")).not.toBeNull();
      expect(doc.querySelector("section.case table.steps")).toBeNull();
    });

    it("스텝 결과 열을 끄면 저장된 스텝 결과가 있어도 HTML 카드에 싣지 않는다", async () => {
      await exportAs("HTML", {
        columns: [COLUMNS.displayId, COLUMNS.testCase, COLUMNS.result],
        rows: [baseRow()],
      });

      const { doc } = await htmlDoc();
      expect(doc.querySelector("section.case table.steps")).toBeNull();
    });

    it("PDF 카드에 스텝 결과의 실제 결과가 그려진다", async () => {
      await exportAs("PDF", { columns, rows: [baseRow()] });

      const drawn = pdfTexts.join("\n");
      expect(drawn).toContain("첫 줄");
      expect(drawn).toContain("둘째 줄");
    });
  });

  describe("카드 정보 줄은 켠 열만 싣는다 (ICT-472)", () => {
    const labels = (doc) =>
      [...doc.querySelectorAll("section.case .info .ik")].map(
        (el) => el.textContent,
      );

    it("태그 열을 켜면 HTML 카드에 태그 줄이 생기고, 끈 실행 타입 줄은 없다", async () => {
      await exportAs("HTML", {
        columns: [COLUMNS.displayId, COLUMNS.testCase, COLUMNS.tags],
        rows: [baseRow()],
      });

      const { doc } = await htmlDoc();
      expect(labels(doc)).toContain("태그");
      expect(labels(doc)).not.toContain("실행 타입");
      const tagValue = [...doc.querySelectorAll("section.case .info")].find(
        (el) => el.querySelector(".ik").textContent === "태그",
      );
      expect(tagValue.querySelector(".iv").textContent).toBe("회귀");
    });

    it("실행 타입 열만 켜면 실행 타입 줄이 생기고 태그 줄은 없다", async () => {
      await exportAs("HTML", {
        columns: [COLUMNS.displayId, COLUMNS.testCase, COLUMNS.executionType],
        rows: [baseRow()],
      });

      const { doc } = await htmlDoc();
      expect(labels(doc)).toContain("실행 타입");
      expect(labels(doc)).not.toContain("태그");
    });
  });
});
