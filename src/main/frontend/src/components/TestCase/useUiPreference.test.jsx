import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// apiService 모킹 — 서버 prefs fetch/patch 를 제어
vi.mock("../../services/apiService.js", () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

let useUiPreference, apiService;

// 모듈 레벨 공유 캐시(prefsCache)가 테스트 간 누수되지 않도록 매번 리셋한다.
const setup = async (serverPrefs = {}) => {
  vi.resetModules();
  localStorage.clear();
  apiService = (await import("../../services/apiService.js")).default;
  // mock 인스턴스는 resetModules 와 무관하게 공유되므로 호출 기록을 명시적으로 리셋
  apiService.get.mockReset();
  apiService.patch.mockReset();
  apiService.get.mockResolvedValue({
    json: async () => ({ uiPreferences: JSON.stringify(serverPrefs) }),
  });
  apiService.patch.mockResolvedValue({});
  ({ useUiPreference } = await import("./useUiPreference.jsx"));
};

describe("useUiPreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("서버에 키가 없으면 기본값을 사용한다", async () => {
    await setup({});
    const { result } = renderHook(() => useUiPreference("myKey", "DEF"));
    expect(result.current[0]).toBe("DEF");
    // 비동기 서버 fetch 를 flush (act 경고 방지)
    await waitFor(() => expect(apiService.get).toHaveBeenCalled());
    expect(result.current[0]).toBe("DEF");
  });

  it("초기값으로 localStorage 캐시를 읽는다", async () => {
    await setup({});
    localStorage.setItem("ui-pref:anon:myKey", JSON.stringify("CACHED"));
    const { result } = renderHook(() => useUiPreference("myKey", "DEF"));
    expect(result.current[0]).toBe("CACHED");
    await waitFor(() => expect(apiService.get).toHaveBeenCalled());
  });

  it("서버 값이 있으면 기본값을 덮어쓴다", async () => {
    await setup({ myKey: "SERVER" });
    const { result } = renderHook(() => useUiPreference("myKey", "DEF"));
    await waitFor(() => expect(result.current[0]).toBe("SERVER"));
  });

  it("값 변경 시 debounce 후 단일 키 PATCH 를 보낸다", async () => {
    await setup({});
    const { result } = renderHook(() => useUiPreference("myKey", "DEF"));
    // 서버 fetch(get) 가 호출되어 serverLoaded 가 되도록 대기
    await waitFor(() => expect(apiService.get).toHaveBeenCalled());

    act(() => result.current[1]("NEW"));

    await waitFor(
      () =>
        expect(apiService.patch).toHaveBeenCalledWith(
          "/api/auth/me/preferences",
          { key: "myKey", value: "NEW" },
        ),
      { timeout: 2000 },
    );
    // 값도 갱신되어 있어야 한다
    expect(result.current[0]).toBe("NEW");
  });

  it("변화가 없으면 PATCH 를 보내지 않는다", async () => {
    await setup({ myKey: "SAME" });
    const { result } = renderHook(() => useUiPreference("myKey", "DEF"));
    await waitFor(() => expect(result.current[0]).toBe("SAME"));
    // 같은 값으로 다시 set → 직렬화 동일 → patch 미발생
    act(() => result.current[1]("SAME"));
    await new Promise((r) => setTimeout(r, 700));
    expect(apiService.patch).not.toHaveBeenCalled();
  });
});
