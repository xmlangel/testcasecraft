import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import TestResultForm from "./TestResultForm.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useTranslation } from "../context/I18nContext.jsx";
import { invalidateDashboardCache } from "../services/dashboardService";
import { getOrderedTestCaseIds } from "../utils/treeUtils.jsx";
import {
  getLatestResults,
  readFilteredNavIds,
} from "./TestExecution/utils.jsx";

// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

/**
 * 케이스 결과 입력 화면.
 *
 * embedded=true 면 신규 레이아웃의 오른쪽 영역 안에서 열린다 — 상단 바·좌측 메뉴를
 * 유지하려면 뷰포트 높이(100vh)를 쓰지 않아야 한다. 기존 레이아웃은 전체 화면 그대로.
 */
const TestCaseResultPage = ({ embedded = false }) => {
  const { projectId, executionId, testCaseId } = useParams();
  const navigate = useNavigate();
  const { api } = useAppContext();
  const { t } = useTranslation();

  const [execution, setExecution] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [testCasesList, setTestCasesList] = useState([]);
  // 상단 통계의 집계 범위 — 플랜의 케이스 목록(필터와 무관하게 실행 전체 기준)
  const [planCaseIds, setPlanCaseIds] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 테스트 실행과 테스트케이스 정보를 병렬로 조회
        const [executionResponse, testCaseResponse] = await Promise.all([
          api(`/api/test-executions/${executionId}`),
          api(`/api/testcases/${testCaseId}`),
        ]);

        if (!executionResponse.ok) {
          throw new Error(
            t(
              "testCaseResult.error.executionLoad",
              "테스트 실행 정보를 불러올 수 없습니다.",
            ),
          );
        }
        if (!testCaseResponse.ok) {
          throw new Error(
            t(
              "testCaseResult.error.caseLoad",
              "테스트케이스 정보를 불러올 수 없습니다.",
            ),
          );
        }

        const executionData = await executionResponse.json();
        const testCaseData = await testCaseResponse.json();

        // 테스트 플랜의 테스트 케이스 목록 가져오기
        const testPlanId =
          executionData.testPlanId || executionData.testPlan?.id;
        if (testPlanId) {
          const [testPlanResponse, testCasesResponse] = await Promise.all([
            api(`/api/test-plans/${testPlanId}`),
            api(`/api/testcases/project/${projectId}`),
          ]);

          if (testPlanResponse.ok && testCasesResponse.ok) {
            const testPlanData = await testPlanResponse.json();
            const allTestCases = await testCasesResponse.json();

            // ICT-XXX: 공통 유틸리티 함수로 폴더 계층 구조 순서 생성
            const { orderedTestCaseIds } = getOrderedTestCaseIds(
              allTestCases,
              testPlanData.testCaseIds || [],
            );

            // 목록 화면(TestExecutionForm)에서 필터가 걸린 상태로 진입했다면,
            // 필터된 ID 목록을 우선 사용해 이전/다음이 필터 순서를 따르도록 한다.
            // 필터 정보가 없거나(딥링크 등) 현재 케이스가 그 목록에 없으면 전체 목록으로 폴백.
            const savedNavIds = readFilteredNavIds(executionId);
            let finalTestCaseIds =
              savedNavIds && savedNavIds.includes(testCaseId)
                ? savedNavIds
                : orderedTestCaseIds;

            // 목록이 비어있거나 현재 testCaseId가 없으면 현재 testCaseId를 추가
            if (
              finalTestCaseIds.length === 0 ||
              !finalTestCaseIds.includes(testCaseId)
            ) {
              // 현재 testCaseId를 포함시킴
              finalTestCaseIds = [testCaseId];
            }

            const casesList = finalTestCaseIds.map((id) => ({ id }));
            setTestCasesList(casesList);
            // 통계는 필터·네비 목록이 아니라 플랜 전체를 분모로 삼는다 —
            // 실행 화면(TestExecutionForm)의 요약과 같은 범위여야 숫자가 맞는다.
            setPlanCaseIds(orderedTestCaseIds);
            setTestCases(allTestCases);

            // 현재 테스트 케이스의 인덱스 찾기
            const index = finalTestCaseIds.indexOf(testCaseId);
            setCurrentIndex(index >= 0 ? index : 0);
          } else {
            // 테스트 플랜이나 테스트 케이스 목록 조회 실패 시에도 현재 testCaseId는 표시
            setTestCasesList([{ id: testCaseId }]);
            setPlanCaseIds([testCaseId]);
            setCurrentIndex(0);
          }
        }

        setExecution(executionData);
        setTestCase(testCaseData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && executionId && testCaseId) {
      fetchData();
    }
  }, [projectId, executionId, testCaseId, api]);

  const handleBack = () => {
    navigate(
      `/projects/${projectId}/executions/${executionId}?scrollTo=${testCaseId}`,
    );
  };

  const handleSave = (updatedExecution) => {
    setExecution(updatedExecution);

    // ICT-198: 대시보드 캐시 무효화
    try {
      invalidateDashboardCache();
    } catch (e) {
      console.error("Failed to invalidate dashboard cache:", e);
    }
  };

  const handleClose = () => {
    handleBack();
  };

  const handleNext = () => {
    if (currentIndex < testCasesList.length - 1) {
      const nextTestCase = testCasesList[currentIndex + 1];
      navigate(
        `/projects/${projectId}/executions/${executionId}/testcases/${nextTestCase.id}/result`,
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevTestCase = testCasesList[currentIndex - 1];
      navigate(
        `/projects/${projectId}/executions/${executionId}/testcases/${prevTestCase.id}/result`,
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: embedded ? 0 : "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: embedded ? 0 : "100vh",
          bgcolor: "background.default",
          px: embedded ? 2 : 3,
          py: embedded ? 1 : 1.5,
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleBack}>
                {t("common.button.back", "뒤로가기")}
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: embedded ? 0 : "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: embedded ? "auto" : "100vh",
          minHeight: embedded ? "calc(100vh - 210px)" : undefined,
          overflow: embedded ? "visible" : "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {execution && testCase ? (
          <TestResultForm
            // 케이스 전환 시 리마운트 강제 — 이전 케이스의 입력 상태와
            // 다음 케이스의 resultId가 섞인 스냅샷이 자동저장으로 흘러가는 것을 방지
            key={testCaseId}
            open={true}
            testCaseId={testCaseId}
            executionId={executionId}
            currentResult={
              getLatestResults(
                (execution.results || []).filter(
                  (r) => r.testCaseId === testCaseId,
                ),
              )[0]
            }
            onClose={handleClose}
            onSave={handleSave}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBack={handleBack}
            currentIndex={currentIndex}
            totalCount={testCasesList.length || 1}
            statCaseIds={planCaseIds.length > 0 ? planCaseIds : undefined}
            fullPage={true}
            embedded={embedded}
            execution={execution}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Alert severity="info" variant="outlined">
              {t(
                "testCaseResult.page.loadingData",
                "테스트 케이스 정보를 불러오는 중입니다...",
              )}
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
};

TestCaseResultPage.propTypes = {
  embedded: PropTypes.bool,
};

export default TestCaseResultPage;
