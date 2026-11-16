// src/components/TestExecution/ExecutionProgressBar.jsx
// ICT-491 ex-4: 실행 목록 한 줄에 들어가는 진행률 막대.
// 통과·실패·차단을 색으로 나눠 쌓고, 남은 부분은 미실행으로 둔다.
// 서버 TestExecutionDto 는 차단 수를 skippedCount 에 담는다.
import React from "react";
import PropTypes from "prop-types";
import { Box, Tooltip, Typography } from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
import { RESULT_COLORS } from "../../constants/statusColors.js";

const clampPercent = (value) => Math.min(Math.max(Number(value) || 0, 0), 100);

export const computeSegments = (execution) => {
  const total = Number(execution?.totalCount) || 0;
  if (total <= 0) {
    return { total: 0, pass: 0, fail: 0, blocked: 0 };
  }
  const pct = (n) => ((Number(n) || 0) * 100) / total;
  return {
    total,
    pass: pct(execution.passedCount),
    fail: pct(execution.failedCount),
    blocked: pct(execution.skippedCount),
  };
};

const ExecutionProgressBar = ({
  execution,
  width = 120,
  showPercent = true,
}) => {
  const { t } = useI18n();
  const progress = clampPercent(execution?.progress);
  const seg = computeSegments(execution);
  // 개수가 없으면(옛 응답) 진행률 하나로 그린다
  const parts =
    seg.total > 0
      ? [
          { key: "PASS", value: seg.pass, color: RESULT_COLORS.PASS },
          { key: "FAIL", value: seg.fail, color: RESULT_COLORS.FAIL },
          { key: "BLOCKED", value: seg.blocked, color: RESULT_COLORS.BLOCKED },
        ]
      : [{ key: "DONE", value: progress, color: "primary.main" }];

  const title =
    seg.total > 0
      ? t(
          "testExecution.list.progressDetail",
          "통과 {pass} · 실패 {fail} · 차단 {blocked} / {total}",
          {
            pass: execution.passedCount || 0,
            fail: execution.failedCount || 0,
            blocked: execution.skippedCount || 0,
            total: seg.total,
          },
        )
      : `${progress}%`;

  return (
    <Tooltip title={title} arrow>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}
        data-testid={`execution-progress-${execution?.id}`}
      >
        <Box
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={title}
          sx={{
            display: "flex",
            width,
            height: 6,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "action.disabledBackground",
          }}
        >
          {parts.map((p) =>
            p.value > 0 ? (
              <Box
                key={p.key}
                data-segment={p.key}
                sx={{ width: `${p.value}%`, bgcolor: p.color }}
              />
            ) : null,
          )}
        </Box>
        {showPercent && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 32, textAlign: "right" }}
          >
            {progress}%
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

ExecutionProgressBar.propTypes = {
  execution: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showPercent: PropTypes.bool,
};

export default ExecutionProgressBar;
