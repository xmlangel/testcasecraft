import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import {
  UnfoldMore as UnfoldMoreIcon,
  WrapText as WrapTextIcon,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import MarkdownViewer from "../common/MarkdownViewer.jsx";
import { countEnteredSteps } from "../../utils/stepResults.js";

// ICT-469: 스텝 결과 버튼 (P/F/B). 다시 누르면 NOT_RUN 으로 되돌린다
const STEP_RESULT_OPTIONS = [
  { value: "PASS", label: "P", color: "success" },
  { value: "FAIL", label: "F", color: "error" },
  { value: "BLOCKED", label: "B", color: "warning" },
];

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

// 케이스 본문 보기 옵션 — 사용자 선택을 브라우저에 유지
// expandAll: true 면 단계 셀의 상하 스크롤(20em 제한)을 해제하고 모두 표시 (기본: 스크롤)
// wrap:      true 면 자동 줄바꿈(워드랩) — 코드블록·긴 문자열까지 줄바꿈하여
//            작은 화면에서 가로 스크롤 없이 모두 보이게 함 (기본: 현행 = 코드 가로 스크롤)
const VIEW_OPTIONS_KEY = "testResult.caseDetails.viewOptions";
const readViewOptions = () => {
  try {
    const v = JSON.parse(localStorage.getItem(VIEW_OPTIONS_KEY) || "{}");
    return { expandAll: v.expandAll === true, wrap: v.wrap === true };
  } catch {
    return { expandAll: false, wrap: false };
  }
};
const writeViewOptions = (options) => {
  try {
    localStorage.setItem(VIEW_OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // localStorage 미지원/차단 환경에서는 무시
  }
};

const buildStepCellSx = ({ expandAll }) => ({
  whiteSpace: "pre-line",
  display: "block",
  ...(expandAll ? {} : { maxHeight: "20em", overflowY: "auto" }),
});

// 자동 워드랩 — 케이스 본문 전체(설명·사전조건·단계·기대결과 등)의
// 마크다운 코드블록과 긴 문자열을 줄바꿈해 작은 화면에서 가로 스크롤 제거
const buildWrapSx = ({ wrap }) =>
  wrap
    ? {
        // 마크다운 본문에만 적용 — 표 헤더("No." 등) 글자 단위 쪼개짐 방지
        "& .markdown-body": {
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        },
        "& .markdown-body pre, & .markdown-body pre > code": {
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        },
        "& .markdown-body code": {
          wordBreak: "break-all",
        },
      }
    : {};

// stepResults·onStepChange 를 넘기면 스텝 표에 결과와 실제 결과 칸이 붙는다(ICT-469). 넘기지 않으면 기존 표 그대로.
const TestCaseDetails = ({
  testCase,
  t,
  stepResults = null,
  onStepChange = null,
  onPassAllSteps = null,
  stepInputDisabled = false,
}) => {
  const withStepResults = !!stepResults && !!onStepChange;
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const [viewOptions, setViewOptions] = useState(readViewOptions);

  const toggleViewOption = (key) => {
    setViewOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      writeViewOptions(next);
      return next;
    });
  };

  const stepCellSx = buildStepCellSx(viewOptions);
  const wrapSx = buildWrapSx(viewOptions);

  if (!testCase) return null;

  // 디버그 모드일 때 첨부파일 URL 로그 출력
  React.useEffect(() => {
    const isDebug = localStorage.getItem("debug") === "true";
    if (!isDebug || !testCase) return;

    const checkContent = (field, content) => {
      if (!content) return;
      if (content.includes("/api/testcase-attachments/public/")) {
        console.log(
          `[DEBUG] Found public attachment URL in ${field}:`,
          content,
        );
        // URL 추출
        const matches = content.match(
          /\/api\/testcase-attachments\/public\/[^)"\s]+/g,
        );
        if (matches) {
          console.log(`[DEBUG] Extracted URLs from ${field}:`, matches);
        }
      }
    };

    console.log(
      `[DEBUG] Checking TestCase ${testCase.id} (${testCase.name}) for public attachment URLs`,
    );
    checkContent("description", testCase.description);
    checkContent("preCondition", testCase.preCondition);
    checkContent("expectedResults", testCase.expectedResults);
    checkContent("postCondition", testCase.postCondition);
    checkContent("testTechnique", testCase.testTechnique);

    if (testCase.steps) {
      testCase.steps.forEach((step, index) => {
        checkContent(`step[${index}].description`, step.description);
        checkContent(`step[${index}].expectedResult`, step.expectedResult);
      });
    }
  }, [testCase]);

  return (
    <Box sx={wrapSx}>
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          px: 3,
          py: 2,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 1,
          }}
        >
          {testCase.displayId && (
            <Chip
              label={testCase.displayId}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
              data-testid="result-case-id"
            />
          )}
          <Subtitle
            variant="subtitle1"
            gutterBottom
            sx={{ mb: 0 }}
            data-testid="result-case-title"
          >
            {testCase.parentName &&
            testCase.parentName !== t("testcase.noParent", "상위없음")
              ? `${testCase.parentName} >> ${testCase.name}`
              : testCase.name}
          </Subtitle>
          {testCase.priority && (
            <Chip
              label={testCase.priority}
              color={
                testCase.priority === "High"
                  ? "error"
                  : testCase.priority === "Medium"
                    ? "warning"
                    : "info"
              }
              size="small"
              sx={{ ml: 1 }}
            />
          )}
          <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
            <Tooltip
              title={t(
                "testResult.caseDetails.expandAllTooltip",
                "단계 내용을 상하 스크롤 없이 모두 표시합니다.",
              )}
            >
              <ToggleButton
                value="expandAll"
                size="small"
                selected={viewOptions.expandAll}
                onChange={() => toggleViewOption("expandAll")}
                sx={{ py: 0.25, px: 1, fontSize: "0.72rem" }}
                data-testid="case-details-expand-toggle"
              >
                <UnfoldMoreIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {t("testResult.caseDetails.expandAll", "모두 펼치기")}
              </ToggleButton>
            </Tooltip>
            <Tooltip
              title={t(
                "testResult.caseDetails.wrapTooltip",
                "자동 줄바꿈(워드랩) — 작은 화면에서 가로 스크롤 없이 표시합니다.",
              )}
            >
              <ToggleButton
                value="wrap"
                size="small"
                selected={viewOptions.wrap}
                onChange={() => toggleViewOption("wrap")}
                sx={{ py: 0.25, px: 1, fontSize: "0.72rem" }}
                data-testid="case-details-wrap-toggle"
              >
                <WrapTextIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {t("testResult.caseDetails.wrap", "줄바꿈")}
              </ToggleButton>
            </Tooltip>
          </Box>
        </Box>
        {testCase.description && (
          <Box data-color-mode={darkMode ? "dark" : "light"}>
            <MarkdownViewer
              content={testCase.description}
              style={{
                padding: "8px 12px",
                backgroundColor: darkMode
                  ? "transparent"
                  : theme.palette.action.hover,
                borderRadius: "4px",
                fontSize: "0.875rem",
                color: theme.palette.text.primary,
              }}
            />
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          px: 3,
          py: 2,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Subtitle variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          {t("testResult.form.preCondition")}
        </Subtitle>
        {testCase.preCondition && (
          <Box data-color-mode={darkMode ? "dark" : "light"}>
            <MarkdownViewer
              content={testCase.preCondition}
              style={{
                padding: "8px 12px",
                backgroundColor: darkMode
                  ? "transparent"
                  : theme.palette.action.hover,
                borderRadius: "4px",
                fontSize: "0.875rem",
                color: theme.palette.text.primary,
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {testCase.steps?.length > 0 && (
          <Box sx={{ mt: 1, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Subtitle variant="subtitle2" gutterBottom sx={{ flexGrow: 1 }}>
                {t("testResult.form.testSteps")}
                {withStepResults &&
                  (() => {
                    const { entered, total } = countEnteredSteps(
                      testCase.steps,
                      stepResults,
                    );
                    return ` (${t("testResult.steps.enteredCount", "{entered}/{total} 입력", { entered, total })})`;
                  })()}
              </Subtitle>
              {withStepResults && onPassAllSteps && !stepInputDisabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={onPassAllSteps}
                  data-testid="pass-all-steps"
                >
                  {t("testResult.steps.passAll", "모든 스텝 Pass")}
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={withStepResults ? "6%" : "10%"}>
                      No.
                    </TableCell>
                    <TableCell width={withStepResults ? "32%" : "60%"}>
                      Step
                    </TableCell>
                    <TableCell width={withStepResults ? "22%" : "30%"}>
                      Expected
                    </TableCell>
                    {withStepResults && (
                      <>
                        <TableCell width="14%">
                          {t("testResult.steps.result", "결과")}
                        </TableCell>
                        <TableCell width="26%">
                          {t("testResult.steps.actualResult", "실제 결과")}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testCase.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => (
                      <TableRow key={step.stepNumber}>
                        <TableCell>{step.stepNumber}</TableCell>
                        <TableCell>
                          <Box
                            data-color-mode={darkMode ? "dark" : "light"}
                            sx={stepCellSx}
                          >
                            <MarkdownViewer
                              content={step.description || ""}
                              style={{
                                fontSize: "0.875rem",
                                backgroundColor: "transparent",
                                color: theme.palette.text.primary,
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            data-color-mode={darkMode ? "dark" : "light"}
                            sx={stepCellSx}
                          >
                            <MarkdownViewer
                              content={step.expectedResult || ""}
                              style={{
                                fontSize: "0.875rem",
                                backgroundColor: "transparent",
                                color: theme.palette.text.secondary,
                              }}
                            />
                          </Box>
                        </TableCell>
                        {withStepResults && (
                          <>
                            <TableCell sx={{ verticalAlign: "top" }}>
                              <ToggleButtonGroup
                                size="small"
                                exclusive
                                disabled={stepInputDisabled}
                                value={
                                  stepResults[step.stepNumber]?.result ||
                                  "NOT_RUN"
                                }
                                onChange={(_, value) =>
                                  onStepChange(step.stepNumber, {
                                    result: value || "NOT_RUN",
                                  })
                                }
                                aria-label={`step-${step.stepNumber}-result`}
                              >
                                {STEP_RESULT_OPTIONS.map((opt) => (
                                  <ToggleButton
                                    key={opt.value}
                                    value={opt.value}
                                    color={opt.color}
                                    data-testid={`step-${step.stepNumber}-${opt.value}`}
                                    sx={{ px: 1, py: 0.25, fontWeight: 700 }}
                                  >
                                    <Tooltip title={opt.value}>
                                      <span>{opt.label}</span>
                                    </Tooltip>
                                  </ToggleButton>
                                ))}
                              </ToggleButtonGroup>
                            </TableCell>
                            <TableCell sx={{ verticalAlign: "top" }}>
                              <TextField
                                size="small"
                                fullWidth
                                multiline
                                maxRows={6}
                                disabled={stepInputDisabled}
                                placeholder={t(
                                  "testResult.steps.actualResultPlaceholder",
                                  "관찰한 내용이나 메모",
                                )}
                                value={
                                  stepResults[step.stepNumber]?.actualResult ||
                                  ""
                                }
                                onChange={(e) =>
                                  onStepChange(step.stepNumber, {
                                    actualResult: e.target.value,
                                  })
                                }
                                inputProps={{
                                  "data-testid": `step-${step.stepNumber}-actual`,
                                  maxLength: 10000,
                                }}
                              />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <Box>
          <Subtitle variant="subtitle1" gutterBottom>
            {t("testResult.form.expectedResult")}
          </Subtitle>
          {testCase.expectedResults && (
            <Box data-color-mode={darkMode ? "dark" : "light"}>
              <MarkdownViewer
                content={testCase.expectedResults}
                style={{
                  padding: "8px 12px",
                  backgroundColor: darkMode
                    ? "transparent"
                    : theme.palette.action.hover,
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  color: theme.palette.text.primary,
                }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 사후조건 */}
        {testCase.postCondition && (
          <Box sx={{ mb: 1 }}>
            <Subtitle variant="subtitle1" gutterBottom>
              {t("testResult.form.postCondition")}
            </Subtitle>
            <Box data-color-mode={darkMode ? "dark" : "light"}>
              <MarkdownViewer
                content={testCase.postCondition}
                style={{
                  padding: "8px 12px",
                  backgroundColor: darkMode
                    ? "transparent"
                    : theme.palette.action.hover,
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  color: theme.palette.text.primary,
                }}
              />
            </Box>
          </Box>
        )}

        {/* 자동화 여부, 실행 타입 */}
        <Box
          sx={{
            mb: 1,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              {t("testResult.form.automationStatus")}
            </Typography>
            <Chip
              label={
                testCase.isAutomated
                  ? t("testResult.form.automated")
                  : t("testResult.form.manual")
              }
              color={testCase.isAutomated ? "success" : "default"}
              size="small"
            />
          </Box>

          {testCase.executionType && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                {t("testResult.form.executionType")}
              </Typography>
              <Chip
                label={testCase.executionType}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* 테스트 기법 */}
        {testCase.testTechnique && (
          <Box sx={{ mb: 1 }}>
            <Subtitle variant="subtitle1" gutterBottom>
              {t("testResult.form.testTechnique")}
            </Subtitle>
            <Box data-color-mode={darkMode ? "dark" : "light"}>
              <MarkdownViewer
                content={testCase.testTechnique}
                style={{
                  padding: "8px 12px",
                  backgroundColor: darkMode
                    ? "transparent"
                    : theme.palette.action.hover,
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  color: theme.palette.text.primary,
                }}
              />
            </Box>
          </Box>
        )}

        {/* 테스트 케이스 태그 */}
        {testCase.tags && testCase.tags.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Subtitle variant="caption" sx={{ mb: 0.5, display: "block" }}>
              {t("testResult.form.tags")}
            </Subtitle>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {testCase.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />
      </Paper>
    </Box>
  );
};

export default TestCaseDetails;
