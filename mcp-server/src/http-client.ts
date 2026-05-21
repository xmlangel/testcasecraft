import axios, { AxiosError, AxiosInstance } from "axios";
import {
  getToken,
  clearToken,
  loadTokenSet,
  saveToken,
} from "./token-store.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.TESTCASECRAFT_BASE_URL ?? "http://localhost:8080";
const TIMEOUT_MS = parseInt(
  process.env.TESTCASECRAFT_TIMEOUT_MS ?? "30000",
  10,
);

let isRefreshing = false;
let waiters: Array<() => void> = [];

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
});

// Request interceptor: automatically inject token
httpClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  const skipAuth =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh");

  if (token && !skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and refresh token
httpClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const data = err.response?.data as any;
    const original = err.config;

    // Handle 401 with automatic refresh
    if (status === 401 && original && !original.headers["X-Retried"]) {
      const tokens = await loadTokenSet();
      if (!tokens?.refreshToken) {
        await clearToken();
        throw new McpError(
          ErrorCode.InvalidRequest,
          "로그인이 필요합니다. auth_login 도구를 호출하세요.",
        );
      }

      // Single refresh for concurrent requests
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const r = await axios.post(`${BASE_URL}/api/auth/refresh`, {
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
        // Wait for refresh
        await new Promise<void>((resolve) => waiters.push(resolve));
      }

      // Retry original request
      original.headers["X-Retried"] = "1";
      return httpClient.request(original);
    }

    // Handle other HTTP errors
    if (status === 400 || status === 422) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `입력 검증 실패: ${data?.message ?? "필수 필드 누락 또는 형식 오류"}`,
      );
    }

    if (status === 403) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "권한이 부족합니다. 관리자 권한이 필요할 수 있습니다.",
      );
    }

    if (status === 404) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `요청한 리소스를 찾을 수 없습니다: ${data?.message ?? original?.url}`,
      );
    }

    if (status === 500 || status === 502 || status === 503) {
      throw new McpError(
        ErrorCode.InternalError,
        `백엔드 오류 [${status}]: ${data?.message ?? "잠시 후 다시 시도하세요."}`,
      );
    }

    if (!status) {
      throw new McpError(
        ErrorCode.InternalError,
        `백엔드에 연결할 수 없습니다. ./gradlew bootRun이 실행 중인지 확인하세요.`,
      );
    }

    throw new McpError(
      ErrorCode.InternalError,
      `요청 실패 [${status}]: ${data?.message ?? err.message}`,
    );
  },
);

export default httpClient;
