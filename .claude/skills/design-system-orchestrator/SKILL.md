---
name: design-system-orchestrator
description: 새 디자인 시스템(테마)을 ThemeContext와 UserProfileDialog에 추가하거나, 기존 디자인 시스템을 기본값으로 변경하는 통합 워크플로우를 실행한다. "디자인 시스템 추가", "디자인 적용", "프로파일에서 디자인 선택", "테마 변경", "기본 디자인 변경", "{디자인명} 적용", "디자인 시스템 다시 적용", "디자인 재구성", "디자인 시스템 업데이트", "다른 디자인 추가" 같은 요청 시 반드시 이 스킬을 사용한다. docs/design/ 폴더의 Design.md 명세를 기반으로 동작한다.
---

# Design System Orchestrator

새 디자인 시스템(테마)을 프로젝트에 추가하거나 기존 디자인 시스템을 기본값으로 변경하는 멀티 에이전트 워크플로우.

**실행 모드:** 에이전트 팀 (TeamCreate 기반, 4명 협업)

## Phase 0: 컨텍스트 확인

워크플로우 시작 전 `_workspace/` 디렉토리 존재 여부와 사용자 요청 형태를 확인한다:

| 상태 | 사용자 요청 | 실행 모드 |
|------|------------|----------|
| `_workspace/` 없음 | 신규 디자인 추가 | **초기 실행** — 전체 Phase 수행 |
| `_workspace/01_tokens_{slug}.json` 존재 | "재추출", "명세 변경 반영" | **부분 재실행** — Phase 1부터 |
| `_workspace/02_integration_*` 존재 | "통합만 다시" | **부분 재실행** — Phase 2부터 |
| `_workspace/03_ui_*` 존재 | "UI 옵션만 추가" | **부분 재실행** — Phase 3만 |
| `_workspace/04_qa_*` 존재 | "검증만 다시" | **부분 재실행** — Phase 4만 |
| `_workspace/` 존재 + 새 slug | 다른 디자인 추가 | **추가 실행** — 전체 Phase, 기존 산출물 보존 |

## Phase 1: 입력 파라미터 수집

사용자 요청에서 다음을 추출한다 (불명확하면 AskUserQuestion):

1. **designPath** — 디자인 명세 파일 경로 (예: `docs/design/CreateSpaceDesign/Design.md`)
2. **slug** — 디자인 시스템 식별자 (자동 추론: `CreateSpaceDesign` → `createspace`)
3. **makeDefault** — 새 디자인을 기본값으로 설정할지 (boolean)
4. **migrationMode** — `new-users-only` | `force-all` | `migrate-glass-only`

## Phase 2: 팀 구성 및 작업 할당

`TeamCreate`로 다음 4명의 팀을 구성한다. 모든 에이전트는 `model: "opus"`로 호출한다.

| 팀원 | 에이전트 정의 | 역할 |
|------|------------|------|
| extractor | `design-token-extractor` | 명세 → 토큰 JSON |
| integrator | `theme-integrator` | 토큰 → ThemeContext + CSS |
| ui-extender | `profile-ui-extender` | UserProfileDialog + i18n |
| qa | `design-system-qa` | 경계면 정합성 검증 |

`TaskCreate`로 작업 의존성을 설정한다:
- Task A: `extractTokens` (extractor 담당)
- Task B: `integrate` (integrator 담당) — blockedBy A
- Task C: `extendUI` (ui-extender 담당) — blockedBy B
- Task D: `verify` (qa 담당) — blockedBy B + C

## Phase 3: 데이터 흐름

```
[extractor]
    ↓ _workspace/01_tokens_{slug}.json
    ↓ SendMessage → integrator: "토큰 추출 완료, 경로 X"
[integrator]
    ↓ src/main/frontend/src/context/ThemeContext.jsx 수정
    ↓ src/main/frontend/src/styles/design-systems/{slug}.css 생성
    ↓ _workspace/02_integration_{slug}.md
    ↓ SendMessage → ui-extender: "통합 완료, slug/name/desc"
    ↓ SendMessage → qa: "통합 완료, 검증 대상 파일 X"
[ui-extender]
    ↓ UserProfileDialog.jsx 라디오 카드 추가
    ↓ i18n 키 추가
    ↓ _workspace/03_ui_extension_{slug}.md
    ↓ SendMessage → qa: "UI 확장 완료"
[qa]
    ↓ 경계면 검증, 자동 수정
    ↓ _workspace/04_qa_report_{slug}.md
    → 오케스트레이터: Pass/Issues 보고
```

**데이터 전달 전략:**
- 메시지 기반(SendMessage): 진행 통지, 가벼운 메타데이터
- 파일 기반(`_workspace/`): 산출물 본문, 다른 에이전트가 참조
- 태스크 기반(TaskCreate/TaskUpdate): 의존성 추적

## Phase 4: 에러 핸들링

| 에러 유형 | 전략 |
|----------|------|
| extractor의 토큰 추출 실패 (Design.md 없음/빈 명세) | 워크플로우 중단, 사용자에게 디자인 명세 확인 요청 |
| integrator의 ThemeContext 수정 실패 (파싱 오류) | 1회 재시도 후 실패 시 변경 롤백 보고 |
| ui-extender의 i18n 키 등록 실패 (Initializer 파일 못 찾음) | UserProfileDialog 수정은 계속, i18n은 fallback 텍스트만 사용. qa 보고서에 명시 |
| qa 검증 실패 (slug 불일치 등) | 자동 수정 가능 항목은 직접 Edit, 불가능한 항목은 사용자 보고 |
| 빌드/린트 실패 | qa는 검증 명령만 보고서에 명시 (직접 실행하지 않음 — AGENTS.md 1.1) |

## Phase 5: 최종 산출물 보고

오케스트레이터는 다음 형식으로 사용자에게 보고한다:

```
✅ 디자인 시스템 "{displayName}" ({slug}) 추가 완료

📁 수정된 파일 (N개)
- ThemeContext.jsx: createXxxTheme 함수 추가, useMemo 분기 확장
- UserProfileDialog.jsx: 라디오 카드 1개 추가
- styles/design-systems/{slug}.css: 신규 생성
- i18n: 한/영 번역 키 N개 추가

⚙️ 동작 변경
- 기본값: {기본값 정책 설명}
- 마이그레이션: {적용된 모드}

🔍 사용자 검증 권장
1. cd src/main/frontend && npm run lint
2. ./gradlew bootRun → 프로파일 → 테마 설정 → {디자인명} 확인
3. 신규 브라우저(시크릿) → 기본값 적용 확인

⚠️ 미해결 이슈: (QA 보고서에서 발췌)
- (있으면 표시)
```

## 테스트 시나리오

### 정상 흐름
**입력:** `docs/design/CreateSpaceDesign/Design.md` 적용, 기본값 변경, 신규 사용자만

**예상 산출:**
- `_workspace/` 디렉토리에 4개 산출물 파일 생성
- ThemeContext.jsx에 `createCreateSpaceTheme(mode)` 함수 추가
- UserProfileDialog.jsx에 "CreateSpace (현재)" 라디오 카드 추가
- `styles/design-systems/createspace.css` 신규 생성
- localStorage 마이그레이션이 new-users-only 모드로 작동

### 에러 흐름
**입력:** 존재하지 않는 `docs/design/Nonexistent/Design.md` 적용 요청

**예상 동작:** Phase 2에서 extractor가 명세 파일 없음 감지 → 오케스트레이터에게 보고 → 워크플로우 중단 → 사용자에게 디자인 명세 작성 요청

## 후속 작업 지원

이 스킬은 다음 후속 요청을 처리한다:
- "다른 디자인 시스템 추가" → Phase 0에서 추가 실행 모드로 분기
- "기본값을 X로 변경" → Phase 2에서 integrator만 호출 (migrationMode 변경)
- "디자인 시스템 제거" → 별도 워크플로우 필요 (현재 미지원, 사용자 안내)
- "Design.md 변경 반영" → Phase 0에서 부분 재실행 모드로 분기

## 참고

- 에이전트 정의: `.claude/agents/design-{token-extractor,integrator,profile-ui-extender,qa}.md`
- 전문 스킬: `.claude/skills/{design-token-extraction,theme-integration,profile-ui-extension,design-system-qa}/SKILL.md`
- 기존 디자인 시스템: `glass`(default 직전), `material3` — ThemeContext.jsx 참조
