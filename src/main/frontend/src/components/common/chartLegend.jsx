/**
 * 차트 범례 글자 (ICT-509).
 *
 * recharts 기본 범례는 글자를 계열 색으로 칠한다. 노랑(차단됨)·연회색(미실행)·연녹색(성공)은
 * 흰 배경에서 대비가 1.6~2.1:1 이라 읽기 어려웠다. 색은 앞의 사각형 표식에만 남기고
 * 글자는 본문 색으로 쓴다. 다크 모드에서는 index.css 의 --text-primary 가 밝은 색으로 바뀐다.
 */
export const LEGEND_TEXT_COLOR = "var(--text-primary)";

export const legendTextFormatter = (value) => (
  <span style={{ color: LEGEND_TEXT_COLOR }}>{value}</span>
);
