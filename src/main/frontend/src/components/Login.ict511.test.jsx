import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * ICT-511: 로그인 화면.
 * - 하단 매뉴얼 링크가 영어 화면에서 "User Manual · User Manual" 로 두 번 찍히지 않는다.
 * - 로그인·회원가입 버튼은 번역 문구 그대로(대문자 변환 없이) 보인다.
 * - 탭 제목이 "로그인 · Testcase Craft" 다.
 */
let translations = {};
vi.mock("../context/I18nContext.jsx", () => ({
  useTranslation: () => ({
    t: (key, fallback) => translations[key] ?? fallback ?? key,
  }),
}));
vi.mock("../context/AppContext.jsx", () => ({
  useAppContext: () => ({ login: vi.fn(), register: vi.fn() }),
}));
vi.mock("./common/LanguageSelector.jsx", () => ({
  InlineLanguageToggle: () => null,
}));

import Login, { buildManualLinkLabel } from "./Login.jsx";

describe("로그인 화면 (ICT-511)", () => {
  beforeEach(() => {
    translations = {};
  });

  it("영어 화면에서 매뉴얼 링크 문구가 한 번만 나온다", () => {
    translations = {
      "login.manualLink": "User Manual",
      "login.title": "Login",
    };
    render(<Login onLoginSuccess={vi.fn()} />);
    const link = screen.getByTestId("login-manual-link");
    expect(link).toHaveTextContent(/^User Manual$/);
    expect(link.textContent.match(/user manual/gi)).toHaveLength(1);
  });

  it("한국어 화면에서는 한국어·영어를 한 번씩 함께 적는다", () => {
    render(<Login onLoginSuccess={vi.fn()} />);
    expect(screen.getByTestId("login-manual-link")).toHaveTextContent(
      /^사용자 매뉴얼 · User Manual$/,
    );
  });

  it("buildManualLinkLabel 은 영어 문구와 같으면(대소문자 무관) 한 번만 쓴다", () => {
    expect(buildManualLinkLabel("USER MANUAL")).toBe("USER MANUAL");
    expect(buildManualLinkLabel("")).toBe("User Manual");
    expect(buildManualLinkLabel("사용자 매뉴얼")).toBe(
      "사용자 매뉴얼 · User Manual",
    );
  });

  it("로그인·회원가입 버튼은 대문자 변환을 끈다", () => {
    translations = { "login.button": "Login", "register.switch": "Sign Up" };
    render(<Login onLoginSuccess={vi.fn()} />);
    for (const id of [
      "login-submit-button",
      "login-switch-to-register-button",
      "login-manual-link",
    ]) {
      expect(getComputedStyle(screen.getByTestId(id)).textTransform).toBe(
        "none",
      );
    }
    expect(screen.getByTestId("login-submit-button")).toHaveTextContent(
      /^Login$/,
    );
  });

  it("탭 제목을 '로그인 · Testcase Craft' 로 둔다", () => {
    render(<Login onLoginSuccess={vi.fn()} />);
    expect(document.title).toBe("로그인 · Testcase Craft");
  });
});
