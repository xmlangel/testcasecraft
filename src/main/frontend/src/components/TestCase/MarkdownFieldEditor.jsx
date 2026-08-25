// src/components/TestCase/MarkdownFieldEditor.jsx

import React from "react";
import PropTypes from "prop-types";
import RichMarkdownEditor from "./RichMarkdownEditor.jsx";

/**
 * 텍스트/마크다운 필드 에디터.
 *
 * 예전에는 @uiw/react-md-editor 의 좌우 분할 미리보기를 그렸다. 지금은 Tiptap 기반
 * RichMarkdownEditor 로 위임한다 — 미리보기 패널 없이 서식이 본문에 그대로 그려지고,
 * 저장 값은 그대로 마크다운이다. 호출부 여섯 곳이 이 컴포넌트를 쓰므로 이름과 props 를
 * 그대로 두고 내부만 바꿨다.
 *
 * preview prop 은 예전 에디터의 표시 모드였다("edit" | "live" | "preview").
 * Tiptap 에는 그런 모드가 없어 "preview" 만 읽기 전용으로 옮기고 나머지는 무시한다.
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
  testid,
  preview,
}) => (
  <RichMarkdownEditor
    label={label}
    value={value}
    placeholder={placeholder}
    height={height}
    maxLines={maxLines}
    isViewer={isViewer || preview === "preview"}
    error={error}
    helperText={helperText}
    theme={theme}
    t={t}
    onChange={onChange}
    onPaste={onPaste}
    testid={testid}
  />
);

MarkdownFieldEditor.propTypes = {
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
  preview: PropTypes.string,
};

export default MarkdownFieldEditor;
