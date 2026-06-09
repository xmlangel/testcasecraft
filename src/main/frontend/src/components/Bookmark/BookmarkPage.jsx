// src/components/Bookmark/BookmarkPage.jsx
// 내 북마크 (읽기 전용) 페이지.
// 좌측: 사용자의 북마크 모음 목록(CRUD). 우측: 선택 모음의 케이스 목록(읽기 전용).
// 케이스 편집/삭제 버튼은 노출하지 않는다(FR-4.4). 케이스 행 클릭 시 케이스 상세로 이동(열람).
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  RemoveCircleOutline as RemoveIcon,
} from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import * as bookmarkApi from "../../services/bookmarkApi.js";

const PRIORITY_COLOR = { HIGH: "error", MEDIUM: "warning", LOW: "default" };

export default function BookmarkPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { api, activeProject } = useAppContext();
  const { t } = useI18n();

  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 다이얼로그 상태
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create"); // create | rename
  const [editorName, setEditorName] = useState("");
  const [editorDesc, setEditorDesc] = useState("");
  const [editorTarget, setEditorTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // 메모 편집
  const [noteItemId, setNoteItemId] = useState(null);
  const [noteValue, setNoteValue] = useState("");

  const selected = collections.find((c) => c.id === selectedId) || null;

  const collectionLabel = useCallback(
    (c) => (c.isDefault ? t("bookmark.collection.default", "즐겨찾기") : c.name),
    [t],
  );

  const loadCollections = useCallback(async () => {
    if (!projectId || !api) return;
    try {
      setLoading(true);
      setError(null);
      const data = await bookmarkApi.listCollections(api, projectId);
      setCollections(data || []);
      setSelectedId((prev) => prev || (data && data[0] ? data[0].id : null));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, projectId]);

  const loadItems = useCallback(
    async (collectionId) => {
      if (!collectionId || !api) {
        setItems([]);
        return;
      }
      try {
        const data = await bookmarkApi.listItems(api, collectionId);
        setItems(data || []);
      } catch (e) {
        setError(e.message);
      }
    },
    [api],
  );

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    loadItems(selectedId);
  }, [selectedId, loadItems]);

  // ===== 모음 CRUD =====
  const openCreate = () => {
    setEditorMode("create");
    setEditorName("");
    setEditorDesc("");
    setEditorTarget(null);
    setEditorOpen(true);
  };
  const openRename = (c) => {
    setEditorMode("rename");
    setEditorName(c.name);
    setEditorDesc(c.description || "");
    setEditorTarget(c);
    setEditorOpen(true);
  };
  const submitEditor = async () => {
    try {
      setError(null);
      if (editorMode === "create") {
        const created = await bookmarkApi.createCollection(api, {
          projectId,
          name: editorName.trim(),
          description: editorDesc.trim() || null,
        });
        await loadCollections();
        if (created?.id) setSelectedId(created.id);
      } else {
        await bookmarkApi.updateCollection(api, editorTarget.id, {
          name: editorName.trim(),
          description: editorDesc.trim() || null,
        });
        await loadCollections();
      }
      setEditorOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };
  const confirmDelete = async () => {
    try {
      setError(null);
      await bookmarkApi.deleteCollection(api, deleteTarget.id);
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
      await loadCollections();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    }
  };

  // ===== 항목 =====
  const removeItem = async (itemId) => {
    try {
      await bookmarkApi.deleteItem(api, itemId);
      setItems((cur) => cur.filter((i) => i.id !== itemId));
      loadCollections(); // itemCount 갱신
    } catch (e) {
      setError(e.message);
    }
  };
  const openNote = (item) => {
    setNoteItemId(item.id);
    setNoteValue(item.note || "");
  };
  const saveNote = async (itemId) => {
    try {
      const updated = await bookmarkApi.updateItem(api, itemId, {
        note: noteValue,
      });
      setItems((cur) => cur.map((i) => (i.id === itemId ? updated : i)));
      setNoteItemId(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const openCase = (item) => {
    navigate(`/projects/${projectId}/testcases/${item.testCaseId}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            onClick={() => navigate(`/projects/${projectId}/testcases`)}
            title={t("bookmark.back", "뒤로")}
          >
            <ArrowBackIcon />
          </IconButton>
          <StarIcon sx={{ color: "warning.main", mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("bookmark.title", "내 북마크")}
            {activeProject?.name ? ` · ${activeProject.name}` : ""}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            "bookmark.readonly.hint",
            "북마크 화면은 읽기 전용입니다. 케이스 편집은 케이스 관리 화면에서 하세요.",
          )}
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            {/* 좌측: 모음 목록 */}
            <Paper variant="outlined" sx={{ width: 280, flexShrink: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {t("bookmark.nav", "북마크")}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={openCreate}
                  data-testid="bookmark-create-collection"
                >
                  {t("bookmark.collection.create", "모음 만들기")}
                </Button>
              </Box>
              <Divider />
              {collections.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2 }}
                >
                  {t("bookmark.empty.collections", "북마크 모음이 없습니다.")}
                </Typography>
              ) : (
                <List dense disablePadding>
                  {collections.map((c) => (
                    <ListItemButton
                      key={c.id}
                      selected={c.id === selectedId}
                      onClick={() => setSelectedId(c.id)}
                      data-testid={`bookmark-collection-${c.id}`}
                    >
                      <ListItemText
                        primary={collectionLabel(c)}
                        secondary={t(
                          "bookmark.itemCount",
                          "{count}개",
                        ).replace("{count}", c.itemCount)}
                      />
                      {!c.isDefault && (
                        <>
                          <Tooltip
                            title={t("bookmark.collection.rename", "이름 변경")}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRename(c);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={t("bookmark.collection.delete", "모음 삭제")}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(c);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Paper>

            {/* 우측: 선택 모음 항목(읽기 전용) */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {!selected ? null : items.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("bookmark.empty.items", "이 모음에 담긴 케이스가 없습니다.")}
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t("bookmark.column.name", "케이스명")}
                        </TableCell>
                        <TableCell sx={{ width: 110 }}>
                          {t("bookmark.column.priority", "우선순위")}
                        </TableCell>
                        <TableCell>{t("bookmark.column.note", "메모")}</TableCell>
                        <TableCell sx={{ width: 96 }} align="center">
                          {t("bookmark.column.actions", "동작")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          data-testid={`bookmark-item-${item.id}`}
                        >
                          <TableCell
                            sx={{ cursor: "pointer" }}
                            onClick={() => openCase(item)}
                          >
                            <Typography variant="body2">
                              {item.testCaseDisplayId
                                ? `[${item.testCaseDisplayId}] `
                                : ""}
                              {item.testCaseName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {item.testCasePriority && (
                              <Chip
                                label={item.testCasePriority}
                                size="small"
                                variant="outlined"
                                color={
                                  PRIORITY_COLOR[item.testCasePriority] ||
                                  "default"
                                }
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {noteItemId === item.id ? (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={noteValue}
                                  onChange={(e) => setNoteValue(e.target.value)}
                                  placeholder={t(
                                    "bookmark.item.notePlaceholder",
                                    "개인 메모를 입력하세요",
                                  )}
                                />
                                <Button
                                  size="small"
                                  onClick={() => saveNote(item.id)}
                                >
                                  {t("common.save", "저장")}
                                </Button>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ cursor: "pointer" }}
                                onClick={() => openNote(item)}
                                title={t("bookmark.item.note", "메모")}
                              >
                                {item.note || "—"}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip
                              title={t(
                                "bookmark.item.remove",
                                "모음에서 제거",
                              )}
                            >
                              <IconButton
                                size="small"
                                onClick={() => removeItem(item.id)}
                                data-testid={`bookmark-remove-${item.id}`}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        )}
      </Container>

      {/* 모음 생성/이름변경 다이얼로그 */}
      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          {editorMode === "create"
            ? t("bookmark.collection.create", "모음 만들기")
            : t("bookmark.collection.rename", "이름 변경")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t("bookmark.collection.name", "모음 이름")}
            value={editorName}
            onChange={(e) => setEditorName(e.target.value)}
            data-testid="bookmark-collection-name-input"
          />
          <TextField
            margin="dense"
            fullWidth
            label={t("bookmark.collection.description", "설명")}
            value={editorDesc}
            onChange={(e) => setEditorDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>
            {t("common.cancel", "취소")}
          </Button>
          <Button
            variant="contained"
            disabled={!editorName.trim()}
            onClick={submitEditor}
            data-testid="bookmark-collection-submit"
          >
            {t("common.save", "저장")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 모음 삭제 확인 */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>{t("bookmark.collection.delete", "모음 삭제")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "bookmark.collection.deleteConfirm",
              "이 북마크 모음을 삭제하시겠습니까? 담긴 항목도 함께 삭제됩니다.",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>
            {t("common.cancel", "취소")}
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            {t("common.delete", "삭제")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
