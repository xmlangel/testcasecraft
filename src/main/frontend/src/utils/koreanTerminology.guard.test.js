import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 한국어 화면 용어 표기 가드 (ICT-510, 리뷰 P1-7).
 *
 * 사이드바는 「테스트실행」「테스트결과」, 다른 화면은 「테스트 플랜」「테스트 케이스 실행 목록」처럼
 * 같은 용어가 붙였다 띄었다 섞여 있었다. 표기를 하나로 정했다.
 *  - 테스트케이스: 붙여 쓴다 (기존 번역 122곳이 이 표기였다)
 *  - 테스트 플랜·테스트 실행·테스트 결과: 띄어 쓴다
 *  - 상태 「진행 중」: 띄어 쓴다
 * 한국어 번역 시드(백엔드)에 다른 표기가 새로 들어오면 실패한다.
 */
const here = dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_DIR = join(
  here,
  "../../../java/com/testcase/testcasemanagement/config/i18n/translations",
);

const koreanValues = () =>
  readdirSync(TRANSLATIONS_DIR)
    .filter((f) => f.startsWith("Korean") && f.endsWith(".java"))
    .flatMap((f) => {
      const src = readFileSync(join(TRANSLATIONS_DIR, f), "utf8");
      return [...src.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => ({
        file: f,
        value: m[1],
      }));
    });

const FORBIDDEN = [
  { pattern: /테스트 케이스/, use: "테스트케이스" },
  { pattern: /^테스트실행$/, use: "테스트 실행" },
  { pattern: /^테스트결과$/, use: "테스트 결과" },
  { pattern: /^테스트플랜$/, use: "테스트 플랜" },
];

describe("한국어 용어 표기", () => {
  it("번역 시드를 읽는다", () => {
    expect(koreanValues().length).toBeGreaterThan(1000);
  });

  it.each(FORBIDDEN)("$pattern 대신 「$use」로 쓴다", ({ pattern }) => {
    const hits = koreanValues().filter(({ value }) => pattern.test(value));
    expect(hits.map((h) => `${h.file}: ${h.value}`)).toEqual([]);
  });

  // 이 파일은 같은 키를 위에서 영어로 한 번 넣고 아래에서 한국어로 덮어쓴다. 마지막 값이 화면에 남는다.
  it("실행 상태 「진행 중」은 띄어 쓴다 (마지막으로 넣는 값 기준)", () => {
    const src = readFileSync(
      join(TRANSLATIONS_DIR, "KoreanTestExecutionTranslations.java"),
      "utf8",
    );
    const values = [
      ...src.matchAll(
        /"testExecution\.status\.inProgress",\s*languageCode,\s*"([^"]*)"/g,
      ),
    ].map((m) => m[1]);
    expect(values.length).toBeGreaterThan(0);
    expect(values.at(-1)).toBe("진행 중");
  });
});
