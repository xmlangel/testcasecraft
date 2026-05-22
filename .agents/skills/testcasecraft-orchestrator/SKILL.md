---
name: testcasecraft-orchestrator
description: "Use when you need to coordinate full-stack development, execute multi-agent workflows, or orchestrate backend, frontend, and QA agents for the testcasecraft project."
---

# Testcasecraft 메인 오케스트레이터

이 스킬은 `testcasecraft` 프로젝트의 요구사항 분석, 개발, 그리고 검증 생명주기를 총괄 조율하는 메인 오케스트레이터 가이드입니다.

## 1. 아키텍처 및 작업 위임 (invoke_subagent)

단일 에이전트가 처리하기 벅찬 풀스택 요구사항(예: "게시판 목록 API 추가하고 프론트 UI도 만들어서 테스트해줘")이 들어오면, 오케스트레이터는 다음 에이전트들을 순차적/병렬적으로 `invoke_subagent` 도구로 스폰하여 작업을 위임합니다.

- `backend-dev-agent`: Spring Boot 백엔드 비즈니스 로직 작성 위임
- `frontend-dev-agent`: React/MUI 프론트엔드 UI 작성 위임
- `qa-validator-agent`: TestNG/Playwright 검증 위임

## 2. 작업 공간(Workspace) 및 상태 공유

- 에이전트 스폰 전, 현재 프로젝트 작업 위치(예: `_workspace/`)에 요구사항 명세(JSON 또는 MD)를 미리 작성해 두어 서브 에이전트들이 읽을 수 있도록 합니다.
- 백엔드가 작업을 마치면 그 API 명세를 `_workspace/`에 쓰게 하고, 프론트엔드는 이를 읽도록 조율합니다.
- 작업의 상태는 반드시 `task.md`(체크리스트) 아티팩트에 기록하고 지속적으로 갱신합니다.

## 3. 에러 발생 시 처리

- QA 에이전트가 검증 과정에서 실패를 보고하면, 실패 로그를 첨부하여 즉각 담당 개발 에이전트를 재호출(재실행 루프)합니다. 재시도는 최대 2회로 제한하여 무한 루프를 방지합니다.
