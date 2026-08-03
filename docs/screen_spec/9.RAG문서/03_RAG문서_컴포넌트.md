# RAG 문서(S9) 컴포넌트

> 화면 ID **S9** · 상위 문서: [`02_RAG문서_화면정의.md`](02_RAG문서_화면정의.md)

---

## 1. 컴포넌트 트리

<S9-RAG>
├── <RAGDocumentManager> (탭 0: 문서 관리)
│ ├── <AlertBox> (오류·경고)
│ ├── <DocumentList> (테이블)
│ │ └── <DocumentRow> (각 행)
│ │ └── <DocumentMenu> (⋮ 메뉴)
│ ├── <FileUploadDialog> (파일 업로드)
│ └── <DeleteConfirmDialog> (삭제 확인)
├── <RAGChatInterface> (탭 1: 채팅)
│ ├── <ChatMessages> (메시지 목록)
│ │ └── <ChatMessage> (각 메시지)
│ │ └── <CitationLink> (출처 인용 링크)
│ ├── <ChatInput> (입력창)
│ └── <AnalysisButton> (분석 시작)
├── <DocumentAnalysis> (모달: 분석)
│ ├── <CostEstimate> (비용 추정)
│ ├── <AnalysisProgress> (진행률)
│ └── <AnalysisSummary> (완료 · 요약 저장)
└── <RAGSystemSettings> (숨김: 관리 페이지, `/admin/rag`)

**주요 컴포넌트별 기능**

| 컴포넌트 | 역할 | 지연 로드 |
|---|---|---|
| 문서 관리 영역 | 진입점 및 탭 0 콘텐츠 관리 | ○ |
| 문서 목록 | 테이블 렌더 및 상태 폴링 | — |
| 파일 업로드 | 드래그 드롭 및 파일 입력 | — |
| 채팅 영역 | 메시지 목록 및 출처 표시 | — |
| 분석 모달 | 비용 추정에서 요약 저장까지 3단계 | — |
| 요약 저장 | CRUD 및 DB 저장 | — |
| 관리 화면 | 시스템 설정(S11에서 진입) | ○ |

---

## 2. 상태 설정

### 문서 관리 영역

| 입력값(Props) | 상태 변수 | 초기값 | 변경 조건 |
|---|---|---|---|
| `projectId` | `documents` | `[]` | 목록 조회 또는 업로드 완료 |
| — | `uploadDialogOpen` | `false` | 추가 버튼 클릭 시 `true` |
| — | `loading` | `false` | 조회 중 `true` → 완료 시 `false` |
| — | `error` | `null` | API 오류 발생 시 메시지 설정 |
| — | `selectedDocId` | `null` | 삭제 메뉴 선택 시 ID 설정 |

### 문서 목록

| 입력값(Props) | 상태 변수 | 역할 |
|---|---|---|
| `documents` | — | 화면에 표시할 문서 배열 |
| `loading` | — | 로딩 표시 제어 |
| `onDelete` | — | 삭제 버튼 콜백 |
| `onReanalyze` | — | 재시도 버튼 콜백 |
| `pollingInterval` | — | 폴링 주기(기본값 3초) |

**문서 데이터 구조**

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | 문자 | 문서 고유 ID |
| `projectId` | 문자 | 소속 프로젝트 ID |
| `fileName` | 문자 | 파일명 |
| `fileSize` | 숫자 | 파일 크기(바이트) |
| `status` | 상태 | `대기` / `임베딩 중` / `준비됨` / `실패` |
| `chunkCount` | 숫자 | 청크 개수 |
| `createdAt` | 날짜 | 생성 시각 |
| `embeddingProgress` | 숫자 | 진행률(0~100%) |

### 채팅 영역

| 입력값(Props) | 상태 변수 | 초기값 | 변경 조건 |
|---|---|---|---|
| `projectId` | `messages` | `[]` | 새 메시지 전송 시 추가 |
| `documents` | `inputValue` | `""` | 사용자 입력 시 갱신 |
| — | `loading` | `false` | 전송 중 `true` → 응답 수신 시 `false` |

**메시지 데이터 구조**

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | 문자 | 메시지 고유 ID |
| `role` | 상태 | `user` 또는 `assistant` |
| `content` | 문자 | 메시지 본문 |
| `citations` | 배열 | 출처 목록(선택) |
| `createdAt` | 날짜 | 생성 시각 |

**출처(Citation) 데이터 구조**

| 필드 | 타입 | 설명 |
|---|---|---|
| `documentId` | 문자 | 참고 문서 ID |
| `fileName` | 문자 | 문서명 |
| `chunkIndex` | 숫자 | 청크 순번 |
| `confidence` | 숫자 | 신뢰도(0~1) |

### 분석 모달

| 입력값(Props) | 상태 변수 | 초기값 | 변경 조건 |
|---|---|---|---|
| `documentId` | `step` | `'estimate'` | 사용자 진행 시 다음 단계로 |
| `projectId` | `estimatedTokens` | `0` | 비용 조회 시 갱신 |
| `onClose` | `estimatedCost` | `0` | 비용 계산 시 갱신 |
| `onSuccess` | `analysisProgress` | `0` | 진행 중 0~100으로 갱신 |
| — | `batchStatus` | `[]` | 배치별 상태 배열 |

---

## 3. 데이터 흐름

### 폴링 전략

| 상황 | 폴링 대상 | 주기 | 엔드포인트 |
|---|---|---|---|
| 문서 임베딩 중 | `documents[i].status` `embeddingProgress` | 3초 | `GET /api/rag/documents?status=analyzing` |
| 분석 진행 중 | `analysisProgress` `batchStatus` | 1초(또는 사용자 일시정지) | `GET /api/rag/documents/{id}/llm-analysis-status` |
| 채팅 대화 이력 | `messages` `conversations` | 온디맨드(새 메시지 전송 시) | `GET /api/rag/chat/conversations/{convId}/messages` |

### 스트리밍

**채팅 응답**은 Server-Sent Events(SSE) 스트리밍 가능성(⚠ 확인 필요).

```typescript
// 예상 패턴
fetch(`/api/rag/chat`, {
 method: 'POST',
 body: JSON.stringify({ query, projectId }),
 signal: abortController.signal // 취소 지원
.then(response => {
 const reader = response.body?.getReader()
 // 청크 단위 처리
```

⚠ **확인 필요.** 응답이 전체 수신 후 렌더인지, 스트리밍인지(실시간 토큰 출력).

---

## 4. API 계약

### 문서 관리 계열 (`/api/rag/documents`)

| 메서드 | 경로 | 입력 | 응답 | 인증 |
|---|---|---|---|---|
| POST | `/api/rag/documents` | `multipart/form-data` + file | `{ id, fileName, status: "pending" }` | 편집 권한 |
| GET | `/api/rag/documents` | query: `?projectId=X&status=ready` | `{ data: [RAGDocument], total, page }` | `hasReadAccess` |
| GET | `/api/rag/documents/{id}` | — | `RAGDocument` | `hasReadAccess` |
| DELETE | `/api/rag/documents/{id}` | — | `{ success: true }` | 편집 권한 |
| POST | `/api/rag/documents/{id}/analyze` | — | `{ status, progress }` | 편집 권한 |

### 채팅 계열 (`/api/rag/chat`)

| 메서드 | 경로 | 입력 | 응답 | 인증 |
|---|---|---|---|---|
| POST | `/api/rag/chat` | `{ query, projectId, docIds? }` | streaming 또는 `{ message, citations }` | `hasReadAccess` |
| GET | `/api/rag/chat/conversations` | query: `?projectId=X` | `{ data: [Conversation], page }` | `hasReadAccess` |
| GET | `/api/rag/chat/conversations/{id}/messages` | — | `{ data: [Message], page }` | `hasReadAccess` |

### 분석 계열 (신규, FastAPI `/api/v1`)

| 메서드 | 경로 | 입력 | 응답 | 인증 |
|---|---|---|---|---|
| POST | `/api/rag/documents/{id}/estimate-analysis-cost` | — | `{ tokens: N, cost: "$X.XX" }` | 편집 권한 |
| POST | `/api/rag/documents/{id}/analyze-chunks-with-llm` | — | `{ batchId, status: "started" }` | 편집 권한 |
| GET | `/api/rag/documents/{id}/llm-analysis-status` | — | `{ progress: 0-100, batches: [...], status }` | 편집 권한 |
| POST | `/api/rag/documents/{id}/pause-analysis` | — | `{ success: true }` | 편집 권한 |
| POST | `/api/rag/analysis-summaries` | `{ content, docId }` | `{ id, savedAt }` | 결과 기록 권한 |
| GET | `/api/rag/analysis-summaries` | query: `?docId=X` | `{ data: [...], page }` | `hasReadAccess` |

**쓰이지 않는 엔드포인트**

- `GET /api/admin/rag/documents` (전역 문서, S11용)
- `GET/PUT /api/admin/rag/settings` (LLM 설정, S11용)

---

## 5. 화면 렌더 규칙

| 조건 | 동작 |
|---|---|
| 탭 조건부 노출 | `RAG 사용 가능 여부=false`이면 탭 자체가 DOM에 없다 |
| 권한별 버튼 | 편집 권한 없으면 `[+ 문서 추가]` 버튼이 보이지 않는다 |
| 문서 0건 | 빈 상태 안내가 나타나고 테이블은 숨겨진다 |
| 폴링 진행 중 | 상태 행의 진행률이 갱신된다. 테이블 전체 재렌더는 하지 않는다(성능 최적화) |
| 분석 배치 확인 | 배치 목록이 동적으로 추가된다 |

---

## 6. 테스트 연결

### 단위 테스트

- : 폴링 로직 상태 전환 행 렌더
- : 메시지 입출력 출처 표시
- : 비용 추정 배치 확인 요약 저장

### E2E 테스트

- 문서 업로드 → 임베딩 완료 → 채팅 질의 → 출처 인용 검증
- 분석 시작 → 비용 확인 → 배치 일시정지 → 재개 → 요약 저장
- 권한 부재(`VIEWER`) → 업로드 버튼 미노출 확인

⚠ **확인 필요.** E2E에서 FastAPI 서비스(포트 8001) 목 여부. 실제 임베딩/분석은 느리므로 mock 필요.

---

## 7. 유지보수 주의

| 항목 | 주의사항 |
|---|---|
| **폴링 주기** | 3초는 일반적 선택이나 서버 부하와 UX 반응성 트레이드오프 검증 필요 |
| **청크 크기** | 1000자/200자 겹침은 RAG_EMBEDDING_PROCESS.md에 고정. 변경 시 전체 재색인 필수 |
| **모델 변경** | LLM/임베딩 모델 변경은 S11 RagSystemSettings에서만. 런타임 변경 불가(설계) |
| **재색인 동안 채팅** | 검색 결과가 최신 벡터를 미포함 가능. 경고 문구 추가 고려 |
| **분석 취소** | 배치 10개 블록은 완료/실패까지 진행. 중단 불가(비용 청구 후 재개를 막기 위함) |
| **권한 경계** | 전역/프로젝트 문서 권한이 다름. 필드 이름으로 혼동 가능성 체크 |
