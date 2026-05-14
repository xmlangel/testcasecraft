---
name: e2e-scenario-analysis
description: 새 E2E 테스트 대상 기능을 분석해 정상/실패/엣지 시나리오를 도출하고 검증 포인트를 식별한다. Frontend 컴포넌트 + API 호출을 함께 검토하고 셀렉터(data-testid) 가용성을 감사. _workspace/e2e_01_scenario_{feature}.json으로 저장. E2E 테스트 추가 워크플로우의 첫 단계.
---

# E2E Scenario Analysis

E2E 테스트의 시나리오를 도출한다.

## 워크플로우

### 1. 대상 식별

사용자 입력으로부터 다음 추출:
- `feature` (필수): 기능 슬러그 (예: `api-token-create`)
- `componentPath` (선택): 분석 대상 컴포넌트
- `module` (선택): 테스트 배치 모듈

`componentPath`가 없으면 grep으로 추정:
```bash
grep -rln "{feature 관련 키워드}" src/main/frontend/src/components/
```

### 2. 컴포넌트 분석

대상 컴포넌트를 읽어 다음을 추출:

#### 2-1. UI 셀렉터 감사
```bash
# data-testid 보유 요소 추출
grep -oP 'data-testid="[^"]+"' src/main/frontend/src/components/{Feature}*.jsx

# data-testid 누락 요소 식별 (Button, TextField, IconButton 등)
grep -n -E "<(Button|TextField|IconButton|Card)" src/main/frontend/src/components/{Feature}*.jsx
```

각 인터랙티브 요소(클릭/입력 대상)에 data-testid가 있는지 확인. 누락 시 `selectorAudit.missingTestIds`에 기록.

#### 2-2. API 흐름 추적
```bash
# 서비스 호출 추출
grep -oP "{Feature}?Service\.\w+\(" src/main/frontend/src/components/{Feature}*.jsx
```

해당 서비스 파일(`src/main/frontend/src/services/{feature}Service.js`)을 읽어 axios 호출 경로 + payload 형식 파악.

#### 2-3. 상태/스토리지 추적
- `localStorage.getItem`, `setItem` 호출
- React Context 사용 (`useContext`)
- `useState` 초기값/변경 트리거

### 3. 시나리오 도출

다음 3종을 균형 있게 도출 (총 3~6개):

#### Happy Path (필수, 1~2개)
의도된 사용 시나리오. 예: "API 토큰 정상 발급".

#### Sad Path (1~2개)
- 입력 검증 실패 (빈 필드, 형식 오류)
- 권한 부족 (로그인 미상태)
- API 실패 (404, 500)

#### Edge Case (선택, 0~2개)
- 중복 데이터
- 동시성 (여러 탭)
- 네트워크 지연
- 빈 상태(empty state)
- 페이지네이션 경계

### 4. assertion 정의

각 시나리오마다 검증 가능한 assertion을 명시:
- ✅ "토큰 값이 16자 이상" (구체적)
- ❌ "잘 동작한다" (모호함, 사용 금지)

다음 유형을 다양하게 섞을 것:
| 유형 | 예시 |
|------|------|
| Visibility | `expect(locator).toBeVisible()` |
| 텍스트 | `expect(locator).toContainText("...")` |
| 카운트 | `expect(locator).toHaveCount(N)` |
| URL | `expect(page).toHaveURL("...")` |
| 스토리지 | `expect(localStorage.foo).toBeTruthy()` |
| API 응답 | `expect(response.status()).toBe(200)` |

### 5. 산출물 작성

`_workspace/e2e_01_scenario_{feature}.json`에 저장. 형식은 agents/e2e-scenario-analyzer.md의 출력 스키마 참조.

## 셀렉터 우선순위

분석 단계에서 각 시나리오의 `expectedSelectors`를 다음 순서로 제안:

1. `[data-testid="..."]` (이미 있는 경우)
2. `[aria-label="..."]`
3. `getByRole("button", { name: "..." })`
4. `.MuiXxx` (디자인 시스템 의존, 회귀 위험)
5. `has-text("...")` (다국어 회귀 위험, 신중)

## 모듈 자동 분류

| 기능 키워드 | 권장 모듈 |
|------------|----------|
| login, logout, register, auth | `authentication/` |
| dashboard, chart, stats | `dashboard/` |
| project, testCase, testPlan, testExecution | `project/` |
| 기존 기능의 회귀 테스트 | `regression/` |
| 위에 없으면 | 사용자 결정 (기본 `regression/`) |

## 원칙

- **코드가 진실의 원천:** 명세 문서가 아닌 실제 컴포넌트/서비스 코드를 본다
- **시나리오 5±2 규칙:** 너무 많으면 유지보수 부담, 너무 적으면 회귀 위험
- **assertion은 구체적으로:** "잘 동작한다" 금지, 측정 가능한 표현 사용
- **셀렉터 안정성 우선 보고:** 미흡한 testid는 분석 단계에서 미리 잡아 frontend 수정 안내

## 검증 체크 (자체)

- [ ] 최소 1개 Happy Path + 1개 Sad Path 포함
- [ ] 모든 시나리오에 assertion 1개 이상 (visibility만은 회피)
- [ ] 모든 expectedSelectors가 data-testid 또는 fallback 순위표 안에 있음
- [ ] targetComponents 경로가 실제로 존재
