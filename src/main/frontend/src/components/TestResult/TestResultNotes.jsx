import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import MDEditor from "@uiw/react-md-editor";
import { copyToClipboard } from "../../utils";
import TestResultFloatingMenu from "./TestResultFloatingMenu.jsx";

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

  // 에스케이프 키 또는 MDEditor의 전체화면 토글 감지를 위한 효과
  useEffect(() => {
    const handleFullscreenChange = () => {
      // MDEditor는 클래스 이름 변경으로 전체화면을 처리하므로 DOM 상태 확인
      const editorElement = document.querySelector(".w-md-editor-fullscreen");
      const newIsFullscreen = !!editorElement;

      if (newIsFullscreen !== isFullscreen) {
        setIsFullscreen(newIsFullscreen);
        if (onFullscreenChange) {
          onFullscreenChange(newIsFullscreen);
        }
      }
    };

    // DOM 변화가 생길 때마다 전체화면 여부 확인 (MDEditor가 DOM을 직접 조작할 수 있으므로 body 관찰)
    const observer = new MutationObserver(handleFullscreenChange);

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });

    // 초기 상태 확인
    handleFullscreenChange();

    return () => observer.disconnect();
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

  // 노트 복사 핸들러
  const handleCopyNotes = async () => {
    const success = await copyToClipboard(notes);
    if (success) {
      setCopySuccess(true);
    }
  };

  return (
    <Box sx={{ mt: 2, position: "relative" }}>
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
        </Box>
      </Box>

      <Box sx={{ mt: 1 }} data-color-mode={darkMode ? "dark" : "light"}>
        <MDEditor
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
          preview={previewMode}
          height={height}
          disabled={isViewer}
          textareaProps={{
            "data-testid": "result-notes-input",
          }}
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
