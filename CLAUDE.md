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
