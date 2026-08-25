// 테스트 실행 노트(비고) 표시 로직.
//
// 미리보기 모드 + 값 존재 + 비전체화면일 때, 테스트 스텝처럼 내용 전체를 스크롤 없이
// 보여 준다. 편집·라이브·전체화면 모드에서는 입력 중 화면이 무한정 늘어나지 않도록
// 고정 높이를 유지한다.
//
// 예전에는 MDEditor 내부 클래스(.w-md-editor 등)에 height:auto 를 덮어써서 풀었다.
// 편집기를 Tiptap 으로 바꾸면서 그 클래스가 사라졌고, 이제는 에디터가 받는 maxLines
// 를 크게 주어 같은 결과를 낸다. 조건 판정은 그대로다.

export const shouldExpandNotesPreview = ({
  previewMode,
  isFullscreen,
  notes,
}) => previewMode === "preview" && !isFullscreen && !!notes && notes.length > 0;

// 접힌 상태의 기본 줄 수. 이 값을 넘으면 에디터 안에서 스크롤한다.
const COLLAPSED_MAX_LINES = 12;

// 펼친 상태의 상한. 사실상 제한을 두지 않되, 계산이 폭주하지 않게 값은 유한하게 둔다.
// 비고는 10,000자 제한이라 이 줄 수를 넘길 수 없다.
const EXPANDED_MAX_LINES = 1000;

export const resolveNotesMaxLines = (state) =>
  shouldExpandNotesPreview(state) ? EXPANDED_MAX_LINES : COLLAPSED_MAX_LINES;
