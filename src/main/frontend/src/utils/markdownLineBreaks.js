// ICT-472: 한 줄 바꿈을 마크다운 줄바꿈으로 살린다.
//
// 마크다운은 빈 줄 없이 이어진 두 줄을 한 문단으로 붙여 그린다. 스텝 실제 결과는
// 일반 텍스트 상자로 입력받던 값이 이미 저장되어 있어 "로그인 성공\n토큰 발급" 처럼
// 한 줄 바꿈만 들어 있다. 그대로 마크다운으로 읽으면 두 줄이 한 줄로 붙는다.
// 앞줄 끝에 공백 두 칸(마크다운 강제 줄바꿈)을 붙여 입력한 모양을 유지한다.
//
// 코드 블록 안, 빈 줄 앞뒤, 이미 강제 줄바꿈이 있는 줄은 건드리지 않는다.
const FENCE = /^\s*(```|~~~)/;
const HARD_BREAK = /( {2,}|\\)$/;

export const preserveLineBreaks = (markdown) => {
  if (!markdown || !markdown.includes("\n")) return markdown || "";
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let inFence = false;
  return lines
    .map((line, i) => {
      if (FENCE.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const next = lines[i + 1];
      if (next === undefined) return line;
      if (!line.trim() || !next.trim()) return line;
      if (FENCE.test(next)) return line;
      if (HARD_BREAK.test(line)) return line;
      return `${line}  `;
    })
    .join("\n");
};

export default preserveLineBreaks;
