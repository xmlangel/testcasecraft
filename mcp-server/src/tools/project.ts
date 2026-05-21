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
  id: z.string().min(1, "프로젝트 ID 필수"),
});

const CreateOrUpdateInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "프로젝트 이름 필수"),
  description: z.string().optional(),
  key: z.string().optional(),
});

const MembersInput = z.object({
  id: z.string().min(1, "프로젝트 ID 필수"),
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
});

// --- Tool Definitions ---
export const projectTools: Tool[] = [
  {
    name: "project_list",
    description:
      "모든 프로젝트 목록을 조회한다. '프로젝트 목록', '프로젝트 보여줘', 'ICT 프로젝트' 같은 요청 시 사용. " +
      "limit/page로 페이지네이션.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "project_get",
    description:
      "단일 프로젝트의 상세 정보를 ID로 조회한다. '프로젝트 123번 상세', 'ICT-1 프로젝트 정보' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "project_create_or_update",
    description:
      "프로젝트를 생성하거나 수정한다. id 없으면 생성(POST), id 있으면 수정(PUT). " +
      "'프로젝트 만들어줘', '프로젝트 이름 변경' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(CreateOrUpdateInput) as any,
  },
  {
    name: "project_members",
    description:
      "프로젝트의 멤버 목록을 조회한다. '프로젝트 123의 팀원', 'ICT 프로젝트 멤버' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(MembersInput) as any,
  },
];

// --- Handlers ---
export const projectHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  project_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/projects", {
      params: {
        limit: input.limit,
        page: input.page,
        search: input.search,
      },
    });
    return res.data;
  },

  project_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/projects/${input.id}`);
    return res.data;
  },

  project_create_or_update: async (args: unknown) => {
    const input = CreateOrUpdateInput.parse(args);
    if (input.id) {
      // PUT: update existing
      const { id, ...body } = input;
      const res = await httpClient.put(`/api/projects/${id}`, body);
      return res.data;
    } else {
      // POST: create new
      const res = await httpClient.post("/api/projects", input);
      return res.data;
    }
  },

  project_members: async (args: unknown) => {
    const input = MembersInput.parse(args);
    const res = await httpClient.get(`/api/projects/${input.id}/members`, {
      params: {
        limit: input.limit,
        page: input.page,
      },
    });
    return res.data;
  },
};
