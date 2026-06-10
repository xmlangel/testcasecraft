# Release Note - v1.0.86

## [1.0.86] - 2026-06-10

Hello! Version 1.0.86 strengthens test result reporting. You can now record an execution-level **QA Summary** in Markdown and have it printed in the advanced PDF export, and previous execution result notes can be **toggled between Markdown and plain-text views**.

### Highlights

#### 📝 Per-Execution QA Summary (New)

Added a QA Summary feature for recording an overall assessment after finishing a test execution.

* **Where to write**: In the **Detailed Table** tab of the Test Results screen, selecting a **Test Execution filter** reveals the "QA Summary" panel above the results table.
* **Markdown input**: The **[WRITE SUMMARY]** (or **[EDIT]**) button opens a Markdown editor with a **live preview** while you type. Up to 10,000 characters.
* **Saved per execution**: The summary is stored per test execution, and the panel header shows **the author and the last-updated time**.
* **Advanced export integration**: In the PDF report, the "💬 QA Summary" (with author) is printed right after the statistics summary and **just above the "Detailed Test Results List" heading**. Markdown formatting is converted to plain text. Not included in Excel/CSV.

#### 📄 Previous Execution Results — Note View Format Toggle (Improved)

* A **Markdown / Text** toggle was added to the top-right of the **Previous Execution Results** dialog in the test execution list.
* This fixes notes that are not written in Markdown appearing broken — Text mode shows the note **verbatim**.
* Your chosen view format is saved in the browser and **persists the next time you open the dialog**.

### 📖 User Manual

* The Korean/English manuals reflect the changes above — §8-1 "Previous Execution Results dialog — note view format toggle", new §9-1 "QA Summary" section, and a new §4-7 Bookmarks screen capture.
* Three user-menu captures broken by a header change were repaired, and the new screens (Bookmarks, Previous Results dialog, QA Summary) were added to the automated capture set.

### Upgrade Notes

* DB columns (e.g., `qa_summary`) are added automatically at startup (no manual migration required).
* **New UI strings (translation keys) may be hidden by an existing server-side cache.** If Korean labels appear on the English UI after upgrading, call `POST /api/i18n/cache/clear` once with an admin token.
* For 1.0.85's bookmarks/favorites and execution-list auto-refresh, see [RELEASE_NOTE_1.0.85_EN.md](RELEASE_NOTE_1.0.85_EN.md).
