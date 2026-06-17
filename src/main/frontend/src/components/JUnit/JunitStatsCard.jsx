import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Assessment,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as ErrorIcon,
  SkipNext as SkipIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { STATUS_COLORS, RESULT_COLORS } from "../../constants/statusColors";

/**
 * JUnit 통계 개요 카드 (통과/실패/에러/스킵/성공률). (JunitResultDetail 에서 추출)
 */
const JunitStatsCard = ({
  testResult,
  expandedSections,
  handleAccordionChange,
  t,
}) => {
  const theme = useTheme();
  const successRate =
    testResult.totalTests > 0
      ? ((testResult.totalTests - testResult.failures - testResult.errors) /
          testResult.totalTests) *
        100
      : 0;

  return (
    <Accordion
      expanded={expandedSections.stats}
      onChange={handleAccordionChange("stats")}
      sx={{
        mb: 3,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
        borderRadius: "8px !important",
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          <Assessment color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            {t("junit.sections.statistics", "통계 개요")}
          </Typography>
          {!expandedSections.stats && testResult && (
            <Box sx={{ display: "flex", gap: 2, ml: 2 }}>
              <Chip
                label={`${t("junit.stats.total")}: ${testResult.totalTests}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${t("junit.stats.passed")}: ${
                  testResult.totalTests -
                  testResult.failures -
                  testResult.errors -
                  testResult.skipped
                }`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
              <Chip
                label={`${t("junit.stats.failed")}: ${testResult.failures}`}
                size="small"
                color="error"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
              <Chip
                label={`${successRate.toFixed(1)}%`}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: "bold" }}
              />
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                bgcolor: alpha(RESULT_COLORS.PASS, 0.1),
                boxShadow: "none",
                border: "1px solid",
                borderColor: alpha(RESULT_COLORS.PASS, 0.2),
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <PassIcon
                  sx={{ fontSize: 32, color: RESULT_COLORS.PASS, mb: 1 }}
                />
                <Typography
                  variant="h5"
                  sx={{ color: RESULT_COLORS.PASS, fontWeight: "bold" }}
                >
                  {testResult.totalTests -
                    testResult.failures -
                    testResult.errors -
                    testResult.skipped}
                </Typography>
                <Typography variant="caption" display="block">
                  {t("junit.stats.passed")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                bgcolor: alpha(RESULT_COLORS.FAIL, 0.1),
                boxShadow: "none",
                border: "1px solid",
                borderColor: alpha(RESULT_COLORS.FAIL, 0.2),
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <FailIcon
                  sx={{ fontSize: 32, color: RESULT_COLORS.FAIL, mb: 1 }}
                />
                <Typography
                  variant="h5"
                  sx={{ color: RESULT_COLORS.FAIL, fontWeight: "bold" }}
                >
                  {testResult.failures}
                </Typography>
                <Typography variant="caption" display="block">
                  {t("junit.stats.failed")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                bgcolor: alpha(STATUS_COLORS.ERROR, 0.1),
                boxShadow: "none",
                border: "1px solid",
                borderColor: alpha(STATUS_COLORS.ERROR, 0.2),
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <ErrorIcon
                  sx={{ fontSize: 32, color: STATUS_COLORS.ERROR, mb: 1 }}
                />
                <Typography
                  variant="h5"
                  sx={{ color: STATUS_COLORS.ERROR, fontWeight: "bold" }}
                >
                  {testResult.errors}
                </Typography>
                <Typography variant="caption" display="block">
                  {t("junit.stats.error")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                bgcolor: alpha(RESULT_COLORS.SKIPPED, 0.1),
                boxShadow: "none",
                border: "1px solid",
                borderColor: alpha(RESULT_COLORS.SKIPPED, 0.2),
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <SkipIcon
                  sx={{ fontSize: 32, color: RESULT_COLORS.SKIPPED, mb: 1 }}
                />
                <Typography
                  variant="h5"
                  sx={{ color: RESULT_COLORS.SKIPPED, fontWeight: "bold" }}
                >
                  {testResult.skipped}
                </Typography>
                <Typography variant="caption" display="block">
                  {t("junit.stats.skipped")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              sx={{
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <SpeedIcon
                  sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                />
                <Typography
                  variant="h5"
                  color="primary.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {successRate.toFixed(1)}%
                </Typography>
                <Typography variant="caption" display="block">
                  {t("junit.stats.successRate")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

JunitStatsCard.propTypes = {
  testResult: PropTypes.object,
  expandedSections: PropTypes.object,
  handleAccordionChange: PropTypes.func,
  t: PropTypes.func,
};

export default JunitStatsCard;
