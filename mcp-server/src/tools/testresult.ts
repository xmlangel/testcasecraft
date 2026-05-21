import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

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
];

// --- Handlers ---
export const testresultHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testresult_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/test-results", {
      params: {
        limit: input.limit,
        page: input.page,
        testexecutionId: input.testexecutionId,
        status: input.status,
      },
    });
    return res.data;
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
};
