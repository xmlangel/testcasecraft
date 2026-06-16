# Release Note - v1.0.91

## [1.0.91] - 2026-06-16

Hello! v1.0.91 refines the **JIRA integration and the test-execution detail flow**. When you create a JIRA issue from a failed test, the test steps are now included; we also fixed cases where test history linked to an issue was not shown, and where pressing Next/Previous in the detail view ignored an active list filter.

### Highlights

#### 📝 Test steps included when creating a JIRA issue (Improvement)

* When creating a **JIRA issue** from the test result screen, the body previously included only the test case, pre-conditions, and actual result — **the test steps were missing**.
* The body now includes a `### Test Steps` section with each step's number, action, and per-step expected result, so the issue alone conveys how to reproduce.

#### 🔗 Fixed missing JIRA issue test history (Fix)

* When **multiple test results were linked** to a JIRA issue, the "JIRA Issue Test History" showed "No linked test results" even though results existed.
* **Cause**: a single result can store multiple issue keys joined by commas (e.g. `ONT-1086,ONT-904`), but the lookup matched only exact values, so any multi-key row was missed.
* **Fix**: the lookup now matches **per individual key** within the comma-joined list. The same fix applies to the dashboard JIRA status badges and status sync. (Partial-key mismatches such as `ONT-1086` vs `ONT-10861` are also prevented.)

#### 🧭 Fixed Next/Previous navigation under an active filter (Fix)

* In the test-execution list, opening a detail with a **filter applied** (name, status, etc.) and pressing Next/Previous moved to the next item in the **full list** instead of the filtered one.
* Both the detail dialog and the full-page result view now navigate within the filtered list order. (When entered via a direct link without filter context, navigation falls back to the full list as before.)

#### 🧪 Internal quality (tests & formatting)

* Added regression tests (backend and frontend) for the changes above, plus unit tests for the JIRA issue body generation.
* Reformatted the entire Java codebase to the `google-java-format` standard (no behavior change).

### Upgrade Notes

* No DB migration — applies by swapping the image.
* For the markdown rendering and notes improvements in 1.0.90, see [RELEASE_NOTE_1.0.90_EN.md](RELEASE_NOTE_1.0.90_EN.md).
