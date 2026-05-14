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

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-14 | 초기 구성 (4 에이전트 + 5 스킬) | 전체 | CreateSpace 디자인 적용 요청, 향후 디자인 시스템 추가 자동화 |
