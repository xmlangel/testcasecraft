# mcp-server 현행화 — 통합 개발 액션 계획 (테크리드 중재)

대상: `mcp-server/` REST→MCP 현행화 변경분 (bookmark 10도구 신규 · testexecution QA 총평 1도구 · testcase 연결 케이스 3필드 · index 배선 · dist 재빌드)
합성: 설계(`01_architect.md`) · 구현(`02_reviewer.md`) · 유지보수(`03_maintainer.md`) 3축 팬인
작성: 2026-07-22 20:10 KST

---

## 0. 실행 요약

- **액션 13건** — P0 1 · P1 3 · P2 9.
- **상충/트레이드오프 4건** (그중 1건은 "결정 필요"로 보존 — 도구 표면 다이어트).
- **병합 4건** (같은 `file:line`을 여러 축이 다른 관점으로 지적 → 통합).
- **단측 갭 2건** (SKIP enum은 구현 축만, dist 재빌드는 유지보수 축만 — 서로 안 겹치는 사각지대라 둘 다 실행 순서 상위).
- **핵심 판정:** 이번 delta의 **신규 코드 자체는 세 축 모두 양호**로 수렴(설계 관용구 정합·REST 계약 line-by-line 일치·구현 P0 0건). 진짜 리스크는 코드가 아니라 **구조(src↔dist↔README 4원 drift)와 pre-existing 결함(SKIP enum)**이다. 그래서 P0는 코드 수정이 아니라 drift 차단(package.json 훅)이 된다.
- **권장 착수 top 3:** ① package.json `prepare:tsc`(P0, drift 계열 원천 차단) → ② SKIP enum 수정 + QA 회귀(P1) → ③ 배선·name 유일성 스모크 테스트(P1, 최저비용 가드).

---

## 1. 축 대조표

| 영역 / 위치                                                         | 설계(아키텍트)                                                                  | 구현(리뷰어)                                                              | 유지보수(메인테이너)                                                    | 축 간 긴장                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `bookmark.ts` 전체 골격                                             | 강점 §1.1 — zod→jsonSchema→Tool[]→Handlers 관용구 완전 복제                     | 검증-클린 — body/param 계약 전부 일치                                     | §2 복잡도 부채 낮음(동형)                                               | 없음 — 3축 합치                                                                  |
| `bookmark.ts` DELETE 2도구 (155-159,186-190)                        | 강점 §1.4 — 204 대신 `{success,id}` ack 합성                                    | 검증-클린 — 인터셉터가 4xx throw, 안전                                    | **P1 §1.2** — README "no DELETE" 제약 조용히 위반, 미문서화             | **긴장 A**: 코드 우수(설계+구현) ↔ 문서 제약 위반(유지보수)                      |
| `testexecution.ts:21` result enum                                   | (미언급 — 계약 전부 일치로 판정)                                                | **P1 §1** — `SKIP`은 백엔드 `^(PASS\|FAIL\|BLOCKED\|NOT_RUN)$` 위반 → 400 | (미언급)                                                                | **갭**: 구현 축만 포착. 설계 축의 "계약 전부 일치"를 이 pre-existing 라인이 반증 |
| `bookmark.ts` 경로 보간 7곳 + `testcase.ts`/`testexecution.ts` 기존 | (미언급)                                                                        | **P2 §5** — `encodeURIComponent` 누락, 라우트 리셰이핑/쿼리 인젝션 여지   | (미언급)                                                                | **갭**: 구현 축만. 신규+기존 공통 패턴                                           |
| `testcase.ts:46-53` 연결필드 3종                                    | 강점 §1.3 — body 전체 스프레드로 스키마-only 확장 자동 배선                     | **P2 §3** — clear 시맨틱(omit=보존/`[]`=삭제) description 미고지          | §3.2 — passthrough라 ID검증 갭이 백엔드로 전가(수용 가능)               | 없음(관점 상보) — **병합**                                                       |
| `testexecution.ts:103-111` QA 총평 clear                            | 강점 §1.5 — `qaSummary ?? ""` + description 명시                                | 검증-클린 — 프론트·백엔드와 일치, 결함 아님                               | **P2 §2** — 계약이 description에만, 코드에 주석 없음                    | 없음(관점 상보) — **병합**                                                       |
| `index.ts`+`tools/index.ts` 배선                                    | 강점 §1.1 — 3점 등록 관용구 준수                                                | (미언급)                                                                  | **P1 §5** — 4중 수동 배선, `allTools⊆allHandlers` 불변식 강제 장치 없음 | **긴장 D**: 관용구 깔끔(설계) ↔ 가드 부재(유지보수)                              |
| `package.json` / dist                                               | (범위 밖)                                                                       | (범위 밖)                                                                 | **P0 §1** — `prepare`/`postinstall` 훅 부재 → clone 후 stale dist 반복  | **갭**: 유지보수 축 단독. 최우선 구조 결함                                       |
| `README.md` 도구 인벤토리                                           | §1.7·§4 — 도구 표면 59개(북마크 17%)                                            | (범위 밖)                                                                 | **P1 §5** — "40" 고정, 실제 59 (drift 19)                               | 없음 — 실측으로 확정(§아래)                                                      |
| 도구 표면 경제성                                                    | **리스크 §1.7 P2** — 부차 기능이 17% 차지, 다이어트 검토                        | (미언급)                                                                  | 1:1 완전 매핑을 divergence 방지의 근거로 암묵 지지                      | **긴장 B (결정 필요)**: LLM 선택정확도 ↔ REST 완전 커버리지                      |
| description REST 경로 임베드                                        | **리스크 §1.8 P2** — bookmark/testexec는 경로 포함, org/testplan 미포함(불일치) | (미언급)                                                                  | (미언급)                                                                | **긴장 C**: 일관성 갈림                                                          |
| mcp-server 테스트                                                   | (미언급)                                                                        | (미언급)                                                                  | **P1 §3** — 테스트 0건, 회귀 고정 불가                                  | **갭**: 유지보수 축 단독                                                         |

> **실측 정정 (중재자 확인):** 실제 등록 도구 = **59개** (`grep -c 'name: "' src/tools/*.ts` → auth4·bookmark10·dashboard3·jira3·organization3·project4·rag3·system3·testcase_attachment4·testcase9·testexecution4·testplan3·testresult4·testsession2). 아키텍트의 "약 59"가 정확. 메인테이너의 "40+10+1=51"은 **README 기준선 "40" 자체가 이미 stale**(예: `testcase.ts`는 문서상 6이나 실제 9)이라 과소 집계된 것 — **README drift는 19도구로, 3축이 인지한 것보다 크다.** 이는 §5 README 액션의 "수기 카운트 → 자동 생성" 근거를 강화한다.

---

## 2. 상충 조정 (트레이드오프 — 삭제 없이 병기)

### 긴장 A — bookmark DELETE 도구: 코드 우수 vs 문서 제약 위반

- **설계(강점 §1.4):** 204 빈 body 대신 `{success,id}` ack 합성 → LLM이 "무엇이 지워졌나" 결정적 확인. 계약 명확.
- **구현(검증-클린):** 인터셉터가 4xx/5xx throw → return 도달 = 204 성공. 안전.
- **유지보수(P1 §1.2):** `README.md:9` "no DELETE operations" 명시 제약을 근거 없이 위반. 다음 기여자가 README를 믿으면 가정 붕괴.
- **판정:** 코드는 그대로 둔다(설계·구현 2축 지지, 백엔드에 DELETE 엔드포인트 실재, ack 합성은 개선). **충돌의 실체는 코드가 아니라 문서 stale.** DELETE 허용은 명백히 의도된 설계 변경(백엔드 컨트롤러·개인 소유 스코프)으로 **판정** → 아키텍트 Open Q1·메인테이너 Open Q 해소. **조치는 README 정정(P2, §3 A-6)** — "read/create/update + bookmark 개인 소유 DELETE 허용"으로 제약 문구 갱신.

### 긴장 B — 도구 표면 다이어트 (★ 결정 필요, 보존)

- **설계(리스크 §1.7):** 북마크 10개 = 전체 59의 17%. 개인 즐겨찾기라는 부차 기능 치고 큰 지분. 도구 많을수록 LLM 선택 정확도↓. 대안: 고가치 서브셋(toggle/status/list)만 노출 or `bookmark_manage(action)` 디스패처.
- **반대 논거(설계 §1.2 동전의 양면 + 유지보수 divergence 방지):** "백엔드 REST 1:1 완전 매핑"은 divergence를 구조적으로 줄이는 원칙 — 도구를 골라 빼면 REST↔MCP 커버리지 갭이 생기고, 어느 엔드포인트가 노출됐는지 별도 추적 부담.
- **판정: 결정 필요 항목으로 보존.** 채택 여부는 **이 MCP 서버의 설계 목표**에 종속 — "백엔드 완전 커버리지"면 현 상태 유지가 정답(§1.7 기각), "LLM 고빈도 작업 최적화"면 다이어트 검토. 아키텍트 Open Q1 그대로. **오너 1줄 확인 전까지 코드 변경 금지.**

### 긴장 C — description에 REST 경로 임베드: 일관성 갈림

- **설계(리스크 §1.8):** bookmark/testexecution/testcase는 description에 `GET /api/...` 경로 포함, org/testplan은 미포함. LLM 선택엔 경로가 무의미(토큰만 소모), 가치는 자연어 트리거 문구.
- **판정:** 저비용 표준화 대상이나 기능 무관. **한 방향 정본화 권고 — 경로 제거 + 자연어 트리거 통일**(P2, §3 A-7). 급하지 않음.

### 긴장 D — index.ts 배선: 관용구 깔끔 vs 가드 부재

- **설계(강점 §1.1):** 3점 등록 관용구를 정확히 따름, 인지 부담 0.
- **유지보수(P1 §5):** 4개 touch point(`tools/index.ts` export → `index.ts` import → allTools spread → allHandlers spread)에 강제 장치 없음. `allTools⊆allHandlers` 깨지면 런타임 `MethodNotFound`, 컴파일러 못 잡음.
- **판정: 둘 다 참.** 관용구는 따라가기 쉽지만 **누락을 막는 가드가 없다.** 관용구는 유지하되 **부팅 assert/스모크 테스트로 불변식을 봉인**(P1, §3 A-2). 구조 개편(모듈이 `{tools,handlers}` 쌍 export)은 선택.

---

## 3. 액션 아이템 (P0→P2, file:line · 근거축 · 조치 · 라우팅)

### P0 — 지금 PR에서 수정 (구조 drift 차단)

**A-0 · dist 재빌드 drift 원천 차단**

- 위치: `mcp-server/package.json` (scripts) · 소비처 `/.mcp.json` → `dist/index.js`
- 근거축: 유지보수 P0 §1 (단측 갭 — 이 축만 포착)
- 조치: `"scripts"`에 `"prepare": "tsc"` 추가 → `npm install` 시 자동 빌드(로컬 clone·CI 공통). 이번 사건(5/22 dist↔6/30 src 어긋남, 백엔드 3기능 미반영)의 근본 원인. 이번엔 수동 재빌드(dist mtime 07-22 18:36)로 봉합됐을 뿐 구조 동일.
- 보조: 부팅 시 src 커밋 SHA↔dist 빌드 SHA 비교 `console.error` 경고(선택).
- 라우팅: **지금 PR**. Open Q — CI(`docker-build.yml`)가 mcp-server 빌드 경로 포함하는지 확인(미포함이면 prepare 훅이 유일 방어선).

### P1 — 다음 스프린트 / 리베이스 전

**A-1 · SKIP enum 백엔드 계약 위반 수정**

- 위치: `mcp-server/src/tools/testexecution.ts:21` `result: z.enum(["PASS","FAIL","SKIP","BLOCKED"])`
- 근거축: 구현 P1 §1 (단측 갭 — 이 축만 포착; 설계 축의 "계약 전부 일치" 판정을 반증하는 pre-existing 라인)
- 조치: `z.enum(["PASS","FAIL","BLOCKED","NOT_RUN"])`로 교체. `SKIP` 하위호환 필요 시 핸들러에서 `SKIP→BLOCKED` 매핑(글로벌 `exec_record.py`의 SKIPPED→BLOCKED 선례와 동일 계열). `NOT_RUN`은 현재 미노출 → 초기화 도구 필요 시 함께 노출 검토.
- 라우팅: **지금 PR 권장**(광고하는 값을 서버가 400 거부 = 사용자 대면 결함). + **QA 회귀 → `qa-test-review`**: SKIP로 기록 시도 이력이 있으면 전부 조용히 400 실패했을 것(리뷰어 Open Q2) — 재현/회귀 확인.

**A-2 · 배선·name 유일성 스모크 테스트 (긴장 D 봉인)**

- 위치: `mcp-server/src/index.ts:53,71` (allTools/allHandlers spread), 신규 테스트 파일
- 근거축: 유지보수 P1 §5 (긴장 D — 설계 관용구 강점과 병합)
- 조치: `allTools.every(t => t.name in allHandlers)` + name 중복 검사. 백엔드 불필요·최저비용. 부팅 시 `console.error` 경고 또는 테스트 게이트. 배선 누락을 사용 시점이 아니라 부팅/CI 시점으로 당김.
- 라우팅: **다음 스프린트** (이번 delta 부채를 직접 봉인하는 가장 저비용·고효율 항목 — top 3에 포함).

**A-3 · mcp-server 테스트 하네스 최소 구축**

- 위치: `mcp-server/package.json`(test 스크립트 부재) · 전체(`*.test.ts` 0건)
- 근거축: 유지보수 P1 §3 (단측 갭)
- 조치(점진): ① A-2 배선 테스트(백엔드 무관) → ② Zod 파싱 라운드트립(대표 입력 성공/실패) → ③ `httpClient` mock(nock/msw)로 경로·바디 매핑 계약 테스트(백엔드 rename 조기 검출). 핸들러가 axios에 직결이라 단위=통합 — mock 주입 지점부터.
- 라우팅: 백로그(A-2를 1단계로 착수).

### P2 — 문서화 · 하드닝 · 설계기록

**A-4 · URL path 파라미터 인코딩 하드닝**

- 위치: 신규 `bookmark.ts:149,157,164,171,180,188,195` · 기존 `testcase.ts:176,197,216,231,257`·`testexecution.ts:84,92,105`
- 근거축: 구현 P2 §5
- 조치: 경로 세그먼트를 `encodeURIComponent(input.collectionId)` 등으로 감쌈. `id="x/versions"`(라우트 변경)·`id="x?foo"`(쿼리 인젝션) 방어. 인증된 개인 토큰이라 폭발반경 작으나 입력 하드닝 정석. **bookmark 신규부터 적용, 기존 파일 일괄 정리.**
- 라우팅: 백로그.

**A-5 · 연결필드 clear 시맨틱 description 고지**

- 위치: `testcase.ts:46-49` 스키마 / description `:114`
- 근거축: 구현 P2 §3 (설계 §1.3 강점 + 유지보수 §3.2 passthrough와 **병합** — 같은 위치, 상보 관점)
- 조치: description에 "생략 시 기존 유지, `[]` 전달 시 전체 해제" 한 줄 추가. 동작상 유실은 없으나(백엔드 null-guard) "링크 지워" 의도를 omit으로 처리하면 no-op 조용한 실패.
- 라우팅: 문서화(도구 description).

**A-6 · README 도구 인벤토리 drift 정정 (실제 59)**

- 위치: `README.md:7,9,94,131,116,247-260`
- 근거축: 유지보수 P1 §5 (문서 drift라 P2 버킷, 단 P2 내 최상위 · 설계 §4와 병합)
- 조치: "40 tools" → **59** · Bookmarks 섹션 신설 · "Test Execution (3)" → 4 · Test Cases 연결필드 언급 추가 · 구조트리에 `bookmark.ts` 추가 · **"no DELETE" 제약 문구를 "bookmark 개인 소유 DELETE 허용"으로 정정(긴장 A 해소)**. **근본책: 도구 목록·개수를 `allTools`에서 자동 생성**(수기 카운트가 drift 재발원 — 실측이 이미 문서 40 vs 실제 59로 19 벌어짐).
- 라우팅: 문서화 + build-후 스크립트.

**A-7 · description REST 경로 표준화 (긴장 C)**

- 위치: `bookmark.ts:60,67,73,79,87,92,98,105,111,119` · `testcase.ts:58` (vs org/testplan 미포함)
- 근거축: 설계 P2 §1.8
- 조치: description에서 `GET/POST /api/...` 경로 제거 + org*/testplan*처럼 자연어 트리거 예시 통일. 경로는 핸들러 코드·파일 헤더(`bookmark.ts:6-7`)에 이미 존재 → 실손실 없음, 토큰·LLM 선택 노이즈↓.
- 라우팅: 백로그(저비용, 급하지 않음).

**A-8 · 핸들러 반환 타입 정정**

- 위치: `bookmark.ts:124-127` (및 testcase/testexecution 핸들러 맵) `Record<string,unknown>`
- 근거축: 구현 P2 §5 (STYLE)
- 조치: list/status 핸들러가 배열·스칼라 반환 가능하나 선언은 `Record` → `Promise<unknown>`으로. 기능 버그 아님(현재 any 관용). 응답 타입 조일 때 사전 방어.
- 라우팅: 백로그.

**A-9 · list 반환 래핑 일관성 결정**

- 위치: `bookmark_list_collections`/`_list_items` (미래핑) vs `testcase_list` `{items: res.data}` (래핑)
- 근거축: 구현 Open Q1
- 조치: 소비 측이 `{items:[...]}` 래핑 기대 여부 확인 후 한 방향 통일. JSON.stringify엔 문제 없음.
- 라우팅: 별도 이슈(확인 필요).

**A-10 · qaSummary clear 계약 인라인 주석**

- 위치: `testexecution.ts:107`
- 근거축: 유지보수 P2 §2 (설계 §1.5 강점 + 구현 검증-클린과 **병합** — 같은 위치 3축)
- 조치: `// 계약: 백엔드는 qaSummary="" 를 총평 삭제로 해석` 1줄. 백엔드가 규약 변경(null 요구) 시 조용한 오작동 방지. QA 축과 교차 확인(백엔드 계약 확정 여부 — 유지보수 Open Q).
- 라우팅: 문서화(주석).

**A-11 · 서버 version 하드코딩 해제**

- 위치: `index.ts:80` `version:"0.1.0"` · `package.json:3`
- 근거축: 유지보수 P2 §5
- 조치: `index.ts`가 `package.json` version import + 변경 시 bump. drift 가시화 보조(클라이언트가 어느 빌드에 붙었는지 식별).
- 라우팅: 백로그.

**A-12 · CLAUDE.md 하네스 이력 기재**

- 위치: 프로젝트 `CLAUDE.md` "## 하네스 변경 이력" 표
- 근거축: 유지보수 P2 §5
- 조치: "2026-07-22 | MCP 현행화(bookmark 10 + QA 총평 + 연결 케이스 필드) + dist 재빌드" 1행 추가. "dist 언제·왜 재빌드됐나" 추적 단서.
- 라우팅: 설계기록.

---

## 4. 유지할 설계 강점 (회귀 방지)

1. **관용구 완전 정합** (`bookmark.ts` 전체) — zod→jsonSchema→Tool[]→Handlers 4단 복제. 신규 도메인 baseline. _(단, A-2 가드로 배선 누락만 봉인.)_
2. **REST 계약 line-by-line 충실 매핑** (설계 §1.2 + 구현 검증-클린) — param/body 배치까지 백엔드와 일치. 추측 없이 실제 컨트롤러 대조. **SKIP enum(A-1)은 pre-existing 예외이지 이번 delta의 매핑 품질 흠결 아님.**
3. **핸들러 body 전체 스프레드 → 스키마-only 확장** (`testcase.ts` create_or_update) — 연결필드 3종이 핸들러 무수정 자동 배선. cherry-pick 안티패턴 회피.
4. **삭제 응답 ack 합성** (설계 §1.4) — 204 대신 `{success,id}` 결정적 확인. **긴장 A에도 불구 코드는 유지.**
5. **clear 시맨틱 명시** (설계 §1.5) — `qaSummary ?? ""` + description. A-10은 주석 보강일 뿐 동작 유지.
6. **검증 경계 백엔드 동기** — 모든 max 상한이 백엔드 `@Size`/DTO와 일치(linked\*.max(50) ↔ `@Size(max=50)`). 프론트-백 이중 검증 자동 성립.

---

## 5. 출처

- 3축 산출물: `_workspace/dev-code-review/{01_architect,02_reviewer,03_maintainer}.md`
- 중재자 실측:
  - 도구 수 = 59 (`grep -c 'name: "' src/tools/*.ts` per-file 집계)
  - `README.md:7,9,94` = "40 tools" (drift 19)
  - `package.json` scripts = build/start/dev만, `prepare`/`test` 부재; version 0.1.0
  - `testexecution.ts:21` SKIP enum 재확인
  - `bookmark.ts:157,180,188` delete/put path 미인코딩 재확인
- 백엔드 계약(리뷰어 대조): `dto/TestResultDto.java:19` @Pattern, `mapper/TestCaseMapper.java:134-145,226-237`, `frontend/.../TestResultDetailTable.jsx:253`
