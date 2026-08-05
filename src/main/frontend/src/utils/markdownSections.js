// 마크다운을 제목(#~######) 단위 섹션으로 쪼개고, 한 섹션만 고쳐 원문에 되꽂는 유틸.
//
// 긴 QA 총평을 편집기 하나로 다루면 원하는 대목을 찾기 어렵다. 제목을 경계로 나눠
// 그 구간만 편집하고 나머지 줄은 손대지 않은 채 합친다.
//
// 섹션 경계는 "다음 제목 줄 직전"이다(레벨 무관). 그래서 상위 제목을 고칠 때
// 하위 섹션이 함께 편집기로 들어오지 않는다.

const HEADING = /^(#{1,6})\s+(.*)$/;
const FENCE = /^\s*(`{3,}|~{3,})/;

const toLines = (markdown) =>
  String(markdown ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

/**
 * 제목 단위 섹션 목록.
 * @returns {Array<{id:string,level:number,title:string,startLine:number,endLine:number,content:string}>}
 *   level 0 = 첫 제목 앞의 머리글(preamble)
 */
export const splitMarkdownSections = (markdown = "") => {
  const lines = toLines(markdown);
  const sections = [];
  let fenceMarker = null;
  let current = null;

  const commit = () => {
    if (!current) return;
    current.content = lines
      .slice(current.startLine, current.endLine + 1)
      .join("\n")
      .replace(/\s+$/, ""); // 뒤쪽 빈 줄은 표시·편집에서 제외 (줄 범위는 유지)
    sections.push(current);
  };

  lines.forEach((line, index) => {
    // 코드 펜스 안의 # 는 제목이 아니다
    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1][0];
      if (!fenceMarker) fenceMarker = marker;
      else if (fenceMarker === marker) fenceMarker = null;
    }

    const heading = fenceMarker ? null : HEADING.exec(line);

    if (heading) {
      commit();
      current = {
        id: `h${index}`,
        level: heading[1].length,
        title: heading[2].trim(),
        startLine: index,
        endLine: index,
      };
      return;
    }

    if (current) {
      current.endLine = index;
      return;
    }

    if (line.trim()) {
      current = {
        id: "preamble",
        level: 0,
        title: "",
        startLine: 0,
        endLine: index,
      };
    }
  });

  commit();
  return sections;
};

/** 제목이 하나라도 있으면 섹션 단위 편집이 가능하다. */
export const hasEditableSections = (markdown = "") =>
  splitMarkdownSections(markdown).some((section) => section.level > 0);

/**
 * 섹션 하나를 새 내용으로 교체한 전체 마크다운을 돌려준다.
 * 섹션을 찾지 못하면 원문을 그대로 반환한다(내용 유실 방지).
 */
export const replaceMarkdownSection = (
  markdown = "",
  sectionId,
  newContent = "",
) => {
  const target = splitMarkdownSections(markdown).find(
    (section) => section.id === sectionId,
  );
  if (!target) return String(markdown ?? "");

  const lines = toLines(markdown);
  const original = lines.slice(target.startLine, target.endLine + 1);

  // 섹션 사이 빈 줄은 편집 내용에서 빠져 있으므로(commit 에서 잘라냄) 원래 개수만큼 되돌린다
  let trailingBlanks = 0;
  for (let i = original.length - 1; i >= 0 && !original[i].trim(); i -= 1) {
    trailingBlanks += 1;
  }

  const replacement = toLines(newContent);
  while (
    replacement.length > 1 &&
    !replacement[replacement.length - 1].trim()
  ) {
    replacement.pop();
  }

  return [
    ...lines.slice(0, target.startLine),
    ...replacement,
    ...Array(trailingBlanks).fill(""),
    ...lines.slice(target.endLine + 1),
  ].join("\n");
};
