import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// 첨부 뷰는 자체 데이터 로딩이 있어 모킹 — 다이얼로그 셸만 검증
vi.mock("./TestResultAttachmentsView.jsx", () => ({
  default: ({ testResultId }) => (
    <div data-testid="attachments-view">view:{testResultId}</div>
  ),
}));

import TestResultAttachmentDialog from "./TestResultAttachmentDialog.jsx";

const t = (key, fallback) => fallback || key;

describe("TestResultAttachmentDialog", () => {
  it("open 이면 제목과 첨부 뷰(testResultId 전달)를 렌더한다", () => {
    render(
      <TestResultAttachmentDialog
        open
        testResultId="tr-1"
        onClose={vi.fn()}
        t={t}
      />,
    );
    expect(screen.getByText("테스트 결과 첨부파일")).toBeInTheDocument();
    expect(screen.getByTestId("attachments-view")).toHaveTextContent(
      "view:tr-1",
    );
  });

  it("닫기 클릭 시 onClose 호출", () => {
    const onClose = vi.fn();
    render(
      <TestResultAttachmentDialog
        open
        testResultId="tr-1"
        onClose={onClose}
        t={t}
      />,
    );
    fireEvent.click(screen.getByText("닫기"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("testResultId 가 없으면 첨부 뷰를 렌더하지 않는다", () => {
    render(
      <TestResultAttachmentDialog
        open
        testResultId={null}
        onClose={vi.fn()}
        t={t}
      />,
    );
    expect(screen.queryByTestId("attachments-view")).toBeNull();
  });
});
