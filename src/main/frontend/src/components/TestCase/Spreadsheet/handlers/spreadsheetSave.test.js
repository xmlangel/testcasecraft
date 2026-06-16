import { describe, it, expect, vi } from "vitest";
import {
  createEmptyBatchResult,
  mergeBatchResult,
  saveFoldersLayered,
  resolveTestCaseParentIds,
  buildBatchSaveSummary,
} from "./spreadsheetSave.js";

// 저장 콜백 더블 — 입력 폴더에 결정적 id(saved-<name>)를 붙여 성공 결과로 반환
const echoSaveFn = (batch) =>
  Promise.resolve({
    savedTestCases: batch.map((f) => ({ ...f, id: `saved-${f.name}` })),
    successCount: batch.length,
    failureCount: 0,
    errors: [],
    isSuccess: true,
  });

describe("mergeBatchResult", () => {
  it("두 배치 결과를 누적 병합한다", () => {
    const target = createEmptyBatchResult();
    mergeBatchResult(target, {
      savedTestCases: [{ id: 1 }],
      successCount: 1,
      failureCount: 0,
      errors: [],
      isSuccess: true,
    });
    mergeBatchResult(target, {
      savedTestCases: [{ id: 2 }],
      successCount: 0,
      failureCount: 1,
      errors: ["e"],
      isSuccess: false,
    });
    expect(target.savedTestCases).toHaveLength(2);
    expect(target.successCount).toBe(1);
    expect(target.failureCount).toBe(1);
    expect(target.errors).toEqual(["e"]);
    expect(target.isSuccess).toBe(false);
  });
});

describe("saveFoldersLayered", () => {
  it("폴더가 없으면 호출 없이 빈 결과", async () => {
    const saveFn = vi.fn();
    const res = await saveFoldersLayered([], [], saveFn);
    expect(saveFn).not.toHaveBeenCalled();
    expect(res.savedTestCases).toEqual([]);
    expect(res.isSuccess).toBe(true);
  });

  it("루트 폴더 먼저, 자식은 부모 저장 후 parentId 해소되어 저장된다", async () => {
    const folders = [
      {
        name: "child",
        type: "folder",
        parentFolderName: "root",
        parentId: null,
      },
      { name: "root", type: "folder", parentFolderName: "", parentId: null },
    ];
    const saveFn = vi.fn(echoSaveFn);
    const res = await saveFoldersLayered(folders, [], saveFn);

    // root 가 먼저 저장된 뒤 child 가 root 의 새 id 를 parentId 로 갖는다
    const child = res.savedTestCases.find((f) => f.name === "child");
    expect(child.parentId).toBe("saved-root");
    expect(res.successCount).toBe(2);
    expect(res.isSuccess).toBe(true);
  });

  it("기존 데이터의 폴더 이름→ID 로 부모를 해소한다", async () => {
    const folders = [
      {
        name: "child",
        type: "folder",
        parentFolderName: "기존폴더",
        parentId: null,
      },
    ];
    const existing = [{ id: "exist-1", type: "folder", name: "기존폴더" }];
    const res = await saveFoldersLayered(folders, existing, echoSaveFn);
    const child = res.savedTestCases.find((f) => f.name === "child");
    expect(child.parentId).toBe("exist-1");
  });
});

describe("resolveTestCaseParentIds", () => {
  it("parentFolderName 을 기존+저장된 폴더 ID 로 해소한다", () => {
    const testCases = [
      { name: "tc1", parentFolderName: "신규폴더" },
      { name: "tc2", parentFolderName: "기존폴더" },
      { name: "tc3" }, // 부모 없음 → 그대로
    ];
    const existing = [{ id: "e1", type: "folder", name: "기존폴더" }];
    const savedFolders = [{ id: "s1", type: "folder", name: "신규폴더" }];
    const out = resolveTestCaseParentIds(testCases, existing, savedFolders);
    expect(out[0].parentId).toBe("s1");
    expect(out[1].parentId).toBe("e1");
    expect(out[2].parentId).toBeUndefined();
  });
});

describe("buildBatchSaveSummary", () => {
  const t = (key, fallback, vars) => {
    let s = fallback || key;
    if (vars)
      Object.entries(vars).forEach(([k, v]) => (s = s.replace(`{${k}}`, v)));
    return s;
  };

  it("성공 시 폴더/테스트케이스 개수를 담은 success 메시지", () => {
    const r = {
      savedTestCases: [
        { type: "folder" },
        { type: "testcase" },
        { type: "testcase" },
      ],
      successCount: 3,
      failureCount: 0,
      isSuccess: true,
    };
    const { message, severity } = buildBatchSaveSummary(r, t);
    expect(severity).toBe("success");
    expect(message).toContain("폴더 1개");
    expect(message).toContain("테스트케이스 2개");
  });

  it("부분 실패 시 warning + 성공/실패 개수", () => {
    const r = {
      savedTestCases: [{ type: "testcase" }],
      successCount: 1,
      failureCount: 2,
      isSuccess: false,
    };
    const { message, severity } = buildBatchSaveSummary(r, t);
    expect(severity).toBe("warning");
    expect(message).toContain("성공: 1개");
    expect(message).toContain("실패: 2개");
  });
});
