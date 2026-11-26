import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

let mockUser = null;
vi.mock("../context/I18nContext", () => ({
  useI18n: () => ({ currentLanguage: "ko" }),
}));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

import { useDateFormatter } from "./useDateFormatter";
import { getBrowserTimeZone } from "../utils/dateUtils";

/** ICT-511: 화면 공통 날짜 훅이 YYYY-MM-DD(HH:mm) 로, 브라우저 시간대 기준으로 낸다. */
describe("useDateFormatter (ICT-511)", () => {
  const instant = new Date("2026-05-21T18:13:00Z");

  it("프로필 시간대가 서버 기본값 UTC 면 브라우저 시간대를 쓴다", () => {
    mockUser = { timezone: "UTC" };
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.userTimeZone).toBe(getBrowserTimeZone());
  });

  it("formatDate 는 YYYY-MM-DD HH:mm, formatDateOnly 는 YYYY-MM-DD 이고 (UTC) 를 붙이지 않는다", () => {
    mockUser = { timezone: "Asia/Seoul" };
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDate(instant)).toBe("2026-05-22 03:13");
    expect(result.current.formatDateOnly(instant)).toBe("2026-05-22");
  });

  it("표기 옵션을 넘기면 예전 로캘 표기를 유지한다", () => {
    mockUser = { timezone: "Asia/Seoul" };
    const { result } = renderHook(() => useDateFormatter());
    expect(result.current.formatDate(instant, { month: "long" })).toMatch(
      /5월/,
    );
  });
});
