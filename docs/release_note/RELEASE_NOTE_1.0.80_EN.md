# Release Note - v1.0.80

## [1.0.80] - 2026-06-05

Hello! This 1.0.80 update focuses on **data integrity in test execution result entry**. We fundamentally fixed the issue where "just opening a result page wiped existing input or piled up empty NOT_RUN records" by redesigning auto-save so that **saving only happens when the user actually makes a change**. The release also includes a fix for clipped advanced PDF exports and layout improvements in the test case form.

### Key Improvements

#### 🛡️ Result Entry: Viewing Never Saves (Highlight)
* Introduced a **user-edit detection gate (userEdited)**: auto-save (both debounced save and save-on-leave) is enabled **only after you actually modify** the result, notes, tags, or JIRA key. Opening a result page just to review it triggers no PUT/POST whatsoever.
* Fixed the bug where a snapshot mixing the initial empty form state with an existing result ID was misjudged as an "unsaved change," causing **existing results to be overwritten with empty NOT_RUN** (React StrictMode double-mount / case-navigation race).
* The form is now **remounted per test case** (`key={testCaseId}`) when navigating next/previous, eliminating the race where the previous case's input could be saved under the next case's result ID.
* Pressing Save / Next / Enter without changing anything **keeps the previous result intact** — no new record is created.
* Saving a brand-new result with no input (NOT_RUN, empty notes, no tags) **no longer creates an empty record** — the same guard applies to both auto-save and manual save.

#### 🧭 Result Display Accuracy
* The full-page result form now always shows the **latest result by executedAt**.
* Corrected the floating-menu **N (Not Run) button value from `NOTRUN` to `NOT_RUN`**, with backward compatibility for legacy `NOTRUN` values in existing data.
* The previous-results list now **visually distinguishes rows belonging to the current execution**, so you can tell at a glance which results are from this run.

#### 📄 Advanced PDF Export Clipping Fix
* Long test step (Step/Expected) content is no longer cut off at page boundaries — it now **flows across multiple pages** in full.

#### 📐 Test Case Form Layout
* The details tab switched to a **full-width (single-column) layout**, giving long steps and expected results more editing room.
* Migrated to the MUI v7 Grid API so the intended single-column layout applies consistently at every screen width.

---

### 💡 User Action Guide

#### Review freely — saves happen only when you edit
* Opening a result page to review content or moving next/previous never modifies existing results.
* Changing the result buttons (N/P/F/B), notes, tags, or JIRA key auto-saves after ~1.5 seconds; the auto-save indicator in the header reflects the status.

#### Empty NOT_RUN records created by older versions
* If empty NOT_RUN records created by mere viewing in previous versions remain, entering an actual result for those cases updates them in place.

---

### 🛡️ Verification & QA Results

* **Frontend build:** `vite build` — passed (14,989 modules transformed, 0 errors)
* **E2E behavior verification (Playwright):**
  * Opened a result with existing notes and waited 6 seconds — **0** PUT/POST requests
  * Navigated next/previous without edits (unmount path) — **0** PUT/POST requests
  * Opened a NOT_RUN case and waited 5 seconds — **0** new records created
  * Actually edited notes — exactly **1** auto-save PUT after the 1.5s debounce
* **Regression impact:** dialog modes (previous-result edit, execution form) already had auto-save disabled and are unaffected
