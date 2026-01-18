// src/components/TestCase/TestResultColumnMenu.jsx
// ICT-194 Phase 2: TestResultDetailTable 컴포넌트 분할 - 컬럼 설정 메뉴 분리

import React from 'react';
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  Checkbox,
  Button,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ViewColumn as ViewColumnIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';

/**
 * 테스트 결과 테이블 컬럼 표시/숨김 설정 메뉴
 * 재사용 가능한 컴포넌트로 분리
 */
const TestResultColumnMenu = ({
  anchorEl,
  open,
  onClose,
  columns = [],
  columnVisibility = {},
  onColumnVisibilityToggle,
  visibleColumns = []
}) => {
  const theme = useTheme();
  const { t } = useI18n();

  /**
   * 모든 컬럼 표시
   */
  const handleShowAll = () => {
    const newVisibility = {};
    columns.forEach(col => {
      newVisibility[col.field] = true;
    });

    columns.forEach(col => {
      if (!columnVisibility[col.field]) {
        onColumnVisibilityToggle(col.field);
      }
    });
  };

  /**
   * 필수 컬럼만 표시
   */
  const handleShowEssential = () => {
    const essentialFields = ['testCase', 'result', 'executedDate'];

    columns.forEach(col => {
      const shouldBeVisible = essentialFields.includes(col.field);
      const isCurrentlyVisible = columnVisibility[col.field] !== false;

      if (shouldBeVisible !== isCurrentlyVisible) {
        onColumnVisibilityToggle(col.field);
      }
    });
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 280,
          maxWidth: 320,
          borderRadius: 2,
          boxShadow: 3
        }
      }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
    >
      {/* 메뉴 헤더 */}
      <Box sx={{ p: 2, pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Typography variant="subtitle2" color="primary.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <ViewColumnIcon fontSize="small" />
          {t('testResult.columnMenu.title', '컬럼 표시 설정')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {t('testResult.columnMenu.description', '표시할 컬럼을 선택해주세요')}
        </Typography>
      </Box>

      {/* 전체 선택/해제 버튼 */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleShowAll}
          startIcon={<CheckIcon />}
          fullWidth
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.75rem',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          {t('testResult.columnMenu.showAll', '전체 표시')}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleShowEssential}
          startIcon={<ViewColumnIcon />}
          fullWidth
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.75rem',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          {t('testResult.columnMenu.showEssential', '필수만 표시')}
        </Button>
      </Box>

      <Divider />

      {/* 컬럼별 설정 */}
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {columns.map((col, index) => {
          const isVisible = columnVisibility[col.field] !== false;
          const isEssential = ['testCase', 'result'].includes(col.field);

          return (
            <MenuItem
              key={col.field}
              sx={{
                py: 1,
                px: 2,
                '&:hover': {
                  bgcolor: isVisible ? 'primary.light' : 'action.hover'
                },
                bgcolor: isVisible ? 'action.selected' : 'transparent'
              }}
              onClick={() => !isEssential && onColumnVisibilityToggle(col.field)}
              disabled={isEssential}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                {/* 체크박스 */}
                <Checkbox
                  checked={isVisible}
                  onChange={() => onColumnVisibilityToggle(col.field)}
                  size="small"
                  disabled={isEssential}
                  color="primary"
                />

                {/* 컬럼 정보 */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    color={isVisible ? 'primary.dark' : 'text.primary'}
                    fontWeight={isVisible ? 'medium' : 'normal'}
                  >
                    {col.headerName}
                  </Typography>
                  {isEssential && (
                    <Typography variant="caption" color="warning.main">
                      {t('testResult.columnMenu.required', '필수 컬럼')}
                    </Typography>
                  )}
                </Box>

                {/* 컬럼 순서 표시 */}
                <Typography variant="caption" color="text.secondary">
                  {index + 1}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Box>

      <Divider />

      {/* 하단 요약 정보 */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          📊 {t('testResult.columnMenu.summary', '표시 중: {visible}/{total}개 컬럼', { visible: visibleColumns.length, total: columns.length })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          💡 {t('testResult.columnMenu.tip', '팁: 테스트케이스와 결과는 필수 컬럼으로 항상 표시됩니다')}
        </Typography>
      </Box>
    </Menu>
  );
};

export default TestResultColumnMenu;