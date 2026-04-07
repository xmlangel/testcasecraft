---
title: "React Router useSearchParams를 활용한 UI 상태 유지"
date: 2026-04-07
tags:
  - "project/testcasecraft"
  - "topic/react/routing"
  - "topic/ui/persistence"
  - "type/pattern"
  - "level/stable"
  - "knowledge"
source: "Docs/Obsidian/2026-04-07-1253-exploratory_tab_persistence/"
---

# React Router useSearchParams를 활용한 UI 상태 유지

## 개요

React 애플리케이션에서 탭(Tab)이나 필터(Filter)와 같은 UI 상태를 새로고침 후에도 유지하려면, `useState`만으로는 부족합니다. `react-router-dom`의 `useSearchParams`를 사용하여 URL 쿼리 파라미터와 컴포넌트 상태를 동기화하는 패턴을 권장합니다.

## 구현 패턴

### 1. 상태 및 검색 파라미터 초기화

```jsx
import { useSearchParams } from "react-router-dom";

function MyComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "default";
  const [activeTab, setActiveTab] = useState(initialTab);
}
```

### 2. 상태 변경과 URL 동기화

사용자가 탭을 변경할 때 상태를 업데이트함과 동시에 URL 파라미터를 갱신합니다.

```jsx
const handleTabChange = (newTab) => {
  setActiveTab(newTab);
  setSearchParams({ tab: newTab }, { replace: true });
};
```

### 3. URL 변경 대응 (선택 사항)

브라우저의 뒤로 가기/앞으로 가기 버튼에 대응하려면 `useEffect`를 사용합니다.

```jsx
useEffect(() => {
  const tabFromUrl = searchParams.get("tab");
  if (tabFromUrl && tabFromUrl !== activeTab) {
    setActiveTab(tabFromUrl);
  }
}, [searchParams]);
```

## 장점

- **사용자 경험(UX) 향상**: 특정 탭을 열어둔 채 동료에게 링크를 공유하거나 새로고침해도 동일한 화면이 유지됩니다.
- **예측 가능성**: URL이 현재 화면의 상태를 정확히 반영하므로 브라우저 기능(뒤로 가기 등)이 직관적으로 동작합니다.

## 연결된 작업

- [[Docs/Obsidian/2026-04-07-1253-exploratory_tab_persistence/|탐색 세션 워크스페이스 탭 상태 유지]]
