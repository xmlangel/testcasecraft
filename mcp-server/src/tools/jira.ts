import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const StatusInput = z.object({}).strict();

const SyncInput = z.object({
  projectId: z.string().optional(),
});

const ListIssuesInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  projectId: z.string().optional(),
  status: z.string().optional(),
});

// --- Tool Definitions ---
export const jiraTools: Tool[] = [
  {
    name: "jira_status",
    description:
      "Jira 연동 상태를 확인한다. 'Jira 연결 상태', 'Jira 설정 확인' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(StatusInput) as any,
  },
  {
    name: "jira_sync",
    description:
      "Jira와의 동기화를 수행한다. '이슈 동기화', 'Jira 데이터 동기화' 같은 요청 시 사용. " +
      "projectId로 특정 프로젝트만 동기화 가능.",
    inputSchema: zodToJsonSchema(SyncInput) as any,
  },
  {
    name: "jira_list_issues",
    description:
      "Jira 이슈 목록을 조회한다. 'Jira 이슈', 'Jira 버그 목록' 같은 요청 시 사용. " +
      "projectId나 status로 필터 가능.",
    inputSchema: zodToJsonSchema(ListIssuesInput) as any,
  },
];

// --- Handlers ---
export const jiraHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  jira_status: async () => {
    const res = await httpClient.get("/api/jira/status");
    return res.data;
  },

  jira_sync: async (args: unknown) => {
    const input = SyncInput.parse(args);
    const res = await httpClient.post("/api/jira/integration/sync", {
      projectId: input.projectId,
    });
    return res.data;
  },

  jira_list_issues: async (args: unknown) => {
    const input = ListIssuesInput.parse(args);
    const res = await httpClient.get("/api/jira/issues", {
      params: {
        limit: input.limit,
        page: input.page,
        projectId: input.projectId,
        status: input.status,
      },
    });
    return res.data;
  },
};
