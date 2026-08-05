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
 *
 * 섹션 id 는 줄 번호 기반이라 원문이 바뀌면 같은 id 가 다른 구간을 가리킬 수 있다.
 * 그래서 편집을 시작할 때의 구간 내용(expectedContent)을 함께 넘기면 대조하고,
 * 어긋나면 **null** 을 돌려준다. 호출부는 이 경우 저장하지 말고 사용자에게
 * 알려야 한다(모르는 채로 남의 수정을 덮어쓰는 것을 막는다).
 *
 * @param {string} markdown 현재 전체 마크다운
 * @param {string} sectionId splitMarkdownSections 가 준 구간 id
 * @param {string} newContent 그 구간을 대체할 내용
 * @param {{expectedContent?: string, sections?: Array}} [options]
 *   expectedContent: 편집 시작 시점의 구간 내용 (충돌 감지용)
 *   sections: 이미 계산해 둔 구간 목록 (중복 분할 회피)
 * @returns {string|null} 병합된 마크다운. 구간을 못 찾으면 원문, 충돌이면 null.
 */
export const replaceMarkdownSection = (
  markdown = "",
  sectionId,
  newContent = "",
  { expectedContent, sections } = {},
) => {
  const target = (sections ?? splitMarkdownSections(markdown)).find(
    (section) => section.id === sectionId,
  );

  // 편집을 시작한 구간과 지금 그 id 가 가리키는 구간이 다르면(또는 사라졌으면)
  // 병합을 거부한다. expectedContent 없이 부르면 종전처럼 원문을 그대로 준다.
  if (expectedContent !== undefined && target?.content !== expectedContent) {
    return null;
  }
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
