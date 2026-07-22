# mcp-server 현행화 — 통합 테스트 플랜 (중재 합성)

- 최종 갱신: 2026-07-22 20:10 KST
- 중재자: test-arbitrator (qa-test-review 3축 팬인)
- 대상: `xmlangel/testcase/testcasecraft/mcp-server` 현행화 (C1 연결필드 3종 · C2 QA총평 도구 · C3 북마크 10도구 · C4 배선 · C5 재빌드, 45→59 도구)
- 팬인 입력: `00_change_inventory.md`(분모) + `01_positive_analysis.md`(긍정 41) + `02_negative_analysis.md`(부정 31) + `03_neutral_analysis.md`(중립 16)
- **3축 모두 산출 완료 — 단측 분석 경고 없음.**

> **TC-ID 규약(전역 유일):** `P-`=긍정 / `N-`=부정 / `B-`=중립 baseline·회귀영향 / `X-`=교차·중재 신규.
> **ID 충돌 정정:** 중립 산출물은 `N-01..N-16`을 썼으나 부정 축 `N-`과 충돌하여 **중립을 `B-01..B-16`으로 리맵**했다(원본 중립 `N-0k` = 본 플랜 `B-0k`). 부정 축의 `N-`는 원번호 유지.
> **실측 게이트(전 축 공통):** upsert/PUT 응답의 `success`·에코를 신뢰하지 말고 **반드시 `testcase_get` / `testexecution_get` / `bookmark_list_*` 재조회**로 판정한다. `z.object` strip과 DELETE 래퍼 `{success:true}`는 조용하다.

---

## 0. 실행 요약

- **통합 TC 수: 89** = 긍정 41 + 부정 31 + 중립 16(→B-) + 중재 신규 5(X-), 이 중 **8건은 축 간 병합(출처 병기, 삭제 아님)**.
- **위험도 분포:** CORRUPTION(조용한 손상) 8 · WRONG-ANSWER/false-success 7 · ERROR-PATH 13 · COMPAT/배선/drift 6 · RACE 3 · happy-path/경계 41 · 회귀 baseline 16.
- **우선순위 분포:** **P0 3클러스터(17 TC)** · P1 5클러스터(38 TC) · P2 4클러스터(34 TC).
- **커버리지 갭: 4건** (G1 북마크 회귀 baseline 부재[신규라 정상, 감시선] · G2 linked\* 라운드트립 필드형 미확정 · G3 QA총평 공백-only trim 미확정 · G4 http-client 409 미매핑 = **실코드 갭**).
- **상충 건수: 3건** — 모두 "MCP 와이어 계층 vs 백엔드 시맨틱"의 층위 상충으로, 판정=**병합 보존 + 백엔드 실측 게이트**(지우지 않음).
- **최상위 3위험(전부 P0):** ① 재빌드 drift 조용한 미노출 · ② linked\* PUT 삭제 시맨틱(omit/`[]`) · ③ zod 원소 검증 공백(빈문자열·중복·자기참조·dangling ID).
- **기존 자동화 스위트: 없음**(`mcp-server`에 `*.test.ts`/`*.spec.ts` 부재) → 사실상 회귀 게이트 = `tsc --noEmit` + MCP `tools/list` 스모크. 중립 사전 실측으로 다수 WIDE 기준선이 현재 그린(§4 참조).

---

## 1. 커버리지 대조표 (분모 = 변경 인벤토리)

| 인벤토리 항목 / 영향면                                                  |          긍정           |          부정           |   중립(B-)    | 갭 판정                                                 |
| ----------------------------------------------------------------------- | :---------------------: | :---------------------: | :-----------: | ------------------------------------------------------- |
| C1 연결필드 happy-path (create/update/3종동시/경계)                     |     10 (P-C1-01~10)     |            —            |       —       | 긍정 단독 OK(오류경로는 아래 행)                        |
| C1 원소검증·경계·회귀(빈문자열·중복·자기참조·dangling·50초과·타입·회귀) |            —            |  9 (N-01~03, N-08~14)   |       —       | **부정 단독 — 정상(엣지는 부정 담당)**                  |
| C1 PUT 삭제 시맨틱 (omit→NULL화 / `[]`→클리어)                          | 1 (P-C1-08 omit 무영향) |    3 (KG-2a/b, N-11)    | 2 (B-13/B-14) | **상충 C-1 — 병합·실측**                                |
| C1 라운드트립 필드형                                                    |       1 (P-C1-10)       |        1 (N-01)         |       —       | **G2: 필드형 미확정 → 실측**                            |
| C2 QA총평 happy-path (저장/덮어쓰기/삭제/경계/왕복)                     |     6 (P-C2-01~06)      |            —            |       —       | 긍정 단독 OK                                            |
| C2 QA총평 오류·삭제 시맨틱 (공백/UTF16/404/초과)                        |            —            |   5 (N-04~07, N-05b)    |       —       | **G3: 공백-only trim 미확정**                           |
| C2 동거 모듈 회귀 (기존 3도구 불변)                                     |            —            |            —            |   1 (B-15)    | 중립 단독 OK                                            |
| C3 북마크 happy-path (10도구·라이프사이클·경계)                         |     17 (P-C3-01~17)     |            —            |       —       | 긍정 단독 OK                                            |
| C3 북마크 오류경로 (404/403/min/max/중복/false-success)                 |            —            |      12 (N-15~26)       |       —       | 부정 단독 — 정상                                        |
| C3 북마크 동시성 (toggle race)                                          |            —            |        1 (N-27)         |       —       | 부정 단독(중립 B-08이 refresh race 인접 커버)           |
| C3 북마크 자체 회귀 baseline                                            |            —            |            —            |       0       | **G1: 신규 기능이라 baseline 부재(정상) — 향후 감시선** |
| C4 배선 (tools/list 노출·이름유일성·라우팅·스키마)                      |     3 (P-C4-01~03)      | 1 (N-KG1b Unknown tool) |  6 (B-01~06)  | 3축 커버 — 견고                                         |
| C5 재빌드 drift                                                         |       1 (P-C5-01)       |      2 (N-KG1a/b)       |   1 (B-16)    | 3축 커버(상충 없음, 병합)                               |
| BR2 공유 http-client (인증·401 refresh·에러매핑)                        |      0 (공통 전제)      |       2 (N-28/29)       |  3 (B-07~09)  | 긍정 0은 정상(blast radius)                             |
| BR3 tsc 빌드 그린                                                       |            0            |            0            |  3 (B-10~12)  | 중립 단독 — 정상(빌드 건전성)                           |
| G4 http-client 409 매핑                                                 |            —            |      1 (N-22 노출)      |       —       | **실코드 갭 — 매핑 추가 권고(X-04)**                    |

**세 축 다 0인 "커버리지 구멍" 없음.** 갭은 (1) 단축 커버가 방법론상 정상인 경우(엣지=부정, 빌드=중립)와 (2) 미확정·실코드 갭 4건(G1~G4)으로 구성.

---

## 2. 상충 조정 결과

세 축이 같은 면을 상반되게 본 항목. **판정 원칙: 데이터 삭제 금지 — 각 축 주장 보존 + 중재판정(근거) + 미결이면 실측 대상 명시.** 세 상충 모두 **"MCP 와이어 계층은 하위호환(중립 맞음) vs 백엔드 시맨틱은 손상 가능(부정 맞음)"의 층위 상충**으로, 서로 다른 계층을 말하므로 실제로는 배타적이지 않다 → 병합 보존.

### 상충 C-1 — C1 연결필드 PUT 시 미전달/`[]`의 운명 (최중요)

- **긍정 주장 (P-C1-08):** linked\* omit은 optional이라 검증 통과, "기존 호출 무영향" — 정상.
- **부정 주장 (KG-2a/b, N-11):** PUT이 백엔드 전체교체(replace) 시맨틱이면 omit된 필드는 NULL화(KG-2b: 연결 3건 조용히 소실), 명시적 `[]`는 기존 링크 **전부 삭제**(N-11, "가장 위험" CORRUPTION).
- **중립 주장 (B-13/B-14):** linked\* 미지정 시 zod 파싱 결과에 키 부재 → JSON 직렬화에서 **body 바이트 불변** = 변경 전과 동일 요청 → 하위호환 유지.
- **중재 판정:** **셋 다 각 계층에서 옳다.** 중립(MCP가 보내는 body는 불변)과 부정(그 body를 받은 백엔드가 관리 컬렉션을 어떻게 병합하느냐)은 **다른 계층**이다. 긍정의 "무영향"은 _omit_ 한정으로 성립하나 _명시적 `[]`_(N-11)는 별개 입력이라 긍정 범위 밖. **결정적 변수는 백엔드 PUT 시맨틱(OQ-A)** — 소스/실측으로만 확정 가능. → **병합하여 P0-2 클러스터로**, omit과 `[]`를 한 흐름에서 재조회 오라클로 구분(X-01).
- **근거:** 커밋 `5d4f5b8c`(연결 링크 삭제 정합성)·`fb9a1a60`가 백엔드에 링크 삭제 경로가 실재함을 시사 → replace 시맨틱 가능성 높음 → 부정 우려를 **미결이 아니라 P0 실측 게이트**로 승격.

### 상충 C-2 — C1 하위호환의 소속 축 (중립 OQ-1 자진 제기)

- **중립 주장 (B-13/B-14):** 연결필드 미지정 기존 호출 body 불변 = 회귀 감시.
- **부정 주장 (N-30):** optional 추가라 기존 호출 무영향 = 하위호환 확인.
- **중재 판정:** 동일 면. 방법론 §스코프경계상 하위호환 파손은 **부정 주도** → **N-30을 대표로, B-13/B-14는 "회귀 감시 baseline"으로 병기 병합**(중립이 body 바이트 비교 오라클을 더 정밀하게 제시하므로 오라클은 중립 것 채택). 삭제 없이 P1-COMPAT 클러스터에 통합.

### 상충 C-3 — 재빌드 후 "59"의 근거·기존 도구 보존

- **긍정 주장 (P-C4-01/P-C5-01):** 재빌드 후 tools/list = 59 (신규 노출 확인).
- **부정 주장 (N-KG1a):** 재빌드 누락 시 stale 45만 노출(조용) = drift 증상.
- **중립 주장 (B-01/B-02/B-16):** 59 중 **기존 45개가 모두 그대로 존재**하고 dist=src 이름집합 IDENTICAL(사전 실측 그린). 단 "45→59 =+14"인데 이번 세션 신규 코드는 C2(1)+C3(10)=11 → **차이 3개의 정체 미확정(중립 OQ-J)**.
- **중재 판정:** 상충 아님(보완 관계). 긍정=신규 노출, 부정=미노출 리스크, 중립=기존 보존+정합. **병합하여 P0-1 클러스터**로. "+14 vs +11" 3개 차이는 **X-02(변경 전 dist 45 도구명 ↔ 현 src 59 도구명 diff)**로 내역 확정 — 이 diff가 N-KG1a·B-02·B-16 오라클을 동시에 정밀화.

---

## 3. 통합 테스트 플랜 (P0~P2, 6열)

형식: `| TC | 입력/절차 | 예상결과 | 기대결과 | 실제결과 | 판정 |`. 실제/판정=`—`(합성 단계, 미실행). **출처**는 표 아래 병기.

### P0 — 최상위 위험 (17 TC) · 라우팅: **MCP 라이브 호출 실측 + 백엔드 소스 확인**

#### P0-1. 재빌드 drift 조용한 미노출 (COMPAT/silent) — 상충 C-3 병합

출처: 부정 N-KG1a/N-KG1b · 긍정 P-C4-01·P-C4-02·P-C4-03·P-C5-01 · 중립 B-01·B-02·B-16 · 중재신규 X-02

| TC          | 입력/절차                                                                   | 예상결과                                                            | 기대결과                                       | 실제결과 | 판정 |
| ----------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- | -------- | ---- |
| N-KG1a      | `npm run build` 미실행(stale dist)로 `.mcp.json` 기동 → `tools/list` 카운트 | 45만 노출, bookmark\_\*·qa_summary 부재(조용)                       | 재빌드 후 59. 미반영이면 최소 버전/도구수 경고 | —        | —    |
| N-KG1b      | 위 stale 상태에서 `bookmark_list_collections` 호출                          | `McpError(MethodNotFound) "Unknown tool"` — 사용자 "기능 깨짐" 오인 | 재빌드 시 정상 동작                            | —        | —    |
| B-01        | 재빌드 후 initialize→tools/list 카운트 + 기존 45개 존재 확인                | 총 59, 기존 45개 **모두 잔존**                                      | 59 & 기존 45 보존                              | —        | —    |
| B-02        | tools/list의 기존 45개 이름집합 = 변경 전 목록 부분집합 대조                | 기존 이름 소실·개명 0                                               | 100% 보존                                      | —        | —    |
| B-16        | `.mcp.json`(dist) tools/list vs src 도구명 집합 diff                        | dist=src, stale 45 잔존 없음                                        | 재빌드가 dist를 src와 동기화                   | —        | —    |
| X-02 (신규) | **변경 전 dist(45) 도구명 ↔ 현 src(59) 도구명 diff**로 "+14" 내역 확정      | 신규 노출 14 = C2(1)+C3(10)+세션 전 미배포 3                        | 14개 신규 노출 각각 정체 확정(중립 OQ-J 해소)  | —        | —    |
| P-C4-01     | initialize→tools/list                                                       | allTools 스프레드에 bookmark10+qa_summary → 59                      | 59 노출                                        | —        | —    |
| P-C5-01     | `npm run build`(tsc) 후 initialize→tools/list                               | dist가 src 반영, 59                                                 | "tools/list=59" 계약 재현                      | —        | —    |

> **탐지 오라클(클러스터):** 기동 직후 `len(tools/list)==59` **AND** 기존45 이름 부분집합 **AND** dist=src diff 공집합. 하나라도 어긋나면 재빌드 게이트 실패. **회귀 게이트 영속화 권고(중립 OQ-4):** 이 3-오라클을 인벤토리 스모크에 상시 추가.

#### P0-2. linked\* PUT 삭제 시맨틱 (CORRUPTION) — 상충 C-1 병합

출처: 부정 KG-2a·KG-2b·N-11 · 중립 B-13·B-14 · 긍정 P-C1-08 · 중재신규 X-01

| TC          | 입력/절차                                                                                                                            | 예상결과                                                                            | 기대결과                                                            | 실제결과 | 판정 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- | ---- |
| KG-2a       | description·steps·tags·linked\* 있는 TC를 `create_or_update{id,projectId,name}`만으로 PUT                                            | 백엔드 replace면 미전달 필드 **모두 소실**(조용)                                    | 미전달 필드 보존(patch), 아니면 "PUT=전체교체" 문서 경고            | —        | —    |
| KG-2b       | linked 3건 설정된 TC를 `{id,projectId,name}`으로 PUT(이름만 변경)                                                                    | 연결 3건 조용히 소실                                                                | 연결 보존                                                           | —        | —    |
| N-11        | 기존 연결 있는 TC에 `linkedTestCaseIds:[]` **명시** 전송                                                                             | `[]`는 undefined 아님→전송→replace면 기존 연결 **전부 삭제**                        | `[]`=명시적 클리어인지 문서화, 의도치 않으면 방어                   | —        | —    |
| B-13        | 연결필드 없이 `create_or_update`(id 없음=POST) 호출                                                                                  | zod optional 통과, 파싱 결과 키 부재 → body에 3필드 미출현                          | 변경 전과 동일 body(신규 필드 누출 0)                               | —        | —    |
| B-14        | id 지정(PUT)+연결필드 미지정                                                                                                         | `{id,...body}` 후 linked\*=undefined→와이어 생략                                    | 기존 update body 불변                                               | —        | —    |
| P-C1-08     | `create_or_update{projectId,name}` (링크 omit, 기존 호출)                                                                            | optional 통과, 링크 키 없음, 기존 동작 동일                                         | 정상 생성, 에러 없음                                                | —        | —    |
| X-01 (신규) | **omit vs `[]` 판별 시퀀스:** 연결 3건 세팅→(a)`{id,name}` PUT→`testcase_get`→(b)`{id,name,linkedTestCaseIds:[]}` PUT→`testcase_get` | (a) omit이 링크 소실시키면 replace-corruption / (b) `[]`가 소실시키면 클리어 시맨틱 | 백엔드 PUT 시맨틱(patch/replace) 확정 + `[]` 의미 문서화(OQ-A 해소) | —        | —    |

> **탐지 오라클(클러스터):** 각 PUT **직후 `testcase_get` 재조회** → 손대지 않은 필드 == 사전 스냅샷. NULL/빈값이면 replace-corruption 확정. **백엔드 소스 확인(OQ-A):** `PUT /api/testcases/{id}` 핸들러가 `@RequestBody` 통째 매핑(replace)인지 부분 병합(patch)인지 판독. 커밋 `5d4f5b8c` 링크 삭제 정합성 로직과 대조.

#### P0-3. zod 원소 검증 공백 (CORRUPTION/silent) — 빈문자열·중복·자기참조·dangling

출처: 부정 N-08·N-09·N-10·N-13·N-16 · 중재신규 X-03

| TC          | 입력/절차                                                                                                       | 예상결과                                                         | 기대결과                                        | 실제결과 | 판정 |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- | -------- | ---- |
| N-08        | `linkedTestCaseIds:[""]` (빈 문자열 원소)                                                                       | `.min(1)` 없음→zod 통과→빈 ID 백엔드 전달→400 또는 조용한 무시   | 빈 ID는 InvalidParams로 클라이언트 거부         | —        | —    |
| N-09        | `linkedTestCaseIds:["A","A"]` (중복)                                                                            | dedup 없음→중복 전달→백엔드 허용 시 중복 연결                    | 중복 제거 또는 명확한 거부                      | —        | —    |
| N-10        | TC `X` 업데이트에 `linkedTestCaseIds:["X"]` (자기참조)                                                          | 검증 없음→자기 링크 저장 시도, 사이클/UI 무한참조                | 자기참조 거부                                   | —        | —    |
| N-13        | `linkedDocumentIds:["없는문서ID"]`                                                                              | 백엔드 검증따라 404/400 또는 dangling 링크 조용히 저장           | 존재하지 않는 참조 거부                         | —        | —    |
| N-16        | `bookmark_add_item{collectionId:유효, testCaseId:"없는TC"}`                                                     | 백엔드 검증 시 404, 미검증 시 dangling 항목 조용히 생성          | 존재하지 않는 TC 거부                           | —        | —    |
| X-03 (신규) | 위 5입력 각각 upsert/add 후 **`testcase_get`/`bookmark_list_items` 재조회**로 dangling·중복·self 실제 반영 검증 | 재조회 배열이 빈ID/중복/self/dangling을 포함하면 corruption 확정 | 응답 success 아닌 재조회 상태로 판정(OQ-G 해소) | —        | —    |

> **탐지 오라클:** upsert 응답 `success`를 **신뢰 금지**, 재조회 배열의 길이·내용으로 판정(N-09/N-13/N-16). **백엔드 확인(OQ-G):** linked\*/add_item의 참조 존재성·자기참조·중복 검증 여부. **코드 권고:** zod에 `.min(1)`·`.refine(dedup)`·self 방어 추가로 클라이언트단 조기 차단(P1-후속).

---

### P1 — 오류경로·시맨틱·회귀 (38 TC)

#### P1-A. C2 QA총평 삭제 시맨틱·경계 (ERROR/WRONG-ANSWER) · 라우팅: MCP 라이브 실측 + 백엔드 @Size 확인

출처: 부정 N-04·N-05·N-05b·N-06·N-07 · 긍정 P-C2-01~06 · 중립 B-15

| TC      | 입력/절차                                                          | 예상결과                                                            | 기대결과                                    | 실제결과 | 판정 |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------- | -------- | ---- |
| P-C2-01 | `update_qa_summary{id:E, qaSummary:"## 총평\n정상"}`               | PUT `/qa-summary` body `{qaSummary}`→200, 응답 TestExecutionDto     | 마크다운 총평 저장·반영                     | —        | —    |
| P-C2-02 | `update_qa_summary{id:E, qaSummary:"수정본"}` (기존값 있음)        | body `{qaSummary:"수정본"}`→200                                     | 기존 총평 교체                              | —        | —    |
| P-C2-03 | `update_qa_summary{id:E}` (qaSummary 생략)                         | `?? ""`→body `{qaSummary:""}`→200                                   | 계약대로 총평 삭제                          | —        | —    |
| P-C2-04 | `update_qa_summary{id:E, qaSummary:""}`                            | body `{qaSummary:""}`→200                                           | 계약대로 삭제                               | —        | —    |
| P-C2-05 | `qaSummary:"a"×10000` (경계)                                       | `.max(10000)` 통과→200                                              | 정확히 10,000자 허용                        | —        | —    |
| P-C2-06 | P-C2-01 후 `testexecution_get{id:E}`                               | 응답 DTO `qaSummary`=저장값                                         | 총평 GET 왕복 정합                          | —        | —    |
| N-04    | `update_qa_summary{id}` (생략) — 삭제 재확인                       | `?? ""`→삭제(의도된 동작)                                           | 총평 삭제                                   | —        | —    |
| N-05    | `qaSummary:"   "` (공백 3칸)                                       | trim 없음→공백 저장, **삭제 안 됨**(사용자 "비웠다" 오인)           | 공백-only는 빈값 취급 또는 그대로 저장 명시 | —        | —    |
| N-05b   | `update_qa_summary{id:"없는ID", qaSummary:"x"}`                    | PUT 404→`McpError(InvalidRequest)` "찾을 수 없음"                   | 명확한 에러                                 | —        | —    |
| N-06    | `qaSummary` 10000(경계)/10001(초과)                                | 10000 통과 / 10001 ZodError "10,000자 이하"                         | 동일                                        | —        | —    |
| N-07    | 이모지 5000개(=UTF-16 10000 code unit)                             | zod length(code unit) 통과, 백엔드가 char/byte면 400 또는 저장 손상 | zod와 백엔드 길이 기준 일치                 | —        | —    |
| B-15    | `testexecution_list`/`_get`/`_record_result` 정의·스키마·경로 확인 | qa_summary 추가가 기존 3도구 항목 변경 안 함                        | 동거 3도구 정의·핸들러 불변                 | —        | —    |

> **오라클:** N-05 → 저장 후 `testexecution_get.qaSummary`가 null 아니면 삭제 실패(G3). **백엔드 확인(OQ-F):** `@Size(max=10000)` char/byte 기준 + 공백 trim 여부. B-15 → testexecution.ts 기존 3핸들러 diff = 무변경.

#### P1-B. C3 북마크 오류경로 — 404/403/min/max/false-success (ERROR/CORRUPTION) · 라우팅: MCP 라이브 실측

출처: 부정 N-15·N-17·N-18·N-19·N-20·N-21·N-23·N-24·N-25·N-26 (N-16→P0-3, N-22→G4/P1-D)

| TC   | 입력/절차                                                     | 예상결과                                                                                      | 기대결과                              | 실제결과 | 판정 |
| ---- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- | -------- | ---- |
| N-15 | `bookmark_add_item{collectionId:"없는모음", testCaseId:유효}` | 404→`McpError(InvalidRequest)` "찾을 수 없음"                                                 | 동일                                  | —        | —    |
| N-17 | 남의 소유 collectionId로 list_items/update_collection         | 403(권한부족) 또는 404                                                                        | 소유자 외 접근 거부                   | —        | —    |
| N-18 | `bookmark_toggle_favorite{testCaseId}` (projectId 생략)       | `projectId.min(1)`→ZodError "프로젝트 ID 필수"                                                | 동일                                  | —        | —    |
| N-19 | `bookmark_create_collection{projectId, name:""}`              | `name.min(1)`→ZodError "모음 이름 필수"                                                       | 동일                                  | —        | —    |
| N-20 | name 101 / description 501 / note 1001 (각 초과)              | 각 ZodError(max 위반)                                                                         | 동일                                  | —        | —    |
| N-21 | `name:"   "` (공백-only, min(1) 통과)                         | length 3→zod 통과→공백 이름 모음 생성                                                         | trim 후 거부 또는 공백 허용 명시      | —        | —    |
| N-23 | `bookmark_delete_collection{collectionId:"없는ID"}`           | 404→throw→`{success:true}` **미반환**, 에러 전달                                              | 없는 리소스 삭제는 에러               | —        | —    |
| N-24 | **기본(default) 모음** 삭제 시도                              | 400/403이면 정상. 200/204로 조용히 무시면 `{success:true}` 반환하나 미삭제(**false-success**) | 기본 모음 삭제 명확한 거부            | —        | —    |
| N-25 | 이미 삭제된 항목 `bookmark_delete_item` 재호출                | 멱등 204면 `{success:true}` 반환하나 no-op(false-success)                                     | 없는 항목은 404 또는 "이미 없음" 구분 | —        | —    |
| N-26 | 남의 소유 itemId `bookmark_delete_item`                       | 403/404→throw→success 미반환                                                                  | 소유자 외 삭제 거부                   | —        | —    |

> **오라클:** N-24 → 삭제 "성공" 후 `bookmark_list_collections` 재조회, 기본 모음 잔존인데 tool이 success면 false-success 확정(OQ-H, OQ-E). N-16(P0-3)/중복은 `bookmark_list_items` 카운트로 dangling 검증.

#### P1-C. C1 연결필드 회귀·인접·경계·타입 (WRONG-ANSWER/ERROR) · 라우팅: MCP 라이브 실측

출처: 부정 N-01·N-02·N-03·N-12·N-14 · 긍정 P-C1-01~07·P-C1-09·P-C1-10 (하위호환 N-30/B-13/B-14는 P0-2·P1-COMPAT)

| TC          | 입력/절차                                                           | 예상결과                                                       | 기대결과                                      | 실제결과 | 판정 |
| ----------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- | -------- | ---- |
| N-01 (회귀) | `linkedTestCaseIds:["유효TC"]` 생성 → `testcase_get`                | fix 후 연결 저장·조회됨(회귀 없음)                             | 연결 저장·조회됨                              | —        | —    |
| N-02 (인접) | 오타 필드 `linkedTestCases:["x"]`(Ids 누락) 전달                    | `z.object` strip→**조용히 탈락**, 에러 없이 success(연결 오인) | 미지원 필드 무시하되 미반영이 결과에 드러나야 | —        | —    |
| N-03 (인접) | zod엔 없고 백엔드엔 있는 미래 필드 전달                             | 동일 클래스 재발 — strip으로 조용히 탈락                       | 구조적 한계 — 문서화                          | —        | —    |
| N-12        | `linkedTestCaseIds` 51개 / 정확히 50개                              | 51 ZodError / 50 통과                                          | 동일                                          | —        | —    |
| N-14        | `linkedTestCaseIds:[123]` (숫자 원소)                               | `z.string()`→ZodError(expected string)                         | 동일                                          | —        | —    |
| P-C1-01     | `create_or_update{projectId, name, linkedTestCaseIds:[A,B]}` (POST) | strict 통과, POST body에 `[A,B]`→응답 TC 링크 2건              | 필드 탈락 없이 전달·저장                      | —        | —    |
| P-C1-02     | `create_or_update{id:X, projectId, name, linkedTestCaseIds:[A]}`    | `{id,...body}`→PUT `/testcases/X`, body에 링크                 | 수정 경로 링크 전달                           | —        | —    |
| P-C1-03     | `create_or_update{projectId, name, linkedDocumentIds:[D]}`          | body에 `[D]`→문서 링크 저장                                    | 문서 링크 전달·저장                           | —        | —    |
| P-C1-04     | `create_or_update{id:X, ..., linkedDocumentIds:[D]}`                | PUT body에 `[D]`                                               | 문서 링크 수정 반영                           | —        | —    |
| P-C1-05     | `create_or_update{projectId, name, linkedJunitTestCaseIds:[J]}`     | body에 `[J]`→저장                                              | JUnit 링크 전달·저장                          | —        | —    |
| P-C1-06     | `create_or_update{id:X, ..., linkedJunitTestCaseIds:[J]}`           | PUT body에 `[J]`                                               | JUnit 링크 수정 반영                          | —        | —    |
| P-C1-07     | 3종 동시 `[A,B]`+`[D]`+`[J]`                                        | 세 배열 모두 body 포함→동시 저장                               | 상호 간섭 없이 저장                           | —        | —    |
| P-C1-09     | `linkedTestCaseIds` 50개(max)                                       | `.max(50)` 경계 통과→50 링크 전달                              | 정확히 50 허용, 절삭·에러 없음                | —        | —    |
| P-C1-10     | P-C1-07 후 `testcase_get{id:Y}`                                     | 응답 DTO에 저장 링크(또는 백엔드 표현형) 포함                  | 링크 GET 왕복 정합                            | —        | —    |

> **오라클(전 축):** N-02/N-03 → upsert 응답 아닌 `testcase_get` 재조회 링크로 판정(z.object strip은 조용). **G2(OQ-B):** P-C1-10 라운드트립 필드형 — `testcase_get`가 `linkedTestCaseIds` 원형인지 객체배열·역방향 필드(커밋 `5d4f5b8c` "역방향 표시")인지 실측 확정.

#### P1-D. http-client 409 미매핑 (실코드 갭 G4) · 라우팅: MCP 라이브 실측 + 코드 수정 권고

출처: 부정 N-22 · 중재신규 X-04

| TC          | 입력/절차                                                                              | 예상결과                                                                                                           | 기대결과                               | 실제결과 | 판정 |
| ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------- | ---- |
| N-22        | `bookmark_add_item` 동일 TC 두 번(중복)                                                | 백엔드 409면 인터셉터 미매핑→최하단 일반 throw `요청 실패 [409]`(왜 실패인지 불명). 허용이면 중복 항목 조용히 생성 | 중복은 idempotent(무시) 또는 명확 에러 | —        | —    |
| X-04 (신규) | http-client 인터셉터에 **409 매핑 추가**(InvalidRequest "이미 존재/충돌") 후 N-22 재현 | 409가 명확한 한국어 에러로 매핑                                                                                    | 사용자가 실패 원인 인지                | —        | —    |

> **오라클:** 인터셉터는 400/401/403/404/500/502/503만 매핑, **409는 미매핑**(부정 §3.3 확인). N-22가 이 경로. **코드 권고:** `http-client.ts` 에러 매핑 테이블에 409 추가. **백엔드 확인(OQ-I):** 중복 add_item에 409/허용/무시 중 무엇인지.

#### P1-E. 하위호환 파손 확인 (COMPAT) — 상충 C-2 병합 · 라우팅: 로컬 body 캡처(저비용, 백엔드 불필요)

출처: 부정 N-30·N-31 · 중립 B-13·B-14(회귀 감시 baseline, 오라클 채택)

| TC               | 입력/절차                                                                  | 예상결과                                                                                                      | 기대결과                           | 실제결과 | 판정 |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------- | ---- |
| N-30             | 기존 `create_or_update` 호출(linked\* 미포함, 구 클라이언트)               | optional 추가라 무영향(회귀 없음)                                                                             | 정상                               | —        | —    |
| N-31             | 인터셉터 DELETE 204→`res.data` 빈 문자열. `res.data` 그대로 반환 계층 有無 | 북마크 DELETE 2종은 `{success:true}` 반환(빈 문자열 노출 없음, 안전). 타 계층이 `return res.data`면 `""` 노출 | 204는 의미 있는 성공 객체로 정규화 | —        | —    |
| B-13/B-14 (병기) | linked\* 미지정 호출의 실제 전송 body를 변경 전 커밋과 **바이트 비교**     | 3필드 부재 확인                                                                                               | 요청 body 불변(하위호환 감시선)    | —        | —    |

> **판정 근거(C-2):** 하위호환은 부정 주도(N-30 대표), 중립 B-13/B-14는 바이트 비교 오라클로 병기 통합. 백엔드 불필요라 body 캡처 모킹으로 저비용 커버 가능(현재 하네스 부재 — §4 갭).

---

### P2 — 회귀 기준선·경계·동시성·통합 (34 TC)

#### P2-A. 북마크 happy-path 전체 (10도구·라이프사이클·경계) · 라우팅: MCP 라이브 실측

출처: 긍정 P-C3-01~17

| TC      | 입력/절차                                                                              | 예상결과                                   | 기대결과                               | 실제결과 | 판정 |
| ------- | -------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------- | -------- | ---- |
| P-C3-01 | `bookmark_list_collections{projectId}`                                                 | GET collections→200, 사용자 소유 배열      | 개인 소유 목록(계정 스코프)            | —        | —    |
| P-C3-02 | `create_collection{projectId, name, description}`                                      | POST→생성 모음(id)                         | 이름·설명대로 생성, 소유자=현재 사용자 | —        | —    |
| P-C3-03 | `create_collection{projectId, name}` (설명 omit)                                       | description undefined 전송→생성            | 설명 없이 생성                         | —        | —    |
| P-C3-04 | `update_collection{collectionId, name, description}`                                   | PUT→200                                    | 이름·설명 갱신                         | —        | —    |
| P-C3-05 | `delete_collection{collectionId}` (비기본)                                             | DELETE 204→`{success:true, collectionId}`  | 삭제, 204→success 정규화               | —        | —    |
| P-C3-06 | `list_items{collectionId}`                                                             | GET items→200 배열                         | 모음 내 케이스 목록                    | —        | —    |
| P-C3-07 | `add_item{collectionId, testCaseId, note}`                                             | POST→생성 항목                             | 메모와 함께 추가                       | —        | —    |
| P-C3-08 | `add_item{collectionId, testCaseId}` (메모 omit)                                       | note undefined 전송→추가                   | 메모 없이 추가                         | —        | —    |
| P-C3-09 | `update_item{itemId, note}`                                                            | PUT→200                                    | 항목 메모 갱신                         | —        | —    |
| P-C3-10 | `delete_item{itemId}`                                                                  | DELETE 204→`{success:true, itemId}`        | 제거, 204→success 정규화               | —        | —    |
| P-C3-11 | `toggle_favorite{testCaseId, projectId}` (미즐겨찾기)                                  | POST toggle, body **null**→bookmarked=true | 즐겨찾기 켜짐                          | —        | —    |
| P-C3-12 | 같은 입력 재호출(멱등 왕복)                                                            | 재토글→bookmarked=false                    | 원상 복귀                              | —        | —    |
| P-C3-13 | `bookmark_status{projectId}`                                                           | GET status→`{testCaseId: bookmarked}` map  | 케이스별 여부 map                      | —        | —    |
| P-C3-14 | create_collection→add_item→list_items→status→toggle→delete_item→delete_collection 순차 | 각 단계 정상, status가 toggle 반영         | 라이프사이클 왕복 정합                 | —        | —    |
| P-C3-15 | `create_collection{name:"a"×100}`                                                      | `.max(100)` 통과→생성                      | 정확히 100자 허용                      | —        | —    |
| P-C3-16 | `create_collection{name, description:"d"×500}`                                         | `.max(500)` 통과→생성                      | 정확히 500자 허용                      | —        | —    |
| P-C3-17 | `add_item{..., note:"n"×1000}`                                                         | `.max(1000)` 통과→추가                     | 정확히 1,000자 메모                    | —        | —    |

> **G2/OQ-D:** P-C3-11~13 기대결과의 정확한 필드형(`{bookmarked:boolean}`? status map 값 타입?)은 소스 미기재(`res.data` 그대로) → 실측 확정. **OQ-E:** P-C3-01 기본 모음 자동생성 여부(0개면 빈배열 vs 기본1개), toggle 대상 기본 모음 존재 전제 확정.

#### P2-B. 배선·디스패치 회귀 기준선 (WIDE) · 라우팅: MCP 라이브 실측 (사전 실측 다수 그린)

출처: 중립 B-03·B-04·B-05·B-06 · 긍정 P-C4-02·P-C4-03 · 부정 N-KG1b(재게시)

| TC      | 입력/절차                                                | 예상결과                                    | 기대결과               | 실제결과 | 판정 |
| ------- | -------------------------------------------------------- | ------------------------------------------- | ---------------------- | -------- | ---- |
| B-03    | tools/list 도구명 중복 0 (`len==len(set)`)               | bookmark\_\* 10종 기존 이름과 충돌 안 함    | 중복 0                 | —        | —    |
| B-04    | 기존 도구 호출(`system_version`,`project_list`) 디스패치 | `allHandlers[name]` 스프레드 충돌로 안 덮임 | 기존 핸들러 정상 호출  | —        | —    |
| B-05    | 미등록 도구명 호출                                       | `MethodNotFound`                            | unknown-tool 방어 불변 | —        | —    |
| B-06    | 각 기존 도구 `inputSchema` 변경 전 대조                  | 스키마 회귀 없음                            | 입력 스키마 불변       | —        | —    |
| P-C4-02 | tools/list에서 `bookmark_*` 10개 이름 확인               | 10도구 전부 존재                            | 북마크 10도구 등재     | —        | —    |
| P-C4-03 | `testexecution_update_qa_summary` 호출 라우팅            | allHandlers 매핑, `Unknown tool` 아님       | 도구↔핸들러 배선 정상  | —        | —    |

#### P2-C. 공유 http-client 회귀·동시성 (WIDE/RACE) · 라우팅: MCP 라이브 실측(백엔드 왕복 필요)

출처: 중립 B-07·B-08·B-09 · 부정 N-27·N-28·N-29

| TC   | 입력/절차                                       | 예상결과                                                                                            | 기대결과                                                           | 실제결과 | 판정 |
| ---- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ---- |
| B-07 | 기존 도구 호출 시 요청 헤더 확인                | Bearer 자동 주입, Browser-UA 동일                                                                   | 인증 주입 불변                                                     | —        | —    |
| B-08 | 유효 refreshToken으로 401 유발→기존 도구 재시도 | single-flight refresh 1회 후 `X-Retried` 재요청                                                     | refresh 경로 불변(신규 도구가 `isRefreshing`/`waiters` 오염 안 함) | —        | —    |
| B-09 | 기존 도구로 400/403/404/500 유발                | InvalidParams/InvalidRequest/InvalidRequest/InternalError + 한국어                                  | 에러 매핑 불변                                                     | —        | —    |
| N-27 | 같은 testCaseId `toggle_favorite` 2회 거의 동시 | read-modify-write race→최종 상태 비결정                                                             | 직렬화되어 예측 가능(짝수 토글→원상태)                             | —        | —    |
| N-28 | 여러 TC 병렬로 첫 401 유발→refresh 경합         | `isRefreshing`+`waiters` 단일 refresh. 실패 시 waiters 재시도→2차 401→`X-Retried`로 skip→일반 throw | 단일 refresh 성공 시 전원 재시도, 실패 시 "로그인 필요" 명확       | —        | —    |
| N-29 | 2차 401(refresh 후도 401)                       | `X-Retried` truthy→refresh skip→매핑 밖→`요청 실패 [401]`(안내 없음)                                | "로그인 필요/토큰 무효" 명확 안내                                  | —        | —    |

> **오라클:** N-27 "짝수 번 토글→원상태" 불변식. B-08/N-28은 동일 refresh single-flight 면 — **병합 감시**(중립=불변 유지, 부정=실패 경로 메시지 품질). **OQ(중립 3):** 라이브 vs 모킹 깊이 — 인증·refresh는 tc.qaspecialist.uk 라이브 왕복 필요.

#### P2-D. tsc 빌드 그린 회귀 (WIDE) · 라우팅: 로컬 `tsc --noEmit`(백엔드 불필요, 사전 실측 그린)

출처: 중립 B-10·B-11·B-12

| TC   | 입력/절차                                                            | 예상결과                                              | 기대결과                                      | 실제결과 | 판정 |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------- | -------- | ---- |
| B-10 | `npx tsc --noEmit` (strict)                                          | exit 0, 에러 0                                        | bookmark.ts+C1/C2 편집이 타 모듈 컴파일 안 깸 | —        | —    |
| B-11 | list 핸들러가 배열 반환하나 선언은 `Promise<Record<string,unknown>>` | 타입 불일치 에러 아님(res.data=any 마스킹, 기존 패턴) | 신규 도구가 기존 반환 규약 준수               | —        | —    |
| B-12 | delete 핸들러가 `{success,...}` 반환(void 회피)                      | 선언 타입 충족, 빌드 그린                             | 신규 delete 반환 형태가 빌드 규약 유지        | —        | —    |

---

## 4. 실행 로드맵

**환경 전제:** 재빌드된 `dist/index.js`(59도구) 기동 · `auth_login` 유효 Bearer · `TESTCASECRAFT_BASE_URL`=tc.qaspecialist.uk · 유효 `projectId`(UUID) · 격리용 신규 project/execution/TC 확보.

**전 축 공통 실측 게이트:** upsert/PUT/DELETE 응답의 `success`·에코 **신뢰 금지** → **`testcase_get`/`testexecution_get`/`bookmark_list_*` 재조회로 판정**(부정 OQ-7 채택).

| 단계          | 클러스터                                                  | 실행 경로(라우팅)                                                              | 선행 확인          | 스킬/환경                                                                                                                           |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0 (게이트)    | P0-1 재빌드 drift                                         | 로컬 `npm run build` → MCP `initialize`/`tools/list` 스모크 + X-02 도구명 diff | —                  | 로컬 tsc + MCP 스모크 (실측)                                                                                                        |
| 1             | P0-2 linked\* 삭제 시맨틱 · P0-3 원소검증                 | **MCP 라이브 호출** + 백엔드 소스 판독(OQ-A/G)                                 | 단계0 통과(59도구) | MCP 라이브 실측 + 백엔드 `PUT` 핸들러 read                                                                                          |
| 2             | P1-A QA총평 · P1-B 북마크 오류 · P1-C 연결필드 · P1-D 409 | **MCP 라이브 호출**(404/403/min·max/재조회)                                    | 단계0              | MCP 라이브 실측                                                                                                                     |
| 2b            | P1-D X-04(409 매핑) · P0-3 zod min/dedup/self             | **코드 수정 권고** 후 재현                                                     | 단계2 결과         | `http-client.ts`·`testcase.ts` 패치 → 재실측                                                                                        |
| 3             | P1-E 하위호환 · B-13/B-14 body 비교                       | **로컬 body 캡처(모킹)** — 백엔드 불필요 저비용                                | —                  | 로컬(현재 캡처 하네스 부재 — 신설 권고)                                                                                             |
| 4             | P2-A 북마크 happy · P2-B 배선 · P2-C http-client·동시성   | **MCP 라이브 호출**(P2-C는 백엔드 왕복)                                        | 단계0              | MCP 라이브 실측                                                                                                                     |
| 5             | P2-D tsc 빌드                                             | **로컬 `tsc --noEmit`**                                                        | —                  | 로컬(사전 실측 그린)                                                                                                                |
| 6 (문서·적재) | 전체 통합 플랜                                            | TC 문서·HTML 시나리오화 → testcasecraft 적재                                   | 실측 판정 채움 후  | 문서·HTML=`qa-tc-scenario` / 적재=`testcasecraft-tc-manage` (`--project-id`) / 실행 결과 기입=`testcasecraft-tc-manage` exec_record |

**회귀 게이트 영속화 권고(중립 OQ-4):** P0-1의 3-오라클(카운트 59 + 기존45 부분집합 + dist=src diff)과 P2-D `tsc --noEmit`를 인벤토리 스모크에 상시 편입 — drift가 반복 실패 패턴이라 자동화 가치 높음. 현재 `mcp-server`에 `*.test.ts` 부재(vitest 하네스 신설 시 P1-E body 캡처·P2-D를 CI 게이트화 가능).

### Open Questions 통합 판정 (13→9, 중복 병합)

| ID   | 통합 질문                                                                  | 원 출처           | 판정/라우팅                                                      |
| ---- | -------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------- |
| OQ-A | PUT `/testcases`·`/collections`·`/items`가 replace냐 patch냐 (+ `[]` 의미) | 긍정#1, 부정 OQ-1 | **P0-2 실측 게이트 + 백엔드 소스 read** (커밋 5d4f5b8c 대조)     |
| OQ-B | linked\* 라운드트립 필드형(원형 vs 객체배열 vs 역방향)                     | 긍정#2, 부정 OQ-7 | **P1-C 실측**(`testcase_get`) — 커밋 5d4f5b8c "역방향 표시" 연관 |
| OQ-C | QA총평 응답 DTO 즉시 에코 여부                                             | 긍정#3            | **P1-A 실측**(응답 vs `testexecution_get` 비교)                  |
| OQ-D | toggle/status 응답 스키마(bookmarked bool? map 값 타입?)                   | 긍정#4            | **P2-A 실측**(소스 미기재, `res.data` 그대로)                    |
| OQ-E | 기본 모음 자동생성·toggle 대상 존재 전제                                   | 긍정#5·#6         | **P2-A/P1-B 실측**(0개 프로젝트에서 확인)                        |
| OQ-F | QA총평 `@Size` char/byte + 공백 trim                                       | 부정 OQ-2         | **P1-A 실측 + 백엔드 @Size read**(G3 해소)                       |
| OQ-G | linked\*/add_item 참조 존재성·self·dedup 검증                              | 부정 OQ-4         | **P0-3 실측 + 백엔드 read**(미검증이면 zod 방어 권고)            |
| OQ-H | DELETE 멱등(없는 리소스 204) vs 404                                        | 부정 OQ-5         | **P1-B 실측**(N-24/N-25 false-success 판정)                      |
| OQ-I | 중복 add_item 409 vs 허용/무시                                             | 부정 OQ-6         | **P1-D 실측 + X-04(409 매핑 권고)**                              |

> **해소된 상충/질문:** 중립 OQ-1(하위호환 소속)→상충 C-2로 병합(부정 주도). 중립 OQ-2("59" 근거)→X-02로 확정. 중립 OQ-3(라이브 깊이)→로드맵 단계4 라이브 라우팅. 중립 OQ-4(게이트 영속화)→상기 권고.

---

## 5. 출처

- **인벤토리(분모):** `_workspace/qa-test-review/00_change_inventory.md`
- **3축 산출물:** `01_positive_analysis.md`(긍정 41, Open Q 6) · `02_negative_analysis.md`(부정 31, Open Q 7) · `03_neutral_analysis.md`(중립 16→B-, Open Q 4, 사전 실측 다수 그린)
- **소스(계약 오라클):** `mcp-server/src/tools/{bookmark,testexecution,testcase}.ts` · `src/{index,http-client,errors}.ts` · `src/tools/index.ts` · `tsconfig.json` · `.mcp.json`
  - `bookmark.ts`(209줄 신규): DELETE 204→`{success:true}` 매핑, toggle body null, min/max
  - `testexecution.ts`: `QaSummaryInput.max(10000)`, `qaSummary ?? ""` 삭제 시맨틱
  - `testcase.ts`: `CreateOrUpdateInput` linked\* `z.array(z.string()).max(50).optional()`(원소 min·dedup 없음), PUT `{id,...body}`
  - `http-client.ts`(무수정): Bearer 주입, 401 single-flight refresh, **400/401/403/404/500/502/503만 매핑 — 409 미매핑**
- **관련 커밋:** 연결 케이스 1.0.97 — `025bc24b`·`fb9a1a60`·`5d4f5b8c`(역방향 표시·삭제 정합성 — OQ-A/OQ-B 판정 오라클)
- **기존 자동화 스위트:** `mcp-server`에 `*.test.ts`/`*.spec.ts`/jest/vitest **부재** → 전 TC 신규, 회귀 게이트=`tsc`+MCP 스모크
- **다운스트림 라우팅:** 실측=MCP 라이브 호출(+로컬 tsc/body 캡처) · TC 문서·HTML=`qa-tc-scenario` · 적재·실행 결과 기입=`testcasecraft-tc-manage`
