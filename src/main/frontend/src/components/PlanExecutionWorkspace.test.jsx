import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlanExecutionWorkspace from "./PlanExecutionWorkspace.jsx";

vi.mock("../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (_key, def, vars) =>
      vars
        ? String(def).replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""))
        : def,
  }),
}));

const appContext = {
  testPlans: [
    {
      id: "tp1",
      name: "회귀 플랜",
      projectId: "p1",
      testCaseIds: ["c1", "c2"],
    },
    { id: "tp2", name: "스모크 플랜", projectId: "p1", testCaseIds: [] },
    { id: "tp3", name: "다른 프로젝트", projectId: "other" },
  ],
  testPlansLoading: false,
  testExecutions: [
    {
      id: "ex1",
      name: "1차 실행",
      projectId: "p1",
      testPlanId: "tp1",
      status: "IN_PROGRESS",
    },
    {
      id: "ex2",
      name: "2차 실행",
      projectId: "p1",
      testPlanId: "tp2",
      status: "COMPLETED",
    },
  ],
};
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => appContext,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: { id: "u1", username: "kim" } }),
}));

// 쓰기 입구는 프로젝트 역할로 갈린다 — 역할을 바꿔 가며 확인한다.
const roleState = { projectRole: "PROJECT_MANAGER", loading: false };
vi.mock("../hooks/useProjectRole.js", () => ({
  default: () => roleState,
  useProjectRole: () => roleState,
}));

// 플랜 편집·실행 상세는 별도 컴포넌트라 여기서는 자리만 확인한다
vi.mock("./TestPlanForm.jsx", () => ({
  default: ({ testPlanId, inline }) => (
    <div data-testid="stub-plan-form">
      plan={testPlanId} inline={String(Boolean(inline))}
    </div>
  ),
}));
vi.mock("./TestExecutionForm.jsx", () => ({
  default: ({ executionId, initialTestPlanId }) => (
    <div data-testid="stub-execution-form">
      exec={String(executionId)} plan={String(initialTestPlanId)}
    </div>
  ),
}));

const getMock = vi.fn();
vi.mock("../services/apiService.js", () => ({
  default: {
    get: (...args) => getMock(...args),
  },
}));

/**
 * 플랜 → 실행 작업 화면(목록 + 상세 2단) 테스트.
 *
 * 기존에는 플랜을 고르면 팝업이 화면을 덮고, 실행을 고르면 상단 바·좌측 메뉴가 없는
 * 전체 화면으로 빠졌다. 그래서 플랜을 오가며 실행을 만들거나 결과를 보려면 매번
 * 닫고 다시 열어야 했다. 이 화면은 왼쪽 목록·오른쪽 상세로 맥락을 유지하고,
 * 각 단을 접을 수 있다. 여기서 깨지면 사용자는 다시 팝업을 닫아가며 작업해야 한다.
 */
describe("PlanExecutionWorkspace", () => {
  beforeEach(() => {
    roleState.projectRole = "PROJECT_MANAGER";
    getMock.mockReset();
    getMock.mockResolvedValue({
      json: async () => [
        {
          id: "ex1",
          name: "1차 실행",
          projectId: "p1",
          testPlanId: "tp1",
          status: "IN_PROGRESS",
        },
      ],
    });
  });

  const setup = (props = {}) =>
    render(<PlanExecutionWorkspace mode="plans" projectId="p1" {...props} />);

  it("플랜 모드는 현재 프로젝트의 플랜만 1열에 보여준다", () => {
    setup();
    expect(
      screen.getByTestId("workspace-primary-item-tp1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("workspace-primary-item-tp2"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("workspace-primary-item-tp3")).toBeNull();
  });

  it("플랜을 고르면 팝업 대신 상세 열에 플랜이 열린다", async () => {
    setup();
    expect(screen.queryByTestId("stub-plan-form")).toBeNull();

    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));

    await waitFor(() =>
      expect(screen.getByTestId("stub-plan-form")).toHaveTextContent(
        "plan=tp1",
      ),
    );
    // 팝업이 아니라 인라인으로 붙는다
    expect(screen.getByTestId("stub-plan-form")).toHaveTextContent(
      "inline=true",
    );
  });

  it("플랜을 고르면 트리에서 그 플랜의 실행이 펼쳐진다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));

    await waitFor(() =>
      expect(getMock).toHaveBeenCalledWith(
        "/api/test-executions?testPlanId=tp1",
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument(),
    );
  });

  it("실행을 고르면 상세 열이 실행 상세로 바뀐다 (전체 화면으로 나가지 않는다)", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
    await waitFor(() =>
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("workspace-execution-item-ex1"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toHaveTextContent(
        "exec=ex1",
      ),
    );
  });

  it("실행 만들기는 고른 플랜을 물려받는다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp2"));
    await waitFor(() =>
      expect(screen.getByTestId("workspace-new-execution")).toBeEnabled(),
    );

    fireEvent.click(screen.getByTestId("workspace-new-execution"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toHaveTextContent(
        "plan=tp2",
      ),
    );
  });

  it("플랜을 고르기 전에는 실행 섹션이 없다 (안내만 보인다)", () => {
    setup();
    expect(screen.queryByTestId("workspace-runs-section")).toBeNull();
    expect(screen.queryByTestId("workspace-new-execution")).toBeNull();
    expect(screen.getByTestId("workspace-detail-pane")).toHaveTextContent(
      "플랜을 고르면",
    );
  });

  it("이름으로 목록을 좁힌다", () => {
    setup();
    fireEvent.change(screen.getByTestId("workspace-primary-filter"), {
      target: { value: "스모크" },
    });
    expect(screen.queryByTestId("workspace-primary-item-tp1")).toBeNull();
    expect(
      screen.getByTestId("workspace-primary-item-tp2"),
    ).toBeInTheDocument();
  });

  // 두 영역이 같은 트리를 공유했을 때 사이드바에서 어디에 들어왔는지 알 수 없었다.
  // 실행 영역은 플랜을 거치지 않고 실행부터 보여야 한다.
  it("실행 영역은 프로젝트의 실행을 평면 목록으로 보여준다", async () => {
    setup({ mode: "executions" });
    await waitFor(() =>
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument(),
    );
    // 플랜 행·가지 토글은 실행 영역에 없다
    expect(screen.queryByTestId("workspace-primary-item-tp1")).toBeNull();
    expect(screen.queryByTestId("workspace-plan-toggle-tp1")).toBeNull();
    expect(getMock).toHaveBeenCalledWith(
      "/api/test-executions/by-project/p1?page=0&size=50",
    );

    fireEvent.click(screen.getByTestId("workspace-execution-item-ex1"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toHaveTextContent(
        "exec=ex1",
      ),
    );
  });

  it("실행 행에 소속 플랜 이름을 표시한다 (누를 데는 없다)", async () => {
    setup({ mode: "executions" });
    const planName = await waitFor(() =>
      screen.getByTestId("workspace-execution-plan-name-ex1"),
    );
    expect(planName).toHaveTextContent("회귀 플랜");
    expect(planName.tagName).toBe("SPAN");
    expect(planName.closest("a")).toBeNull();
    expect(planName.querySelector("button")).toBeNull();
  });

  it("실행 영역의 이름 검색은 서버에 넘긴다", async () => {
    setup({ mode: "executions" });
    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId("workspace-primary-filter"), {
      target: { value: "1차" },
    });
    await waitFor(() =>
      expect(getMock).toHaveBeenLastCalledWith(
        "/api/test-executions/by-project/p1?page=0&size=50&name=1%EC%B0%A8",
      ),
    );
  });

  it("가지를 다시 누르면 접힌다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-plan-toggle-tp1"));
    await waitFor(() =>
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("workspace-plan-toggle-tp1"));
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-execution-item-ex1")).toBeNull(),
    );
  });

  it("트리 단을 접으면 필터가 사라지고 다시 펴면 돌아온다", () => {
    setup();
    expect(screen.getByTestId("workspace-primary-filter")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workspace-list-collapse-toggle"));
    expect(screen.queryByTestId("workspace-primary-filter")).toBeNull();
    expect(screen.queryByTestId("workspace-primary-item-tp1")).toBeNull();

    fireEvent.click(screen.getByTestId("workspace-list-collapse-toggle"));
    expect(screen.getByTestId("workspace-primary-filter")).toBeInTheDocument();
  });

  it("실행 상세에서 플랜으로 돌아온다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
    await waitFor(() =>
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("workspace-execution-item-ex1"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("workspace-back-to-plan"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-plan-form")).toHaveTextContent(
        "plan=tp1",
      ),
    );
  });

  it("URL 로 들어온 실행 선택을 이어받는다 (전체 화면 대신 이 자리에서 열림)", async () => {
    setup({ mode: "executions", initialExecutionId: "ex1" });
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toHaveTextContent(
        "exec=ex1",
      ),
    );
  });

  it("실행 목록 조회가 실패하면 알린다", async () => {
    getMock.mockRejectedValue(new Error("boom"));
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
    await waitFor(() =>
      expect(
        screen.getByText(/실행 목록을 불러오지 못했습니다/),
      ).toBeInTheDocument(),
    );
  });

  it("조회 전용 역할에는 실행 만들기 입구가 없다", async () => {
    roleState.projectRole = "VIEWER";
    setup({ mode: "plans" });
    fireEvent.click(await screen.findByText("회귀 플랜"));
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-execution")).toBeNull(),
    );
  });

  it("결과만 기록하는 역할에도 실행 만들기 입구가 없다", async () => {
    roleState.projectRole = "TESTER";
    setup({ mode: "plans" });
    fireEvent.click(await screen.findByText("회귀 플랜"));
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-execution")).toBeNull(),
    );
  });
});
