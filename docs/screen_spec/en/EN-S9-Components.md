# RAG Documents (S9) Components

> Screen ID **S9** · Parent document: [`EN-S9-Screen.md`](EN-S9-Screen.md)

---

## 1. Component tree

```
<S9-RAG>
├── <RAGDocumentManager> (tab 0: document management)
│ ├── <AlertBox> (error/warning)
│ ├── <DocumentList> (table)
│ │ └── <DocumentRow> (each row)
│ │ └── <DocumentMenu> (⋮ menu)
│ ├── <FileUploadDialog> (file upload)
│ └── <DeleteConfirmDialog> (delete confirmation)
├── <RAGChatInterface> (tab 1: chat)
│ ├── <ChatMessages> (message list)
│ │ └── <ChatMessage> (each message)
│ │ └── <CitationLink> (citation link)
│ ├── <ChatInput> (input field)
│ └── <AnalysisButton> (start analysis)
├── <DocumentAnalysis> (modal: analysis)
│ ├── <CostEstimate> (cost estimate)
│ ├── <AnalysisProgress> (progress bar)
│ └── <AnalysisSummary> (complete and save summary)
└── <RAGSystemSettings> (hidden: admin page, `/admin/rag`)
```

**Key components and features**

| Component | Role | Lazy load |
|---|---|---|
| Document management area | Entry point and tab 0 content management | ○ |
| Document list | Table rendering and status polling | — |
| File upload | Drag-and-drop and file input | — |
| Chat area | Message list and citation display | — |
| Analysis modal | Three-step cost estimate to summary save | — |
| Summary save | CRUD and DB persistence | — |
| Admin screen | System settings (accessed from S11) | ○ |

---

## 2. State management

### Document management area

| Input (Props) | State variable | Initial value | Change condition |
|---|---|---|---|
| `projectId` | `documents` | `[]` | List query or upload complete |
| — | `uploadDialogOpen` | `false` | Add button click sets to `true` |
| — | `loading` | `false` | Querying sets `true` → completion sets `false` |
| — | `error` | `null` | API error sets message |
| — | `selectedDocId` | `null` | Delete menu select sets ID |

### Document list

| Input (Props) | State variable | Role |
|---|---|---|
| `documents` | — | Array of documents to display |
| `loading` | — | Control loading indicator |
| `onDelete` | — | Delete button callback |
| `onReanalyze` | — | Retry button callback |
| `pollingInterval` | — | Polling interval (default 3 seconds) |

**Document data structure**

| Field | Type | Description |
|---|---|---|
| `id` | String | Document unique ID |
| `projectId` | String | Owning project ID |
| `fileName` | String | File name |
| `fileSize` | Number | File size (bytes) |
| `status` | Status | `Pending` / `Embedding` / `Ready` / `Failed` |
| `chunkCount` | Number | Number of chunks |
| `createdAt` | Date | Creation time |
| `embeddingProgress` | Number | Progress (0–100%) |

### Chat area

| Input (Props) | State variable | Initial value | Change condition |
|---|---|---|---|
| `projectId` | `messages` | `[]` | Add on new message send |
| `documents` | `inputValue` | `""` | Update on user input |
| — | `loading` | `false` | Set `true` during send → `false` on response |

**Message data structure**

| Field | Type | Description |
|---|---|---|
| `id` | String | Message unique ID |
| `role` | Status | `user` or `assistant` |
| `content` | String | Message text |
| `citations` | Array | List of sources (optional) |
| `createdAt` | Date | Creation time |

**Citation data structure**

| Field | Type | Description |
|---|---|---|
| `documentId` | String | Referenced document ID |
| `fileName` | String | Document name |
| `chunkIndex` | Number | Chunk sequence number |
| `confidence` | Number | Confidence (0–1) |

### Analysis modal

| Input (Props) | State variable | Initial value | Change condition |
|---|---|---|---|
| `documentId` | `step` | `'estimate'` | Next step on user progress |
| `projectId` | `estimatedTokens` | `0` | Update on cost query |
| `onClose` | `estimatedCost` | `0` | Update on cost calculation |
| `onSuccess` | `analysisProgress` | `0` | Update 0–100 during progress |
| — | `batchStatus` | `[]` | Array of per-batch statuses |

---

## 3. Data flow

### Polling strategy

| Situation | Polling target | Interval | Endpoint |
|---|---|---|---|
| Document embedding in progress | `documents[i].status`, `embeddingProgress` | 3 seconds | `GET /api/rag/documents?status=analyzing` |
| Analysis in progress | `analysisProgress`, `batchStatus` | 1 second (or on user pause) | `GET /api/rag/documents/{id}/llm-analysis-status` |
| Chat conversation history | `messages`, `conversations` | On-demand (new message send) | `GET /api/rag/chat/conversations/{convId}/messages` |

### Streaming

**Chat response** may use Server-Sent Events (SSE) streaming (⚠ needs verification).

```typescript
// Expected pattern
fetch(`/api/rag/chat`, {
 method: 'POST',
 body: JSON.stringify({ query, projectId }),
 signal: abortController.signal // cancel support
}).then(response => {
 const reader = response.body?.getReader()
 // per-chunk processing
```

⚠ **Needs verification.** Whether response is full-receive-then-render or streaming (real-time token output).

---

## 4. API contract

### Document management series (`/api/rag/documents`)

| Method | Path | Input | Response | Auth |
|---|---|---|---|---|
| POST | `/api/rag/documents` | `multipart/form-data` + file | `{ id, fileName, status: "pending" }` | Edit permission |
| GET | `/api/rag/documents` | query: `?projectId=X&status=ready` | `{ data: [RAGDocument], total, page }` | `hasReadAccess` |
| GET | `/api/rag/documents/{id}` | — | `RAGDocument` | `hasReadAccess` |
| DELETE | `/api/rag/documents/{id}` | — | `{ success: true }` | Edit permission |
| POST | `/api/rag/documents/{id}/analyze` | — | `{ status, progress }` | Edit permission |

### Chat series (`/api/rag/chat`)

| Method | Path | Input | Response | Auth |
|---|---|---|---|---|
| POST | `/api/rag/chat` | `{ query, projectId, docIds? }` | Streaming or `{ message, citations }` | `hasReadAccess` |
| GET | `/api/rag/chat/conversations` | query: `?projectId=X` | `{ data: [Conversation], page }` | `hasReadAccess` |
| GET | `/api/rag/chat/conversations/{id}/messages` | — | `{ data: [Message], page }` | `hasReadAccess` |

### Analysis series (new, FastAPI `/api/v1`)

| Method | Path | Input | Response | Auth |
|---|---|---|---|---|
| POST | `/api/rag/documents/{id}/estimate-analysis-cost` | — | `{ tokens: N, cost: "$X.XX" }` | Edit permission |
| POST | `/api/rag/documents/{id}/analyze-chunks-with-llm` | — | `{ batchId, status: "started" }` | Edit permission |
| GET | `/api/rag/documents/{id}/llm-analysis-status` | — | `{ progress: 0-100, batches: [...], status }` | Edit permission |
| POST | `/api/rag/documents/{id}/pause-analysis` | — | `{ success: true }` | Edit permission |
| POST | `/api/rag/analysis-summaries` | `{ content, docId }` | `{ id, savedAt }` | Result entry permission |
| GET | `/api/rag/analysis-summaries` | query: `?docId=X` | `{ data: [...], page }` | `hasReadAccess` |

**Unused endpoints**

- `GET /api/admin/rag/documents` (global documents, for S11)
- `GET/PUT /api/admin/rag/settings` (LLM settings, for S11)

---

## 5. Screen render rules

| Condition | Behavior |
|---|---|
| Tab conditional visibility | If `RAG available = false`, tab does not exist in DOM |
| Permission-based button | If no edit permission, `[+ Add document]` button not visible |
| Zero documents | Empty state guidance shows, table is hidden |
| Polling in progress | Progress percentage in status row updates. Full table re-render not done (performance) |
| Analysis batch confirmation | Batch list dynamically adds rows |

---

## 6. Test connection

### Unit tests

- Polling logic, state transitions, row render
- Message input/output, citation display
- Cost estimate, batch confirmation, summary save

### E2E tests

- Document upload → embedding complete → chat query → verify citation
- Start analysis → confirm cost → pause batch → resume → save summary
- No permission (`VIEWER`) → verify upload button not visible

⚠ **Needs verification.** Whether E2E mocks FastAPI service (port 8001). Real embedding and analysis are slow, so mock recommended.

---

## 7. Maintenance cautions

| Item | Caution |
|---|---|
| **Polling interval** | 3 seconds is a common choice, but verify server load vs UX responsiveness tradeoff |
| **Chunk size** | 1000 characters/200 character overlap fixed in `RAG_EMBEDDING_PROCESS.md`. Full reindex required if changed |
| **Model change** | LLM and embedding model changes only via S11 RagSystemSettings. No runtime change (design) |
| **Chat during reindex** | Search results may not include latest vectors during reindex. Consider adding warning copy |
| **Analysis cancellation** | 10-chunk batches continue to completion/failure. Cannot be stopped (to prevent charge-then-cancel) |
| **Permission boundary** | Global and project document permissions differ. Field names may cause confusion; verify |
