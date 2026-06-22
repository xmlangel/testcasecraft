// src/components/JUnit/hooks/useAccordionState.js
//
// JUnit 상세 화면의 섹션 Accordion 확장 상태 + localStorage 영속화 훅.
// (JunitResultDetail 에서 추출 — 동작 보존, 구버전 stats 키 마이그레이션 포함)

import { useState } from "react";

const STORAGE_KEY = "testcase-manager-junit-detail-expanded-sections";
const OLD_STATS_KEY = "testcase-manager-junit-detail-stats-accordion";

export default function useAccordionState() {
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return JSON.parse(saved);

    // 기존 stats 상태 마이그레이션 확인
    const oldStatsSaved = localStorage.getItem(OLD_STATS_KEY);
    const statsInitial =
      oldStatsSaved !== null ? JSON.parse(oldStatsSaved) : true;

    return {
      stats: statsInitial,
      testCases: true,
      failedTests: false,
      slowTests: false,
    };
  });

  const handleAccordionChange = (section) => (event, isExpanded) => {
    const newExpanded = { ...expandedSections, [section]: isExpanded };
    setExpandedSections(newExpanded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpanded));
  };

  return { expandedSections, setExpandedSections, handleAccordionChange };
}
