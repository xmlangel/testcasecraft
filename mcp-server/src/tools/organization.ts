import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
});

const GroupListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  organizationId: z.string().optional(),
});

const UserListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  search: z.string().optional(),
});

// --- Tool Definitions ---
export const organizationTools: Tool[] = [
  {
    name: "org_list_organizations",
    description:
      "모든 조직(Organization) 목록을 조회한다. '조직 목록', '회사/팀 보여줘' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "org_list_groups",
    description:
      "그룹(Group) 목록을 조회한다. '그룹 목록', '팀 그룹' 같은 요청 시 사용. " +
      "organizationId로 특정 조직 필터 가능.",
    inputSchema: zodToJsonSchema(GroupListInput) as any,
  },
  {
    name: "org_list_users",
    description:
      "사용자(User) 목록을 조회한다. '사용자 목록', '사용자 검색', '모든 사용자' 같은 요청 시 사용. " +
      "search로 이름/이메일 검색 가능.",
    inputSchema: zodToJsonSchema(UserListInput) as any,
  },
];

// --- Handlers ---
export const organizationHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  org_list_organizations: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get("/api/organizations", {
      params: {
        limit: input.limit,
        page: input.page,
      },
    });
    return res.data;
  },

  org_list_groups: async (args: unknown) => {
    const input = GroupListInput.parse(args);
    const res = await httpClient.get("/api/groups", {
      params: {
        limit: input.limit,
        page: input.page,
        organizationId: input.organizationId,
      },
    });
    return res.data;
  },

  org_list_users: async (args: unknown) => {
    const input = UserListInput.parse(args);
    const res = await httpClient.get("/api/users", {
      params: {
        limit: input.limit,
        page: input.page,
        search: input.search,
      },
    });
    return res.data;
  },
};
