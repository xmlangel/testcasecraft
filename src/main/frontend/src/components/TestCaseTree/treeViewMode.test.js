import { describe, it, expect } from "vitest";
import {
  TREE_VIEW_MODE,
  resolveFolderOnlyView,
  toStoredMode,
} from "./treeViewMode.js";

// 회귀 가드: 기본값이 폴더 전용으로 돌아가면 처음 들어온 사용자가 케이스를 찾지
// 못한다. 트리에 폴더만 나와 펼칠 것이 없고, 케이스를 보려면 토글을 먼저 눌러야
// 하는데 그 토글이 있는 줄도 모른다.
describe("resolveFolderOnlyView", () => {
  it("저장된 값이 없으면 케이스까지 보인다", () => {
    expect(resolveFolderOnlyView({ selectable: false, stored: null })).toBe(
      false,
    );
    expect(
      resolveFolderOnlyView({ selectable: false, stored: undefined }),
    ).toBe(false);
  });

  it("폴더 전용을 골라 둔 사용자는 그대로 유지한다", () => {
    expect(
      resolveFolderOnlyView({
        selectable: false,
        stored: TREE_VIEW_MODE.FOLDERS,
      }),
    ).toBe(true);
  });

  it("전체를 골라 둔 사용자도 그대로 유지한다", () => {
    expect(
      resolveFolderOnlyView({ selectable: false, stored: TREE_VIEW_MODE.ALL }),
    ).toBe(false);
  });

  it("케이스를 골라야 하는 모드는 저장값과 무관하게 전체로 본다", () => {
    expect(
      resolveFolderOnlyView({
        selectable: true,
        stored: TREE_VIEW_MODE.FOLDERS,
      }),
    ).toBe(false);
  });

  it("알 수 없는 저장값은 기본값으로 다룬다", () => {
    expect(resolveFolderOnlyView({ selectable: false, stored: "예전값" })).toBe(
      false,
    );
  });
});

describe("toStoredMode", () => {
  it("모드를 저장 값으로 바꾼다", () => {
    expect(toStoredMode(true)).toBe(TREE_VIEW_MODE.FOLDERS);
    expect(toStoredMode(false)).toBe(TREE_VIEW_MODE.ALL);
  });

  it("저장한 값을 다시 읽으면 같은 모드가 된다", () => {
    for (const mode of [true, false]) {
      expect(
        resolveFolderOnlyView({
          selectable: false,
          stored: toStoredMode(mode),
        }),
      ).toBe(mode);
    }
  });
});
