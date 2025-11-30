// src/components/RAG/constants.js

/**
 * RAG 채팅 인터페이스 관련 상수들
 */

/**
 * 스크롤 관련 상수
 */
export const SCROLL_CONSTANTS = {
    // 하단으로 간주하는 거리 임계값 (픽셀)
    BOTTOM_THRESHOLD: 80,
};

/**
 * 스트리밍 관련 상수
 */
export const STREAMING_CONSTANTS = {
    // 폴백 스트리밍 청크 크기 (문자 수)
    FALLBACK_CHUNK_SIZE: 8,

    // 폴백 스트리밍 간격 (밀리초)
    FALLBACK_INTERVAL: 24,

    // 버퍼 플러시 간격 (밀리초)
    BUFFER_FLUSH_INTERVAL: 16,
};

/**
 * 메시지 역할 상수
 */
export const MESSAGE_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
};

/**
 * 허용된 메시지 역할 Set
 */
export const ALLOWED_MESSAGE_ROLES = new Set([
    MESSAGE_ROLES.USER,
    MESSAGE_ROLES.ASSISTANT,
    MESSAGE_ROLES.SYSTEM,
]);

/**
 * LLM 제공자 상수
 */
export const LLM_PROVIDERS = {
    OPENAI: 'OPENAI',
    OLLAMA: 'OLLAMA',
    PERPLEXITY: 'PERPLEXITY',
};

/**
 * 에러 타입 상수
 */
export const ERROR_TYPES = {
    ABORT: 'AbortError',
    TYPE: 'TypeError',
    NETWORK: 'NetworkError',
};

/**
 * 에러 메시지 키워드
 */
export const ERROR_MESSAGE_KEYWORDS = {
    NETWORK: ['network', '네트워크'],
    CHUNKED: ['chunked'],
    STREAM: ['stream', '스트리밍'],
};

/**
 * 세션 스토리지 키 접두사
 */
export const STORAGE_PREFIX = {
    CHAT_HISTORY: 'rag-chat-history-',
};

/**
 * UI 상수
 */
export const UI_CONSTANTS = {
    // 전체화면 모드에서 입력 필드 최대 행 수
    FULLSCREEN_MAX_ROWS: 8,

    // 일반 모드에서 입력 필드 최대 행 수
    NORMAL_MAX_ROWS: 4,

    // 메시지 스크롤 지연 시간 (밀리초)
    SCROLL_DELAY: 100,
};

/**
 * 페이지네이션 상수
 */
export const PAGINATION_CONSTANTS = {
    // 문서 목록 기본 페이지 번호
    DEFAULT_PAGE: 1,

    // 문서 목록 기본 페이지 크기
    DEFAULT_PAGE_SIZE: 100,
};

/**
 * DocumentList 관련 상수
 */
export const DOCUMENT_LIST_CONSTANTS = {
    // LLM 분석 요약 페이지 크기
    SUMMARY_PAGE_SIZE: 10,

    // 문서 목록 기본 행 개수
    DEFAULT_ROWS_PER_PAGE: 20,

    // 페이지당 행 수 옵션
    ROWS_PER_PAGE_OPTIONS: [10, 20, 50, 100],

    // 작업 이력 조회 최대 크기
    JOB_HISTORY_MAX_SIZE: 100,

    // 에러 메시지 자동 제거 시간 (밀리초)
    ERROR_AUTO_DISMISS: 5000,

    // 상태 알림 자동 제거 시간 (밀리초)
    STATUS_NOTICE_AUTO_DISMISS: 4000,
};

/**
 * LLM 분석 상태 상수
 */
export const LLM_ANALYSIS_STATUS = {
    NOT_STARTED: 'not_started',
    PENDING: 'pending',
    PROCESSING: 'processing',
    PAUSED: 'paused',
    RESUMING: 'resuming',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ERROR: 'error',
};

/**
 * 문서 타입 상수
 */
export const DOCUMENT_TYPE = {
    // 테스트케이스 문서 접두사
    TESTCASE_PREFIX: 'testcase_',
};
