import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import AppHeaderNav from "./AppHeaderNav.jsx";
import { mockViewportWidth } from "../test/utils/mockMatchMedia.js";

const LABELS = {
  "header.nav.dashboard": "대시보드",
  "header.nav.projectSelection": "프로젝트 선택",
  "header.nav.organizationManagement": "조직 관리",
  "header.nav.userManagement": "사용자 관리",
  "header.nav.mailSettings": "메일 설정",
};
vi.mock("../context/I18nContext.jsx", () => ({
  useTranslation: () => ({ t: (key, def) => LABELS[key] ?? def ?? key }),
}));

/**
 * 상단 바 텍스트 메뉴 (ICT-510).
 *
 * 1024px 미만에서 "대시보드"·"관리 메뉴"·"프로젝트 선택" 라벨이 글자 단위로 꺾이고,
 * 오른쪽 테마·사용자 버튼이 화면 밖으로 밀렸다. 좁은 화면에서는 세 메뉴를 햄버거
 * 하나로 묶고, 넓은 화면은 이전처럼 글자 버튼을 늘어놓는다. 어느 쪽이든 같은 곳으로 이동해야 한다.
 */
describe("AppHeaderNav", () => {
  let restoreViewport;
  afterEach(() => {
    restoreViewport?.();
    restoreViewport = undefined;
  });

  it("1440px 관리자: 글자 버튼 세 개가 보이고 햄버거는 없다", () => {
    restoreViewport = mockViewportWidth(1440);
    render(<AppHeaderNav isAdmin onNavigate={vi.fn()} />);
    expect(screen.getByTestId("header-nav-dashboard")).toHaveTextContent(
      "대시보드",
    );
    expect(screen.getByTestId("header-nav-management")).toHaveTextContent(
      "관리 메뉴",
    );
    expect(screen.getByTestId("project-selection-nav")).toHaveTextContent(
      "프로젝트 선택",
    );
    expect(screen.queryByTestId("header-nav-hamburger")).toBeNull();
  });

  it("넓은 화면의 글자 버튼은 줄바꿈하지 않는다", () => {
    restoreViewport = mockViewportWidth(1440);
    render(<AppHeaderNav isAdmin onNavigate={vi.fn()} />);
    for (const id of [
      "header-nav-dashboard",
      "header-nav-management",
      "project-selection-nav",
    ]) {
      expect(screen.getByTestId(id)).toHaveStyle({ whiteSpace: "nowrap" });
    }
  });

  it("넓은 화면에서 관리 메뉴 항목을 누르면 그 경로로 이동한다", () => {
    restoreViewport = mockViewportWidth(1440);
    const onNavigate = vi.fn();
    render(<AppHeaderNav isAdmin onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId("header-nav-management"));
    fireEvent.click(screen.getByText("사용자 관리"));
    expect(onNavigate).toHaveBeenCalledWith("/users");
  });

  it("390px: 글자 버튼 대신 햄버거 하나만 그린다", () => {
    restoreViewport = mockViewportWidth(390);
    render(<AppHeaderNav isAdmin onNavigate={vi.fn()} />);
    expect(screen.getByTestId("header-nav-hamburger")).toBeInTheDocument();
    expect(screen.queryByTestId("header-nav-management")).toBeNull();
    expect(screen.queryByTestId("project-selection-nav")).toBeNull();
  });

  it("햄버거 메뉴에 대시보드·관리 항목·프로젝트 선택이 모두 들어 있다", () => {
    restoreViewport = mockViewportWidth(390);
    const onNavigate = vi.fn();
    render(<AppHeaderNav isAdmin onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId("header-nav-hamburger"));
    const menu = screen.getByRole("menu");
    for (const label of [
      "대시보드",
      "관리 메뉴",
      "조직 관리",
      "사용자 관리",
      "메일 설정",
      "LLM 설정",
      "스케줄러 관리",
      "프로젝트 선택",
    ]) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByTestId("project-selection-nav"));
    expect(onNavigate).toHaveBeenCalledWith("/projects");
  });

  it("햄버거 메뉴에서 관리 항목을 고르면 그 경로로 이동한다", () => {
    restoreViewport = mockViewportWidth(1023);
    const onNavigate = vi.fn();
    render(<AppHeaderNav isAdmin onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId("header-nav-hamburger"));
    fireEvent.click(screen.getByText("스케줄러 관리"));
    expect(onNavigate).toHaveBeenCalledWith("/scheduler");
  });

  it("관리자가 아니면 햄버거 메뉴에 프로젝트 선택만 있다", () => {
    restoreViewport = mockViewportWidth(390);
    render(<AppHeaderNav isAdmin={false} onNavigate={vi.fn()} />);
    fireEvent.click(screen.getByTestId("header-nav-hamburger"));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("프로젝트 선택")).toBeInTheDocument();
    expect(within(menu).queryByText("대시보드")).toBeNull();
    expect(within(menu).queryByText("사용자 관리")).toBeNull();
  });

  it("관리자가 아니면 넓은 화면에서도 프로젝트 선택 버튼만 있다", () => {
    restoreViewport = mockViewportWidth(1440);
    render(<AppHeaderNav isAdmin={false} onNavigate={vi.fn()} />);
    expect(screen.getByTestId("project-selection-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("header-nav-dashboard")).toBeNull();
    expect(screen.queryByTestId("header-nav-management")).toBeNull();
  });
});
