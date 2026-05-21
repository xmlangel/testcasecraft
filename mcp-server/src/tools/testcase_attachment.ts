import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createReadStream, statSync, existsSync } from "node:fs";
import { basename } from "node:path";
import FormData from "form-data";
import { httpClient } from "../http-client.js";

const UploadInput = z.object({
  testCaseId: z.string().min(1, "testCaseId 필수 (UUID)"),
  filePath: z.string().min(1, "filePath 필수 (로컬 절대경로)"),
  description: z.string().max(2000).optional(),
});

const ListInput = z.object({
  testCaseId: z.string().min(1, "testCaseId 필수 (UUID)"),
});

const GetInput = z.object({
  attachmentId: z.string().min(1, "attachmentId 필수"),
});

const DeleteInput = z.object({
  attachmentId: z.string().min(1, "attachmentId 필수"),
});

export const testcaseAttachmentTools: Tool[] = [
  {
    name: "testcase_attachment_upload",
    description:
      "테스트 케이스에 파일을 첨부한다. POST multipart/form-data로 /api/testcase-attachments/upload/{testCaseId}. " +
      "긴 HTTP 응답·로그·스크린샷·증빙 파일을 본문 대신 첨부로 분리할 때 사용. " +
      "filePath는 로컬 절대 경로. 응답에 id, originalFileName, downloadUrl 등이 포함된다.",
    inputSchema: zodToJsonSchema(UploadInput) as any,
  },
  {
    name: "testcase_attachment_list",
    description:
      "테스트 케이스에 속한 첨부파일 목록을 조회한다. 'TC-xxx 첨부 보여줘', '첨부파일 목록' 같은 요청 시 사용. testCaseId 필수.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testcase_attachment_get",
    description:
      "단일 첨부파일의 메타데이터를 조회한다. 'attachment_id 정보' 같은 요청 시 사용. attachmentId 필수.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "testcase_attachment_delete",
    description:
      "첨부파일을 삭제한다. '첨부 X 삭제해줘' 같은 요청 시 사용. attachmentId 필수.",
    inputSchema: zodToJsonSchema(DeleteInput) as any,
  },
];

export const testcaseAttachmentHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testcase_attachment_upload: async (args: unknown) => {
    const input = UploadInput.parse(args);
    if (!existsSync(input.filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${input.filePath}`);
    }
    const stat = statSync(input.filePath);
    if (!stat.isFile()) {
      throw new Error(
        `디렉터리가 아닌 파일 경로여야 합니다: ${input.filePath}`,
      );
    }

    const form = new FormData();
    form.append("file", createReadStream(input.filePath), {
      filename: basename(input.filePath),
      knownLength: stat.size,
    });
    if (input.description) {
      form.append("description", input.description);
    }

    const res = await httpClient.post(
      `/api/testcase-attachments/upload/${input.testCaseId}`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );
    return res.data;
  },

  testcase_attachment_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get(
      `/api/testcase-attachments/testcase/${input.testCaseId}`,
    );
    return { items: res.data };
  },

  testcase_attachment_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(
      `/api/testcase-attachments/${input.attachmentId}`,
    );
    return res.data;
  },

  testcase_attachment_delete: async (args: unknown) => {
    const input = DeleteInput.parse(args);
    const res = await httpClient.delete(
      `/api/testcase-attachments/${input.attachmentId}`,
    );
    return res.data ?? { ok: true };
  },
};
