import { McpError, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";

interface McpResponse {
  content: TextContent[];
  isError: boolean;
}

interface ApiErrorBody {
  message?: string;
  error?: string;
  detail?: string;
}

function formatAxiosError(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;
  const data = err.response?.data as ApiErrorBody | undefined;
  const detail = data?.message ?? data?.error ?? data?.detail;

  if (!err.response) {
    return "백엔드에 연결할 수 없습니다. ./gradlew bootRun이 실행 중인지 확인하세요.";
  }
  if (status === 400 || status === 422) {
    return `입력 검증 실패: ${detail ?? "필수 필드 누락 또는 형식 오류"}`;
  }
  if (status === 401) {
    return "로그인이 필요합니다. auth_login 도구를 먼저 호출하세요.";
  }
  if (status === 403) {
    return "권한이 부족합니다. 관리자 권한이 필요한 작업일 수 있습니다.";
  }
  if (status === 404) {
    return `요청한 리소스를 찾을 수 없습니다: ${detail ?? err.config?.url ?? ""}`;
  }
  return `백엔드 호출 실패 [${status ?? "network"}]: ${detail ?? err.message}`;
}

export function formatError(err: unknown): McpResponse {
  if (err instanceof McpError) {
    return {
      content: [{ type: "text", text: err.message }],
      isError: true,
    };
  }

  if (err instanceof z.ZodError) {
    const errorList = err.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `입력 검증 실패:\n${errorList}`,
        },
      ],
      isError: true,
    };
  }

  const axiosMessage = formatAxiosError(err);
  if (axiosMessage !== null) {
    return {
      content: [{ type: "text", text: axiosMessage }],
      isError: true,
    };
  }

  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text", text: `예외: ${message || "알 수 없는 오류"}` }],
    isError: true,
  };
}
