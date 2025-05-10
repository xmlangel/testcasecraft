// src/components/ProjectHeader.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  FormatListBulleted as TestCaseIcon, 
  Assignment as TestPlanIcon, 
  PlayCircle as ExecutionIcon 
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

function ProjectHeader({ tabIndex, onTabChange }) {
  const { activeProject } = useAppContext();

  if (!activeProject) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* 프로젝트 이름 표시 */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
          >
            프로젝트
          </Link>
          <Typography color="text.primary">{activeProject.name}</Typography>
        </Breadcrumbs>
        <Typography variant="h5" component="div" sx={{ mt: 1 }}>
          {activeProject.name}
        </Typography>
        {activeProject.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {activeProject.description}
          </Typography>
        )}
      </Box>

      {/* 탭 메뉴 */}
      <Tabs 
        value={tabIndex} 
        onChange={onTabChange} 
        aria-label="project tabs"
      >
        <Tab icon={<TestCaseIcon />} label="테스트케이스" />
        <Tab icon={<TestPlanIcon />} label="테스트플랜" />
        <Tab icon={<ExecutionIcon />} label="테스트실행" />
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default ProjectHeader;
