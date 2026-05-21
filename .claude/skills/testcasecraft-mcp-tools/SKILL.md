---
name: testcasecraft-mcp-tools
description: API 인벤토리 항목을 TypeScript MCP SDK(@modelcontextprotocol/sdk) tool 정의 + handler 코드로 변환하는 패턴. server.setRequestHandler(ListToolsRequestSchema/CallToolRequestSchema), Zod input schema, axios HTTP 호출, McpError 표준화, 응답 가공을 한 묶음으로 생성한다. mcp-server/ 디렉토리에 실제 빌드되는 TypeScript 코드를 작성할 때 반드시 사용.
---

# MCP Tool Generator

API 인벤토리(`_workspace/01_api_inventory.json`) + 아키텍처 결정(`_workspace/02_mcp_architecture.md`)을 받아 **실제 동작하는** TypeScript MCP 서버 코드를 생성한다.

## 기본 프로젝트 구조

```

> **Boilerplate 코드**(`package.json`, `tsconfig.json`, `src/index.ts`, `src/http-client.ts`, `src/errors.ts`)는 `references/server-boilerplate.md`에 별도 정리되어 있다. 새 MCP 서버를 만들 때 그 파일을 그대로 복사한 뒤, 아래의 도구 파일 패턴부터 채워 나간다.
mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
└── src/
    ├── index.ts           # MCP 서버 엔트리
    ├── auth.ts            # 인증 (testcasecraft-mcp-auth 스킬)
    ├── http-client.ts     # Axios 인스턴스
    ├── token-store.ts     # 토큰 파일 I/O
    ├── errors.ts          # McpError 헬퍼
    ├── tools/             # 도구별 파일
    │   ├── auth.ts
    │   ├── project.ts
    │   ├── testcase.ts
    │   └── ...
    └── schemas/           # 공용 Zod 스키마
        └── common.ts
```

## 도구 파일 패턴 (src/tools/testcase.ts)

```typescript
import { z } from "zod";
import { httpClient } from "../http-client.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// --- Zod 입력 스키마 ---
const ListInput = z.object({
  projectId: z.number().int().positive(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});

const GetInput = z.object({ id: z.number().int().positive() });

const CreateOrUpdateInput = z.object({
  id: z.number().int().positive().optional(),
  projectId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional(),
  // ...실제 DTO 필드
});

// --- Tool 메타데이터 ---
export const testcaseTools: Tool[] = [
  {
    name: "testcase_list",
    description:
      "프로젝트의 테스트 케이스 트리/목록을 조회한다. 검색어로 필터링 가능. " +
      "최초 호출 시 limit만 지정, 다음 페이지는 cursor로 요청.",
    inputSchema: zodToJsonSchema(ListInput),
  },
  {
    name: "testcase_get",
    description: "단일 테스트 케이스의 상세 정보를 ID로 조회.",
    inputSchema: zodToJsonSchema(GetInput),
  },
  {
    name: "testcase_create_or_update",
    description:
      "테스트 케이스를 생성하거나 수정한다. id가 주어지면 수정(PUT), 없으면 생성(POST). " +
      "parentId로 계층 구조 지정 가능.",
    inputSchema: zodToJsonSchema(CreateOrUpdateInput),
  },
];

// --- Handler 함수 ---
export const testcaseHandlers = {
  testcase_list: async (args: unknown) => {
    const input = ListInput.parse(args);
    const res = await httpClient.get(
      `/api/projects/${input.projectId}/testcases`,
      {
        params: {
          search: input.search,
          limit: input.limit,
          cursor: input.cursor,
        },
      },
    );
    return res.data;
  },

  testcase_get: async (args: unknown) => {
    const input = GetInput.parse(args);
    const res = await httpClient.get(`/api/testcases/${input.id}`);
    return res.data;
  },

  testcase_create_or_update: async (args: unknown) => {
    const input = CreateOrUpdateInput.parse(args);
    if (input.id) {
      const { id, ...body } = input;
      const res = await httpClient.put(`/api/testcases/${id}`, body);
      return res.data;
    } else {
      const res = await httpClient.post(`/api/testcases`, input);
      return res.data;
    }
  },
};
```

## DTO 정합성 검증 (스키마 생성 전 필수)

zod 스키마는 추측으로 작성하지 않는다. 백엔드 DTO와 컨트롤러 시그니처를 먼저 읽고, 그 결과를 zod에 그대로 옮긴다. 이 절차를 건너뛰면 빌드는 통과해도 첫 호출에서 입력 검증 실패가 나거나 백엔드 400/404로 거부된다.

### 1. PathVariable/RequestParam 타입 → zod 타입 매핑

| Java 시그니처                            | zod 스키마                    | 주의                                                            |
| ---------------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `@PathVariable String id` (UUID)         | `z.string().min(1)`           | **절대 `z.number().int()` 쓰지 말 것**. UUID는 36자 문자열이다. |
| `@PathVariable Long id` (sequential)     | `z.number().int().positive()` | RDB 시퀀스 PK인 경우만.                                         |
| `@RequestParam(required=false) String q` | `z.string().optional()`       | required 속성과 `.optional()` 일치시킨다.                       |
| `@RequestBody XxxDto body`               | `z.object({ ... })`           | DTO 풀필드 정렬 (아래 절차)                                     |

ID 한 글자도 의심 가면 백엔드 모델/엔티티의 `@Id` 컬럼 타입과 컨트롤러 시그니처를 모두 확인한다. 같은 프로젝트에서 일부 도구가 String이고 일부가 Long일 수 있다.

### 2. RequestBody DTO 풀필드 정렬 절차

```bash
# DTO 위치 찾기
find src/main/java -name "<EntityName>Dto.java"
```

DTO 파일에서 추출할 정보:

- **필드명 그대로** (camelCase 유지) — 리네이밍 금지. 백엔드는 정확한 키만 받는다.
- **Bean Validation 어노테이션** → zod 제약으로 정렬:
  - `@NotBlank` → `.min(1, "필수")`
  - `@NotNull` → 필수 (옵셔널 X)
  - `@Size(max=N)` → `.max(N)`
  - `@Email` → `.email()`
  - `@Pattern(regexp=...)` → `.regex(...)`
- **중첩 DTO** (`@Valid List<XxxStepDto>`) → 별도 `z.object()` 정의 후 `.array().max(N)`
- **enum 필드** → `z.enum([...])` (백엔드 enum 값 그대로)

### 3. 자주 발생하는 mismatch 패턴 (재발 방지)

| 증상                                                                | 원인                                | 예방                                              |
| ------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| `입력 검증 실패: projectId: Required` (UUID 전달했는데)             | zod가 `number`인데 string 전달      | PK가 UUID(String)인지 컨트롤러에서 확인           |
| 백엔드 400 `유효하지 않은 요청 데이터: [steps[0].description] 필수` | 중첩 DTO의 `@NotBlank` 필드 누락    | DTO의 모든 `@NotBlank` 필드를 zod 필수로          |
| 백엔드 404 `Not Found`                                              | URL 경로가 다른 컨트롤러 패턴 따름  | `@RequestMapping` 값 그대로 복사                  |
| 응답이 빈 객체로 보이는데 백엔드는 데이터 반환                      | 응답 키 변환 누락 (예: `data` 래핑) | `res.data`/`res.data.data` 등 실제 응답 구조 확인 |

### 4. 검증 스니펫

빠른 정합성 확인:

```bash
# zod 스키마의 ID 타입 점검 — UUID 프로젝트에서 number 잔재 색출
grep -rnE "z\.number\(\)\.int\(\)\.positive" src/tools/
# 결과가 비어야 정상 (UUID 프로젝트 기준)

# 백엔드 NotBlank 필드와 zod 필수 필드 대조
grep -A1 "@NotBlank" path/to/XxxDto.java | grep "private"
```

DTO 정합성 검증을 마친 후에 다음 단계로 진행한다.

## Zod → JSON Schema 변환

`zod-to-json-schema` 패키지를 추가하거나, 간단한 경우 수동 작성. MCP는 JSON Schema 형식의 `inputSchema`를 요구한다.

```typescript
import { zodToJsonSchema as z2j } from "zod-to-json-schema";
function zodToJsonSchema(schema: z.ZodTypeAny) {
  return z2j(schema, { target: "openApi3" });
}
```

`package.json`에 `"zod-to-json-schema": "^3.23.0"` 추가.

## 멀티파트(파일 업로드) 도구 패턴

`multipart/form-data` 엔드포인트(`@RequestParam("file") MultipartFile`)는 JSON 도구와 형태가 다르다. 파일 업로드 도구는 별도 파일로 분리하는 것이 가독성에 좋다 (예: `testcase_attachment.ts`).

### 의존성

```bash
npm install form-data
```

`form-data`는 axios의 transitive deps이지만, 직접 사용한다면 `package.json`의 `dependencies`에 명시한다. 명시 없이 transitive에 의존하면 axios 메이저 업데이트 시 깨질 수 있다.

### 입력 스키마

```typescript
const UploadInput = z.object({
  ownerId: z.string().min(1, "오너 ID 필수"), // PathVariable
  filePath: z.string().min(1, "로컬 절대경로"), // 클라이언트 파일 경로
  description: z.string().max(2000).optional(),
});
```

LLM 사용자는 파일을 직접 보낼 수 없으니, **로컬 파일 시스템 경로**를 받아 서버가 읽는 패턴이 일반적이다.

### Handler

```typescript
import { createReadStream, statSync, existsSync } from "node:fs";
import { basename } from "node:path";
import FormData from "form-data";

upload: async (args: unknown) => {
  const input = UploadInput.parse(args);
  if (!existsSync(input.filePath))
    throw new Error(`파일 없음: ${input.filePath}`);
  const stat = statSync(input.filePath);
  if (!stat.isFile())
    throw new Error(`디렉터리는 업로드 불가: ${input.filePath}`);

  const form = new FormData();
  form.append("file", createReadStream(input.filePath), {
    filename: basename(input.filePath),
    knownLength: stat.size,
  });
  if (input.description) form.append("description", input.description);

  const res = await httpClient.post(`/api/.../upload/${input.ownerId}`, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data;
};
```

핵심 포인트:

- `form.getHeaders()`로 `Content-Type: multipart/form-data; boundary=...`를 명시
- 큰 파일 대비 `maxContentLength`/`maxBodyLength`를 `Infinity`로 (axios 기본은 작음)
- `createReadStream` 사용 (전체 메모리 로드 회피)

### 백엔드 확장자 화이트리스트 — 사전 검증

백엔드가 확장자 화이트리스트를 강제하는 경우가 흔하다. 예 (testcasecraft):

```
허용: txt, csv, json, md, pdf, log, png, jpg, jpeg, gif, xls, xlsx, doc, docx
거부: sql, plsql, html, js, ts, sh, …
```

도구 description에 허용 확장자를 명시하거나, handler 내 사전 검증으로 백엔드 400 전에 친절한 에러를 던진다:

```typescript
const ALLOWED = new Set([
  "txt",
  "csv",
  "json",
  "md",
  "pdf",
  "log",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "xls",
  "xlsx",
  "doc",
  "docx",
]);
const ext = input.filePath.split(".").pop()?.toLowerCase() ?? "";
if (!ALLOWED.has(ext)) {
  throw new Error(
    `허용되지 않은 확장자 .${ext}. 허용: ${[...ALLOWED].join(", ")}`,
  );
}
```

대안 — 콘텐츠가 본질적으로 텍스트라면 임시 파일을 `.txt`로 복사 후 업로드. 이때 파일명에 원래 종류를 보존(`foo.sql.txt`)하여 다운로드 측에서 식별 가능하게 한다.

### 응답 가공

업로드 응답에는 보통 `id`, `originalFileName`, `downloadUrl` 등이 포함된다. LLM이 후속 작업(다운로드 안내·삭제)에 쓸 수 있도록 그대로 반환한다.

## 도구 description 작성 원칙

LLM은 자연어로 도구를 선택한다. description은 다음을 포함해야 한다:

1. **무엇을 하는지** (1문장)
2. **언제 사용하는지** (트리거 단서)
3. **주요 입력의 의미**
4. **결과의 형식**

**나쁜 예:** `"테스트 케이스 조회"`
**좋은 예:** `"프로젝트의 테스트 케이스 트리/목록을 조회한다. '테스트 케이스 목록 보여줘', 'ICT-138의 테스트케이스' 같은 요청 시 사용. limit/cursor로 페이지네이션."`

## 검증

코드 생성 후:

1. `cd mcp-server && npm install` — 성공
2. `npm run build` — tsc 통과
3. `node dist/index.js` — stderr에 "started" 출력, stdin 대기

## 참고

- 서버 보일러플레이트 (package.json, tsconfig.json, src/index.ts, src/http-client.ts, src/errors.ts): `references/server-boilerplate.md`
- 인증 코드: `testcasecraft-mcp-auth` 스킬
- 테스트: `testcasecraft-mcp-test` 스킬
