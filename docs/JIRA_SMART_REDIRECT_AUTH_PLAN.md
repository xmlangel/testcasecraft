# 스마트 리다이렉트 인증 구현 계획

> **작성일**: 2026-03-05  
> **관련 문서**: [JIRA_SMART_REDIRECT_PLAN.md](./JIRA_SMART_REDIRECT_PLAN.md)

## 배경 및 문제 정의

현재 `jiraApp/src/frontend/index.jsx`는 Jira 이슈 패널에서 다음 URL로 외부 링크를 열어줍니다:

```
http://tc.skaiworldwide.co.kr:8080/jira-redirect/{issueKey}
```

이 링크를 클릭하면 새 창(탭)이 열리는데, **사용자가 testcasecraft에 로그인되어 있지 않은 경우** `/jira-redirect/:issueKey` 라우트가 인증을 요구하면서 로그인 페이지로 이동하게 됩니다.

현재 `SecurityConfig.java`를 보면:
- `/api/**` → 모두 `authenticated()` (인증 필요)
- `/jira-redirect/**` SPA 경로는 현재 `SecurityConfig`에 명시 없음 → `anyRequest().authenticated()` 규칙에 따라 **인증 필요**

---

## 핵심 문제: Forge App은 세션/토큰을 전달할 수 없다

Forge App(Jira 이슈 패널)에서는 `Link` 컴포넌트로 새 창을 여는 방법만 가능합니다. 따라서:
- 쿠키 기반 세션 전달 ❌
- Authorization 헤더 첨부 ❌
- 개별 사용자의 JWT 토큰이 Jira 패널에 있을 수 없음 ❌

---

## 접근 방법 비교

| 방법 | 설명 | 장점 | 단점 |
|---|---|---|---|
| **A. 공개 엔드포인트** | 리다이렉트 관련 경로를 `permitAll()` 처리 | 구현 가장 단순 | 이슈 키만 알면 누구든 조회 가능 |
| **B. 임시 토큰** | 패널 로드 시 `invoke()`로 단기 토큰 발급, URL에 포함 | 요청별 인증 | 패널 로드마다 API 호출 필요, 복잡도 높음 |
| **C. 초기 설치 시 API 키 등록** | 앱 설치 시 서비스 계정 API 키를 Forge Storage에 저장, 링크에 포함 | 1회 설정으로 영구 동작, 구현 단순 | 서비스 계정 단일 인증 (감사 로그에 사용자 구분 없음) |

> [!IMPORTANT]
> **권장 방안: C. 초기 설치 시 API 키 등록 방식**
>
> 앱 설치 시 관리자가 testcasecraft 서버 URL과 서비스 계정 API 키를 Forge 앱 설정 UI에서 한 번만 입력합니다. 이후 이슈 패널에서 생성되는 모든 링크에 자동으로 인증 정보가 포함됩니다.

---

## 방안 C 전체 흐름

```
[앱 설치 시 (1회)]
    Forge 앱 설정 UI에서 관리자가 입력:
    - testcasecraft 서버 URL
    - 서비스 계정 API 키
        ↓ Forge Storage(KVS)에 암호화 저장

[일반 사용 시]
    Jira 이슈 패널 로드
        ↓ Forge Storage에서 저장된 설정 읽기 (invoke → resolver → kvs.get)
    URL = {serverUrl}/jira-redirect/{issueKey}?apiKey={savedApiKey}
        ↓ openNewTab
[새 창: JiraIssueRedirect.jsx]
    URL 파라미터에서 apiKey 추출
    → API 호출 시 Authorization: Bearer {apiKey} 첨부
    → 실행 컨텍스트 조회 → 리다이렉트
```

### 방안 C의 핵심 특성
- ✅ **1회 설정**으로 이후 모든 사용자가 별도 작업 없이 링크 클릭만 하면 됨
- ✅ Forge Storage는 **앱 수준 암호화 저장소** — `kvs.setSecret()`으로 보안 보장
- ✅ 기존 `@forge/resolver` + `@forge/bridge` 구조 그대로 활용 (이미 설치됨)
- ⚠️ URL에 API 키가 쿼리 파라미터로 노출 → **HTTPS 필수**

### Forge Storage 검증 결과

| 요소 | 지원 | 비고 |
|---|---|---|
| `storage:app` 스코프 | ✅ | `manifest.yml` permissions에 선언 필요 |
| `kvs.setSecret(key, value)` | ✅ | 민감 정보 암호화 저장 API |
| `kvs.getSecret(key)` | ✅ | resolver에서만 직접 접근 가능 |
| `@forge/resolver` + `invoke()` | ✅ | 현재 `src/index.js`에서 이미 사용 중 |
| `@forge/bridge` invoke | ✅ | `package.json`에 v5.14.0 이미 포함 |
| `@forge/kvs` 패키지 | ⚠️ 추가 설치 필요 | `@forge/api`의 `storage`는 2025.3.17부터 업데이트 종단 |

---

## 📋 제안된 변경 사항

---

### Phase 1: [Backend] 서비스 계정 API 키 발급 기능

#### [NEW] ServiceApiKeyController.java
`src/main/java/com/testcase/testcasemanagement/controller/ServiceApiKeyController.java`

- `POST /api/service-api-keys` — 관리자용 장기 API 키 발급
  - `JwtTokenUtil`의 `generateRefreshToken()` 활용 + TTL을 **1년**으로 확장
- `DELETE /api/service-api-keys/{keyId}` — 키 폐기
- `hasRole('ADMIN')`으로 접근 제한

#### [MODIFY] SecurityConfig.java
`src/main/java/com/testcase/testcasemanagement/config/SecurityConfig.java`

```java
// 1. SPA 라우팅 경로 추가
"/jira-redirect",
"/jira-redirect/**",

// 2. 리다이렉트 API는 apiKey 쿼리 파라미터 인증으로 처리
.requestMatchers(HttpMethod.GET, "/api/jira-integration/latest-execution-context").permitAll()
```

> [!NOTE]
> `latest-execution-context`는 `JwtAuthenticationFilter`가 `?apiKey=` 파라미터도 읽도록 확장하거나,
> 별도 `ApiKeyAuthFilter`를 추가하는 방식으로 인증합니다.

---

### Phase 2: [Forge App] 설정 UI 및 Storage 연동

#### [MODIFY] manifest.yml
`jiraApp/manifest.yml`

```yaml
modules:
  jira:issuePanel:
    - key: testcasecraft-issue-panel
      resource: main
      render: native
      resolver:
        function: resolver
      title: Testcasecraft
  jira:globalSettings:             # 관리자 설정 페이지 (신규)
    - key: testcasecraft-settings
      resource: settings
      resolver:
        function: resolver
      title: Testcasecraft 설정
  function:
    - key: resolver
      handler: index.handler
resources:
  - key: main
    path: src/frontend/index.jsx
  - key: settings                  # 신규
    path: src/frontend/settings.jsx
permissions:
  scopes:
    - read:jira-work
    - write:jira-work
    - storage:app                  # Forge KVS 사용 권한 (신규)
```

#### [NEW] settings.jsx
`jiraApp/src/frontend/settings.jsx`

```jsx
import React, { useState } from 'react';
import ForgeReconciler, { Text, Textfield, Button, Stack, Heading } from '@forge/react';
import { invoke } from '@forge/bridge';  // ✅ 이미 package.json에 포함

const Settings = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await invoke('save-config', { serverUrl, apiKey });
    setSaved(true);
  };

  return (
    <Stack>
      <Heading as="h3">Testcasecraft 서버 설정</Heading>
      <Text>서버 URL (예: http://tc.skaiworldwide.co.kr:8080)</Text>
      <Textfield value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      <Text>서비스 계정 API 키</Text>
      <Textfield value={apiKey} onChange={e => setApiKey(e.target.value)} />
      <Button onClick={handleSave}>저장</Button>
      {saved && <Text>✅ 저장되었습니다.</Text>}
    </Stack>
  );
};

ForgeReconciler.render(<Settings />);
```

#### [MODIFY] index.js (Forge resolver)
`jiraApp/src/index.js`

```js
import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';  // npm install @forge/kvs 필요

const resolver = new Resolver();

// 설정 저장 (API 키는 setSecret으로 암호화 저장)
resolver.define('save-config', async ({ payload }) => {
  await kvs.set('tc_server_url', payload.serverUrl);
  await kvs.setSecret('tc_api_key', payload.apiKey);  // 🔐 암호화 저장
  return { success: true };
});

// 설정 읽기 (프론트엔드의 invoke()가 이 함수 호출)
resolver.define('get-config', async () => {
  const serverUrl = await kvs.get('tc_server_url');
  const apiKey = await kvs.getSecret('tc_api_key');  // 🔐 복호화 조회
  return { serverUrl, apiKey };
});

export const handler = resolver.getDefinitions();
```

#### [MODIFY] index.jsx
`jiraApp/src/frontend/index.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import ForgeReconciler, { Text, Heading, Stack, Link, useProductContext } from '@forge/react';
import { invoke } from '@forge/bridge';  // ✅ 이미 package.json에 포함

const App = () => {
  const context = useProductContext();
  const [config, setConfig] = useState(null);
  const issueKey = context?.extension?.issue?.key;

  useEffect(() => {
    invoke('get-config').then(setConfig);  // resolver에서 Storage 값 읽기
  }, []);

  if (!issueKey || !config?.serverUrl) {
    return <Stack><Text>설정 또는 이슈 정보를 불러오는 중...</Text></Stack>;
  }

  const redirectUrl = `${config.serverUrl}/jira-redirect/${issueKey}?apiKey=${config.apiKey}`;

  return (
    <Stack space="space.100">
      <Heading as="h3">테스트 관리</Heading>
      <Text>현재 이슈({issueKey})와 연결된 테스트 케이스를 확인하거나 결과를 입력할 수 있습니다.</Text>
      <Link href={redirectUrl} openNewTab={true}>
        테스트 결과 확인 및 입력 (바로가기)
      </Link>
    </Stack>
  );
};

ForgeReconciler.render(<React.StrictMode><App /></React.StrictMode>);
```

---

### Phase 3: [Frontend React] JiraIssueRedirect 컴포넌트

#### [NEW] JiraIssueRedirect.jsx
`src/main/frontend/src/components/JiraIntegration/JiraIssueRedirect.jsx`

- URL에서 `issueKey`(경로 파라미터)와 `apiKey`(쿼리 파라미터) 추출
- `Authorization: Bearer {apiKey}` 헤더로 `/api/jira-integration/latest-execution-context` 호출
- 결과 1개: 자동 리다이렉트
- 결과 여러 개: 선택 카드 UI
- 결과 없음 / 인증 실패: 안내 메시지 표시

#### [MODIFY] App.jsx
`src/main/frontend/src/App.jsx`

```jsx
<Route path="/jira-redirect/:issueKey" element={<JiraIssueRedirect />} />
```

---

## 🧪 검증 계획

### 1. 백엔드 테스트
```bash
SPRING_PROFILES_ACTIVE=local ./gradlew test --tests "*JiraIntegration*"
```

### 2. SecurityConfig 변경 확인
```bash
# apiKey 포함 시 정상 응답 확인
curl -H "Authorization: Bearer {apiKey}" \
  "http://localhost:8080/api/jira-integration/latest-execution-context?issueKey=ON-426"
```

### 3. SPA 라우팅 확인
브라우저에서 로그아웃 상태로 접근:
```
http://localhost:8080/jira-redirect/ON-426?apiKey={apiKey}
```
→ 리다이렉트 선택 화면이 보여야 함

### 4. Forge App 설정 UI 확인
- Jira 관리자 페이지에서 Testcasecraft 설정 화면 표시 확인
- 서버 URL + API 키 저장 후 이슈 패널 링크 정상 생성 확인

### 5. 엔드투엔드 시나리오
- DB에 `ON-426` 이슈 키가 연결된 테스트 결과 존재
- 결과 1개: 자동으로 `/projects/.../executions/...` 페이지로 이동
- 결과 여러 개: 선택 카드 표시
