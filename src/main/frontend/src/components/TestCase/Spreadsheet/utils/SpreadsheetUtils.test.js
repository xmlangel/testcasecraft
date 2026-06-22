import { describe, it, expect } from "vitest";
import {
  flattenTreeInOrder,
  isFolderRow,
  extractFolderName,
  extractParentFolder,
  generateColumnLabels,
  convertDataForExport,
  filterRowsAfterDelete,
} from "./SpreadsheetUtils.js";

// i18n 더블 — {number} 치환까지 흉내
const t = (key, fallback, vars) => {
  let s = fallback || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(`{${k}}`, v);
    });
  }
  return s;
};

// 스프레드시트 셀은 {value} 형태 — 인덱스 기반 행 생성 헬퍼
const cell = (v) => ({ value: v });
const rowWith = (overrides = {}) => {
  const r = Array.from({ length: 7 }, () => cell(""));
  Object.entries(overrides).forEach(([idx, v]) => {
    r[idx] = cell(v);
  });
  return r;
};

describe("isFolderRow", () => {
  it("타입 컬럼(idx 4)이 폴더/folder/📁 면 true", () => {
    expect(isFolderRow(rowWith({ 4: "폴더" }), t)).toBe(true);
    expect(isFolderRow(rowWith({ 4: "folder" }), t)).toBe(true);
    expect(isFolderRow(rowWith({ 4: "📁" }), t)).toBe(true);
    expect(isFolderRow(rowWith({ 4: "  FOLDER " }), t)).toBe(true); // trim+lowercase
  });

  it("테스트케이스 타입이면 false", () => {
    expect(isFolderRow(rowWith({ 4: "테스트케이스" }), t)).toBe(false);
    expect(isFolderRow(rowWith({ 4: "" }), t)).toBe(false);
  });
});

describe("extractFolderName", () => {
  it("이름 컬럼(idx 6)을 trim 하여 반환한다", () => {
    expect(extractFolderName(rowWith({ 6: "  로그인 폴더 " }))).toBe(
      "로그인 폴더",
    );
  });
  it("값이 없으면 빈 문자열", () => {
    expect(extractFolderName(rowWith({}))).toBe("");
  });
});

describe("extractParentFolder", () => {
  it("상위폴더 컬럼(idx 5) 값을 trim 하여 반환한다", () => {
    expect(extractParentFolder(rowWith({ 5: " 상위 " }))).toBe("상위");
  });
  it('빈 값/"undefined"/"null" 은 모두 null', () => {
    expect(extractParentFolder(rowWith({ 5: "" }))).toBeNull();
    expect(extractParentFolder(rowWith({ 5: "undefined" }))).toBeNull();
    expect(extractParentFolder(rowWith({ 5: "null" }))).toBeNull();
    expect(extractParentFolder(rowWith({ 5: "   " }))).toBeNull();
  });
});

describe("generateColumnLabels", () => {
  it("기본 15 컬럼 + 스텝당 2 컬럼", () => {
    const labels = generateColumnLabels(2, t);
    expect(labels.length).toBe(15 + 2 * 2);
    expect(labels[0]).toBe("ID");
    expect(labels).toContain("Step 1");
    expect(labels).toContain("Expected 2");
  });

  it("스텝 0 이면 기본 컬럼만", () => {
    expect(generateColumnLabels(0, t).length).toBe(15);
  });
});

describe("convertDataForExport", () => {
  const labels = ["ID", "이름"];

  it("데이터가 없으면 빈 rows 와 헤더만 반환", () => {
    expect(convertDataForExport([], labels)).toEqual({
      headers: labels,
      rows: [],
    });
  });

  it("빈 행은 제거하고 셀 값만 추출한다", () => {
    const data = [
      [cell("1"), cell("로그인")],
      [cell(""), cell("   ")], // 빈 행 → 제거
      [cell("2"), cell("로그아웃")],
    ];
    const { headers, rows } = convertDataForExport(data, labels);
    expect(headers).toBe(labels);
    expect(rows).toEqual([
      ["1", "로그인"],
      ["2", "로그아웃"],
    ]);
  });
});

describe("flattenTreeInOrder", () => {
  it("빈 데이터는 빈 배열", () => {
    expect(flattenTreeInOrder([])).toEqual([]);
    expect(flattenTreeInOrder(null)).toEqual([]);
  });

  it("루트 노드를 displayOrder 순서로 평면화한다", () => {
    const data = [
      { id: 1, parentId: null, displayOrder: 2, name: "B" },
      { id: 2, parentId: null, displayOrder: 1, name: "A" },
    ];
    const flat = flattenTreeInOrder(data);
    expect(flat.map((n) => n.id)).toEqual([2, 1]);
  });
});

describe("filterRowsAfterDelete", () => {
  // 행: [ {value, testCaseId}, ... ] 형태. 여기선 row[0] 만 쓰므로 단순화.
  const mkRow = (id) => [{ value: id || "", testCaseId: id }];
  const rows = [
    mkRow("folder1"), // 0: 선택된 폴더
    mkRow("childA"), // 1: 폴더 하위 (선택 범위 밖)
    mkRow("other"), // 2: 무관
    mkRow("childB"), // 3: 폴더 하위 (선택 범위 밖)
  ];

  it("선택 범위 + 백엔드 삭제된 하위 id 를 모두 제거한다 (유령 행 방지)", () => {
    // 폴더(0)만 선택했지만 하위 childA/childB 가 백엔드에서 함께 삭제됨
    const deleted = new Set(["folder1", "childA", "childB"]);
    const result = filterRowsAfterDelete(rows, 0, 1, deleted);
    expect(result.map((r) => r[0].testCaseId)).toEqual(["other"]);
  });

  it("선택 범위 안의 신규(id 없는) 행도 제거한다", () => {
    const withNew = [mkRow("a"), [{ value: "신규" }], mkRow("b")];
    // 1~2 범위 삭제 (신규행 + b), 삭제 id 없음
    const result = filterRowsAfterDelete(withNew, 1, 2, new Set());
    expect(result.map((r) => r[0].testCaseId)).toEqual(["a"]);
  });

  it("삭제 id 집합이 비면 선택 범위만 제거한다", () => {
    const result = filterRowsAfterDelete(rows, 0, 1, new Set());
    expect(result.map((r) => r[0].testCaseId)).toEqual([
      "childA",
      "other",
      "childB",
    ]);
  });
});
