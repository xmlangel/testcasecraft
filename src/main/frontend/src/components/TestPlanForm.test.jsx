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
