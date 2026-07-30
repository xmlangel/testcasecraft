# Release Note - v1.0.101

## [1.0.101] - 2026-07-30

Written: 2026-07-30 16:45 KST

This release lets you collect the cases you noticed needed fixing while testing, and deal with them later. You tag a result and then search by that tag. It also fixes tags that were not saved even after pressing save, and the test case tree can now be searched by case ID.

### Highlights

#### 🐞 Bug fixes

* **Tags disappeared after typing and saving**: On the result entry screen, typing a tag and pressing save immediately did not store the tag. The input did not hand over text that had not been confirmed with Enter, and it vanished without a warning. A tag is now confirmed even if you press save while still typing. The same applies to the common tag field in bulk entry and the tag filter on the execution screen.
* **Bulk entry wiped existing tags**: Updating results for several cases at once with the common tag field left empty erased the tags on each case every time. Leaving the common tag empty now keeps each case's own tags.

#### ✨ New features

* **Filter by result tag**: The execution screen filter now has a tag field. Pick from tags already used in the project or type your own. Selecting several keeps any case that carries at least one of them.
* **Search tags across the whole project**: The result query API now accepts a tag condition, so you can collect what you marked at the project level instead of opening each execution one by one. Tags attached in earlier runs are found as well.
* **Search the test case tree by ID and tag**: The search box looked at names only; it now covers name, case ID, and tags. This fixes the case where the tree shows `AGG-1016 · case name` but that ID found nothing. A partial value such as `1016` works, case is ignored, and comma-separated terms keep anything matching at least one of them.

#### 🔧 Behavior change

* **Saving a result carries tags forward**: This product does not overwrite results; it stacks one record per run. So re-running a tagged case produced a new record without the tag, and the screen (which shows the most recent record) made the mark look gone. Saving a result without specifying tags now inherits the case's most recent tags. The same applies when results are loaded through automation.
  * Saving with the tag field cleared removes the tags. That is how you drop the mark once the case is fixed.
  * A common tag entered in bulk entry takes precedence.

### Upgrade notes

* No DB migration script and no schema changes.
* Three new i18n keys (`testExecution.filter.tags`, `testExecution.filter.tags.placeholder`, `testcase.tree.filter.placeholderAll`) are registered automatically for both languages at startup.
* Scripts that load results through automation need no change. Omitting the tag field inherits the previous tags; sending an empty list clears them. Send an empty list explicitly if you want each run to start without tags.
* Agree on one tag name within the team (for example `needs-fix`). The field is free text, so divergent spellings have to be filtered separately.
* The tag condition in the result query API ignores case. Passing several values returns results carrying at least one of them.
* For 1.0.100 changes, see [RELEASE_NOTE_1.0.100_EN.md](RELEASE_NOTE_1.0.100_EN.md).
