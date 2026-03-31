import React, { useState, useEffect } from "react";
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

// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

const TestCaseResultPage = () => {
  const { projectId, executionId, testCaseId } = useParams();
  const navigate = useNavigate();
  const { api } = useAppContext();
  const { t } = useTranslation();

  const [execution, setExecution] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [testCasesList, setTestCasesList] = useState([]);
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
          throw new Error("테스트 실행 정보를 불러올 수 없습니다.");
        }
        if (!testCaseResponse.ok) {
          throw new Error("테스트케이스 정보를 불러올 수 없습니다.");
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

            // orderedTestCaseIds가 비어있거나 현재 testCaseId가 없으면 현재 testCaseId를 추가
            let finalTestCaseIds = orderedTestCaseIds;
            if (
              finalTestCaseIds.length === 0 ||
              !finalTestCaseIds.includes(testCaseId)
            ) {
              // 현재 testCaseId를 포함시킴
              finalTestCaseIds = [testCaseId];
            }

            const casesList = finalTestCaseIds.map((id) => ({ id }));
            setTestCasesList(casesList);
            setTestCases(allTestCases);

            // 현재 테스트 케이스의 인덱스 찾기
            const index = finalTestCaseIds.indexOf(testCaseId);
            setCurrentIndex(index >= 0 ? index : 0);
          } else {
            // 테스트 플랜이나 테스트 케이스 목록 조회 실패 시에도 현재 testCaseId는 표시
            setTestCasesList([{ id: testCaseId }]);
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
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4 }}>
        <Container maxWidth="md">
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {execution && testCase ? (
          <TestResultForm
            open={true}
            testCaseId={testCaseId}
            executionId={executionId}
            currentResult={execution.results?.find(
              (r) => r.testCaseId === testCaseId,
            )}
            onClose={handleClose}
            onSave={handleSave}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBack={handleBack}
            currentIndex={currentIndex}
            totalCount={testCasesList.length || 1}
            fullPage={true}
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

export default TestCaseResultPage;
