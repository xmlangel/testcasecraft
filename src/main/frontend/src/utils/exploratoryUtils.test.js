import { describe, it, expect } from "vitest";
import { parseMarkdownSections, getSectionIcon } from "./exploratoryUtils.js";

describe("exploratoryUtils", () => {
  describe("parseMarkdownSections", () => {
    it("빈 입력은 빈 배열", () => {
      expect(parseMarkdownSections("")).toEqual([]);
      expect(parseMarkdownSections(null)).toEqual([]);
    });

    it("# / ## 헤더로 섹션을 나눈다", () => {
      const md = "# 목적\n목적 내용\n## 범위\n범위 내용";
      const sections = parseMarkdownSections(md);
      expect(sections).toHaveLength(2);
      expect(sections[0]).toMatchObject({
        title: "목적",
        level: 1,
        content: "목적 내용",
      });
      expect(sections[1]).toMatchObject({
        title: "범위",
        level: 2,
        content: "범위 내용",
      });
    });

    it("헤더 없이 시작하면 '개요' 섹션을 만든다", () => {
      const sections = parseMarkdownSections("머리말 내용\n둘째 줄");
      expect(sections[0].title).toBe("개요");
      expect(sections[0].content).toBe("머리말 내용\n둘째 줄");
    });
  });

  describe("getSectionIcon", () => {
    it("키워드(한/영)에 따라 아이콘 키를 반환한다", () => {
      expect(getSectionIcon("목적")).toBe("objective");
      expect(getSectionIcon("Scope of test")).toBe("scope");
      expect(getSectionIcon("테스트 아이디어")).toBe("idea");
      expect(getSectionIcon("Risk")).toBe("risk");
      expect(getSectionIcon("접근 전략")).toBe("strategy");
      expect(getSectionIcon("완료 기준")).toBe("exit");
      expect(getSectionIcon("세션 정보")).toBe("info");
      expect(getSectionIcon("결과 note")).toBe("note");
    });
    it("매칭 없으면 default", () => {
      expect(getSectionIcon("기타")).toBe("default");
    });
  });
});
