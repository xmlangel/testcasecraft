// 마크다운 표시 공용 스타일.
//
// 전에는 @uiw/react-md-editor 가 실어 오는 markdown.css 가 표·코드·제목 서식을
// 그려 주었고 이 파일은 그 위에 pre-wrap 만 얹었다. 편집기를 Tiptap 으로 바꾸면서
// 그 CSS 가 사라졌으므로 서식 자체를 여기서 제공한다. 루트 클래스도 함께 바뀌었다
// (.wmde-markdown → .markdown-body).
//
// pre-wrap 을 마크다운 루트에 걸면 react-markdown 이 블록 사이에 넣는 개행 텍스트
// 노드까지 빈 줄로 렌더링되어 과도한 공백이 생긴다. 따라서 pre-wrap 은 루트가 아닌
// 블록 텍스트 요소(p/li)에만 한정한다. 이렇게 하면 문단 내 단일 줄바꿈은 보존하면서
// 블록 사이 개행은 정상 병합된다. 실제로 발생했던 결함이라 회귀 시험이 붙어 있다.
export const MARKDOWN_PREWRAP_SX = {
  "& .markdown-body p, & .markdown-body li": { whiteSpace: "pre-wrap" },
  "&.markdown-body p, &.markdown-body li": { whiteSpace: "pre-wrap" },
};

/**
 * 마크다운 본문 서식 sx 를 만든다. MarkdownViewer 가 루트에 직접 적용하므로
 * 선택자는 자신(&)을 기준으로 잡는다.
 *
 * 색은 대부분 currentColor 와 MUI 토큰 문자열을 쓴다. 테마 객체를 받지 않아도
 * 부모가 정한 글자색을 따라가고, 다크 모드에서도 따로 분기하지 않는다.
 */
export const buildMarkdownSx = () => ({
  color: "inherit",
  fontSize: "inherit",
  lineHeight: 1.7,
  wordBreak: "break-word",

  "& > :first-of-type": { marginTop: 0 },
  "& > :last-child": { marginBottom: 0 },

  "& p": { margin: "0.4em 0", whiteSpace: "pre-wrap" },
  "& li": { whiteSpace: "pre-wrap" },

  "& h1, & h2, & h3, & h4, & h5, & h6": {
    margin: "0.9em 0 0.4em",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  "& h1": { fontSize: "1.5em" },
  "& h2": { fontSize: "1.3em" },
  "& h3": { fontSize: "1.15em" },
  "& h4, & h5, & h6": { fontSize: "1em" },

  "& ul, & ol": { paddingLeft: "1.4em", margin: "0.4em 0" },
  "& li + li": { marginTop: "0.15em" },
  "& li > ul, & li > ol": { margin: "0.15em 0" },
  // GFM 체크박스 목록은 표식을 없애고 체크박스만 남긴다.
  "& li:has(> input[type='checkbox'])": { listStyle: "none" },
  "& input[type='checkbox']": { marginRight: "0.4em" },

  "& blockquote": {
    margin: "0.5em 0",
    paddingLeft: "0.9em",
    borderLeft: "3px solid",
    borderLeftColor: "divider",
    color: "text.secondary",
  },

  "& code": {
    backgroundColor: "action.hover",
    padding: "0.1em 0.35em",
    borderRadius: "3px",
    fontSize: "0.85em",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  },
  "& pre": {
    backgroundColor: "action.hover",
    padding: "0.7em 0.9em",
    borderRadius: "4px",
    overflowX: "auto",
    margin: "0.5em 0",
  },
  "& pre code": {
    backgroundColor: "transparent",
    padding: 0,
    fontSize: "0.85em",
  },

  "& table": {
    borderCollapse: "collapse",
    margin: "0.6em 0",
    display: "block",
    overflowX: "auto",
    maxWidth: "100%",
  },
  "& th, & td": {
    border: "1px solid",
    borderColor: "divider",
    padding: "0.4em 0.6em",
    verticalAlign: "top",
    textAlign: "left",
  },
  "& th": { backgroundColor: "action.hover", fontWeight: 600 },

  "& a": { color: "primary.main" },
  "& img": { maxWidth: "100%" },
  "& hr": {
    border: 0,
    borderTop: "1px solid",
    borderTopColor: "divider",
    margin: "1em 0",
  },
});
