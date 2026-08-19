// src/components/ProjectHeader.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  IconButton,
  Collapse,
  Divider,
  Button,
  Menu,
  MenuItem,
  ListItemText,
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
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  StarBorder as StarBorderIcon,
  UnfoldMore as UnfoldMoreIcon,
  FolderSpecial as FolderSpecialIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavigate } from "react-router-dom";
import { useRAG } from "../context/RAGContext.jsx";
import { useNavMode } from "../context/NavModeContext.jsx";
import {
  getVisibleNavItems,
  NAV_COUNT_KEYS,
} from "./navigation/projectNavItems.js";
import { CHROME_TYPOGRAPHY } from "../styles/layoutConstants";
import { useAuth } from "../context/AuthContext.jsx";
import useProjectRole from "../hooks/useProjectRole.js";
import { canManageProjectMembers } from "./TestCaseTree/utils/permissionUtils.js";

// projectNavItems 의 icon 식별자 → 실제 아이콘 컴포넌트
const TAB_ICONS = {
  dashboard: DashboardIcon,
  testcases: FormatListBulletedIcon,
  testplans: AssignmentIcon,
  executions: PlayCircleIcon,
  results: BarChartIcon,
  automation: SmartToyIcon,
  rag: DescriptionIcon,
  exploratory: TravelExploreIcon,
};

// 탭 라벨 우측 개수 배지 ("테스트 케이스 | 20" 형태)
const TabCountBadge = ({ count }) => (
  <Typography
    component="span"
    variant="caption"
    sx={{
      ml: 0.75,
      px: 0.75,
      py: 0.125,
      borderRadius: 1,
      bgcolor: "action.selected",
      color: "text.secondary",
      ...CHROME_TYPOGRAPHY.countBadge,
    }}
  >
    {count}
  </Typography>
);

TabCountBadge.propTypes = {
  count: PropTypes.number.isRequired,
};

function ProjectHeader({ tabIndex, onTabChange, showExploratoryTab = true }) {
  const {
    activeProject,
    testCases,
    testPlans,
    testExecutions,
    projects = [],
  } = useAppContext();
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isRagEnabled } = useRAG();
  // 사이드바 모드에서는 영역 이동을 사이드바가 맡으므로 탭을 그리지 않는다.
  // 브레드크럼·즐겨찾기·프로젝트 정보는 두 모드에서 공통으로 남는다.
  const { isSidebarMode } = useNavMode();
  const { user } = useAuth();

  const projectId = activeProject?.id;

  // 프로젝트 설정 진입은 관리 역할에게만 보인다.
  // 백엔드 멤버 API 가 PROJECT_MANAGER·LEAD_DEVELOPER 만 통과시키므로 같은 기준을 쓴다.
  const { projectRole } = useProjectRole(projectId, user);
  const showSettings = canManageProjectMembers(projectRole);

  // 탭 개수 배지 (프로젝트 진입 시 TestContext가 세 데이터셋을 모두 로드함)
  const testCaseCount = (testCases || []).filter(
    (tc) =>
      tc?.type === "testcase" && String(tc.projectId) === String(projectId),
  ).length;
  const testPlanCount = (testPlans || []).filter(
    (plan) => !plan?.projectId || String(plan.projectId) === String(projectId),
  ).length;
  const testExecutionCount = (testExecutions || []).filter(
    (exec) => !exec?.projectId || String(exec.projectId) === String(projectId),
  ).length;

  // 보이는 항목의 위치가 곧 tabIndex — RAG 비활성 시 탐색 세션이 6이 되는 기존 규칙과 같다.
  const navItems = getVisibleNavItems({
    isRagEnabled,
    showExploratory: showExploratoryTab,
  });
  const counts = {
    [NAV_COUNT_KEYS.testCases]: testCaseCount,
    [NAV_COUNT_KEYS.testPlans]: testPlanCount,
    [NAV_COUNT_KEYS.testExecutions]: testExecutionCount,
  };
  const currentItem = navItems[tabIndex];

  // ICT-PROJECT-HEADER-COLLAPSE: Initialize state from localStorage
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    try {
      return localStorage.getItem("projectHeaderCollapsed") === "true";
    } catch (e) {
      return false;
    }
  });

  // Persist state change
  const toggleHeader = () => {
    const newState = !isHeaderCollapsed;
    setIsHeaderCollapsed(newState);
    localStorage.setItem("projectHeaderCollapsed", String(newState));
  };

  if (!activeProject) return null;

  const handleProjectClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const tabStyle = {
    minHeight: "36px",
    px: 1,
    py: 0.5,
    borderRadius: 1,
    // 사이드바 항목과 같은 글자 규격 — 레이아웃을 바꿔도 크기가 튀지 않게
    ...CHROME_TYPOGRAPHY.navItem,
    textTransform: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-4px) scale(1.05)",
      color: "primary.main",
      backgroundColor: "action.hover",
      boxShadow: 3,
      fontWeight: "bold",
    },
  };

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        sx={{
          mb: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          {/* 사이드바 모드: 첫 크럼이 곧 프로젝트 선택기다 → "AgensGraph / 대시보드" 에서
              프로젝트 이름을 눌러 리스트에서 다른 프로젝트로 바로 전환한다.
              가로 탭 모드는 기존대로 "프로젝트 / AgensGraph / 대시보드". */}
          {isSidebarMode ? (
            <Button
              size="small"
              color="inherit"
              onClick={(e) => setProjectMenuAnchor(e.currentTarget)}
              startIcon={<FolderSpecialIcon fontSize="small" />}
              endIcon={<UnfoldMoreIcon fontSize="small" />}
              data-testid="breadcrumb-project-switcher"
              sx={{ textTransform: "none", py: 0, minWidth: 0 }}
            >
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {activeProject.name}
              </Typography>
            </Button>
          ) : (
            <Link
              underline="hover"
              color="inherit"
              href="#"
              onClick={handleProjectClick}
              data-testid="breadcrumb-project-link"
            >
              {t("projectHeader.breadcrumb.projects", "프로젝트")}
            </Link>
          )}
          {!isSidebarMode && (
            <Typography
              color={tabIndex === undefined ? "text.primary" : "inherit"}
              fontWeight={tabIndex === undefined ? "bold" : "normal"}
            >
              {activeProject.name}
            </Typography>
          )}
          {currentItem && (
            <Typography color="text.primary" fontWeight="bold">
              {t(currentItem.i18nKey, currentItem.label)}
            </Typography>
          )}
        </Breadcrumbs>

        <Menu
          open={Boolean(projectMenuAnchor)}
          anchorEl={projectMenuAnchor}
          onClose={() => setProjectMenuAnchor(null)}
          data-testid="breadcrumb-project-menu"
        >
          {projects.map((project) => (
            <MenuItem
              key={project.id}
              selected={String(project.id) === String(activeProject.id)}
              onClick={() => {
                setProjectMenuAnchor(null);
                if (String(project.id) !== String(activeProject.id)) {
                  navigate(`/projects/${project.id}`);
                }
              }}
              data-testid={`breadcrumb-project-option-${project.id}`}
            >
              <ListItemText
                primary={project.name}
                secondary={project.code || undefined}
              />
            </MenuItem>
          ))}
          {projects.length > 0 && <Divider />}
          <MenuItem
            onClick={() => {
              setProjectMenuAnchor(null);
              navigate("/projects");
            }}
            data-testid="breadcrumb-project-list-link"
          >
            {t("projectNav.project.openList", "프로젝트 목록 보기")}
          </MenuItem>
        </Menu>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/projects/${projectId}/bookmarks`)}
            title={t("bookmark.nav", "북마크")}
            data-testid="open-bookmarks-button"
          >
            <StarBorderIcon />
          </IconButton>
          {showSettings && (
            <IconButton
              size="small"
              onClick={() => navigate(`/projects/${projectId}/settings`)}
              title={t("projectSettings.title", "프로젝트 설정")}
              data-testid="open-project-settings-button"
            >
              <SettingsIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={toggleHeader}
            title={isHeaderCollapsed ? "Show details" : "Hide details"}
          >
            {isHeaderCollapsed ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowUpIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible description area */}
      <Collapse in={!isHeaderCollapsed}>
        {activeProject.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.25, mb: 0.5 }}
          >
            {activeProject.description}
          </Typography>
        )}
      </Collapse>

      {/* 영역 이동 — 가로 탭 모드에서만. 사이드바 모드는 ProjectSidebar 가 맡는다.
          항목 정의·testId·배지는 projectNavItems 한 곳에서 공유한다. */}
      {!isSidebarMode && (
        <Tabs
          value={tabIndex}
          onChange={onTabChange}
          aria-label="project tabs"
          sx={{ minHeight: "36px", mt: 0 }}
        >
          {navItems.map((item) => {
            const Icon = TAB_ICONS[item.icon];
            const label = t(item.i18nKey, item.label);
            const count = item.countKey ? counts[item.countKey] : undefined;
            return (
              <Tab
                key={item.key}
                icon={<Icon />}
                iconPosition="start"
                label={
                  typeof count === "number" ? (
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      {label}
                      <TabCountBadge count={count} />
                    </Box>
                  ) : (
                    label
                  )
                }
                sx={tabStyle}
                data-testid={item.testId}
              />
            );
          })}
        </Tabs>
      )}
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  showExploratoryTab: PropTypes.bool,
};

export default ProjectHeader;
