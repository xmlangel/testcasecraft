// src/components/TestCase/useRagRegistration.js
// 테스트케이스 RAG 등록 상태 조회와 수동 등록. 상태 칩(RagStatusBadge)과 더보기 메뉴의
// 「RAG 등록」 항목이 같은 상태를 쓰도록 RagStatusBadge 에서 떼어 냈다(ICT-494 tl-2).

import { useState, useEffect, useRef, useCallback } from "react";
import { useRAG } from "../../context/RAGContext.jsx";

/**
 * 반환값 status
 * - "hidden": 보이지 않는다(새 케이스·폴더·LLM 또는 RAG 꺼짐, 상태를 아직 모름)
 * - "checking": 등록 상태를 확인하는 중
 * - "vectorized": 등록됨
 * - "notVectorized": 미등록. register() 로 등록할 수 있다.
 */
const useRagRegistration = ({
  testCaseId,
  ragVectorized = null,
  isLlmAvailable = false,
  isFolder = false,
  onVectorized = null,
  api,
}) => {
  const { isRagEnabled } = useRAG();
  const [isRegistering, setIsRegistering] = useState(false);
  const [localVectorized, setLocalVectorized] = useState(ragVectorized);
  const [isChecking, setIsChecking] = useState(false);
  const fetchedRef = useRef(false);

  // prop 이 바뀌면 동기화. 상위가 상태를 알고 있으면 조회를 건너뛴다.
  useEffect(() => {
    setLocalVectorized(ragVectorized);
    fetchedRef.current = ragVectorized !== null;
  }, [ragVectorized]);

  useEffect(() => {
    if (
      !testCaseId ||
      isFolder ||
      !isLlmAvailable ||
      !isRagEnabled ||
      fetchedRef.current
    ) {
      return undefined;
    }

    if (ragVectorized !== null) {
      fetchedRef.current = true;
      return undefined;
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

  const register = useCallback(async () => {
    if (isRegistering || !testCaseId) return;
    setIsRegistering(true);
    try {
      const response = await api(`/api/rag/testcases/${testCaseId}/vectorize`, {
        method: "POST",
      });
      if (response.ok) {
        setLocalVectorized(true);
        if (onVectorized) onVectorized(true);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error(
          "RAG registration failed:",
          errData.message || response.status,
        );
      }
    } catch (error) {
      console.error("RAG registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  }, [api, isRegistering, onVectorized, testCaseId]);

  let status = "hidden";
  if (testCaseId && !isFolder && isLlmAvailable && isRagEnabled) {
    if (isChecking) status = "checking";
    else if (localVectorized === true) status = "vectorized";
    else if (localVectorized === false) status = "notVectorized";
  }

  return { status, isRegistering, register };
};

export default useRagRegistration;
