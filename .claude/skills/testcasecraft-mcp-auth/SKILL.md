---
name: testcasecraft-mcp-auth
description: JWT 기반 백엔드 API를 MCP로 노출할 때 인증 흐름을 구현하는 패턴. auth_login 도구, 토큰 파일 저장(~/.testcasecraft-mcp/token.json, 권한 0600), Axios 인터셉터로 자동 헤더 주입, 401 시 refreshToken 자동 갱신, Streamable HTTP 모드의 헤더 passthrough를 다룬다. mcp-implementer-agent가 인증 코드를 작성할 때 반드시 사용.
---

# MCP Auth Bridge

JWT 기반 REST API를 MCP에서 인증하는 표준 패턴. testcasecraft가 `/api/auth/login` → JWT 발급 → `Authorization: Bearer ...` 형태이므로 이 패턴이 그대로 적용됨.

## 토큰 저장 (Stdio 모드)

`~/.testcasecraft-mcp/token.json` 또는 환경변수 `TESTCASECRAFT_TOKEN_PATH` 위치에 저장. 파일 권한은 0600.

### src/token-store.ts

```typescript
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  username?: string;
}

const TOKEN_PATH =
  process.env.TESTCASECRAFT_TOKEN_PATH ??
  path.join(os.homedir(), ".testcasecraft-mcp", "token.json");

export async function saveToken(tokens: TokenSet): Promise<void> {
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true, mode: 0o700 });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), { mode: 0o600 });
}

export async function loadTokenSet(): Promise<TokenSet | null> {
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e: any) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

export async function getToken(): Promise<string | null> {
  const set = await loadTokenSet();
  return set?.accessToken ?? null;
}

export async function clearToken(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
  }
}
```

## 로그인 도구 (src/tools/auth.ts)

```typescript
import { z } from "zod";
import axios from "axios";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { saveToken, loadTokenSet, clearToken } from "../token-store.js";

const BASE_URL = process.env.TESTCASECRAFT_BASE_URL ?? "http://localhost:8080";

const LoginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const StatusInput = z.object({}).strict();

export const authTools: Tool[] = [
  {
    name: "auth_login",
    description:
      "testcasecraft에 로그인하여 JWT 토큰을 발급받고 로컬에 저장한다. " +
      "'로그인해줘', 'admin/admin123으로 접속해줘' 같은 요청 시 사용. " +
      "이후 다른 도구는 자동으로 이 토큰을 사용한다.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "사용자명" },
        password: { type: "string", description: "비밀번호" },
      },
      required: ["username", "password"],
    },
  },
  {
    name: "auth_status",
    description:
      "현재 MCP 서버의 로그인 상태와 토큰 만료 시각을 확인한다. " +
      "'로그인 됐어?', '로그인 상태 확인' 같은 요청 시 사용.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "auth_logout",
    description:
      "저장된 토큰을 삭제하여 로그아웃한다. '로그아웃해줘' 요청 시 사용.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

export const authHandlers = {
  auth_login: async (args: unknown) => {
    const { username, password } = LoginInput.parse(args);
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      username,
      password,
    });
    // 응답 형식은 실제 AuthController 응답에 맞춰 조정
    const accessToken = res.data.accessToken ?? res.data.token;
    const refreshToken = res.data.refreshToken;
    const expiresAt = res.data.expiresIn
      ? Date.now() + res.data.expiresIn * 1000
      : undefined;
    await saveToken({ accessToken, refreshToken, expiresAt, username });
    return { ok: true, username };
  },

  auth_status: async () => {
    const set = await loadTokenSet();
    if (!set) return { loggedIn: false };
    const expiresAt = set.expiresAt;
    const isExpired = expiresAt ? Date.now() > expiresAt : false;
    return {
      loggedIn: true,
      username: set.username,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isExpired,
    };
  },

  auth_logout: async () => {
    await clearToken();
    return { ok: true };
  },
};
```

## 자동 토큰 주입 (Axios 인터셉터)

`src/http-client.ts`의 request 인터셉터에서:

```typescript
httpClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  // /auth/login, /auth/refresh는 토큰 없이 호출
  const skipAuth =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh");
  if (token && !skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 401 시 자동 갱신 (refreshToken)

```typescript
let isRefreshing = false;
let waiters: Array<() => void> = [];

httpClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original = err.config;
    if (status === 401 && original && !original.headers["X-Retried"]) {
      const tokens = await loadTokenSet();
      if (!tokens?.refreshToken) {
        await clearToken();
        throw new McpError(
          ErrorCode.InvalidRequest,
          "로그인이 만료되었습니다. auth_login 도구를 다시 호출하세요.",
        );
      }
      // 동시 호출 시 단일 refresh
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const r = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          await saveToken({
            accessToken: r.data.accessToken,
            refreshToken: r.data.refreshToken ?? tokens.refreshToken,
            expiresAt: r.data.expiresIn
              ? Date.now() + r.data.expiresIn * 1000
              : undefined,
            username: tokens.username,
          });
        } catch {
          await clearToken();
          throw new McpError(
            ErrorCode.InvalidRequest,
            "토큰 갱신 실패. auth_login으로 다시 로그인하세요.",
          );
        } finally {
          isRefreshing = false;
          waiters.forEach((w) => w());
          waiters = [];
        }
      } else {
        await new Promise<void>((resolve) => waiters.push(resolve));
      }
      // 원 요청 재시도
      original.headers["X-Retried"] = "1";
      return httpClient.request(original);
    }
    throw err;
  },
);
```

## Streamable HTTP 모드 (Phase 2)

이 모드에서는 토큰을 로컬에 저장하지 않는다. 클라이언트가 MCP 호출 시 Authorization 헤더로 토큰을 전달하면 MCP가 그대로 백엔드에 passthrough.

```typescript
// HTTP 모드 핸들러에서 context.headers를 읽어 백엔드로 전달
const upstream = req.headers["authorization"];
const res = await axios.get(`${BASE_URL}/api/...`, {
  headers: upstream ? { Authorization: upstream } : {},
});
```

## 응답 형식 매핑 (testcasecraft 특화)

testcasecraft의 `AuthController.login` 응답 형식을 실제로 확인해야 한다. 일반적 형식:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600,
  "user": { "id": 1, "username": "admin", "role": "ADMIN" }
}
```

실제 응답이 `{ "token": "...", "tokenType": "Bearer" }` 같은 형식이면 매핑 조정.

## 보안 고려사항

- 토큰 파일은 0600 권한, 디렉토리는 0700
- 환경변수로 토큰 위치 변경 가능 (`TESTCASECRAFT_TOKEN_PATH`)
- 로그에 토큰 출력 금지 — `console.error`에 토큰 내용 들어가지 않게
- HTTP 모드에서는 TLS 필수 (자체 서명 인증서라도)

## 사용자 시나리오 (FAQ)

**Q. 사용자가 매번 로그인해야 하나?**
A. Stdio 모드에서는 토큰이 디스크에 저장되므로 만료 전까지 자동 사용. 만료 후엔 refreshToken으로 자동 갱신. refreshToken까지 만료되면 재로그인.

**Q. 토큰을 깜빡 노출했다?**
A. `auth_logout` 호출 후 백엔드에서 해당 사용자의 토큰 무효화. 토큰 파일도 삭제됨.

**Q. 멀티 유저 환경에서는?**
A. Phase 2 HTTP 모드 사용. MCP는 사용자 토큰을 저장하지 않고 헤더로 받아 백엔드에 전달.
