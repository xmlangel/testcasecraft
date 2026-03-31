import React, { useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Tooltip as MuiTooltip,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

const TestResultHeader = ({
  onPrevious,
  onNext,
  onBack,
  currentIndex,
  totalCount,
  testCase,
  isViewer,
  hideButtons = false,
  execution = null,
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 결과 통계 계산
  const stats = useMemo(() => {
    if (!execution || !execution.results) return null;

    const allResults = execution.results || [];
    // 각 테스트케이스별 최신 결과만 추출 (Map을 사용하여 동일 ID의 뒷부분 결과를 유지)
    const latestResultsMap = new Map();
    allResults.forEach((r) => {
      if (r.testCaseId) {
        latestResultsMap.set(r.testCaseId, r);
      }
    });

    const latestResults = Array.from(latestResultsMap.values());
    const pass = latestResults.filter((r) => r.result === "PASS").length;
    const fail = latestResults.filter((r) => r.result === "FAIL").length;
    const blocked = latestResults.filter((r) => r.result === "BLOCKED").length;

    // 완료된 건수 (Pass/Fail/Blocked)
    const completedCount = latestResults.filter(
      (r) => r.result && r.result !== "NOT_RUN" && r.result !== "NOTRUN",
    ).length;

    // Not Run은 전체 건수에서 완료 건수를 뺀 값
    const notRun = Math.max(0, totalCount - completedCount);

    return {
      pass,
      fail,
      blocked,
      notRun,
      completedCount,
    };
  }, [execution, totalCount]);

  const progressPercent = useMemo(() => {
    if (!totalCount || totalCount <= 0) return 0;
    return Math.min(
      100,
      Math.round(((stats?.completedCount || 0) / totalCount) * 100),
    );
  }, [stats?.completedCount, totalCount]);

  const StatusChip = ({ icon, label, count, color, tooltip }) => (
    <MuiTooltip title={tooltip} arrow>
      <Chip
        icon={icon}
        label={`${label}: ${count}`}
        size="small"
        sx={{
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          borderColor: alpha(color, 0.4),
          borderWidth: 1,
          borderStyle: "solid",
          color: color,
          height: 24,
          fontSize: "0.75rem",
          fontWeight: 600,
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: alpha(color, 0.08),
            borderColor: color,
            transform: "translateY(-1px)",
          },
          "& .MuiChip-icon": { color: color, fontSize: 14 },
        }}
      />
    </MuiTooltip>
  );

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : "#fff",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 1100,
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.4)"
          : "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* Top Bar: Title and Navigation */}
      <Box
        sx={{
          height: 64,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {onBack && (
            <IconButton
              onClick={onBack}
              size="small"
              sx={{
                color: "text.primary",
                bgcolor: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.03),
                "&:hover": {
                  bgcolor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.06),
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "-0.5px",
                color: "text.primary",
              }}
            >
              {t("testCaseResult.page.title", "테스트 케이스 결과")}
            </Typography>
            {testCase?.displayId && (
              <Typography
                variant="caption"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  fontFamily: "Monospace",
                }}
              >
                {testCase.displayId}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Current Info & Navigator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={onPrevious}
              disabled={currentIndex <= 0 || isViewer || totalCount <= 1}
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Box
              sx={{
                px: 2,
                py: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                minWidth: 80,
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                {totalCount > 0
                  ? `${currentIndex + 1} / ${totalCount}`
                  : "- / -"}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onNext}
              disabled={
                currentIndex >= totalCount - 1 || isViewer || totalCount <= 1
              }
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              maxWidth: { md: 250, lg: 400 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: { xs: "none", md: "block" },
            }}
          >
            {testCase?.name}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Bar: Stats and Progress */}
      {stats && (
        <Box
          sx={{
            height: 48,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.01)",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <StatusChip
              icon={<CheckCircleIcon />}
              label="Pass"
              count={stats.pass}
              color={theme.palette.success.main}
              tooltip={t("testResult.status.pass", "성공")}
            />
            <StatusChip
              icon={<CancelIcon />}
              label="Fail"
              count={stats.fail}
              color={theme.palette.error.main}
              tooltip={t("testResult.status.fail", "실패")}
            />
            <StatusChip
              icon={<BlockIcon />}
              label="Blocked"
              count={stats.blocked}
              color={theme.palette.warning.main}
              tooltip={t("testResult.status.blocked", "차단됨")}
            />
            <StatusChip
              icon={<PlayArrowIcon />}
              label="Not Run"
              count={stats.notRun}
              color={theme.palette.text.disabled}
              tooltip={t("testResult.status.notRun", "미실행")}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, opacity: 0.7 }}
            >
              {progressPercent}% COMPLETE
            </Typography>
            <Box
              sx={{
                width: 120,
                height: 6,
                bgcolor: alpha(theme.palette.divider, 0.5),
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  borderRadius: 3,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TestResultHeader;
