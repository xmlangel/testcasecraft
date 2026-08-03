# RAG Documents (S9) Requirement Coverage

> Screen ID **S9** · Base documents: [`EN-S9-Workflow.md`](EN-S9-Workflow.md) · [`EN-S9-Screen.md`](EN-S9-Screen.md) · [`EN-S9-Components.md`](EN-S9-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference conventions: [`../README.md`](../README.md) section 4

---

## 1. Functional requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S9-01** | Show tab when RAG service enabled; hide when disabled | EN-S9-Workflow section 2, EN-S9-Screen sections 1, 3.6 | **Environment-dependent** — Determined by configuration value |
| **S9-02** | Upload project documents and view list | EN-S9-Workflow section 3.1, EN-S9-Screen section 2.4 | Working |
| **S9-03** | Automatically chunk and embed uploaded documents; display progress | EN-S9-Workflow section 4, EN-S9-Screen sections 2.4, 3.2 | Working |
| **S9-04** | Show `[Retry]` button on embedding failure to reanalyze | EN-S9-Workflow section 3.1, EN-S9-Screen section 2.4 | Working |
| **S9-05** | Remove document from list and show confirmation dialog | EN-S9-Workflow section 3.1, EN-S9-Screen section 2.7 | Working |
| **S9-06** | Auto-chat (similarity search) finds related chunks from Ready documents and cites them | EN-S9-Workflow sections 3.2, 4, EN-S9-Screen sections 2.5 | Working |
| **S9-07** | Display sources (chunk number, file name) as hyperlink in chat response | EN-S9-Workflow section 3.2, EN-S9-Screen section 2.10 | Working |
| **S9-08** | Analyze full document via sequential LLM query and show cost preview | EN-S9-Workflow section 3.3, 4, EN-S9-Screen sections 2.9, 3.5 | Working |
| **S9-09** | Get user confirmation per batch during analysis and support pause (batch = 10 chunks) | EN-S9-Workflow section 3.3, 6, EN-S9-Screen sections 2.9, 3.5 | Working |
| **S9-10** | Save summary after analysis complete | EN-S9-Workflow section 3.3, EN-S9-Screen sections 2.9, 3.5 | Working |
| **S9-11** | Recommend and link relevant RAG documents when writing cases | EN-S9-Workflow sections 3.4, 8 | **Hidden** — Managed in S4 screen |
| **S9-12** | Global documents (organization-wide) managed by organization ADMIN | EN-S9-Workflow sections 1, 7 | **Hidden** — Handled in organization admin (S11) |

---

## 2. Non-functional and quality requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S9-N1** | Tab absent from screen when RAG service inactive | EN-S9-Screen section 3.6 | **Environment-dependent** — Server configuration |
| **S9-N2** | Permission-based feature visibility (upload/analysis admin and developer only, chat for all) | EN-S9-Workflow section 5, EN-S9-Screen section 5 | **Needs verification V-S9-1** |
| **S9-N3** | Display maximum file upload size limit | EN-S9-Screen section 2.8 | **Needs verification V-S9-2** |
| **S9-N4** | Each document row has identifier | EN-S9-Components section | Working |
| **S9-N5** | Status color distinction (pending gray, embedding blue, ready green, failed red) | EN-S9-Screen sections 2.4, 3.2 | Working |
| **S9-N6** | During embedding other documents remain interactive (no full table re-render) | EN-S9-Components section 7 | Working |

---

## 3. Correction targets

Areas that work but deviate from specification or are incomplete.

| # | Item | What deviates | Location | Action |
|---|---|---|---|---|
| **No correction targets** | — | — | — | — |

⚠ No clear correction needs in current code state. Additional items will be identified during execution verification.

---

## 4. Needs verification

| # | Item | Why unclear | Verification method |
|---|---|---|---|
| **V-S9-1** | Permission-based feature visibility actually implemented | Code shows no edit permission or result entry permission conditions | Access control check |
| **V-S9-2** | File upload maximum size limit | FileUploadDialog does not clearly show limit | Drop area guidance verification, server setting sync |

---

## 5. Backend features not on screen

| Feature | Location | Reason |
|---|---|---|
| LLM and embedding model settings | `RagAdminController` `/api/admin/rag/settings` | Requirement S9-12. Managed in S11 RAG system settings |
| Global document management | `RagAdminController` `/api/admin/rag/documents` | Requirement S9-11. Handled in S11 organization admin |
| Cancel analysis (`cancel-analysis`) | Same | Design: 10-chunk batches continue to completion/failure. To prevent charge-then-cancel |

---

## 6. Maintenance handover

1. **When adding tabs, update three places in C tab group together**: render condition, display order, tab content (section EN-S9-Screen 1).
2. **Polling interval (3 seconds) adjusts based on server load vs UX responsiveness tradeoff** (EN-S9-Components section 7 caution).
3. **Chunk size (1000 characters/200 character overlap) is fixed in `RAG_EMBEDDING_PROCESS.md`.** Change requires **full document reindex.**
4. **LLM and embedding model change only possible via S11.** No runtime change (design).
5. **Search results during reindex may not include latest vectors** (section 9 constraints). Consider adding warning copy.
6. **Analysis batch is 10-chunk units and cannot be stopped** (started block runs to completion/failure).
7. **Global and project document permissions differ** (EN-S9-Workflow section 5). Do not confuse field names or API paths.
8. **After verification of V-S9-1 and V-S9-2, reflect permission and limit display in this document.**
