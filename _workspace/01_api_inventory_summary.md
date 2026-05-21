# API 인벤토리 분석 리포트

## 프로젝트 개요

- **프로젝트명**: TestCaseCraft
- **분석 대상**: Spring Boot REST Controllers
- **분석 일시**: 2026-05-21

---

## 요약 통계

| 지표                     | 값          |
| ------------------------ | ----------- |
| **총 컨트롤러 수**       | 49          |
| **총 엔드포인트 수**     | 433         |
| **인증 필요 엔드포인트** | 401 (92.6%) |
| **공개 엔드포인트**      | 32 (7.4%)   |

---

## 컨트롤러별 엔드포인트 분포 (Top 10)

| 순위 | 컨트롤러                        | 엔드포인트 수 |
| ---- | ------------------------------- | ------------- |
| 1    | RagController                   | 32            |
| 2    | TestCaseController              | 24            |
| 3    | TranslationManagementController | 22            |
| 4    | UserPermissionController        | 21            |
| 5    | JunitResultController           | 20            |
| 6    | TestResultReportController      | 15            |
| 7    | DashboardController             | 14            |
| 8    | JiraIntegrationController       | 13            |
| 9    | TestResultApiController         | 13            |
| 10   | AuditLogController              | 12            |

---

## 위험 등급별 분포

| 등급           | 엔드포인트 수 | 비율  |
| -------------- | ------------- | ----- |
| **Low**        | 268           | 61.9% |
| **Medium**     | 155           | 35.8% |
| **High**       | 10            | 2.3%  |
| **Admin Only** | 0             | 0.0%  |

---

## MCP 도구 그룹화 추천

프로젝트의 49개 컨트롤러를 다음 **12개 기능 그룹**으로 묶을 것을 권장합니다:

### 1. **testcase** (3개 컨트롤러, ~60 API)

- TestCaseController
- TestCaseVersionController
- TestCaseAttachmentController
- **역할**: 테스트 케이스 CRUD, 버전 관리, 첨부파일 관리

### 2. **testresult** (4개 컨트롤러, ~50 API)

- TestResultApiController
- TestResultEditController
- TestResultReportController
- TestResultAttachmentController
- **역할**: 테스트 결과 기록, 편집, 리포트 생성, 첨부파일

### 3. **testexecution** (2개 컨트롤러, ~25 API)

- TestExecutionController
- TestExecutionIndividualController
- **역할**: 테스트 실행 스케줄링, 개별 결과 관리

### 4. **testplan** (2개 컨트롤러, ~12 API)

- TestPlanController
- TestCharterController
- **역할**: 테스트 계획, 테스트 차터 관리

### 5. **testsession** (2개 컨트롤러, ~15 API)

- TestSessionController
- TestSessionAttachmentController
- **역할**: 테스트 세션 관리, 첨부파일

### 6. **jira** (5개 컨트롤러, ~60 API)

- JiraConfigController
- JiraIntegrationController
- JiraBatchController
- JiraStatusController
- JiraMonitoringController
- **역할**: Jira 연동 설정, 동기화, 배치 작업, 상태 모니터링

### 7. **rag** (4개 컨트롤러, ~50 API)

- RagController
- RagChatController
- RagChatConversationController
- RagAdminController
- **역할**: RAG 기반 AI 채팅, 대화 관리, 관리자 설정

### 8. **junit** (2개 컨트롤러, ~30 API)

- JunitResultController
- JunitVersionController
- **역할**: JUnit 테스트 결과 수집, 버전 관리

### 9. **user** (3개 컨트롤러, ~50 API)

- UserManagementController
- UserPermissionController
- UserActivityController
- **역할**: 사용자 관리, 권한 제어, 활동 로깅

### 10. **organization** (3개 컨트롤러, ~25 API)

- OrganizationController
- ProjectController
- GroupController
- **역할**: 조직/프로젝트/그룹 계층 관리

### 11. **auth** (2개 컨트롤러, ~15 API)

- AuthController (11 API: register, login, logout, token refresh, etc.)
- EmailVerificationController
- **역할**: 인증, 토큰 관리, 이메일 인증

### 12. **admin_settings** (3개 컨트롤러, ~20 API)

- SystemSettingController
- AdminMailSettingsController
- ConfigController
- **역할**: 시스템 설정, 메일 설정, 일반 설정

### 13. **llm** (2개 컨트롤러, ~10 API)

- LlmConfigController
- LlmTemplateController
- **역할**: LLM 설정, 프롬프트 템플릿 관리

### 14. **scheduler** (2개 컨트롤러, ~8 API)

- SchedulerConfigController
- SchedulerInfoController
- **역할**: 스케줄러 설정 및 상태 조회

### 15. **other** (6개 컨트롤러, ~15 API)

- GuideController
- MonitoringController
- AuditLogController
- VersionController
- GoogleConfigController
- MailController
- ServiceApiKeyController
- I18nController
- TranslationManagementController
- **역할**: 가이드, 모니터링, 감사 로그, 버전, 외부 통합, 국제화

---

## AuthController 토큰 필드명 분석

### 로그인 응답 (`POST /api/auth/login`)

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz123...",
  "tokenType": "Bearer",
  "accessTokenExpiration": 3600000,
  "refreshTokenExpiration": 604800000,
  "user": { ... }
}
```

**핵심 필드**:

- `accessToken`: JWT access token (주요 인증 토큰)
- `refreshToken`: Refresh token (액세스 토큰 갱신용)
- `tokenType`: "Bearer" (HTTP Authorization 헤더 형식)
- `accessTokenExpiration`: 액세스 토큰 만료까지 밀리초
- `refreshTokenExpiration`: 리프레시 토큰 만료까지 밀리초

### 토큰 갱신 요청/응답 (`POST /api/auth/refresh`)

```json
요청 body: {"refreshToken": "..."}
응답: {"accessToken": "...", "tokenType": "Bearer", "accessTokenExpiration": ...}
```

---

## 특이사항 및 주요 발견

### 1. **고도의 REST API 설계**

- 449개 엔드포인트 중 92.6%가 인증 필요
- 명확한 역할 기반 접근 제어 (ROLE_ADMIN, ROLE_MANAGER, ROLE_TESTER)

### 2. **AI/RAG 통합 강화**

- RagController가 가장 많은 엔드포인트 (32개)
- 대화형 AI 기능 (RagChatController, RagChatConversationController)
- RAG 관리 인터페이스 (RagAdminController)

### 3. **Jira 통합 복잡도 높음**

- 5개 전용 컨트롤러 (60+ API)
- 동기화, 배치 처리, 실시간 모니터링 지원

### 4. **다국어 및 국제화 지원**

- I18nController, TranslationManagementController
- 21개 엔드포인트로 다국어 콘텐츠 관리

### 5. **감사 및 활동 추적**

- AuditLogController (12 API)
- UserActivityController (포함)
- 보안/컴플라이언스 요구사항 충족

### 6. **권한 관리 상세화**

- UserPermissionController (21 API)
- 세밀한 권한 제어 메커니즘

### 7. **테스트 결과 리포팅**

- TestResultReportController (15 API)
- 다양한 형식의 테스트 리포트 생성

### 8. **멀티파트 지원**

- 여러 컨트롤러에서 파일 업로드 지원 (Attachment 컨트롤러들)
- 테스트 케이스, 결과, 세션에 첨부파일 기능

---

## 보안 고려사항

### 공개 엔드포인트 (32개, 7.4%)

- `/api/auth/*`: 회원가입, 로그인, 로그아웃
- `/api/config/*`: 설정 조회
- `/api/i18n/*`: 다국어 지원
- `/api/monitoring/*`: 헬스 체크
- `/api/email-verification/*`: 이메일 인증
- `/api/guides/*`: 가이드 문서

### 관리자 전용 엔드포인트

- `/api/admin/*`: 10개 (삭제, 설정 변경)
- 높은 위험도로 분류됨

---

## 권장사항

1. **MCP 도구 그룹별 병렬 처리**: 각 도구 그룹을 독립적인 MCP 마이크로서비스로 구현
2. **API 게이트웨이**: 433개 엔드포인트를 효율적으로 관리하기 위해 API Gateway 도입
3. **GraphQL 레이어 고려**: 복잡한 데이터 쿼리 (RAG, JUnit 결과)를 위한 GraphQL 추가
4. **캐싱 전략**: RAG, 국제화, 설정 엔드포인트에 캐싱 적용
5. **레이트 제한**: 공개 엔드포인트에 레이트 제한 설정
6. **문서화**: Swagger/OpenAPI를 이용한 자동 문서 생성

---

## 산출물

- **JSON 인벤토리**: `/Users/dicky/kmdata/git/testcase/testcasecraft/_workspace/01_api_inventory.json`
- **마크다운 요약**: `/Users/dicky/kmdata/git/testcase/testcasecraft/_workspace/01_api_inventory_summary.md`
