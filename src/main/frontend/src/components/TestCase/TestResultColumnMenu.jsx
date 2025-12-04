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
  Grid,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon
} from '@mui/icons-material';

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
  const handleShowEssentialOnly = () => {
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
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.light',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle1" color="primary.dark" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" />
          컬럼 표시 설정
        </Typography>
        <Typography variant="caption" color="text.secondary">
          표시할 컬럼을 선택해주세요
        </Typography>
      </Box>

      {/* 전체 선택/해제 버튼 */}
      <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={handleShowAll}
              sx={{ fontSize: '0.75rem' }}
            >
              전체 표시
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={handleShowEssentialOnly}
              sx={{ fontSize: '0.75rem' }}
            >
              필수만 표시
            </Button>
          </Grid>
        </Grid>
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
                      필수 컬럼
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
          📊 표시 중: {visibleColumns.length}/{columns.length}개 컬럼
        </Typography>
        <Typography variant="caption" color="text.secondary">
          💡 팁: 테스트케이스와 결과는 필수 컬럼으로 항상 표시됩니다
        </Typography>
      </Box>
    </Menu>
  );
};

export default TestResultColumnMenu;