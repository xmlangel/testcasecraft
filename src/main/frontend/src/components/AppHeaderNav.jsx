// src/components/AppHeaderNav.jsx
//
// 상단 바의 텍스트 메뉴(대시보드 · 관리 메뉴 · 프로젝트 선택).
// ICT-510: 1024px 미만에서는 라벨이 글자 단위로 줄바꿈되고 오른쪽 아이콘 버튼(테마·사용자)이
// 화면 밖으로 밀렸다. 좁은 화면에서는 세 메뉴를 햄버거 버튼 하나로 묶고, 넓은 화면은
// 이전 모양을 그대로 둔다.

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Divider,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useTranslation } from "../context/I18nContext.jsx";
import { COMPACT_NAV_QUERY } from "../styles/responsive.js";

/** 관리 메뉴 항목. 순서는 이전 헤더와 같다. */
const MANAGEMENT_ITEMS = [
  { path: "/organizations", key: "header.nav.organizationManagement" },
  { path: "/users", key: "header.nav.userManagement" },
  { path: "/mail-settings", key: "header.nav.mailSettings" },
  { path: "/llm-config", key: "header.nav.llmConfig", fallback: "LLM 설정" },
  {
    path: "/scheduler",
    key: "header.nav.schedulerManagement",
    fallback: "스케줄러 관리",
  },
];

// 버튼 라벨이 좁아져도 글자 단위로 꺾이지 않게 한다.
const NOWRAP_BUTTON_SX = { whiteSpace: "nowrap", flexShrink: 0 };

function AppHeaderNav({ isAdmin, onNavigate }) {
  const { t } = useTranslation();
  const isCompact = useMediaQuery(COMPACT_NAV_QUERY);
  const [managementAnchorEl, setManagementAnchorEl] = useState(null);
  const [compactAnchorEl, setCompactAnchorEl] = useState(null);

  const go = (path) => {
    setManagementAnchorEl(null);
    setCompactAnchorEl(null);
    onNavigate(path);
  };

  const label = (item) =>
    item.fallback ? t(item.key, item.fallback) : t(item.key);

  if (isCompact) {
    const open = Boolean(compactAnchorEl);
    return (
      <>
        <Tooltip title={t("header.nav.menu", "메뉴")}>
          <IconButton
            color="inherit"
            onClick={(e) => setCompactAnchorEl(e.currentTarget)}
            aria-label={t("header.nav.menu", "메뉴")}
            aria-haspopup="true"
            aria-controls={open ? "header-compact-menu" : undefined}
            aria-expanded={open}
            data-testid="header-nav-hamburger"
            sx={{ flexShrink: 0 }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="header-compact-menu"
          anchorEl={compactAnchorEl}
          open={open}
          onClose={() => setCompactAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ list: { dense: true } }}
        >
          {isAdmin && (
            <MenuItem
              onClick={() => go("/dashboard")}
              data-testid="header-nav-dashboard"
            >
              <Typography variant="body2" noWrap>
                {t("header.nav.dashboard")}
              </Typography>
            </MenuItem>
          )}
          {isAdmin && (
            <ListSubheader sx={{ lineHeight: "32px" }}>
              {t("header.nav.managementMenu", "관리 메뉴")}
            </ListSubheader>
          )}
          {isAdmin &&
            MANAGEMENT_ITEMS.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => go(item.path)}
                sx={{ pl: 3 }}
              >
                <Typography variant="body2" noWrap>
                  {label(item)}
                </Typography>
              </MenuItem>
            ))}
          {isAdmin && <Divider />}
          <MenuItem
            onClick={() => go("/projects")}
            data-testid="project-selection-nav"
          >
            <Typography variant="body2" noWrap>
              {t("header.nav.projectSelection")}
            </Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      {isAdmin && (
        <Button
          color="inherit"
          onClick={() => go("/dashboard")}
          data-testid="header-nav-dashboard"
          sx={NOWRAP_BUTTON_SX}
        >
          {t("header.nav.dashboard")}
        </Button>
      )}
      {isAdmin && (
        <>
          <Button
            color="inherit"
            onClick={(e) => setManagementAnchorEl(e.currentTarget)}
            endIcon={<KeyboardArrowDownIcon />}
            aria-haspopup="true"
            aria-controls={
              Boolean(managementAnchorEl) ? "management-menu" : undefined
            }
            data-testid="header-nav-management"
            sx={NOWRAP_BUTTON_SX}
          >
            {t("header.nav.managementMenu", "관리 메뉴")}
          </Button>
          <Menu
            id="management-menu"
            anchorEl={managementAnchorEl}
            open={Boolean(managementAnchorEl)}
            onClose={() => setManagementAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
              sx: { minWidth: 200, mt: 1 },
            }}
            slotProps={{
              list: { dense: true },
            }}
          >
            {MANAGEMENT_ITEMS.map((item) => (
              <MenuItem key={item.path} onClick={() => go(item.path)}>
                <Typography variant="body2">{label(item)}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
      <Button
        color="inherit"
        onClick={() => go("/projects")}
        data-testid="project-selection-nav"
        sx={NOWRAP_BUTTON_SX}
      >
        {t("header.nav.projectSelection")}
      </Button>
    </>
  );
}

AppHeaderNav.propTypes = {
  isAdmin: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
};

export default AppHeaderNav;
