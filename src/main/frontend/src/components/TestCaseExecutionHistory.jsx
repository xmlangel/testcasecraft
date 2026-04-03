// src/main/frontend/src/components/TestCaseExecutionHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";
import { useI18n } from "../context/I18nContext";
import { useAppContext } from "../context/AppContext";
import { formatDateSafe } from "../utils/dateUtils";

const TestCaseExecutionHistory = ({ testCaseId }) => {
  const { api, activeProject } = useAppContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!testCaseId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api(
          `/api/test-executions/by-testcase/${testCaseId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch execution history");
        }

        const data = await response.json();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching execution history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [testCaseId]);

  const getResultChip = (result) => {
    const status = result?.toLowerCase() || "none";
    let color = "default";

    switch (status) {
      case "pass":
      case "passed":
        color = "success";
        break;
      case "fail":
      case "failed":
        color = "error";
        break;
      case "block":
      case "blocked":
        color = "warning";
        break;
      case "skip":
      case "skipped":
        color = "info";
        break;
      default:
        color = "default";
    }

    return (
      <Chip
        label={result || "N/A"}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("testcase.execution.noData", "실행 이력이 없습니다.")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: "transparent",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("testcase.execution.column.date", "실행일시")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("testcase.execution.column.executionName", "테스트 실행")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("testcase.execution.column.result", "결과")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("testcase.execution.column.executor", "실행자")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t("testcase.execution.column.notes", "노트")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item) => (
              <TableRow
                key={item.id}
                hover
                onClick={() => {
                  if (activeProject?.id && item.testExecutionId) {
                    navigate(
                      `/projects/${activeProject.id}/executions/${item.testExecutionId}/testcases/${testCaseId}/result`,
                    );
                  }
                }}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>{formatDateSafe(item.executedAt) || "-"}</TableCell>
                <TableCell>{item.testExecutionName || "N/A"}</TableCell>
                <TableCell>
                  {getResultChip(item.result || item.status)}
                </TableCell>
                <TableCell>{item.executedBy || "N/A"}</TableCell>
                <TableCell>{item.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TestCaseExecutionHistory;
