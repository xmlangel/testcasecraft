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
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="#" onClick={handleProjectClick}>
            {t('projectHeader.breadcrumb.projects', '프로젝트')}
          </Link>
          <Typography color="text.primary">{activeProject.name}</Typography>
        </Breadcrumbs>
        <Typography variant="h5" component="div" sx={{ mt: 1 }}>
          {activeProject.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {activeProject.description}
        </Typography>
      </Box>
      <Tabs value={tabIndex} onChange={onTabChange} aria-label="project tabs">
        <Tab icon={<DashboardIcon />} label={t('projectHeader.tabs.dashboard', '대시보드')} />
        <Tab icon={<FormatListBulletedIcon />} label={t('projectHeader.tabs.testCases', '테스트케이스')} />
        <Tab icon={<AssignmentIcon />} label={t('testPlan.tab.label', '테스트플랜')} />
        <Tab icon={<PlayCircleIcon />} label={t('projectHeader.tabs.testExecution', '테스트실행')} />
        <Tab icon={<BarChartIcon />} label={t('projectHeader.tabs.testResults', '테스트결과')} />
        <Tab icon={<SmartToyIcon />} label={t('projectHeader.tabs.automation', '자동화 테스트')} />
        <Tab icon={<DescriptionIcon />} label={t('projectHeader.tabs.ragDocuments', 'RAG 문서')} />
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default ProjectHeader;
