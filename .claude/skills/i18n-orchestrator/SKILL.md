---
name: i18n-orchestrator
description: 새 i18n 키를 백엔드(KeysInitializer + Korean/English Translations + TranslationKeyDataInitializer 등록)에 추가하는 통합 워크플로우. "i18n 키 추가", "번역 추가", "한영 번역 등록", "다국어 키 추가", "i18n 키 일괄 추가", "번역 키 재추가", "i18n 검증", "번역 누락 확인", "i18n 키 점검" 같은 요청 시 반드시 이 스킬을 사용한다. AGENTS.md 6장의 i18n 추가 프로세스를 자동화.
---

# i18n Orchestrator

i18n 키 추가의 분류·작성·검증 3단계를 3명의 에이전트 팀으로 자동화.

**실행 모드:** 에이전트 팀 (TeamCreate 기반, 3명 협업)

## Phase 0: 컨텍스트 확인

워크플로우 시작 전 `_workspace/` 내 기존 i18n 산출물 확인:

| 상태 | 사용자 요청 | 실행 모드 |
|------|------------|----------|
| `_workspace/` 내 i18n_* 파일 없음 | 신규 키 추가 | **초기 실행** — 전체 Phase 수행 |
| `_workspace/i18n_01_*` 존재 | "재분류", "분류만 다시" | **부분 재실행** — Phase 1부터 |
| `_workspace/i18n_02_*` 존재 | "작성만 다시" | **부분 재실행** — Phase 2부터 |
| `_workspace/i18n_03_*` 존재 | "검증만 다시", "QA만 다시" | **부분 재실행** — Phase 3만 |
| `_workspace/i18n_*` 존재 + 새 task slug | 다른 키 묶음 추가 | **추가 실행** — 전체 Phase, 기존 산출물 보존 |

## Phase 1: 입력 파라미터 수집

사용자 요청에서 다음을 추출 (불명확 시 AskUserQuestion):

1. **keys** (필수) — 추가할 키 배열. 각 키는 `{keyName, ko, en, description?}` 형식
2. **task** (선택) — 작업 슬러그 (예: `add-profile-tokens`). 미지정 시 timestamp 사용
3. **dryRun** (선택) — true면 분류만 하고 작성 안 함

**입력 형태 변형 허용:**
- 사용자가 자연어로 키만 나열 → 오케스트레이터가 표 형식으로 정리 후 확인
- 사용자가 frontend 코드에서 `t("...")` 호출만 보여줌 → grep으로 키 추출 후 ko/en 요청
- CSV/JSON/Markdown 표 → 파싱하여 표준 형식으로 변환

## Phase 2: 팀 구성 및 작업 할당

`TeamCreate`로 3명 팀 구성. 모든 에이전트는 `model: "opus"`.

| 팀원 | 에이전트 정의 | 역할 |
|------|------------|------|
| classifier | `i18n-classifier` | 키 → 파일 매핑 결정 |
| writer | `i18n-writer` | 키/번역 실제 Java 파일에 삽입 |
| qa | `i18n-qa` | 4-way 일관성 검증 + 자동 수정 |

`TaskCreate`로 작업 의존성 설정:
- Task A: `classify` (classifier 담당)
- Task B: `write` (writer 담당) — blockedBy A
- Task C: `verify` (qa 담당) — blockedBy B

## Phase 3: 데이터 흐름

```
[사용자 입력]
    ↓ keys 배열
[classifier]
    ↓ _workspace/i18n_01_classification_{task}.json
    ↓ newInitializersNeeded 있으면 오케스트레이터에게 우선 보고
    ↓ SendMessage → writer: "분류 완료, 경로 X"
[writer]
    ↓ KeysInitializer + Korean*/English* 수정
    ↓ (선택) 신규 KeysInitializer 클래스 생성 + TranslationKeyDataInitializer 등록
    ↓ _workspace/i18n_02_writing_{task}.md
    ↓ SendMessage → qa: "작성 완료, 수정 파일 목록 X"
[qa]
    ↓ 4-way grep 매칭 + placeholder 검사 + 자동 수정
    ↓ _workspace/i18n_03_qa_report_{task}.md
    → 오케스트레이터: Pass/Auto-fixed/Issues 보고
```

**데이터 전달 전략:**
- 파일 기반(`_workspace/`): 산출물 본문
- 메시지 기반(SendMessage): 진행 통지
- 태스크 기반(TaskCreate): 의존성

## Phase 4: 에러 핸들링

| 에러 유형 | 전략 |
|----------|------|
| classifier가 newInitializersNeeded 보고 | 워크플로우 일시 중단, 사용자에게 신규 클래스 생성 확인. 거부 시 ExtendedUIKeysInitializer fallback |
| 같은 키가 이미 등록되어 있음 | writer가 스킵, QA 보고서에 명시 (오류 아님) |
| writer의 파일 수정 실패 (initialize 메서드 못 찾음) | 해당 파일 작업 건너뜀, QA가 보고 후 사용자 수동 처리 |
| QA가 회귀 감지 (기존 키 값 변경) | 워크플로우 종료, 사용자에게 git diff 검토 요청 |
| QA의 자동 수정 후에도 4-way 매칭 실패 | 보고서에 ❌ Issue로 명시, 사용자 수동 조치 |

## Phase 5: 최종 산출물 보고

```
✅ i18n 키 N개 추가 완료 (task: {task})

📁 수정된 파일
- {Keys 파일들}: +N 키
- Korean*: +N 번역
- English*: +N 번역
- TranslationKeyDataInitializer: 신규 등록 (있으면)

📊 통계
- 처리: N
- 추가: M (4-way 통과)
- 스킵: K (이미 존재)
- 자동 수정: L
- 수동 필요: P

🔍 사용자 검증 권장
1. ./gradlew compileJava — 컴파일 확인
2. (재시작) 백엔드 재시작 후 한/영 전환 UI 확인
3. (DB) 신규 키가 translations 테이블에 적재되었는지 확인

⚠️ 수동 조치 항목: (있으면 표시)
```

## 테스트 시나리오

### 정상 흐름
**입력:** 3개 키 추가 — `userList.button.testNew (ko=테스트, en=Test New)`, `profile.label.foo (ko=Foo 레이블, en=Foo Label)`, `dashboard.stats.bar (ko=Bar 통계, en=Bar Stats)`

**예상 산출:**
- `_workspace/i18n_*_{task}.{json,md}` 3개 파일
- `UserManagementKeysInitializer.java` +1 키 (userList.*)
- `UserManagementKeysInitializer.java` +1 키 (profile.*)
- `DashboardKeysInitializer.java` +1 키 (dashboard.*)
- 한/영 각 3개 번역 추가 (3개 다른 Translations 파일)
- 4-way 모두 매칭, Pass

### 에러 흐름
**입력:** 같은 키 `userList.button.refresh`가 이미 등록되어 있는데 한 번 더 추가 요청

**예상 동작:** classifier가 `existing: true` 표시 → writer 스킵 → QA가 보고서에 "이미 존재로 스킵 1건" 명시

## 후속 작업 지원

이 스킬이 처리하는 후속 요청:
- "i18n 키 일부 누락된 거 수정" → Phase 0에서 부분 재실행
- "한국어만 추가" → 영어 빈 값으로 분류 후 QA가 수동 항목으로 보고
- "신규 도메인 키 추가" → newInitializersNeeded 분기
- "Frontend에서 부르는 키 중 백엔드에 없는 것 찾기" → 별도 워크플로우 안내 (QA만 단독 실행)

## 참고

- 에이전트 정의: `.claude/agents/i18n-{classifier,writer,qa}.md`
- 전문 스킬: `.claude/skills/i18n-{key-classification,writing,qa}/SKILL.md`
- 도메인 매핑 표 출처: `src/main/java/.../i18n/TranslationKeyDataInitializer.java` (2026-05-14 기준)
- 기존 i18n 추가 절차: AGENTS.md 6장
