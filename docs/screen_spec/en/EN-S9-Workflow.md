# RAG Documents (S9) Workflow

> Screen ID **S9** · Screen name **Knowledge Document Upload · Embedding · Chat**
> Routes: `/projects/{projectId}/rag`
> Visibility condition: Shown only when the RAG auxiliary service is active

---

## 1. Workflow purpose

RAG (Retrieval-Augmented Generation) is an auxiliary service that accumulates project knowledge as documents and provides answers citing relevant documents in response to natural language queries. S9 offers document upload, embedding, and chat functionality with optional full document analysis.

| Purpose | Content |
|---|---|
| ① **Knowledge accumulation** | Upload and manage documents (PDF, MD, HTML, images) per project |
| ② **Automatic indexing** | Chunk and embed uploaded documents, then index in a vector database |
| ③ **Query-dependent answers** | Answer natural language queries by citing related chunks found in documents |
| ④ **Optional analysis** | Analyze entire documents through sequential LLM queries and save summaries and extracted information (new) |
| ⑤ **Case linking** | Recommend and link relevant RAG documents when writing test cases |

**What this screen does not do**

| What is not done | Where handled |
|---|---|
| Global document (organization-wide) management | S11 Organization admin (`/admin/rag`) |
| LLM and embedding model settings | S11 RAG system settings (`/admin/rag/settings`) |
| Batch management (analysis resume/cancel) | Automatically shows confirmation popups during analysis (per-batch token limits) |

---

## 2. Screen location

| Item | Content |
|---|---|
| Parent | S2 Project workspace |
| Conditional visibility | Environment RAG available = true. If false, the tab does not exist |
| Entry condition | Project access permission + RAG service enabled |
| Always accessible | `RAG Documents` tab in project navigation. If inactive, the tab is not rendered at all |

**If RAG service is disabled, this tab does not exist.** See document 04, requirements S9-N1 and S9-N2.

---

## 3. Workflow process

### 3.1 Document upload and list

| # | User action | Screen behavior | Result | Status |
|---|---|---|---|---|
| 1 | Enter tab | Retrieve document list. On first load, show empty state guidance | — | Working |
| 2 | Click `[+ Add document]` | Open file selection dialog (`.pdf,.md,.html,.jpg,.png`) | — | Working |
| 3 | Select file → `[Upload]` | `POST /api/rag/documents` + `multipart/form-data` | — | Working |
| 4 | Server receives | File → MinIO (`{projectId}/{uuid}/{filename}`) + DB record (`status=pending`) | — | Working |
| 5 | Add to list | New row shows status `Embedding…` with progress indicator (upload ratio) | — | Working |
| 6 | Embedding complete (polling) | Status shows `Ready`, display chunk count and file size | — | Working |
| 7 | Embedding failed | Status `Failed`, show red `[Retry]` button | — | Working |
| 8 | Click `[Retry]` | Submit same document to `/analyze` endpoint | — | Working |
| 9 | Click `⋮` menu (document row) | Show options: `Remove from list`, `Reindex` | — | Working |
| 10 | `Remove from list` | Show confirmation dialog → `DELETE /api/rag/documents/{id}` | Document deleted | Working |

**Search results during reindexing may not include the latest vectors.** (Design constraint, see section 8.)

### 3.2 Automatic chat (similarity-based search)

| # | Action | Behavior |
|---|---|---|
| 1 | Enter query | Text field + `[Send]` button |
| 2 | First message | `POST /api/rag/chat` + stream auto-search response |
| 3 | Receive response | Show citation sources (chunk source name, location link) + reply text |
| 4 | Conversation history | Polling `/api/rag/chat/conversations` auto-saves thread |
| 5 | Switch category | Start new conversation |

### 3.3 Optional analysis (LLM full-chunk query)

| # | Action | Behavior |
|---|---|---|
| 1 | Click `[Analyze]` at document row top-right | Open analysis modal |
| 2 | Click `[Estimate cost]` | `POST /api/rag/documents/{id}/estimate-analysis-cost` response: tokens, USD |
| 3 | User confirmation | Show cost then `[Continue]` or `[Cancel]` |
| 4 | Click `[Continue]` | Start `POST /api/rag/documents/{id}/analyze-chunks-with-llm` |
| 5 | Poll batch status | Check `GET /api/rag/documents/{id}/llm-analysis-status` status and batch number |
| 6 | Confirm per batch | Option to pause (`POST...pause-analysis`) or resume |
| 7 | Complete | Save summary (Ctrl+S auto-save option) |

**Analysis is sequential.** The user must explicitly start it. No automatic execution.

### 3.4 Case linking

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | S4 case writing form | Show `Linked RAG documents` field | S4 document |
| 2 | Click field | Show `Ready` status document list of current project | `/api/rag/documents?status=ready` |
| 3 | Select document | Record when saving form | `POST /api/cases` + `ragDocumentIds` |

---

## 4. RAG pipeline rules

| # | Stage | Content | Design basis |
|---|---|---|---|
| P1 | **Chunking** | Per-document 1000-character chunks / 200-character overlap sliding window. Chunk index sorted chronologically | `RAG_EMBEDDING_PROCESS.md` section 3 |
| P2 | **Embedding** | SentenceTransformer `paraphrase-multilingual-mpnet-base-v2` → 768 dimensions | See above section 4 |
| P3 | **Vector storage** | PostgreSQL + pgvector (cosine similarity) | See above |
| P4 | **Search** | Query embedding → top K=5 by similarity | `SEQUENTIAL_CHUNK_LLM_QUERY.md` section 2 |
| P5 | **Reindex** | Delete existing chunks then save new on document re-analysis | Design reference |
| P6 | **Analysis cost** | Chunk count × tokens/chunk (per model) + 10% margin | `estimate-analysis-cost` API |

---

## 5. Users and permissions

### 5.1 Features × role

Access decisions for this area follow project permissions.

| Feature | PM LEAD | DEVELOPER CONTRIBUTOR | TESTER | VIEWER | Permission |
|---|---|---|---|---|---|
| Document upload | ○ | ○ | — | — | Edit permission |
| Document remove, reindex | ○ | ○ | — | — | Edit permission |
| Chat | ○ | ○ | ○ | ○ | `hasReadAccess` |
| Start analysis | ○ | ○ | — | — | Edit permission |
| Save analysis summary | ○ | ○ | ○ | ○ | Result entry permission |

**Global documents (organization-wide) have separate permissions.** Only organization ADMIN can upload global documents.

### 5.2 Element visibility per feature

| Element | Visibility condition |
|---|---|
| `[+ Add document]` | Edit permission |
| Document row `⋮` menu | Edit permission for owning project |
| `[Analyze]` button | Edit permission |
| Chat input | `hasReadAccess` |

⚠ **Needs verification.** Confirm that the permission boundary between global and project documents is clearly distinguished in code.

---

## 6. Function rules

| # | Rule | Content |
|---|---|---|
| F1 | **Conditional area visibility** | When RAG auxiliary service is disabled, the area item is removed from the list and subsequent items move up |
| F2 | **Document status: four types** | Pending · Embedding · Ready · Failed |
| F3 | **Progress indicator update interval** | Embedding progress updates approximately every 3 seconds; chat and analysis updates show as responses arrive (⚠ needs verification) |
| F4 | **Citation display** | Show chunk number, file name, and location as hyperlinks |
| F5 | **Batch confirmation** | Get user confirmation every 10 chunks during analysis (batch = 10 chunks) |
| F6 | **Analysis summary** | After completion, keep on screen or save for persistence |

---

## 7. Server features not on screen

| Feature | API | Location | Status |
|---|---|---|---|
| Global document management | `GET/POST /api/admin/rag/documents` | `RagAdminController` | Hidden (managed in S11) |
| LLM model settings | `GET/PUT /api/admin/rag/settings` | Same | Hidden (managed in S11) |
| Cancel analysis | `POST /api/rag/documents/{id}/cancel-analysis` | Same | ⚠ Needs verification |

---

## 8. Integration with other screens

| Target | Direction | Content | Reference |
|---|---|---|---|
| **S2 Project** | S9 ← S2 | Enter tab after selecting project. If RAG service is inactive, tab does not exist | |
| **S4 Cases** | S9 ↔ S4 | Recommend and link relevant documents when writing cases | S4 document |
| **S11 Organization admin** | S9 → S11 | Global document upload and delete (organization ADMIN), LLM settings (system ADMIN) | `RagAdminController` |

---

## 9. Prerequisites and constraints

| Item | Content |
|---|---|
| **RAG service dependency** | FastAPI port 8001 required. If inactive, S9 tab does not exist |
| **File size limit** | Maximum upload value (⚠ needs verification) |
| **Embedding vector storage** | PostgreSQL + pgvector (768 dimensions). Real-time sync with vector DB not supported |
| **Search during reindex** | Search results in progress may not include latest vectors |
| **Analysis cost** | Users must confirm and explicitly agree to cost before execution |
| **Batch pause unavailable** | Started 10-chunk blocks continue to completion or failure; cannot be canceled (design) |

---

## 10. Requirements ↔ section mapping

| REQ-ID | Requirement | Section |
|---|---|---|
| S9-01 | RAG tab conditional visibility (RAG availability) | Section 2, 3.1 |
| S9-02 | Document upload and list | Section 3.1, 4, P1–P3, 6, F2 |
| S9-03 | Embedding status polling | Section 3.1, 6, F3 |
| S9-04 | Document delete and reindex | Section 3.1, 8 constraints |
| S9-05 | Automatic chat (similarity search) | Section 3.2, 4, P4 |
| S9-06 | Citation display | Section 3.2, 6, F4 |
| S9-07 | Full analysis (sequential LLM) | Section 3.3, 4, P6 |
| S9-08 | Cost estimation and batch confirmation | Section 3.3, 6, F5 |
| S9-09 | Permission-based access control | Section 5 features |
| S9-10 | Case document linking | Section 3.4, 8 integration |
