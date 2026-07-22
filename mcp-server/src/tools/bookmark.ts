import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

// 테스트케이스 즐겨찾기/개인 북마크 API (/api/bookmarks).
// 모든 응답은 현재 로그인 사용자 소유로 한정된다(개인 전용).

// --- Input Schemas ---
const ListCollectionsInput = z.object({
  projectId: z.string().min(1, "프로젝트 ID 필수"),
});

const CreateCollectionInput = z.object({
  projectId: z.string().min(1, "프로젝트 ID 필수"),
  name: z.string().min(1, "모음 이름 필수").max(100),
  description: z.string().max(500).optional(),
});

const UpdateCollectionInput = z.object({
  collectionId: z.string().min(1, "모음 ID 필수"),
  name: z.string().min(1, "모음 이름 필수").max(100),
  description: z.string().max(500).optional(),
});

const CollectionIdInput = z.object({
  collectionId: z.string().min(1, "모음 ID 필수"),
});

const AddItemInput = z.object({
  collectionId: z.string().min(1, "모음 ID 필수"),
  testCaseId: z.string().min(1, "테스트케이스 ID 필수"),
  note: z.string().max(1000).optional(),
});

const UpdateItemInput = z.object({
  itemId: z.string().min(1, "항목 ID 필수"),
  note: z.string().max(1000).optional(),
});

const ItemIdInput = z.object({
  itemId: z.string().min(1, "항목 ID 필수"),
});

const ToggleInput = z.object({
  testCaseId: z.string().min(1, "테스트케이스 ID 필수"),
  projectId: z.string().min(1, "프로젝트 ID 필수"),
});

const StatusInput = z.object({
  projectId: z.string().min(1, "프로젝트 ID 필수"),
});

// --- Tool Definitions ---
export const bookmarkTools: Tool[] = [
  {
    name: "bookmark_list_collections",
    description:
      "내 북마크 모음(즐겨찾기 플레이리스트) 목록을 프로젝트별로 조회한다. " +
      "'내 북마크 모음', '즐겨찾기 목록' 같은 요청 시 사용. GET /api/bookmarks/collections",
    inputSchema: zodToJsonSchema(ListCollectionsInput) as any,
  },
  {
    name: "bookmark_create_collection",
    description:
      "북마크 모음을 생성한다. 'ㅇㅇ 이름으로 북마크 모음 만들어' 같은 요청 시 사용. " +
      "POST /api/bookmarks/collections",
    inputSchema: zodToJsonSchema(CreateCollectionInput) as any,
  },
  {
    name: "bookmark_update_collection",
    description:
      "북마크 모음의 이름/설명을 수정한다. PUT /api/bookmarks/collections/{collectionId}",
    inputSchema: zodToJsonSchema(UpdateCollectionInput) as any,
  },
  {
    name: "bookmark_delete_collection",
    description:
      "북마크 모음을 삭제한다(기본 모음은 삭제 불가). DELETE /api/bookmarks/collections/{collectionId}",
    inputSchema: zodToJsonSchema(CollectionIdInput) as any,
  },
  {
    name: "bookmark_list_items",
    description:
      "모음 안의 북마크된 케이스 목록(읽기 전용 요약)을 조회한다. " +
      "GET /api/bookmarks/collections/{collectionId}/items",
    inputSchema: zodToJsonSchema(CollectionIdInput) as any,
  },
  {
    name: "bookmark_add_item",
    description:
      "모음에 테스트케이스를 추가한다(선택 메모 포함). POST /api/bookmarks/collections/{collectionId}/items",
    inputSchema: zodToJsonSchema(AddItemInput) as any,
  },
  {
    name: "bookmark_update_item",
    description:
      "북마크 항목의 메모를 수정한다. PUT /api/bookmarks/items/{itemId}",
    inputSchema: zodToJsonSchema(UpdateItemInput) as any,
  },
  {
    name: "bookmark_delete_item",
    description:
      "모음에서 북마크 항목을 제거한다. DELETE /api/bookmarks/items/{itemId}",
    inputSchema: zodToJsonSchema(ItemIdInput) as any,
  },
  {
    name: "bookmark_toggle_favorite",
    description:
      "테스트케이스의 기본 모음 즐겨찾기(별 버튼)를 토글한다. 토글 후 상태를 반환한다. " +
      "'TC 즐겨찾기 켜/꺼', '별 표시 토글' 같은 요청 시 사용. POST /api/bookmarks/testcases/{testCaseId}/toggle",
    inputSchema: zodToJsonSchema(ToggleInput) as any,
  },
  {
    name: "bookmark_status",
    description:
      "프로젝트 내 케이스들의 즐겨찾기 상태 map(testCaseId → bookmarked)을 조회한다. " +
      "GET /api/bookmarks/status",
    inputSchema: zodToJsonSchema(StatusInput) as any,
  },
];

// --- Handlers ---
export const bookmarkHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  bookmark_list_collections: async (args: unknown) => {
    const input = ListCollectionsInput.parse(args);
    const res = await httpClient.get("/api/bookmarks/collections", {
      params: { projectId: input.projectId },
    });
    return res.data;
  },

  bookmark_create_collection: async (args: unknown) => {
    const input = CreateCollectionInput.parse(args);
    const res = await httpClient.post("/api/bookmarks/collections", {
      projectId: input.projectId,
      name: input.name,
      description: input.description,
    });
    return res.data;
  },

  bookmark_update_collection: async (args: unknown) => {
    const input = UpdateCollectionInput.parse(args);
    const res = await httpClient.put(
      `/api/bookmarks/collections/${encodeURIComponent(input.collectionId)}`,
      { name: input.name, description: input.description },
    );
    return res.data;
  },

  bookmark_delete_collection: async (args: unknown) => {
    const input = CollectionIdInput.parse(args);
    await httpClient.delete(
      `/api/bookmarks/collections/${encodeURIComponent(input.collectionId)}`,
    );
    return { success: true, collectionId: input.collectionId };
  },

  bookmark_list_items: async (args: unknown) => {
    const input = CollectionIdInput.parse(args);
    const res = await httpClient.get(
      `/api/bookmarks/collections/${encodeURIComponent(input.collectionId)}/items`,
    );
    return res.data;
  },

  bookmark_add_item: async (args: unknown) => {
    const input = AddItemInput.parse(args);
    const res = await httpClient.post(
      `/api/bookmarks/collections/${encodeURIComponent(input.collectionId)}/items`,
      { testCaseId: input.testCaseId, note: input.note },
    );
    return res.data;
  },

  bookmark_update_item: async (args: unknown) => {
    const input = UpdateItemInput.parse(args);
    const res = await httpClient.put(
      `/api/bookmarks/items/${encodeURIComponent(input.itemId)}`,
      { note: input.note },
    );
    return res.data;
  },

  bookmark_delete_item: async (args: unknown) => {
    const input = ItemIdInput.parse(args);
    await httpClient.delete(
      `/api/bookmarks/items/${encodeURIComponent(input.itemId)}`,
    );
    return { success: true, itemId: input.itemId };
  },

  bookmark_toggle_favorite: async (args: unknown) => {
    const input = ToggleInput.parse(args);
    const res = await httpClient.post(
      `/api/bookmarks/testcases/${encodeURIComponent(input.testCaseId)}/toggle`,
      null,
      { params: { projectId: input.projectId } },
    );
    return res.data;
  },

  bookmark_status: async (args: unknown) => {
    const input = StatusInput.parse(args);
    const res = await httpClient.get("/api/bookmarks/status", {
      params: { projectId: input.projectId },
    });
    return res.data;
  },
};
