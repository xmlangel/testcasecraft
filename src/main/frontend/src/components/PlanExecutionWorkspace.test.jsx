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
  default: ({ testPlanId, inline, startInViewMode, onSave, onCancel }) => (
    <div data-testid="stub-plan-form">
      plan={String(testPlanId)} inline={String(Boolean(inline))} view=
      {String(Boolean(startInViewMode))}
      <button type="button" onClick={() => onSave?.("tp9")}>
        저장 흉내
      </button>
      <button type="button" onClick={() => onCancel?.()}>
        취소 흉내
      </button>
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
const deleteMock = vi.fn();
vi.mock("../services/apiService.js", () => ({
  default: {
    get: (...args) => getMock(...args),
    delete: (...args) => deleteMock(...args),
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
    deleteMock.mockReset();
    deleteMock.mockResolvedValue({ ok: true });
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

  // ICT-510: 목록 머리 줄(260px)에 제목·건수·글자 버튼이 함께 들어가 제목이
  // "테스트 플...", "테스트실..." 로 잘렸다. 만들기 버튼을 아이콘으로 바꾸고 제목은 줄지 않게 한다.
  it("플랜 목록 머리: 제목은 줄지 않고, 만들기 입구는 이름 있는 아이콘 버튼이다", () => {
    setup({ mode: "plans" });
    const title = screen.getByTestId("workspace-list-title");
    expect(title).toHaveTextContent("테스트플랜");
    expect(title).toHaveStyle({ flexShrink: "0" });
    const create = screen.getByTestId("workspace-new-plan");
    expect(create).toHaveAccessibleName("플랜 만들기");
    // 글자 라벨은 버튼 안에 그리지 않는다(이름은 aria-label·툴팁으로 전달)
    expect(create).not.toHaveTextContent("플랜 만들기");
  });

  it("실행 목록 머리: 제목은 줄지 않고, 만들기 입구는 이름 있는 아이콘 버튼이다", async () => {
    setup({ mode: "executions" });
    const create = await screen.findByTestId("workspace-new-execution-top");
    expect(create).toHaveAccessibleName("실행 만들기");
    expect(create).not.toHaveTextContent("실행 만들기");
    const title = screen.getByTestId("workspace-list-title");
    expect(title).toHaveTextContent("테스트실행");
    expect(title).toHaveStyle({ flexShrink: "0" });
  });

  it("편집 가능한 역할에는 플랜 만들기 입구가 있다", () => {
    setup({ mode: "plans" });
    expect(screen.getByTestId("workspace-new-plan")).toBeInTheDocument();
  });

  it("플랜 만들기를 누르면 상세 열에 빈 플랜 폼이 열린다", async () => {
    setup({ mode: "plans" });
    fireEvent.click(screen.getByTestId("workspace-new-plan"));
    const form = await screen.findByTestId("stub-plan-form");
    expect(form).toHaveTextContent("plan=null");
    expect(form).toHaveTextContent("inline=true");
  });

  it("새 플랜을 저장하면 방금 만든 플랜이 상세 열에 열린다", async () => {
    setup({ mode: "plans" });
    fireEvent.click(screen.getByTestId("workspace-new-plan"));
    fireEvent.click(await screen.findByText("저장 흉내"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-plan-form")).toHaveTextContent(
        "plan=tp9",
      ),
    );
  });

  it("주소로 새 플랜 화면에 들어오면 빈 폼이 바로 열린다", async () => {
    setup({ mode: "plans", initialCreatePlan: true });
    const form = await screen.findByTestId("stub-plan-form");
    expect(form).toHaveTextContent("plan=null");
  });

  it("조회 전용 역할에는 플랜 만들기 입구가 없다", async () => {
    roleState.projectRole = "VIEWER";
    setup({ mode: "plans" });
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-plan")).toBeNull(),
    );
  });

  it("결과만 기록하는 역할에도 플랜 만들기 입구가 없다", async () => {
    roleState.projectRole = "TESTER";
    setup({ mode: "plans" });
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-plan")).toBeNull(),
    );
  });

  it("실행 영역에는 플랜 만들기 입구가 없다", async () => {
    setup({ mode: "executions" });
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-plan")).toBeNull(),
    );
  });

  it("실행 영역에도 실행 만들기 입구가 있다", async () => {
    setup({ mode: "executions" });
    expect(
      await screen.findByTestId("workspace-new-execution-top"),
    ).toBeInTheDocument();
  });

  it("실행 영역에서는 플랜을 고르지 않아도 실행 폼이 열린다", async () => {
    setup({ mode: "executions" });
    fireEvent.click(await screen.findByTestId("workspace-new-execution-top"));
    const form = await screen.findByTestId("stub-execution-form");
    expect(form).toHaveTextContent("exec=null");
  });

  it("조회 전용 역할에는 실행 영역의 실행 만들기 입구도 없다", async () => {
    roleState.projectRole = "VIEWER";
    setup({ mode: "executions" });
    await waitFor(() =>
      expect(screen.queryByTestId("workspace-new-execution-top")).toBeNull(),
    );
  });

  it("실행을 열어 본 뒤 만들기를 눌러도 직전 실행의 플랜을 물려받지 않는다", async () => {
    setup({ mode: "executions" });
    fireEvent.click(await screen.findByText("1차 실행"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-execution-form")).toHaveTextContent(
        "exec=ex1",
      ),
    );
    fireEvent.click(screen.getByTestId("workspace-new-execution-top"));
    const form = await screen.findByTestId("stub-execution-form");
    expect(form).toHaveTextContent("exec=null");
    expect(form).toHaveTextContent("plan=null");
  });

  it("주소로 새 플랜 화면에 들어온 뒤 취소하면 상위에도 알린다", async () => {
    const onExitCreatePlan = vi.fn();
    setup({ mode: "plans", initialCreatePlan: true, onExitCreatePlan });
    fireEvent.click(await screen.findByText("취소 흉내"));
    await waitFor(() => expect(onExitCreatePlan).toHaveBeenCalled());
  });

  it("생성 중이 아닐 때 플랜을 고르는 것은 상위에 알리지 않는다", async () => {
    const onExitCreatePlan = vi.fn();
    setup({ mode: "plans", onExitCreatePlan });
    fireEvent.click(await screen.findByText("회귀 플랜"));
    await waitFor(() =>
      expect(screen.getByTestId("stub-plan-form")).toHaveTextContent(
        "plan=tp1",
      ),
    );
    expect(onExitCreatePlan).not.toHaveBeenCalled();
  });

  // ICT-452: 세로 모드에는 실행 삭제 입구가 없어 가로 모드로 바꿔야만 지울 수 있었다.
  describe("실행 삭제 (ICT-452)", () => {
    it("실행 영역에서 확인 후 삭제하면 목록과 상세에서 빠진다", async () => {
      setup({ mode: "executions" });
      fireEvent.click(
        await screen.findByTestId("workspace-execution-item-ex1"),
      );
      await waitFor(() =>
        expect(screen.getByTestId("stub-execution-form")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByTestId("workspace-execution-menu-ex1"));
      fireEvent.click(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      );
      // 확인 전에는 지우지 않는다
      expect(deleteMock).not.toHaveBeenCalled();
      fireEvent.click(screen.getByTestId("workspace-execution-delete-confirm"));

      await waitFor(() =>
        expect(deleteMock).toHaveBeenCalledWith("/api/test-executions/ex1"),
      );
      await waitFor(() =>
        expect(screen.queryByTestId("workspace-execution-item-ex1")).toBeNull(),
      );
      expect(screen.queryByTestId("stub-execution-form")).toBeNull();
    });

    it("삭제 버튼을 눌러도 실행 상세가 열리지 않고, 취소하면 지우지 않는다", async () => {
      setup({ mode: "executions" });
      fireEvent.click(
        await screen.findByTestId("workspace-execution-menu-ex1"),
      );
      expect(screen.queryByTestId("stub-execution-form")).toBeNull();
      fireEvent.click(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      );
      expect(screen.queryByTestId("stub-execution-form")).toBeNull();

      fireEvent.click(screen.getByTestId("workspace-execution-delete-cancel"));
      await waitFor(() =>
        expect(
          screen.queryByTestId("workspace-execution-delete-confirm"),
        ).toBeNull(),
      );
      expect(deleteMock).not.toHaveBeenCalled();
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument();
    });

    it("플랜 트리 아래 실행도 지울 수 있다", async () => {
      setup();
      fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
      fireEvent.click(
        await screen.findByTestId("workspace-execution-menu-ex1"),
      );
      fireEvent.click(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      );
      fireEvent.click(screen.getByTestId("workspace-execution-delete-confirm"));

      await waitFor(() =>
        expect(deleteMock).toHaveBeenCalledWith("/api/test-executions/ex1"),
      );
      await waitFor(() =>
        expect(screen.queryByTestId("workspace-execution-item-ex1")).toBeNull(),
      );
    });

    it("삭제가 실패하면 창에 이유를 보여 주고 목록은 그대로 둔다", async () => {
      deleteMock.mockRejectedValue(
        new Error("이 작업을 수행할 권한이 없습니다."),
      );
      setup({ mode: "executions" });
      fireEvent.click(
        await screen.findByTestId("workspace-execution-menu-ex1"),
      );
      fireEvent.click(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      );
      fireEvent.click(screen.getByTestId("workspace-execution-delete-confirm"));

      expect(
        await screen.findByText("이 작업을 수행할 권한이 없습니다."),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("workspace-execution-item-ex1"),
      ).toBeInTheDocument();
    });

    it.each(["VIEWER", "TESTER"])(
      "%s 역할에는 삭제 입구가 없다",
      async (role) => {
        roleState.projectRole = role;
        setup({ mode: "executions" });
        await screen.findByTestId("workspace-execution-item-ex1");
        expect(
          screen.queryByTestId("workspace-execution-delete-ex1"),
        ).toBeNull();
        expect(screen.queryByTestId("workspace-execution-menu-ex1")).toBeNull();
      },
    );
  });

  // ICT-513: 휴지통을 항목마다 늘 보이지 않고 ⋮ 메뉴 안으로 옮긴다
  describe("실행 항목 메뉴 (ICT-513)", () => {
    it("실행 목록에는 삭제 버튼이 바로 보이지 않고, ⋮ 메뉴를 열어야 「삭제」가 나온다", async () => {
      setup({ mode: "executions" });
      const menuButton = await screen.findByTestId(
        "workspace-execution-menu-ex1",
      );
      expect(menuButton).toHaveAttribute(
        "aria-label",
        expect.stringContaining("실행 메뉴"),
      );
      expect(screen.queryByTestId("workspace-execution-delete-ex1")).toBeNull();

      fireEvent.click(menuButton);
      const item = await screen.findByTestId("workspace-execution-delete-ex1");
      expect(item).toHaveAttribute("role", "menuitem");
      expect(item).toHaveTextContent("삭제");
    });

    it("플랜 트리의 실행 항목도 ⋮ 메뉴 안에 삭제가 있다", async () => {
      setup();
      fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
      await screen.findByTestId("workspace-execution-menu-ex1");
      expect(screen.queryByTestId("workspace-execution-delete-ex1")).toBeNull();
      fireEvent.click(screen.getByTestId("workspace-execution-menu-ex1"));
      expect(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      ).toBeInTheDocument();
    });

    it("메뉴의 삭제를 눌러도 곧바로 지우지 않고 확인 창을 거친다", async () => {
      setup({ mode: "executions" });
      fireEvent.click(
        await screen.findByTestId("workspace-execution-menu-ex1"),
      );
      fireEvent.click(
        await screen.findByTestId("workspace-execution-delete-ex1"),
      );
      expect(
        await screen.findByTestId("workspace-execution-delete-confirm"),
      ).toBeInTheDocument();
      expect(deleteMock).not.toHaveBeenCalled();
      // 메뉴를 여닫는 동안 실행 상세가 열리지 않는다
      expect(screen.queryByTestId("stub-execution-form")).toBeNull();
    });
  });

  // ICT-513: 플랜을 누르면 수정 폼이 아니라 읽기 화면으로 연다
  it("플랜을 고르면 상세 열의 플랜 폼을 읽기 화면으로 연다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-primary-item-tp1"));
    expect(await screen.findByTestId("stub-plan-form")).toHaveTextContent(
      "view=true",
    );
  });

  it("새 플랜 폼은 읽기 화면이 아니라 바로 입력 화면이다", async () => {
    setup();
    fireEvent.click(screen.getByTestId("workspace-new-plan"));
    expect(await screen.findByTestId("stub-plan-form")).toHaveTextContent(
      "view=false",
    );
  });

  // ICT-514(리뷰 P1-8): 아무것도 고르지 않은 상세 영역은 넓은 칸 좌상단에 회색 문장
  // 한 줄뿐이었다. 다른 화면과 같은 빈 상태(아이콘·제목·설명)와, 쓰기 권한이 있으면
  // 목록 머리의 만들기와 같은 동작 버튼을 가운데에 보여야 한다.
  describe("상세 영역 빈 상태 (EmptyState)", () => {
    it("플랜 영역: 고르지 않으면 EmptyState 로 안내하고 플랜 만들기를 둔다", async () => {
      setup({ mode: "plans" });
      const empty = screen.getByTestId("workspace-detail-empty");
      expect(empty).toBeInTheDocument();
      expect(
        screen.getByTestId("workspace-detail-empty-title"),
      ).toHaveTextContent("플랜을 고르면 내용이 여기에 열립니다.");
      expect(screen.getByTestId("workspace-detail-empty-icon")).toBeTruthy();

      fireEvent.click(screen.getByTestId("workspace-detail-empty-action"));
      const form = await screen.findByTestId("stub-plan-form");
      expect(form).toHaveTextContent("plan=null");
    });

    it("실행 영역: 고르지 않으면 EmptyState 와 실행 만들기를 두고, 누르면 실행 폼이 열린다", async () => {
      setup({ mode: "executions" });
      await waitFor(() =>
        expect(
          screen.getByTestId("workspace-detail-empty-title"),
        ).toHaveTextContent("실행을 고르면 상세가 여기에 열립니다."),
      );
      const action = screen.getByTestId("workspace-detail-empty-action");
      expect(action).toHaveTextContent("실행 만들기");
      fireEvent.click(action);
      expect(
        await screen.findByTestId("stub-execution-form"),
      ).toHaveTextContent("exec=null");
    });

    it("실행이 하나도 없으면 '실행이 없습니다'를 제목으로 보인다", async () => {
      getMock.mockResolvedValue({ json: async () => [] });
      setup({ mode: "executions" });
      await waitFor(() =>
        expect(
          screen.getByTestId("workspace-detail-empty-title"),
        ).toHaveTextContent("실행이 없습니다."),
      );
      expect(
        screen.getByTestId("workspace-detail-empty-description"),
      ).toHaveTextContent("실행을 고르면 상세가 여기에 열립니다.");
    });

    it("플랜이 하나도 없으면 '등록된 테스트 플랜이 없습니다'를 제목으로 보인다", () => {
      const saved = appContext.testPlans;
      appContext.testPlans = [];
      try {
        setup({ mode: "plans" });
        expect(
          screen.getByTestId("workspace-detail-empty-title"),
        ).toHaveTextContent("등록된 테스트 플랜이 없습니다.");
        expect(
          screen.getByTestId("workspace-detail-empty-action"),
        ).toHaveTextContent("플랜 만들기");
      } finally {
        appContext.testPlans = saved;
      }
    });

    it("조회 전용 역할에는 빈 상태에도 만들기 버튼이 없다", () => {
      roleState.projectRole = "VIEWER";
      setup({ mode: "plans" });
      expect(screen.getByTestId("workspace-detail-empty")).toBeInTheDocument();
      expect(screen.queryByTestId("workspace-detail-empty-action")).toBeNull();
    });
  });
});
