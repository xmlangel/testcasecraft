// 테스트 결과 → HTML 리포트 렌더러.
// 프런트엔드 TestResultExportDialog.exportAsHtml 과 동일한 레이아웃/색상 체계를 포팅:
//   헤더 → Plan/실행명 → KPI 카드 4 → 상태 브레이크다운 → QA 총평 → 상세 리스트(분류 색상 칩) → 푸터.
// 결과 분류 색상/라벨은 프런트 testResultConstants.TEST_RESULT_CONFIG 와 동일.

export type ResultType = "PASS" | "FAIL" | "BLOCKED" | "NOT_RUN" | "SKIPPED";

interface ResultCfg {
  label: string;
  shortLabel: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export const RESULT_CONFIG: Record<ResultType, ResultCfg> = {
  PASS: { label: "성공", shortLabel: "Pass", color: "#00C49F", backgroundColor: "#F6FFED", borderColor: "#B7EB8F" },
  FAIL: { label: "실패", shortLabel: "Fail", color: "#FF4D4F", backgroundColor: "#FFF2F0", borderColor: "#FFCCC7" },
  BLOCKED: { label: "차단됨", shortLabel: "Blocked", color: "#FFBB28", backgroundColor: "#FFFBE6", borderColor: "#FFEC3D" },
  NOT_RUN: { label: "미실행", shortLabel: "Not Run", color: "#B0BEC5", backgroundColor: "#FAFAFA", borderColor: "#E8E8E8" },
  SKIPPED: { label: "건너뜀", shortLabel: "Skipped", color: "#D9D9D9", backgroundColor: "#F5F5F5", borderColor: "#D9D9D9" },
};

export const resolveResultType = (value: unknown): ResultType => {
  const s = String(value ?? "").trim().toUpperCase();
  if (s in RESULT_CONFIG) return s as ResultType;
  const matched = (Object.keys(RESULT_CONFIG) as ResultType[]).find(
    (k) =>
      s === RESULT_CONFIG[k].label.toUpperCase() ||
      s === RESULT_CONFIG[k].shortLabel.toUpperCase(),
  );
  if (matched) return matched;
  if (s.includes("PASS") || s.includes("성공")) return "PASS";
  if (s.includes("FAIL") || s.includes("실패")) return "FAIL";
  if (s.includes("BLOCK") || s.includes("차단")) return "BLOCKED";
  if (s.includes("SKIP") || s.includes("건너")) return "SKIPPED";
  return "NOT_RUN";
};

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const pct = (value: number, base: number): string =>
  base > 0 ? `${((value / base) * 100).toFixed(1)}%` : "0.0%";

export interface ReportRow {
  testCaseName?: string;
  folderPath?: string;
  result?: string;
  priority?: string;
  executorName?: string;
  executedBy?: string;
  executedAt?: string;
  jiraIssueKey?: string;
  preCondition?: string;
  expectedResults?: string;
  steps?: unknown;
  notes?: string;
  testPlanName?: string;
  testExecutionName?: string;
  [k: string]: unknown;
}

// steps(JSON 배열 | 문자열)를 사람이 읽는 텍스트로
const formatSteps = (steps: unknown): string => {
  if (!steps) return "-";
  if (typeof steps === "string") return steps;
  if (Array.isArray(steps)) {
    if (!steps.length) return "-";
    return steps
      .map((step: any, i: number) => {
        const n = step?.stepNumber ?? i + 1;
        const desc = step?.description ? ` ${step.description}` : "";
        const exp = step?.expectedResult ? ` (예상결과: ${step.expectedResult})` : "";
        return `${n}.${desc}${exp}`;
      })
      .join("\n");
  }
  try {
    return JSON.stringify(steps);
  } catch {
    return String(steps);
  }
};

export interface ReportSummary {
  total: number;
  pass: number;
  fail: number;
  blocked: number;
  notRun: number;
  skipped: number;
  executedCount: number;
  jiraLinked: number;
  executionRate: string;
  successRate: string;
  passRate: string;
  failRate: string;
  blockedRate: string;
  notRunRate: string;
  testPlanName: string;
  testExecutionName: string;
}

export const computeSummary = (rows: ReportRow[]): ReportSummary => {
  const s = { total: rows.length, pass: 0, fail: 0, blocked: 0, notRun: 0, skipped: 0, jiraLinked: 0 };
  for (const r of rows) {
    const type = resolveResultType(r.result);
    if (type === "PASS") s.pass += 1;
    else if (type === "FAIL") s.fail += 1;
    else if (type === "BLOCKED") s.blocked += 1;
    else if (type === "SKIPPED") s.skipped += 1;
    else s.notRun += 1;
    if (r.jiraIssueKey) s.jiraLinked += 1;
  }
  const executedCount = s.total - s.notRun;
  return {
    ...s,
    executedCount,
    executionRate: pct(executedCount, s.total),
    successRate: pct(s.pass, executedCount),
    passRate: pct(s.pass, s.total),
    failRate: pct(s.fail, s.total),
    blockedRate: pct(s.blocked, s.total),
    notRunRate: pct(s.notRun, s.total),
    testPlanName: rows[0]?.testPlanName || "",
    testExecutionName: rows[0]?.testExecutionName || "",
  };
};

const CSS = `
:root{
  --primary:#1976D2;--success:#2E7D32;--error:#D32F2F;--warning:#ED6C02;--info:#0288D1;
  --grey:#9E9E9E;--grey-dark:#424242;
  --bg:#f5f7fa;--surface:#fff;--surface-2:#f6f8fa;--border:#e0e4e8;--text:#212121;--text-sub:#57606a;--code-bg:#0d1117;--code-fg:#e6edf3;
}
[data-theme="dark"]{
  --bg:#121212;--surface:#1e1e1e;--surface-2:#262626;--border:#383838;--text:#e6e6e6;--text-sub:#a0a6ad;--code-bg:#0b0e13;--code-fg:#e6edf3;
}
*{box-sizing:border-box}
body{font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo",sans-serif;margin:0;color:var(--text);background:var(--bg)}
header.report{background:var(--primary);color:#fff;padding:22px 28px;position:relative}
header.report h1{margin:0 0 4px;font-size:21px}header.report .meta{font-size:12px;opacity:.92}
.theme-toggle{position:absolute;top:18px;right:24px;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:6px 14px;font-size:12px;cursor:pointer}
.theme-toggle:hover{background:rgba(255,255,255,.3)}
.wrap{max-width:1180px;margin:0 auto;padding:22px}
.planline{color:var(--text-sub);font-size:13px;margin:0 0 18px}
.kpi-grid,.bd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 0 16px}
.bd-grid{margin-bottom:26px}
.kpi{background:var(--surface);border-radius:8px;padding:14px 16px 12px 18px;position:relative;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}
.kpi .lbl{font-size:12px;color:var(--text-sub)}.kpi .ico{position:absolute;top:12px;right:14px;font-size:18px}
.kpi .val{font-size:24px;font-weight:700;margin:6px 0 2px}.kpi .sub{font-size:11px;color:var(--grey)}
.bd{border-radius:8px;padding:12px 16px}
.bd .lbl{font-size:12px;color:var(--text-sub)}.bd .val{font-size:20px;font-weight:700}.bd .rate{font-size:11px;color:var(--grey)}
h2.sec{font-size:16px;border-bottom:2px solid var(--border);padding-bottom:6px;margin:30px 0 12px}
.qa-by{font-size:11px;color:var(--grey);margin-bottom:6px}
.qa-body,.fld-b{background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:10px 12px;font:12px/1.55 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-word;margin:0;color:var(--text)}
section.case{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:0 0 14px;margin:0 0 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);overflow:hidden}
.case-h{display:flex;align-items:center;gap:10px;padding:10px 16px}
.case-h .num{color:var(--grey);font-family:ui-monospace,Menlo,monospace}.case-h .ttl{font-weight:600;flex:1}
.chip{border-radius:12px;padding:2px 12px;font-size:11px;font-weight:700;white-space:nowrap;line-height:1.7}
.info-grid{display:flex;flex-wrap:wrap;gap:6px 22px;padding:12px 16px}
.info{font-size:12.5px}.info .ik{color:var(--grey);margin-right:6px}.info .iv{color:var(--text)}
.fld{padding:4px 16px 0}.fld-h{font-size:11px;color:var(--primary);font-weight:600;margin:10px 0 5px;text-transform:uppercase;letter-spacing:.04em}
footer.report{border-top:1px solid var(--border);margin-top:30px;padding:18px 28px;text-align:center;color:var(--grey);font-size:11px}
@media(max-width:760px){.kpi-grid,.bd-grid{grid-template-columns:repeat(2,1fr)}}
`;

export interface RenderOptions {
  rows: ReportRow[];
  summary?: ReportSummary;
  projectName?: string;
  theme?: "light" | "dark";
  title?: string;
  qaSummary?: string;
  qaSummaryUpdatedBy?: string;
  footerPrefix?: string;
  generatedAt?: string;
}

export const renderReportHtml = (opts: RenderOptions): string => {
  const rows = opts.rows || [];
  const summary = opts.summary || computeSummary(rows);
  const mode = opts.theme === "dark" ? "dark" : "light";
  const reportTitle = opts.title || "테스트 결과 리포트";
  const projectName = opts.projectName || "N/A";
  const generatedAt = opts.generatedAt || "";

  const kpiCards = [
    { label: "총 테스트", value: `${summary.total}건`, sub: "전체 케이스", accent: "info", icon: "📊" },
    { label: "실행률", value: summary.executionRate, sub: `${summary.executedCount}건 실행됨`, accent: "success", icon: "⚡" },
    { label: "성공률", value: summary.successRate, sub: `${summary.pass}건 통과됨`, accent: "warning", icon: "🎯" },
    { label: "JIRA 연동", value: `${summary.jiraLinked}건`, sub: "결함 및 티켓 링크", accent: "error", icon: "🔗" },
  ];
  const kpiHtml = kpiCards
    .map(
      (c) =>
        `<div class="kpi" style="--accent:var(--${c.accent})"><div class="ico">${c.icon}</div>` +
        `<div class="lbl">${esc(c.label)}</div><div class="val">${esc(c.value)}</div>` +
        `<div class="sub">${esc(c.sub)}</div></div>`,
    )
    .join("");

  const breakdowns: Array<{ type: ResultType; count: number; rate: string }> = [
    { type: "PASS", count: summary.pass, rate: summary.passRate },
    { type: "FAIL", count: summary.fail, rate: summary.failRate },
    { type: "BLOCKED", count: summary.blocked, rate: summary.blockedRate },
    { type: "NOT_RUN", count: summary.notRun, rate: summary.notRunRate },
  ];
  const bdHtml = breakdowns
    .map((b) => {
      const cfg = RESULT_CONFIG[b.type];
      return (
        `<div class="bd" style="background:${cfg.backgroundColor};border-left:4px solid ${cfg.color}">` +
        `<div class="lbl">${esc(cfg.label)}</div>` +
        `<div class="val" style="color:${cfg.color}">${b.count}건</div>` +
        `<div class="rate">${b.rate}</div></div>`
      );
    })
    .join("");

  const chip = (type: ResultType): string => {
    const cfg = RESULT_CONFIG[type];
    return (
      `<span class="chip" style="background:${cfg.backgroundColor};color:${cfg.color};` +
      `border:1px solid ${cfg.borderColor}">${esc(cfg.label)}</span>`
    );
  };

  const sections: Array<{ title: string; get: (r: ReportRow) => string }> = [
    { title: "사전조건", get: (r) => r.preCondition || "" },
    { title: "테스트 단계", get: (r) => formatSteps(r.steps) },
    { title: "예상결과", get: (r) => r.expectedResults || "" },
    { title: "비고", get: (r) => r.notes || "" },
  ];

  const entriesHtml = rows
    .map((r, index) => {
      const type = resolveResultType(r.result);
      const cfg = RESULT_CONFIG[type];
      const title = r.testCaseName || "N/A";
      const infoPairs = [
        { label: "폴더", value: r.folderPath || "-" },
        { label: "우선순위", value: r.priority || "-" },
        { label: "수행자", value: r.executorName || r.executedBy || "-" },
        { label: "수행일시", value: r.executedAt || "-" },
        { label: "JIRA ID", value: r.jiraIssueKey || "-" },
      ];
      const infoHtml = infoPairs
        .map(
          (p) =>
            `<div class="info"><span class="ik">${esc(p.label)}</span>` +
            `<span class="iv">${esc(p.value)}</span></div>`,
        )
        .join("");
      const secHtml = sections
        .map((s) => {
          const content = s.get(r);
          if (!content || content === "-") return "";
          return (
            `<div class="fld"><div class="fld-h">${esc(s.title)}</div>` +
            `<pre class="fld-b">${esc(content)}</pre></div>`
          );
        })
        .join("");
      return (
        `<section class="case"><div class="case-h" style="background:${cfg.backgroundColor};border-left:4px solid ${cfg.color}">` +
        `<span class="num">#${index + 1}</span><span class="ttl">${esc(title)}</span>${chip(type)}</div>` +
        `<div class="info-grid">${infoHtml}</div>${secHtml}</section>`
      );
    })
    .join("");

  const qaHtml =
    opts.qaSummary && opts.qaSummary.trim()
      ? `<h2 class="sec">💬 QA 총평</h2>` +
        (opts.qaSummaryUpdatedBy ? `<div class="qa-by">작성: ${esc(opts.qaSummaryUpdatedBy)}</div>` : "") +
        `<pre class="qa-body">${esc(opts.qaSummary)}</pre>`
      : "";

  const footerText =
    opts.footerPrefix && opts.footerPrefix.trim()
      ? `${esc(opts.footerPrefix.trim())} | Powered by TestCaseCraft`
      : "Generated by TestCaseCraft - Professional QA Reporting | Powered by TestCaseCraft";

  const themeScript =
    `<script>(function(){document.documentElement.setAttribute('data-theme','${mode}');` +
    `window.__t=function(){var c=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';` +
    `document.documentElement.setAttribute('data-theme',c);var b=document.getElementById('tb');` +
    `if(b)b.textContent=c==='dark'?'\\u2600\\uFE0F Light':'\\uD83C\\uDF19 Dark';};` +
    `document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('tb');` +
    `if(b)b.textContent='${mode}'==='dark'?'\\u2600\\uFE0F Light':'\\uD83C\\uDF19 Dark';});})();</script>`;

  return (
    `<!doctype html><html lang="ko"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${esc(reportTitle)} - ${esc(projectName)}</title>` +
    themeScript +
    `<style>${CSS}</style></head><body>` +
    `<header class="report"><button id="tb" class="theme-toggle" onclick="__t()"></button>` +
    `<h1>${esc(reportTitle)}</h1>` +
    `<div class="meta">프로젝트: ${esc(projectName)}` +
    (generatedAt ? ` &nbsp;|&nbsp; 생성일시: ${esc(generatedAt)}` : "") +
    `</div></header><div class="wrap">` +
    `<div class="planline">Plan: ${esc(summary.testPlanName || "-")} &nbsp;|&nbsp; 실행명: ${esc(summary.testExecutionName || "-")}</div>` +
    `<div class="kpi-grid">${kpiHtml}</div><div class="bd-grid">${bdHtml}</div>` +
    qaHtml +
    `<h2 class="sec">🔍 상세 테스트 결과 리스트</h2>${entriesHtml}` +
    `</div><footer class="report">${footerText}</footer></body></html>`
  );
};
