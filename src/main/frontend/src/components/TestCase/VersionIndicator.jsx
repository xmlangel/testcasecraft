// src/components/TestCase/VersionIndicator.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Chip, Typography, IconButton, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Restore as RestoreIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const VersionIndicator = ({ 
  testCaseId, 
  currentVersion, 
  onVersionHistory, 
  onCreateVersion, 
  onRestoreVersion,
  showMenu = true,
  compact = false 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [versionStatus, setVersionStatus] = useState('current');

  useEffect(() => {
    // 버전 상태 결정 로직
    if (!currentVersion) {
      setVersionStatus('none');
    } else if (currentVersion.isCurrentVersion) {
      setVersionStatus('current');
    } else {
      setVersionStatus('outdated');
    }
  }, [currentVersion]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVersionHistory = () => {
    if (onVersionHistory) {
      onVersionHistory(testCaseId);
    }
    handleMenuClose();
  };

  const handleCreateVersion = () => {
    if (onCreateVersion) {
      onCreateVersion(testCaseId);
    }
    handleMenuClose();
  };

  const getVersionStatusConfig = (status) => {
    switch (status) {
      case 'current':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: 'success',
          label: '최신 버전',
          tooltip: '현재 최신 버전입니다'
        };
      case 'outdated':
        return {
          icon: <WarningIcon fontSize="small" />,
          color: 'warning',
          label: '이전 버전',
          tooltip: '더 새로운 버전이 있습니다'
        };
      case 'draft':
        return {
          icon: <EditIcon fontSize="small" />,
          color: 'info',
          label: '임시 저장',
          tooltip: '임시 저장된 버전입니다'
        };
      case 'none':
      default:
        return {
          icon: <ScheduleIcon fontSize="small" />,
          color: 'default',
          label: '버전 없음',
          tooltip: '버전이 생성되지 않았습니다'
        };
    }
  };

  const statusConfig = getVersionStatusConfig(versionStatus);

  if (compact) {
    return (
      <Tooltip title={statusConfig.tooltip}>
        <Chip
          icon={statusConfig.icon}
          label={currentVersion ? `v${currentVersion.versionNumber}` : 'v0'}
          size="small"
          color={statusConfig.color}
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* 버전 상태 칩 */}
      <Tooltip title={statusConfig.tooltip}>
        <Chip
          icon={statusConfig.icon}
          label={
            currentVersion
              ? `${statusConfig.label} (v${currentVersion.versionNumber})`
              : statusConfig.label
          }
          size="small"
          color={statusConfig.color}
          variant={versionStatus === 'current' ? 'filled' : 'outlined'}
        />
      </Tooltip>

      {/* 버전 정보 텍스트 */}
      {currentVersion && !compact && (
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentVersion.changeSummary || '변경 내용 없음'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentVersion.createdByName} • {' '}
            {formatDistanceToNow(new Date(currentVersion.createdAt), {
              addSuffix: true,
              locale: ko
            })}
          </Typography>
        </Box>
      )}

      {/* 버전 관리 메뉴 */}
      {showMenu && (
        <>
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ ml: 'auto' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 200 }
            }}
          >
            <MenuItem onClick={handleVersionHistory}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="버전 히스토리" />
            </MenuItem>

            <MenuItem onClick={handleCreateVersion}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="새 버전 생성" />
            </MenuItem>

            {currentVersion && !currentVersion.isCurrentVersion && (
              <>
                <Divider />
                <MenuItem 
                  onClick={() => {
                    if (onRestoreVersion) {
                      onRestoreVersion(currentVersion.id);
                    }
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <RestoreIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="이 버전으로 복원" 
                    secondary="현재 버전으로 설정"
                  />
                </MenuItem>
              </>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default VersionIndicator;