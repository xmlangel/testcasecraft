// src/components/TestCase/RagStatusBadge.jsx

import React from "react";
import PropTypes from "prop-types";
import { Chip, Tooltip, CircularProgress } from "@mui/material";
import {
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

const CHIP_SX = {
  fontWeight: 600,
  fontSize: "0.75rem",
  borderRadius: "6px",
  "& .MuiChip-icon": { fontSize: "1rem" },
};

/**
 * 테스트케이스 RAG 등록 상태 칩.
 * 상태 조회와 등록은 useRagRegistration 이 맡고, 「RAG 등록」 동작은 상세 머리의
 * 더보기(⋮) 메뉴로 옮겼다(ICT-494 tl-2). 이 칩은 상태만 보여 준다.
 */
const RagStatusBadge = ({ status }) => {
  const { t } = useI18n();

  if (status === "checking") {
    return (
      <Tooltip
        title={t(
          "testcase.rag.checking.tooltip",
          "RAG 등록 상태를 확인하는 중입니다...",
        )}
        placement="bottom"
      >
        <Chip
          icon={<CircularProgress size={12} color="inherit" />}
          label={t("testcase.rag.checking.label", "상태 확인 중...")}
          size="small"
          color="default"
          variant="outlined"
          sx={CHIP_SX}
          data-testid="rag-status-chip"
          data-status="checking"
        />
      </Tooltip>
    );
  }

  if (status === "vectorized") {
    return (
      <Tooltip
        title={t(
          "testcase.rag.vectorized.tooltip",
          "이 테스트케이스는 RAG 시스템에 등록되어 유사도 검색에 활용됩니다.",
        )}
        placement="bottom"
      >
        <Chip
          icon={<CloudDoneIcon />}
          label={t("testcase.rag.vectorized.label", "RAG 등록됨")}
          size="small"
          color="success"
          variant="outlined"
          sx={CHIP_SX}
          data-testid="rag-status-chip"
          data-status="vectorized"
        />
      </Tooltip>
    );
  }

  if (status === "notVectorized") {
    return (
      <Tooltip
        title={t(
          "testcase.rag.notVectorized.tooltip",
          "이 테스트케이스는 아직 RAG 시스템에 등록되지 않았습니다. 등록하면 유사 테스트케이스 검색에 활용됩니다.",
        )}
        placement="bottom"
      >
        <Chip
          icon={<CloudOffIcon />}
          label={t("testcase.rag.notVectorized.label", "RAG 미등록")}
          size="small"
          color="warning"
          variant="outlined"
          sx={CHIP_SX}
          data-testid="rag-status-chip"
          data-status="notVectorized"
        />
      </Tooltip>
    );
  }

  return null;
};

RagStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    "hidden",
    "checking",
    "vectorized",
    "notVectorized",
  ]),
};

export default RagStatusBadge;
