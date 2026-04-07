---
title: "이행 계획: 탐색 세션 워크스페이스 탭 상태 유지"
date: 2026-04-07
tags:
  - "project/testcasecraft"
  - "topic/ui/persistence"
  - "type/plan"
source: "Docs/Obsidian/2026-04-07-1253-exploratory_tab_persistence/"
---

# 탐색 세션 워크스페이스 탭 상태 유지 구현 계획

탐색 세션 워크스페이스(`ExploratorySessionWorkspace`) 내의 탭 상태(차터 관리, 세션 목록 등)는 현재 컴포넌트의 로컬 상태(`view`)로만 관리되고 있어, 브라우저를 새로고침하면 항상 첫 번째 탭(차터 관리)으로 초기화되는 문제가 있습니다. 이를 `react-router-dom`의 `useSearchParams`를 사용하여 URL과 동기화함으로써 새로고침 후에도 상태가 유지되도록 개선합니다.

## Proposed Changes

### [Frontend] ExploratorySessionWorkspace.jsx

- `react-router-dom`에서 `useSearchParams`를 임포트합니다.
- `view` 상태를 URL의 `tab` 쿼리 파라미터와 연동합니다.
  - `tab=charter`: 차터 관리 (view 0)
  - `tab=list`: 세션 목록 (view 1)
  - `tab=editor`: 세션 편집 (view 2)
  - `tab=debrief`: 디브리프 (view 3)
  - `tab=detail`: 세션 상세 (view 4)
- 세션 편집/상세 탭의 경우 `sessionId` 쿼리 파라미터도 함께 관리하여, 특정 세션을 편집 중인 상태에서 새로고침해도 해당 세션 편집 화면이 유지되도록 합니다.

## Verification Plan

### Manual Verification

1. '탐색 세션' 메뉴 진입 (기본: 차터 관리).
2. '목록' 탭 클릭 -> URL이 `?tab=list`로 변경되는지 확인.
3. 브라우저 새로고침 -> 여전히 '목록' 탭이 선택되어 있는지 확인.
4. 특정 세션 클릭 (편집 진입) -> URL이 `?tab=editor&sessionId=...`로 변경되는지 확인.
5. 브라우저 새로고침 -> 해당 세션의 편집 화면이 유지되는지 확인.
