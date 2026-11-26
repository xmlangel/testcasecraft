import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TestPlanForm from "./TestPlanForm.jsx";

vi.mock("../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (_key, def, vars) =>
      vars
        ? String(def).replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""))
        : def,
  }),
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: { id: "u1", username: "kim" } }),
}));

const roleState = { projectRole: "PROJECT_MANAGER", loading: false };
vi.mock("../hooks/useProjectRole.js", () => ({
  default: () => roleState,
  useProjectRole: () => roleState,
}));

// 케이스 트리 자체는 이 검증의 대상이 아니다. 다만 폼이 케이스를 최소 한 개
// 고르도록 요구하므로, 선택 흉내를 낼 수 있는 자리만 남긴다.
vi.mock("./TestCaseTree.jsx", () => ({
  default: ({ onSelectionChange }) => (
    <button
      type="button"
      data-testid="stub-select-case"
      onClick={() => onSelectionChange(["c1"])}
    >
      케이스 선택 흉내
    </button>
  ),
}));

const addTestPlan = vi.fn();
const updateTestPlan = vi.fn();
const appContext = {
  activeProject: { id: "p1", name: "프로젝트" },
  testPlans: [],
  addTestPlan: (...args) => addTestPlan(...args),
  updateTestPlan: (...args) => updateTestPlan(...args),
  testCases: [{ id: "c1", name: "케이스", type: "testcase" }],
  activeTestPlan: null,
};
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => appContext,
}));

/**
 * 저장이 끝난 뒤 onSave 가 받는 값을 확인한다.
 *
 * 워크스페이스는 이 값으로 방금 만든 플랜을 곧바로 열기 때문에, 여기서 엉뚱한 값이
 * 흘러가면 존재하지 않는 플랜을 조회하게 된다. 그런데 워크스페이스 테스트는 폼을
 * 스텁으로 갈아 끼우므로 이 계약을 확인하지 못한다. 그래서 따로 둔다.
 */
describe("TestPlanForm 저장 계약", () => {
  beforeEach(() => {
    roleState.projectRole = "PROJECT_MANAGER";
    addTestPlan.mockReset();
    updateTestPlan.mockReset();
  });

  const setup = (props = {}) => {
    const onSave = vi.fn();
    render(
      <TestPlanForm inline onCancel={() => {}} onSave={onSave} {...props} />,
    );
    return onSave;
  };

  const saveWithName = (name = "새 플랜") => {
    fireEvent.change(screen.getByTestId("testplan-name-input"), {
      target: { value: name },
    });
    // 이름만으로는 저장되지 않는다 — 폼이 케이스를 최소 한 개 요구한다.
    fireEvent.click(screen.getByTestId("stub-select-case"));
    fireEvent.click(screen.getByTestId("testplan-save-button"));
  };

  it("새 플랜을 만들면 생성된 식별자를 넘긴다", async () => {
    addTestPlan.mockResolvedValue("tp-new");
    const onSave = setup();
    saveWithName();
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("tp-new"));
  });

  it("저장 결과가 객체로 오더라도 식별자만 꺼내 넘긴다", async () => {
    addTestPlan.mockResolvedValue({ id: "tp-obj", name: "새 플랜" });
    const onSave = setup();
    saveWithName();
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("tp-obj"));
  });

  it("식별자를 알 수 없으면 null 을 넘긴다 (엉뚱한 값을 흘리지 않는다)", async () => {
    addTestPlan.mockResolvedValue(undefined);
    const onSave = setup();
    saveWithName();
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(null));
  });

  it("기존 플랜을 고치면 그 플랜의 식별자를 그대로 넘긴다", async () => {
    updateTestPlan.mockResolvedValue({});
    const onSave = setup({ testPlanId: "tp1" });
    saveWithName("이름 변경");
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("tp1"));
    expect(addTestPlan).not.toHaveBeenCalled();
  });

  it("저장이 실패하면 onSave 를 부르지 않는다", async () => {
    addTestPlan.mockRejectedValue(new Error("서버 오류"));
    const onSave = setup();
    saveWithName();
    await waitFor(() =>
      expect(screen.getByText(/저장 처리 중 오류/)).toBeInTheDocument(),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("조회 전용 역할에는 저장 버튼이 없다", () => {
    roleState.projectRole = "VIEWER";
    setup();
    expect(screen.queryByTestId("testplan-save-button")).toBeNull();
  });
});

/**
 * ICT-513: 목록에서 플랜을 누르면 수정 폼이 아니라 읽기 화면으로 열린다.
 * 보려고 들어왔다가 체크박스를 잘못 눌러 저장하는 일을 막는다.
 */
describe("TestPlanForm 읽기 화면 (ICT-513)", () => {
  beforeEach(() => {
    roleState.projectRole = "PROJECT_MANAGER";
    addTestPlan.mockReset();
    updateTestPlan.mockReset();
    appContext.testPlans = [
      {
        id: "tp1",
        name: "회귀 플랜",
        description: "설명",
        testCaseIds: ["c1", "c2"],
        projectId: "p1",
      },
    ];
    appContext.testCases = [
      { id: "c1", name: "케이스", type: "testcase" },
      { id: "c2", name: "케이스 2", type: "testcase" },
    ];
  });

  const setupView = () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <TestPlanForm
        inline
        startInViewMode
        testPlanId="tp1"
        onCancel={onCancel}
        onSave={onSave}
      />,
    );
    return { onSave, onCancel };
  };

  it("기존 플랜은 읽기 화면으로 열리고 입력란이 잠겨 있다", () => {
    setupView();
    expect(screen.getByText("테스트 플랜")).toBeInTheDocument();
    expect(screen.queryByText("테스트 플랜 수정")).toBeNull();
    expect(screen.getByTestId("testplan-name-input")).toHaveValue("회귀 플랜");
    expect(screen.getByTestId("testplan-name-input")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByTestId("testplan-description-input")).toHaveAttribute(
      "readonly",
    );
    expect(screen.queryByTestId("testplan-save-button")).toBeNull();
    expect(screen.getByTestId("testplan-edit-button")).toBeInTheDocument();
  });

  it("읽기 화면에서는 케이스 선택을 눌러도 선택이 바뀌지 않는다", () => {
    setupView();
    expect(screen.getByTestId("testplan-case-selection")).toHaveAttribute(
      "data-readonly",
      "true",
    );
    fireEvent.click(screen.getByTestId("stub-select-case"));
    fireEvent.click(screen.getByTestId("testplan-edit-button"));
    fireEvent.click(screen.getByTestId("testplan-save-button"));
    // 흉내 선택은 ["c1"] 로 바꾸려 하지만, 읽기 화면에서 누른 것이라 반영되지 않고
    // 원래 값 그대로 저장된다
    return waitFor(() =>
      expect(updateTestPlan).toHaveBeenCalledWith(
        expect.objectContaining({ id: "tp1", testCaseIds: ["c1", "c2"] }),
      ),
    );
  });

  it("수정 버튼을 누르면 편집 화면이 되고, 저장하면 읽기 화면으로 돌아온다", async () => {
    updateTestPlan.mockResolvedValue({});
    const { onSave } = setupView();
    fireEvent.click(screen.getByTestId("testplan-edit-button"));

    expect(screen.getByText("테스트 플랜 수정")).toBeInTheDocument();
    expect(screen.getByTestId("testplan-name-input")).not.toHaveAttribute(
      "readonly",
    );
    fireEvent.change(screen.getByTestId("testplan-name-input"), {
      target: { value: "이름 변경" },
    });
    fireEvent.click(screen.getByTestId("testplan-save-button"));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("tp1"));
    expect(updateTestPlan).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tp1", name: "이름 변경" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("testplan-edit-button")).toBeInTheDocument(),
    );
  });

  it("편집을 취소하면 고친 값을 버리고 읽기 화면으로 돌아온다", () => {
    const { onCancel } = setupView();
    fireEvent.click(screen.getByTestId("testplan-edit-button"));
    fireEvent.change(screen.getByTestId("testplan-name-input"), {
      target: { value: "버릴 이름" },
    });
    fireEvent.click(screen.getByTestId("testplan-cancel-button"));

    expect(screen.getByTestId("testplan-name-input")).toHaveValue("회귀 플랜");
    expect(screen.getByTestId("testplan-edit-button")).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
    expect(updateTestPlan).not.toHaveBeenCalled();
  });

  it("읽기 화면의 닫기는 호출한 쪽에 닫기를 맡긴다", () => {
    const { onCancel } = setupView();
    fireEvent.click(screen.getByTestId("testplan-close-button"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("조회 전용 역할에는 수정 버튼이 없다", () => {
    roleState.projectRole = "VIEWER";
    setupView();
    expect(screen.queryByTestId("testplan-edit-button")).toBeNull();
    expect(screen.queryByTestId("testplan-save-button")).toBeNull();
  });
});
