# Release Note - v1.0.92

## [1.0.92] - 2026-06-27

Hello! v1.0.92 improves the **test-case authoring experience** and, under the hood, focuses on **large-scale code cleanup and added test coverage**. We addressed feedback that the step editor was too cramped, and split the spreadsheet, JUnit, test-result, and PDF-export code into smaller units to greatly improve maintainability and regression safety.

### Highlights

#### 📝 Test step editors now show at least 5 lines (Improvement)

* Users reported that the **Step and Expected input fields were too narrow** on the test-case authoring screen.
* Each editor now renders with a **minimum height of 5 lines**. As content grows it expands up to 10 lines as before and then scrolls, and each row's height matches the taller of the Step/Expected columns.

#### 🐞 Editing-flow bug fixes (Fix)

* **Step numbering after deletion**: deleting a middle step now automatically renumbers the remaining steps.
* **Ghost rows after folder deletion**: fixed empty/leftover rows lingering in the list after a folder was deleted.
* **Tag cleanup on parent move**: restored tag cleanup that was skipped when moving a case to another folder.
* **Unified spreadsheet save**: consolidated the save path into a single source to prevent duplicate saves and count mismatches.
* **Execution list filter navigation**: clearing a filter now also drops the stale navigation IDs (navIds), so Next/Previous no longer drifts.

#### 🧪 Internal quality (refactoring & tests)

* Broke down oversized screen code into **smaller components, custom hooks, and pure utilities** — spreadsheet (toolbar, menus, row selection, save utils), JUnit results (stats card, failed/slowest tabs, export hook), the test-result table (toolbar, column preferences, attachment/error states), and PDF export (text, HTML templates, section builders).
* Added a **large batch of vitest unit and render tests** across these modules (utils, models, components). Missing constants surfaced during the split (`FailedTestsTab` colors, `TestResultDetailTableToolbar` formats) were fixed as well.
* Most changes are structure-only with no behavior change, making future features and fixes safer and faster to ship.

### Upgrade Notes

* No DB migration — applies by swapping the image.
* For the JIRA integration and execution-navigation improvements in 1.0.91, see [RELEASE_NOTE_1.0.91_EN.md](RELEASE_NOTE_1.0.91_EN.md).
