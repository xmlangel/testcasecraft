// 마크다운 표시 공용 스타일.
// pre-wrap 을 마크다운 루트(.wmde-markdown)에 걸면 react-markdown 이 블록 사이에
// 넣는 개행 텍스트 노드까지 빈 줄로 렌더링되어 과도한 공백이 생긴다.
// 따라서 pre-wrap 은 루트가 아닌 블록 텍스트 요소(p/li)에만 한정한다.
// 이렇게 하면 문단 내 단일 줄바꿈은 보존하면서 블록 사이 개행은 정상 병합된다.
export const MARKDOWN_PREWRAP_SX = {
  "& .wmde-markdown p, & .wmde-markdown li": { whiteSpace: "pre-wrap" },
};
