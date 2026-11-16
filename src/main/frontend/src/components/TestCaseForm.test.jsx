import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// TestCaseForm 은 의존성이 많아(컨텍스트·여러 훅·무거운 자식) 전부 모킹하고
// 저장 흐름(생성 모드)만 컴포넌트 레벨로 검증한다.
// 중요: 컨텍스트/훅 반환값은 *안정적 싱글톤*이어야 한다. 매 렌더마다 새 객체/배열을
// 반환하면 testCases·ragState 에 의존하는 로드 effect 가 무한 재실행되어 OOM 크래시가 난다.
const {
  addTestCase,
  updateTestCase,
  updateTestCaseLocal,
  listDocuments,
  api,
  appCtx,
  ragCtx,
  fieldVisibility,
  uiPref,
  autoSave,
  inlineImage,
} = vi.hoisted(() => {
  const addTestCase = vi.fn();
  const updateTestCase = vi.fn();
  const updateTestCaseLocal = vi.fn();
  const listDocuments = vi.fn();
  const api = vi.fn();
  const appCtx = {
    testCases: [],
    updateTestCase,
    updateTestCaseLocal,
    addTestCase,
    user: { role: "ADMIN" },
    api,
  };
  const ragCtx = {
    state: { documents: [] },
    listDocuments,
    isRagEnabled: false,
  };
  const fieldVisibility = {
    visibility: {},
    toggle: vi.fn(),
    setAll: vi.fn(),
    reset: vi.fn(),
  };
  const uiPref = [false, vi.fn()];
  const autoSave = {
    autoSaveStatus: "idle",
    autoSaveError: null,
    markSaved: vi.fn(),
  };
  const inlineImage = {
    imageDialogState: { open: false },
    inlineImageUploading: false,
    handleMarkdownPaste: vi.fn(),
    handleInlineImageDialogClose: vi.fn(),
    handleInlineImageInsert: vi.fn(),
    updateImageDialogState: vi.fn(),
  };
  return {
    addTestCase,
    updateTestCase,
    updateTestCaseLocal,
    listDocuments,
    api,
    appCtx,
    ragCtx,
    fieldVisibility,
    uiPref,
    autoSave,
    inlineImage,
  };
});

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: "", state: null }),
}));
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => appCtx,
}));
vi.mock("../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../context/RAGContext.jsx", () => ({
  useRAG: () => ragCtx,
}));
vi.mock("./TestCase/useFieldVisibility.jsx", () => ({
  useFieldVisibility: () => fieldVisibility,
}));
vi.mock("./TestCase/useUiPreference.jsx", () => ({
  useUiPreference: () => uiPref,
}));
vi.mock("../hooks/useAutoSave.js", () => ({
  default: () => autoSave,
}));
vi.mock("../hooks/useInlineImagePaste.js", () => ({
  default: () => inlineImage,
}));

// 무거운/무관한 자식 컴포넌트는 렌더에서 제외 (푸터 저장 버튼은 TestCaseForm 본체에 있음)
const mockNull = vi.hoisted(() => () => ({ default: () => null }));
vi.mock("./TestCase/TestCaseVersionHistory.jsx", mockNull);
vi.mock("./TestCase/FieldVisibilityMenu.jsx", mockNull);
vi.mock("./TestCase/TestCaseAttachments.jsx", mockNull);
// 머리(TestCaseFormHeader)는 저장 버튼이 있어 그대로 그린다(ICT-494 tl-2). 버전 표시만 뺀다.
vi.mock("./TestCase/VersionIndicator.jsx", mockNull);
// TestCaseFormMetadata 는 H1(부모 이동 태그정리) 테스트에서 Parent ID 편집이
// 필요해 모킹하지 않는다(MUI 만 의존해 가볍다).
// ICT-494 tl-3: ID·Parent(TestCaseFormMetadata)는 기본 정보 격자 안에 들어가므로
// 기본 정보는 넘겨받은 metadataSlot 만 그리게 둔다.
// ICT-494 tl-5: 실행 유형 변경 경로를 시험하려고 그 호출만 버튼으로 남긴다.
vi.mock("./TestCase/TestCaseBasicInfo.jsx", () => ({
  default: ({ metadataSlot, onTestCaseChange }) => (
    <>
      {metadataSlot ?? null}
      <button
        type="button"
        data-testid="mock-execution-type-hybrid"
        onClick={() => onTestCaseChange("executionType", "Hybrid")}
      />
      <button
        type="button"
        data-testid="mock-execution-type-manual"
        onClick={() => onTestCaseChange("executionType", "Manual")}
      />
    </>
  ),
}));
vi.mock("./TestCase/TestStepsTable.jsx", mockNull);
vi.mock("./TestCase/MarkdownFieldEditor.jsx", mockNull);
vi.mock("./TestCase/InlineImageDialog.jsx", mockNull);
vi.mock("./TestCase/VersionDialog.jsx", mockNull);
vi.mock("./TestCase/FolderForm.jsx", mockNull);
vi.mock("./TestCaseExecutionHistory.jsx", mockNull);
vi.mock("./TestCase/RagStatusBadge.jsx", mockNull);

import TestCaseForm from "./TestCaseForm.jsx";

describe("TestCaseForm 저장 흐름 (생성 모드)", () => {
  beforeEach(() => {
    addTestCase.mockReset().mockResolvedValue({ id: "new-1", name: "신규 TC" });
    updateTestCase.mockReset().mockResolvedValue({ id: "x" });
    updateTestCaseLocal.mockReset();
    appCtx.testCases = []; // 싱글톤 컨텍스트의 testCases 초기화 (테스트 간 격리)
    api.mockReset().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
  });

  it("이름이 있으면 저장 시 addTestCase 가 단계가 매핑된 payload 로 호출된다", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{
          name: "신규 TC",
          steps: [{ stepNumber: 1, action: "동작1", expected: "예상1" }],
        }}
      />,
    );

    const saveBtn = await screen.findByTestId("testcase-save-button");
    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);

    await waitFor(() => expect(addTestCase).toHaveBeenCalledTimes(1));
    const payload = addTestCase.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: "신규 TC",
      projectId: "p1",
      // AI 단계(action/expected)가 내부 필드(description/expectedResult)로 매핑됨
      steps: [{ stepNumber: 1, description: "동작1", expectedResult: "예상1" }],
    });
  });

  it("이름이 비어 있으면 저장 버튼이 비활성화된다", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{ name: "" }}
      />,
    );
    const saveBtn = await screen.findByTestId("testcase-save-button");
    expect(saveBtn).toBeDisabled();
  });

  it("저장 버튼을 연속 클릭해도 addTestCase 는 한 번만 호출된다 (중복 제출 방지)", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{ name: "신규 TC" }}
      />,
    );

    const saveBtn = await screen.findByTestId("testcase-save-button");
    fireEvent.click(saveBtn);
    fireEvent.click(saveBtn);
    fireEvent.click(saveBtn);

    await waitFor(() => expect(addTestCase).toHaveBeenCalledTimes(1));
  });
});

describe("TestCaseForm 부모 이동 시 태그 정리 (H1)", () => {
  beforeEach(() => {
    addTestCase.mockReset().mockResolvedValue({ id: "new-1" });
    updateTestCase.mockReset().mockResolvedValue({ id: "tc1" });
    updateTestCaseLocal.mockReset();
    api.mockReset().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    // 수정 대상 케이스 + 옛 부모 폴더(태그 보유)
    appCtx.testCases = [
      {
        id: "tc1",
        parentId: "folderOld",
        tags: ["t1", "t2"],
        type: "testcase",
        name: "케이스",
        steps: [],
      },
      {
        id: "folderOld",
        parentId: null,
        tags: ["t1", "x"],
        type: "folder",
        name: "옛폴더",
        steps: [],
      },
    ];
  });

  it("부모를 옮기면 옛 부모에서 상속된 공통 태그를 확인 후 payload 에서 제거한다", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    // 원본 parentId(folderOld) 로드 후 Parent ID 를 새 폴더로 변경
    const parentField = await screen.findByLabelText("Parent ID");
    fireEvent.change(parentField, { target: { value: "folderNew" } });

    const saveBtn = await screen.findByTestId("testcase-save-button");
    fireEvent.click(saveBtn);

    await waitFor(() => expect(updateTestCase).toHaveBeenCalledTimes(1));
    expect(confirmSpy).toHaveBeenCalled();
    const payload = updateTestCase.mock.calls[0][0];
    // 공통 태그 t1 제거, t2 유지
    expect(payload.tags).toEqual(["t2"]);
    confirmSpy.mockRestore();
  });

  it("확인을 거부하면 태그를 유지한다", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    const parentField = await screen.findByLabelText("Parent ID");
    fireEvent.change(parentField, { target: { value: "folderNew" } });
    fireEvent.click(await screen.findByTestId("testcase-save-button"));

    await waitFor(() => expect(updateTestCase).toHaveBeenCalledTimes(1));
    const payload = updateTestCase.mock.calls[0][0];
    expect(payload.tags).toEqual(["t1", "t2"]);
    confirmSpy.mockRestore();
  });

  it("부모를 옮기지 않으면 태그 정리를 묻지 않는다", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    // Parent ID 변경 없이 저장
    fireEvent.click(await screen.findByTestId("testcase-save-button"));

    await waitFor(() => expect(updateTestCase).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

describe("TestCaseForm 편집/보기 전환 (ICT-486)", () => {
  beforeEach(() => {
    updateTestCase.mockReset().mockResolvedValue({ id: "tc1" });
    api.mockReset().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    appCtx.testCases = [
      {
        id: "tc1",
        parentId: null,
        tags: [],
        type: "testcase",
        name: "케이스",
        steps: [],
      },
    ];
    localStorage.removeItem("testcase-manager-form-view-mode");
  });

  it("보기 모드가 저장돼 있으면 기존 케이스의 저장 버튼을 숨긴다", async () => {
    localStorage.setItem("testcase-manager-form-view-mode", "view");
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    await screen.findByLabelText("Parent ID");
    expect(screen.queryByTestId("testcase-save-button")).toBeNull();
  });

  it("기본은 편집 모드라 저장 버튼이 보인다", async () => {
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    expect(
      await screen.findByTestId("testcase-save-button"),
    ).toBeInTheDocument();
  });

  it("새 케이스 작성 중에는 보기 모드여도 저장 버튼이 보인다", async () => {
    localStorage.setItem("testcase-manager-form-view-mode", "view");
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{ name: "신규 TC" }}
      />,
    );

    expect(
      await screen.findByTestId("testcase-save-button"),
    ).toBeInTheDocument();
  });

  it("하단 고정 바에는 이전·다음 이동(footerNav)만 두고 저장 버튼은 위에 붙은 머리에 하나만 둔다 (ICT-491·494)", async () => {
    render(
      <TestCaseForm
        testCaseId="tc1"
        projectId="p1"
        onSave={vi.fn()}
        footerNav={<div data-testid="footer-nav-slot">1 / 3</div>}
      />,
    );

    const footer = await screen.findByTestId("testcase-form-footer");
    expect(footer).toContainElement(screen.getByTestId("footer-nav-slot"));
    expect(footer).toHaveStyle({ position: "sticky" });

    const header = screen.getByTestId("testcase-form-header");
    const saveButtons = await screen.findAllByTestId("testcase-save-button");
    expect(saveButtons).toHaveLength(1);
    expect(header).toContainElement(saveButtons[0]);
    expect(footer).not.toContainElement(saveButtons[0]);
    expect(header).toHaveStyle({ position: "sticky" });
    // 아래 줄에 있던 취소·버전 생성 중복이 없다
    expect(screen.getAllByTestId("testcase-cancel-button")).toHaveLength(1);
    expect(footer.textContent).not.toContain("버전 생성");
  });

  it("footerNav 가 없으면 하단 바를 그리지 않는다 (ICT-494)", async () => {
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);
    await screen.findByTestId("testcase-form-header");
    expect(screen.queryByTestId("testcase-form-footer")).toBeNull();
  });

  it("머리 줄에 상위가 넘긴 입력 모드 전환(headerExtra)을 함께 그린다 (ICT-494)", async () => {
    render(
      <TestCaseForm
        testCaseId="tc1"
        projectId="p1"
        onSave={vi.fn()}
        headerExtra={<div data-testid="input-mode-slot" />}
      />,
    );
    const row = await screen.findByTestId("testcase-header-row");
    expect(row).toContainElement(screen.getByTestId("input-mode-slot"));
  });

  it("단계와 전체 기대 결과를 넓은 칸에서 나란히 두는 격자 배치를 쓴다 (ICT-491)", async () => {
    render(<TestCaseForm testCaseId="tc1" projectId="p1" onSave={vi.fn()} />);

    const layout = await screen.findByTestId("testcase-steps-expected-layout");
    expect(layout).toHaveStyle({ display: "grid" });
  });
});

describe("TestCaseForm 실행 유형과 자동화 여부 (ICT-494 tl-5)", () => {
  beforeEach(() => {
    addTestCase.mockReset().mockResolvedValue({ id: "new-1", name: "신규 TC" });
    appCtx.testCases = [];
    api.mockReset().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
  });

  const saveAndGetPayload = async () => {
    fireEvent.click(await screen.findByTestId("testcase-save-button"));
    await waitFor(() => expect(addTestCase).toHaveBeenCalledTimes(1));
    return addTestCase.mock.calls[0][0];
  };

  it("실행 유형을 Hybrid 로 바꾸면 isAutomated 가 참으로 함께 저장된다", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{ name: "신규 TC", executionType: "Manual" }}
      />,
    );
    fireEvent.click(await screen.findByTestId("mock-execution-type-hybrid"));
    expect(await saveAndGetPayload()).toMatchObject({
      executionType: "Hybrid",
      isAutomated: true,
    });
  });

  it("실행 유형을 Manual 로 바꾸면 isAutomated 가 거짓으로 함께 저장된다", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{
          name: "신규 TC",
          executionType: "Automation",
          isAutomated: true,
        }}
      />,
    );
    fireEvent.click(await screen.findByTestId("mock-execution-type-manual"));
    expect(await saveAndGetPayload()).toMatchObject({
      executionType: "Manual",
      isAutomated: false,
    });
  });

  it("두 값이 어긋난 케이스는 저장할 때 실행 유형 쪽으로 맞춘다", async () => {
    render(
      <TestCaseForm
        projectId="p1"
        onSave={vi.fn()}
        initialData={{
          name: "신규 TC",
          executionType: "Manual",
          isAutomated: true,
        }}
      />,
    );
    expect(await saveAndGetPayload()).toMatchObject({
      executionType: "Manual",
      isAutomated: false,
    });
  });
});
