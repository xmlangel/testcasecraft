# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

---

### 📖 Agent Instructions

All detailed project overview, architecture, development workflow, and testing guidelines are maintained in the unified agent guide:

**👉 [AGENTS.md](file:///Users/dicky/kmdata/git/testcase/testcasecraft/AGENTS.md)**

### 🚀 Quick Start for Gemini

- **Language**: Always respond in **Korean (한국어)**.
- **Source of Truth**: Refer to [AGENTS.md](file:///Users/dicky/kmdata/git/testcase/testcasecraft/AGENTS.md) for all project rules and technical details.
- **Workflow**:
  1. Follow the Planning Mode (Research -> Plan -> Approve -> Execute).
  2. Verify changes with tests before completion.
- **Startup**: Ensure Docker infrastructure is running before starting Spring Boot.

## 🚀 하네스 오케스트레이션 (Harness Orchestration)

- **설명**: `testcasecraft` 프로젝트의 풀스택 멀티 에이전트 팀 및 전문 스킬셋(Backend, Frontend, QA) 협업을 조율하고 관리합니다.
- **트리거**: 에이전트 간 협업, 백엔드/프론트엔드 동시 개발, 크로스 바운더리 QA 등 대규모 작업 위임이 필요할 때는 글로벌 스킬인 `testcasecraft-orchestrator` 스킬을 사용하여 비동기 협업 파이프라인(Phase 1~7)을 작동시키십시오.
