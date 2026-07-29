import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const apiMock = vi.fn();

vi.mock("../../context/AppContext.jsx", () => ({
  useAppContext: () => ({ api: apiMock }),
}));
// currentLanguage 는 useDateFormatter 가 함께 참조한다(같은 모듈이라 한 곳에서 준다).
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, fallback) => fallback || key,
    currentLanguage: "ko",
  }),
}));
// useDateFormatter 는 모킹하지 않는다 — 공용 포맷터 경로를 실제로 태워야
// 배열 형태 날짜가 "Invalid Date" 로 새지 않는지 검증된다.
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { timezone: "Asia/Seoul" } }),
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

const textAttachment = {
  id: "att-2",
  originalFileName: "notes.txt",
  fileSize: 512,
  textFile: true,
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

  it("백엔드가 배열로 준 업로드 일시도 Invalid date 없이 표기한다", async () => {
    // 백엔드는 LocalDateTime 을 [년,월,일,시,분,초,나노초] 배열로 내보낸다.
    // 컴포넌트가 new Date() 를 직접 호출하면 이 형태에서 "Invalid Date" 가 됐다.
    respondWith([{ ...attachment, createdAt: [2026, 7, 27, 14, 30, 0, 0] }]);
    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);

    await screen.findByText("screenshot.png");
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("업로드 일시가 없거나 깨져도 Invalid date 대신 - 로 표기한다", async () => {
    respondWith([{ ...attachment, createdAt: "깨진값" }]);
    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);

    await screen.findByText("screenshot.png");
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
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

  it("삭제된 첨부를 미리보기하면 410 을 받고 목록을 다시 읽는다", async () => {
    // 1) 최초 목록 → 2) 미리보기 요청 410 → 3) 갱신된(빈) 목록
    apiMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ attachments: [textAttachment] }),
      })
      .mockResolvedValueOnce({ ok: false, status: 410 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ attachments: [] }),
      });

    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);
    await screen.findByText("notes.txt");

    fireEvent.click(screen.getByTestId("tc-attachment-preview"));

    await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(3));
    expect(apiMock).toHaveBeenLastCalledWith(
      "/api/testcase-attachments/testcase/tc-1",
    );
    // 갱신된 목록이 비어 목록 영역에서 사라진다 (미리보기 다이얼로그 제목에는 남아 있음)
    expect(
      await screen.findByText("첨부된 파일이 없습니다."),
    ).toBeInTheDocument();
  });

  it("삭제된 첨부를 다운로드하면 안내 메시지를 보여준다", async () => {
    apiMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ attachments: [textAttachment] }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ attachments: [] }),
      });

    render(<TestCaseAttachments testCaseId="tc-1" readOnly />);
    await screen.findByText("notes.txt");

    fireEvent.click(screen.getByTestId("tc-attachment-download"));

    expect(
      await screen.findByText(
        "첨부파일을 찾을 수 없습니다. 삭제된 것 같아 목록을 새로고침했습니다.",
      ),
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
