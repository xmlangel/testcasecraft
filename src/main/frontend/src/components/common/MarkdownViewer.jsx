import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-markdown-preview/markdown.css';

/**
 * Markdown 렌더링 전용 뷰어 컴포넌트
 * 읽기 전용으로 Markdown 컨텐츠를 렌더링합니다.
 */
const MarkdownViewer = ({ content, sx = {} }) => {
  // 내용이 없으면 null 반환
  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <Box
      sx={{
        '& .wmde-markdown': {
          backgroundColor: 'transparent',
          color: 'inherit',
          fontSize: 'inherit',
        },
        '& .wmde-markdown-var': {
          display: 'none',
        },
        ...sx
      }}
      data-color-mode="light"
    >
      <MDEditor.Markdown
        source={content}
        style={{
          whiteSpace: 'pre-wrap',
          backgroundColor: 'transparent',
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
