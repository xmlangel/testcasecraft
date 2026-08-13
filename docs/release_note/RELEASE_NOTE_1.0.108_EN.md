# Release Note - v1.0.108

## [1.0.108] - 2026-08-13

Written: 2026-08-13 19:15 KST

Folders in the result entry list of a test execution can now be collapsed and expanded. Vertical spacing across the execution and result screens has been reduced and the page width cap removed, so more cases fit on one screen.

### Highlights

#### ✨ New

* **Collapse and expand folders in the result entry list**: In executions with hundreds of cases, reaching one folder meant scrolling the whole list. Each folder row now has a chevron, and the list toolbar offers "Expand all folders / Collapse all folders".
  * A collapsed folder shows how many cases it contains.
  * The collapsed state is remembered per execution, so it survives a round trip to a case result screen and back.
  * **Collapsing clears the selection inside that folder.** Cases selected but not visible would otherwise be changed by a bulk result entry.
  * While a filter is active, collapse is ignored and everything stays expanded, so matches are never hidden behind a collapsed folder. Clearing the filter restores the previous collapsed state.
  * When another screen navigates to a specific case that sits inside a collapsed folder, that path is expanded first.

#### 🎨 Layout

* **Reduced vertical spacing on the execution and result screens**: Accordion header heights, the margins MUI adds when an accordion expands, list row heights, and the fixed heights in the result screen header were all trimmed. The result screen header went from about 112px to about 62px, giving that space back to the content below.
* **Page width cap removed**: The standard container limited pages to 1600–1900px, leaving unused bands on wide monitors. Pages now use the full viewport width. Dashboard, organization list, JUnit results, RAG document manager, bookmarks, and the JIRA status screen widen along with it.
  * Screens meant for reading long prose (email verification notice, JIRA redirect notice, guide viewer) keep their narrower width so lines stay readable.

#### 🐞 Fixes

* **Display ID migration failures repeated on every startup**: Each boot logged `Display ID migration complete - success: 0, failure: 24` plus one warning per item. The same targets failed for the same reason every time, so the log grew and nothing was ever repaired.
  * The cause was target selection. Everything without a Display ID was picked up, and all remaining rows were folders. Folders do not receive a sequential number, so no Display ID can be built for them.
  * The migration now targets only rows that can actually receive one. Folders that already carry a sequential number are still included — the same rule cross-project copy uses.
  * When a test case is missing its sequential number, the migration now assigns the project's next number instead of only logging a warning.
  * The admin migration status check counts by the same rule. It previously reported 24 untouchable rows as "migration needed" forever.

### Upgrade notes

* No DB migration scripts and no schema changes.
* Five new i18n keys (`testExecution.tree.expandFolder`, `collapseFolder`, `expandAll`, `collapseAll`, `disabledByFilter`) are registered automatically for Korean and English at startup.
* The collapsed state lives in the browser session only; it is not stored on the server. Closing the browser returns to fully expanded.
* Startup logs get quieter: instead of 24-plus warning lines, a single "no test cases require Display ID migration" line remains.
* The width change spans several screens. Let us know if any screen reads better narrow.
* For 1.0.107 changes, see [RELEASE_NOTE_1.0.107_EN.md](RELEASE_NOTE_1.0.107_EN.md).

### Verification

| Area | Method | Result |
|---|---|---|
| Collapse logic and state persistence | 20 unit tests | Pass |
| Collapse/expand UI | 9 component tests | Pass |
| Frontend suite | 578 tests in 74 files | Pass |
| Display ID migration | 8 unit tests | Pass |
| New query predicate | Checked against the live DB | 24 targets → 0 |
| Hardcoded Korean strings | i18n scanner | 0 |
