---
name: manual-capture-orchestrator
description: testcasecraft 사용자 매뉴얼(한국어 `docs/manual/new/USER_MANUAL.md` + 영문판 `USER_MANUAL_EN.md` + `docs/manual/*.md`)의 캡처·감사·본문 동기화를 한 번의 명령으로 처리하는 얇은 오케스트레이터. Phase 0(컨텍스트) → 1(환경) → 2(캡처+감사) → 3(STEPS 확장 안내) → 4(본문 동기화) → 5(검증) 흐름. 매뉴얼은 **고정 73장이 아니라 점진적으로 성장하는 자산**으로 다룬다 — 새 페이지/기능 추가 시 감사가 누락을 검출 → 신규 Step 정의 + 매뉴얼 섹션을 함께 추가하여 시스템이 매뉴얼과 같이 진화한다. 트리거 — 한국어 "매뉴얼 갱신", "사용자 매뉴얼 업데이트", "매뉴얼 캡처 + 동기화", "스크린샷 + 본문 같이", "릴리즈 전 매뉴얼 점검", "매뉴얼 재실행", "이미지 다시 찍고 본문도 맞춰", "manual 워크플로우 다시", "새 페이지 매뉴얼에 추가", "영문판 포함 매뉴얼 갱신", "한/영 매뉴얼 같이". 캡처만 단독은 `manual-capture`, 본문만 단독은 `manual-sync` 사용.
---

# manual-capture-orchestrator

testcasecraft 사용자 매뉴얼을 코드·UI 변경과 동기화 상태로 유지하는 워크플로우 리더.

## 핵심 모델 — 매뉴얼은 살아있는 자산

매뉴얼은 일회성 산출물이 아니라 코드와 함께 성장하는 자산이다. 본 오케스트레이터의 목표는:

1. **현재 상태 유지** — 기존 화면이 바뀌면 이미지·본문을 함께 갱신
2. **신규 화면 추적** — 새 페이지·기능이 추가되면 감사가 누락을 검출, 캡처 STEPS 와 매뉴얼 섹션을 함께 신설
3. **드리프트 방지** — 코드와 매뉴얼이 어긋난 부분을 정기적으로 감지

따라서 "73장"은 현재 STEPS 정의 갯수일 뿐이며, 본 워크플로우는 그 수의 증가/감소에 모두 대응한다.

## 실행 모드

- **메인 LLM 단독** (Phase 0~2, 4~5): 결정론적 스크립트 호출 + 보고. 서브 에이전트 없음
- **manual-writer-agent 서브 에이전트** (Phase 3, 선택적): 본문 패치만 분리. 컨텍스트가 길고 신중해야 하는 작업이라 분리 가치 있음

## Phase 0: 컨텍스트 확인 (항상 첫 단계)

`.workspace/manual-capture/` 존재 여부와 사용자 요청 의도를 매칭해 실행 모드를 결정:

| 상황 | 분기 |
|------|------|
| `.workspace/manual-capture/` 미존재 | **초기 실행** — 모든 Phase 정상 진행 |
| 존재 + "다시 실행"·"갱신" | **새 실행** — 직전 run 을 `run_prev/` 로 이동 후 Phase 1 부터 |
| 존재 + "감사만"·"본문만" | **부분 실행** — 해당 Phase 만 |
| 존재 + "이전 결과 보완" | **후속 실행** — 직전 run 결과를 읽고 미해결 항목만 처리 |

산출물 디렉토리 명명:
```
.workspace/manual-capture/run-2026-05-28/
.workspace/manual-capture/run-prev/  ← 직전 실행 보존
```

## Phase 1: 환경 점검

진행 전 다음 4종을 확인. 하나라도 실패하면 사용자에게 보고 후 중단:

```bash
# 1) 백엔드 가동
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/login
# → 200 이 아니면 사용자에게 './gradlew bootRun' 요청. 자동 실행 금지.

# 2) Docker 의존 서비스
docker ps --format "{{.Names}}" | grep -c "testcasecraft-"
# → 4개 이상 (postgres-spring, postgres-rag, rag-service, minio-rag)

# 3) Playwright Python
python3 -c "from playwright.sync_api import sync_playwright" 2>&1
# → 실패 시: pip3 install --user playwright && ~/Library/Python/3.*/bin/playwright install chromium

# 4) 프로젝트 ID
# /api/projects 응답에 1개 이상 존재해야 함 (manual_capture.py 의 resolve_project_id 가 자동 사용)
```

## Phase 2: 캡처 + 감사 (manual-capture 스킬 위임)

> **영문판 트랙**: 한국어 캡처가 영문판에서도 쓰이는 화면이면 EN 캡처도 같이 갱신해야 한다.
> EN 은 ①admin 언어 en 전환 ②`--out-dir docs/manual/new/images_en` ③데이터 화면은 **ShopFlow EN** PID 사용 — 절차는 manual-capture 스킬의 "영문판(EN) 캡처 트랙" 절 참조.
> Phase 4(본문 동기화)에서도 한국어판 수정분을 `USER_MANUAL_EN.md` 같은 섹션에 반영한다 (manual-sync 의 EN 원칙 참조).

`scripts/manual_capture.py` 를 호출하고 결과를 `.workspace` 에 저장:

```bash
RUN_DIR=".workspace/manual-capture/run-$(date +%Y-%m-%d)"
mkdir -p "$RUN_DIR"

python3 scripts/manual_capture.py --audit 2>&1 \
  | tee "$RUN_DIR/capture_and_audit.log"

# 감사 부분만 분리 저장 (manual-sync 위임에 사용)
sed -n '/매뉴얼 커버리지 감사/,$p' "$RUN_DIR/capture_and_audit.log" \
  > "$RUN_DIR/audit_report.txt"
```

부분 실행 옵션:
- 감사만: `--audit-only --skip-login`
- 특정 슬러그만: `--only 80,81,82`
- TODO 강제 시도: `--include-todo --headed`

상세 패턴: `manual-capture` 스킬 참조.

## Phase 3: STEPS 확장 안내 (신규 페이지 추적)

감사 리포트의 "⚠️ 매뉴얼에 누락된 경로" 목록을 분석:

| 경로 유형 | 처리 |
|-----------|------|
| 기존 매뉴얼이 본문에서 다루지만 URL 백틱이 빠진 것 | manual-sync 로 본문에 URL 한 줄만 보강 (Phase 4) |
| 매뉴얼이 아예 다루지 않는 신규 페이지 | **STEPS 확장 필요** — 사용자에게 보고 후 manual_capture.py 에 `Step()` 추가 |
| 코드에서 라우트 제거됐는데 매뉴얼에는 남아있음 | manual-sync 로 본문 정리 + 이미지 archive 이동 |

신규 페이지 발견 시 다음 형식으로 사용자에게 제안:

```
⚠️ 매뉴얼에 누락된 신규 페이지 발견:
   /projects/:id/new-feature

다음 Step 을 scripts/manual_capture.py 에 추가하고, USER_MANUAL.md 에 §X-N 섹션을 신설하시겠습니까?

  Step("90_new_feature", url=_project_path("/new-feature")),

추가하지 않으면 다음 감사에서도 계속 누락으로 보고됩니다.
```

사용자 승인 시:
1. `scripts/manual_capture.py` 의 STEPS 리스트에 `Step()` 항목 추가 (90+ prefix 권장 — `../manual-capture/references/steps-extension.md`)
2. `--only <new-slug>` 로 즉시 캡처 시도
3. Phase 4 에서 매뉴얼 본문에 새 섹션 추가하도록 manual-writer 에게 요청

## Phase 4: 본문 동기화 (manual-sync 스킬 + manual-writer-agent)

Phase 2의 감사 리포트와 Phase 3에서 확장한 STEPS 결과를 입력으로 `manual-writer-agent` 호출:

```
Agent({
  description: "매뉴얼 본문 동기화",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: """
    .claude/agents/manual-writer-agent.md 를 따른다.

    입력:
    - 감사 리포트: .workspace/manual-capture/run-{date}/audit_report.txt
    - 캡처 로그:   .workspace/manual-capture/run-{date}/capture_and_audit.log
    - 신규 STEPS 추가 결과 (Phase 3 산출): .workspace/manual-capture/run-{date}/steps_added.md
    - 타깃 매뉴얼: docs/manual/new/USER_MANUAL.md
                  + 영향받는 docs/manual/*.md

    수행:
    1. 감사 리포트의 누락 경로별로 본문에 URL 백틱 보강
    2. Phase 3 에서 추가된 신규 페이지에 대한 §X-N 섹션 신설 (이미지 alt 포함)
    3. 라우트 제거된 경우 본문 정리
    4. 결과를 .workspace/manual-capture/run-{date}/manual_diff.md 에 보고

    제약:
    - 17 섹션 구조 보존, 번호 시프트 금지
    - 변경분만 패치 (전면 재작성 금지)
    - 코드가 진실의 원천 — 매뉴얼이 코드와 다르면 코드 기준으로 매뉴얼 갱신
  """
})
```

사용자가 "본문은 그대로 두고 캡처만" 의도이면 이 Phase 를 스킵.

## Phase 5: 검증 + 피드백

1. **diff 점검**:
   ```bash
   git diff --stat docs/manual/
   git diff --stat scripts/manual_capture.py
   ```
2. **이미지 vs 본문 정합성**: USER_MANUAL.md 가 참조하는 모든 이미지가 실제로 존재하는지
   ```bash
   grep -oE "images/[a-z0-9_]+\.png" docs/manual/new/USER_MANUAL.md \
     | sort -u | while read p; do
       [ -f "docs/manual/new/$p" ] || echo "MISSING: $p"
     done
   ```
3. **재감사** (선택): manual_capture.py --audit-only 한 번 더 돌려 누락이 0 으로 줄었는지 확인
4. **피드백 수집** (Phase 7-1):
   - "결과에서 개선할 부분이 있나요?"
   - "신규 페이지가 더 있는데 누락된 게 있나요?"
   - 피드백을 CLAUDE.md 변경 이력에 기록

## 데이터 흐름

```
.workspace/manual-capture/run-{YYYY-MM-DD}/
├── capture_and_audit.log    ← Phase 2 전체 콘솔 로그
├── audit_report.txt         ← Phase 2 감사 부분만
├── steps_added.md           ← Phase 3 사용자 승인된 신규 STEPS (있을 때만)
├── manual_diff.md           ← Phase 4 manual-writer 보고서
└── verification.md          ← Phase 5 점검 결과
```

직전 실행은 `run_prev/` 로 자동 이동. 더 이전 run 은 사용자가 정리.

## 에러 핸들링

| 에러 | 대응 |
|------|------|
| 백엔드 응답 안 함 | Phase 1 중단, 사용자에게 `./gradlew bootRun` 요청 |
| Playwright 미설치 | Phase 1 에서 설치 명령 안내 후 중단 |
| 캡처 일부 실패 (ok=42 fail=3) | 실패 슬러그를 verification.md 에 기록, 나머지는 정상 진행 |
| 감사 매처에서 추출 0 경로 | USER_MANUAL.md 가 깨졌을 가능성. 사용자에게 보고하고 중단 |
| manual-writer-agent 가 17 섹션 구조 깨뜨림 | Phase 5 검증에서 감지, `git checkout` 으로 롤백 후 사용자에게 보고 |

## 후속 작업 지원

이전 산출물(`.workspace/manual-capture/run_prev/`)이 있을 때:
- 사용자가 "이전 결과 보완" 요청 → 직전 manual_diff.md 의 "미해결" 항목만 다시 시도
- 사용자가 "감사만 다시" → Phase 2 의 --audit-only 만 실행
- 사용자가 "새 페이지 매뉴얼에 추가" → Phase 3 로 직접 진입 (Phase 1, 2 는 캐시된 결과 사용)

## 테스트 시나리오

**정상 흐름:**
1. UI 변경 (한글 30자 워드랩 추가)
2. 사용자: "매뉴얼 캡처 갱신하고 본문도 맞춰줘"
3. Phase 0: 신규 실행 결정
4. Phase 1: 환경 OK
5. Phase 2: 73 STEPS 모두 캡처, 감사 결과 누락 10 경로 (기존 path 백틱 누락)
6. Phase 3: 모두 "기존 매뉴얼이 본문에서 다루지만 URL 백틱이 빠진 것" 분류, STEPS 확장 불필요
7. Phase 4: manual-writer 가 URL 백틱 추가 + 워드랩 변경 메모 §4-4 에 추가
8. Phase 5: 재감사 누락 0, git diff 확인, 사용자 보고

**신규 페이지 흐름:**
1. 코드에 `/projects/:id/new-feature` 라우트 추가
2. 사용자: "새 페이지도 매뉴얼에 추가해줘"
3. Phase 2 감사가 누락 경로로 검출
4. Phase 3: 사용자에게 STEPS 추가 + 매뉴얼 §X-N 신설 제안 → 승인
5. Phase 3-2: scripts/manual_capture.py 에 Step() 추가, `--only 90` 으로 캡처
6. Phase 4: manual-writer 가 §X-N 섹션 신설 (이미지 alt 포함)
7. Phase 5: 재감사 누락 −1

**에러 흐름:**
1. 사용자: "매뉴얼 갱신"
2. Phase 1 에서 백엔드 응답 000 → 중단
3. 사용자에게 `./gradlew bootRun` 안내 + Docker 컨테이너 상태 보고
4. 사용자가 서버 띄운 뒤 같은 명령 재실행 → 정상 진행

## 참고 스킬·에이전트

- `manual-capture` — 캡처·감사 스크립트 운영
- `manual-sync` — 매뉴얼 본문 동기화 원칙
- `manual-writer-agent` — 본문 패치 실행자 (Phase 4)
- `scripts/manual_capture.py` — Playwright Python 본체 (이미 검증됨)
- `docs/manual/new/USER_MANUAL.md` — 통합 매뉴얼 (17 섹션)
- `docs/manual/*.md` — 챕터별 매뉴얼 (14개)
