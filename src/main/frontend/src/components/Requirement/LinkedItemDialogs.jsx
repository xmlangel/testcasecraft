// src/components/Requirement/LinkedItemDialogs.jsx
//
// 연결된 상대를 그 자리에서 열어 보는 창 두 개.
//   LinkedTestCaseDialog: 요구사항 화면 → 연결 TC 의 실제 작성 내용(실행 화면과 같은 TestCaseDetails)
//   LinkedRequirementDialog: TC 화면 → 연결 요구사항의 내용

import React, { useEffect, useMemo, useState } from "react";
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
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
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
  VERDICT_META,
  findLabel,
} from "./requirementConstants.js";

const caseLabel = (tc, id) =>
  tc ? `${tc.displayId ? `${tc.displayId} ` : ""}${tc.name}` : id;

/**
 * 연결된 TC 를 차례로 검토하는 창. 왼쪽은 연결 목록(검색·결과), 오른쪽은 고른 TC 의 작성 내용이다.
 * 한 요구사항에 TC 가 여럿 붙어도 창을 닫지 않고 이전·다음으로 넘겨 본다.
 *
 * @param testCaseIds  연결된 TC ID 목록(표시 순서)
 * @param initialId    처음 고를 TC. null 이면 창을 닫는다
 * @param testCases    이름·표시 ID 를 찾을 TC 요약 목록
 * @param resultById   있으면 목록에 TC 별 결과 칩을 붙인다(리포트에서 연 경우)
 */
export function LinkedTestCaseDialog({
  testCaseIds,
  initialId,
  testCases = [],
  resultById = null,
  projectId,
  onClose,
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState(initialId);
  const [query, setQuery] = useState("");
  const [cache, setCache] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentId(initialId);
    setQuery("");
  }, [initialId]);

  useEffect(() => {
    if (!currentId || cache[currentId]) return undefined;
    let cancelled = false;
    setError(null);
    testCaseService
      .getTestCase(currentId)
      .then(
        (data) =>
          !cancelled && setCache((prev) => ({ ...prev, [currentId]: data })),
      )
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [currentId, cache]);

  const byId = useMemo(
    () => new Map(testCases.map((tc) => [tc.id, tc])),
    [testCases],
  );
  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return testCaseIds;
    return testCaseIds.filter((id) =>
      caseLabel(byId.get(id), id).toLowerCase().includes(q),
    );
  }, [testCaseIds, byId, query]);
  const index = testCaseIds.indexOf(currentId);
  const testCase = cache[currentId];

  return (
    <Dialog
      open={Boolean(initialId)}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      data-testid="linked-testcase-dialog"
    >
      <DialogTitle>
        {t("requirement.linkedCases", "연결된 테스트케이스")} ({index + 1}/
        {testCaseIds.length})
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: "flex", gap: 2, p: 0, minHeight: 480 }}
      >
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("requirement.searchCases", "테스트케이스 검색")}
              inputProps={{ "data-testid": "linked-testcase-search" }}
            />
          </Box>
          <List
            dense
            sx={{ overflowY: "auto", flexGrow: 1, maxHeight: "60vh" }}
          >
            {visibleIds.map((id) => {
              const meta = resultById
                ? VERDICT_META[resultById[id]] || VERDICT_META.NOT_RUN
                : null;
              return (
                <ListItemButton
                  key={id}
                  selected={id === currentId}
                  onClick={() => setCurrentId(id)}
                  data-testid="linked-testcase-item"
                >
                  <ListItemText
                    primary={caseLabel(byId.get(id), id)}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                  {meta && (
                    <Chip
                      size="small"
                      color={meta.color}
                      label={t(meta.i18nKey, meta.label)}
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              );
            })}
            {visibleIds.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ px: 2, py: 1 }}
              >
                {t("requirement.noMatch", "검색 결과가 없습니다.")}
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: 2,
            overflowY: "auto",
            maxHeight: "70vh",
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {!testCase && !error && <CircularProgress size={24} />}
          {testCase && <TestCaseDetails testCase={testCase} t={t} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={index <= 0}
          onClick={() => setCurrentId(testCaseIds[index - 1])}
          data-testid="linked-testcase-prev"
        >
          {t("requirement.prev", "이전")}
        </Button>
        <Button
          disabled={index < 0 || index >= testCaseIds.length - 1}
          onClick={() => setCurrentId(testCaseIds[index + 1])}
          data-testid="linked-testcase-next"
        >
          {t("requirement.next", "다음")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<OpenInNewIcon />}
          disabled={!testCase}
          onClick={() =>
            navigate(`/projects/${projectId}/testcases/${currentId}`)
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
  testCaseIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialId: PropTypes.string,
  testCases: PropTypes.array,
  resultById: PropTypes.object,
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
