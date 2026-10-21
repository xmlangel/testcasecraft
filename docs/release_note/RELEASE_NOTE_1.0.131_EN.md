# Release Note - v1.0.131

## [1.0.131] - 2026-10-21

Written: 2026-10-21 17:25 KST

The dashboard overview no longer takes more than 3 seconds on projects with many test cases and results. The numbers shown on the screen are unchanged.

### Highlights

#### Faster dashboard overview statistics

The dashboard overview shows counts of test cases, plans, and executions, counts by latest result, and not-yet-run counts by priority. The queries behind these three statistics slowed down sharply as projects grew. APM recorded a 3.6-second overview request for a project with 1,213 test cases and 3,329 results, and 3.5 seconds of that went to these three queries.

| Statistic | Why it was slow | Database time (before → after) |
|---|---|---|
| Test case, plan, and execution counts | Every test case was multiplied by every plan and execution and then deduplicated, producing about 970,000 intermediate rows and a disk sort | 1,393ms → 24ms |
| Counts by latest result | The latest execution time of the test case was recomputed for every result row | 782ms → 28ms |
| Not-yet-run counts by priority | Same as above | 744ms → 27ms |

From this release each count is computed separately, and the latest result per test case is selected in one pass.

**Impact:** the dashboard overview opens quickly on large projects. Small projects were already fast, so the difference there is small.

### Upgrading

- No database changes or scripts to run.
- No changes to environment variables or configuration files.

### Verification

- The old and new queries were run side by side on the same database. All three statistics matched for 7 projects and 1 nonexistent project ID.
- If a test case has two results with exactly the same execution time, the old query counted both and this release counts one. No such case existed in the data checked.
- Backend tests passed: 109 classes, 807 tests, 0 failures.
- Overview response time has not yet been remeasured in APM on a deployed server.

### Development process

- `fix/` is now an allowed branch prefix for merging into `dev`, alongside `feat/`, `core/`, and `doc/`.
