import { describe, it, expect } from "vitest";
import {
  flattenTreeInOrder,
  isFolderRow,
  extractFolderName,
  extractParentFolder,
  generateColumnLabels,
  convertDataForExport,
  filterRowsAfterDelete,
  clampMaxSteps,
  buildSpreadsheetRows,
  convertRowsToEntities,
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

describe("clampMaxSteps", () => {
  it("1~20 범위는 그대로, 그 외는 3", () => {
    expect(clampMaxSteps(5)).toBe(5);
    expect(clampMaxSteps(1)).toBe(1);
    expect(clampMaxSteps(20)).toBe(20);
    expect(clampMaxSteps(0)).toBe(3);
    expect(clampMaxSteps(21)).toBe(3);
    expect(clampMaxSteps(NaN)).toBe(3);
    expect(clampMaxSteps(undefined)).toBe(3);
  });
});

describe("buildSpreadsheetRows", () => {
  const t = (key, fallback) => fallback || key;

  it("데이터가 없으면 빈 행 10개를 반환한다 (열 수 = 15 + maxSteps*2)", () => {
    const rows = buildSpreadsheetRows({
      data: [],
      allData: [],
      maxSteps: 3,
      t,
    });
    expect(rows).toHaveLength(10);
    expect(rows[0]).toHaveLength(15 + 3 * 2);
    // 각 행은 독립 배열 (참조 공유 금지)
    expect(rows[0]).not.toBe(rows[1]);
  });

  it("maxSteps 비정상값은 3으로 보정된다", () => {
    const rows = buildSpreadsheetRows({
      data: [],
      allData: [],
      maxSteps: 999,
      t,
    });
    expect(rows[0]).toHaveLength(15 + 3 * 2);
  });

  it("테스트케이스 행을 변환한다 — id/이름/타입/스텝 매핑", () => {
    const data = [
      {
        id: "tc1",
        type: "testcase",
        name: "케이스1",
        displayId: "TC-1",
        priority: "HIGH",
        tags: ["a", "b"],
        steps: [{ description: "s1", expectedResult: "e1" }],
        parentId: "f1",
      },
    ];
    const allData = [...data, { id: "f1", type: "folder", name: "폴더1" }];
    const rows = buildSpreadsheetRows({ data, allData, maxSteps: 2, t });
    expect(rows).toHaveLength(1);
    const row = rows[0];
    expect(row[0]).toMatchObject({ value: "TC-1", testCaseId: "tc1" });
    expect(row[4].value).toBe("테스트케이스"); // 타입
    expect(row[5].value).toBe("폴더1"); // 상위폴더명 (allData 조회)
    expect(row[6].value).toBe("케이스1"); // 이름
    expect(row[14].value).toBe("a, b"); // 태그 join
    // 스텝1 설명/예상, 스텝2 빈칸 (총 4개 스텝 셀)
    expect(row[15].value).toBe("s1");
    expect(row[16].value).toBe("e1");
    expect(row[17].value).toBe("");
  });

  it("폴더 행은 스텝/우선순위 등이 readOnly 이고 비어 있다", () => {
    const data = [{ id: "f1", type: "folder", name: "폴더1" }];
    const rows = buildSpreadsheetRows({ data, allData: data, maxSteps: 1, t });
    const row = rows[0];
    expect(row[4].value).toBe("폴더"); // 타입
    expect(row[11].value).toBe(""); // 우선순위 빈칸
    expect(row[11].readOnly).toBe(true);
    expect(row[15].readOnly).toBe(true); // 스텝 readOnly
  });
});

describe("convertRowsToEntities", () => {
  const t = (key, fallback) => fallback || key;
  // 15 base + 2 step cols. 인덱스: 4=타입,5=상위폴더,6=이름,7=설명,11=우선순위,14=태그,15/16=step1
  const makeRow = (vals) => {
    const r = Array.from({ length: 17 }, () => ({ value: "" }));
    Object.entries(vals).forEach(([i, v]) => {
      r[i] = typeof v === "object" ? v : { value: v };
    });
    return r;
  };

  it("빈 행은 제외하고 테스트케이스를 변환한다", () => {
    const rows = [
      makeRow({}), // 빈 행 → 제외
      makeRow({
        4: "테스트케이스",
        6: "케이스1",
        7: "설명",
        11: "HIGH",
        14: "a, b",
        15: "동작1",
        16: "예상1",
      }),
    ];
    const out = convertRowsToEntities(rows, {
      maxSteps: 1,
      data: [],
      projectId: "p1",
      t,
      now: 123,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      name: "케이스1",
      description: "설명",
      priority: "HIGH",
      type: "testcase",
      projectId: "p1",
      tags: ["a", "b"],
      steps: [{ stepNumber: 1, description: "동작1", expectedResult: "예상1" }],
    });
  });

  it("폴더 행은 type=folder 이고 스텝/태그/우선순위가 비어 있다", () => {
    const rows = [makeRow({ 4: "폴더", 6: "폴더1" })];
    const out = convertRowsToEntities(rows, {
      maxSteps: 2,
      data: [],
      projectId: "p1",
      t,
      now: 1,
    });
    expect(out[0]).toMatchObject({
      name: "폴더1",
      type: "folder",
      priority: "",
      tags: [],
      steps: [],
    });
  });

  it("기존 testCaseId 가 있으면 유지, 없으면 temp- id 를 생성한다", () => {
    const rows = [
      makeRow({
        0: { value: "TC-1", testCaseId: "id1" },
        6: "기존",
        4: "테스트케이스",
      }),
      makeRow({ 6: "신규", 4: "테스트케이스" }),
    ];
    const out = convertRowsToEntities(rows, {
      maxSteps: 1,
      data: [],
      projectId: "p1",
      t,
      now: 999,
    });
    expect(out[0].id).toBe("id1");
    expect(out[1].id).toBe("temp-999-1");
  });

  it("상위폴더명으로 기존 data 에서 parentId 를 해소한다", () => {
    const rows = [makeRow({ 4: "테스트케이스", 6: "자식", 5: "부모폴더" })];
    const data = [{ id: "f-parent", type: "folder", name: "부모폴더" }];
    const out = convertRowsToEntities(rows, {
      maxSteps: 1,
      data,
      projectId: "p1",
      t,
      now: 1,
    });
    expect(out[0].parentId).toBe("f-parent");
    expect(out[0].parentFolderName).toBe("부모폴더");
  });
});
