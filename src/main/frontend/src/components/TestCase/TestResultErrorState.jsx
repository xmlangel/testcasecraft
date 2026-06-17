import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";

/**
 * 테스트 결과 로드 실패 화면. (TestResultDetailTable 에서 추출)
 */
const TestResultErrorState = ({ error, onRetry, t }) => (
  <Paper sx={{ width: "100%", p: 3 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        textAlign: "center",
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 2 }}>
        ⚠️
      </Typography>
      <Typography variant="h6" color="error.main" gutterBottom>
        {t("testResult.error.loadFailure", "테스트 결과를 불러올 수 없습니다")}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400 }}
      >
        {error}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          startIcon={<VisibilityIcon />}
        >
          {t("common.button.refresh", "새로고침")}
        </Button>
        <Button variant="outlined" onClick={onRetry}>
          {t("common.button.retry", "다시 시도")}
        </Button>
      </Box>
    </Box>
  </Paper>
);

TestResultErrorState.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default TestResultErrorState;
