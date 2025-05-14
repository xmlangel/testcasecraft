// src/components/ProjectHeader.js

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
import { useAppContext } from "../context/AppContext";

function ProjectHeader({ tabIndex, onTabChange }) {
  const { activeProject } = useAppContext();

  if (!activeProject) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="#" onClick={e => { e.preventDefault(); window.location.reload(); }}>
            프로젝트
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
        <Tab icon={<DashboardIcon />} label="대시보드" />
        <Tab icon={<FormatListBulletedIcon />} label="테스트케이스" />
        <Tab icon={<AssignmentIcon />} label="테스트플랜" />
        <Tab icon={<PlayCircleIcon />} label="테스트실행" />
      </Tabs>
    </Box>
  );
}

ProjectHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default ProjectHeader;
