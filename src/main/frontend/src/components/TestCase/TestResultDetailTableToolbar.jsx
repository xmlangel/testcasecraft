import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Settings as SettingsIcon,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";

// ICT-476: 내보내기는 표 위 "내보내기" 버튼 하나로 통일한다.
// MUI 기본 EXPORT(CSV·인쇄)와 툴바의 고급 내보내기 버튼은 제거했다.
const TestResultDetailTableToolbar = ({
  onColumnSettingsClick,
  onColumnOrderChangeClick,
  onResetClick,
  onJiraStatusCheck,
  jiraConfig,
  jiraStatusLoading,
  hasJiraTargets,
  t,
}) => (
  <GridToolbarContainer sx={{ justifyContent: "space-between", p: 1 }}>
    <Box sx={{ display: "flex", gap: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />

      {/* 컬럼 표시/숨김 설정 */}
      <Button
        size="small"
        startIcon={<SettingsIcon />}
        onClick={onColumnSettingsClick}
      >
        {t("testResult.button.columnSettings", "컬럼 설정")}
      </Button>

      {/* ICT-275: 컬럼 순서 변경 버튼 */}
      <Button
        size="small"
        variant="outlined"
        onClick={onColumnOrderChangeClick}
        sx={{ ml: 1 }}
      >
        {t("testResult.button.changeOrder", "순서 변경")}
      </Button>

      {/* ICT-275: 컬럼 설정 초기화 버튼 */}
      <Button
        size="small"
        variant="outlined"
        onClick={onResetClick}
        sx={{ ml: 1 }}
      >
        {t("testResult.button.reset", "기본값")}
      </Button>

      <Tooltip
        title={
          !jiraConfig
            ? t(
                "testResult.tooltip.jiraNotConfigured",
                "JIRA 설정이 필요합니다",
              )
            : !hasJiraTargets
              ? t(
                  "testResult.tooltip.noJiraTargets",
                  "연결된 JIRA ID가 없습니다",
                )
              : ""
        }
      >
        <span>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AutorenewIcon />}
            onClick={onJiraStatusCheck}
            disabled={!jiraConfig || !hasJiraTargets || jiraStatusLoading}
            sx={{ ml: 1 }}
          >
            {jiraStatusLoading
              ? t("testResult.button.jiraStatusLoading", "JIRA 상태 확인 중...")
              : t("testResult.button.jiraStatusCheck", "JIRA 상태 체크")}
          </Button>
        </span>
      </Tooltip>
    </Box>
  </GridToolbarContainer>
);

export default TestResultDetailTableToolbar;
