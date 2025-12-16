// src/main/frontend/src/components/TestExecution/TestExecutionFilterPanel.jsx

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';

const TestExecutionFilterPanel = ({ filters, onFilterChange, onApply, onClear }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = React.useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            {t('testExecution.filter.title', '필터')}
          </Typography>
          {hasActiveFilters && (
            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
              ({t('testExecution.filter.active', '적용 중')})
            </Typography>
          )}
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Grid container spacing={2}>
            {/* 테스트 케이스명 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-testcase-name"
                label={t('testExecution.filter.testCaseName', '테스트 케이스명')}
                value={filters.name || ''}
                onChange={(e) => onFilterChange('name', e.target.value)}
                fullWidth
                size="small"
                placeholder={t('testExecution.filter.testCaseName.placeholder', '케이스명 검색')}
              />
            </Grid>

            {/* 우선순위 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-priority"
                select
                label={t('testExecution.filter.priority', '우선순위')}
                value={filters.priority || ''}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">{t('testExecution.filter.all', '전체')}</MenuItem>
                <MenuItem value="HIGH">{t('testExecution.filter.priority.high', '높음')}</MenuItem>
                <MenuItem value="MEDIUM">{t('testExecution.filter.priority.medium', '중간')}</MenuItem>
                <MenuItem value="LOW">{t('testExecution.filter.priority.low', '낮음')}</MenuItem>
              </TextField>
            </Grid>

            {/* 결과 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-result"
                select
                label={t('testExecution.filter.result', '결과')}
                value={filters.result || ''}
                onChange={(e) => onFilterChange('result', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">{t('testExecution.filter.all', '전체')}</MenuItem>
                <MenuItem value="PASS">{t('testExecution.filter.result.pass', 'PASS')}</MenuItem>
                <MenuItem value="FAIL">{t('testExecution.filter.result.fail', 'FAIL')}</MenuItem>
                <MenuItem value="BLOCKED">{t('testExecution.filter.result.blocked', 'BLOCKED')}</MenuItem>
                <MenuItem value="NOTRUN">{t('testExecution.filter.result.notRun', 'NOT RUN')}</MenuItem>
              </TextField>
            </Grid>

            {/* 실행자 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-executed-by"
                label={t('testExecution.filter.executedBy', '실행자')}
                value={filters.executedBy || ''}
                onChange={(e) => onFilterChange('executedBy', e.target.value)}
                fullWidth
                size="small"
                placeholder={t('testExecution.filter.executedBy.placeholder', 'username')}
              />
            </Grid>

            {/* 실행일자 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-execution-date"
                type="date"
                label={t('testExecution.filter.executionDate', '실행일자')}
                value={filters.executionDate || ''}
                onChange={(e) => onFilterChange('executionDate', e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>

            {/* JIRA 아이디 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-jira-issue-key"
                label={t('testExecution.filter.jiraIssueKey', 'JIRA 아이디')}
                value={filters.jiraIssueKey || ''}
                onChange={(e) => onFilterChange('jiraIssueKey', e.target.value)}
                fullWidth
                size="small"
                placeholder="PRJ-123"
              />
            </Grid>

            {/* 노트 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-notes"
                label={t('testExecution.filter.notes', '노트')}
                value={filters.notes || ''}
                onChange={(e) => onFilterChange('notes', e.target.value)}
                fullWidth
                size="small"
                placeholder={t('testExecution.filter.notes.placeholder', 'search notes')}
              />
            </Grid>

            {/* 버튼들 */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={onClear}
                  size="small"
                  disabled={!hasActiveFilters}
                >
                  {t('testExecution.filter.clear', '초기화')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={onApply}
                  size="small"
                >
                  {t('testExecution.filter.apply', '적용')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TestExecutionFilterPanel;
