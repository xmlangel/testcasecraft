import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { saveToken, loadTokenSet, clearToken } from "../token-store.js";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const LoginInput = z.object({
  username: z.string().min(1, "사용자명 필수"),
  password: z.string().min(1, "비밀번호 필수"),
});

const RefreshInput = z.object({}).strict();
const StatusInput = z.object({}).strict();
const LogoutInput = z.object({}).strict();

// --- Tool Definitions ---
export const authTools: Tool[] = [
  {
    name: "auth_login",
    description:
      "testcasecraft에 로그인하여 JWT 토큰을 발급받고 로컬에 저장한다. " +
      "'로그인해줘', 'admin/admin123으로 접속', '사용자명/비밀번호로 로그인' 같은 요청 시 사용. " +
      "이후 모든 도구는 자동으로 이 토큰을 사용한다.",
    inputSchema: zodToJsonSchema(LoginInput) as any,
  },
  {
    name: "auth_status",
    description:
      "현재 MCP 서버의 로그인 상태와 토큰 만료 시각을 확인한다. " +
      "'로그인 됐어?', '로그인 상태 확인', '토큰 확인' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(StatusInput) as any,
  },
  {
    name: "auth_logout",
    description:
      "저장된 토큰을 삭제하여 로그아웃한다. '로그아웃해줘', '세션 종료' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(LogoutInput) as any,
  },
  {
    name: "auth_refresh",
    description:
      "토큰을 수동으로 갱신한다. 일반적으로는 자동 갱신이 동작하지만, " +
      "명시적으로 '토큰 갱신', '재인증' 같은 요청 시 사용 가능.",
    inputSchema: zodToJsonSchema(RefreshInput) as any,
  },
];

// --- Handlers ---
export const authHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  auth_login: async (args: unknown) => {
    const { username, password } = LoginInput.parse(args);
    const res = await httpClient.post("/api/auth/login", {
      username,
      password,
    });

    const accessToken =
      res.data.accessToken ?? res.data.token ?? res.data.access_token;
    const refreshToken = res.data.refreshToken ?? res.data.refresh_token;
    const expiresAt = res.data.expiresIn
      ? Date.now() + res.data.expiresIn * 1000
      : res.data.accessTokenExpiration
        ? Date.now() + res.data.accessTokenExpiration
        : undefined;

    await saveToken({
      accessToken,
      refreshToken,
      expiresAt,
      username,
    });

    return {
      ok: true,
      username,
      message: `${username}로 로그인했습니다.`,
    };
  },

  auth_status: async () => {
    const set = await loadTokenSet();
    if (!set) {
      return {
        loggedIn: false,
        message: "로그인하지 않았습니다. auth_login 도구를 호출하세요.",
      };
    }

    const expiresAt = set.expiresAt;
    const isExpired = expiresAt ? Date.now() > expiresAt : false;

    return {
      loggedIn: true,
      username: set.username ?? "(알 수 없음)",
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isExpired,
      message: isExpired
        ? "토큰이 만료되었습니다. 자동 갱신을 시도합니다."
        : `${set.username}로 로그인된 상태입니다.`,
    };
  },

  auth_logout: async () => {
    await clearToken();
    return {
      ok: true,
      message: "로그아웃했습니다.",
    };
  },

  auth_refresh: async () => {
    const tokens = await loadTokenSet();
    if (!tokens?.refreshToken) {
      return {
        ok: false,
        message: "갱신 토큰이 없습니다. auth_login으로 다시 로그인하세요.",
      };
    }

    try {
      const r = await httpClient.post("/api/auth/refresh", {
        refreshToken: tokens.refreshToken,
      });

      const newAccessToken =
        r.data.accessToken ?? r.data.token ?? r.data.access_token;
      const expiresAt = r.data.expiresIn
        ? Date.now() + r.data.expiresIn * 1000
        : r.data.accessTokenExpiration
          ? Date.now() + r.data.accessTokenExpiration
          : undefined;

      await saveToken({
        accessToken: newAccessToken,
        refreshToken: r.data.refreshToken ?? tokens.refreshToken,
        expiresAt,
        username: tokens.username,
      });

      return {
        ok: true,
        message: "토큰을 갱신했습니다.",
      };
    } catch (err: any) {
      await clearToken();
      throw err;
    }
  },
};
