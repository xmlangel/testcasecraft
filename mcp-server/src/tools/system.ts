import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const HealthInput = z.object({}).strict();
const VersionInput = z.object({}).strict();
const ConfigInput = z.object({}).strict();

// --- Tool Definitions ---
export const systemTools: Tool[] = [
  {
    name: "system_health",
    description:
      "시스템 헬스 체크를 수행한다. '서버 상태', '시스템 헬스', '연결 확인' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(HealthInput) as any,
  },
  {
    name: "system_version",
    description:
      "testcasecraft 버전 정보를 조회한다. '버전 확인', '시스템 버전' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(VersionInput) as any,
  },
  {
    name: "system_config",
    description:
      "시스템 설정 정보를 조회한다. '시스템 설정', '설정 정보' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ConfigInput) as any,
  },
];

// --- Handlers ---
export const systemHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  system_health: async () => {
    const res = await httpClient.get("/api/monitoring/health");
    return res.data;
  },

  system_version: async () => {
    const res = await httpClient.get("/api/version");
    return res.data;
  },

  system_config: async () => {
    const res = await httpClient.get("/api/config");
    return res.data;
  },
};
