# MCP Server Boilerplate (testcasecraft)

`testcasecraft-mcp-tools` 스킬에서 분리한 코드 보일러플레이트 모음. SKILL.md의 워크플로우/결정 가이드를 따른 후, 실제 파일을 만들 때 이 reference의 템플릿을 그대로 복사하거나 적용한다.

## 목차

- [package.json](#packagejson)
- [tsconfig.json](#tsconfigjson)
- [src/index.ts (서버 엔트리)](#srcindexts-서버-엔트리)
- [src/http-client.ts](#srchttp-clientts)
- [src/errors.ts](#srcerrorsts)

## package.json

```json
{
  "name": "testcasecraft-mcp",
  "version": "0.1.0",
  "description": "MCP server for testcasecraft",
  "type": "module",
  "bin": { "testcasecraft-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.7.0",
    "form-data": "^4.0.0",
    "zod": "^3.23.0",
    "zod-to-json-schema": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0"
  }
}
```

> `form-data`는 axios의 transitive deps이지만 multipart 도구를 직접 사용하므로 명시 선언한다.

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": false
  },
  "include": ["src/**/*"]
}
```

## src/index.ts (서버 엔트리)

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { authTools, authHandlers } from "./tools/auth.js";
import { projectTools, projectHandlers } from "./tools/project.js";
import { testcaseTools, testcaseHandlers } from "./tools/testcase.js";
// ... import 다른 도구 그룹

const allTools = [
  ...authTools,
  ...projectTools,
  ...testcaseTools,
  // ...
];

const allHandlers: Record<string, (args: unknown) => Promise<unknown>> = {
  ...authHandlers,
  ...projectHandlers,
  ...testcaseHandlers,
  // ...
};

const server = new Server(
  { name: "testcasecraft-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const handler = allHandlers[name];
  if (!handler) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
  try {
    const result = await handler(args ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return formatError(err);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[testcasecraft-mcp] started");
```

## src/http-client.ts

```typescript
import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "./token-store.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.TESTCASECRAFT_BASE_URL ?? "http://localhost:8080";

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

httpClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && !config.url?.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const data = err.response?.data as any;
    if (status === 401) {
      await clearToken();
      throw new McpError(
        ErrorCode.InvalidRequest,
        "로그인이 필요합니다. auth_login 도구를 먼저 호출하세요.",
      );
    }
    if (status === 403) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "권한이 부족합니다. 관리자 권한이 필요한 작업일 수 있습니다.",
      );
    }
    if (status === 404) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `요청한 리소스를 찾을 수 없습니다: ${data?.message ?? err.config?.url}`,
      );
    }
    if (status === 422 || status === 400) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `입력 검증 실패: ${data?.message ?? "필수 필드 누락 또는 형식 오류"}`,
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `백엔드 호출 실패 [${status ?? "network"}]: ${data?.message ?? err.message}`,
    );
  },
);
```

## src/errors.ts

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function formatError(err: unknown) {
  if (err instanceof McpError) {
    return {
      content: [{ type: "text", text: err.message }],
      isError: true,
    };
  }
  if (err instanceof z.ZodError) {
    return {
      content: [
        {
          type: "text",
          text: `입력 검증 실패:\n${err.errors
            .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
            .join("\n")}`,
        },
      ],
      isError: true,
    };
  }
  return {
    content: [{ type: "text", text: `예외: ${(err as Error).message}` }],
    isError: true,
  };
}
```

`errors.ts`의 `formatError`는 `auth_login` 같은 도구가 인터셉터를 우회하여 axios 에러를 직접 던질 때도 사용자에게 일관된 메시지를 전달하기 위해 `isAxiosError` 분기를 포함할 수 있다. 실제 코드는 `mcp-server/src/errors.ts` 참조.
