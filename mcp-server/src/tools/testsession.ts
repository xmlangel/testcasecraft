import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
});

const GetInput = z.object({
  id: z.string().min(1, "테스트세션 ID 필수"),
});

// --- Tool Definitions ---
export const testsessionTools: Tool[] = [
  {
    name: "testsession_list",
    description:
      "테스트 세션 목록을 조회한다. '테스트세션 목록', '테스트 세션 현황' 같은 요청 시 사용. " +
      "status로 필터 가능.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testsession_get",
    description:
      "단일 테스트 세션의 상세 정보를 ID로 조회한다. 'SESSION-123 상세' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
];

// --- Handlers ---
export const testsessionHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testsession_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/test-sessions", {
      params: {
        limit: input.limit,
        page: input.page,
        status: input.status,
      },
    });
    return res.data;
  },

  testsession_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/test-sessions/${input.id}`);
    return res.data;
  },
};
