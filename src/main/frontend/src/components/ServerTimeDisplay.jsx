// src/main/frontend/src/components/ServerTimeDisplay.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { formatDateTime, getTimezoneOffset } from '../utils/timezoneUtils';

const ServerTimeDisplay = () => {
  const { user } = useAppContext();
  const [timeInfo, setTimeInfo] = useState({
    serverTime: '',
    timezone: '',
    isUTC: false,
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
      const userTimezone = user?.timezone || 'UTC';
      
      setTimeInfo({
        serverTime: data.serverTime, // ISO String
        timezone: userTimezone,
        isUTC: userTimezone === 'UTC',
        timezoneOffset: getTimezoneOffset(userTimezone),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('서버 시간 조회 실패:', error);
      setTimeInfo(prev => ({
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
  }, [user]);

  if (timeInfo.loading) {
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

  if (timeInfo.error) {
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
    if (timeInfo.isUTC) return 'success';
    if (timeInfo.timezone?.includes('Asia/Seoul')) return 'info';
    return 'default';
  };

  const getTimezoneLabel = () => {
    if (timeInfo.isUTC) return 'UTC';
    if (timeInfo.timezone?.includes('Asia/Seoul')) return 'KST';
    return timeInfo.timezone?.split('/').pop() || 'LOCAL';
  };
  
  const displayTime = formatDateTime(timeInfo.serverTime, timeInfo.timezone, 'datetime');

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
      
      {timeInfo.timezoneOffset && !timeInfo.isUTC && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontFamily: 'monospace' }}
        >
          ({timeInfo.timezoneOffset})
        </Typography>
      )}
    </Box>
  );
};

export default ServerTimeDisplay;