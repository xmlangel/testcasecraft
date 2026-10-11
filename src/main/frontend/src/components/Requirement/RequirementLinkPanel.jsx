// src/components/Requirement/RequirementLinkPanel.jsx
//
// 선택한 요구사항의 상세와 연결된 테스트케이스. 여기서 TC 를 더하고 뺀다.

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { LinkOff as LinkOffIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import MarkdownViewer from "../common/MarkdownViewer.jsx";
import {
  REQUIREMENT_STATUSES,
  REQUIREMENT_TYPES,
  findLabel,
} from "./requirementConstants.js";

const caseLabel = (tc) => `${tc.displayId ? `${tc.displayId} ` : ""}${tc.name}`;

function RequirementLinkPanel({
  requirement,
  testCases,
  canEdit,
  onAdd,
  onRemove,
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const linked = useMemo(
    () => new Set(requirement.linkedTestCaseIds || []),
    [requirement.linkedTestCaseIds],
  );
  const byId = useMemo(
    () => new Map(testCases.map((tc) => [tc.id, tc])),
    [testCases],
  );
  const candidates = useMemo(
    () => testCases.filter((tc) => !linked.has(tc.id)),
    [testCases, linked],
  );

  const handleAdd = async () => {
    setSaving(true);
    try {
      await onAdd(selected.map((tc) => tc.id));
      setSelected([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }} data-testid="requirement-detail">
      <Typography variant="subtitle2" color="text.secondary">
        {requirement.docId}
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {requirement.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Chip
          size="small"
          label={findLabel(REQUIREMENT_STATUSES, requirement.status, t)}
        />
        <Chip
          size="small"
          variant="outlined"
          label={findLabel(REQUIREMENT_TYPES, requirement.type, t)}
        />
      </Stack>
      {requirement.scope && (
        <Box sx={{ mb: 2 }}>
          <MarkdownViewer content={requirement.scope} />
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        {t("requirement.linkedCases", "연결된 테스트케이스")} ({linked.size}/
        {requirement.expectedCoverage})
      </Typography>
      {linked.size === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          {t("requirement.noLinkedCases", "연결된 테스트케이스가 없습니다.")}
        </Typography>
      ) : (
        <List dense>
          {[...linked].map((tcId) => {
            const tc = byId.get(tcId);
            return (
              <ListItem
                key={tcId}
                secondaryAction={
                  canEdit && (
                    <Tooltip title={t("requirement.unlink", "연결 해제")}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onRemove(tcId)}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }
              >
                <ListItemText primary={tc ? caseLabel(tc) : tcId} />
              </ListItem>
            );
          })}
        </List>
      )}

      {canEdit && (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Autocomplete
            multiple
            size="small"
            sx={{ flexGrow: 1 }}
            options={candidates}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            getOptionLabel={caseLabel}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t("requirement.searchCases", "테스트케이스 검색")}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={saving || selected.length === 0}
            data-testid="requirement-link-add"
          >
            {t("requirement.link", "연결")}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

RequirementLinkPanel.propTypes = {
  requirement: PropTypes.object.isRequired,
  testCases: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default RequirementLinkPanel;
