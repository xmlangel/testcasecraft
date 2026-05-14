---
name: e2e-orchestrator
description: 새 Playwright E2E 테스트를 추가하는 통합 워크플로우. 시나리오 분석 → Page Object 생성 → Spec 작성 → QA의 4단계를 4명 팀으로 자동화. "E2E 테스트 추가", "Playwright 테스트 작성", "E2E 시나리오 만들어", "테스트 자동화 추가", "회귀 테스트 추가", "E2E 다시 작성", "Page Object 추가", "E2E 검증", "테스트 스펙 보완", "{기능} E2E" 같은 요청 시 반드시 이 스킬을 사용한다.
---

# E2E Test Orchestrator

새 E2E 테스트 추가를 4명의 에이전트 팀으로 자동화.

**실행 모드:** 에이전트 팀 (TeamCreate 기반, 4명 협업)

## Phase 0: 컨텍스트 확인

워크플로우 시작 전 `_workspace/` 내 기존 e2e 산출물 확인:

| 상태 | 사용자 요청 | 실행 모드 |
|------|------------|----------|
| `_workspace/` 내 e2e_* 없음 | 신규 E2E 추가 | **초기 실행** — 전체 Phase |
| `_workspace/e2e_01_{feature}.json` 존재 | "재분석", "시나리오 다시" | **부분 재실행** — Phase 1부터 |
| `_workspace/e2e_02_{feature}.md` 존재 | "PageObject만 다시" | **부분 재실행** — Phase 2부터 |
| `_workspace/e2e_03_{feature}.md` 존재 | "Spec만 다시" | **부분 재실행** — Phase 3만 |
| `_workspace/e2e_04_{feature}.md` 존재 | "검증만 다시" | **부분 재실행** — Phase 4만 |
| 다른 `feature` slug | 별도 E2E 추가 | **추가 실행** — 전체 Phase, 기존 보존 |

## Phase 1: 입력 파라미터 수집

사용자 요청에서 다음 추출 (불명확 시 AskUserQuestion):

1. **feature** (필수): 기능 슬러그 (kebab-case, 예: `api-token-create`)
2. **componentPath** (선택): 분석 대상 컴포넌트 경로 힌트
3. **module** (선택): 테스트 배치 모듈 (`authentication` / `dashboard` / `project` / `regression`)
4. **focus** (선택): "happy-only" | "all" — 시나리오 범위 한정

**입력 형태 변형 허용:**
- 사용자가 "프로필 다이얼로그 API 토큰 발급 테스트" → feature 추론
- "/regression 모듈에 비밀번호 변경 테스트" → module + feature 분리

## Phase 2: 팀 구성 및 작업 할당

`TeamCreate`로 4명 팀 구성. 모든 에이전트는 `model: "opus"`.

| 팀원 | 에이전트 정의 | 역할 |
|------|------------|------|
| analyzer | `e2e-scenario-analyzer` | 컴포넌트 분석 + 시나리오 도출 |
| pageobj | `e2e-page-object-generator` | Page Object 생성 + fixture 등록 |
| writer | `e2e-spec-writer` | 테스트 스펙 작성 |
| qa | `e2e-qa` | 3자 매칭 + 셀렉터 안정성 + 회귀 검증 |

`TaskCreate`로 작업 의존성 설정:
- Task A: `analyze` (analyzer)
- Task B: `generatePageObject` (pageobj) — blockedBy A
- Task C: `writeSpec` (writer) — blockedBy A + B
- Task D: `verify` (qa) — blockedBy B + C

## Phase 3: 데이터 흐름

```
[사용자 입력] feature, componentPath?, module?
    ↓
[analyzer]
    ↓ _workspace/e2e_01_scenario_{feature}.json
    ↓ selectorAudit.missingTestIds 있으면 오케스트레이터에게 사전 보고
    ↓ SendMessage → pageobj: "시나리오 + 셀렉터 목록 전달"
    ↓ SendMessage → writer: "시나리오 본문 전달"
[pageobj]
    ↓ src/test/e2e/pages/{Feature}Page.js 생성/수정
    ↓ src/test/e2e/fixtures/test-fixtures.js 수정 (필요 시)
    ↓ _workspace/e2e_02_page_object_{feature}.md
    ↓ SendMessage → writer: "PO 클래스명 + fixture 이름 + 메서드 목록"
[writer]
    ↓ src/test/e2e/{module}/{feature}-test.js 생성
    ↓ _workspace/e2e_03_spec_{feature}.md
    ↓ SendMessage → qa: "spec 파일 경로 + 사용 fixture/메서드"
[qa]
    ↓ 3자 매칭 + 셀렉터 안정성 + assertion 품질 + 회귀 + 정적 구문
    ↓ 자동 수정 (가능 항목)
    ↓ _workspace/e2e_04_qa_report_{feature}.md
    → 오케스트레이터: Pass/Auto-fixed/Issues 보고
```

**데이터 전달 전략:**
- 파일 기반(`_workspace/`): 산출물 본문
- 메시지 기반(SendMessage): 진행 통지
- 태스크 기반(TaskCreate): 의존성

## Phase 4: 에러 핸들링

| 에러 유형 | 전략 |
|----------|------|
| analyzer가 컴포넌트 못 찾음 | 사용자에게 정확한 componentPath 요청, 워크플로우 일시 중단 |
| selectorAudit 실패가 심각 (missing >5) | 오케스트레이터가 사용자에게 frontend 수정 권장. 진행 vs 중단 선택지 제공 |
| pageobj가 기존 PO와 충돌 | 메서드명 suffix 추가 또는 사용자 확인 |
| writer가 시나리오를 spec으로 변환 못함 (모호) | analyzer 재실행 요청 또는 사용자 보정 |
| qa의 회귀 감지 (기존 파일 의도치 않은 수정) | 워크플로우 중단, 사용자에게 git diff 검토 요청 |
| qa의 정적 구문 오류 자동 수정 실패 | ❌로 보고, 사용자 수동 처리 |

## Phase 5: 최종 산출물 보고

```
✅ E2E 테스트 "{feature}" ({module} 모듈) 추가 완료

📁 생성/수정 파일
- src/test/e2e/{module}/{feature}-test.js (test N개)
- src/test/e2e/pages/{Feature}Page.js (신규 또는 메서드 N개 추가)
- src/test/e2e/fixtures/test-fixtures.js (fixture 등록, 필요 시)

📊 통계
- 시나리오: N개 (Happy {a} / Sad {b} / Edge {c})
- assertion 다양성: visibility {x}% / 텍스트 {y}% / 기타 {z}%
- data-testid 비율: P%
- 자동 수정: K
- 수동 조치: L

🔍 사용자 검증 권장
1. cd src/test/e2e && npm install   (의존성 변경 시)
2. ./gradlew bootRun                 (백엔드 가동)
3. npx playwright test {module}/{feature}-test.js
4. (선택) npx playwright show-report

⚠️ 수동 조치 항목 (있으면 표시)
- Frontend 컴포넌트에 누락된 data-testid 추가 권장: ...
```

## 테스트 시나리오

### 정상 흐름
**입력:** "프로필 다이얼로그 API 토큰 발급 E2E 테스트 추가" (feature=api-token-create, module=regression)

**예상 산출:**
- `_workspace/e2e_*_{feature}.{json,md}` 4개
- `src/test/e2e/pages/ApiTokenPage.js` 신규
- `src/test/e2e/fixtures/test-fixtures.js` 수정 (apiTokenPage 등록)
- `src/test/e2e/regression/api-token-create-test.js` 신규 (test 3개: happy, sad, edge)

### 에러 흐름
**입력:** "존재하지 않는 컴포넌트 NonExistent.jsx E2E 추가"

**예상 동작:** analyzer가 컴포넌트 grep 실패 → 오케스트레이터에게 보고 → 사용자에게 정확한 경로 요청 → 워크플로우 중단

## 후속 작업 지원

이 스킬이 처리하는 후속 요청:
- "테스트에 시나리오 추가" → Phase 0에서 시나리오 추가 모드 (analyzer만 재실행, 기존 스펙에 append)
- "셀렉터 안정성 다시 검증" → Phase 4만 (qa 재실행)
- "다른 기능 E2E 추가" → 새 feature slug로 추가 실행
- "Page Object 분리" → 기존 PO에서 메서드 추출 (별도 워크플로우 안내)

## 참고

- 에이전트 정의: `.claude/agents/e2e-{scenario-analyzer,page-object-generator,spec-writer,qa}.md`
- 전문 스킬: `.claude/skills/e2e-{scenario-analysis,page-object-generation,spec-writing,qa}/SKILL.md`
- E2E 컨벤션: `src/test/e2e/{authentication,dashboard,project,regression}/` 기존 spec 참고
- Page Object 패턴: `src/test/e2e/pages/{Login,ProjectList,TestCase}Page.js`
