import { z } from "zod";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";
import {
  renderReportHtml,
  computeSummary,
  type ReportRow,
} from "../report-html.js";

// --- Input Schemas ---
const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  testexecutionId: z.string().optional(),
  status: z.enum(["PASS", "FAIL", "SKIP", "BLOCKED"]).optional(),
});

const GetInput = z.object({
  id: z.string().min(1, "테스트결과 ID 필수"),
});

const ReportGetInput = z.object({
  id: z.string().min(1, "테스트결과 리포트 ID 필수"),
});

const ReportHtmlInput = z.object({
  testExecutionId: z.string().min(1, "테스트 실행 ID 필수"),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  theme: z.enum(["light", "dark"]).default("light"),
  title: z.string().optional(),
  footerPrefix: z.string().optional(),
  size: z.number().int().min(1).max(2000).default(500),
  outputPath: z
    .string()
    .optional()
    .describe("저장할 .html 절대경로. 생략 시 OS 임시폴더에 자동 생성."),
});

// --- Tool Definitions ---
export const testresultTools: Tool[] = [
  {
    name: "testresult_list",
    description:
      "테스트 결과 목록을 조회한다. '테스트결과 목록', '테스트 결과 보기' 같은 요청 시 사용. " +
      "testexecutionId나 status로 필터 가능.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testresult_get",
    description:
      "단일 테스트 결과의 상세 정보를 ID로 조회한다. '테스트결과 123 상세' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "testresult_report_get",
    description:
      "테스트 결과 리포트를 ID로 조회한다. '테스트 리포트 조회', '결과 리포트' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ReportGetInput) as any,
  },
  {
    name: "testresult_report_html",
    description:
      "테스트 실행(testExecutionId)의 결과를 앱 '테스트 결과 리포트'와 동일한 스타일의 HTML 파일로 내보낸다. " +
      "KPI 카드·상태 브레이크다운·결과 분류 색상 칩(성공/실패/차단됨/미실행)·라이트|다크 테마 포함. " +
      "파일로 저장하고 경로와 요약을 반환한다. " +
      "'결과 HTML 리포트 만들어줘', 'HTML로 내보내줘', '리포트 출력' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ReportHtmlInput) as any,
  },
];

// --- Handlers ---
export const testresultHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testresult_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    // 백엔드 실제 엔드포인트: GET /api/test-results/report (Spring Page → content)
    const res = await httpClient.get("/api/test-results/report", {
      params: {
        page: input.page,
        size: input.limit,
        testExecutionId: input.testexecutionId,
      },
    });
    const page = res.data as { content?: unknown[] } | unknown[];
    let rows = (Array.isArray(page) ? page : (page.content ?? [])) as Array<
      Record<string, unknown>
    >;
    if (input.status) {
      const want = input.status.toUpperCase();
      rows = rows.filter(
        (r) => String(r.result ?? "").toUpperCase() === want,
      );
    }
    return { total: rows.length, items: rows };
  },

  testresult_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/test-results/${input.id}`);
    return res.data;
  },

  testresult_report_get: async (args: unknown) => {
    const input = ReportGetInput.parse(args);
    const res = await httpClient.get(`/api/test-result-reports/${input.id}`);
    return res.data;
  },

  testresult_report_html: async (args: unknown) => {
    const input = ReportHtmlInput.parse(args);

    // 실행 결과 조회 (Spring Page → content)
    const res = await httpClient.get("/api/test-results/report", {
      params: {
        testExecutionId: input.testExecutionId,
        projectId: input.projectId,
        page: 0,
        size: input.size,
      },
    });
    const page = res.data as { content?: ReportRow[] } | ReportRow[];
    const rows: ReportRow[] = Array.isArray(page)
      ? page
      : (page.content ?? []);

    if (!rows.length) {
      throw new Error(
        `해당 실행(${input.testExecutionId})의 테스트 결과가 없습니다.`,
      );
    }

    const summary = computeSummary(rows);
    const projectName =
      input.projectName || summary.testExecutionName || input.projectId || "TestCaseCraft";
    const generatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");

    const html = renderReportHtml({
      rows,
      summary,
      projectName,
      theme: input.theme,
      title: input.title,
      footerPrefix: input.footerPrefix,
      generatedAt,
    });

    // 파일 저장
    const safeName = (summary.testExecutionName || input.testExecutionId)
      .replace(/[^\w가-힣.-]+/g, "_")
      .slice(0, 60);
    const stamp = generatedAt.replace(/[^\d]/g, "").slice(0, 12);
    const outPath =
      input.outputPath ||
      path.join(os.tmpdir(), `테스트결과_${safeName}_${stamp}.html`);
    await fs.writeFile(outPath, html, "utf-8");

    return {
      savedTo: outPath,
      bytes: Buffer.byteLength(html, "utf-8"),
      theme: input.theme,
      summary: {
        total: summary.total,
        pass: summary.pass,
        fail: summary.fail,
        blocked: summary.blocked,
        notRun: summary.notRun,
        skipped: summary.skipped,
        executionRate: summary.executionRate,
        successRate: summary.successRate,
        jiraLinked: summary.jiraLinked,
      },
      message: `HTML 리포트를 저장했습니다: ${outPath}`,
    };
  },
};
