// src/components/RecentTestResults.jsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Block,
  PlayArrow,
  Refresh,
  AccessTime
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
// ICT-194 Phase 2: 통합된 테스트 결과 상수 사용
import { TEST_RESULT_CONFIG } from '../utils/testResultConstants.js';

const RecentTestResults = ({ 
  results = [], 
  loading = false, 
  error = null,
  onRefresh,
  showProjectInfo = true,
  showExecutionInfo = true,
  maxHeight = 400
}) => {
  const getResultConfig = (result) => TEST_RESULT_CONFIG[result] || TEST_RESULT_CONFIG.NOT_RUN;

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '미실행';
    try {
      return formatDistanceToNow(parseISO(dateString), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          최근 테스트 결과가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ maxHeight, overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          최근 테스트 결과 ({results.length}개)
        </Typography>
        {onRefresh && (
          <Tooltip title="새로고침">
            <IconButton onClick={onRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <List sx={{ p: 0 }}>
        {results.map((result, index) => {
          const config = getResultConfig(result.result);
          const IconComponent = config.icon;
          
          return (
            <React.Fragment key={result.testResultId || index}>
              <ListItem sx={{ py: 1.5, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <IconComponent 
                    sx={{ 
                      color: config.color,
                      fontSize: 20
                    }} 
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {result.testCaseName || `테스트케이스 ${result.testCaseId}`}
                      </Typography>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          backgroundColor: config.color,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {showProjectInfo && result.projectName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          프로젝트: {result.projectName}
                        </Typography>
                      )}
                      
                      {showExecutionInfo && result.testExecutionName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          실행: {result.testExecutionName}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(result.executedAt)}
                        </Typography>
                        
                        {result.executedBy && (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              실행자: {result.executedBy}
                            </Typography>
                          </>
                        )}
                      </Box>
                      
                      {result.notes && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5,
                            fontStyle: 'italic',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          메모: {result.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              {index < results.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default RecentTestResults;