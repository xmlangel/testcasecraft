import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const apiMock = vi.fn();

vi.mock("../../context/AppContext.jsx", () => ({
  useAppContext: () => ({ api: apiMock }),
}));
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import TestCaseAttachments from "./TestCaseAttachments.jsx";

const attachment = {
  id: "att-1",
  originalFileName: "screenshot.png",
  fileSize: 2048,
  imageFile: true,
  uploadedByName: "kim",
  createdAt: "2026-07-27T00:00:00Z",
};

const respondWith = (attachments) =>
  apiMock.mockResolvedValue({
    ok: true,
    json: async () => ({ attachments }),
  });

describe("TestCaseAttachments", () => {
  beforeEach(() => apiMock.mockReset());

  it("케이스 첨부 목록을 조회해 파일명을 렌더한다", async () => {
    respondWith([attachment]);
    render(<TestCaseAttachments testCaseId="tc-1" />);

    expect(await screen.findByText("screenshot.png")).toBeInTheDocument();
    expect(apiMock).toHaveBeenCalledWith(
      "/api/testcase-attachments/testcase/tc-1",
    );
  });

  it("readOnly 면 업로드·삭제 없이 미리보기·다운로드만 제공한다", async () => {
    respondWith([attachment]);
    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);

    await screen.findByText("screenshot.png");
    expect(screen.queryByTestId("tc-attachment-upload")).toBeNull();
    expect(screen.queryByTestId("tc-attachment-delete")).toBeNull();
    expect(screen.getByTestId("tc-attachment-preview")).toBeInTheDocument();
    expect(screen.getByTestId("tc-attachment-download")).toBeInTheDocument();
  });

  it("기본(편집) 모드에서는 업로드·삭제가 함께 노출된다", async () => {
    respondWith([attachment]);
    render(<TestCaseAttachments testCaseId="tc-1" />);

    await screen.findByText("screenshot.png");
    expect(screen.getByTestId("tc-attachment-upload")).toBeInTheDocument();
    expect(screen.getByTestId("tc-attachment-delete")).toBeInTheDocument();
  });

  it("hideWhenEmpty 면 첨부가 없을 때 섹션을 렌더하지 않는다", async () => {
    respondWith([]);
    render(<TestCaseAttachments testCaseId="tc-1" readOnly hideWhenEmpty />);

    await waitFor(() =>
      expect(screen.queryByTestId("testcase-attachments")).toBeNull(),
    );
  });

  it("hideWhenEmpty 가 없으면 첨부가 없을 때 안내를 보여준다", async () => {
    respondWith([]);
    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);

    expect(
      await screen.findByText("첨부된 파일이 없습니다."),
    ).toBeInTheDocument();
  });

  it("title 을 주면 헤더 문구를 대체한다", async () => {
    respondWith([attachment]);
    render(
      <TestCaseAttachments
        testCaseId="tc-1"
        readOnly
        title="테스트케이스 첨부파일"
      />,
    );

    expect(
      await screen.findByText("테스트케이스 첨부파일"),
    ).toBeInTheDocument();
  });
});
