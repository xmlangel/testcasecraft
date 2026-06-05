import React from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";

const TestResultFloatingMenu = ({
  result,
  onResultChange,
  onPrevious,
  onNext,
  onSave,
  onClose,
  currentIndex,
  totalCount,
  isViewer,
  loading,
  shouldShowJiraButton,
  handleOpenJiraDialog,
  testCase,
  saveButtonRef,
  t,
  isNotesFullscreen = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Navigation disabled logic
  const prevDisabled =
    !onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1;
  const nextDisabled =
    !onNext || currentIndex >= totalCount - 1 || isViewer || totalCount <= 1;

  const resultOptions = [
    {
      // 백엔드 enum과 일치시켜야 함 ("NOTRUN" 표기는 baseline 불일치로
      // 조회만 해도 저장되는 버그를 재유발함)
      value: "NOT_RUN",
      label: "N",
      color: theme.palette.grey[500],
      tooltip: t("testResult.status.notRun", "실행 안 함"),
    },
    {
      value: "PASS",
      label: "P",
      color: theme.palette.success.main,
      tooltip: t("testResult.status.pass", "성공"),
    },
    {
      value: "FAIL",
      label: "F",
      color: theme.palette.error.main,
      tooltip: t("testResult.status.fail", "실패"),
    },
    {
      value: "BLOCKED",
      label: "B",
      color: theme.palette.warning.main,
      tooltip: t("testResult.status.blocked", "차단됨"),
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: isNotesFullscreen ? 11000 : 1300,
        width: "auto",
        maxWidth: "95vw",
        animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "@keyframes slideUp": {
          "0%": { transform: "translateX(-50%) translateY(100px)", opacity: 0 },
          "100%": { transform: "translateX(-50%) translateY(0)", opacity: 1 },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1,
          px: 2,
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: isDark
            ? "rgba(28, 28, 30, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            : "0 12px 40px rgba(0, 0, 0, 0.15)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: isDark
              ? "0 16px 48px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
              : "0 16px 48px rgba(0, 0, 0, 0.2)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Navigation Section */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title={t("common.button.previous", "이전")}>
            <span>
              <IconButton
                onClick={onPrevious}
                disabled={prevDisabled}
                color="primary"
                size="small"
                sx={{
                  transition: "transform 0.2s",
                  "&:active": { transform: "translateX(-4px)" },
                }}
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ minWidth: 50, textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                fontSize: "0.8rem",
                fontVariantNumeric: "tabular-nums",
                opacity: 0.9,
              }}
            >
              {totalCount > 0 ? (
                <>
                  <span style={{ color: theme.palette.primary.main }}>
                    {currentIndex + 1}
                  </span>
                  <span style={{ opacity: 0.3, margin: "0 2px" }}>/</span>
                  <span>{totalCount}</span>
                </>
              ) : (
                "-/-"
              )}
            </Typography>
          </Box>

          <Tooltip title={t("common.button.next", "다음")}>
            <span>
              <IconButton
                onClick={onNext}
                disabled={nextDisabled}
                color="primary"
                size="small"
                sx={{
                  transition: "transform 0.2s",
                  "&:active": { transform: "translateX(4px)" },
                }}
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, my: 1, opacity: 0.5 }}
        />

        {/* Result Selection Section */}
        <Stack direction="row" spacing={1} sx={{ px: 0.5 }}>
          {resultOptions.map((opt) => {
            const isSelected = result === opt.value;
            return (
              <Tooltip key={opt.value} title={opt.tooltip}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => !isViewer && onResultChange(opt.value)}
                    disabled={isViewer}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      bgcolor: isSelected ? opt.color : "transparent",
                      color: isSelected ? "#fff" : opt.color,
                      border: `1.5px solid ${
                        isSelected ? opt.color : alpha(opt.color, 0.3)
                      }`,
                      boxShadow: isSelected
                        ? `0 4px 12px ${alpha(opt.color, 0.4)}`
                        : "none",
                      "&:hover": {
                        bgcolor: isSelected ? opt.color : alpha(opt.color, 0.1),
                        borderColor: opt.color,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {opt.label}
                  </IconButton>
                </span>
              </Tooltip>
            );
          })}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, my: 1, opacity: 0.5 }}
        />

        {/* Action Section */}
        <Stack direction="row" spacing={1} alignItems="center">
          {shouldShowJiraButton && shouldShowJiraButton() && !isViewer && (
            <Tooltip title={t("testResult.form.jiraComment", "JIRA 코멘트")}>
              <span>
                <IconButton
                  color="warning"
                  onClick={handleOpenJiraDialog}
                  disabled={loading}
                  size="medium"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.warning.main, 0.2),
                    },
                  }}
                >
                  <BugReportIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}

          <Button
            onClick={onClose}
            variant="text"
            color="inherit"
            size="small"
            sx={{
              borderRadius: "50px",
              px: 2,
              fontWeight: 600,
              fontSize: "0.85rem",
              display: { xs: "none", md: "inline-flex" },
              opacity: 0.7,
              "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.05)" },
            }}
          >
            {t("common.button.cancel", "취소")}
          </Button>

          <IconButton
            onClick={onClose}
            sx={{ display: { xs: "flex", md: "none" } }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={onSave}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon fontSize="small" />}
              disabled={loading || !testCase}
              sx={{
                borderRadius: "50px",
                px: 3,
                py: 0.8,
                fontWeight: 700,
                fontSize: "0.85rem",
                minWidth: "90px",
                boxShadow: `0 4px 14px 0 ${alpha(
                  theme.palette.primary.main,
                  0.39,
                )}`,
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: `0 6px 20px rgba(0, 0, 0, 0.23)`,
                  transform: "scale(1.02)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
              data-testid="floating-save-button"
            >
              {t("common.button.save", "저장")}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default TestResultFloatingMenu;
