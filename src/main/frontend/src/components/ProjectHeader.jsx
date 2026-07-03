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
  Hub as HubIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavigate } from "react-router-dom";
import { useRAG } from "../context/RAGContext.jsx";

// 탭 라벨 우측 개수 배지 (Testiny 스타일 "테스트 케이스 | 20")
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
      fontWeight: 600,
      lineHeight: 1.4,
    }}
  >
    {count}
  </Typography>
);

TabCountBadge.propTypes = {
  count: PropTypes.number.isRequired,
};

function ProjectHeader({ tabIndex, onTabChange, showExploratoryTab = true }) {
  const { activeProject, testCases, testPlans, testExecutions } =
    useAppContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isRagEnabled } = useRAG();

  const projectId = activeProject?.id;

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
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={handleProjectClick}
          >
            {t("projectHeader.breadcrumb.projects", "프로젝트")}
          </Link>
          <Typography
            color={tabIndex === undefined ? "text.primary" : "inherit"}
            fontWeight={tabIndex === undefined ? "bold" : "normal"}
          >
            {activeProject.name}
          </Typography>
          {tabIndex !== undefined && (
            <Typography color="text.primary" fontWeight="bold">
              {tabIndex === 0 && t("projectHeader.tabs.dashboard", "대시보드")}
              {tabIndex === 1 &&
                t("projectHeader.tabs.testCases", "테스트케이스")}
              {tabIndex === 2 && t("testPlan.tab.label", "테스트플랜")}
              {tabIndex === 3 &&
                t("projectHeader.tabs.testExecution", "테스트실행")}
              {tabIndex === 4 &&
                t("projectHeader.tabs.testResults", "테스트결과")}
              {tabIndex === 5 &&
                t("projectHeader.tabs.automation", "자동화 테스트")}
              {tabIndex === 6 &&
                (isRagEnabled
                  ? t("projectHeader.tabs.ragDocuments", "RAG 문서")
                  : t("projectHeader.tabs.exploratorySessions", "탐색 세션"))}
              {tabIndex === 7 &&
                t("projectHeader.tabs.exploratorySessions", "탐색 세션")}
            </Typography>
          )}
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={() => navigate("/graph")}
            title={t("graph.nav", "그래프 뷰")}
            data-testid="open-graph-button"
          >
            <HubIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/projects/${projectId}/bookmarks`)}
            title={t("bookmark.nav", "북마크")}
            data-testid="open-bookmarks-button"
          >
            <StarBorderIcon />
          </IconButton>
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

      <Tabs
        value={tabIndex}
        onChange={onTabChange}
        aria-label="project tabs"
        sx={{ minHeight: "36px", mt: isHeaderCollapsed ? 0 : 0 }}
      >
        <Tab
          icon={<DashboardIcon />}
          iconPosition="start"
          label={t("projectHeader.tabs.dashboard", "대시보드")}
          sx={tabStyle}
          data-testid="tab-dashboard"
        />
        <Tab
          icon={<FormatListBulletedIcon />}
          iconPosition="start"
          label={
            <Box
              component="span"
              sx={{ display: "flex", alignItems: "center" }}
            >
              {t("projectHeader.tabs.testCases", "테스트케이스")}
              <TabCountBadge count={testCaseCount} />
            </Box>
          }
          sx={tabStyle}
          data-testid="tab-testcases"
        />
        <Tab
          icon={<AssignmentIcon />}
          iconPosition="start"
          label={
            <Box
              component="span"
              sx={{ display: "flex", alignItems: "center" }}
            >
              {t("testPlan.tab.label", "테스트플랜")}
              <TabCountBadge count={testPlanCount} />
            </Box>
          }
          sx={tabStyle}
          data-testid="tab-testplans"
        />
        <Tab
          icon={<PlayCircleIcon />}
          iconPosition="start"
          label={
            <Box
              component="span"
              sx={{ display: "flex", alignItems: "center" }}
            >
              {t("projectHeader.tabs.testExecution", "테스트실행")}
              <TabCountBadge count={testExecutionCount} />
            </Box>
          }
          sx={tabStyle}
          data-testid="tab-executions"
        />
        <Tab
          icon={<BarChartIcon />}
          iconPosition="start"
          label={t("projectHeader.tabs.testResults", "테스트결과")}
          sx={tabStyle}
          data-testid="tab-results"
        />
        <Tab
          icon={<SmartToyIcon />}
          iconPosition="start"
          label={t("projectHeader.tabs.automation", "자동화 테스트")}
          sx={tabStyle}
          data-testid="tab-automation"
        />
        {/* RAG 비활성화 시 탭 자동 숨김, 활성화 시 자동 표시 */}
        {isRagEnabled && (
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label={t("projectHeader.tabs.ragDocuments", "RAG 문서")}
            sx={tabStyle}
            data-testid="tab-rag"
          />
        )}
        {showExploratoryTab && (
          <Tab
            icon={<TravelExploreIcon />}
            iconPosition="start"
            label={t("projectHeader.tabs.exploratorySessions", "탐색 세션")}
            sx={tabStyle}
            data-testid="tab-exploratory"
          />
        )}
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  showExploratoryTab: PropTypes.bool,
};

export default ProjectHeader;
