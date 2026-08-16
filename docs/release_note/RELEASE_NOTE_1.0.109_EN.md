# Release Note - v1.0.109

## [1.0.109] - 2026-08-17

Written: 2026-08-17 00:20 KST

The default navigation inside a project is now the left menu. In the execution detail screen, the case list no longer shares its name with the execution list on the left, and collapsing a folder now shows how its cases were judged.

### Highlights

#### 🎨 Default navigation changed

* **The left menu is now the default**: Until now, areas were laid out horizontally under the project name. As the number of areas grew, names started getting truncated, so the vertical left menu becomes the default.
  * **An explicit choice is preserved.** Accounts that picked horizontal tabs have that value stored on the server and still open with tabs.
  * To go back to horizontal tabs, pick it under Profile → Menu structure. The choice is stored per account and follows you to other machines.
  * On the selection screen the default (left menu) now comes first, and both descriptions were rewritten for the new default.

#### ✨ Test execution screen

* **Renamed to "Test Case Execution List"**: The case list in the execution detail carried the same name as the execution list on the left ("Test Execution List"), so it was impossible to tell which one was meant. The case list side was renamed.
* **Result breakdown on collapsed folders**: A collapsed folder only showed a case count, so checking progress meant expanding it again. The total is now followed by **passed · failed · blocked · not run**, in that order.
  * Each number uses its result color. Hovering shows which result it is.
  * Zeros keep their slot, dimmed. A fixed position is what lets the eye read the order.
  * Cases in nested folders roll up to the parent, so collapsing one top-level folder accounts for everything under it.
  * The counting rule matches the execution summary above: cases with no result, not run, or skipped all count as not run.
* **Folder names pushed out by the badges**: The name cell in the folder column was set to take all remaining space, so once collapse badges appeared the name shrank to zero width and disappeared. The name now truncates while the badges stay intact, and hovering reveals the full name.
  * The folder column minimum width went from 150px to 260px, so most folder names fit without truncation.

### Upgrade notes

* No DB migration scripts. No schema changes.
* Five new i18n keys (`testExecution.sections.caseList`, `profile.nav.sidebar.name`/`summary`, `profile.nav.tabs.name`/`summary`) are registered automatically for both locales at startup.
* The previous keys (`testExecution.sections.list`, `profile.nav.*.title`/`desc`) are left in place. The translation seeder never overwrites a row that already has a value, so changing wording requires new keys.
* **The new navigation default applies only to accounts that have not made a choice yet.** Aligning a whole organization one way requires adjusting the per-user preference.
* A hard reload (⌘⇧R / Ctrl+F5) may be needed if the old bundle is cached.
* For 1.0.108 changes, see [RELEASE_NOTE_1.0.108_EN.md](RELEASE_NOTE_1.0.108_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Per-folder result counts | 5 unit tests | Pass |
| Collapse badge rendering | 3 component tests | Pass |
| Frontend suite | 585 tests in 74 files | Pass |
| Badges and name on one line | Browser measurement (1600px) | No clipping; name width 92px → 142px |
| New translation keys | DB check after startup | 5 rows per locale |
| Navigation default | Served bundle check | `projectNavMode` defaults to `sidebar` |
