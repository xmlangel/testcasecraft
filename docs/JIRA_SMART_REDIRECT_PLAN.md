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

## 🧪 테스트 계획

### [Backend] 통합 테스트
#### [NEW] [JiraSmartRedirectIntegrationTest.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/integration/JiraSmartRedirectIntegrationTest.java)
- 이슈 키 기반 다중 실행 목록 조회 API를 검증합니다.
- 단일 결과 시나리오, 다중 결과 시나리오, 결과 없음 시나리오를 각각 테스트합니다.


## 검증 계획 (수정됨)
- **자동화 테스트**: 상기 Java 통합 테스트 실행.
- **수동 검증**: 
  - `ON-426` 이슈 키를 서로 다른 두 프로젝트의 실행에 연결.
  - 리다이렉트 URL 접속 시 선택 UI 확인 및 선택 후 랜딩 확인.
