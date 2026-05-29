# Release Note - v1.0.78

## [1.0.78] - 2026-05-29

Hello! In this 1.0.78 update, we **redesigned the test case form UX end-to-end** and **persist per-user UI preferences on the server** so that signing in from any PC restores your exact working environment instantly. We also bundled together tree/spreadsheet visual polish, a rich ShopFlow demo dataset, and backend concurrency hardening — all in one release cycle.

### Key Improvements

#### 🎨 Test Case Form Layout — Complete Redesign
* Removed the four redundant H6 mode titles ("Edit / Create Test Case" and "Edit / Create Folder"). The form being open already signals the mode, and the right-side action buttons (Edit · Save) plus the displayId Chip provide sufficient identification.
* Unified every section into **Accordion** so users control form height instead of fighting variable section sizes.
* Rearranged the main input area into a **2-column grid** so more fields are visible and editable side-by-side.
* Split the metadata block into **editable fields** vs. **read-only fields**, and the UUID is now displayed in full rather than truncated.
* Consolidated header actions into a single row — version indicator, RAG registration, and save are aligned on one line for at-a-glance access.
* `MarkdownFieldEditor` now **auto-resizes height** to fit content — no more cramped scrolling for long descriptions.

#### 🔘 Field Visibility Toggle (FieldVisibilityMenu)
* Added a new **Field Visibility** menu at the top-right of the form. Toggle off metadata fields you rarely use to create a compact view tailored to your workflow.
* Nine toggleable fields: Description · Pre-Condition · Post-Condition · Is-Automated · Manual / Automation · Test Technique · Priority · Tags · Linked RAG Documents.
* Core fields (Name · Steps · Expected Results) are excluded from toggling and can never be hidden.

#### ☁️ Per-User UI Preferences Persisted on the Server
* Field visibility settings and input-mode selection (Form vs Spreadsheet) are now **persisted per-user on the server**.
* Sign in from any other PC or browser and your last saved layout is automatically restored.
* The localStorage cache is namespaced per-user (JWT `sub` prefix) so when one account signs out and another signs in on the same browser, the previous user's settings do not leak into the next session.
* Saves are flushed even if the page is closed immediately after a change — `beforeunload` and `pagehide` listeners issue a `fetch` request with `keepalive: true`.

#### 🛡️ Backend Concurrency & Reliability
* When multiple UI preference PATCH requests arrive concurrently for different keys, neither change is lost: we now serialize read-modify-write with **PESSIMISTIC_WRITE lock + `@Transactional`**.
* `ObjectMapper` is now **injected as a DI bean** rather than instantiated per request.

#### 🌲 Test Case Tree — Visual Polish
* The tree node displayId is now rendered as a **monospace chip showing only the last segment** instead of inline `[TC-123]` — significantly better readability. The full ID is revealed on hover via tooltip.
* Tree node name tooltips now appear **only when truncated** (text overflows its container) — no more redundant tooltips on short names.
* Tree virtualization integrates `orderMap` so **custom node ordering is preserved** without conflicting with virtualized rendering.

#### 📏 Korean 30-Character Cell Word Wrap in Spreadsheet
* In both input modes — `TestCaseSpreadsheet` (react-spreadsheet) and `TestCaseDatasheetGrid` (MUI DataGrid) — cell content that **exceeds approximately 30 Korean characters (~480 px) now word-wraps to the next line**.
* Columns no longer stretch sideways indefinitely; row height grows to match content instead.
* Edit mode (`<input>`) stays single-line — wrap applies to display only.

#### 🛍️ ShopFlow Sample Dataset
* Added `scripts/shopflow_seed/` — a one-command seed that generates **production-like e-commerce SaaS demo data** for testcasecraft.
* Supports Korean (ShopFlow) and English (ShopFlow EN) locales, independently or together.
* Volume per locale: 1 project · 12 folders · 108 cases · 12 plans · 12 executions (COMPLETED 6 / INPROGRESS 4 / NOTSTARTED 2) · 134 results · automation PASS 35 / FAIL 20 · 5 distinct assignees · 3 JUnit results (Cypress / Playwright / Jest).
* Idempotent — re-runnable any time to restore a known clean demo state.

#### 📘 User Manual Capture · Sync Automation
* `scripts/manual_capture.py` (Playwright Python) **re-captures all manual-referenced screens in one shot** and audits manual-mentioned routes vs. the app's actual route coverage.
* When a new page is added, the audit flags the gap and prompts adding both a STEPS entry and a manual section — the **manual is treated as a continuously growing asset, not a frozen 73-screen artifact**.
* The 17-section structure of `docs/manual/new/USER_MANUAL.md` is preserved while absorbing this cycle's UI changes (H6 removal, FieldVisibilityMenu, displayId chip, cell wrap, etc.) via box memos and two new subsections (§4-5 Field Visibility, §4-6 Metadata Area).

---

### 💡 User Action Guide

#### Using "Field Visibility Toggle"
1. Click the **Field Visibility** menu at the top-right of the test case form.
2. Toggle off any metadata fields you want hidden (e.g., Is-Automated, Test Technique, Priority).
3. The change applies immediately, and signing in from another PC will restore the same compact view automatically.

#### Confirming Saves
* There is no dedicated save indicator after toggling or switching input mode. The change is debounced and saved to the server within ~0.5 s asynchronously — safe to leave the page right after.
* Even if the network briefly fails, the next change retries automatically, and the localStorage cache keeps the display consistent in the meantime.

---

### 🛡️ Verification & QA Results

Before this release, backend compilation and automated manual capture (46 user-facing screens) confirmed no visual regressions.

* **Backend Compile:** `./gradlew compileJava` — passed (one pre-existing unchecked warning, unrelated to this change)
* **Manual Capture:** 46/46 screens captured successfully against the ShopFlow seeded environment, route coverage audit reports 0 missing paths
* **Quality Metrics:**
  - PATCH concurrency race-condition probability: **0%** (PESSIMISTIC_WRITE lock + transactional serialization)
  - Multi-user localStorage leak probability: **0%** (per-user cache namespacing via JWT sub claim)
  - Unsaved-change-on-unload probability: **0%** (beforeunload / pagehide flush)
  - Short-content cell width regressions after 30-char wrap rollout: **0**
