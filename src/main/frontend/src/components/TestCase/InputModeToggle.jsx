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
  TableChart as SpreadsheetIcon,
  GridOn as AdvancedGridIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

const InputModeToggle = ({ mode, onChange, testCaseCount = 0 }) => {
  const { t } = useI18n();

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
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('testcase.inputMode.title', '입력 모드 선택')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'form'
              ? t('testcase.inputMode.form.description', '개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.')
              : t('testcase.inputMode.spreadsheet.description', '스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.')
            }
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label={t('testcase.inputMode.title', '입력 모드 선택')}
          size="medium"
        >
          <Tooltip title={t('testcase.inputMode.form.tooltip', '개별 폼으로 상세 입력 (기존 방식)')}>
            <ToggleButton value="form" aria-label={t('testcase.inputMode.form.ariaLabel', '폼 모드')}>
              <FormIcon sx={{ mr: 1 }} />
              {t('testcase.inputMode.form.title', '개별 폼')}
            </ToggleButton>
          </Tooltip>

          <Tooltip title={t('testcase.inputMode.spreadsheet.tooltip', '스프레드시트로 일괄 입력 (기본 버전)')}>
            <ToggleButton value="spreadsheet" aria-label={t('testcase.inputMode.spreadsheet.ariaLabel', '스프레드시트 모드')}>
              <SpreadsheetIcon sx={{ mr: 1 }} />
              {t('testcase.inputMode.spreadsheet.title', '스프레드시트')}
            </ToggleButton>
          </Tooltip>

          {/* 고급 스프레드시트 기능 임시 숨김 */}
          {/* <Tooltip title={t('testcase.inputMode.advancedSpreadsheet.tooltip', '고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)')}>
            <ToggleButton value="advanced-spreadsheet" aria-label={t('testcase.inputMode.advancedSpreadsheet.ariaLabel', '고급 스프레드시트 모드')}>
              <AdvancedGridIcon sx={{ mr: 1 }} />
              {t('testcase.inputMode.advancedSpreadsheet.title', '고급 스프레드시트')}
            </ToggleButton>
          </Tooltip> */}
        </ToggleButtonGroup>
      </Box>

      {/* 모드별 추가 정보 표시 */}
      <Box sx={{ mt: 2 }}>
        {mode === 'form' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="primary">
              {t('testcase.inputMode.form.status', '📝 현재 {count}개의 테스트케이스가 있습니다.', { count: testCaseCount })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('testcase.inputMode.form.features', '• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능')}
            </Typography>
          </Box>
        )}

        {mode === 'spreadsheet' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="primary">
              {t('testcase.inputMode.spreadsheet.status', '📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('testcase.inputMode.spreadsheet.features', '• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력')}
            </Typography>
          </Box>
        )}


        {/* 고급 스프레드시트 모드 설명 임시 숨김 */}
        {/* {mode === 'advanced-spreadsheet' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="primary">
              {t('testcase.inputMode.advancedSpreadsheet.status', '🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('testcase.inputMode.advancedSpreadsheet.features', '• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기')}
            </Typography>
          </Box>
        )} */}
      </Box>

      {/* 경고 메시지 (필요시) */}
      {testCaseCount > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="warning.main">
            {t('testcase.inputMode.warning.modeSwitch', '⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

InputModeToggle.propTypes = {
  mode: PropTypes.oneOf(['form', 'spreadsheet', 'advanced-spreadsheet']).isRequired,
  onChange: PropTypes.func.isRequired,
  testCaseCount: PropTypes.number,
};

export default InputModeToggle;