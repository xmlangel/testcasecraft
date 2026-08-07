# Release Note - v1.0.105

## [1.0.105] - 2026-08-07

Written: 2026-08-07 21:00 KST

Typing N, P, F or B into the tag or JIRA issue key field no longer triggers the result shortcuts instead of entering the character. The characters were not merely dropped — the verdict changed and was saved.

### Highlights

#### 🐞 Bug Fixes

* **N, P, F and B could not be typed into the tag or JIRA issue key field**: those four letters are result shortcuts (N not run, P pass, F fail, B blocked). The window-level shortcut handler stepped aside only for multi-line inputs (notes) and stayed active for single-line inputs, so it swallowed characters typed into the tag and issue key fields.
  * Typing `Pass` into the tag field flipped the verdict to pass on the `P`, saved it immediately, and showed a success message. That was a path to recording a verdict nobody asked for.
  * Shortcuts now step aside while text is being entered — single-line inputs, multi-line inputs, select lists and autocomplete fields alike.
  * Focus on a checkbox, radio button or button still leaves the shortcuts working.

* **Enter in the tag field fell through to save**: pressing Enter to confirm a tag or pick an autocomplete entry was handled as "save the result". Same root cause, fixed together.

### Upgrade Notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* The shortcuts themselves are unchanged. To change a verdict, click outside the input field first.
* For 1.0.104 changes see [RELEASE_NOTE_1.0.104_EN.md](RELEASE_NOTE_1.0.104_EN.md).
