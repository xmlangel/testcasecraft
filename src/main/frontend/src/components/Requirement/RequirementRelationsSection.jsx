// src/components/Requirement/RequirementRelationsSection.jsx
//
// 요구사항 상세 패널의 「관계」 영역. 서버는 source → target 한 방향으로 저장하고,
// 화면은 지금 보고 있는 요구사항 입장에서 읽는다(상위·하위와 의존은 방향에 따라 이름이 바뀐다).

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { LinkOff as LinkOffIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import requirementService from "../../services/requirementService.js";

/** 보이는 이름. key = 저장 종류 + 이 요구사항이 source 인지(OUTGOING) target 인지(INCOMING) */
const RELATION_LABELS = {
  "PARENT_OF:OUTGOING": {
    i18nKey: "requirement.relation.child",
    label: "하위 요구사항",
  },
  "PARENT_OF:INCOMING": {
    i18nKey: "requirement.relation.parent",
    label: "상위 요구사항",
  },
  "DEPENDS_ON:OUTGOING": {
    i18nKey: "requirement.relation.dependsOn",
    label: "의존 대상",
  },
  "DEPENDS_ON:INCOMING": {
    i18nKey: "requirement.relation.dependedBy",
    label: "이 요구사항에 의존",
  },
  "RELATED_TO:OUTGOING": {
    i18nKey: "requirement.relation.related",
    label: "관련",
  },
  "RELATED_TO:INCOMING": {
    i18nKey: "requirement.relation.related",
    label: "관련",
  },
};

/** 추가 칸의 선택지. reverse 면 상대가 source 가 되도록 방향을 뒤집어 저장한다. */
const ADD_OPTIONS = [
  {
    value: "CHILD",
    type: "PARENT_OF",
    reverse: false,
    key: "PARENT_OF:OUTGOING",
  },
  {
    value: "PARENT",
    type: "PARENT_OF",
    reverse: true,
    key: "PARENT_OF:INCOMING",
  },
  {
    value: "DEPENDS_ON",
    type: "DEPENDS_ON",
    reverse: false,
    key: "DEPENDS_ON:OUTGOING",
  },
  {
    value: "DEPENDED_BY",
    type: "DEPENDS_ON",
    reverse: true,
    key: "DEPENDS_ON:INCOMING",
  },
  {
    value: "RELATED",
    type: "RELATED_TO",
    reverse: false,
    key: "RELATED_TO:OUTGOING",
  },
];

function RequirementRelationsSection({
  requirement,
  requirements,
  canEdit,
  onSelectRequirement,
}) {
  const { t } = useI18n();
  const [relations, setRelations] = useState([]);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState("RELATED");
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const labelOf = (key) =>
    t(RELATION_LABELS[key].i18nKey, RELATION_LABELS[key].label);

  const load = () =>
    requirementService
      .getRelations(requirement.id)
      .then((data) => {
        setRelations(data);
        setError(null);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    let cancelled = false;
    setRelations([]);
    requirementService
      .getRelations(requirement.id)
      .then((data) => !cancelled && setRelations(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [requirement.id]);

  const candidates = useMemo(
    () => requirements.filter((r) => r.id !== requirement.id),
    [requirements, requirement.id],
  );

  const handleAdd = async () => {
    const option = ADD_OPTIONS.find((o) => o.value === kind);
    setSaving(true);
    try {
      if (option.reverse) {
        await requirementService.addRelation(
          target.id,
          requirement.id,
          option.type,
        );
      } else {
        await requirementService.addRelation(
          requirement.id,
          target.id,
          option.type,
        );
      }
      setTarget(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (relationId) => {
    try {
      await requirementService.deleteRelation(relationId);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ mt: 2 }} data-testid="requirement-relations">
      <Typography variant="subtitle2">
        {t("requirement.relation.title", "관계")} ({relations.length})
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ my: 1 }}>
          {error}
        </Alert>
      )}
      {relations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          {t(
            "requirement.relation.none",
            "다른 요구사항과 맺은 관계가 없습니다.",
          )}
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 240, overflowY: "auto" }}>
          {relations.map((rel) => (
            <ListItem
              key={rel.id}
              disablePadding
              secondaryAction={
                canEdit && (
                  <Tooltip
                    title={t("requirement.relation.remove", "관계 해제")}
                  >
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemove(rel.id)}
                    >
                      <LinkOffIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <ListItemButton
                onClick={() => onSelectRequirement(rel.otherId)}
                data-testid="requirement-relation-item"
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={labelOf(`${rel.type}:${rel.direction}`)}
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={`${rel.otherDocId} · ${rel.otherTitle}`}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {canEdit && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            inputProps={{ "data-testid": "requirement-relation-kind" }}
          >
            {ADD_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {labelOf(o.key)}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            size="small"
            sx={{ flex: "1 1 0", minWidth: 0 }}
            options={candidates}
            value={target}
            onChange={(_, value) => setTarget(value)}
            getOptionLabel={(r) => `${r.docId} · ${r.title}`}
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
          <Button
            variant="contained"
            disabled={!target || saving}
            onClick={handleAdd}
            data-testid="requirement-relation-add"
          >
            {t("requirement.link", "연결")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

RequirementRelationsSection.propTypes = {
  requirement: PropTypes.object.isRequired,
  requirements: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onSelectRequirement: PropTypes.func.isRequired,
};

export default RequirementRelationsSection;
