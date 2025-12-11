// src/main/frontend/src/components/ServerTimeDisplay.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { formatDateTime, getTimezoneOffset } from '../utils/timezoneUtils';

const ServerTimeDisplay = () => {
  const { user } = useAppContext();
  const [serverTimeState, setServerTimeState] = useState({
    time: '',
    loading: true,
    error: null
  });

  const fetchServerTime = async () => {
    try {
      const response = await fetch('/api/monitoring/server-time-iso');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setServerTimeState({
        time: data.serverTime, // ISO String
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('서버 시간 조회 실패:', error);
      setServerTimeState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    // 초기 로드
    fetchServerTime();

    // 30초마다 업데이트
    const interval = setInterval(fetchServerTime, 30000);

    return () => clearInterval(interval);
  }, []); // 의존성 배열 비움: 사용자 정보 변경 시에도 서버 시간 다시 조회 안함

  // 사용자 타임존 정보 (렌더링 시 계산)
  const userTimezone = user?.timezone || 'UTC';
  const isUTC = userTimezone === 'UTC';
  const timezoneOffset = getTimezoneOffset(userTimezone);

  if (serverTimeState.loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000
        }}
      >
        <TimeIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          시간 로딩 중...
        </Typography>
      </Box>
    );
  }

  if (serverTimeState.error) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'error.light',
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000
        }}
      >
        <TimeIcon fontSize="small" color="error" />
        <Typography variant="caption" color="error.main">
          시간 로드 실패
        </Typography>
      </Box>
    );
  }

  const getTimezoneChipColor = () => {
    if (isUTC) return 'success';
    if (userTimezone?.includes('Asia/Seoul')) return 'info';
    return 'default';
  };

  const getTimezoneLabel = () => {
    if (isUTC) return 'UTC';
    if (userTimezone?.includes('Asia/Seoul')) return 'KST';
    return userTimezone?.split('/').pop() || 'LOCAL';
  };

  const displayTime = formatDateTime(serverTimeState.time, userTimezone, 'datetime');

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        px: 2,
        py: 1,
        borderRadius: 1,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider',
        zIndex: 1000
      }}
    >
      <TimeIcon fontSize="small" color="primary" />

      <Typography
        variant="body2"
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'medium',
          color: 'text.primary'
        }}
      >
        {displayTime}
      </Typography>

      <Chip
        label={getTimezoneLabel()}
        size="small"
        color={getTimezoneChipColor()}
        variant="outlined"
        sx={{
          height: 20,
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}
      />

      {timezoneOffset && !isUTC && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: 'monospace' }}
        >
          ({timezoneOffset})
        </Typography>
      )}
    </Box>
  );
};

export default ServerTimeDisplay;