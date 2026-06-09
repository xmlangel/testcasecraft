// src/main/frontend/src/components/TestExecution/TestExecutionFilterPanel.jsx

import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";

const TestExecutionFilterPanel = ({
  filters,
  onFilterChange,
  onApply,
  onClear,
}) => {
  const { t } = useI18n();

  // priority·result 는 다중 선택(배열). 옵션 라벨은 renderValue 에서 재사용.
  const priorityOptions = [
    { value: "HIGH", label: t("testExecution.filter.priority.high", "높음") },
    {
      value: "MEDIUM",
      label: t("testExecution.filter.priority.medium", "중간"),
    },
    { value: "LOW", label: t("testExecution.filter.priority.low", "낮음") },
  ];
  const resultOptions = [
    { value: "PASS", label: t("testExecution.filter.result.pass", "PASS") },
    { value: "FAIL", label: t("testExecution.filter.result.fail", "FAIL") },
    {
      value: "BLOCKED",
      label: t("testExecution.filter.result.blocked", "BLOCKED"),
    },
    {
      value: "NOTRUN",
      label: t("testExecution.filter.result.notRun", "NOT RUN"),
    },
  ];
  const labelOf = (options, value) =>
    options.find((o) => o.value === value)?.label || value;
  const renderSelected = (options) => (selected) =>
    !selected || selected.length === 0
      ? t("testExecution.filter.all", "전체")
      : selected.map((v) => labelOf(options, v)).join(", ");

  const filterHasValue = (value) =>
    Array.isArray(value) ? value.length > 0 : !!(value && value !== "");
  const hasActiveFilters = Object.values(filters).some(filterHasValue);

  // 복원된(또는 적용 중인) 필터가 있으면 펼친 상태로 시작 — 보존된 값이 보이도록
  const [expanded, setExpanded] = React.useState(hasActiveFilters);

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            {t("testExecution.filter.title", "필터")}
          </Typography>
          {hasActiveFilters && (
            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
              ({t("testExecution.filter.active", "적용 중")})
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
                label={t(
                  "testExecution.filter.testCaseName",
                  "테스트 케이스명",
                )}
                value={filters.name || ""}
                onChange={(e) => onFilterChange("name", e.target.value)}
                fullWidth
                size="small"
                placeholder={t(
                  "testExecution.filter.testCaseName.placeholder",
                  "케이스명 (콤마로 여러 개)",
                )}
              />
            </Grid>

            {/* 우선순위 (다중 선택) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-priority"
                select
                label={t("testExecution.filter.priority", "우선순위")}
                value={Array.isArray(filters.priority) ? filters.priority : []}
                onChange={(e) => onFilterChange("priority", e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  select: {
                    multiple: true,
                    displayEmpty: true,
                    renderValue: renderSelected(priorityOptions),
                  },
                  inputLabel: { shrink: true },
                }}
              >
                {priorityOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox
                      size="small"
                      checked={
                        Array.isArray(filters.priority) &&
                        filters.priority.includes(opt.value)
                      }
                    />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* 결과 (다중 선택) */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-result"
                select
                label={t("testExecution.filter.result", "결과")}
                value={Array.isArray(filters.result) ? filters.result : []}
                onChange={(e) => onFilterChange("result", e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  select: {
                    multiple: true,
                    displayEmpty: true,
                    renderValue: renderSelected(resultOptions),
                  },
                  inputLabel: { shrink: true },
                }}
              >
                {resultOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox
                      size="small"
                      checked={
                        Array.isArray(filters.result) &&
                        filters.result.includes(opt.value)
                      }
                    />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* 실행자 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-executed-by"
                label={t("testExecution.filter.executedBy", "실행자")}
                value={filters.executedBy || ""}
                onChange={(e) => onFilterChange("executedBy", e.target.value)}
                fullWidth
                size="small"
                placeholder={t(
                  "testExecution.filter.executedBy.placeholder",
                  "username (콤마로 여러 명)",
                )}
              />
            </Grid>

            {/* 실행일자 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-execution-date"
                type="date"
                label={t("testExecution.filter.executionDate", "실행일자")}
                value={filters.executionDate || ""}
                onChange={(e) =>
                  onFilterChange("executionDate", e.target.value)
                }
                fullWidth
                size="small"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Grid>

            {/* JIRA 아이디 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-jira-issue-key"
                label={t("testExecution.filter.jiraIssueKey", "JIRA 아이디")}
                value={filters.jiraIssueKey || ""}
                onChange={(e) => onFilterChange("jiraIssueKey", e.target.value)}
                fullWidth
                size="small"
                placeholder="PRJ-123, PRJ-456"
              />
            </Grid>

            {/* 노트 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                id="filter-notes"
                label={t("testExecution.filter.notes", "노트")}
                value={filters.notes || ""}
                onChange={(e) => onFilterChange("notes", e.target.value)}
                fullWidth
                size="small"
                placeholder={t(
                  "testExecution.filter.notes.placeholder",
                  "노트 검색 (콤마로 여러 개)",
                )}
              />
            </Grid>

            {/* 버튼들 */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={onClear}
                  size="small"
                  disabled={!hasActiveFilters}
                >
                  {t("testExecution.filter.clear", "초기화")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={onApply}
                  size="small"
                >
                  {t("testExecution.filter.apply", "적용")}
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
