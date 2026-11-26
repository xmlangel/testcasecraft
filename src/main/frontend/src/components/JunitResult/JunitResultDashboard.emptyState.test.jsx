import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JunitResultDashboard from "./JunitResultDashboard.jsx";

// ICT-514(리뷰 P1-8): 자동화 테스트 화면의 차트 카드는 결과가 없을 때 카드 안에
// 회색 문구 한 줄만 보였다. 다른 화면과 같은 빈 상태(아이콘·제목·설명)로 보여야
// 사용자가 "고장"이 아니라 "아직 결과가 없음"으로 읽고 업로드로 넘어간다.

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    activeProject: { id: "p1", name: "MCP" },
    user: { id: "u1" },
  }),
}));
vi.mock("../../context/I18nContext", () => ({
  useTranslation: () => ({
    t: (key, def) => (typeof def === "string" ? def : key),
  }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../../hooks/useProjectRole.js", () => ({
  default: () => ({ projectRole: "PROJECT_MANAGER", loading: false }),
}));
vi.mock("../../hooks/useAgentConnection.js", () => ({
  default: () => ({ enabled: false, runnable: false, name: "" }),
}));
vi.mock("../../services/agentConnectionService.js", () => ({
  default: { get: vi.fn(), buildDeepLink: vi.fn() },
}));
vi.mock("../../services/apiService.js", () => ({ default: { get: vi.fn() } }));
vi.mock("../JUnit/JunitProcessingProgress", () => ({ default: () => null }));
vi.mock("../../services/junitResultService", () => ({
  default: {
    getJunitResultsByProject: vi.fn(async () => ({
      content: [],
      totalPages: 0,
    })),
    getJunitStatistics: vi.fn(async () => ({
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalErrors: 0,
      totalSkipped: 0,
      averageSuccessRate: 0,
      recentResults: [],
    })),
  },
}));

describe("JunitResultDashboard 빈 상태", () => {
  it("결과가 없으면 두 차트 카드가 EmptyState 로 비어 있음을 보인다", async () => {
    render(<JunitResultDashboard />);
    await waitFor(() =>
      expect(
        screen.getByTestId("junit-chart-status-empty"),
      ).toBeInTheDocument(),
    );
    const recent = screen.getByTestId("junit-chart-recent-empty");
    expect(recent).toBeInTheDocument();
    expect(
      screen.getByTestId("junit-chart-status-empty-title"),
    ).toHaveTextContent("테스트 결과가 없습니다");
    expect(screen.getByTestId("junit-chart-status-empty-icon")).toBeTruthy();
    expect(
      screen.getByTestId("junit-chart-recent-empty-description"),
    ).toHaveTextContent("JUnit XML 파일을 업로드하여");
  });
});
