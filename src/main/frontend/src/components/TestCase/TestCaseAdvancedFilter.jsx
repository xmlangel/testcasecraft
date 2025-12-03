import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Typography,
  Button,
  Divider,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  DatePicker
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

const TestCaseAdvancedFilter = ({
  onFilterChange,
  onSearchChange,
  initialFilters = {},
  availableTags = [],
  projects = []
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    type: '',
    status: '',
    tags: [],
    createdDateFrom: null,
    createdDateTo: null,
    updatedDateFrom: null,
    updatedDateTo: null,
    hasSteps: null,
    hasResults: null,
    projectIds: [],
    ...initialFilters
  });

  const [searchDebounce, setSearchDebounce] = useState(null);

  useEffect(() => {
    // 검색어 디바운싱
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      onSearchChange(filters.search);
    }, 300);

    setSearchDebounce(timeout);

    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [filters.search]);

  useEffect(() => {
    // 검색어 외의 필터 변경 즉시 적용
    const { search, ...otherFilters } = filters;
    onFilterChange(otherFilters);
  }, [
    filters.priority,
    filters.type,
    filters.status,
    filters.tags,
    filters.createdDateFrom,
    filters.createdDateTo,
    filters.updatedDateFrom,
    filters.updatedDateTo,
    filters.hasSteps,
    filters.hasResults,
    filters.projectIds
  ]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      priority: '',
      type: '',
      status: '',
      tags: [],
      createdDateFrom: null,
      createdDateTo: null,
      updatedDateFrom: null,
      updatedDateTo: null,
      hasSteps: null,
      hasResults: null,
      projectIds: []
    };
    setFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.tags.length > 0) count++;
    if (filters.createdDateFrom || filters.createdDateTo) count++;
    if (filters.updatedDateFrom || filters.updatedDateTo) count++;
    if (filters.hasSteps !== null) count++;
    if (filters.hasResults !== null) count++;
    if (filters.projectIds.length > 0) count++;
    return count;
  };

  const priorityOptions = [
    { value: 'HIGH', label: '높음', color: 'error' },
    { value: 'MEDIUM', label: '보통', color: 'warning' },
    { value: 'LOW', label: '낮음', color: 'info' }
  ];

  const typeOptions = [
    { value: 'testcase', label: '테스트케이스' },
    { value: 'folder', label: '폴더' },
    { value: 'systemFolder', label: '시스템 폴더' }
  ];

  const statusOptions = [
    { value: 'PASS', label: '통과', color: 'success' },
    { value: 'FAIL', label: '실패', color: 'error' },
    { value: 'PENDING', label: '대기', color: 'warning' },
    { value: 'SKIP', label: '건너뜀', color: 'default' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder={t('testcase.advancedFilter.searchPlaceholder', '테스트케이스 이름, 설명, 단계 내용 검색...')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ mr: 1 }}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }
            }}
          />

          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 1 }}
          >
            <FilterIcon />
            {getActiveFilterCount() > 0 && (
              <Chip
                size="small"
                label={getActiveFilterCount()}
                color="primary"
                sx={{ position: 'absolute', top: -8, right: -8, minWidth: 20, height: 20 }}
              />
            )}
          </IconButton>

          {getActiveFilterCount() > 0 && (
            <IconButton onClick={clearAllFilters} sx={{ ml: 1 }}>
              <ClearIcon />
            </IconButton>
          )}

          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <FormControl size="small">
              <InputLabel>우선순위</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="우선순위"
              >
                <MenuItem value="">전체</MenuItem>
                {priorityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" label={option.label} color={option.color} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>유형</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="유형"
              >
                <MenuItem value="">전체</MenuItem>
                {typeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>실행 상태</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="실행 상태"
              >
                <MenuItem value="">전체</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" label={option.label} color={option.color} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              size="small"
              options={projects}
              getOptionLabel={(option) => option.name}
              value={projects.filter(p => filters.projectIds.includes(p.id))}
              onChange={(event, newValue) => {
                handleFilterChange('projectIds', newValue.map(p => p.id));
              }}
              renderInput={(params) => (
                <TextField {...params} label="프로젝트" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option.name}
                      size="small"
                      {...tagProps}
                    />
                  );
                })
              }
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <DatePicker
              label="생성일 시작"
              value={filters.createdDateFrom}
              onChange={(date) => handleFilterChange('createdDateFrom', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <DatePicker
              label="생성일 종료"
              value={filters.createdDateTo}
              onChange={(date) => handleFilterChange('createdDateTo', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <DatePicker
              label="수정일 시작"
              value={filters.updatedDateFrom}
              onChange={(date) => handleFilterChange('updatedDateFrom', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <DatePicker
              label="수정일 종료"
              value={filters.updatedDateTo}
              onChange={(date) => handleFilterChange('updatedDateTo', date)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasSteps === true}
                  indeterminate={filters.hasSteps === null}
                  onChange={(e) => {
                    if (filters.hasSteps === null) {
                      handleFilterChange('hasSteps', true);
                    } else if (filters.hasSteps === true) {
                      handleFilterChange('hasSteps', false);
                    } else {
                      handleFilterChange('hasSteps', null);
                    }
                  }}
                />
              }
              label="테스트 단계 있음"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasResults === true}
                  indeterminate={filters.hasResults === null}
                  onChange={(e) => {
                    if (filters.hasResults === null) {
                      handleFilterChange('hasResults', true);
                    } else if (filters.hasResults === true) {
                      handleFilterChange('hasResults', false);
                    } else {
                      handleFilterChange('hasResults', null);
                    }
                  }}
                />
              }
              label="실행 결과 있음"
            />
          </Box>

          <Autocomplete
            multiple
            size="small"
            options={availableTags}
            value={filters.tags}
            onChange={(event, newValue) => handleFilterChange('tags', newValue)}
            renderInput={(params) => (
              <TextField {...params} label="태그" placeholder="태그를 선택하세요..." />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={option}
                    size="small"
                    {...tagProps}
                  />
                );
              })
            }
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button variant="outlined" onClick={clearAllFilters} size="small">
              필터 초기화
            </Button>
          </Box>
        </Collapse>

        {/* 활성 필터 표시 */}
        {getActiveFilterCount() > 0 && !expanded && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              활성 필터:
            </Typography>
            {filters.priority && (
              <Chip
                size="small"
                label={`우선순위: ${priorityOptions.find(p => p.value === filters.priority)?.label}`}
                onDelete={() => handleFilterChange('priority', '')}
              />
            )}
            {filters.type && (
              <Chip
                size="small"
                label={`유형: ${typeOptions.find(t => t.value === filters.type)?.label}`}
                onDelete={() => handleFilterChange('type', '')}
              />
            )}
            {filters.tags.length > 0 && (
              <Chip
                size="small"
                label={`태그: ${filters.tags.length}개`}
                onDelete={() => handleFilterChange('tags', [])}
              />
            )}
            {filters.projectIds.length > 0 && (
              <Chip
                size="small"
                label={`프로젝트: ${filters.projectIds.length}개`}
                onDelete={() => handleFilterChange('projectIds', [])}
              />
            )}
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default TestCaseAdvancedFilter;