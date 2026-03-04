# Jira 이슈 키 기반 스마트 리다이렉트 구현 계획

Jira 이슈 페이지에서 `testcasecraft`로 연결할 때, 내부 ID 대신 지라 이슈 키(예: ON-426)를 사용하는 **스마트 리다이렉트(Smart Redirect)** 방식을 도입합니다. 이 방식은 실행 ID가 변경되더라도 지라 측의 링크를 수정할 필요 없이 항상 최신 작업 화면으로 연결해줍니다.

## 🚀 스마트 리다이렉트 메커니즘
1. **지라 링크**: `http://tc.skaiworldwide.co.kr:8080/jira-redirect/ON-426` (정적 링크)
2. **서비스 처리**:
   - 사용자가 링크 클릭 시 `JiraIssueRedirect` 컴포넌트가 로드됩니다.
   - 서버에서 해당 이슈와 연관된 최근 테스트 결과 목록을 조회합니다.
   - **결과가 1개인 경우**: 최신 실행 화면으로 즉시 리다이렉트합니다.
   - **결과가 여러 개인 경우**: [프로젝트 + 실행명 + 상태 + 날짜]가 포함된 선택 카드를 보여줍니다.
   - 서버가 최신 정보를 반환하면, 해당 실행 화면(`.testcasecraft/projects/.../executions/...`)으로 자동 이동합니다.

## 제안된 변경 사항

### [Backend] 테스트 관리 플랫폼
#### [MODIFY] [JiraIntegrationController.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/controller/JiraIntegrationController.java)
- `GET /api/jira-integration/latest-execution-context?issueKey=ON-426` 엔드포인트 추가.
- 해당 이슈 키가 포함된 최신 테스트 결과를 조회하여 `projectId`, `executionId`, `testCaseId`를 반환합니다.

### [Frontend] 테스트 관리 플랫폼
#### [NEW] [JiraIssueRedirect.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/JiraIntegration/JiraIssueRedirect.jsx)
- URL 파라미터(`issueKey`)를 읽어 서버에 컨텍스트 조회를 요청합니다.
- 조회된 정보를 바탕으로 `TestExecutionForm` 페이지로 `navigate` 합니다.

#### [MODIFY] [App.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/App.jsx)
- `/jira-redirect/:issueKey` 라우트를 추가합니다.

### [Jira App] Forge 애플리케이션
#### [MODIFY] [index.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/jiraApp/src/frontend/index.jsx)
- 링크를 `http://tc.skaiworldwide.co.kr:8080/jira-redirect/{issueKey}`로 고정합니다.
- 이제 지라 앱은 특정 실행 ID를 알 필요 없이 이슈 키만 전달하면 됩니다.

## 🧪 상세 테스트 시나리오 (브레인스토밍 결과)

| ID | 시나리오 | 예상 결과 |
|:---|:---|:---|
| TC-1 | 단일 결과 매칭 (Happy Path) | 이슈 키와 연결된 유일한 실행 화면으로 즉시 자동 랜딩 |
| TC-2 | 다중 결과 매칭 (UX-1,2,3) | 프로젝트, 상태, 날짜가 포함된 선택 목록 UI 표시 및 클릭 시 이동 |
| TC-3 | 결과 없음 (Empty State) | "연결된 테스트 결과를 찾을 수 없습니다" 안내 및 프로젝트 목록 링크 제공 |
| TC-4 | 로그인 세션 만료 | 로그인 화면으로 이동 후, 로그인 성공 시 원래 리다이렉트 동작 유지 |
| TC-5 | 대소문자 혼용 입력 | `on-426` 입력 시 `ON-426`으로 정규화하여 정상 조회 |
| TC-6 | 여러 프로젝트 중복 이슈 | 리스트에서 프로젝트 명칭으로 구분하여 표시 확인 |

## 검증 계획
- **시나리오**: `ON-426` 이슈가 포함된 테스트 실행을 두 번 생성합니다 (실행 A: 프로젝트 1, 실행 B: 프로젝트 2).
- **테스트**: 지라 이슈 페이지의 링크를 클릭했을 때, 선택 목록 UI가 나타나며 프로젝트와 상태 정보가 잘 표시되는지 확인합니다.
