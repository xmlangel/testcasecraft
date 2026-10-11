// src/components/Requirement/RequirementListView.jsx
//
// 왼쪽: 요구사항 문서 트리 / 가운데: 선택한 문서(하위 포함)의 요구사항 표 /
// 오른쪽: 선택한 요구사항 상세와 TC 연결.

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import RequirementLinkPanel from "./RequirementLinkPanel.jsx";
import MarkdownViewer from "../common/MarkdownViewer.jsx";
import { getAllChildIds } from "../../utils/treeUtils.jsx";
import {
  COVERAGE_META,
  REQUIREMENT_STATUSES,
  findLabel,
  flattenSpecTree,
} from "./requirementConstants.js";

function RequirementListView({
  specs,
  requirements,
  testCases,
  canEdit,
  onAddSpec,
  onEditSpec,
  onDeleteSpec,
  onAddRequirement,
  onEditRequirement,
  onDeleteRequirement,
  onAddLinks,
  onRemoveLink,
}) {
  const { t } = useI18n();
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);

  const tree = useMemo(() => flattenSpecTree(specs), [specs]);
  const specById = useMemo(() => new Map(specs.map((s) => [s.id, s])), [specs]);
  const visible = useMemo(() => {
    if (!selectedSpecId) return requirements;
    const ids = new Set([
      selectedSpecId,
      ...getAllChildIds(specs, selectedSpecId),
    ]);
    return requirements.filter((req) => ids.has(req.specId));
  }, [requirements, specs, selectedSpecId]);
  const selectedReq = requirements.find((req) => req.id === selectedReqId);
  const selectedSpec = selectedSpecId ? specById.get(selectedSpecId) : null;

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Paper
        variant="outlined"
        sx={{ width: 260, flexShrink: 0 }}
        data-testid="requirement-spec-tree"
      >
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {t("requirement.spec.title", "요구사항 문서")}
          </Typography>
          {canEdit && (
            <Tooltip title={t("requirement.spec.add", "요구사항 문서 추가")}>
              <IconButton
                size="small"
                onClick={() => onAddSpec(selectedSpecId)}
                data-testid="spec-add"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <List dense disablePadding>
          <ListItemButton
            selected={!selectedSpecId}
            onClick={() => setSelectedSpecId(null)}
          >
            <ListItemText
              primary={t("requirement.spec.all", "전체")}
              secondary={requirements.length}
            />
          </ListItemButton>
          {tree.map(({ spec, depth }) => (
            <ListItemButton
              key={spec.id}
              selected={spec.id === selectedSpecId}
              onClick={() => setSelectedSpecId(spec.id)}
              sx={{ pl: 2 + depth * 2 }}
            >
              <ListItemText
                primary={spec.title}
                secondary={spec.docId}
                primaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          ))}
        </List>
        {tree.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
            {t("requirement.spec.empty", "요구사항 문서를 먼저 추가하세요.")}
          </Typography>
        )}
      </Paper>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }} noWrap>
            {selectedSpec
              ? `${selectedSpec.docId} · ${selectedSpec.title}`
              : t("requirement.spec.all", "전체")}
          </Typography>
          {canEdit && selectedSpec && (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEditSpec(selectedSpec)}
              >
                {t("common.edit", "수정")}
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={async () => {
                  if (await onDeleteSpec(selectedSpec)) setSelectedSpecId(null);
                }}
              >
                {t("common.delete", "삭제")}
              </Button>
            </>
          )}
          {canEdit && specs.length > 0 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddRequirement(selectedSpecId)}
              data-testid="requirement-add"
            >
              {t("requirement.add", "요구사항 추가")}
            </Button>
          )}
        </Stack>
        {selectedSpec?.scope && (
          <Box sx={{ mb: 1 }}>
            <MarkdownViewer content={selectedSpec.scope} />
          </Box>
        )}
        <Paper variant="outlined">
          <Table size="small" data-testid="requirement-table">
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("requirement.field.docId", "요구사항 ID")}
                </TableCell>
                <TableCell>{t("requirement.field.title", "제목")}</TableCell>
                <TableCell>{t("requirement.field.status", "상태")}</TableCell>
                <TableCell align="center">
                  {t("requirement.field.linked", "연결 TC")}
                </TableCell>
                <TableCell>
                  {t("requirement.field.coverage", "커버리지")}
                </TableCell>
                {canEdit && <TableCell align="right" />}
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((req) => {
                const coverage =
                  COVERAGE_META[req.coverage] || COVERAGE_META.UNCOVERED;
                return (
                  <TableRow
                    key={req.id}
                    hover
                    selected={req.id === selectedReqId}
                    onClick={() => setSelectedReqId(req.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {req.docId}
                    </TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>
                      {findLabel(REQUIREMENT_STATUSES, req.status, t)}
                    </TableCell>
                    <TableCell align="center">
                      {(req.linkedTestCaseIds || []).length}/
                      {req.expectedCoverage}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={coverage.color}
                        label={t(coverage.i18nKey, coverage.label)}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRequirement(req);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              (await onDeleteRequirement(req)) &&
                              req.id === selectedReqId
                            ) {
                              setSelectedReqId(null);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5}>
                    <Typography variant="body2" color="text.secondary">
                      {t("requirement.empty", "요구사항이 없습니다.")}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {selectedReq && (
        <Box sx={{ width: 380, flexShrink: 0 }}>
          <RequirementLinkPanel
            requirement={selectedReq}
            testCases={testCases}
            canEdit={canEdit}
            onAdd={(ids) => onAddLinks(selectedReq.id, ids)}
            onRemove={(tcId) => onRemoveLink(selectedReq.id, tcId)}
          />
        </Box>
      )}
    </Box>
  );
}

RequirementListView.propTypes = {
  specs: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  testCases: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onAddSpec: PropTypes.func.isRequired,
  onEditSpec: PropTypes.func.isRequired,
  onDeleteSpec: PropTypes.func.isRequired,
  onAddRequirement: PropTypes.func.isRequired,
  onEditRequirement: PropTypes.func.isRequired,
  onDeleteRequirement: PropTypes.func.isRequired,
  onAddLinks: PropTypes.func.isRequired,
  onRemoveLink: PropTypes.func.isRequired,
};

export default RequirementListView;
