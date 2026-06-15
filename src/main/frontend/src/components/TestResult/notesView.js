// 테스트 실행 노트(비고) 미리보기 표시 로직.
// 미리보기 모드 + 값 존재 + 비전체화면일 때, 테스트 스텝처럼 내용 전체를
// 스크롤 없이 표시하기 위해 MDEditor 높이를 auto 로 푼다.
// (편집/라이브/전체화면 모드는 입력 중 무한정 늘어나지 않도록 고정 높이 유지)

export const shouldExpandNotesPreview = ({ previewMode, isFullscreen, notes }) =>
  previewMode === "preview" && !isFullscreen && !!notes && notes.length > 0;

const EXPANDED_SX = {
  "& .w-md-editor": { height: "auto !important" },
  "& .w-md-editor-content": { height: "auto !important" },
  "& .w-md-editor-area": { height: "auto !important" },
  "& .w-md-editor-preview": {
    position: "static !important",
    overflow: "visible !important",
    height: "auto !important",
    width: "100% !important",
    boxShadow: "none",
  },
};

export const buildNotesAutoHeightSx = (state) =>
  shouldExpandNotesPreview(state) ? EXPANDED_SX : {};
