import React, { useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";

const TestResultHeader = ({
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
  testCase,
  isViewer,
  t,
  hideButtons = false,
  execution = null,
}) => {
  // 결과 통계 계산
  const stats = useMemo(() => {
    if (!execution || !execution.results) return null;

    const results = execution.results || [];
    return {
      pass: results.filter((r) => r.result === "PASS").length,
      fail: results.filter((r) => r.result === "FAIL").length,
      blocked: results.filter((r) => r.result === "BLOCKED").length,
      notRun: totalCount - results.length,
    };
  }, [execution, totalCount]);

  const StatusChip = ({ icon, label, count, color, tooltip }) => (
    <MuiTooltip title={tooltip}>
      <Chip
        icon={icon}
        label={`${label}: ${count}`}
        size="small"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
          borderColor: color,
          borderWidth: 1,
          borderStyle: "solid",
          color: color,
          fontWeight: 600,
          "& .MuiChip-icon": { color: color },
        }}
      />
    </MuiTooltip>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        mb: 2,
        bgcolor: (theme) => theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: { xs: "100%", md: "auto" },
        }}
      >
        {!hideButtons && (
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={onPrevious}
            disabled={
              !onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1
            }
            sx={{ minWidth: 100, borderRadius: 2 }}
          >
            {t("common.button.previous", "이전")}
          </Button>
        )}

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, lineHeight: 1.2, color: "primary.main" }}
          >
            {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : "- / -"}
          </Typography>
          {testCase?.displayId && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {testCase.displayId}
            </Typography>
          )}
        </Box>

        {!hideButtons && (
          <Button
            variant="outlined"
            endIcon={<NavigateNextIcon />}
            onClick={onNext}
            disabled={
              !onNext ||
              currentIndex >= totalCount - 1 ||
              isViewer ||
              totalCount <= 1
            }
            sx={{ minWidth: 100, borderRadius: 2 }}
          >
            {t("common.button.next", "다음")}
          </Button>
        )}
      </Box>

      {stats && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            p: 1,
            px: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.02)",
            borderRadius: 3,
            border: (theme) => `1px dotted ${theme.palette.divider}`,
          }}
        >
          <StatusChip
            icon={<CheckCircleIcon fontSize="small" />}
            label="Pass"
            count={stats.pass}
            color="success.main"
            tooltip={t("testResult.status.pass", "성공")}
          />
          <StatusChip
            icon={<CancelIcon fontSize="small" />}
            label="Fail"
            count={stats.fail}
            color="error.main"
            tooltip={t("testResult.status.fail", "실패")}
          />
          <StatusChip
            icon={<BlockIcon fontSize="small" />}
            label="Blocked"
            count={stats.blocked}
            color="warning.main"
            tooltip={t("testResult.status.blocked", "차단됨")}
          />
          <StatusChip
            icon={<PlayArrowIcon fontSize="small" />}
            label="Not Run"
            count={stats.notRun}
            color="text.secondary"
            tooltip={t("testResult.status.notRun", "미실행")}
          />

          <Box
            sx={{
              ml: 1,
              width: 60,
              height: 4,
              bgcolor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              display: { xs: "none", lg: "block" },
            }}
          >
            <Box
              sx={{
                width: `${
                  ((stats.pass + stats.fail + stats.blocked) / totalCount) * 100
                }%`,
                height: "100%",
                bgcolor: "primary.main",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </Box>
        </Box>
      )}

      {testCase?.name && (
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            flex: 1,
            textAlign: { xs: "left", md: "right" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { md: "300px", lg: "500px" },
            color: "text.primary",
          }}
        >
          {testCase.name}
        </Typography>
      )}
    </Box>
  );
};

export default TestResultHeader;
