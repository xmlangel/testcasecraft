// src/components/TestCase/RichMarkdownFieldEditor.jsx

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import CodeIcon from "@mui/icons-material/Code";
import TitleIcon from "@mui/icons-material/Title";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ChecklistIcon from "@mui/icons-material/Checklist";
import TableChartIcon from "@mui/icons-material/TableChart";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { computeMarkdownEditorHeight } from "../../utils/markdownEditorHeight.js";

/**
 * Tiptap 기반 리치 마크다운 필드 에디터.
 *
 * MarkdownFieldEditor(@uiw/react-md-editor) 와 같은 props 를 받아 자리를 바꿔 끼울 수
 * 있게 만들었다. 차이는 편집 방식이다 — 좌우 분할 미리보기 대신 서식이 본문에 그대로
 * 그려지는 방식이고, 저장 값은 그대로 마크다운이다.
 *
 * 이미지 붙여넣기 동작이 기존 컴포넌트와 다르다. useInlineImagePaste 의
 * handleMarkdownPaste 가 textarea 의 selectionStart/selectionEnd 로 삽입 위치를
 * 잡는데 Tiptap 은 textarea 가 아니라 그 값이 없다. 그래서 자리표시자가 커서 위치가
 * 아니라 본문 끝에 붙는다. 값이 깨지지는 않지만 위치는 어긋난다.
 */
const RichMarkdownFieldEditor = ({
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
  testid,
}) => {
  // 에디터가 스스로 내보낸 마지막 마크다운. 외부 value 가 이 값과 같으면
  // 다시 밀어 넣지 않는다. 넣으면 타이핑마다 커서가 문서 앞으로 튄다.
  const lastEmittedRef = useRef(value || "");

  const extensions = useMemo(
    () => [
      StarterKit.configure({ link: false }),
      Markdown,
      Placeholder.configure({ placeholder: placeholder || "" }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    contentType: "markdown",
    editable: !isViewer,
    onUpdate: ({ editor: instance }) => {
      const markdown = instance.getMarkdown();
      lastEmittedRef.current = markdown;
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        "data-testid": testid || "rich-markdown-editor",
        class: "rich-markdown-surface",
      },
      handlePaste: (view, event) => {
        // 이미지 붙여넣기는 기존 훅에 그대로 넘긴다. 처리하지 않은 붙여넣기는
        // false 를 돌려 Tiptap 기본 동작(텍스트·HTML 변환)에 맡긴다.
        const items = Array.from(event.clipboardData?.items || []);
        const hasImage = items.some(
          (item) => item.kind === "file" && item.type?.startsWith("image/"),
        );
        if (hasImage && onPaste) {
          onPaste(event);
          return true;
        }
        return false;
      },
    },
  });

  // 외부에서 값이 바뀐 경우(폼 초기화, 이미지 업로드 완료 치환 등) 동기화한다.
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming === lastEmittedRef.current) return;
    lastEmittedRef.current = incoming;
    editor.commands.setContent(incoming, { contentType: "markdown" });
  }, [editor, value]);

  useEffect(() => {
    if (editor) editor.setEditable(!isViewer);
  }, [editor, isViewer]);

  const displayHelperText =
    helperText ||
    (!value
      ? t("testcase.helper.enterContent", "내용을 입력하세요.")
      : t(
          "testcase.helper.markdownSupported",
          "Markdown 문법을 사용할 수 있습니다.",
        ));

  const floor = typeof height === "number" ? height : parseInt(height, 10) || 0;
  const minHeight = Math.max(
    floor,
    computeMarkdownEditorHeight(value, { maxLines }),
  );

  const isDark = theme?.palette?.mode === "dark";
  const borderColor = error ? theme.palette.error.main : theme.palette.divider;

  const run = useCallback(
    (fn) => () => {
      if (!editor) return;
      fn(editor.chain().focus()).run();
    },
    [editor],
  );

  const toolbarButtons = useMemo(
    () => [
      {
        key: "bold",
        title: t("testcase.markdown.bold", "굵게"),
        icon: <FormatBoldIcon fontSize="small" />,
        action: (chain) => chain.toggleBold(),
        active: () => editor?.isActive("bold"),
      },
      {
        key: "italic",
        title: t("testcase.markdown.italic", "기울임"),
        icon: <FormatItalicIcon fontSize="small" />,
        action: (chain) => chain.toggleItalic(),
        active: () => editor?.isActive("italic"),
      },
      {
        key: "code",
        title: t("testcase.markdown.code", "코드"),
        icon: <CodeIcon fontSize="small" />,
        action: (chain) => chain.toggleCode(),
        active: () => editor?.isActive("code"),
      },
      { key: "divider-1", divider: true },
      {
        key: "heading",
        title: t("testcase.markdown.heading", "제목"),
        icon: <TitleIcon fontSize="small" />,
        action: (chain) => chain.toggleHeading({ level: 2 }),
        active: () => editor?.isActive("heading", { level: 2 }),
      },
      {
        key: "quote",
        title: t("testcase.markdown.quote", "인용"),
        icon: <FormatQuoteIcon fontSize="small" />,
        action: (chain) => chain.toggleBlockquote(),
        active: () => editor?.isActive("blockquote"),
      },
      { key: "divider-2", divider: true },
      {
        key: "bulletList",
        title: t("testcase.markdown.bulletList", "목록"),
        icon: <FormatListBulletedIcon fontSize="small" />,
        action: (chain) => chain.toggleBulletList(),
        active: () => editor?.isActive("bulletList"),
      },
      {
        key: "orderedList",
        title: t("testcase.markdown.orderedList", "번호 목록"),
        icon: <FormatListNumberedIcon fontSize="small" />,
        action: (chain) => chain.toggleOrderedList(),
        active: () => editor?.isActive("orderedList"),
      },
      {
        key: "taskList",
        title: t("testcase.markdown.taskList", "체크리스트"),
        icon: <ChecklistIcon fontSize="small" />,
        action: (chain) => chain.toggleTaskList(),
        active: () => editor?.isActive("taskList"),
      },
      { key: "divider-3", divider: true },
      {
        key: "table",
        title: t("testcase.markdown.table", "표 넣기"),
        icon: <TableChartIcon fontSize="small" />,
        action: (chain) =>
          chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
        active: () => editor?.isActive("table"),
      },
    ],
    [editor, t],
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
        sx={{
          mt: 1,
          border: `1px solid ${borderColor}`,
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {!isViewer && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              flexWrap: "wrap",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.02)",
            }}
          >
            {toolbarButtons.map((button) =>
              button.divider ? (
                <Divider
                  key={button.key}
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 0.5, my: 0.5 }}
                />
              ) : (
                <Tooltip key={button.key} title={button.title}>
                  <IconButton
                    size="small"
                    onClick={run(button.action)}
                    color={button.active() ? "primary" : "default"}
                    aria-label={button.title}
                    data-testid={`rich-md-${button.key}`}
                  >
                    {button.icon}
                  </IconButton>
                </Tooltip>
              ),
            )}
          </Box>
        )}

        <Box
          sx={{
            minHeight,
            maxHeight: minHeight,
            overflowY: "auto",
            px: 1.5,
            py: 1,
            "& .rich-markdown-surface": {
              outline: "none",
              minHeight: minHeight - 16,
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: theme.palette.text.primary,
            },
            // Placeholder 확장은 빈 문단에 data-placeholder 를 붙인다.
            "& .rich-markdown-surface p.is-editor-empty:first-of-type::before":
              {
                content: "attr(data-placeholder)",
                color: theme.palette.text.disabled,
                float: "left",
                height: 0,
                pointerEvents: "none",
              },
            "& .rich-markdown-surface :where(h1,h2,h3,h4)": {
              margin: "0.8em 0 0.4em",
              lineHeight: 1.3,
            },
            "& .rich-markdown-surface p": { margin: "0.35em 0" },
            "& .rich-markdown-surface ul, & .rich-markdown-surface ol": {
              paddingLeft: "1.4em",
              margin: "0.35em 0",
            },
            "& .rich-markdown-surface blockquote": {
              margin: "0.5em 0",
              paddingLeft: "0.9em",
              borderLeft: `3px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
            },
            "& .rich-markdown-surface code": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
              padding: "0.1em 0.35em",
              borderRadius: 3,
              fontSize: "0.85em",
            },
            "& .rich-markdown-surface pre": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
              padding: "0.7em 0.9em",
              borderRadius: 4,
              overflowX: "auto",
            },
            "& .rich-markdown-surface pre code": {
              backgroundColor: "transparent",
              padding: 0,
            },
            "& .rich-markdown-surface table": {
              borderCollapse: "collapse",
              width: "100%",
              margin: "0.6em 0",
              tableLayout: "fixed",
            },
            "& .rich-markdown-surface :where(th,td)": {
              border: `1px solid ${theme.palette.divider}`,
              padding: "0.4em 0.6em",
              verticalAlign: "top",
            },
            "& .rich-markdown-surface th": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              fontWeight: 600,
            },
            "& .rich-markdown-surface ul[data-type='taskList']": {
              listStyle: "none",
              paddingLeft: 0,
            },
            "& .rich-markdown-surface ul[data-type='taskList'] li": {
              display: "flex",
              alignItems: "flex-start",
              gap: "0.45em",
            },
            "& .rich-markdown-surface img": { maxWidth: "100%" },
            "& .rich-markdown-surface a": {
              color: theme.palette.primary.main,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
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

RichMarkdownFieldEditor.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxLines: PropTypes.number,
  isViewer: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onPaste: PropTypes.func,
  testid: PropTypes.string,
};

export default RichMarkdownFieldEditor;
