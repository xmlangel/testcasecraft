import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../context/I18nContext.jsx";
import StatusInfoItem from "../StatusInfoItem.jsx";
import { formatDateSafe } from "../../utils/dateUtils";
import { RESULT_COLORS } from "../../constants/statusColors";

/**
 * 테스트 실행 상태 컴포넌트
 * 디자인 우수성을 강조한 결과 요약 UI
 */
const TestExecutionStatus = ({
  execution,
  statusCounts,
  progress,
  canStartExecution,
  canCompleteExecution,
  canRestartExecution,
  handleStartExecution,
  handleCompleteExecution,
  handleRestartExecution,
  saving,
}) => {
  const { t } = useTranslation();

  const StyledStatusChip = ({ icon, label, count, color }) => (
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
          boxShadow: `0 2px 8px ${alpha(color, 0.1)}`,
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
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(0,0,0,0.2)"
            : "rgba(0,0,0,0.02)",
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 기본 정보 행 */}
      <Box sx={{ display: "flex", gap: 4, mb: 1.5, alignItems: "center" }}>
        <StatusInfoItem
          label={t("testExecution.form.status")}
          value={execution?.status || "-"}
          compact
        />
        <StatusInfoItem
          label={t("testExecution.form.startDate")}
          value={formatDateSafe(execution?.startDate)}
          compact
        />
        <StatusInfoItem
          label={t("testExecution.form.endDate")}
          value={formatDateSafe(execution?.endDate)}
          compact
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* 통계 칩 영역 */}
        <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
          <StyledStatusChip
            icon={<CheckCircleIcon />}
            label={t("testResult.status.pass", "Pass")}
            count={statusCounts.PASS}
            color={RESULT_COLORS.PASS}
          />
          <StyledStatusChip
            icon={<CancelIcon />}
            label={t("testResult.status.fail", "Fail")}
            count={statusCounts.FAIL}
            color={RESULT_COLORS.FAIL}
          />
          <StyledStatusChip
            icon={<BlockIcon />}
            label={t("testResult.status.blocked", "Blocked")}
            count={statusCounts.BLOCKED}
            color={RESULT_COLORS.BLOCKED}
          />
          <StyledStatusChip
            icon={<HourglassEmptyIcon />}
            label={t("testResult.status.notRun", "Not Run")}
            count={statusCounts.NOTRUN}
            color={RESULT_COLORS.NOTRUN}
          />
          <Typography
            variant="caption"
            sx={{ ml: 1.5, fontWeight: 700, opacity: 0.7 }}
          >
            {t("testExecution.summary.total", "총")} {statusCounts.total}
            {t("testExecution.summary.cases", "건")}
          </Typography>
        </Box>

        {/* 진행률 영역 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            flex: { xs: 1, md: "none" },
            minWidth: 250,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                minWidth: 40,
                textAlign: "right",
              }}
            >
              {progress}%
            </Typography>
            <Box
              sx={{
                width: { xs: "100%", md: 150 },
                height: 6,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: "100%",
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  borderRadius: 3,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {canStartExecution && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartExecution}
              disabled={saving}
              size="small"
              data-testid="execution-start-button"
            >
              {t("testExecution.actions.startExecution")}
            </Button>
          )}
          {canCompleteExecution && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleCompleteExecution}
              disabled={saving}
              size="small"
              data-testid="execution-complete-button"
            >
              {t("testExecution.actions.completeExecution")}
            </Button>
          )}
          {canRestartExecution && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PlayArrowIcon />}
              onClick={handleRestartExecution}
              disabled={saving}
              size="small"
              data-testid="execution-restart-button"
            >
              {t("testExecution.actions.restartExecution")}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

TestExecutionStatus.propTypes = {
  execution: PropTypes.object,
  statusCounts: PropTypes.object.isRequired,
  progress: PropTypes.number.isRequired,
  canStartExecution: PropTypes.bool,
  canCompleteExecution: PropTypes.bool,
  canRestartExecution: PropTypes.bool,
  handleStartExecution: PropTypes.func.isRequired,
  handleCompleteExecution: PropTypes.func.isRequired,
  handleRestartExecution: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default TestExecutionStatus;
