// src/components/common/ErrorDetailAlert.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, AlertTitle, Box, Button, Collapse } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { splitErrorMessage } from "../../utils/errorSummary";

/**
 * 서버 오류를 요약으로 보여 주고 전문은 접어 두는 알림.
 *
 * 백엔드는 실패 사유에 원인 사슬과 응답 본문을 그대로 이어 붙인다. 전문은 원인을 짚는 데 필요하지만
 * 화면에 그대로 실으면 읽히지 않는다. 그래서 무엇이 실패했는지 알 수 있는 앞머리만 보여 주고,
 * 전문은 "자세히" 를 누를 때만 펼친다. 잘라낼 것이 없으면 버튼도 띄우지 않는다.
 *
 * 전문은 복사 버튼을 함께 둔다. 사용자가 이 문구를 그대로 옮겨 붙일 일이 많다.
 */
function ErrorDetailAlert({
  message = "",
  title = null,
  severity = "error",
  variant = "standard",
  sx = undefined,
  onClose = undefined,
  children = null,
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { summary, detail } = splitErrorMessage(message);

  if (!summary && !children) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(detail || summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경(비 HTTPS·권한 거부)에서는 조용히 넘긴다.
      // 전문은 이미 화면에 펼쳐져 있어 손으로 선택할 수 있다.
    }
  };

  return (
    <Alert severity={severity} variant={variant} sx={sx} onClose={onClose}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {summary}
      {children}

      {detail && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={() => setExpanded((previous) => !previous)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ px: 0.5, minWidth: 0, textTransform: "none" }}
          >
            {expanded
              ? t("common.error.hideDetail", "접기")
              : t("common.error.showDetail", "자세히")}
          </Button>

          <Collapse in={expanded} unmountOnExit>
            <Box
              component="pre"
              sx={{
                mt: 1,
                mb: 0,
                p: 1,
                maxHeight: 280,
                overflow: "auto",
                borderRadius: 1,
                bgcolor: "action.hover",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {detail}
            </Box>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={handleCopy}
              startIcon={<ContentCopyIcon fontSize="small" />}
              sx={{ mt: 0.5, px: 0.5, minWidth: 0, textTransform: "none" }}
            >
              {copied
                ? t("common.error.copied", "복사했습니다")
                : t("common.error.copyDetail", "전문 복사")}
            </Button>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
}

ErrorDetailAlert.propTypes = {
  /** 서버가 내려준 오류 문구. 요약과 전문으로 갈라 표시한다. */
  message: PropTypes.string,
  /** 알림 제목. 없으면 제목 없이 본문만 낸다. */
  title: PropTypes.node,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
  variant: PropTypes.oneOf(["standard", "filled", "outlined"]),
  sx: PropTypes.object,
  /** 닫기 버튼을 붙인다. 없으면 닫기 버튼이 나오지 않는다. */
  onClose: PropTypes.func,
  /** 요약 뒤에 덧붙일 내용(안내 문구·조치 버튼 등). */
  children: PropTypes.node,
};
export default ErrorDetailAlert;
