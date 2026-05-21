import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { httpClient } from "../http-client.js";

const TestStepInput = z.object({
  stepNumber: z.number().int().min(1).optional(),
  description: z.string().min(1, "단계 설명 필수").max(10000),
  expectedResult: z.string().max(10000).optional(),
});

const ListInput = z.object({
  projectId: z.string().min(1, "프로젝트 ID는 UUID 문자열입니다"),
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  search: z.string().optional(),
});

const GetInput = z.object({
  id: z.string().min(1, "테스트케이스 ID 필수"),
});

const SearchInput = z.object({
  query: z.string().min(1, "검색어 필수"),
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
});

const CreateOrUpdateInput = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, "프로젝트 ID 필수"),
  name: z.string().min(1, "테스트케이스 이름 필수").max(200),
  type: z.string().max(20).optional(),
  description: z.string().max(10000).optional(),
  preCondition: z.string().max(10000).optional(),
  postCondition: z.string().max(10000).optional(),
  parentId: z.string().optional(),
  parentName: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  isAutomated: z.boolean().optional(),
  executionType: z.string().max(50).optional(),
  testTechnique: z.string().max(10000).optional(),
  steps: z.array(TestStepInput).max(100).optional(),
  expectedResults: z.string().max(10000).optional(),
  tags: z.array(z.string()).max(50).optional(),
});

const MoveInput = z.object({
  id: z.string().min(1, "테스트케이스 ID 필수"),
  parentId: z.string().min(1, "상위 항목 ID 필수"),
});

const VersionsInput = z.object({
  id: z.string().min(1, "테스트케이스 ID 필수"),
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
});

export const testcaseTools: Tool[] = [
  {
    name: "testcase_list",
    description:
      "프로젝트의 테스트 케이스 목록을 조회한다. '테스트케이스 목록', '프로젝트 X의 TC' 같은 요청 시 사용. " +
      "projectId는 UUID 문자열. search로 필터 가능.",
    inputSchema: zodToJsonSchema(ListInput) as any,
  },
  {
    name: "testcase_get",
    description:
      "단일 테스트 케이스의 상세 정보를 ID로 조회한다. 'TC-123 상세정보', '테스트케이스 456' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(GetInput) as any,
  },
  {
    name: "testcase_search",
    description:
      "전체 테스트 케이스를 검색어로 검색한다. '로그인 관련 테스트케이스', 'API 테스트 검색' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(SearchInput) as any,
  },
  {
    name: "testcase_create_or_update",
    description:
      "테스트 케이스를 생성하거나 수정한다. id 없으면 생성(POST /api/testcases), id 있으면 수정(PUT /api/testcases/{id}). " +
      "필수: projectId(UUID), name. " +
      "지원 필드: description, preCondition, postCondition, parentId, priority(LOW|MEDIUM|HIGH), " +
      "isAutomated, executionType, testTechnique, steps(action·expectedResult), expectedResults, type, tags.",
    inputSchema: zodToJsonSchema(CreateOrUpdateInput) as any,
  },
  {
    name: "testcase_move",
    description:
      "테스트 케이스를 다른 계층 위치로 이동한다. '테스트케이스 이동', 'TC를 폴더로 이동' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(MoveInput) as any,
  },
  {
    name: "testcase_versions",
    description:
      "테스트 케이스의 버전 히스토리를 조회한다. '테스트케이스 변경 이력', 'TC 버전 보기' 같은 요청 시 사용.",
    inputSchema: zodToJsonSchema(VersionsInput) as any,
  },
];

export const testcaseHandlers: Record<
  string,
  (args: unknown) => Promise<Record<string, unknown>>
> = {
  testcase_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get(
      `/api/testcases/project/${input.projectId}`,
      {
        params: {
          limit: input.limit,
          page: input.page,
          search: input.search,
        },
      },
    );
    return { items: res.data };
  },

  testcase_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/testcases/${input.id}`);
    return res.data;
  },

  testcase_search: async (args: unknown) => {
    const input = SearchInput.parse(args);
    const res = await httpClient.get("/api/testcases/search", {
      params: {
        query: input.query,
        limit: input.limit,
        page: input.page,
      },
    });
    return res.data;
  },

  testcase_create_or_update: async (args: unknown) => {
    const input = CreateOrUpdateInput.parse(args);
    if (input.id) {
      const { id, ...body } = input;
      const res = await httpClient.put(`/api/testcases/${id}`, body);
      return res.data;
    } else {
      const res = await httpClient.post("/api/testcases", input);
      return res.data;
    }
  },

  testcase_move: async (args: unknown) => {
    const input = MoveInput.parse(args);
    const res = await httpClient.post(`/api/testcases/${input.id}/move`, {
      parentId: input.parentId,
    });
    return res.data;
  },

  testcase_versions: async (args: unknown) => {
    const input = VersionsInput.parse(args);
    const res = await httpClient.get(`/api/testcases/${input.id}/versions`, {
      params: {
        limit: input.limit,
        page: input.page,
      },
    });
    return res.data;
  },
};
