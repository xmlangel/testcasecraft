# Release Note - v1.0.95

## [1.0.95] - 2026-07-20

Hello! v1.0.95 delivers the **security hardening** and **functional/correctness bug fixes** from the code-review (dev-review R2) follow-up.

### Highlights

#### 🔒 Security hardening

> **What is security hardening?** It's defensive work — not new features, but finding and closing access and injection paths that should never have been open, to make the system more robust. It makes "what shouldn't work no longer work" rather than "what worked work better."

Closed numerous P0/P1 vulnerabilities — unauthorized access (IDOR/BOLA), injection, and SSRF. Key areas: object-level authorization (RAG, attachments, permissions), Jira integration SSRF/JQL/JSON injection blocking, a tighter boundary around RAG's LLM-generated SQL, SHA-256 hashing for service API keys, fail-closed behavior under the production profile (default encryption keys, admin credentials, SSL bypass), RateLimiter defenses (XFF bypass, OOM, XSS), locked-down CORS/Swagger/Actuator exposure, and canonicalized 403 authorization denials.

#### 🐞 Functional & correctness fixes

* **Fixed root-level (folder-less) reordering**: dragging top-level folders or root cases failed while in-folder reordering worked (the sibling lookup didn't handle the no-parent case). Root lookups are now scoped to the current project, preventing cross-project ordering contamination.
* **Fixed progress miscount**: corrected drift where the not-run (NOT_RUN) state was counted as completed, on both frontend and backend.
* **RAG & UI fixes**: RAG chat create/update (snake_case body) and thread PATCH 400, service API key list blank column and header wording, and a report null NPE.

#### 🧹 Internal improvements

Canonicalized verdict status onto the `TestResultStatus` enum, unified the production-profile check and permission projection, removed unused code, and added regression guards while restoring 27 integration tests (including service and real-DB tests for the tree fix).

### Upgrade Notes

* No DB migration — applies by swapping the image.
* **Production note**: default encryption keys, admin credentials, and SSL bypass are fail-closed under the production profile. See the operational deployment security document in the repository for the relevant environment variables.
* For the 1.0.94 changes, see [RELEASE_NOTE_1.0.94_EN.md](RELEASE_NOTE_1.0.94_EN.md).
