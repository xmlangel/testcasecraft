// src/components/ProjectSidebar.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FormatListBulleted as FormatListBulletedIcon,
  Assignment as AssignmentIcon,
  PlayCircle as PlayCircleIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  SmartToy as SmartToyIcon,
  Description as DescriptionIcon,
  TravelExplore as TravelExploreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavMode } from "../context/NavModeContext.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import {
  getVisibleNavItems,
  NAV_COUNT_KEYS,
} from "./navigation/projectNavItems.js";
import { CHROME_TYPOGRAPHY } from "../styles/layoutConstants";
import { CHROME_ICON_SX } from "./common/iconSizes.js";

const EXPANDED_WIDTH = 184;
const COLLAPSED_WIDTH = 56;

const ICONS = {
  dashboard: DashboardIcon,
  testcases: FormatListBulletedIcon,
  testplans: AssignmentIcon,
  executions: PlayCircleIcon,
  results: BarChartIcon,
  automation: SmartToyIcon,
  rag: DescriptionIcon,
  exploratory: TravelExploreIcon,
};

/** 항목 우측 개수 배지. 접힌 상태에서는 표시하지 않는다(폭이 없다). */
const CountBadge = ({ count }) => (
  <Typography
    component="span"
    variant="caption"
    sx={{
      ml: 0.75,
      px: 0.75,
      borderRadius: 1,
      bgcolor: "action.selected",
      color: "text.secondary",
      ...CHROME_TYPOGRAPHY.countBadge,
    }}
  >
    {count}
  </Typography>
);

CountBadge.propTypes = { count: PropTypes.number.isRequired };

/**
 * 좌측 영역 이동 사이드바 (가로 탭의 대체 표현).
 *
 * 항목 정의·data-testid·개수 배지는 가로 탭과 같은 소스(projectNavItems)를 쓴다.
 * 그래서 사용자가 어느 구조를 고르든 같은 순서·같은 테스트 훅이 유지된다.
 * 선택 값도 tabIndex 를 그대로 쓰므로 본문 렌더 코드는 손대지 않는다.
 */
function ProjectSidebar({
  tabIndex,
  onSelect,
  counts,
  isRagEnabled = false,
  showExploratory = false,
}) {
  const { t } = useI18n();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useNavMode();
  // 개수 배지는 가로 탭과 같은 소스를 본다. counts 를 넘기면 그 값을 쓴다(테스트용).
  const ctx = useAppContext() || {};
  const projectId = ctx.activeProject?.id;
  const derivedCounts = {
    [NAV_COUNT_KEYS.testCases]: (ctx.testCases || []).filter(
      (tc) =>
        tc?.type === "testcase" && String(tc.projectId) === String(projectId),
    ).length,
    [NAV_COUNT_KEYS.testPlans]: (ctx.testPlans || []).filter(
      (plan) =>
        !plan?.projectId || String(plan.projectId) === String(projectId),
    ).length,
    [NAV_COUNT_KEYS.testExecutions]: (ctx.testExecutions || []).filter(
      (exec) =>
        !exec?.projectId || String(exec.projectId) === String(projectId),
    ).length,
  };
  const effectiveCounts = counts || derivedCounts;

  const items = getVisibleNavItems({ isRagEnabled, showExploratory });
  const width = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box
      component="nav"
      aria-label={t("projectNav.sidebar.aria", "프로젝트 영역")}
      data-testid="project-sidebar"
      sx={{
        width,
        minWidth: width,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.15s ease",
      }}
    >
      <List dense sx={{ py: 0.5, flexGrow: 1, ...CHROME_ICON_SX }}>
        {items.map((item, itemIndex) => {
          // 보이는 항목의 위치가 곧 tabIndex — 가로 탭(MUI Tabs)의 값 규칙과 같다.
          const Icon = ICONS[item.icon] || DashboardIcon;
          const selected = tabIndex === itemIndex;
          const label = t(item.i18nKey, item.label);
          const count = item.countKey
            ? effectiveCounts[item.countKey]
            : undefined;

          return (
            <ListItemButton
              key={item.key}
              selected={selected}
              onClick={() => onSelect(itemIndex)}
              data-testid={item.testId}
              title={sidebarCollapsed ? label : undefined}
              sx={{
                ...CHROME_ICON_SX,
                minHeight: 40,
                px: 1.25,
                borderLeft: 3,
                borderColor: selected ? "primary.main" : "transparent",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarCollapsed ? 0 : 1.25,
                  color: selected ? "primary.main" : "inherit",
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText
                  primary={
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        component="span"
                        sx={
                          selected
                            ? CHROME_TYPOGRAPHY.navItemSelected
                            : CHROME_TYPOGRAPHY.navItem
                        }
                      >
                        {label}
                      </Box>
                      {typeof count === "number" && (
                        <CountBadge count={count} />
                      )}
                    </Box>
                  }
                  sx={{ my: 0 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: sidebarCollapsed ? "center" : "flex-end",
          p: 0.5,
        }}
      >
        <Tooltip
          title={
            sidebarCollapsed
              ? t("projectNav.sidebar.expand", "사이드바 펼치기")
              : t("projectNav.sidebar.collapse", "사이드바 접기")
          }
        >
          <IconButton
            size="small"
            onClick={toggleSidebarCollapsed}
            data-testid="project-sidebar-collapse-toggle"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

ProjectSidebar.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  counts: PropTypes.object,
  isRagEnabled: PropTypes.bool,
  showExploratory: PropTypes.bool,
};

export default ProjectSidebar;
