// src/components/TestCase/RagStatusBadge.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Button, Tooltip, CircularProgress } from "@mui/material";
import {
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { useRAG } from "../../context/RAGContext.jsx";

/**
 * 테스트케이스 RAG 벡터화 상태 표시 + 수동 등록 버튼 컴포넌트
 *
 * 노출 조건:
 * - LLM 설정이 활성화되어 있을 때 (isLlmAvailable === true)
 * - RAG 기능이 활성화되어 있을 때 (isRagEnabled === true)
 * - 기존 테스트케이스일 때 (testCaseId 존재)
 * - 폴더가 아닐 때 (!isFolder)
 */
const RagStatusBadge = ({
  testCaseId,
  ragVectorized = null,
  isLlmAvailable = false,
  isFolder = false,
  onVectorized = null,
  api,
}) => {
  // ✅ Rules of Hooks: 모든 Hook은 조기 return 이전에 최상단에 선언해야 함
  const { t } = useI18n();
  const { isRagEnabled } = useRAG();
  const [isRegistering, setIsRegistering] = useState(false);
  const [localVectorized, setLocalVectorized] = useState(ragVectorized);

  // ragVectorized prop이 변경될 때 로컬 상태 동기화 (Hook은 return null 이전에 위치)
  useEffect(() => {
    setLocalVectorized(ragVectorized);
  }, [ragVectorized]);

  // ✅ 노출 조건 체크 - 반드시 모든 Hook 호출 이후에 위치해야 함 (Rules of Hooks)
  if (!testCaseId || isFolder || !isLlmAvailable || !isRagEnabled) {
    return null;
  }

  const handleRagRegister = async () => {
    if (isRegistering) return;
    setIsRegistering(true);

    try {
      const response = await api(`/api/rag/testcases/${testCaseId}/vectorize`, {
        method: "POST",
      });

      if (response.ok) {
        setLocalVectorized(true);
        if (onVectorized) {
          onVectorized(true);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error("RAG 등록 실패:", errData.message || response.status);
      }
    } catch (error) {
      console.error("RAG 등록 오류:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (localVectorized === true) {
    // RAG 등록 완료 상태
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
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
            borderRadius: "6px",
            "& .MuiChip-icon": { fontSize: "1rem" },
          }}
        />
      </Tooltip>
    );
  }

  // RAG 미등록 상태
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
            borderRadius: "6px",
            "& .MuiChip-icon": { fontSize: "1rem" },
          }}
        />
      </Tooltip>

      <Tooltip
        title={t(
          "testcase.rag.register.tooltip",
          "RAG 시스템에 등록하면 유사 테스트케이스 검색 및 AI 추천에 활용됩니다.",
        )}
        placement="bottom"
      >
        <span>
          <Button
            id="rag-register-button"
            size="small"
            variant="outlined"
            color="warning"
            disabled={isRegistering}
            onClick={handleRagRegister}
            startIcon={
              isRegistering ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CloudUploadIcon />
              )
            }
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "6px",
              py: 0.4,
              px: 1.2,
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "warning.main",
                color: "#fff",
              },
            }}
          >
            {isRegistering
              ? t("testcase.rag.registering", "등록 중...")
              : t("testcase.rag.register", "RAG 등록")}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

RagStatusBadge.propTypes = {
  testCaseId: PropTypes.string,
  ragVectorized: PropTypes.bool,
  isLlmAvailable: PropTypes.bool,
  isFolder: PropTypes.bool,
  onVectorized: PropTypes.func,
  api: PropTypes.func.isRequired,
};

export default RagStatusBadge;
