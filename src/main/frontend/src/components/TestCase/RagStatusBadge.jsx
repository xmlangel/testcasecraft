// src/components/TestCase/RagStatusBadge.jsx

import React, { useState, useEffect, useRef } from "react";
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
 *
 * ragVectorized prop이 null이면 API를 직접 호출해 상태를 확인합니다.
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
  // null = 상태 확인 전(로딩 중), true = 벡터화됨, false = 미벡터화
  const [localVectorized, setLocalVectorized] = useState(ragVectorized);
  const [isChecking, setIsChecking] = useState(false);
  const fetchedRef = useRef(false);

  // ragVectorized prop이 변경될 때 로컬 상태 동기화 (null 포함)
  useEffect(() => {
    setLocalVectorized(ragVectorized);
    // prop이 명확한 값(true/false)으로 바뀌면 재조회 불필요
    if (ragVectorized !== null) {
      fetchedRef.current = true;
    } else {
      fetchedRef.current = false;
    }
  }, [ragVectorized]);

  // ragVectorized prop이 null이고 조건이 충족되면 API로 직접 상태 확인
  useEffect(() => {
    if (
      !testCaseId ||
      isFolder ||
      !isLlmAvailable ||
      !isRagEnabled ||
      fetchedRef.current
    ) {
      return;
    }

    // prop 값이 명확하면 API 호출 불필요
    if (ragVectorized !== null) {
      fetchedRef.current = true;
      return;
    }

    let cancelled = false;
    fetchedRef.current = true;
    setIsChecking(true);

    const checkStatus = async () => {
      try {
        const response = await api(`/api/rag/testcases/${testCaseId}/status`);
        if (cancelled) return;
        if (response.ok) {
          const data = await response.json();
          setLocalVectorized(data.vectorized === true);
        } else {
          // API 호출 실패 시 미등록으로 표시
          setLocalVectorized(false);
        }
      } catch {
        if (!cancelled) setLocalVectorized(false);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [testCaseId, isFolder, isLlmAvailable, isRagEnabled, ragVectorized, api]);

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

  // 상태 확인 중 (null이고 API 호출 중)
  if (isChecking) {
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

  // null이지만 isChecking이 false인 경우: API 호출 자체를 건너뛴 경우(조건 미충족)
  // 또는 false인 경우: RAG 미등록 상태
  if (localVectorized === null) {
    return null;
  }

  // RAG 미등록 상태 (localVectorized === false)
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
