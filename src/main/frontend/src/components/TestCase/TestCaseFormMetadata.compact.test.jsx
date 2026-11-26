import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import TestCaseFormMetadata from "./TestCaseFormMetadata.jsx";

const t = (_key, fallback) => fallback;
const testCase = {
  id: "30bc9725-ffd3-43d0-909a-38f99710afd2",
  parentId: "0651a1e0-ead0-4539-9fc3-f63c67520f01",
  parentName: "F05 장바구니",
  displayOrder: 6,
  createdBy: "owner1",
  updatedBy: "admin",
};
const projectId = "d132d48a-65b3-4533-a704-6f1546735eb2";

const renderMeta = (props = {}) => {
  const handlers = {};
  const onChange = vi.fn((field) => {
    handlers[field] = handlers[field] || vi.fn();
    return handlers[field];
  });
  render(
    <TestCaseFormMetadata
      flat
      testCase={testCase}
      projectId={projectId}
      t={t}
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange, handlers };
};

describe("TestCaseFormMetadata 정보 한 줄 요약 (ICT-495 cl-4)", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("소유자·Parent·순서·수정자를 한 줄 요약으로 보이고 식별 정보는 접혀 있다", () => {
    renderMeta({ isViewer: true });
    const line = screen.getByTestId("testcase-meta-line");
    expect(line).toHaveTextContent("소유자 owner1");
    expect(line).toHaveTextContent("Parent F05 장바구니");
    expect(line).toHaveTextContent("순서 6");
    expect(line).toHaveTextContent("수정 admin");
    // 큰 입력칸이 없다
    expect(within(line).queryByRole("textbox")).toBeNull();
    expect(screen.getByTestId("testcase-ids-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("testcase-ids")).toBeNull();
  });

  it("식별 정보를 펼치면 ID·Parent ID·Project ID 와 복사 버튼이 보인다", async () => {
    renderMeta({ isViewer: true });
    fireEvent.click(screen.getByTestId("testcase-ids-toggle"));
    const ids = await screen.findByTestId("testcase-ids");
    expect(ids).toHaveTextContent(testCase.id);
    expect(ids).toHaveTextContent(testCase.parentId);
    expect(ids).toHaveTextContent(projectId);

    fireEvent.click(screen.getByTestId("testcase-copy-id"));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testCase.id),
    );
    fireEvent.click(screen.getByTestId("testcase-copy-parent-id"));
    fireEvent.click(screen.getByTestId("testcase-copy-project-id"));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(projectId),
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      testCase.parentId,
    );
  });

  it("편집 모드에서 순서는 폭 80px 작은 칸으로 고칠 수 있고 같은 저장 경로로 간다", () => {
    const { onChange, handlers } = renderMeta({ isViewer: false });
    const order = screen.getByTestId("testcase-display-order-input");
    expect(order).toHaveValue("6");
    expect(order.closest(".MuiInputBase-root")).toHaveClass(
      "MuiInputBase-sizeSmall",
    );
    expect(order.closest(".MuiTextField-root")).toHaveStyle({ width: "80px" });
    fireEvent.change(order, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith("displayOrder");
    expect(handlers.displayOrder).toHaveBeenCalled();
  });

  it("편집 모드에서 Parent ID 는 식별 정보 안에서 고칠 수 있다", async () => {
    const { handlers } = renderMeta({ isViewer: false });
    fireEvent.click(screen.getByTestId("testcase-ids-toggle"));
    const parent = await screen.findByLabelText("Parent ID");
    expect(parent).toHaveValue(testCase.parentId);
    fireEvent.change(parent, { target: { value: "folderNew" } });
    expect(handlers.parentId).toHaveBeenCalled();
  });

  it("보기 모드에서는 순서·Parent ID 가 입력칸이 아니다", async () => {
    renderMeta({ isViewer: true });
    expect(screen.queryByTestId("testcase-display-order-input")).toBeNull();
    fireEvent.click(screen.getByTestId("testcase-ids-toggle"));
    await screen.findByTestId("testcase-ids");
    expect(screen.queryByTestId("testcase-parent-id")).toBeNull();
  });
});
