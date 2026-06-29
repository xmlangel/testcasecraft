import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  testplanId: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
});

const GetInput = z.object({
  id: z.string().min(1, "테스트실행 ID 필수"),
});

const RecordResultInput = z.object({
  id: z.string().min(1, "테스트실행 ID 필수"),
  testcaseId: z.string().min(1, "테스트케이스 ID 필수"),
  result: z.enum(["PASS", "FAIL", "SKIP", "BLOCKED"]),
  comment: z.string().optional(),
  executedBy: z.string().optional(),
  executionTime: z.number().optional(),
});

// --- Tool Definitions ---
export const testexecutionTools: Tool[] = [
  {
    name: "testexecution_list",
    description:
      "테스트 실행 목록을 조회한다. '테스트실행 목록', '테스트 실행 현황' 같은 요청 시 사용. " +
      "testplanId나 status로 필터 가능.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testexecution_get",
    description:
      "단일 테스트 실행의 상세 정보를 ID로 조회한다. 'RUN-123 상세정보' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "testexecution_record_result",
    description:
      "테스트 케이스의 실행 결과를 기록한다. 'PASS', 'FAIL' 등의 결과를 지정. " +
      "'테스트 결과 기록', 'TC-123 통과 표시' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(RecordResultInput) as any,
  },
];

// --- Handlers ---
export const testexecutionHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testexecution_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/test-executions", {
      params: {
        limit: input.limit,
        page: input.page,
        testplanId: input.testplanId,
        status: input.status,
      },
    });
    return res.data;
  },

  testexecution_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/test-executions/${input.id}`);
    return res.data;
  },

  testexecution_record_result: async (args: unknown) => {
    const input = RecordResultInput.parse(args);
    // 백엔드 TestResultDto 필드명: testCaseId / result / notes / executedBy
    const res = await httpClient.post(
      `/api/test-executions/${input.id}/results`,
      {
        testCaseId: input.testcaseId,
        result: input.result,
        notes: input.comment,
        executedBy: input.executedBy,
      },
    );
    return res.data;
  },
};
