// src/components/Requirement/TestCaseRequirementLinks.jsx
//
// 테스트케이스 편집 화면의 요구사항 연결 칸. 고르는 즉시 서버에 저장한다
// (PUT /api/requirements/by-test-case/{id} 가 연결 목록을 통째로 맞춘다).

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import requirementService from "../../services/requirementService.js";
import { LinkedRequirementDialog } from "./LinkedItemDialogs.jsx";
import { REQUIREMENT_STATUSES, findLabel } from "./requirementConstants.js";

const label = (req) => `${req.docId} · ${req.title}`;

function TestCaseRequirementLinks({ testCaseId, projectId, readOnly = false }) {
  const { t } = useI18n();
  const [options, setOptions] = useState([]);
  const [linked, setLinked] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [openRequirement, setOpenRequirement] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      requirementService.getRequirements(projectId),
      requirementService.getRequirementsForTestCase(testCaseId),
    ])
      .then(([all, mine]) => {
        if (cancelled) return;
        setOptions(all);
        setLinked(mine);
        setError(null);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [testCaseId, projectId]);

  const handleChange = async (_, value) => {
    const previous = linked;
    setLinked(value);
    setSaving(true);
    try {
      setLinked(
        await requirementService.replaceRequirementsForTestCase(
          testCaseId,
          value.map((req) => req.id),
        ),
      );
      setError(null);
    } catch (e) {
      setLinked(previous);
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // 요구사항이 하나도 없는 프로젝트에는 칸을 내보이지 않는다
  if (options.length === 0 && linked.length === 0 && !error) return null;

  return (
    // TC 편집 화면의 다른 섹션(단계·기대 결과)과 같은 접이식 카드로 그린다
    <Accordion
      defaultExpanded
      sx={{ mt: 2 }}
      data-testid="testcase-requirement-links"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">
          {t("requirement.testCase.title", "연결된 요구사항")} ({linked.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        {linked.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("requirement.testCase.none", "연결된 요구사항이 없습니다.")}
          </Typography>
        ) : (
          <List
            dense
            disablePadding
            sx={{ mb: 1, maxHeight: 280, overflowY: "auto" }}
          >
            {linked.map((req) => (
              <ListItemButton
                key={req.id}
                onClick={() => setOpenRequirement(req)}
                data-testid="testcase-linked-requirement"
                sx={{ borderRadius: 1 }}
              >
                <ListItemText
                  primary={label(req)}
                  secondary={t(
                    "requirement.clickToView",
                    "눌러서 작성 내용 보기",
                  )}
                />
                <Chip
                  size="small"
                  label={findLabel(REQUIREMENT_STATUSES, req.status, t)}
                />
              </ListItemButton>
            ))}
          </List>
        )}
        {!readOnly && (
          <Autocomplete
            multiple
            size="small"
            options={options}
            value={linked}
            disabled={saving}
            onChange={handleChange}
            getOptionLabel={label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t(
                  "requirement.testCase.placeholder",
                  "요구사항 검색",
                )}
              />
            )}
          />
        )}
        <LinkedRequirementDialog
          requirement={openRequirement}
          onClose={() => setOpenRequirement(null)}
        />
      </AccordionDetails>
    </Accordion>
  );
}

TestCaseRequirementLinks.propTypes = {
  testCaseId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default TestCaseRequirementLinks;
