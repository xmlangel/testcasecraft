// src/components/ProjectHeader.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Tabs, Tab, Breadcrumbs, Link, IconButton, Collapse } from "@mui/material";
import {
  FormatListBulleted as FormatListBulletedIcon,
  Assignment as AssignmentIcon,
  PlayCircle as PlayCircleIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  SmartToy as SmartToyIcon,
  Description as DescriptionIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavigate } from 'react-router-dom';

function ProjectHeader({ tabIndex, onTabChange }) {
  const { activeProject } = useAppContext();
  const { t } = useI18n();
  const navigate = useNavigate();

  // ICT-PROJECT-HEADER-COLLAPSE: Initialize state from localStorage
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    try {
      return localStorage.getItem('projectHeaderCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persist state change
  const toggleHeader = () => {
    const newState = !isHeaderCollapsed;
    setIsHeaderCollapsed(newState);
    localStorage.setItem('projectHeaderCollapsed', String(newState));
  };

  if (!activeProject) return null;

  const handleProjectClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const tabStyle = {
    minHeight: '36px',
    px: 1,
    py: 0.5,
    borderRadius: 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.05)',
      color: 'primary.main',
      backgroundColor: 'action.hover',
      boxShadow: 3,
      fontWeight: 'bold'
    }
  };

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ mb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="#" onClick={handleProjectClick}>
            {t('projectHeader.breadcrumb.projects', '프로젝트')}
          </Link>
          <Typography color="text.primary" fontWeight="bold">{activeProject.name}</Typography>
        </Breadcrumbs>

        <IconButton size="small" onClick={toggleHeader} title={isHeaderCollapsed ? "Show details" : "Hide details"}>
          {isHeaderCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </Box>

      {/* Collapsible description area */}
      <Collapse in={!isHeaderCollapsed}>
        {activeProject.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 0.5 }}>
            {activeProject.description}
          </Typography>
        )}
      </Collapse>

      <Tabs
        value={tabIndex}
        onChange={onTabChange}
        aria-label="project tabs"
        sx={{ minHeight: '36px', mt: isHeaderCollapsed ? 0 : 0 }}
      >
        <Tab icon={<DashboardIcon />} iconPosition="start" label={t('projectHeader.tabs.dashboard', '대시보드')} sx={tabStyle} />
        <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label={t('projectHeader.tabs.testCases', '테스트케이스')} sx={tabStyle} />
        <Tab icon={<AssignmentIcon />} iconPosition="start" label={t('testPlan.tab.label', '테스트플랜')} sx={tabStyle} />
        <Tab icon={<PlayCircleIcon />} iconPosition="start" label={t('projectHeader.tabs.testExecution', '테스트실행')} sx={tabStyle} />
        <Tab icon={<BarChartIcon />} iconPosition="start" label={t('projectHeader.tabs.testResults', '테스트결과')} sx={tabStyle} />
        <Tab icon={<SmartToyIcon />} iconPosition="start" label={t('projectHeader.tabs.automation', '자동화 테스트')} sx={tabStyle} />
        <Tab icon={<DescriptionIcon />} iconPosition="start" label={t('projectHeader.tabs.ragDocuments', 'RAG 문서')} sx={tabStyle} />
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default ProjectHeader;
