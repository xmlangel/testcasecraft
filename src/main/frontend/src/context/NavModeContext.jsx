import React, { createContext, useContext, useMemo } from "react";
import { useUiPreference } from "../components/TestCase/useUiPreference.jsx";

const NavModeContext = createContext();

export const NAV_MODE_TABS = "tabs";
export const NAV_MODE_SIDEBAR = "sidebar";

/** 저장된 값이 깨졌거나 모르는 값이면 기존 동작(가로 탭)으로 되돌린다. */
const normalize = (value) =>
  value === NAV_MODE_SIDEBAR ? NAV_MODE_SIDEBAR : NAV_MODE_TABS;

/**
 * 프로젝트 네비게이션 표현 방식 컨텍스트.
 *
 * 두 가지를 사용자가 고른다.
 *  - navMode: "tabs"(기존 가로 탭) | "sidebar"(좌측 사이드바)
 *  - sidebarCollapsed: 사이드바를 아이콘만 남기고 접었는지
 *
 * InputModeContext 와 같은 방식으로 useUiPreference 에 얹어 서버에 사용자별로
 * 저장한다 — 다른 PC 에서 로그인해도 고른 구조가 유지된다.
 * 기본값은 "tabs" — 업데이트만으로 화면이 바뀌지 않게 한다.
 */
export const NavModeProvider = ({ children }) => {
  const [rawMode, setRawMode] = useUiPreference(
    "projectNavMode",
    NAV_MODE_TABS,
  );
  const [collapsed, setCollapsed] = useUiPreference(
    "projectNavSidebarCollapsed",
    false,
  );

  const navMode = normalize(rawMode);

  const value = useMemo(
    () => ({
      navMode,
      isSidebarMode: navMode === NAV_MODE_SIDEBAR,
      setNavMode: (next) => setRawMode(normalize(next)),
      toggleNavMode: () =>
        setRawMode((prev) =>
          normalize(prev) === NAV_MODE_SIDEBAR
            ? NAV_MODE_TABS
            : NAV_MODE_SIDEBAR,
        ),
      sidebarCollapsed: Boolean(collapsed),
      toggleSidebarCollapsed: () => setCollapsed((prev) => !prev),
    }),
    [navMode, collapsed, setRawMode, setCollapsed],
  );

  return (
    <NavModeContext.Provider value={value}>{children}</NavModeContext.Provider>
  );
};

/**
 * 컨텍스트 밖에서도 안전하게 쓰인다 — 프로바이더가 없으면 기존 동작(가로 탭)으로
 * 응답한다. 단위 테스트가 컴포넌트를 프로바이더 없이 렌더하는 경우가 많아서다.
 */
export const useNavMode = () => {
  const context = useContext(NavModeContext);
  if (!context) {
    return {
      navMode: NAV_MODE_TABS,
      isSidebarMode: false,
      setNavMode: () => {},
      toggleNavMode: () => {},
      sidebarCollapsed: false,
      toggleSidebarCollapsed: () => {},
    };
  }
  return context;
};

export default NavModeContext;
