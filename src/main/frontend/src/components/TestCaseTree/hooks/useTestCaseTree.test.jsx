import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTestCaseTree } from "./useTestCaseTree.jsx";

/**
 * ICT-431: 검색으로 좁힌 상태의 선택 동작 회귀 테스트.
 *
 * 배경: 테스트 플랜 수정 화면은 이 트리를 selectable 모드로 쓴다. 검색으로 몇 건만
 * 걸러놓고 전체 선택을 눌렀을 때 프로젝트의 모든 케이스가 플랜에 담기는 문제가 있었다
 * (전체 선택 대상이 검색어를 보지 않았다). 폴더를 체크할 때도 화면에 없는 하위 케이스가
 * 함께 담겼다. 검색 결과와 선택 대상이 어긋나면 사용자는 플랜에 무엇이 들어갔는지
 * 화면에서 확인할 수 없다.
 */
describe("useTestCaseTree — 검색 중 선택 (ICT-431)", () => {
  //  결제(f1)
  //    └ 카드 결제 성공 (c1, tag=smoke)
  //    └ 카드 결제 실패 (c2)
  //  인증(f2)
  //    └ 로그인 잠금 (c3, tag=smoke)
  const buildTestCases = () => [
    { id: "f1", projectId: "p", type: "folder", name: "결제", parentId: null },
    {
      id: "c1",
      projectId: "p",
      type: "testcase",
      name: "카드 결제 성공",
      parentId: "f1",
      tags: ["smoke"],
    },
    {
      id: "c2",
      projectId: "p",
      type: "testcase",
      name: "카드 결제 실패",
      parentId: "f1",
      tags: [],
    },
    { id: "f2", projectId: "p", type: "folder", name: "인증", parentId: null },
    {
      id: "c3",
      projectId: "p",
      type: "testcase",
      name: "로그인 잠금",
      parentId: "f2",
      tags: ["smoke"],
    },
  ];

  const setup = (overrides = {}) => {
    const testCases = overrides.testCases ?? buildTestCases();
    const onSelectionChange = overrides.onSelectionChange ?? vi.fn();
    const { testCases: _omitCases, ...rest } = overrides;
    const view = renderHook((props) => useTestCaseTree(props), {
      initialProps: {
        projectId: "p",
        testCases,
        fetchProjectTestCases: vi.fn(),
        selectable: true,
        selectedIds: undefined, // 외부 동기화 없이 훅 내부 상태만 본다
        onSelectionChange,
        selectedTestCaseId: null,
        setActiveTestCase: vi.fn(),
        onSelectTestCase: undefined,
        userRole: "PROJECT_MANAGER",
        filterText: "",
        folderOnlyView: false,
        ...rest,
      },
    });
    return { ...view, onSelectionChange };
  };

  const checkAll = (result, checked) =>
    act(() => {
      result.current.handleCheckAll({ target: { checked } });
    });

  it("검색이 없으면 전체 선택은 프로젝트의 모든 케이스 (폴더 제외)", () => {
    const { result, onSelectionChange } = setup();

    checkAll(result, true);

    expect(result.current.checkedIds.sort()).toEqual(["c1", "c2", "c3"]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(["c1", "c2", "c3"]),
    );
  });

  it("검색 중 전체 선택은 걸린 케이스만 담는다", () => {
    const { result } = setup({ filterText: "smoke" });

    checkAll(result, true);

    expect(result.current.checkedIds.sort()).toEqual(["c1", "c3"]);
  });

  it("검색 밖에서 골라둔 선택은 검색 후 전체 선택에도 남는다", () => {
    const { result, rerender } = setup();

    // "결제 실패" 만 먼저 고른 뒤 smoke 로 좁혀 전체 선택
    act(() => {
      result.current.updateCheckedState("c2", true);
    });
    rerender({
      projectId: "p",
      testCases: buildTestCases(),
      fetchProjectTestCases: vi.fn(),
      selectable: true,
      selectedIds: undefined,
      onSelectionChange: vi.fn(),
      selectedTestCaseId: null,
      setActiveTestCase: vi.fn(),
      onSelectTestCase: undefined,
      userRole: "PROJECT_MANAGER",
      filterText: "smoke",
      folderOnlyView: false,
    });
    checkAll(result, true);

    expect(result.current.checkedIds.sort()).toEqual(["c1", "c2", "c3"]);
  });

  it("검색 중 전체 해제는 걸린 것만 뺀다", () => {
    const { result } = setup({ filterText: "smoke" });

    checkAll(result, true);
    act(() => {
      result.current.updateCheckedState("c2", true); // 검색 밖 항목을 직접 추가
    });
    checkAll(result, false);

    expect(result.current.checkedIds).toEqual(["c2"]);
  });

  it("검색 중 폴더 체크는 걸린 하위 케이스만 따라온다", () => {
    const { result } = setup({ filterText: "smoke" });

    act(() => {
      result.current.updateCheckedState("f1", true);
    });

    // f1(클릭한 노드) + c1(smoke) 만. c2 는 검색에 안 걸려 제외
    expect(result.current.checkedIds.sort()).toEqual(["c1", "f1"]);
  });

  it("검색 결과를 다 고르면 전체 선택 체크박스가 채워진다", () => {
    const { result } = setup({ filterText: "smoke" });

    expect(result.current.isAllChecked).toBe(false);
    checkAll(result, true);
    expect(result.current.isAllChecked).toBe(true);
    expect(result.current.isIndeterminate).toBe(false);
  });

  it("검색 결과 카운트는 걸린 수를 센다", () => {
    const { result } = setup({ filterText: "결제" });

    // 폴더 "결제" 가 걸리면 그 안의 케이스 2건이 선택 대상
    expect(result.current.matchedFolderCount).toBe(1);
    expect(result.current.matchedTestCaseCount).toBe(2);
    expect(result.current.totalTestCaseCount).toBe(3);
    expect(result.current.checkTargetIds.sort()).toEqual(["c1", "c2"]);
  });
});
