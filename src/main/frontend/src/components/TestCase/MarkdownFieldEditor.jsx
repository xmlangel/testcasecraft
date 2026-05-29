// src/components/TestCase/MarkdownFieldEditor.jsx

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { computeMarkdownEditorHeight } from "../../utils/markdownEditorHeight.js";

/**
 * 텍스트/마크다운 모드를 지원하는 필드 에디터 컴포넌트
 */
const MarkdownFieldEditor = ({
  label,
  value,
  placeholder,
  height,
  maxLines = 10,
  isViewer = false,
  error = false,
  helperText,
  theme,
  t,
  onChange,
  onPaste,
  defaultMarkdownMode = true,
  testid,
  preview,
}) => {
  const displayHelperText =
    helperText ||
    (!value
      ? t("testcase.helper.enterContent", "내용을 입력하세요.")
      : t(
          "testcase.helper.markdownSupported",
          "Markdown 문법을 사용할 수 있습니다.",
        ));

  // 내용이 없으면 최소 높이, 있으면 maxLines(기본 10줄)까지 자동 확장 후 스크롤.
  // height 를 넘기면 그 값을 최소 높이(floor)로 사용한다(기존 호출부 호환).
  const floor =
    typeof height === "number" ? height : parseInt(height, 10) || 0;
  const dynamicHeight = Math.max(
    floor,
    computeMarkdownEditorHeight(value, { maxLines }),
  );

  return (
    <Box sx={{ mt: label ? 2 : 0 }}>
      {label && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" color={error ? "error" : "inherit"}>
            {label}
          </Typography>
        </Box>
      )}
      <Box
        data-color-mode={theme.palette.mode}
        sx={{
          mt: 1,
          "& .w-md-editor": {
            border: error ? `1px solid ${theme.palette.error.main}` : undefined,
          },
        }}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          preview={preview || "live"}
          height={dynamicHeight}
          visibleDragbar
          textareaProps={{
            placeholder,
            onPaste,
            "data-testid": testid,
          }}
          disabled={isViewer}
        />
      </Box>
      {displayHelperText && (
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
          sx={{ mt: 0.5, display: "block" }}
        >
          {displayHelperText}
        </Typography>
      )}
    </Box>
  );
};

MarkdownFieldEditor.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxLines: PropTypes.number,
  isViewer: PropTypes.bool,
  helperText: PropTypes.string,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onPaste: PropTypes.func,
  preview: PropTypes.oneOf(["live", "edit", "preview"]),
};

export default MarkdownFieldEditor;
