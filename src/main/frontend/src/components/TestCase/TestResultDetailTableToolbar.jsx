import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Settings as SettingsIcon,
  GetApp as GetAppIcon,
  FileDownload as FileDownloadIcon,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 인쇄 시 그리드를 축소해 한 페이지에 더 많이 담기 위한 페이지 스타일
const PRINT_SCALE_PERCENT = 30;
const PRINT_SCALE_FACTOR = PRINT_SCALE_PERCENT / 100;
const GRID_PRINT_PAGE_STYLE = `
  @page {
    size: landscape;
    margin: 10mm;
  }
  body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    transform: scale(${PRINT_SCALE_FACTOR});
    transform-origin: top left;
  }
  #root, body, html {
    width: ${100 / PRINT_SCALE_FACTOR}%;
  }
`;

const TestResultDetailTableToolbar = ({
  onColumnSettingsClick,
  onColumnOrderChangeClick,
  onResetClick,
  onJiraStatusCheck,
  onExportClick,
  jiraConfig,
  jiraStatusLoading,
  hasJiraTargets,
  activeProject,
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

    <Box sx={{ display: "flex", gap: 1 }}>
      {/* ICT-190: 고급 내보내기 버튼 */}
      <Button
        size="small"
        startIcon={<FileDownloadIcon />}
        onClick={onExportClick}
        variant="outlined"
        color="primary"
      >
        {t("testResult.button.advancedExport", "고급 내보내기")}
      </Button>

      <GridToolbarExport
        printOptions={{
          fileName: `테스트결과_${activeProject?.name || "export"}_${format(
            new Date(),
            "yyyyMMdd",
            { locale: ko },
          )}`,
          pageStyle: GRID_PRINT_PAGE_STYLE,
        }}
        csvOptions={{
          fileName: `테스트결과_${activeProject?.name || "export"}_${format(
            new Date(),
            "yyyyMMdd",
            { locale: ko },
          )}`,
          utf8WithBom: true,
        }}
        startIcon={<GetAppIcon />}
        sx={{ ml: 1 }}
      />
    </Box>
  </GridToolbarContainer>
);

export default TestResultDetailTableToolbar;
