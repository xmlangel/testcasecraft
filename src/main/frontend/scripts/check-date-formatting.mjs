#!/usr/bin/env node
/**
 * 날짜 표기 안전성 검사 CLI.
 *
 *   npm run check:dates                    검사만 (새 위반 있으면 exit 1)
 *   npm run check:dates -- --list          현재 위반 전체 목록
 *   npm run check:dates -- --update-baseline   기준 갱신
 *
 * 검사 로직은 dateFormattingScan.mjs 에 있고 vitest(date-formatting.guard.test.js)도
 * 같은 모듈을 쓴다 — pre-commit 의 프런트 테스트 훅에서 자동으로 함께 돈다.
 */
import { writeFileSync } from "node:fs";
import {
  BASELINE_PATH,
  findRegressions,
  formatRegressionReport,
  readBaseline,
  scanViolations,
  summarize,
} from "./dateFormattingScan.mjs";

const args = process.argv.slice(2);
const violations = scanViolations();
const counts = summarize(violations);

if (args.includes("--update-baseline")) {
  const payload = {
    _comment:
      "날짜 표기 안전성 baseline — 파일::규칙 별 기존 위반 건수. " +
      "새 위반만 실패시키기 위한 기준이며, 줄여 나가는 것이 목표다.",
    counts: Object.fromEntries(Object.entries(counts).sort()),
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `baseline 갱신: ${Object.keys(counts).length}개 항목, 총 ${violations.length}건`,
  );
  process.exit(0);
}

if (args.includes("--list")) {
  for (const v of violations) {
    console.log(`${v.file}:${v.line}  [${v.rule}]  ${v.text}`);
  }
  console.log(`\n총 ${violations.length}건`);
  process.exit(0);
}

const regressions = findRegressions(counts, readBaseline());

if (regressions.length > 0) {
  console.error(formatRegressionReport(regressions, violations));
  process.exit(1);
}

console.log(
  `날짜 표기 검사 통과 — 기존 ${violations.length}건(baseline 내), 신규 0건`,
);
