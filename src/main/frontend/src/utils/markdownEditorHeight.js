// src/utils/markdownEditorHeight.js

// MDEditor 한 줄 높이(px)와 에디터 크롬(툴바 + 패딩 + 보더) 추정치.
const LINE_PX = 22;
const CHROME_PX = 56;

/**
 * 내용 길이에 따라 MDEditor 높이를 계산한다.
 *
 * - 내용이 없으면 최소 높이(툴바 + minLines 줄)만 차지한다.
 * - 내용이 있으면 줄 수만큼 늘되 maxLines(기본 10줄)에서 멈추고,
 *   그 이상은 MDEditor 내부 textarea 가 스크롤한다.
 *
 * @param {string} value         에디터 내용
 * @param {object} [opts]
 * @param {number} [opts.minLines=1]  최소 줄 수 하한 (내용 없을 때의 높이이자,
 *                                     내용이 있을 때도 이 줄 수 미만으로는 줄지 않음)
 * @param {number} [opts.maxLines=10] 내용이 있을 때 늘어날 최대 줄 수(이후 스크롤)
 * @returns {number} 높이(px)
 */
export const computeMarkdownEditorHeight = (
  value,
  { minLines = 1, maxLines = 10 } = {},
) => {
  const text = (value ?? "").replace(/\s+$/u, "");

  // 내용 없음 → 최소 높이
  if (!text) {
    return CHROME_PX + minLines * LINE_PX;
  }

  // 내용 있음 → 최소 max(minLines, 2)줄, 최대 maxLines 줄까지 (그 이상은 스크롤)
  // minLines 를 함께 적용해 호출 측이 더 큰 하한(예: 단계 5줄)을 줄 수 있게 한다.
  const lines = text.split("\n").length;
  const visibleLines = Math.min(Math.max(lines, minLines, 2), maxLines);
  return CHROME_PX + visibleLines * LINE_PX;
};

export default computeMarkdownEditorHeight;
