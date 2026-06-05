// src/components/ComparisonFilterPanel.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareArrowsIcon,
} from "@mui/icons-material";
import {
  getProjectTestPlans,
  getProjectAssigneeResults,
} from "../services/dashboardService";
import { useI18n } from "../context/I18nContext.jsx";

/**
 * ICT-202: 테스트 결과 비교 필터 패널 컴포넌트
 * 플랜별/실행자별 결과 비교를 위한 필터링 UI
 */
function ComparisonFilterPanel({
  projectId,
  comparisonMode,
  onComparisonModeChange,
  selectedItems,
  onSelectedItemsChange,
  onApplyFilter,
}) {
  const { t } = useI18n();
  const [testPlans, setTestPlans] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 테스트 플랜 및 실행자 데이터 로드
  useEffect(() => {
    if (!projectId) {
      console.warn("ComparisonFilterPanel: No projectId provided");
      setError(t("comparisonFilterPanel.noProject", "프로젝트가 선택되지 않았습니다."));
      return;
    }

    loadFilterData();
  }, [projectId]);

  const loadFilterData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [plansResponse, assigneesResponse] = await Promise.all([
        getProjectTestPlans(projectId),
        getProjectAssigneeResults(projectId, 50),
      ]);

      // 테스트 플랜 데이터 설정
      if (Array.isArray(plansResponse)) {
        setTestPlans(plansResponse);
      } else {
        console.warn(
          "⚠️ ComparisonFilterPanel: Test plans response is not an array:",
          plansResponse,
        );
        setTestPlans([]);
      }

      // 실행자 데이터 설정 (openTestRunResults 배열에서 assignee 추출)
      if (
        assigneesResponse &&
        Array.isArray(assigneesResponse.openTestRunResults)
      ) {
        const uniqueAssignees = assigneesResponse.openTestRunResults
          .map((result) => ({
            id: result.assignee,
            name: result.assignee,
            totalCases: result.totalCases,
            completionRate: result.completionRate,
          }))
          .filter(
            (assignee, index, self) =>
              assignee.id &&
              index === self.findIndex((a) => a.id === assignee.id),
          );

        setAssignees(uniqueAssignees);
      } else {
        console.warn(
          "⚠️ ComparisonFilterPanel: Assignees response structure unexpected:",
          assigneesResponse,
        );
        setAssignees([]);
      }
    } catch (err) {
      console.error("Filter data load failed:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        projectId: projectId,
      });

      // 더 구체적인 에러 메시지 제공
      let errorMessage = t("comparisonFilterPanel.loadError", "필터 데이터를 불러오는데 실패했습니다.");
      if (
        err.message.includes("401") ||
        err.message.includes("Authentication")
      ) {
        errorMessage = t("comparisonFilterPanel.authError", "인증이 필요합니다. 다시 로그인해주세요.");
      } else if (err.message.includes("404")) {
        errorMessage = t("comparisonFilterPanel.notFoundError", "프로젝트 데이터를 찾을 수 없습니다.");
      } else if (
        err.message.includes("Network") ||
        err.message.includes("fetch")
      ) {
        errorMessage = t("comparisonFilterPanel.networkError", "네트워크 연결을 확인해주세요.");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 비교 모드 변경 핸들러
  const handleComparisonModeChange = (event, newMode) => {
    if (newMode !== null) {
      onComparisonModeChange(newMode);
      onSelectedItemsChange([]); // 모드 변경 시 선택 초기화
    }
  };

  // 선택 항목 변경 핸들러
  const handleSelectionChange = (event) => {
    const value = event.target.value;
    onSelectedItemsChange(typeof value === "string" ? value.split(",") : value);
  };

  // 선택 항목 삭제 핸들러
  const handleDeleteChip = (itemToDelete) => {
    const newSelected = selectedItems.filter((item) => item !== itemToDelete);
    onSelectedItemsChange(newSelected);
  };

  // 현재 선택 가능한 옵션들
  const getCurrentOptions = () => {
    switch (comparisonMode) {
      case "testplan":
        return testPlans.map((plan) => ({
          id: plan.id,
          name: plan.name || `Plan ${plan.id}`,
          description: plan.description || "",
        }));
      case "assignee":
        return assignees.map((assignee) => ({
          id: assignee.id,
          name: assignee.name,
          description: t("comparisonFilterPanel.assigneeStats", "{cases}건 (완료율 {rate}%)", { cases: assignee.totalCases, rate: assignee.completionRate }),
        }));
      default:
        return [];
    }
  };

  const currentOptions = getCurrentOptions();

  // 선택된 항목들의 표시 이름 가져오기
  const getSelectedDisplayNames = () => {
    return selectedItems.map((itemId) => {
      const option = currentOptions.find((opt) => opt.id === itemId);
      return option ? option.name : itemId;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">{t("comparisonFilterPanel.loadingOptions", "필터 옵션을 불러오는 중...")}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CompareArrowsIcon color="primary" />
          <Typography variant="h6">{t("comparisonFilterPanel.title", "비교 분석 필터")}</Typography>
        </Box>

        {/* 비교 모드 선택 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("comparisonFilterPanel.criterion", "비교 기준")}
          </Typography>
          <ToggleButtonGroup
            value={comparisonMode}
            exclusive
            onChange={handleComparisonModeChange}
            size="small"
            fullWidth
          >
            <ToggleButton value="overall">
              <AssessmentIcon sx={{ mr: 1 }} />
              {t("comparisonFilterPanel.overallTrend", "전체 추이")}
            </ToggleButton>
            <ToggleButton value="testplan">
              <TimelineIcon sx={{ mr: 1 }} />
              {t("comparisonFilterPanel.planComparison", "플랜별 비교")}
            </ToggleButton>
            <ToggleButton value="assignee">
              <GroupIcon sx={{ mr: 1 }} />
              {t("comparisonFilterPanel.assigneeComparison", "실행자별 비교")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 비교 대상 선택 */}
        {comparisonMode !== "overall" && (
          <>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                {comparisonMode === "testplan"
                  ? t("comparisonFilterPanel.selectTestPlan", "비교할 테스트 플랜")
                  : t("comparisonFilterPanel.selectAssignee", "비교할 실행자")}
              </InputLabel>
              <Select
                multiple
                value={selectedItems}
                onChange={handleSelectionChange}
                input={
                  <OutlinedInput
                    label={
                      comparisonMode === "testplan"
                        ? t("comparisonFilterPanel.selectTestPlan", "비교할 테스트 플랜")
                        : t("comparisonFilterPanel.selectAssignee", "비교할 실행자")
                    }
                  />
                }
                renderValue={() => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {getSelectedDisplayNames().map((name) => (
                      <Chip
                        key={name}
                        label={name}
                        size="small"
                        onDelete={() =>
                          handleDeleteChip(
                            selectedItems[
                              getSelectedDisplayNames().indexOf(name)
                            ],
                          )
                        }
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {currentOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={selectedItems.indexOf(option.id) > -1} />
                    <ListItemText
                      primary={option.name}
                      secondary={option.description}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 선택 안내 메시지 */}
            <Box sx={{ mb: 2 }}>
              {selectedItems.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  {comparisonMode === "testplan"
                    ? t("comparisonFilterPanel.selectPlanPrompt", "비교할 테스트 플랜을 선택해주세요 (최대 5개)")
                    : t("comparisonFilterPanel.selectAssigneePrompt", "비교할 실행자를 선택해주세요 (최대 10개)")}
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("comparisonFilterPanel.itemsSelected", "{count}개 항목이 선택됨", { count: selectedItems.length })}
                  {comparisonMode === "testplan" &&
                    selectedItems.length > 5 &&
                    t("comparisonFilterPanel.planLimitWarning", " (최대 5개까지 선택 가능)")}
                  {comparisonMode === "assignee" &&
                    selectedItems.length > 10 &&
                    t("comparisonFilterPanel.assigneeLimitWarning", " (최대 10개까지 선택 가능)")}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* 적용 안내 */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {t("comparisonFilterPanel.autoApplyNote", "필터 설정이 자동으로 차트에 적용됩니다.")}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ComparisonFilterPanel;
