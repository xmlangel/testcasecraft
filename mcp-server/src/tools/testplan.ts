import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  search: z.string().optional(),
});

const GetInput = z.object({
  id: z.string().min(1, "테스트플랜 ID 필수"),
});

const CreateOrUpdateInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "테스트플랜 이름 필수"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]).optional(),
});

// --- Tool Definitions ---
export const testplanTools: Tool[] = [
  {
    name: "testplan_list",
    description:
      "테스트 플랜 목록을 조회한다. '테스트플랜 목록', '테스트플랜 보여줘' 같은 요청 시 사용. " +
      "search로 필터 가능.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testplan_get",
    description:
      "단일 테스트 플랜의 상세 정보를 ID로 조회한다. 'TP-123 상세정보' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "testplan_create_or_update",
    description:
      "테스트 플랜을 생성하거나 수정한다. id 없으면 생성(POST), id 있으면 수정(PUT). " +
      "'테스트플랜 만들어줘', 'TP-123 수정' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(CreateOrUpdateInput) as any,
  },
];

// --- Handlers ---
export const testplanHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testplan_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/testplans", {
      params: {
        limit: input.limit,
        page: input.page,
        search: input.search,
      },
    });
    return res.data;
  },

  testplan_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/testplans/${input.id}`);
    return res.data;
  },

  testplan_create_or_update: async (args: unknown) => {
    const input = CreateOrUpdateInput.parse(args);
    if (input.id) {
      // PUT: update
      const { id, ...body } = input;
      const res = await httpClient.put(`/api/testplans/${id}`, body);
      return res.data;
    } else {
      // POST: create
      const res = await httpClient.post("/api/testplans", input);
      return res.data;
    }
  },
};
