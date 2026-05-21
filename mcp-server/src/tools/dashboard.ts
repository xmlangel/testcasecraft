import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const OverviewInput = z.object({}).strict();

const ByProjectInput = z.object({
  id: z.string().min(1, "프로젝트 ID 필수"),
});

const MetricsInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectId: z.string().optional(),
});

// --- Tool Definitions ---
export const dashboardTools: Tool[] = [
  {
    name: "dashboard_overview",
    description:
      "대시보드 개요를 조회한다. '대시보드', '전체 현황', '통계' 같은 요청 시 사용. " +
      "시스템 전체의 테스트 실행 현황을 보여줌.",
    inputSchema: zodToJsonSchema(OverviewInput) as any,
  },
  {
    name: "dashboard_by_project",
    description:
      "특정 프로젝트의 대시보드 정보를 조회한다. 'ICT-138 대시보드', '프로젝트 현황' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ByProjectInput) as any,
  },
  {
    name: "dashboard_test_metrics",
    description:
      "테스트 메트릭 및 통계를 조회한다. '테스트 메트릭', '성공률 통계' 같은 요청 시 사용. " +
      "날짜 범위로 필터 가능.",
    inputSchema: zodToJsonSchema(MetricsInput) as any,
  },
];

// --- Handlers ---
export const dashboardHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  dashboard_overview: async () => {
    const res = await httpClient.get("/api/dashboard");
    return res.data;
  },

  dashboard_by_project: async (args: unknown) => {
    const input = ByProjectInput.parse(args);
    const res = await httpClient.get(`/api/dashboard/projects/${input.id}`);
    return res.data;
  },

  dashboard_test_metrics: async (args: unknown) => {
    const input = MetricsInput.parse(args);
    const res = await httpClient.get("/api/dashboard/metrics", {
      params: {
        startDate: input.startDate,
        endDate: input.endDate,
        projectId: input.projectId,
      },
    });
    return res.data;
  },
};
