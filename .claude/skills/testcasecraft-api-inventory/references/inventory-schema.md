# API Inventory JSON Schema

## 전체 구조

```json
{
  "project": "string",
  "baseUrl": "string",
  "scannedAt": "ISO-8601 timestamp",
  "auth": {
    "type": "jwt|basic|none",
    "loginEndpoint": "string",
    "tokenHeader": "Authorization",
    "tokenPrefix": "Bearer "
  },
  "groups": [
    {
      "name": "string (kebab-case domain name)",
      "controller": "string (Java class name)",
      "controllerFile": "absolute path",
      "basePath": "string",
      "endpoints": [
        {
          "id": "group.action (e.g. testcase.list)",
          "method": "GET|POST|PUT|DELETE|PATCH",
          "path": "string with {placeholders}",
          "summary": "string",
          "pathParams": [
            {
              "name": "string",
              "type": "string|integer|number|boolean",
              "required": true
            }
          ],
          "queryParams": [
            {
              "name": "string",
              "type": "string",
              "required": false,
              "defaultValue": "any",
              "description": "string"
            }
          ],
          "requestBody": {
            "contentType": "application/json|multipart/form-data",
            "schema": {
              "type": "object",
              "properties": {...},
              "required": [...]
            }
          },
          "responseSchema": {
            "status": 200,
            "contentType": "application/json",
            "schema": {...}
          },
          "auth": {
            "required": true,
            "roles": ["string"],
            "annotation": "@PreAuthorize|@Secured|SecurityConfig|none",
            "source": "method|class|SecurityConfig"
          },
          "risk": "low|medium|high|admin_only",
          "multipart": false,
          "notes": "string"
        }
      ]
    }
  ],
  "summary": {
    "totalControllers": 0,
    "totalEndpoints": 0,
    "authRequiredCount": 0,
    "riskDistribution": {
      "low": 0, "medium": 0, "high": 0, "admin_only": 0
    },
    "warnings": ["string"]
  }
}
```

## 필드 의미

### auth.required 결정 규칙

1. 메서드에 `@PreAuthorize`/`@Secured`/`@RolesAllowed`가 있으면 → `true`
2. 클래스에 위 어노테이션이 있으면 → `true`
3. SecurityConfig에 `permitAll()`로 명시되면 → `false`
4. SecurityConfig에 `authenticated()` 또는 명시 없음 → `true` (보수적)

### risk 분류 기준

- `low`: GET 단건 조회, 본인 데이터 조회
- `medium`: POST 생성, PUT 수정, RAG/외부 호출
- `high`: DELETE, 일괄 처리, 다른 사용자 데이터 수정
- `admin_only`: `/api/admin/*` 또는 `ROLE_ADMIN` 필요

### id 명명 규칙

- 형식: `{group}.{action}` (snake_case)
- 예: `testcase.list`, `testcase.get`, `testcase.create`, `testcase.update`, `testcase.delete`
- 같은 그룹 내 충돌 시 suffix 추가: `testcase.list_by_project`, `testcase.list_by_plan`

## 검증 체크리스트

- [ ] 모든 endpoint id가 유일한가
- [ ] path placeholder가 pathParams와 일치하는가
- [ ] auth.required=false인데 risk=admin_only인 항목이 없는가 (모순)
- [ ] 같은 path + method 중복이 있다면 `notes`에 명시되었는가

## 예시 (testcasecraft testcase 그룹 일부)

```json
{
  "name": "testcase",
  "controller": "TestCaseController",
  "basePath": "/api",
  "endpoints": [
    {
      "id": "testcase.list_by_project",
      "method": "GET",
      "path": "/api/projects/{projectId}/testcases",
      "summary": "프로젝트의 테스트 케이스 트리 조회",
      "pathParams": [
        { "name": "projectId", "type": "integer", "required": true }
      ],
      "queryParams": [
        { "name": "search", "type": "string", "required": false }
      ],
      "requestBody": null,
      "responseSchema": {
        "status": 200,
        "schema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "name": { "type": "string" },
              "children": { "type": "array" }
            }
          }
        }
      },
      "auth": { "required": true, "roles": [], "source": "SecurityConfig" },
      "risk": "low",
      "multipart": false
    }
  ]
}
```
