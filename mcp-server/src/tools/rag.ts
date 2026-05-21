import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// --- Input Schemas ---
const ChatInput = z.object({
  message: z.string().min(1, "메시지 필수"),
  conversationId: z.string().optional(),
  context: z.string().optional(),
});

const ListConversationsInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
});

const GetConversationInput = z.object({
  id: z.string().min(1, "대화 ID 필수"),
});

// --- Tool Definitions ---
export const ragTools: Tool[] = [
  {
    name: "rag_chat",
    description:
      "RAG 기반 채팅으로 testcasecraft에 대한 질문을 한다. '테스트케이스 만드는 방법', 'API 설명' 같은 요청 시 사용. " +
      "대화 이력을 참고하여 답변.",
    inputSchema: zodToJsonSchema(ChatInput) as any,
  },
  {
    name: "rag_list_conversations",
    description:
      "기존 RAG 대화 목록을 조회한다. '대화 목록', '이전 질문들' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(ListConversationsInput) as any,
  },
  {
    name: "rag_get_conversation",
    description:
      "특정 RAG 대화의 상세 내용을 조회한다. '대화 123번', '이전 질문 조회' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetConversationInput) as any,
  },
];

// --- Handlers ---
export const ragHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  rag_chat: async (args: unknown) => {
    const input = ChatInput.parse(args);
    const res = await httpClient.post("/api/rag/chat", {
      message: input.message,
      conversationId: input.conversationId,
      context: input.context,
    });
    return res.data;
  },

  rag_list_conversations: async (args: unknown) => {
    const input = ListConversationsInput.parse(args);
    const res = await httpClient.get("/api/rag/conversations", {
      params: {
        limit: input.limit,
        page: input.page,
      },
    });
    return res.data;
  },

  rag_get_conversation: async (args: unknown) => {
    const input = GetConversationInput.parse(args);
    const res = await httpClient.get(`/api/rag/conversations/${input.id}`);
    return res.data;
  },
};
