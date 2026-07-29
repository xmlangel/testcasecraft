/**
 * 날짜 표기 안전성 스캐너 — "Invalid date" 재발 방지용.
 *
 * 배경: 백엔드는 LocalDateTime 을 [년,월,일,시,분,초,나노초] 배열로 내보낸다.
 * 컴포넌트가 `new Date(값)` 을 직접 호출하면 이 형태에서 Invalid Date 가 되고,
 * 화면에 "Invalid Date" 문구가 그대로 노출된다(테스트케이스 첨부 업로드 일시 사례).
 *
 * 안전한 경로는 하나다 — `useDateFormatter()` 훅이나 `dateUtils` 의
 * `formatDateSafe`/`safeParseDate`. 이들은 배열·문자열·Date 를 모두 받고,
 * 파싱에 실패하면 "-" 를 돌려준다.
 *
 * 이 스캐너는 그 경로를 우회하는 두 패턴을 찾는다:
 *   raw-date-format  — `new Date(값).toLocale*String(...)` 직접 포맷 체인
 *   local-formatter  — 컴포넌트가 자체 날짜 포맷 헬퍼를 정의(공용 유틸 대체)
 *
 * 기존 코드에 이미 남아 있는 건수는 baseline 에 기록해 두고, 그보다 늘어날 때만
 * 실패시킨다. 새 코드가 같은 함정을 밟는 것만 막고 기존 정리는 별도 작업으로 둔다.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const FRONTEND_ROOT = resolve(HERE, "..");
export const BASELINE_PATH = join(HERE, "date-formatting-baseline.json");

const SCAN_DIRS = ["src/components", "src/hooks", "src/pages", "src/context"];
const SOURCE_EXT = /\.(js|jsx)$/;
const SKIP_FILE = /\.test\.(js|jsx)$/;

/** 공용 유틸 자신은 검사 대상이 아니다 — 여기가 정본 구현이다. */
const ALLOWLIST = new Set([
  "src/utils/dateUtils.js",
  "src/utils/timezoneUtils.js",
  "src/hooks/useDateFormatter.js",
]);

const RULES = [
  {
    id: "raw-date-format",
    // new Date(<인자>) ... .toLocaleString / .toLocaleDateString / .toLocaleTimeString
    pattern: /new\s+Date\s*\([^)]+\)\s*\.\s*toLocale(Date|Time)?String\s*\(/g,
    hint: "useDateFormatter() 의 formatDate 또는 dateUtils 의 formatDateSafe 를 쓴다",
  },
  {
    id: "local-formatter",
    // 컴포넌트 안에서 자체 날짜 포맷 헬퍼를 선언하는 경우
    pattern:
      /(?:const|function)\s+format(?:Date|DateTime|Time)[A-Za-z]*\s*(?:=|\()/g,
    hint: "자체 헬퍼 대신 useDateFormatter() / formatDateSafe 를 쓴다",
  },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (SOURCE_EXT.test(entry) && !SKIP_FILE.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * 위반 목록을 수집한다.
 * @returns {Array<{file: string, rule: string, line: number, text: string, hint: string}>}
 */
export function scanViolations() {
  const violations = [];

  for (const scanDir of SCAN_DIRS) {
    for (const absPath of walk(join(FRONTEND_ROOT, scanDir))) {
      const file = relative(FRONTEND_ROOT, absPath);
      if (ALLOWLIST.has(file)) continue;

      const lines = readFileSync(absPath, "utf8").split("\n");
      lines.forEach((text, index) => {
        for (const rule of RULES) {
          rule.pattern.lastIndex = 0;
          if (rule.pattern.test(text)) {
            violations.push({
              file,
              rule: rule.id,
              line: index + 1,
              text: text.trim(),
              hint: rule.hint,
            });
          }
        }
      });
    }
  }

  return violations;
}

/** 파일·규칙별 건수로 집계한다 — 줄 번호 변동으로 baseline 이 흔들리지 않게. */
export function summarize(violations) {
  const counts = {};
  for (const v of violations) {
    const key = `${v.file}::${v.rule}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function readBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8")).counts || {};
  } catch {
    return {};
  }
}

/**
 * baseline 대비 새로 늘어난 위반만 골라낸다.
 * @returns {Array<{key: string, baseline: number, current: number}>}
 */
export function findRegressions(counts, baseline = readBaseline()) {
  const regressions = [];
  for (const [key, current] of Object.entries(counts)) {
    const allowed = baseline[key] || 0;
    if (current > allowed) {
      regressions.push({ key, baseline: allowed, current });
    }
  }
  return regressions.sort((a, b) => a.key.localeCompare(b.key));
}

export function formatRegressionReport(regressions, violations) {
  const lines = [
    "날짜 표기 안전성 검사 실패 — 아래 위치가 공용 포맷터를 우회한다.",
    "",
  ];

  for (const r of regressions) {
    const [file, rule] = r.key.split("::");
    lines.push(
      `  ${file}  [${rule}]  기준 ${r.baseline}건 → 현재 ${r.current}건`,
    );
    for (const v of violations.filter(
      (v) => v.file === file && v.rule === rule,
    )) {
      lines.push(`    ${v.line}: ${v.text}`);
      lines.push(`      → ${v.hint}`);
    }
  }

  lines.push(
    "",
    "백엔드는 LocalDateTime 을 배열로 내보내므로 new Date(값) 은 Invalid Date 가 된다.",
    "의도한 변경이면 `npm run check:dates -- --update-baseline` 으로 기준을 갱신한다.",
  );

  return lines.join("\n");
}
