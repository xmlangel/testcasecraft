// src/components/TestResultForm.js

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { TestResult } from "../models/testExecution";
import { useAppContext } from "../context/AppContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const MULTILINE_SCROLL_SX = { whiteSpace: "pre-line", maxHeight: "20em", overflowY: "auto", display: "block" };
const KEY_RESULT_MAP = { N: TestResult.NOTRUN, P: TestResult.PASS, F: TestResult.FAIL, B: TestResult.BLOCKED };

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult = { result: TestResult.NOTRUN, notes: "" },
  onClose,
  onSave,
  onNext,
}) => {
  const { user } = useAppContext();
  const isViewer = user?.role === "VIEWER";

  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();
  const saveButtonRef = useRef();

  useEffect(() => {
    setResult(currentResult.result);
    setNotes(currentResult.notes);
  }, [currentResult]);

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!testCaseId || !open) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(
          `${API_BASE_URL}/api/testcases/${testCaseId}`,
          { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
        );
        if (!response.ok) throw new Error("테스트케이스 정보를 불러오지 못했습니다.");
        const data = await response.json();
        setTestCase(data);
        setError(undefined);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestCase();
  }, [testCaseId, open]);

  // 단축키 입력 방지 (Viewer는 입력 불가)
  useEffect(() => {
    if (!open || isViewer) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement.tagName === "TEXTAREA") return;
      const key = e.key.toUpperCase();
      if (KEY_RESULT_MAP[key]) {
        setResult(KEY_RESULT_MAP[key]);
        setTimeout(() => handleSaveAndNext(KEY_RESULT_MAP[key]), 0);
        e.preventDefault();
        return;
      }
      if (e.key === "Enter") {
        if (document.activeElement !== saveButtonRef.current && document.activeElement.tagName !== "TEXTAREA") {
          handleSaveAndNext();
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [open, testCaseId, executionId, onSave, onNext, isViewer]);

  const handleSaveAndNext = async (customResult) => {
    if (isViewer) return; // Viewer는 입력 불가
    const actualResult = customResult !== undefined ? customResult : result;

    // result가 선택되지 않은 경우 저장하지 않도록 수정
    if (!actualResult) {
      setSaveError("테스트 결과를 선택해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `${API_BASE_URL}/api/test-executions/${executionId}/results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            testCaseId,
            result: actualResult,
            notes,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      const updatedExecution = await response.json();
      onSave(updatedExecution);
      if (onNext) onNext();
    } catch (err) {
      setSaveError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="test-result-dialog">
      <DialogTitle id="test-result-dialog">테스트 결과 입력</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : testCase ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {testCase.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLL_SX}>
                {testCase.description}
              </Typography>
            </Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              전제조건
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLL_SX}>
              {testCase.preCondition}
            </Typography>
            <Box>
              <Divider sx={{ my: 2 }} />
              {testCase.steps?.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    테스트 단계
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={10}>No.</TableCell>
                          <TableCell width={60}>Step</TableCell>
                          <TableCell width={30}>Expected</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {testCase.steps
                          .sort((a, b) => a.stepNumber - b.stepNumber)
                          .map((step) => (
                            <TableRow key={step.stepNumber}>
                              <TableCell>{step.stepNumber}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={MULTILINE_SCROLL_SX}>
                                  {step.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLL_SX}>
                                  {step.expectedResult}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              기대 결과
            </Typography>
            <Typography variant="body2" sx={MULTILINE_SCROLL_SX}>
              {testCase.expectedResults}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }} disabled={isViewer}>
                <FormLabel component="legend">테스트 결과</FormLabel>
                <RadioGroup
                  row
                  name="test-result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  {Object.values(TestResult).map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.replace("_", " ")}
                      disabled={isViewer}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <TextField
                label="비고"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={isViewer}
              />
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {/* 저장 버튼: Viewer는 비활성화 */}
        <Button
          ref={saveButtonRef}
          onClick={() => handleSaveAndNext()}
          variant="contained"
          color="primary"
          disabled={loading || isViewer || !testCase}
        >
          저장
        </Button>
      </DialogActions>
      <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(undefined)}>
        <Alert severity="error" onClose={() => setSaveError(undefined)}>
          {saveError}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

TestResultForm.propTypes = {
  open: PropTypes.bool.isRequired,
  testCaseId: PropTypes.string.isRequired,
  executionId: PropTypes.string.isRequired,
  currentResult: PropTypes.shape({
    result: PropTypes.oneOf(Object.values(TestResult)),
    notes: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNext: PropTypes.func,
};

export default TestResultForm;
