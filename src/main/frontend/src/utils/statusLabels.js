// src/utils/statusLabels.js
//
// 서버가 내려주는 상태·우선순위 enum 을 화면 문구로 바꾸는 단일 매핑.
// 칩에 enum 을 그대로 꽂으면 "INPROGRESS", "ACTIVE", "HIGH" 같은 영문 대문자가
// 화면에 그대로 나온다(ICT-511). 화면마다 switch 를 따로 두지 않고 여기서 고른다.
//
// t 는 useI18n/useTranslation 의 번역 함수다. 키가 없거나 번역이 비어 있으면
// 두 번째 인자(한국어 기본값)를 쓴다. 모르는 값은 원래 문자열을 그대로 돌려준다.

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const fallbackT = (_key, defaultValue) => defaultValue;

/** 테스트 실행 상태 → [번역 키, 기본값]. 서버는 IN_PROGRESS·INPROGRESS 를 함께 쓴다. */
export const EXECUTION_STATUS_LABELS = {
  NOTSTARTED: ["testExecution.status.notStarted", "시작 전"],
  NOT_STARTED: ["testExecution.status.notStarted", "시작 전"],
  INPROGRESS: ["testExecution.status.inProgress", "진행 중"],
  IN_PROGRESS: ["testExecution.status.inProgress", "진행 중"],
  COMPLETED: ["testExecution.status.completed", "완료"],
  CANCELLED: ["testExecution.status.cancelled", "취소됨"],
  ABORTED: ["testExecution.status.aborted", "중단됨"],
};

/** 탐색 세션 차터 상태 */
export const CHARTER_STATUS_LABELS = {
  ACTIVE: ["exploratory.charter.status.active", "활성"],
  ARCHIVED: ["exploratory.charter.status.archived", "보관됨"],
};

/** 테스트케이스 우선순위 — 기존 testCase.priority.* 키를 그대로 쓴다. */
export const PRIORITY_LABELS = {
  HIGH: ["testCase.priority.high", "높음"],
  MEDIUM: ["testCase.priority.medium", "보통"],
  LOW: ["testCase.priority.low", "낮음"],
};

const lookup = (table, value, t) => {
  if (value === null || value === undefined || value === "") return "";
  const entry = table[normalize(value)];
  if (!entry) return String(value);
  const [key, defaultValue] = entry;
  return (t || fallbackT)(key, defaultValue);
};

export const getExecutionStatusLabel = (status, t) =>
  lookup(EXECUTION_STATUS_LABELS, status, t);

export const getCharterStatusLabel = (status, t) =>
  lookup(CHARTER_STATUS_LABELS, status, t);

export const getPriorityLabel = (priority, t) =>
  lookup(PRIORITY_LABELS, priority, t);
