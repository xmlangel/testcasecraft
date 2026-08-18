# Release Note - v1.0.111

## [1.0.111] - 2026-08-18

Written: 2026-08-18 13:40 KST

Progress and pass/fail counts for one execution now read the same on every screen, scoped to the test plan. The action column of the execution list, which looked misaligned on rows carrying an attachment, was fixed as well.

### Highlights

#### 📊 Execution statistics are scoped to the test plan

* **The same execution showed different progress**: The execution detail said 79%, the case result entry screen said 90%. Pass counts split 222 against 254. Both screens used the same denominator, the 314 cases of the plan, and differed only in how many they counted as done.
* **Cause: numerator and denominator had different scopes**: The denominator was the plan's case list while the numerator counted every result still attached to the execution. In the execution we measured, 599 results spanned 284 cases, and 35 of those cases were not in the plan. All 35 had a latest verdict of pass, fail or blocked, so they inflated the numerator and shrank the not-run count.
* **Four call sites, one rule**: The list progress, the detail summary, the detail API and the result entry header each computed this on their own, and the scope had drifted apart. All four now count only within the plan's case list, and not-run is the plan case count minus the completed count.
* **Opening the result screen from a filtered list**: The denominator shrank to the filtered count while the numerator still covered the whole execution, which pinned progress at 100% and not-run at zero. The statistics scope is now separate from the 1/N navigation counter, so a filter no longer changes the numbers.
* **Picking the latest result**: The frontend took the first entry of the results array; it now takes the one with the most recent execution timestamp. Five database aggregations were aligned to push rows without a timestamp to the end. Postgres returns nulls first on a descending sort, so without saying otherwise a result with no timestamp wins as "latest".
* **Blocked count added to the detail response**: The field was populated in the list response and empty in the detail one.

#### 🧷 Action column alignment in the execution list

* **Only rows with an attachment looked off**: The attachment icon appears only when the result carries a file. The action column is centered, so one extra icon widened the group and pushed the entry button and the remaining icons to the left.
* **Fixed to the three-icon layout**: Rows without an attachment now reserve a slot of the same size (28px), so every row's action group has the same width. Copy, previous-results and attachment buttons were all set to 28px; the copy icon used a different font size and was slightly narrower.

### Upgrade notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* **Displayed numbers will change.** For executions that carry results outside their plan, progress and the pass/fail/blocked counts go down and not-run goes up. No data was removed; the counting scope narrowed to the plan.
* Results outside the plan were not deleted. The test result report screen lists results per execution, so those rows remain visible. Its scope was left unchanged in this release.
* Recording a result still does not check whether the case belongs to the execution's plan. Posting results by case name through the API, or editing the plan's case list afterwards, can produce out-of-plan results again.
* A hard refresh (⌘⇧R / Ctrl+F5) may be needed if the browser cached the old bundle.
* For 1.0.110, see [RELEASE_NOTE_1.0.110_EN.md](RELEASE_NOTE_1.0.110_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Mismatch reproduction | Queried both production API paths | List 90% vs detail 79%, reproduced |
| Out-of-plan results | Cross-checked execution, plan and case lists | 599 results / 284 cases / 35 outside the plan |
| Expected value after fix | Recomputed against the 314-case plan | Pass 222, fail 11, blocked 16, not run 65, 79% |
| Summary function | 4 frontend regression tests added | Scope exclusion, latest verdict, NOT_RUN handling pass |
| Changed SQL | Executed on local Postgres | Syntax and column labels verified |
| Action column | Regression test (fails when the slot is removed) | Slot count equal with and without an attachment |
| Frontend suite | 74 files, 590 tests | Pass |
| Backend | `compileJava` | Pass |
| Browser check | Not performed | Compare both screens after deployment |
