// src/components/Requirement/TestCaseRequirementLinks.jsx
//
// 테스트케이스 편집 화면의 요구사항 연결 칸. 고르는 즉시 서버에 저장한다
// (PUT /api/requirements/by-test-case/{id} 가 연결 목록을 통째로 맞춘다).

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
import requirementService from "../../services/requirementService.js";

const label = (req) => `${req.docId} · ${req.title}`;

function TestCaseRequirementLinks({ testCaseId, projectId, readOnly = false }) {
  const { t } = useI18n();
  const [options, setOptions] = useState([]);
  const [linked, setLinked] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
    <Box sx={{ mt: 2 }} data-testid="testcase-requirement-links">
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("requirement.testCase.title", "연결된 요구사항")}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {readOnly ? (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {linked.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("requirement.testCase.none", "연결된 요구사항이 없습니다.")}
            </Typography>
          ) : (
            linked.map((req) => (
              <Chip key={req.id} size="small" label={label(req)} />
            ))
          )}
        </Box>
      ) : (
        <Autocomplete
          multiple
          size="small"
          options={options}
          value={linked}
          disabled={saving}
          onChange={handleChange}
          getOptionLabel={label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
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
    </Box>
  );
}

TestCaseRequirementLinks.propTypes = {
  testCaseId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default TestCaseRequirementLinks;
