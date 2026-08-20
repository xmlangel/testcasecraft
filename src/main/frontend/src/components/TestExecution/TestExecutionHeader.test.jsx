import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("./TestExecutionGuide.jsx", () => ({ default: () => null }));
vi.mock("../common/PageTitle.jsx", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

import TestExecutionHeader from "./TestExecutionHeader.jsx";

const renderHeader = (props = {}) =>
  render(
    <TestExecutionHeader
      executionId="e1"
      executionName="E01 회귀"
      execution={{ id: "e1", name: "E01 회귀" }}
      onCancel={vi.fn()}
      onGoToList={vi.fn()}
      onSaveOrUpdate={vi.fn()}
      onEditClick={vi.fn()}
      onCancelEdit={vi.fn()}
      saving={false}
      isEditingBasicInfo={false}
      showExecutionGuide={false}
      setShowExecutionGuide={vi.fn()}
      {...props}
    />,
  );

describe("TestExecutionHeader 쓰기 버튼 노출", () => {
  it("편집 권한이 없으면 수정 버튼을 내보내지 않는다", () => {
    renderHeader({ canEdit: false });
    expect(screen.queryByTestId("execution-edit-button")).toBeNull();
    // 목록으로 돌아가는 길은 남아 있어야 한다
    expect(screen.getByTestId("execution-list-button")).toBeInTheDocument();
  });

  it("canEdit 을 주지 않으면 수정 버튼이 없다 (기본 차단)", () => {
    renderHeader();
    expect(screen.queryByTestId("execution-edit-button")).toBeNull();
  });

  it("편집 권한이 있으면 수정 버튼이 보인다", () => {
    renderHeader({ canEdit: true });
    expect(screen.getByTestId("execution-edit-button")).toBeInTheDocument();
  });

  it("편집 모드에서 권한이 없으면 저장 버튼을 내보내지 않는다", () => {
    renderHeader({ canEdit: false, isEditingBasicInfo: true });
    expect(screen.queryByTestId("execution-save-button")).toBeNull();
  });

  it("편집 모드에서 권한이 있으면 저장 버튼이 보인다", () => {
    renderHeader({ canEdit: true, isEditingBasicInfo: true });
    expect(screen.getByTestId("execution-save-button")).toBeInTheDocument();
  });

  it("신규 생성이라도 권한이 없으면 저장 버튼이 없다", () => {
    renderHeader({ canEdit: false, executionId: null });
    expect(screen.queryByTestId("execution-save-button")).toBeNull();
  });
});
