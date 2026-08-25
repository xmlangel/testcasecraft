import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import RichMarkdownEditor from "../TestCase/RichMarkdownEditor.jsx";
import { copyToClipboard } from "../../utils";
import TestResultFloatingMenu from "./TestResultFloatingMenu.jsx";
import { resolveNotesMaxLines } from "./notesView.js";

const TestResultNotes = ({
  notes,
  setNotes,
  isViewer,
  t,
  darkMode,
  height = 300,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
  onFullscreenChange, // 추가된 콜백
  // 플로팅 메뉴를 위한 추가 prop들
  result,
  onResultChange,
  onSave,
  onClose,
  loading,
  shouldShowJiraButton,
  handleOpenJiraDialog,
  testCase,
  saveButtonRef,
  onMarkdownPaste,
  inlineImageUploading,
}) => {
  // 에디터가 색을 맞추는 데 쓴다. 이 컴포넌트는 darkMode 플래그만 받으므로
  // 테마 객체는 컨텍스트에서 직접 가져온다.
  const theme = useTheme();

  // localStorage key
  const STORAGE_KEY = "notes-editor-preview-mode";

  // 에디터 모드 상태 (edit, live, preview)
  const [previewMode, setPreviewMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    // 초기값이 없을 경우: 내용이 있으면 preview, 없으면 live
    return notes && notes.length > 0 ? "preview" : "live";
  });

  // 전체화면 상태 감지
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 복사 성공 메시지 상태
  const [copySuccess, setCopySuccess] = useState(false);

  // 전체화면 토글.
  //
  // 예전에는 MDEditor 가 전체화면 버튼을 제공했고, 이 컴포넌트는 그것이 body 에 붙이는
  // .w-md-editor-fullscreen 클래스를 MutationObserver 로 지켜보며 상태를 따라갔다.
  // Tiptap 에는 그 기능이 없어 상태를 직접 들고 버튼으로 토글한다. 부모(onFullscreenChange)
  // 는 이 값으로 주변 UI 를 접으므로 계약은 그대로 유지한다.
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (onFullscreenChange) onFullscreenChange(next);
      return next;
    });
  }, [onFullscreenChange]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsFullscreen(false);
      if (onFullscreenChange) onFullscreenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onFullscreenChange]);

  // 디버그 모드일 때 노트 내 첨부파일 URL 로그 출력
  useEffect(() => {
    const isDebug = localStorage.getItem("debug") === "true";
    if (!isDebug || !notes) return;

    if (notes.includes("/api/testcase-attachments/public/")) {
      console.log("[DEBUG] Found public attachment URL in notes:", notes);
      const matches = notes.match(
        /\/api\/testcase-attachments\/public\/[^)"\s]+/g,
      );
      if (matches) {
        console.log("[DEBUG] Extracted URLs from notes:", matches);
      }
    }
  }, [notes]);

  // 모드 변경 핸들러
  const handleModeChange = (mode) => {
    if (!mode) return;
    setPreviewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  // 보기 전용인가.
  //
  // previewMode 가 "preview" 면 내용을 읽기만 한다. 내용이 있는 비고를 열면 이 모드로
  // 시작하므로(저장한 뒤 다시 들어온 경우가 그렇다) 편집으로 되돌아가는 길이 필요하다.
  // 예전에는 MDEditor 가 자체 모드 전환 버튼을 달아 줘서 그 길이 있었는데, Tiptap 에는
  // 모드가 없어 사라졌다. 그래서 아래 수정·보기 토글을 직접 둔다.
  const readOnlyByMode = previewMode === "preview";
  const toggleReadOnly = () =>
    handleModeChange(readOnlyByMode ? "live" : "preview");

  // 미리보기 모드에서 노트에 값이 있으면 테스트 스텝처럼 내용 전체를 스크롤 없이 표시한다.
  const notesMaxLines = resolveNotesMaxLines({
    previewMode,
    isFullscreen,
    notes,
  });

  // 노트 복사 핸들러
  const handleCopyNotes = async () => {
    const success = await copyToClipboard(notes);
    if (success) {
      setCopySuccess(true);
    }
  };

  return (
    <Box sx={{ mt: 1, position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" color="text.primary">
            {t("testResult.form.notes", "비고")}
          </Typography>
          {notes && (
            <Tooltip title={t("testcase.notes.copy", "노트 복사")}>
              <IconButton
                size="small"
                onClick={handleCopyNotes}
                sx={{
                  ml: 0.5,
                  padding: "2px",
                  color: "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <CopyIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="caption"
            color={notes.length >= 9500 ? "error" : "text.secondary"}
            sx={{ fontWeight: 500 }}
          >
            {notes.length}/10,000
          </Typography>
          {!isViewer && (
            <Tooltip
              title={
                readOnlyByMode
                  ? t("testcase.notes.edit", "비고 수정")
                  : t("testcase.notes.viewOnly", "보기 모드")
              }
            >
              <IconButton
                size="small"
                onClick={toggleReadOnly}
                sx={{
                  padding: "2px",
                  color: readOnlyByMode ? "primary.main" : "text.secondary",
                }}
                data-testid="result-notes-edit-toggle"
              >
                {readOnlyByMode ? (
                  <EditIcon sx={{ fontSize: "1.1rem" }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: "1.1rem" }} />
                )}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title={
              isFullscreen
                ? t("testcase.notes.exitFullscreen", "전체화면 나가기")
                : t("testcase.notes.fullscreen", "전체화면")
            }
          >
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{ padding: "2px", color: "text.secondary" }}
              data-testid="result-notes-fullscreen"
            >
              {isFullscreen ? (
                <FullscreenExitIcon sx={{ fontSize: "1.1rem" }} />
              ) : (
                <FullscreenIcon sx={{ fontSize: "1.1rem" }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={
          isFullscreen
            ? {
                position: "fixed",
                inset: 0,
                zIndex: (muiTheme) => muiTheme.zIndex.modal,
                backgroundColor: "background.default",
                p: 2,
                overflowY: "auto",
              }
            : { mt: 1 }
        }
      >
        {/*
          전체화면은 화면 전체를 덮는 고정 레이어라 위쪽 헤더(복사·수정·전체화면 버튼)가
          가려진다. Escape 로 나갈 수 있지만 눈에 보이는 길이 없으면 갇힌 것처럼 느껴진다.
          그래서 이 레이어 안에 나가기 버튼을 따로 둔다.
        */}
        {isFullscreen && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 1.5,
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" color="text.primary">
                {t("testResult.form.notes", "비고")}
              </Typography>
              <Typography
                variant="caption"
                color={notes.length >= 9500 ? "error" : "text.secondary"}
              >
                {notes.length}/10,000
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FullscreenExitIcon />}
              onClick={toggleFullscreen}
              data-testid="result-notes-fullscreen-exit"
            >
              {t("testcase.notes.exitFullscreen", "전체화면 나가기")}
              <Typography
                variant="caption"
                component="span"
                sx={{ ml: 0.75, opacity: 0.7 }}
              >
                Esc
              </Typography>
            </Button>
          </Box>
        )}

        <RichMarkdownEditor
          value={notes}
          onChange={(value) => {
            if (
              value !== undefined &&
              value !== null &&
              value.length <= 10000
            ) {
              setNotes(value);
            } else if (value === undefined || value === null || value === "") {
              setNotes("");
            }
          }}
          onPaste={onMarkdownPaste}
          isViewer={isViewer || readOnlyByMode}
          height={isFullscreen ? window.innerHeight - 220 : height}
          maxLines={notesMaxLines}
          theme={theme}
          t={t}
          hideHelperText
          testid="result-notes-input"
        />

        {inlineImageUploading && (
          <Box sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ py: 0 }}>
              {t(
                "testcase.inlineImage.uploadingProgress",
                "이미지 업로드 중...",
              )}
            </Alert>
          </Box>
        )}

        {/* 전체화면 모드일 때 메인 플로팅 메뉴 노출 (zIndex 문제 해결을 위해 내부에서 렌더링) */}
        {isFullscreen && (
          <TestResultFloatingMenu
            result={result}
            onResultChange={onResultChange}
            onPrevious={onPrevious}
            onNext={onNext}
            onSave={onSave}
            onClose={onClose}
            currentIndex={currentIndex}
            totalCount={totalCount}
            isViewer={isViewer}
            loading={loading}
            shouldShowJiraButton={shouldShowJiraButton}
            handleOpenJiraDialog={handleOpenJiraDialog}
            testCase={testCase}
            saveButtonRef={saveButtonRef}
            t={t}
            isNotesFullscreen={true}
          />
        )}

        {notes.length >= 9500 && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {notes.length >= 10000
              ? t("testResult.form.notesLimitError")
              : t("testResult.form.notesLimitWarning", {
                  remaining: 10000 - notes.length,
                })}
          </Typography>
        )}
      </Box>

      {/* 복사 성공 알림 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t(
            "testcase.notes.copy_message",
            "노트가 클립보드에 복사되었습니다.",
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestResultNotes;
