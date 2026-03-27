# DocumentList.jsx - 최종 리팩토링 구조

## 📊 리팩토링 최종 결과

### 코드 줄 수 변화

| 항목                 | 이전    | 이후   | 변화     |
| -------------------- | ------- | ------ | -------- |
| **DocumentList.jsx** | 1,485줄 | ~550줄 | **-63%** |

### 생성된 파일

- **Utilities**: 3개 모듈 + constants.js (~300줄)
- **Custom Hooks**: 6개 (~600줄)
- **UI Components**: 5개 (~550줄)
- **Total**: **15개의 새로운 모듈**

---

## 📁 최종 디렉토리 구조

```
src/main/frontend/src/components/RAG/
├── constants.js                          # 🔧 공통 상수 정의 (확장됨)
│
├── utils/                                # 📦 유틸리티 함수들
│   ├── index.js                         # 통합 export
│   ├── messageUtils.js                  # 메시지 처리 (기존)
│   ├── formatUtils.js                   # 포맷팅 (기존)
│   ├── keywordUtils.js                  # 키워드 매칭 (기존)
│   ├── documentUtils.js                 # 문서 처리 (기존)
│   ├── documentFormatUtils.js           # ✨ 날짜/진행률 포맷팅 (NEW)
│   ├── llmAnalysisUtils.js              # ✨ LLM 분석 유틸 (NEW)
│   └── documentFilters.js               # ✨ 문서 필터링 (NEW)
│
├── hooks/                                # 🎣 Custom Hooks
│   ├── useMessageManagement.js          # 메시지 관리 (기존)
│   ├── useScrollManagement.js           # 스크롤 관리 (기존)
│   ├── useStreamingChat.js              # 스트리밍 (기존)
│   ├── useThreadManagement.js           # 스레드 관리 (기존)
│   ├── useLlmConfigManagement.js        # LLM 설정 (기존)
│   ├── useChatSender.js                 # 채팅 전송 (기존)
│   ├── useDocumentList.js               # ✨ 문서 목록 (NEW)
│   ├── useExpandableRows.js             # ✨ 행 확장 (NEW)
│   ├── useLlmAnalysisStates.js          # ✨ LLM 분석 상태 (NEW)
│   ├── useDocumentActions.js            # ✨ 문서 액션 (NEW)
│   ├── useSummaryDialog.js              # ✨ 요약 다이얼로그 (NEW)
│   └── useJobHistory.js                 # ✨ 작업 이력 (NEW)
│
├── DocumentListHeader.jsx                # ✨ 헤더 UI (NEW)
├── DocumentListTabs.jsx                  # ✨ 탭 컴포넌트 (NEW)
├── SummaryDialog.jsx                     # ✨ LLM 분석 요약 (NEW)
├── JobHistoryDialog.jsx                  # ✨ 작업 이력 (NEW)
├── DocumentListDialogs.jsx               # ✨ 다이얼로그 모음 (NEW)
│
├── DocumentList.jsx                      # 🏠 메인 (~550줄)
├── DocumentTableSection.jsx              # 문서 테이블 (기존)
├── DocumentUpload.jsx                    # 업로드 (기존)
├── DocumentPreviewDialog.jsx             # 미리보기 (기존)
├── DocumentChunks.jsx                    # 청크 보기 (기존)
│
├── RAGChatInterface.jsx                  # 채팅 인터페이스 (기존)
├── ChatHeader.jsx                        # 채팅 헤더 (기존)
├── ChatControls.jsx                      # 채팅 컨트롤 (기존)
├── ChatMessageList.jsx                   # 메시지 목록 (기존)
├── ChatInput.jsx                         # 입력 영역 (기존)
├── ChatDialogs.jsx                       # 채팅 다이얼로그 (기존)
│
└── RAGChatInterface_STRUCTURE.md         # 채팅 구조 문서 (기존)
└── DocumentList_STRUCTURE.md             # 📄 이 파일
```

**✨ = DocumentList 리팩토링으로 추가된 파일**

---

## 📦 유틸리티 상세

### constants.js (확장됨)

**DocumentList 관련 상수 추가**

```javascript
export const DOCUMENT_LIST_CONSTANTS = {
  SUMMARY_PAGE_SIZE: 10,
  DEFAULT_ROWS_PER_PAGE: 20,
  ROWS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
  JOB_HISTORY_MAX_SIZE: 100,
  ERROR_AUTO_DISMISS: 5000,
  STATUS_NOTICE_AUTO_DISMISS: 4000,
};

export const LLM_ANALYSIS_STATUS = {
  NOT_STARTED: "not_started",
  PENDING: "pending",
  PROCESSING: "processing",
  PAUSED: "paused",
  RESUMING: "resuming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ERROR: "error",
};

export const DOCUMENT_TYPE = {
  TESTCASE_PREFIX: "testcase_",
};
```

---

### utils/documentFormatUtils.js

**날짜 및 진행률 포맷팅 함수**

```javascript
export function formatDateArray(dateArray)
export function formatProgressSummary(llmState)
export function getProgressColor(progress)
```

**사용 위치**:

- `JobHistoryDialog.jsx`
- `SummaryDialog.jsx`
- `useLlmAnalysisStates.js`

---

### utils/llmAnalysisUtils.js

**LLM 분석 관련 유틸리티**

```javascript
export function buildSummaryMarkdown(results)
export function calculateProgress(processedChunks, totalChunks)
export function getSummaryMarkdownStyles(theme, isFullScreen)
```

**사용 위치**:

- `useSummaryDialog.js`
- `useLlmAnalysisStates.js`

---

### utils/documentFilters.js

**문서 필터링 로직**

```javascript
export function isTestCaseDocument(document)
export function filterRegularDocuments(documents)
export function filterTestCaseDocuments(documents)
```

**사용 위치**: `DocumentList.jsx`

---

## 🎣 Custom Hooks 상세

### useDocumentList.js

**문서 목록 관리**

- 페이지네이션 상태 (`page`, `rowsPerPage`)
- 문서 로드 (`loadDocuments`)
- 새로고침 (`handleRefresh`)

**추출 대상**: DocumentList.jsx lines 79-80, 117-134, 382-399

---

### useExpandableRows.js

**행 확장/축소**

- 확장 상태 관리 (`expandedRows`)
- 토글 핸들러 (`handleRowExpand`)
- 전체 축소 (`collapseAll`)

**추출 대상**: DocumentList.jsx lines 92, 619-625

---

### useLlmAnalysisStates.js

**LLM 분석 상태 관리**

- 각 문서의 분석 상태 조회
- 진행률 계산
- 작업 제어 (일시정지/재개/취소)

**추출 대상**: DocumentList.jsx lines 88-195, 627-692

---

### useDocumentActions.js

**문서 액션 핸들러**

- 삭제, 다운로드
- 분석, 임베딩 생성
- 미리보기, 청크 보기

**추출 대상**: DocumentList.jsx lines 77-78, 401-525

---

### useSummaryDialog.js

**LLM 분석 요약 다이얼로그**

- 요약 페이지네이션
- 요약 데이터 로드
- 전체화면 토글
- 마크다운 스타일

**추출 대상**: DocumentList.jsx lines 94-106, 326-380, 527-580, 730-868

---

### useJobHistory.js

**작업 이력 관리**

- 작업 이력 조회
- 다이얼로그 상태

**추출 대상**: DocumentList.jsx lines 107-110, 583-617

---

## 🎨 UI Components 상세

### DocumentListHeader.jsx (~70줄)

**헤더 컴포넌트**

- 제목
- 새로고침 버튼
- 업로드 버튼

**추출 대상**: DocumentList.jsx lines 941-972

---

### DocumentListTabs.jsx (~50줄)

**탭 컴포넌트**

- 일반 문서 탭
- 테스트케이스 문서 탭 (관리자만)

**추출 대상**: DocumentList.jsx lines 974-988

---

### SummaryDialog.jsx (~220줄)

**LLM 분석 요약 다이얼로그**

- 마크다운 렌더링 with MDEditor
- 페이지네이션
- 전체화면 토글
- 메타 정보 (청크 수, 진행률)

**추출 대상**: DocumentList.jsx lines 1194-1328

---

### JobHistoryDialog.jsx (~180줄)

**작업 이력 다이얼로그**

- 작업 테이블
- 상태, 진행률, 비용 표시
- 에러 메시지 툴팁

**추출 대상**: DocumentList.jsx lines 1330-1473

---

### DocumentListDialogs.jsx (~230줄)

**기타 다이얼로그 모음**

- 삭제 확인
- 업로드
- 공통 문서 이동
- 공통 문서 등록 요청
- 미리보기
- 청크 보기

**추출 대상**: DocumentList.jsx lines 1056-1191

---

## 🏛️ 아키텍처 레이어

```
┌─────────────────────────────────────┐
│   DocumentList.jsx (Main)           │  ← 통합/조율 (~550줄, -63%)
│                                     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼─────┐
   │ Hooks  │      │   UI    │
   │ (6개)  │      │  (5개)  │
   └───┬────┘      └────┬────┘
       │                │
   ┌───▼─────────┐  ┌───▼─────────┐
   │  Utilities  │  │ DocumentTable│
   │   (3개)     │  │   Section    │
   └─────────────┘  │  (기존)      │
       │            └──────────────┘
   ┌───▼─────────┐
   │  Constants  │
   │   (확장)    │
   └─────────────┘
```

---

## 📈 개선 효과

### 코드 감소

- **메인 컴포넌트**: 1,485줄 → ~550줄 (**-63%**)
- **생성되는 모듈**: Hooks 6개 + UI 5개 + Utils 3개 = **14개**

### 중복 제거

- 날짜 포맷팅: 3곳 중복 → 1곳 정의
- 진행률 계산: 2곳 중복 → 1곳 정의
- 문서 필터링: 2곳 중복 → 1곳 정의

### 재사용성

모든 유틸리티 함수와 hooks는 다른 컴포넌트에서도 사용 가능:

```javascript
// 다른 파일에서도 동일한 함수 사용
import { formatDateArray, getProgressColor } from "@/components/RAG/utils";
import { useDocumentList } from "@/components/RAG/hooks/useDocumentList";
```

---

## ✅ 결론

### 달성한 목표

- ✅ 메인 컴포넌트 63% 감소 (1,485줄 → 550줄)
- ✅ 14개 모듈로 분리 (Hooks 6 + UI 5 + Utils 3)
- ✅ 중복 코드 제거
- ✅ 재사용 가능한 유틸리티 생성
- ✅ 모든 기존 기능 100% 보존

### 비교: RAGChatInterface vs DocumentList

| 항목              | RAGChatInterface | DocumentList          |
| ----------------- | ---------------- | --------------------- |
| **Before**        | 2,108줄          | 1,485줄               |
| **After**         | ~630줄           | ~550줄                |
| **감소율**        | -70%             | -63%                  |
| **Hooks**         | 6개              | 6개                   |
| **UI Components** | 5개              | 5개                   |
| **Utils**         | 5개              | 3개 (+ 기존 5개 활용) |

---

**작성일**: 2025-11-30
**패턴**: RAGChatInterface와 동일한 리팩토링 패턴 적용
