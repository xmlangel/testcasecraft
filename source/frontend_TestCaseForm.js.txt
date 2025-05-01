// src/components/TestCaseForm.js

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";
import { createTestStep } from "../models/testCase";

const TestCaseForm = ({ testCaseId, onSave }) => {
  const { testCases, updateTestCase, addTestCase } = useAppContext();
  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({});
  const [maxStepNumber, setMaxStepNumber] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (testCaseId) {
      const tc = testCases.find((tc) => String(tc.id) === String(testCaseId));
      if (tc) {
        setTestCase({ ...tc, steps: tc.steps || [] });
        setMaxStepNumber(
          tc.steps?.length > 0 ? Math.max(...tc.steps.map((step) => step.stepNumber)) : 0
        );
      }
    } else {
      setTestCase({
        name: "",
        description: "",
        steps: [],
        expectedResults: "",
        parentId: null,
        type: "testcase",
      });
      setMaxStepNumber(0);
    }
  }, [testCaseId, testCases]);

  if (!testCase || testCase.type !== "testcase") {
    return (
      <Card sx={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body1" color="text.secondary">
          테스트케이스를 선택하세요.
        </Typography>
      </Card>
    );
  }

  const handleChange = (field) => (event) => {
    setTestCase({ ...testCase, [field]: event.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleAddStep = () => {
    const newStepNumber = maxStepNumber + 1;
    setTestCase({
      ...testCase,
      steps: [...testCase.steps, createTestStep(newStepNumber, "", "")],
    });
    setMaxStepNumber(newStepNumber);
  };

  const handleDeleteStep = (stepNumber) => {
    const updatedSteps = testCase.steps.filter((step) => step.stepNumber !== stepNumber);
    setTestCase({ ...testCase, steps: updatedSteps });
    if (stepNumber === maxStepNumber) {
      setMaxStepNumber(updatedSteps.length > 0 ? Math.max(...updatedSteps.map((step) => step.stepNumber)) : 0);
    }
    setErrors((prev) => {
      const newSteps = { ...prev.steps };
      delete newSteps[stepNumber];
      return { ...prev, steps: newSteps };
    });
  };

  const handleStepChange = (stepNumber, field) => (event) => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map((step) =>
        step.stepNumber === stepNumber ? { ...step, [field]: event.target.value } : step
      ),
    });
    setErrors((prev) => ({
      ...prev,
      steps: { ...prev.steps, [stepNumber]: { ...prev.steps?.[stepNumber], [field]: "" } },
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", steps: {} };
    if (!testCase.name || !testCase.name.trim()) {
      newErrors.name = "이름을 입력하세요.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const isSaveDisabled = () => {
    if (!testCase.name || !testCase.name.trim()) return true;
    for (const step of testCase.steps) {
      if (!step.description || !step.description.trim()) return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const payload = {
      ...testCase,
      steps: testCase.steps.map((step) => ({
        stepNumber: step.stepNumber,
        description: step.description,
        expectedResult: step.expectedResult,
      })),
    };
    if (testCaseId) {
      await updateTestCase(payload);
    } else {
      await addTestCase(payload);
    }
    setIsSaving(false);
    setSnackbarOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onSave) onSave();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트케이스 {testCaseId ? "수정" : "생성"}
        </Typography>
        <TextField
          label="테스트케이스 ID"
          value={testCase?.id ? testCase.id : ""}
          fullWidth
          margin="normal"
          variant="outlined"
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="이름"
          value={testCase.name}
          onChange={handleChange("name")}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="설명"
          value={testCase.description}
          onChange={handleChange("description")}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          minRows={1}
          maxRows={3}
        />
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            테스트 단계
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="10%">No.</TableCell>
                  <TableCell width="45%">단계 설명</TableCell>
                  <TableCell width="35%">예상 결과</TableCell>
                  <TableCell width="10%" align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testCase.steps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        테스트 단계를 추가하세요.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  testCase.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => (
                      <TableRow key={step.stepNumber}>
                        <TableCell>{step.stepNumber}</TableCell>
                        <TableCell>
                          <TextField
                            value={step.description}
                            onChange={handleStepChange(step.stepNumber, "description")}
                            fullWidth
                            size="small"
                            placeholder="설명"
                            multiline
                            minRows={1}
                            maxRows={3}
                            sx={{
                              // 3줄 이상이면 배경 강조
                              bgcolor: step.description && step.description.split('\n').length > 2 ? '#fffde7' : undefined,
                              transition: 'background 0.2s'
                            }}
                            inputProps={{
                              style: { fontWeight: step.description && step.description.split('\n').length > 2 ? 'bold' : 'normal' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={step.expectedResult}
                            onChange={handleStepChange(step.stepNumber, "expectedResult")}
                            fullWidth
                            size="small"
                            placeholder="예상 결과"
                            multiline
                            minRows={1}
                            maxRows={3}
                            sx={{
                              bgcolor: step.expectedResult && step.expectedResult.split('\n').length > 2 ? '#fffde7' : undefined,
                              transition: 'background 0.2s'
                            }}
                            inputProps={{
                              style: { fontWeight: step.expectedResult && step.expectedResult.split('\n').length > 2 ? 'bold' : 'normal' }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteStep(step.stepNumber)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddStep}
            sx={{ mt: 1 }}
            size="small"
            variant="outlined"
          >
            단계 추가
          </Button>
        </Box>
        <TextField
          label="예상 결과 (전체)"
          value={testCase.expectedResults}
          onChange={handleChange("expectedResults")}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isSaveDisabled() || isSaving}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </CardActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          저장되었습니다.
        </Alert>
      </Snackbar>
    </Card>
  );
};

TestCaseForm.propTypes = {
  testCaseId: PropTypes.string,
  onSave: PropTypes.func,
};

export default TestCaseForm;
