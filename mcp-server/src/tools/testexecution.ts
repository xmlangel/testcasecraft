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
  // 백엔드 TestResultDto @Pattern: ^(PASS|FAIL|BLOCKED|NOT_RUN)$
  // SKIP 은 하위호환용으로 받되 핸들러에서 BLOCKED 로 매핑(글로벌 exec_record.py 선례).
  result: z.enum(["PASS", "FAIL", "BLOCKED", "NOT_RUN", "SKIP"]),
  comment: z.string().optional(),
  executedBy: z.string().optional(),
  executionTime: z.number().optional(),
});

const QaSummaryInput = z.object({
  id: z.string().min(1, "테스트실행 ID 필수"),
  qaSummary: z.string().max(10000, "QA 총평은 10,000자 이하").optional(),
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
      "테스트 케이스의 실행 결과를 기록한다. result: PASS|FAIL|BLOCKED|NOT_RUN. " +
      "(SKIP 도 받지만 백엔드 계약상 BLOCKED 로 자동 매핑된다.) " +
      "'테스트 결과 기록', 'TC-123 통과 표시' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(RecordResultInput) as any,
  },
  {
    name: "testexecution_update_qa_summary",
    description:
      "테스트 실행 단위의 QA 총평(마크다운, 최대 10,000자)을 저장/수정한다. " +
      "PUT /api/test-executions/{id}/qa-summary. '실행 QA 총평 작성', '이번 실행 총평 남겨줘' 같은 요청 시 사용. " +
      "qaSummary를 비우거나 생략하면 총평을 지운다.",
    inputSchema: zodToJsonSchema(QaSummaryInput) as any,
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
    const res = await httpClient.get(
      `/api/test-executions/${encodeURIComponent(input.id)}`,
    );
    return res.data;
  },

  testexecution_record_result: async (args: unknown) => {
    const input = RecordResultInput.parse(args);
    // 백엔드 TestResultDto 필드명: testCaseId / result / notes / executedBy
    // SKIP → BLOCKED 매핑(백엔드 enum 미지원 값 400 회피)
    const result = input.result === "SKIP" ? "BLOCKED" : input.result;
    const res = await httpClient.post(
      `/api/test-executions/${encodeURIComponent(input.id)}/results`,
      {
        testCaseId: input.testcaseId,
        result,
        notes: input.comment,
        executedBy: input.executedBy,
      },
    );
    return res.data;
  },

  testexecution_update_qa_summary: async (args: unknown) => {
    const input = QaSummaryInput.parse(args);
    const res = await httpClient.put(
      `/api/test-executions/${encodeURIComponent(input.id)}/qa-summary`,
      { qaSummary: input.qaSummary ?? "" },
    );
    return res.data;
  },
};
