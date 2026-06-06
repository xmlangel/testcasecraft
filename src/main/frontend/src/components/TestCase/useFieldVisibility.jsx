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
    labelDefault: "Description",
  },
  {
    key: "preCondition",
    labelKey: "testcase.form.preCondition",
    labelDefault: "Pre-condition",
  },
  {
    key: "postCondition",
    labelKey: "testcase.form.postCondition",
    labelDefault: "Post-condition",
  },
  {
    key: "isAutomated",
    labelKey: "testcase.form.isAutomated",
    labelDefault: "Automated",
  },
  {
    key: "executionType",
    labelKey: "testcase.form.executionType",
    labelDefault: "Execution Type",
  },
  {
    key: "testTechnique",
    labelKey: "testcase.form.testTechnique",
    labelDefault: "Test Technique",
  },
  {
    key: "priority",
    labelKey: "testcase.form.priority",
    labelDefault: "Priority",
  },
  { key: "tags", labelKey: "testcase.form.tags", labelDefault: "Tags" },
  {
    key: "linkedDocuments",
    labelKey: "testcase.form.linkedDocuments",
    labelDefault: "Linked RAG Documents",
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
