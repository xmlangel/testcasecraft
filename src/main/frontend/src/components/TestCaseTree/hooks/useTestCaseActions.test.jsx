import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTestCaseActions } from "./useTestCaseActions.jsx";

/**
 * moveNodeOrder(순서 변경 모드의 위/아래 이동) 회귀 테스트.
 *
 * 배경: "폴더 전용 트리" 도입 후 트리에는 폴더만 표시되는데, moveNodeOrder가 형제를
 * 폴더+케이스 전체에서 계산해 위/아래 이동이 트리에 보이지 않는 케이스와 swap 되어
 * 시각적으로 아무 변화가 없던 회귀가 있었다. 폴더 전용 뷰에서는 같은 타입(폴더)의
 * 형제만 순서 대상이 되어야 한다.
 */
describe("useTestCaseActions.moveNodeOrder (트리 순서 변경)", () => {
  // 한 부모(P) 아래에 폴더와 케이스가 번갈아 배치된 상태
  //   caseX(1) · folderA(2) · caseY(3) · folderB(4)
  const buildTree = () => [
    { id: "P", parentId: null, type: "folder", displayOrder: 1 },
    { id: "cx", parentId: "P", type: "testcase", displayOrder: 1 },
    { id: "fa", parentId: "P", type: "folder", displayOrder: 2 },
    { id: "cy", parentId: "P", type: "testcase", displayOrder: 3 },
    { id: "fb", parentId: "P", type: "folder", displayOrder: 4 },
  ];

  const setup = (overrides = {}) => {
    // 참조 안정화: 렌더 콜백 밖에서 한 번만 생성한다.
    // (매 렌더마다 새 배열을 넘기면 orderMap 동기화 useEffect가 무한 루프에 빠진다)
    const filteredTestCases = overrides.filteredTestCases ?? buildTree();
    const { filteredTestCases: _omit, ...rest } = overrides;
    return renderHook(() =>
      useTestCaseActions({
        projectId: "proj",
        filteredTestCases,
        addTestCase: vi.fn(),
        updateTestCase: vi.fn(),
        updateTestCaseLocal: vi.fn(),
        deleteTestCase: vi.fn(),
        fetchProjectTestCases: vi.fn(),
        projectRole: "PROJECT_MANAGER", // 편집 가능 role
        t: (_key, def) => def,
        setExpanded: vi.fn(),
        checkedIds: [],
        setCheckedIds: vi.fn(),
        inputMode: undefined,
        setInputMode: vi.fn(),
        onSelectTestCase: vi.fn(),
        ...rest,
      }),
    );
  };

  it("orderMap은 마운트 시 displayOrder로 초기화된다", () => {
    const { result } = setup({ folderOnlyView: true });
    expect(result.current.orderMap).toMatchObject({
      cx: 1,
      fa: 2,
      cy: 3,
      fb: 4,
    });
  });

  it("폴더 전용 뷰: 폴더 위로 이동 시 사이의 케이스를 건너뛰고 인접 폴더와 순서를 교환한다", () => {
    const { result } = setup({ folderOnlyView: true });

    act(() => {
      result.current.moveNodeOrder("fb", "up");
    });

    // fb 는 fa 와만 교환 — 사이의 케이스(cy)는 건드리지 않는다
    expect(result.current.orderMap.fb).toBe(2);
    expect(result.current.orderMap.fa).toBe(4);
    // 회귀 핵심: 폴더 fb 가 폴더 fa 보다 앞 순서가 되어 트리에서 실제로 이동한다
    expect(result.current.orderMap.fb).toBeLessThan(result.current.orderMap.fa);
    // 케이스 순서는 유지
    expect(result.current.orderMap.cx).toBe(1);
    expect(result.current.orderMap.cy).toBe(3);
    expect(result.current.orderChanged).toBe(true);
  });

  it("전체 뷰: 폴더/케이스가 모두 트리에 보이므로 인접 항목(케이스 포함)과 교환한다", () => {
    const { result } = setup({ folderOnlyView: false });

    act(() => {
      result.current.moveNodeOrder("fb", "up");
    });

    // 전체 뷰에서는 fb 바로 위 항목이 케이스 cy 이므로 그것과 교환(레거시 동작 보존)
    expect(result.current.orderMap.fb).toBe(3);
    expect(result.current.orderMap.cy).toBe(4);
  });

  it("VIEWER 는 순서를 변경할 수 없다(fail-closed)", () => {
    const { result } = setup({ folderOnlyView: true, projectRole: "VIEWER" });

    act(() => {
      result.current.moveNodeOrder("fb", "up");
    });

    // 변경 없음
    expect(result.current.orderMap.fb).toBe(4);
    expect(result.current.orderMap.fa).toBe(2);
    expect(result.current.orderChanged).toBe(false);
  });
});
