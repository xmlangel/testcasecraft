// src/hooks/useCaseAutomationFilter.js
import { useCallback, useSyncExternalStore } from "react";
import { AUTOMATION_FILTER } from "../components/TestCaseTree/utils/treeFilter.js";

// ICT-496: 케이스 화면에서 트리와 가운데 케이스 목록이 같은 자동화 필터(전체·자동화·수동)를 본다.
// 둘은 서로 다른 칸이라 상위 상태 대신 모듈 단위 저장소를 함께 구독한다.
let current = AUTOMATION_FILTER.ALL;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => current;

export const setCaseAutomationFilter = (next) => {
  const value = Object.values(AUTOMATION_FILTER).includes(next)
    ? next
    : AUTOMATION_FILTER.ALL;
  if (value === current) return;
  current = value;
  listeners.forEach((listener) => listener());
};

/**
 * 반환값: [filter, setFilter]
 */
const useCaseAutomationFilter = () => {
  const filter = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const setFilter = useCallback((next) => setCaseAutomationFilter(next), []);
  return [filter, setFilter];
};

export default useCaseAutomationFilter;
