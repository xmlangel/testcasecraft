import React, { useMemo } from "react";
import {
  Box,
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
  ArrowBack as ArrowBackIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

/**
 * 테스트 결과 상세 헤더 컴포넌트
 * 데이터 집계 로직 및 프리미엄 디자인 적용
 */
const TestResultHeader = ({
  onPrevious,
  onNext,
  onBack,
  currentIndex,
  totalCount,
  testCase,
  isViewer,
  execution = null,
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 결과 통계 계산 (최신 결과 기준)
  const stats = useMemo(() => {
    if (!execution || !execution.results) return null;

    const allResults = execution.results || [];
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

    const completedCount = latestResults.filter(
      (r) => r.result && r.result !== "NOT_RUN" && r.result !== "NOTRUN",
    ).length;

    const notRun = Math.max(0, totalCount - completedCount);

    return { pass, fail, blocked, notRun, completedCount };
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
        label={
          <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, mr: 0.5, opacity: 0.8 }}
            >
              {label}:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {count}
            </Typography>
          </Box>
        }
        size="small"
        sx={{
          bgcolor: alpha(color, 0.1),
          borderColor: alpha(color, 0.2),
          borderWidth: 1,
          borderStyle: "solid",
          color: color,
          height: 28,
          px: 0.5,
          fontSize: "0.75rem",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: alpha(color, 0.15),
            borderColor: alpha(color, 0.4),
            transform: "translateY(-1px)",
            boxShadow: `0 2px 8px ${alpha(color, 0.2)}`,
          },
          "& .MuiChip-icon": {
            color: color,
            fontSize: 14,
            ml: 0.5,
          },
          "& .MuiChip-label": {
            pl: 1,
            pr: 1,
          },
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
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : "#fff",
        backdropFilter: "blur(12px)",
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
                  transform: "translateX(-2px)",
                },
                transition: "all 0.2s",
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
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                "&:hover:not(:disabled)": {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
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
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                "&:hover:not(:disabled)": {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
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
            bgcolor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* 순서 통일: Pass, Fail, Blocked, Not Run */}
          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
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
              icon={<HourglassEmptyIcon />}
              label="Not Run"
              count={stats.notRun}
              color={theme.palette.text.disabled}
              tooltip={t("testResult.status.notRun", "미실행")}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, opacity: 0.8 }}
            >
              {t("testExecution.summary.total", "총")} {totalCount}
              {t("testExecution.summary.cases", "건")}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {progressPercent}%
              </Typography>
              <Box
                sx={{
                  width: 120,
                  height: 6,
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
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
        </Box>
      )}
    </Box>
  );
};

export default TestResultHeader;
