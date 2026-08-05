import { describe, it, expect } from "vitest";
import {
  hasEditableSections,
  replaceMarkdownSection,
  splitMarkdownSections,
} from "./markdownSections.js";

const DOC = [
  "머리글 문장.",
  "",
  "# 총평",
  "전반적으로 안정적.",
  "",
  "## 실패 분석",
  "- FAIL 3건",
  "",
  "### 재현 조건",
  "동시 접속 50",
].join("\n");

describe("splitMarkdownSections", () => {
  it("첫 제목 앞 내용은 머리글 섹션이 되고, 제목마다 섹션이 생긴다", () => {
    const sections = splitMarkdownSections(DOC);
    expect(sections.map((s) => [s.level, s.title])).toEqual([
      [0, ""],
      [1, "총평"],
      [2, "실패 분석"],
      [3, "재현 조건"],
    ]);
  });

  it("섹션 내용은 자기 제목과 다음 제목 전까지만 담는다 (하위 섹션 미포함)", () => {
    const sections = splitMarkdownSections(DOC);
    expect(sections[1].content).toBe("# 총평\n전반적으로 안정적.");
    expect(sections[2].content).toBe("## 실패 분석\n- FAIL 3건");
  });

  it("코드 펜스 안의 # 는 섹션 경계가 아니다", () => {
    const sections = splitMarkdownSections(
      "# 제목\n```bash\n# 주석\necho 1\n```\n본문",
    );
    expect(sections).toHaveLength(1);
    expect(sections[0].content).toContain("# 주석");
  });

  it("제목이 없으면 머리글 섹션 하나뿐이고 섹션 편집 대상이 아니다", () => {
    expect(splitMarkdownSections("한 줄 총평").map((s) => s.level)).toEqual([
      0,
    ]);
    expect(hasEditableSections("한 줄 총평")).toBe(false);
    expect(hasEditableSections(DOC)).toBe(true);
    expect(splitMarkdownSections("")).toEqual([]);
  });
});

describe("replaceMarkdownSection", () => {
  it("같은 내용으로 교체하면 원문이 그대로 유지된다 (왕복 무손실)", () => {
    const sections = splitMarkdownSections(DOC);
    sections.forEach((section) => {
      expect(replaceMarkdownSection(DOC, section.id, section.content)).toBe(
        DOC,
      );
    });
  });

  it("해당 섹션만 바뀌고 다른 섹션은 손대지 않는다", () => {
    const target = splitMarkdownSections(DOC).find(
      (s) => s.title === "실패 분석",
    );
    const merged = replaceMarkdownSection(
      DOC,
      target.id,
      "## 실패 분석\n- FAIL 5건\n- 원인 조사 중",
    );
    expect(merged).toContain("- FAIL 5건");
    expect(merged).not.toContain("- FAIL 3건");
    expect(merged).toContain("머리글 문장.");
    expect(merged).toContain("# 총평\n전반적으로 안정적.");
    expect(merged).toContain("### 재현 조건\n동시 접속 50");
  });

  it("제목 수준을 바꿔 저장해도 반영된다", () => {
    const target = splitMarkdownSections(DOC).find((s) => s.title === "총평");
    const merged = replaceMarkdownSection(
      DOC,
      target.id,
      "## 총평\n전반적으로 안정적.",
    );
    expect(splitMarkdownSections(merged).map((s) => s.level)).toEqual([
      0, 2, 2, 3,
    ]);
  });

  it("없는 섹션 id 는 원문을 그대로 돌려준다", () => {
    expect(replaceMarkdownSection(DOC, "h999", "덮어쓰기")).toBe(DOC);
  });
});
