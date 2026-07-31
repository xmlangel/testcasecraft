import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectSidebar from "./ProjectSidebar.jsx";

vi.mock("../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

const navModeState = {
  sidebarCollapsed: false,
  toggleSidebarCollapsed: vi.fn(),
};
vi.mock("../context/NavModeContext.jsx", () => ({
  useNavMode: () => navModeState,
}));

const appContextValue = { value: undefined };
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => appContextValue.value,
}));

/**
 * 좌측 사이드바 네비게이션(가로 탭의 대체 표현) 테스트.
 *
 * 사용자가 두 구조 중 하나를 고르는 기능이라, 어느 쪽을 골라도 항목 순서와
 * 선택 값(tabIndex)이 같아야 한다. 특히 RAG 가 꺼지면 탐색 세션의 tabIndex 가
 * 6으로 당겨지는 기존 규칙(App.jsx EXPLORATORY_TAB)을 사이드바도 지켜야 한다.
 * 여기서 어긋나면 사이드바에서 고른 항목과 본문에 그려지는 화면이 달라진다.
 */
describe("ProjectSidebar", () => {
  beforeEach(() => {
    navModeState.sidebarCollapsed = false;
    navModeState.toggleSidebarCollapsed = vi.fn();
    appContextValue.value = undefined;
  });

  const setup = (props = {}) =>
    render(
      <ProjectSidebar
        tabIndex={0}
        onSelect={vi.fn()}
        counts={{ testCases: 964, testPlans: 3, testExecutions: 7 }}
        {...props}
      />,
    );

  it("기본 6개 항목만 보인다 (RAG·탐색 세션 미노출)", () => {
    setup();
    for (const id of [
      "tab-dashboard",
      "tab-testcases",
      "tab-testplans",
      "tab-executions",
      "tab-results",
      "tab-automation",
    ]) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
    expect(screen.queryByTestId("tab-rag")).toBeNull();
    expect(screen.queryByTestId("tab-exploratory")).toBeNull();
  });

  it("개수 배지는 가로 탭과 같은 값을 보여준다", () => {
    setup();
    expect(screen.getByTestId("tab-testcases")).toHaveTextContent("964");
    expect(screen.getByTestId("tab-testplans")).toHaveTextContent("3");
    expect(screen.getByTestId("tab-executions")).toHaveTextContent("7");
  });

  it("RAG 활성 시 탐색 세션의 선택 값은 7", () => {
    const onSelect = vi.fn();
    setup({ onSelect, isRagEnabled: true, showExploratory: true });

    fireEvent.click(screen.getByTestId("tab-rag"));
    expect(onSelect).toHaveBeenLastCalledWith(6);

    fireEvent.click(screen.getByTestId("tab-exploratory"));
    expect(onSelect).toHaveBeenLastCalledWith(7);
  });

  it("RAG 비활성 시 탐색 세션의 선택 값은 6으로 당겨진다", () => {
    const onSelect = vi.fn();
    setup({ onSelect, isRagEnabled: false, showExploratory: true });

    expect(screen.queryByTestId("tab-rag")).toBeNull();
    fireEvent.click(screen.getByTestId("tab-exploratory"));
    expect(onSelect).toHaveBeenLastCalledWith(6);
  });

  it("현재 항목만 선택 상태로 표시한다", () => {
    setup({ tabIndex: 2 });
    expect(screen.getByTestId("tab-testplans").className).toMatch(
      /Mui-selected/,
    );
    expect(screen.getByTestId("tab-dashboard").className).not.toMatch(
      /Mui-selected/,
    );
  });

  it("접힌 상태에서는 라벨을 숨기고 아이콘만 남긴다", () => {
    navModeState.sidebarCollapsed = true;
    setup();
    expect(screen.getByTestId("tab-testcases")).not.toHaveTextContent(
      "테스트케이스",
    );
    // 마우스를 올렸을 때 이름을 알 수 있어야 한다
    expect(screen.getByTestId("tab-testcases")).toHaveAttribute(
      "title",
      "테스트케이스",
    );
  });

  it("접기 버튼이 모드 컨텍스트의 토글을 부른다", () => {
    setup();
    fireEvent.click(screen.getByTestId("project-sidebar-collapse-toggle"));
    expect(navModeState.toggleSidebarCollapsed).toHaveBeenCalledTimes(1);
  });

  it("counts 없이도 컨텍스트에서 개수를 뽑는다", () => {
    appContextValue.value = {
      activeProject: { id: "p1" },
      testCases: [
        { id: "c1", type: "testcase", projectId: "p1" },
        { id: "c2", type: "testcase", projectId: "p1" },
        { id: "f1", type: "folder", projectId: "p1" },
        { id: "c3", type: "testcase", projectId: "other" },
      ],
      testPlans: [{ id: "tp1", projectId: "p1" }],
      testExecutions: [],
    };
    setup({ counts: undefined });
    expect(screen.getByTestId("tab-testcases")).toHaveTextContent("2");
    expect(screen.getByTestId("tab-testplans")).toHaveTextContent("1");
    expect(screen.getByTestId("tab-executions")).toHaveTextContent("0");
  });

  it("컨텍스트가 없어도 죽지 않는다 (프로바이더 밖 렌더)", () => {
    appContextValue.value = undefined;
    expect(() => setup({ counts: undefined })).not.toThrow();
    expect(screen.getByTestId("tab-testcases")).toHaveTextContent("0");
  });
});
