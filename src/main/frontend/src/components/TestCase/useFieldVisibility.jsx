// src/components/TestCase/useFieldVisibility.jsx
import { useCallback } from "react";
import { useUiPreference } from "./useUiPreference.jsx";

const SERVER_KEY = "fieldVisibility";

/**
 * 토글 가능한 필드와 기본값.
 * 핵심 필드(이름·스텝·기대 결과)는 토글 대상에서 제외.
 */
export const FIELD_DEFINITIONS = [
  {
    key: "description",
    labelKey: "testcase.form.description",
    labelDefault: "설명",
  },
  {
    key: "preCondition",
    labelKey: "testcase.form.preCondition",
    labelDefault: "사전 조건",
  },
  {
    key: "postCondition",
    labelKey: "testcase.form.postCondition",
    labelDefault: "사후 조건",
  },
  {
    key: "isAutomated",
    labelKey: "testcase.form.isAutomated",
    labelDefault: "자동화 여부",
  },
  {
    key: "executionType",
    labelKey: "testcase.form.executionType",
    labelDefault: "Manual/Automation",
  },
  {
    key: "testTechnique",
    labelKey: "testcase.form.testTechnique",
    labelDefault: "테스트 기법",
  },
  {
    key: "priority",
    labelKey: "testcase.form.priority",
    labelDefault: "우선순위",
  },
  { key: "tags", labelKey: "testcase.form.tags", labelDefault: "태그" },
  {
    key: "linkedDocuments",
    labelKey: "testcase.form.linkedDocuments",
    labelDefault: "연결된 RAG 문서",
  },
];

const DEFAULT_VISIBILITY = FIELD_DEFINITIONS.reduce(
  (acc, f) => ({ ...acc, [f.key]: true }),
  {},
);

/**
 * 테스트케이스 폼의 필드 표시 여부를 사용자별로 서버에 영속화.
 * generic useUiPreference 훅에 의존 — race condition 회피 + 단순화.
 */
export const useFieldVisibility = () => {
  const [visibility, setVisibility] = useUiPreference(
    SERVER_KEY,
    DEFAULT_VISIBILITY,
  );

  const toggle = useCallback(
    (key) => {
      setVisibility((prev) => ({
        ...DEFAULT_VISIBILITY,
        ...prev,
        [key]: !(prev || {})[key],
      }));
    },
    [setVisibility],
  );

  const setAll = useCallback(
    (value) => {
      setVisibility(
        FIELD_DEFINITIONS.reduce((acc, f) => ({ ...acc, [f.key]: value }), {}),
      );
    },
    [setVisibility],
  );

  const reset = useCallback(
    () => setVisibility(DEFAULT_VISIBILITY),
    [setVisibility],
  );

  // null/undefined 안전화
  const safeVisibility = { ...DEFAULT_VISIBILITY, ...(visibility || {}) };

  return { visibility: safeVisibility, toggle, setAll, reset };
};
