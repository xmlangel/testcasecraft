/**
 * SBTM 차터 미션(Markdown) 텍스트를 섹션별로 파싱하는 유틸리티
 */
export const parseMarkdownSections = (text) => {
  if (!text) return [];

  const lines = text.split("\n");
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    // 헤더 패턴 매칭 (# 또는 ##)
    const headerMatch = line.match(/^(#{1,2})\s+(.*)/);
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headerMatch[2].trim(),
        level: headerMatch[1].length,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    } else if (line.trim()) {
      // 헤더 없이 첫 내용이 나올 경우 '개요' 섹션 생성
      currentSection = {
        title: "개요",
        level: 1,
        content: [line],
      };
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  // 섹션별 내용 정제 (공백 제거 및 문자열 합치기)
  return sections.map((section) => ({
    ...section,
    content: section.content.join("\n").trim(),
  }));
};

/**
 * 섹션 제목에 어울리는 아이콘 키 반환
 */
export const getSectionIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("목적") || t.includes("objective")) return "objective";
  if (t.includes("범위") || t.includes("scope")) return "scope";
  if (t.includes("아이디어") || t.includes("idea")) return "idea";
  if (t.includes("리스크") || t.includes("risk")) return "risk";
  if (t.includes("전략") || t.includes("approach") || t.includes("strategy"))
    return "strategy";
  if (t.includes("완료") || t.includes("exit")) return "exit";
  if (t.includes("세션") || t.includes("info")) return "info";
  if (t.includes("결과") || t.includes("note")) return "note";
  return "default";
};
