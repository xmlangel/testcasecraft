// src/components/TestCase/InputModeToggle.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup, 
  Typography, 
  Tooltip,
  Paper 
} from '@mui/material';
import { 
  ViewList as FormIcon, 
  TableChart as SpreadsheetIcon 
} from '@mui/icons-material';

const InputModeToggle = ({ mode, onChange, testCaseCount = 0 }) => {
  const handleModeChange = (event, newMode) => {
    if (newMode !== null && onChange) {
      onChange(newMode);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            입력 모드 선택
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'form' 
              ? '개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.'
              : '스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.'
            }
          </Typography>
        </Box>
        
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="입력 모드 선택"
          size="medium"
        >
          <Tooltip title="개별 폼으로 상세 입력 (기존 방식)">
            <ToggleButton value="form" aria-label="폼 모드">
              <FormIcon sx={{ mr: 1 }} />
              개별 폼
            </ToggleButton>
          </Tooltip>
          
          <Tooltip title="스프레드시트로 일괄 입력 (신규 기능)">
            <ToggleButton value="spreadsheet" aria-label="스프레드시트 모드">
              <SpreadsheetIcon sx={{ mr: 1 }} />
              스프레드시트
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      {/* 모드별 추가 정보 표시 */}
      <Box sx={{ mt: 2 }}>
        {mode === 'form' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="primary">
              📝 현재 {testCaseCount}개의 테스트케이스가 있습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능
            </Typography>
          </Box>
        )}
        
        {mode === 'spreadsheet' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="primary">
              📊 Excel과 유사한 편집 환경을 제공합니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력
            </Typography>
          </Box>
        )}
      </Box>

      {/* 경고 메시지 (필요시) */}
      {testCaseCount > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="warning.main">
            ⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

InputModeToggle.propTypes = {
  mode: PropTypes.oneOf(['form', 'spreadsheet']).isRequired,
  onChange: PropTypes.func.isRequired,
  testCaseCount: PropTypes.number,
};

export default InputModeToggle;