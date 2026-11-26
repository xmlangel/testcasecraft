/**
 * 성공률 같은 백분율 표기 (ICT-509).
 *
 * 화면마다 "0%" 와 "0.0%" 가 섞여 있었다. 소수 첫째 자리까지 반올림하고,
 * 소수부가 0 이면 떼어 정수로 쓴다: 0 → "0%", 80 → "80%", 87.46 → "87.5%".
 * 숫자가 아니거나 비어 있으면 0 으로 본다.
 */
export const formatPercent = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  const rounded = Math.round(safe * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
};

/**
 * 성공률 숫자에 쓰는 글자색 (ICT-509).
 *
 * 성공 색(녹색)으로 칠하면 0% 처럼 실패·미실행뿐인 결과도 녹색으로 먼저 눈에 띈다.
 * 숫자는 중립색으로 두고 상태 색은 도넛·막대 같은 그래픽에만 쓴다.
 */
export const RATE_TEXT_COLOR = "text.primary";
