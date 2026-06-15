import { describe, it, expect } from "vitest";
import { validateSpreadsheetData } from "./SpreadsheetValidation.js";

const t = (key, fallback, vars) => {
  let s = fallback || key;
  if (vars)
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(`{${k}}`, v);
    });
  return s;
};

const cell = (v) => ({ value: v });
// idx: 0=ID, 4=type, 5=parentFolder, 6=name
const makeRow = ({ id = "", type = "", parent = "", name = "" } = {}) => {
  const r = Array.from({ length: 7 }, () => cell(""));
  r[0] = cell(id);
  r[4] = cell(type);
  r[5] = cell(parent);
  r[6] = cell(name);
  return r;
};

const run = (rows, data = []) =>
  validateSpreadsheetData(rows, { maxSteps: 3, data, t });

describe("validateSpreadsheetData", () => {
  it("rows 가 배열이 아니면 invalid_data 로 실패", () => {
    const res = validateSpreadsheetData(null, { t });
    expect(res.isValid).toBe(false);
    expect(res.errors[0].type).toBe("invalid_data");
  });

  it("폴더 + 하위 테스트케이스가 정상이면 통과한다", () => {
    const rows = [
      makeRow({ type: "폴더", name: "로그인" }),
      makeRow({ type: "테스트케이스", name: "성공 케이스", parent: "로그인", id: "tc1" }),
    ];
    const res = run(rows);
    expect(res.isValid).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.summary).toMatchObject({
      totalRows: 2,
      folderCount: 1,
      testCaseCount: 1,
    });
  });

  it("이름이 비면 required_field 에러", () => {
    const res = run([makeRow({ type: "테스트케이스", name: "" })]);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.type === "required_field")).toBe(true);
  });

  it("폴더명이 중복되면 duplicate_folder 에러", () => {
    const rows = [
      makeRow({ type: "폴더", name: "공통" }),
      makeRow({ type: "폴더", name: "공통" }),
    ];
    const res = run(rows);
    expect(res.errors.some((e) => e.type === "duplicate_folder")).toBe(true);
  });

  it("같은 폴더 내 테스트케이스명이 중복되면 duplicate_testcase 에러", () => {
    const rows = [
      makeRow({ type: "테스트케이스", name: "중복", id: "a" }),
      makeRow({ type: "테스트케이스", name: "중복", id: "b" }),
    ];
    const res = run(rows);
    expect(res.errors.some((e) => e.type === "duplicate_testcase")).toBe(true);
  });

  it("자기 자신을 상위폴더로 지정하면 circular_reference 에러", () => {
    const rows = [makeRow({ type: "폴더", name: "x", parent: "x" })];
    const res = run(rows);
    expect(res.errors.some((e) => e.type === "circular_reference")).toBe(true);
  });

  it("존재하지 않는 상위폴더를 지정하면 missing_parent_folder 에러", () => {
    const rows = [
      makeRow({ type: "테스트케이스", name: "tc", parent: "없는폴더", id: "tc1" }),
    ];
    const res = run(rows, []);
    expect(res.errors.some((e) => e.type === "missing_parent_folder")).toBe(
      true,
    );
  });
});
