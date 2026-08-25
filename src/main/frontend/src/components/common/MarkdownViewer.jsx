import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypePrismPlus from "rehype-prism-plus";
import { buildMarkdownSx } from "./markdownStyles.js";

/**
 * Markdown 렌더링 전용 뷰어. 이 프로젝트에서 마크다운을 화면에 그리는 정본이다.
 *
 * 전에는 @uiw/react-md-editor 의 MDEditor.Markdown 을 직접 호출하는 자리가
 * 열 곳에 흩어져 있었고 각자 style prop 으로 배경·글자색을 따로 지정했다.
 * 편집기를 Tiptap 으로 바꾸면서 렌더러도 react-markdown 하나로 모았다.
 *
 * rehypeRaw 로 본문의 HTML 을 살리고 rehypeSanitize 로 걸러낸다. 순서가 중요하다 —
 * raw 가 HTML 을 트리에 넣은 뒤 sanitize 가 위험한 노드를 떼어낸다. sanitize 를
 * 빼면 TC 본문에 심은 script·onerror 가 그대로 실행되고, 그 본문은 다른 사용자가
 * 결과 화면에서 열어 본다.
 */
const MarkdownViewer = ({
  content,
  sx = {},
  style,
  emptyFallback = null,
  disableHighlight = false,
  "data-testid": dataTestId,
}) => {
  // 훅은 조건보다 먼저 부른다. early return 을 위에 두면 content 가 비었다가
  // 채워질 때 훅 호출 순서가 달라져 React 가 오류를 낸다.
  const rehypePlugins = useMemo(
    () =>
      disableHighlight
        ? [rehypeRaw, rehypeSanitize]
        : [
            rehypeRaw,
            rehypeSanitize,
            [rehypePrismPlus, { ignoreMissing: true }],
          ],
    [disableHighlight],
  );

  if (!content || content.trim() === "") {
    return emptyFallback;
  }

  return (
    <Box
      className="markdown-body"
      data-testid={dataTestId}
      sx={{ ...buildMarkdownSx(), ...sx }}
      style={style}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

MarkdownViewer.propTypes = {
  content: PropTypes.string,
  sx: PropTypes.object,
  style: PropTypes.object,
  emptyFallback: PropTypes.node,
  disableHighlight: PropTypes.bool,
  "data-testid": PropTypes.string,
};

export default MarkdownViewer;
