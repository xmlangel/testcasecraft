// src/components/ProjectHeader.jsx

import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavigate } from 'react-router-dom';

function ProjectHeader({ tabIndex, onTabChange }) {
  const { activeProject } = useAppContext();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!activeProject) return null;

  const handleProjectClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ mb: 0 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="#" onClick={handleProjectClick}>
            {t('projectHeader.breadcrumb.projects', '프로젝트')}
          </Link>
          <Typography color="text.primary" fontWeight="bold">{activeProject.name}</Typography>
        </Breadcrumbs>
        {/* Compact description below breadcrumbs */}
        {activeProject.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {activeProject.description}
          </Typography>
        )}
      </Box>
      <Tabs
        value={tabIndex}
        onChange={onTabChange}
        aria-label="project tabs"
        sx={{ minHeight: '48px' }}
      >
        <Tab icon={<DashboardIcon />} iconPosition="start" label={t('projectHeader.tabs.dashboard', '대시보드')} sx={{ minHeight: '48px' }} />
        <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label={t('projectHeader.tabs.testCases', '테스트케이스')} sx={{ minHeight: '48px' }} />
        <Tab icon={<AssignmentIcon />} iconPosition="start" label={t('testPlan.tab.label', '테스트플랜')} sx={{ minHeight: '48px' }} />
        <Tab icon={<PlayCircleIcon />} iconPosition="start" label={t('projectHeader.tabs.testExecution', '테스트실행')} sx={{ minHeight: '48px' }} />
        <Tab icon={<BarChartIcon />} iconPosition="start" label={t('projectHeader.tabs.testResults', '테스트결과')} sx={{ minHeight: '48px' }} />
        <Tab icon={<SmartToyIcon />} iconPosition="start" label={t('projectHeader.tabs.automation', '자동화 테스트')} sx={{ minHeight: '48px' }} />
        <Tab icon={<DescriptionIcon />} iconPosition="start" label={t('projectHeader.tabs.ragDocuments', 'RAG 문서')} sx={{ minHeight: '48px' }} />
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default ProjectHeader;
