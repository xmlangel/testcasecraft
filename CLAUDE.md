# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

### 📖 Agent Instructions

All detailed project overview, architecture, development workflow, and testing guidelines are maintained in the unified agent guide:

**👉 [AGENTS.md](@AGENTS.md)**

### 🚀 Quick Start for Claude

- **Project Root**: Always run commands from the project root.
- **Language**: Always respond in **Korean (한국어)**.
- **MCP Servers**: This project uses several MCP servers (e.g., Playwright). See [AGENTS.md](@AGENTS.md) for details.
- **Testing**: Use `npm test` for frontend and `./gradlew test` for backend.
- **Starting App**: Use `./gradlew bootRun` (requires Docker services).

---

## 하네스: 디자인 시스템 관리

**목표:** 프론트엔드 디자인 시스템(테마)을 추가·변경·기본값 설정하는 워크플로우를 4명의 전문 에이전트 팀으로 자동화.

**트리거:** "디자인 시스템 추가", "디자인 적용", "프로파일에서 디자인 선택", "테마 변경", "기본 디자인 변경", "{디자인명} 적용", "디자인 시스템 다시 적용" 등 디자인 시스템 관련 작업 요청 시 `design-system-orchestrator` 스킬을 사용한다. 단순 색상/스타일 질문은 직접 응답.

## 하네스: i18n 키 관리

**목표:** 백엔드 다국어(한/영) i18n 키 추가·검증·등록을 3명 팀으로 자동화. 20개 KeysInitializer + 8쌍 Translations 파일에 분류·작성·4-way 매칭 검증.

**트리거:** "i18n 키 추가", "번역 추가", "한영 번역 등록", "다국어 키 추가", "번역 키 일괄 추가", "i18n 검증", "번역 누락 확인" 등 i18n 관련 작업 요청 시 `i18n-orchestrator` 스킬을 사용한다. 단순 번역값 변경(특정 키 1개)은 직접 처리 가능.

## 하네스: E2E 테스트 추가

**목표:** Playwright E2E 테스트 추가(시나리오 분석 → Page Object → Spec → QA)를 4명 팀으로 자동화. fixture-Spec-PageObject 3자 매칭과 셀렉터 안정성 검증.

**트리거:** "E2E 테스트 추가", "Playwright 테스트 작성", "E2E 시나리오", "회귀 테스트 추가", "Page Object 추가", "{기능} E2E" 등 E2E 관련 작업 요청 시 `e2e-orchestrator` 스킬을 사용한다. 기존 테스트 수정/디버깅은 직접 처리.

## 하네스: 백엔드 API 추가

**목표:** REST API 엔드포인트 추가(설계 → Entity/Repository → Service → Controller → QA)를 5명 팀으로 자동화. 4-layer 정합성 + Swagger + 권한 표현식 + TestNG 스켈레톤까지.

**트리거:** "API 추가", "엔드포인트 만들어", "REST API 추가", "Controller 추가", "Service 메서드 추가", "Entity 추가", "Swagger 보완", "API 검증" 등 백엔드 API 관련 작업 요청 시 `backend-api-orchestrator` 스킬을 사용한다. 단순 버그 수정/리팩토링은 직접 처리.

## 하네스 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-14 | 디자인 시스템 하네스 초기 구성 (4 에이전트 + 5 스킬) | design-system | CreateSpace 디자인 적용 요청, 향후 디자인 시스템 추가 자동화 |
| 2026-05-14 | i18n 키 관리 하네스 구축 (3 에이전트 + 4 스킬) | i18n | 20개 KeysInitializer + 8쌍 번역 파일의 4-way 매칭 자동화. CRITICAL 등록 누락 방지 |
| 2026-05-14 | E2E 테스트 추가 하네스 구축 (4 에이전트 + 5 스킬) | e2e | Playwright + Page Object + fixture 패턴 자동화. 셀렉터 안정성 사전 검증 |
| 2026-05-14 | 백엔드 API 추가 하네스 구축 (5 에이전트 + 6 스킬) | backend-api | 4-layer 아키텍처 자동화. 권한 표현식/Swagger/TestNG 스켈레톤 통합 |
| 2026-05-14 | CreateSpace 다크 토큰 추가 + 레이아웃 안전성 패치 | ThemeContext.jsx, createspace.css, Design.md | 기본 테마인 CreateSpace가 다크 모드 미지원, MuiCard.padding/hover transform/Input.height 고정으로 레이아웃 깨짐. Material3 패턴(`CSTokens = {light, dark}`)으로 토큰 분리하고, padding은 CardContent로 이동, height는 minHeight로, Checkbox/Radio는 svg fontSize로 전환 |
| 2026-05-14 | design-system-qa 강화 (다크 토큰 + 레이아웃 안전성) | agents/design-system-qa.md, skills/design-system-qa/SKILL.md | "dark 누락 시 light fallback 허용" 룰을 제거하고 기본값(또는 기본값이 될) 시스템은 다크 토큰 필수. 7개 위험 레이아웃 패턴(MuiCard.padding, hover transform, OutlinedInput.height, ListItem.height, Checkbox/Radio width/height, paper=default, 전역 body 셀렉터) 자동 검출 추가 |
| 2026-05-14 | CreateSpace 라이트 모드 메뉴 가시성 패치 | ThemeContext.jsx, design-system-qa | `MuiButton.outlined/text` 슬롯에 `color: primary` 가 글로벌로 적용되어 AppBar 안의 `<Button color="inherit">` (대시보드/관리/프로젝트 선택) 가 rose-on-rose로 invisible. 색상을 `outlinedPrimary/textPrimary` 슬롯으로 이전하여 inherit 동작 복원. design-system-qa 에 8번째 위험 패턴(MuiButton outlined/text에 color 키)으로 등록 |

## 하네스 트리거 모호 영역 (주의)

여러 하네스가 관련될 수 있는 요청은 사용자에게 의도 확인:
- "테스트 추가" 단독 → 백엔드 단위 테스트(`backend-api-orchestrator`의 QA) vs E2E 테스트(`e2e-orchestrator`) 구분 필요
- "API i18n 메시지 추가" → `backend-api-orchestrator`가 우선 처리하고 i18n 키는 자동으로 `i18n-orchestrator`로 위임
- "프로파일 테마 옵션 추가" → `design-system-orchestrator`가 처리(profile-ui-extender가 i18n도 다룸). 일반 i18n과 구분
