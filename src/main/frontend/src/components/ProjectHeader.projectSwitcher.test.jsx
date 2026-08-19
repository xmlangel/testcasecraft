import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectHeader from "./ProjectHeader.jsx";

const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));
vi.mock("../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));
vi.mock("../context/RAGContext.jsx", () => ({
  useRAG: () => ({ isRagEnabled: false }),
}));

const navModeState = { isSidebarMode: true };
vi.mock("../context/NavModeContext.jsx", () => ({
  useNavMode: () => navModeState,
}));

const appContext = {
  activeProject: { id: "p1", name: "AgensGraph", description: "" },
  testCases: [],
  testPlans: [],
  testExecutions: [],
  projects: [
    { id: "p1", name: "AgensGraph", code: "AGG" },
    { id: "p2", name: "AgensSQL", code: "AGS" },
  ],
};
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => appContext,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: { id: "u1", username: "kim" } }),
}));

// 프로젝트 설정 입구는 프로젝트 역할로 갈린다 — 역할을 바꿔 가며 확인한다.
const roleState = { projectRole: "PROJECT_MANAGER", loading: false };
vi.mock("../hooks/useProjectRole.js", () => ({
  default: () => roleState,
  useProjectRole: () => roleState,
}));

/**
 * 상단 브레드크럼의 프로젝트 선택기 테스트.
 *
 * 신규 레이아웃(좌측 메뉴)에서는 프로젝트 이름이 브레드크럼 첫 자리에 오고,
 * 그 이름을 눌러 다른 프로젝트로 바로 전환한다 — "AgensGraph / 대시보드" 형태.
 * 기존 레이아웃(가로 탭)은 "프로젝트 / AgensGraph / 대시보드" 를 유지해야 한다.
 * 여기서 어긋나면 프로젝트 이름이 두 번 나오거나 전환 입구가 사라진다.
 */
describe("ProjectHeader 프로젝트 선택기", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    navModeState.isSidebarMode = true;
    roleState.projectRole = "PROJECT_MANAGER";
  });

  const setup = (tabIndex = 0) =>
    render(<ProjectHeader tabIndex={tabIndex} onTabChange={vi.fn()} />);

  it("신규 레이아웃에서는 프로젝트 이름이 첫 크럼이고 가로 탭은 없다", () => {
    setup(0);
    expect(screen.getByTestId("breadcrumb-project-switcher")).toHaveTextContent(
      "AgensGraph",
    );
    expect(screen.queryByTestId("breadcrumb-project-link")).toBeNull();
    expect(screen.queryByLabelText("project tabs")).toBeNull();
    // 현재 영역이 그다음 크럼
    expect(screen.getByLabelText("breadcrumb")).toHaveTextContent("대시보드");
  });

  it("프로젝트 이름을 눌러 리스트에서 다른 프로젝트로 전환한다", () => {
    setup(0);
    fireEvent.click(screen.getByTestId("breadcrumb-project-switcher"));
    fireEvent.click(screen.getByTestId("breadcrumb-project-option-p2"));
    expect(navigateMock).toHaveBeenCalledWith("/projects/p2");
  });

  it("현재 프로젝트를 다시 고르면 이동하지 않는다", () => {
    setup(0);
    fireEvent.click(screen.getByTestId("breadcrumb-project-switcher"));
    fireEvent.click(screen.getByTestId("breadcrumb-project-option-p1"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("프로젝트 목록 보기로 목록 화면으로 나간다", () => {
    setup(0);
    fireEvent.click(screen.getByTestId("breadcrumb-project-switcher"));
    fireEvent.click(screen.getByTestId("breadcrumb-project-list-link"));
    expect(navigateMock).toHaveBeenCalledWith("/projects");
  });

  it("기존 레이아웃에서는 '프로젝트' 링크와 가로 탭을 유지한다", () => {
    navModeState.isSidebarMode = false;
    setup(1);
    expect(screen.getByTestId("breadcrumb-project-link")).toHaveTextContent(
      "프로젝트",
    );
    expect(screen.queryByTestId("breadcrumb-project-switcher")).toBeNull();
    expect(screen.getByLabelText("project tabs")).toBeInTheDocument();
    // 프로젝트 이름은 두 번째 크럼으로 남는다
    expect(screen.getByLabelText("breadcrumb")).toHaveTextContent("AgensGraph");
    expect(screen.getByLabelText("breadcrumb")).toHaveTextContent(
      "테스트케이스",
    );
  });

  it("프로젝트 설정 입구는 관리 역할과 시스템 관리자에게 보인다", () => {
    setup(0);
    expect(screen.getByTestId("open-project-settings-button")).toBeTruthy();

    roleState.projectRole = "LEAD_DEVELOPER";
    setup(0);
    expect(screen.getAllByTestId("open-project-settings-button").length).toBe(
      2,
    );

    // 시스템 관리자는 프로젝트 멤버가 아니어도 useProjectRole 이 ADMIN 센티널을 준다
    roleState.projectRole = "ADMIN";
    setup(0);
    expect(screen.getAllByTestId("open-project-settings-button").length).toBe(
      3,
    );
  });

  it("편집 역할이라도 관리 역할이 아니면 설정 입구가 없다", () => {
    roleState.projectRole = "DEVELOPER";
    setup(0);
    expect(screen.queryByTestId("open-project-settings-button")).toBeNull();

    roleState.projectRole = null;
    setup(0);
    expect(screen.queryByTestId("open-project-settings-button")).toBeNull();
  });

  it("영역 밖 화면은 currentLabel 을 마지막 크럼으로 쓰고 어느 탭도 고르지 않는다", () => {
    navModeState.isSidebarMode = false;
    render(
      <ProjectHeader
        tabIndex={false}
        onTabChange={vi.fn()}
        currentLabel="프로젝트 설정"
      />,
    );
    expect(screen.getByLabelText("breadcrumb")).toHaveTextContent(
      "프로젝트 설정",
    );
    // 탭은 그대로 보이되 선택된 항목이 없다 — 다른 영역으로 바로 나갈 수 있어야 한다
    expect(screen.getByLabelText("project tabs")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { selected: true })).toBeNull();
  });
});
