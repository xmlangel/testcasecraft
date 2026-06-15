import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";

/**
 * Markdown 렌더링 전용 뷰어 컴포넌트
 * 읽기 전용으로 Markdown 컨텐츠를 렌더링합니다.
 */
const MarkdownViewer = ({ content, sx = {} }) => {
  // 내용이 없으면 null 반환
  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <Box
      sx={{
        "& .wmde-markdown": {
          backgroundColor: "transparent",
          color: "inherit",
          fontSize: "inherit",
        },
        "& .wmde-markdown-var": {
          display: "none",
        },
        // 문단 내 단일 줄바꿈은 보존하되(QA 가 Enter 로 입력한 줄),
        // pre-wrap 을 루트가 아닌 블록 텍스트 요소에만 한정한다.
        // 루트에 걸면 react-markdown 이 블록 사이에 넣는 개행 텍스트 노드까지
        // 빈 줄로 렌더링되어 거대한 공백이 생긴다.
        "& .wmde-markdown p, & .wmde-markdown li": {
          whiteSpace: "pre-wrap",
        },
        ...sx,
      }}
      data-color-mode="light"
    >
      <MDEditor.Markdown
        source={content}
        style={{
          backgroundColor: "transparent",
          padding: 0,
        }}
      />
    </Box>
  );
};

MarkdownViewer.propTypes = {
  content: PropTypes.string,
  sx: PropTypes.object,
};

export default MarkdownViewer;
