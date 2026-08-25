import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// AuthContext 를 대신 세워 api 응답을 조종한다.
const authState = { api: vi.fn(), user: { id: 1 }, loadingUser: false };
vi.mock("./AuthContext", () => ({
  useAuth: () => ({
    api: (...args) => authState.api(...args),
    user: authState.user,
    loadingUser: authState.loadingUser,
    getApiBaseUrl: async () => "http://test",
  }),
}));

const { JiraProvider, useJira } = await import("./JiraContext.jsx");

const Probe = () => {
  const { jiraServerUrl } = useJira();
  return <span data-testid="url">{jiraServerUrl ?? "(없음)"}</span>;
};

const renderWithProvider = () =>
  render(
    <JiraProvider>
      <Probe />
    </JiraProvider>,
  );

describe("JiraContext 서버 URL 조회", () => {
  let warnSpy;

  beforeEach(() => {
    authState.api = vi.fn();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.resetModules();
  });

  // 회귀 가드: 서버는 "설정 없음"을 본문 없는 204 로 알린다. res.ok 가 true 라
  // 그대로 res.json() 을 부르면 "Unexpected end of JSON input" 이 콘솔에 찍혔다.
  it("204(본문 없음)는 미설정으로 조용히 처리한다", async () => {
    authState.api.mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => "",
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    });

    renderWithProvider();

    await waitFor(() => expect(authState.api).toHaveBeenCalled());
    expect(screen.getByTestId("url").textContent).toBe("(없음)");
    const messages = warnSpy.mock.calls.map((c) => String(c[0]));
    expect(messages.some((m) => m.includes("조회 중 오류"))).toBe(false);
  });

  it("200 이면 serverUrl 을 반영한다", async () => {
    authState.api.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ serverUrl: "https://jira.example.com" }),
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("url").textContent).toBe(
        "https://jira.example.com",
      ),
    );
  });

  it("404 는 미설정으로 처리한다", async () => {
    authState.api.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    });

    renderWithProvider();

    await waitFor(() => expect(authState.api).toHaveBeenCalled());
    expect(screen.getByTestId("url").textContent).toBe("(없음)");
    const messages = warnSpy.mock.calls.map((c) => String(c[0]));
    expect(messages.some((m) => m.includes("조회 중 오류"))).toBe(false);
  });
});
