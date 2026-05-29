# Release Note - v1.0.79

## [1.0.79] - 2026-05-29

Hello! This 1.0.79 update follows up on the 1.0.78 form redesign by focusing on **intelligently sizing the "Test Steps" and "Expected Results" editors in the test case form**. When empty they collapse to a minimal height so they don't waste screen space; when content grows they expand up to 10 lines and then scroll, letting you work through more cases on a single screen.

### Key Improvements

#### 📐 Auto-Height for Test Steps & Expected Results Editors
* The **Test Step (Step / Expected)** and **overall Expected Results** markdown editors moved from fixed heights (100px / 120px) to **content-driven dynamic height**.
* **When empty, they take only a minimal height** (toolbar + 1 line), so blank steps no longer occupy unnecessary space.
* **When content is present, they grow line-by-line up to a maximum of 10 lines**, after which the editor scrolls internally — long SQL, logs, or scenarios no longer stretch the whole form endlessly.
* In the test steps table, the **Step and Expected cells in a row are aligned to the same height** by sizing both to the taller of the two fields.
* The height calculation was extracted into a shared utility `utils/markdownEditorHeight.js` (`computeMarkdownEditorHeight`) so both components follow identical rules.
* The `MarkdownFieldEditor` `height` prop now acts as an **optional minimum (floor)**, preserving the behavior of existing screens that intentionally use tall editors (folder description, pre/post conditions, etc.). A new `maxLines` prop (default 10) lets each screen tune the cap.

#### 🛡️ Backend Compile Warning Cleanup
* Removed the `[unchecked]` compile warning from UI-preference merging, where `objectMapper.readValue(existing, Map.class)` returned a raw type, by switching to **`TypeReference<Map<String, Object>>`**.
* `./gradlew compileJava` now passes with **zero warnings**.

---

### 💡 User Action Guide

#### Scroll to review long input
* If you enter more than 10 lines in a test step or expected result, scroll within that editor area to view and edit the full content.
* Adding a blank step shows it at minimal height; it expands automatically as you start typing — no manual resizing needed.

---

### 🛡️ Verification & QA Results

* **Frontend build:** `vite build` — passed (14,989 modules transformed, 0 errors)
* **Backend compile:** `./gradlew compileJava` — passed with **0 warnings** (the lingering unchecked warning was removed)
* **Syntax check:** all 4 modified frontend files pass esbuild parsing
* **Regression impact:** existing screens that pass an explicit `height` prop (FolderForm, TestCaseBasicInfo, etc.) retain their minimum height — **0 visual regressions**
