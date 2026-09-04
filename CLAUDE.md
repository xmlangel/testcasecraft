## 0. 세션 로그 (최우선)

**매 세션 시작 시 `.claude/SESSION_LOG.md` 를 읽는다.**

- 의미 있는 작업 단계가 끝날 때마다 SESSION_LOG를 업데이트한다.
- 세션 종료 전 반드시 현재 상태·다음 할 일·이력을 최신화한다.
- 상세 작업 기록은 `.claude/sessions/YYYY-MM-DD.md` 참조.

---
## 하네스: MCP 서버 변환

**목표:** testcasecraft REST API 를 MCP 서버(`mcp-server/`)로 노출 — 인벤토리→설계→구현→검증 파이프라인.

**트리거:** "MCP 만들어/수정/검증/도구 추가" 류 요청 시 `testcasecraft-mcp-orchestrator` 스킬을 사용하라. API 스캔만 필요하면 `testcasecraft-api-inventory`.

---

## 하네스: 사용자 매뉴얼 (한/영)

**목표:** 한국어 `docs/manual/new/USER_MANUAL.md` + 영문판 `USER_MANUAL_EN.md` 를 코드·UI 와 동기화 — 캡처(`images/`·`images_en/`)·감사·본문 패치·검증.

**트리거:** 매뉴얼 갱신/캡처/동기화 요청 시 `manual-capture-orchestrator` 스킬을 사용하라. 캡처만은 `manual-capture`, 본문만은 `manual-sync`. **한국어판을 수정하면 영문판도 같은 섹션을 함께 갱신한다.** 데이터 노출 화면의 EN 캡처는 ShopFlow EN 프로젝트 사용.

---

## 하네스: i18n 감사

**목표:** 프런트 한/영 전환 무결성 — t() 키↔DB 대조, 하드코딩 한국어 검출(`scripts/i18n_scan.py`), 시드 보강, E2E 양방향 검증.

**트리거:** "영어 모드에 한국어가 보여", "번역 누락/보강", "i18n 검사" 류 요청 시 `testcasecraft-i18n-audit` 스킬을 사용하라. 새 UI 문구는 작성 시점에 `t("키", "한국어")` + 시드 추가가 원칙.

---

## 하네스: 온톨로지 시각화

**목표:** testcasecraft 데이터를 온톨로지 그래프로 만들어 Microsoft **Ontology-Playground**에서 본다. 두 층 — (1) 코어 스키마(JPA 엔티티 기반, 전 프로젝트 공용, 재작성 안 함) + (2) 프로젝트별 도메인 오버레이(실제 폴더 계층 `parentId`에서 자동 추출한 "무엇을 테스트하는가" taxonomy).

**트리거:** "테스트케이스 온톨로지", "온톨로지로 시각화", "이 프로젝트 온톨로지로 그려줘", "Ontology-Playground에 올려줘", "도메인 오버레이 만들어" 류 요청 시 `testcasecraft-ontology` 스킬을 사용하라. 단순 트리 조회는 `testcasecraft-tc-manage`(tree_dump). **핵심 원칙:** 코어는 1개 공용, 프로젝트마다 오버레이만 `--project-id`로 재생성(온톨로지 전체 재작성 아님).

**구성:** 스킬 `testcasecraft-ontology` (`.claude/skills/`) + 스크립트 3종(`build_core.py`·`build_overlay.py`·`pg_common.py`). 인증·트리 조회는 글로벌 `testcasecraft-tc-manage`의 `tcc_common` 재사용. Playground repo 기본 경로 `~/kmdata/git/xmlangel/Ontology-Playground`. 이름에 한글이 들어가면 `npm run validate`(Fabric IQ 명명 규칙)는 FAIL(시각화 전용) — 커밋·export용은 `--english-names`.

---

## 하네스: 화면 커버리지 감사

**목표:** 코드가 가진 화면이 화면 기획 문서(`docs/screen_spec/`)·사용자 매뉴얼·캡처에 빠짐없이 있고, 실제 화면이 문서대로 동작하는지 4자 대조로 검증한다. 분모는 코드다.

**트리거:** "화면 커버리지 검증", "누락된 게 없는지 검증", "코드에 있는 것이 문서에 다 있나", "기획문서·매뉴얼·캡처 대조", "화면 감사", "문서화 안 된 라우트 찾아줘", "재감사" 류 요청 시 `screen-coverage-audit` 스킬을 사용하라. 기획 문서 자체의 규격 검사는 `docs/screen_spec/validate.py`, 캡처 촬영은 `manual-capture`, 매뉴얼 본문 수정은 `manual-sync`.

**구성:** 스킬 `screen-coverage-audit` (`.claude/skills/`, `scripts/audit.py` 번들 — code·spec·manual·app·matrix 서브커맨드) + 에이전트 2종 (`screen-coverage-auditor` 문서 축 판정 · `screen-behavior-prober` 실측 축 판정). 산출물은 `.workspace/screen-coverage-audit/`.

**실행 모드:** 하이브리드. 수집은 결정적 스크립트가 단독으로 한다(세는 일에 판단이 끼면 숫자가 매번 달라진다). 판정만 에이전트 2인 병렬 팬아웃 후 메인이 합성. 실측은 앱이 떠 있어야 하고, 없으면 문서 축만 대조하며 리포트에 `미실측`으로 남는다.

**화면 ID 정의가 7곳에 흩어져 있다.** 문서 폴더 이름 · `docs/screen_spec/validate.py` · `build_html.py` · `src/main/frontend/src/constants/screenIds.js` · `README.md` 화면 목록 · `ScreenIdKeysInitializer.java` · 한/영 번역 클래스. 화면을 더하거나 이름을 바꿀 때 일곱 곳을 함께 고친다.

---

## 외부 QA 에이전트 연동 (제품 밖 스택)

자연어 테스트 케이스를 브라우저에서 실행하는 에이전트는 **이 저장소에 없다.** `~/kmdata/git/xmlangel/testcase/testcasecraft-agent` 의 별도 레포이고 별도 compose 로 뜬다. 에이전트가 제품의 공개 API 로 결과를 올리고, 제품은 에이전트의 `/health` 만 확인한다. 호출 방향이 이 한쪽뿐이라 에이전트가 없어도 제품에 죽는 코드가 없다.

**제품 쪽 자산은 연동 설정뿐이다.** `AgentConnection` 엔티티 + 서비스·컨트롤러, 프로젝트 설정의 세 번째 탭(`AgentConnectionSettings.jsx`), 자동화 화면의 딥링크 버튼, i18n `agentConnection.*` 키. 실행·스텝 로그·비용·스크린샷은 제품 DB 에 없다.

- 전역 킬스위치 `agent.integration.enabled` (환경변수 `AGENT_INTEGRATION_ENABLED`, 기본 꺼짐). 꺼지면 탭이 없고 API 는 404
- 봇 계정의 프로젝트 롤은 **`CONTRIBUTOR` 이상**이 필요하다. `TESTER` 는 결과 기록만 되고 실행 생성이 막힌다
- 결과는 `TestExecution` 으로 들어오고 실행명 `[AI]` 접두 · 태그 `ai-agent` · QA 총평 첫 줄로 사람 실행과 갈린다
- 연결 테스트는 `/health` 만 GET 으로 찍고 `status`·`version` 두 필드만 파싱한다. 응답 본문을 그대로 돌려주지 않는다 (SSRF)
- 설계 정본: `docs/plan/LLM_BROWSER_AGENT_AUTOMATION.md` 부록 C·D·E

---

## 하네스 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05 | MCP 하네스 구성 (MCP 에이전트 5 + MCP 스킬 5 + api-inventory 스킬) | agents/, skills/testcasecraft-mcp-* | API→MCP 변환 자동화 |
| 2026-05-29 | 매뉴얼 하네스 구성 (capture/orchestrator/sync + manual-writer-agent) | skills/manual-* | 매뉴얼·캡처 동기화 자동화 |
| 2026-06-06 | manual-sync 에 작성 표준 참조 + 2단계 Agent 검증 절차 | skills/manual-sync | 사용자 요청 — 누락·용어 검증 의무화 |
| 2026-06-06 | 매뉴얼 하네스 EN 확장 (USER_MANUAL_EN·images_en·ShopFlow EN) + capture_interactions.py 번들 | skills/manual-* | 영문판 신설로 drift 방지 필요 |
| 2026-06-06 | i18n 감사 스킬 신설 | skills/testcasecraft-i18n-audit | 1,196건 보강 절차의 재실행 가능화 |
| 2026-06-06 | CLAUDE.md 하네스 포인터 최초 등록 | CLAUDE.md | 포인터 부재 drift 해소 (/harness 감사) |
| 2026-06-06 | 매뉴얼 캡처 도구 강제 규칙 — manual_capture.py 필수, Playwright MCP 금지 | skills/manual-capture | 사용자 피드백 — MCP 브라우저 캡처 패턴 반복 발생 |
| 2026-06-06 | 하네스 감사 권장 조치 — integration-tester 후속작업 지침, manual-writer 섹션명 통일, dead pointer 2건 수정, i18n 스캐너 실행 경로 명시 | agents/, skills/ | /harness 전체 점검 (높음 2·중간 3 해소) |
| 2026-07-21 | 온톨로지 시각화 스킬 신설 (`testcasecraft-ontology` — build_core·build_overlay·pg_common) | skills/testcasecraft-ontology | 사용자 요청 — testcasecraft 데이터를 Ontology-Playground 온톨로지로. 코어 스키마(공용) + 프로젝트별 오버레이(폴더 계층 자동 추출) 2층 구조. AUX 프로젝트(539b1952, 폴더151/케이스1167)로 검증 |
| 2026-07-21 | 오버레이 슬러그·이름 자동화 — `GET /api/projects/<id>`로 실제 name/code 조회 | skills/testcasecraft-ontology/scripts/build_overlay.py | 사용자 지적 — 기본 슬러그가 UUID 8자리(dca4a2a4)라 의미 불명. code 기반 슬러그(testcasecraft-agg/-ags) + 실제 이름(AgensGraph/AgensSQL)으로 전환, 조회 실패 시만 UUID 폴백. 두 프로젝트 재생성해 통일 |
| 2026-08-03 | **화면 커버리지 감사 하네스 신설** (스킬 `screen-coverage-audit` + `audit.py` + 에이전트 2종) | skills/screen-coverage-audit, agents/screen-coverage-auditor·screen-behavior-prober, CLAUDE.md | 화면 기획 문서(`docs/screen_spec/`)를 새로 만들면서 코드·문서·매뉴얼·캡처가 서로 어긋나는지 확인할 방법이 없었다. `manual-capture`가 이미 라우트↔매뉴얼 2자 대조를 하므로 기획 문서 축과 화면 ID 배지 실측을 더해 4자로 넓혔다. 첫 실행에서 실제 결함 다수 검출 — 기획 문서 라우트 줄이 축약형이라 코드와 안 맞던 3화면, 매뉴얼은 쓰는데 기획 문서가 안 가리킨 캡처 11장, 코드에 있으나 문서에 없던 라우트 3개(`/executions/{id}`·`/junit-results/{id}`·`/automation-tests/{id}`), 매뉴얼에 없던 라우트 8개. 매뉴얼 16-4절 「화면 주소 모음」을 한/영 신설해 전 라우트를 담고 갭 0건 달성 |
