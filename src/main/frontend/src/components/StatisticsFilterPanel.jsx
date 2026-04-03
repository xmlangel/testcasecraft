// src/components/StatisticsFilterPanel.jsx

import React from "react";
import { useTranslation } from "../context/I18nContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import { Refresh, FilterList, Clear } from "@mui/icons-material";

/**
 * ICT-187: 통계 필터링 패널 컴포넌트
 * 테스트 플랜별, 실행별, 날짜별 필터링 옵션
 */
function StatisticsFilterPanel({
  filters,
  onFiltersChange,
  projects = [],
  testPlans = [],
  testExecutions = [],
  loading = false,
  onRefresh = null,
}) {
  const { t } = useTranslation();

  // 필터 변경 핸들러
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };

    // 테스트 플랜 변경 시 실행 초기화 (배열이거나 단일 ID인 경우 모두 처리)
    if (filterKey === "testPlanId") {
      newFilters.testExecutionId = "";
    }

    onFiltersChange(newFilters);
  };

  // 전체 초기화
  const handleClearAll = () => {
    onFiltersChange({
      testPlanId: [], // 다중 선택을 위해 빈 배열로 초기화
      testExecutionId: "",
      viewType: "overview",
    });
  };

  // 적용된 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.testPlanId) {
      if (Array.isArray(filters.testPlanId)) {
        count += filters.testPlanId.length;
      } else if (filters.testPlanId !== "") {
        count++;
      }
    }
    if (filters.testExecutionId) count++;
    return count;
  };

  // 현재 프로젝트의 테스트 플랜들 필터링 (프로젝트는 이미 컨텍스트에서 결정됨)
  const availableTestPlans = testPlans;

  // 현재 테스트 플랜의 실행들 필터링 (다중 선택인 경우 첫 번째 선택된 플랜의 실행들을 보여주거나 전체를 보여줌)
  // ICT-187: testExecutions가 배열이 아닐 경우를 대비한 방어 코드 추가
  const safeTestExecutions = Array.isArray(testExecutions)
    ? testExecutions
    : [];

  const availableTestExecutions =
    filters.testPlanId && !Array.isArray(filters.testPlanId)
      ? safeTestExecutions.filter(
          (exec) => exec.testPlanId === filters.testPlanId,
        )
      : Array.isArray(filters.testPlanId) && filters.testPlanId.length === 1
        ? safeTestExecutions.filter(
            (exec) => exec.testPlanId === filters.testPlanId[0],
          )
        : safeTestExecutions;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        {/* 제목 및 액션 버튼 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList color="action" />
            <Typography variant="h6" component="h3">
              {t("testResult.filter.title")}
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip
                label={t("testResult.filter.applied", {
                  count: getActiveFilterCount(),
                })}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title={t("testResult.filter.refreshTooltip")} arrow>
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    {t("testResult.filter.refresh")}
                  </Button>
                </span>
              </Tooltip>
            )}

            <Tooltip title={t("testResult.filter.clearTooltip")} arrow>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleClearAll}
                  disabled={loading || getActiveFilterCount() === 0}
                >
                  {t("testResult.filter.clear")}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        {/* 필터 옵션들 */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {/* 테스트 플랜 선택 (다중 선택 가능) */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="testplan-select-label">
              {t("testResult.filter.testPlan")}
            </InputLabel>
            <Select
              labelId="testplan-select-label"
              multiple
              value={
                Array.isArray(filters.testPlanId)
                  ? filters.testPlanId
                  : filters.testPlanId
                    ? [filters.testPlanId]
                    : []
              }
              label={t("testResult.filter.testPlan")}
              onChange={(e) => handleFilterChange("testPlanId", e.target.value)}
              disabled={loading}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.length === 0 ? (
                    <em>{t("testResult.filter.allPlans")}</em>
                  ) : (
                    selected.map((value) => (
                      <Chip
                        key={value}
                        label={
                          availableTestPlans.find((p) => p.id === value)
                            ?.name || value
                        }
                        size="small"
                      />
                    ))
                  )}
                </Box>
              )}
            >
              {availableTestPlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
              {/* MUI Select 경고 방지: 로딩 중 또는 데이터 부재 시 선택된 값의 MenuItem 보장 */}
              {(Array.isArray(filters.testPlanId)
                ? filters.testPlanId
                : filters.testPlanId
                  ? [filters.testPlanId]
                  : []
              ).map((id) => {
                if (id && !availableTestPlans.some((p) => p.id === id)) {
                  return (
                    <MenuItem key={id} value={id} sx={{ display: "none" }}>
                      {id}
                    </MenuItem>
                  );
                }
                return null;
              })}
            </Select>
          </FormControl>

          {/* 테스트 실행 선택 */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="execution-select-label">
              {t("testResult.filter.testExecution")}
            </InputLabel>
            <Select
              labelId="execution-select-label"
              value={filters.testExecutionId || ""}
              label={t("testResult.filter.testExecution")}
              onChange={(e) =>
                handleFilterChange("testExecutionId", e.target.value)
              }
              disabled={loading || !filters.testPlanId}
            >
              <MenuItem value="">
                <em>{t("testResult.filter.allExecutions")}</em>
              </MenuItem>
              {Array.isArray(availableTestExecutions) &&
                availableTestExecutions.map((execution) => (
                  <MenuItem key={execution.id} value={execution.id}>
                    {execution.name}
                  </MenuItem>
                ))}
              {/* MUI Select 경고 방지: 로딩 중 또는 데이터 부재 시 선택된 값의 MenuItem 보장 */}
              {filters.testExecutionId &&
                !availableTestExecutions.some(
                  (e) => e.id === filters.testExecutionId,
                ) && (
                  <MenuItem
                    value={filters.testExecutionId}
                    sx={{ display: "none" }}
                  >
                    {filters.testExecutionId}
                  </MenuItem>
                )}
            </Select>
          </FormControl>

          {/* 보기 형태 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="viewtype-select-label">
              {t("testResult.filter.viewType")}
            </InputLabel>
            <Select
              labelId="viewtype-select-label"
              value={filters.viewType || "overview"}
              label={t("testResult.filter.viewType")}
              onChange={(e) => handleFilterChange("viewType", e.target.value)}
              disabled={loading}
            >
              <MenuItem value="overview">
                {t("testResult.filter.overviewView")}
              </MenuItem>
              <MenuItem value="by-plan">
                {t("testResult.filter.planView")}
              </MenuItem>
              <MenuItem value="by-execution">
                {t("testResult.filter.executionView", "실행별")}
              </MenuItem>
              <MenuItem value="by-executor">
                {t("testResult.filter.executorView")}
              </MenuItem>
              <MenuItem value="by-folder">
                {t("testResult.filter.folderView", "폴더별")}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* 현재 필터 상태 표시 */}
        {getActiveFilterCount() > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("testResult.filter.activeFilters")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.testPlanId &&
                  (Array.isArray(filters.testPlanId)
                    ? filters.testPlanId
                    : [filters.testPlanId]
                  ).map(
                    (id) =>
                      id && (
                        <Chip
                          key={`filter-plan-${id}`}
                          label={`${t("testResult.filter.planPrefix")} ${
                            availableTestPlans.find((p) => p.id === id)?.name ||
                            id
                          }`}
                          size="small"
                          variant="outlined"
                          onDelete={() => {
                            if (Array.isArray(filters.testPlanId)) {
                              handleFilterChange(
                                "testPlanId",
                                filters.testPlanId.filter(
                                  (item) => item !== id,
                                ),
                              );
                            } else {
                              handleFilterChange("testPlanId", "");
                            }
                          }}
                        />
                      ),
                  )}
                {filters.testExecutionId && (
                  <Chip
                    label={`${t("testResult.filter.executionPrefix")} ${
                      availableTestExecutions.find(
                        (e) => e.id === filters.testExecutionId,
                      )?.name || filters.testExecutionId
                    }`}
                    size="small"
                    variant="outlined"
                    onDelete={() => handleFilterChange("testExecutionId", "")}
                  />
                )}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StatisticsFilterPanel;
