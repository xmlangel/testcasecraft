import { describe, it, expect } from "vitest";
import {
  clampDetailWidth,
  isCaseInList,
  resolveListContextId,
  DETAIL_PANE_MIN_WIDTH,
  DETAIL_PANE_MAX_WIDTH,
} from "./splitPane.js";
import {
  VIRTUAL_ALL_CASES_ID,
  VIRTUAL_UNFILED_ID,
} from "../../utils/treeUtils.jsx";

const items = [
  { id: "f1", type: "folder", parentId: null },
  { id: "f2", type: "folder", parentId: "f1" },
  { id: "f3", type: "folder", parentId: null },
  { id: "c1", type: "testcase", parentId: "f1" },
  { id: "c2", type: "testcase", parentId: "f2" },
  { id: "c3", type: "testcase", parentId: "f3" },
  { id: "c4", type: "testcase", parentId: null },
];

describe("resolveListContextId", () => {
  it("opens the folder list when a folder is selected", () => {
    expect(resolveListContextId(null, "f1", items)).toBe("f1");
  });

  it("opens a virtual list when a virtual node is selected", () => {
    expect(resolveListContextId("f1", VIRTUAL_ALL_CASES_ID, items)).toBe(
      VIRTUAL_ALL_CASES_ID,
    );
  });

  it("keeps the current list when the case is inside it, including subfolders", () => {
    expect(resolveListContextId("f1", "c1", items)).toBe("f1");
    expect(resolveListContextId("f1", "c2", items)).toBe("f1");
    expect(resolveListContextId(VIRTUAL_ALL_CASES_ID, "c3", items)).toBe(
      VIRTUAL_ALL_CASES_ID,
    );
  });

  it("switches to the case's folder when the case is outside the current list", () => {
    expect(resolveListContextId("f1", "c3", items)).toBe("f3");
    expect(resolveListContextId(null, "c2", items)).toBe("f2");
  });

  it("uses the unfiled list for a case without a folder", () => {
    expect(resolveListContextId("f1", "c4", items)).toBe(VIRTUAL_UNFILED_ID);
    expect(resolveListContextId(VIRTUAL_UNFILED_ID, "c4", items)).toBe(
      VIRTUAL_UNFILED_ID,
    );
  });

  it("returns null when nothing is selected and keeps the list for unknown ids", () => {
    expect(resolveListContextId("f1", undefined, items)).toBeNull();
    expect(resolveListContextId("f1", "missing", items)).toBe("f1");
  });
});

describe("isCaseInList", () => {
  it("is false for an unfiled list and a filed case", () => {
    expect(isCaseInList(VIRTUAL_UNFILED_ID, items[3], items)).toBe(false);
  });
});

describe("clampDetailWidth", () => {
  it("keeps the width inside the allowed range", () => {
    expect(clampDetailWidth(10)).toBe(DETAIL_PANE_MIN_WIDTH);
    expect(clampDetailWidth(99999)).toBe(DETAIL_PANE_MAX_WIDTH);
    expect(clampDetailWidth(700)).toBe(700);
  });
});
