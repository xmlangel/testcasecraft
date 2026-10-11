// src/components/Requirement/LinkedItemDialogs.jsx
//
// 연결된 상대를 그 자리에서 열어 보는 창 두 개.
//   LinkedTestCaseDialog: 요구사항 화면 → 연결 TC 의 실제 작성 내용(실행 화면과 같은 TestCaseDetails)
//   LinkedRequirementDialog: TC 화면 → 연결 요구사항의 내용

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../context/I18nContext.jsx";
import testCaseService from "../../services/testCaseService.js";
import TestCaseDetails from "../TestResult/TestCaseDetails.jsx";
import MarkdownViewer from "../common/MarkdownViewer.jsx";
import {
  REQUIREMENT_STATUSES,
  REQUIREMENT_TYPES,
  findLabel,
} from "./requirementConstants.js";

export function LinkedTestCaseDialog({ testCaseId, projectId, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testCaseId) return undefined;
    let cancelled = false;
    setTestCase(null);
    setError(null);
    testCaseService
      .getTestCase(testCaseId)
      .then((data) => !cancelled && setTestCase(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [testCaseId]);

  return (
    <Dialog
      open={Boolean(testCaseId)}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      data-testid="linked-testcase-dialog"
    >
      <DialogTitle>
        {t("requirement.linkedCases", "연결된 테스트케이스")}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        {!testCase && !error && <CircularProgress size={24} />}
        {testCase && <TestCaseDetails testCase={testCase} t={t} />}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<OpenInNewIcon />}
          disabled={!testCase}
          onClick={() =>
            navigate(`/projects/${projectId}/testcases/${testCaseId}`)
          }
          data-testid="linked-testcase-open"
        >
          {t("requirement.openTestCase", "테스트케이스 화면으로 이동")}
        </Button>
        <Button onClick={onClose}>{t("common.close", "닫기")}</Button>
      </DialogActions>
    </Dialog>
  );
}

LinkedTestCaseDialog.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export function LinkedRequirementDialog({ requirement, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Dialog
      open={Boolean(requirement)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      data-testid="linked-requirement-dialog"
    >
      {requirement && (
        <>
          <DialogTitle>
            <Typography variant="subtitle2" color="text.secondary">
              {requirement.docId}
            </Typography>
            {requirement.title}
          </DialogTitle>
          <DialogContent dividers>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                size="small"
                label={findLabel(REQUIREMENT_STATUSES, requirement.status, t)}
              />
              <Chip
                size="small"
                variant="outlined"
                label={findLabel(REQUIREMENT_TYPES, requirement.type, t)}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${t("requirement.field.linked", "연결 TC")} ${
                  (requirement.linkedTestCaseIds || []).length
                }/${requirement.expectedCoverage}`}
              />
            </Stack>
            {requirement.scope ? (
              <Box>
                <MarkdownViewer content={requirement.scope} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("requirement.noScope", "작성된 범위·설명이 없습니다.")}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={<OpenInNewIcon />}
              onClick={() =>
                navigate(
                  `/projects/${requirement.projectId}/requirements?requirementId=${requirement.id}`,
                )
              }
              data-testid="linked-requirement-open"
            >
              {t("requirement.openRequirement", "요구사항 화면으로 이동")}
            </Button>
            <Button onClick={onClose}>{t("common.close", "닫기")}</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

LinkedRequirementDialog.propTypes = {
  requirement: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
