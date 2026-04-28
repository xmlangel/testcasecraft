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
