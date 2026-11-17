import { describe, it, expect } from "vitest";
import {
  clampDetailWidth,
  fitDetailWidth,
  normalizePaneLayoutMode,
  resolvePaneLayout,
  isCaseInList,
  resolveListContextId,
  DETAIL_PANE_MIN_WIDTH,
  DETAIL_PANE_MAX_WIDTH,
  detailWidthForList,
  clampListWidth,
  CASE_LIST_DEFAULT_WIDTH,
  CASE_LIST_MIN_WIDTH,
  CASE_LIST_MAX_WIDTH,
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

describe("fitDetailWidth (ICT-491 가운데 칸 최소 폭)", () => {
  const base = { listMinWidth: 600, detailMinWidth: 380, gutterWidth: 18 };

  it("폭을 아직 재지 못했으면 원하는 폭을 그대로 쓴다", () => {
    expect(
      fitDetailWidth({ ...base, containerWidth: 0, desiredWidth: 640 }),
    ).toEqual({ width: 640, collapsed: false });
  });

  it("자리가 넉넉하면 원하는 폭을 쓴다", () => {
    expect(
      fitDetailWidth({ ...base, containerWidth: 1600, desiredWidth: 640 }),
    ).toEqual({ width: 640, collapsed: false });
  });

  it("모자라면 가운데 칸 최소 폭을 남기고 상세 칸을 줄인다", () => {
    // 1100 - 600 - 18 = 482
    expect(
      fitDetailWidth({ ...base, containerWidth: 1100, desiredWidth: 640 }),
    ).toEqual({ width: 482, collapsed: false });
  });

  it("상세 칸 최소 폭까지 줄여도 모자라면 접는다", () => {
    // 900 - 600 - 18 = 282 < 380
    expect(
      fitDetailWidth({ ...base, containerWidth: 900, desiredWidth: 640 }),
    ).toEqual({ width: 0, collapsed: true });
  });

  it("경계: 남는 폭이 상세 최소 폭과 같으면 접지 않는다", () => {
    expect(
      fitDetailWidth({ ...base, containerWidth: 998, desiredWidth: 640 }),
    ).toEqual({ width: 380, collapsed: false });
  });
});

describe("resolvePaneLayout (ICT-492 1단·2단·3단)", () => {
  const base = {
    desiredWidth: 640,
    listMinWidth: 600,
    detailMinWidth: 380,
    peekWidth: 280,
    gutterWidth: 18,
  };
  const layout = (containerWidth, mode = "auto") =>
    resolvePaneLayout({ ...base, containerWidth, mode });

  it("자동: 넓으면 3단으로 나란히 둔다", () => {
    expect(layout(1600)).toEqual({
      tier: 3,
      width: 640,
      overlay: false,
      downgraded: false,
    });
  });

  it("자동: 목록 최소 폭을 남길 수 없으면 2단으로 겹친다(폭 = 원하는 폭과 남는 폭 중 작은 값)", () => {
    // 3단 경계: 600 + 18 + 380 = 998. 997 이면 2단, 남는 폭 997 - 280 = 717 > 640
    expect(layout(997)).toEqual({
      tier: 2,
      width: 640,
      overlay: true,
      downgraded: false,
    });
    // 800 - 280 = 520 < 640
    expect(layout(800).width).toBe(520);
  });

  it("자동: 목록 왼쪽 노출 폭을 남기면 상세 최소 폭이 안 되면 1단으로 전체 폭을 덮는다", () => {
    // 2단 경계: 280 + 380 = 660
    expect(layout(660).tier).toBe(2);
    expect(layout(659)).toEqual({
      tier: 1,
      width: 659,
      overlay: true,
      downgraded: false,
    });
  });

  it("수동 2단은 넓어도 겹쳐 띄운다", () => {
    expect(layout(1600, "2")).toEqual({
      tier: 2,
      width: 640,
      overlay: true,
      downgraded: false,
    });
  });

  it("수동 1단은 넓어도 전체 폭으로 겹친다", () => {
    expect(layout(1600, "1")).toMatchObject({ tier: 1, width: 1600 });
  });

  it("수동 3단인데 폭이 모자라면 가로 스크롤 대신 2단으로 내려가고 표시한다", () => {
    expect(layout(900, "3")).toMatchObject({ tier: 2, downgraded: true });
    expect(layout(1600, "3")).toMatchObject({ tier: 3, downgraded: false });
  });

  it("수동 2단·3단인데 2단도 안 되면 1단으로 내려간다", () => {
    expect(layout(600, "3")).toMatchObject({ tier: 1, downgraded: true });
    expect(layout(600, "2")).toMatchObject({ tier: 1, downgraded: true });
  });

  it("자동은 내려가도 표시하지 않는다", () => {
    expect(layout(600).downgraded).toBe(false);
  });

  it("폭을 아직 재지 못했으면 고른 배치를 그대로 쓴다", () => {
    expect(layout(0)).toMatchObject({ tier: 3, width: 640, downgraded: false });
    expect(layout(0, "2")).toMatchObject({ tier: 2, overlay: true });
  });

  it("저장된 값이 이상하면 자동으로 읽는다", () => {
    expect(normalizePaneLayoutMode("2")).toBe("2");
    expect(normalizePaneLayoutMode(3)).toBe("3");
    expect(normalizePaneLayoutMode(null)).toBe("auto");
    expect(normalizePaneLayoutMode("4")).toBe("auto");
    expect(layout(1600, "garbage").tier).toBe(3);
  });
});

describe("resolvePaneLayout - 실행 화면 결과 칸 (ICT-492 ly-2)", () => {
  // 실행 화면: 가운데 칸 최소 640, 결과 칸 최소 560, 폭 조절 막대 6
  const exec = (containerWidth, mode = "auto") =>
    resolvePaneLayout({
      mode,
      containerWidth,
      desiredWidth: 640,
      listMinWidth: 640,
      detailMinWidth: 560,
      overlayMinWidth: 520,
      gutterWidth: 6,
    });

  it("가운데 칸과 결과 칸이 다 들어가면 3단으로 나란히 둔다", () => {
    expect(exec(1286)).toMatchObject({ tier: 3, width: 640, overlay: false });
    expect(exec(1206)).toMatchObject({ tier: 3, width: 560 });
  });

  it("나란히 둘 폭이 모자라면 결과 칸을 겹치고 케이스 목록 앞쪽 340px 을 남긴다", () => {
    expect(exec(1205)).toMatchObject({ tier: 2, overlay: true, width: 640 });
    expect(exec(900)).toMatchObject({ tier: 2, width: 560 });
  });

  it("겹친 칸은 나란히 둘 때보다 좁은 최소 폭(520)까지 2단을 쓴다", () => {
    // 1280px 화면: 실행 목록이 펼쳐진 칸 폭 894 → 겹친 칸 554
    expect(exec(894)).toMatchObject({ tier: 2, width: 554 });
    expect(exec(860)).toMatchObject({ tier: 2, width: 520 });
  });

  it("겹쳐도 결과 칸 최소 폭이 안 되면 1단으로 전체 폭을 덮는다", () => {
    expect(exec(859)).toMatchObject({ tier: 1, width: 859, overlay: true });
  });
});

describe("detailWidthForList (ICT-494 tl-1 상세가 나머지를 쓴다)", () => {
  const base = { listWidth: 450, detailMinWidth: 380, fallbackWidth: 640 };

  it("폭을 아직 재지 못했으면 기본 폭을 쓴다", () => {
    expect(detailWidthForList({ ...base, containerWidth: 0 })).toBe(640);
  });

  it("1600px 화면(트리 300)에서 상세 칸이 목록보다 넓다", () => {
    // 분할 칸 폭 약 1150 = 1600 - 아이콘 메뉴·트리·여백. 1150 - 450 - 18 = 682
    const width = detailWidthForList({ ...base, containerWidth: 1150 });
    expect(width).toBe(682);
    expect(width).toBeGreaterThan(base.listWidth);
  });

  it("상세 최소 폭 아래로는 바라지 않는다", () => {
    expect(detailWidthForList({ ...base, containerWidth: 700 })).toBe(380);
  });

  it("자리가 좁으면 목록을 먼저 줄여 상세가 목록보다 좁아지지 않게 한다", () => {
    // 1280px 화면 분할 칸 약 844. 반으로 나누면 413 이라 목록을 413 으로 줄이고 상세도 413
    expect(detailWidthForList({ ...base, containerWidth: 844 })).toBe(413);
    // 800px 칸도 반으로 나눈다: 목록 391 · 상세 800 - 391 - 18 = 391
    expect(detailWidthForList({ ...base, containerWidth: 800 })).toBe(391);
  });

  it("목록 폭을 늘리면 그만큼 상세가 줄어든다", () => {
    expect(
      detailWidthForList({ ...base, listWidth: 550, containerWidth: 1150 }),
    ).toBe(582);
  });
});

describe("clampListWidth", () => {
  it("목록 폭을 허용 범위 안에 둔다", () => {
    expect(clampListWidth(10)).toBe(CASE_LIST_MIN_WIDTH);
    expect(clampListWidth(99999)).toBe(CASE_LIST_MAX_WIDTH);
    expect(clampListWidth(CASE_LIST_DEFAULT_WIDTH)).toBe(450);
  });
});

describe("케이스 화면 1600px 배치 (ICT-494 tl-1)", () => {
  it("자동 배치에서 3단으로 나란히 두고 상세가 세 칸 중 가장 넓다", () => {
    const containerWidth = 1150;
    const desiredWidth = detailWidthForList({
      containerWidth,
      listWidth: CASE_LIST_DEFAULT_WIDTH,
      detailMinWidth: DETAIL_PANE_MIN_WIDTH,
      fallbackWidth: 640,
    });
    const layout = resolvePaneLayout({
      containerWidth,
      desiredWidth,
      listMinWidth: CASE_LIST_MIN_WIDTH,
      detailMinWidth: DETAIL_PANE_MIN_WIDTH,
    });
    expect(layout.tier).toBe(3);
    // 트리 300 · 목록 450 보다 넓다
    expect(layout.width).toBeGreaterThan(450);
    expect(layout.width).toBeGreaterThan(300);
  });
});
