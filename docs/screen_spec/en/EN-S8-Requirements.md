# Automated Tests(S8) Requirement Coverage

> Screen ID **S8** · Reference documents: [`01`](EN-S8-Workflow.md) · [`02`](EN-S8-Screen.md) · [`03`](EN-S8-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference rules follow [`../README.md`](../README.md) section 4.

---

## 1. Functional Requirements

| ID | Requirement name | Description | Screen area | Status |
|---|---|---|---|---|
| **S8-01** | **JUnit XML upload** | Upload and automatically parse JUnit XML files up to 100MB | 02 section 2.1 A; 02 section 2.8 H | ✅ Working |
| **S8-01-a** | File format validation | Accept XML files only, reject non-standard files | H dialog | ✅ Working |
| **S8-01-b** | File size limit | Reject if over 100MB | H dialog | ✅ Working |
| **S8-01-c** | Large file async processing | Files ≥50MB processed in background, monitoring available | H dialog, progress dialog | ✅ Working |
| **S8-01-d** | Optional input (execution name, description) | User can enter optional fields | H fields 2, 3 | ✅ Working |
| **S8-02** | **Result list view** | List project's JUnit results in chronological order | 02 section 2.6 F | ✅ Working |
| **S8-02-a** | Pagination | Default 20 items/page, load next page | F table bottom | ✅ Working |
| **S8-02-b** | Search filter | Search filename, execution name, description (debounce) | E search input | ✅ Working |
| **S8-02-c** | Status filter (tabs) | All, pass, fail, skip tabs for instant filter | E status tabs | ✅ Working |
| **S8-03** | **Statistics and charts** | Visualize success rate and trends by date range (7d/30d/90d/all) | 02 section 2.3 C; 02 section 2.4 D | ✅ Working |
| **S8-03-a** | Summary cards (4 columns) | Pass/Fail/Error/Skip cards with color and icon | C summary | ✅ Working |
| **S8-03-b** | Pie chart | Ratio of status to total | C chart | ✅ Working |
| **S8-03-c** | Bar chart | Daily cumulative status trend | C chart | ✅ Working |
| **S8-03-d** | Date filter | Select 7d/30d/90d/all, refresh chart only | D filter tabs | ✅ Working |
| **S8-04** | **Result detail screen** | View success/failure/skip by suite and case, error message | 03 section 1.2 structure | ✅ Working |
| **S8-04-a** | Suite tab selection | "All" + individual suite cases display | Detail screen suite tabs | ✅ Working |
| **S8-04-b** | Case table | Case name, status, execution time, error message, priority | Detail screen table | ✅ Working |
| **S8-04-c** | Case status icons | PASS(✓), FAIL(✗), ERROR(⚠), SKIPPED(⊘) | Detail screen status column | ✅ Working |
| **S8-04-d** | Right detail panel | Full error message, stack trace, display on row selection | Detail screen right | ✅ Working |
| **S8-05** | **Case editing** | Modify automated case status, priority, notes | Detail screen right edit mode | ✅ Working |
| **S8-05-a** | Status selection | Modify to PASS/FAIL/BLOCKED/NOTRUN | Edit mode status select | ✅ Working |
| **S8-05-b** | Priority selection | Modify to HIGH/MEDIUM/LOW | Edit mode priority select | ✅ Working |
| **S8-05-c** | Notes input | Multi-line text input and save | Edit mode notes field | ✅ Working |
| **S8-05-d** | Save/Cancel buttons | Save changes or discard | Edit mode bottom | ✅ Working |
| **S8-06** | **Export** | Export results as CSV or PDF for external reports | Detail screen menu | ✅ Working |
| **S8-06-a** | CSV export | Include case status, time, result columns | Menu CSV | ✅ Working |
| **S8-06-b** | PDF export | Include table, chart, summary | Menu PDF | ✅ Working |
| **S8-07** | **Result delete** | Delete individual result record | List menu | ✅ Working |
| **S8-07-a** | Delete confirmation | Show "Are you sure you want to delete?" dialog | Delete menu click → dialog | ✅ Working |
| **S8-08** | **Statistics integration** | JUnit results automatically included in S3 and S7 statistics | S3, S7 screens (outside this document) | ✅ Working |
| **S8-09** | **Case matching** | Optionally link JUnit case to manual TC ID | Detail screen edit mode | ✅ Working |

---

## 2. Non-Functional Requirements

| ID | Requirement name | Description | Reference | Status |
|---|---|---|---|---|
| **S8-N1** | **Performance: initial load** | List screen < 3 seconds (including network) | Parallel load (results + statistics) | ✅ Working (`Promise.all`) |
| **S8-N2** | **Performance: screen transition** | Detail screen < 2 seconds | Parallel load (results + suites) | ✅ Working |
| **S8-N3** | **Performance: search debouncing** | 500ms debounce, prevent excessive requests | Input optimization | ✅ Working |
| **S8-N4** | **Accessibility: status color + text** | Display status with text and icon, not color alone | WCAG 2.1 AA | ✅ Working |
| **S8-N5** | **Security: permission validation** | Verify permissions frontend and backend | Upload permission `@PreAuthorize` | ✅ Working |
| **S8-N6** | **Security: input validation** | Validate file format, size, permission before processing | | ✅ Working |
| **S8-N7** | **Internationalization: i18n keys** | All screen text processed for multiple languages | `t("junit.*")` | ✅ Working (Korean/English) |
| **S8-N8** | **Responsive: list table** | Scrollable on mobile | TableContainer `overflow-x: auto` | ✅ Working |
| **S8-N9** | **Responsive: detail panel** | Hide/stack panel on narrow screen | `sidebarVisible` state | ✅ Working |
| **S8-N10** | **UI state persistence** | Save collapsible section expanded state in browser storage | | ✅ Working |

---

## 3. Correction Targets

Working but needs refinement to align with specifications.

| ID | Item | Current | Action | Priority |
|---|---|---|---|---|
| **C-S8-1** | **Status filter label ambiguity** | Tabs show "All, Pass, Fail, Skip" but "Skip" unclear if case status (SKIPPED) or file status (PROCESSING) | Clarify tab label to "All, Pass, Fail, Case Skip" or add definition in document | Low |
| **C-S8-2** | **Large file progress monitoring UX** | PROCESSING state lacks polling interval and timeout definition | Document polling interval (default 2 seconds) and max wait time (example: 10 minutes), expose setting value | Medium |
| **C-S8-3** | **Menu button permission visibility** | `⋮` menu (delete item) visible to all roles, delete rejected by server 403 | Check permission upfront on screen, hide delete item (follow G4 rule) | Medium |

---

## 4. Needs Verification (⚠)

Points where code interpretation varies, requiring runtime confirmation.

| ID | Item | Issue | Verification method | Priority |
|---|---|---|---|---|
| **V-S8-1** | **Large file progress display** | Where is % displayed while processing? | Capture progress dialog + verify frontend | Medium |
| **V-S8-2** | **Case edit permission: TESTER** | What screen response when TESTER edits status/notes? | Run test (login as TESTER) | Medium |
| **V-S8-3** | **Search scope: include description** | Does search include `executionName` + `description`? | Check frontend code or test input | Low |
| **V-S8-4** | **CSV export encoding** | Do Korean characters and special characters render correctly? | Download CSV file and open | Low |

---

## 5. Backend Features Not Exposed on Screen

Implemented in backend but currently unreachable from screen. (Candidates for future exposure)

| API | Endpoint | Purpose | Exposure review |
|---|---|---|---|
| Case matching | `PUT /api/junit-cases/{caseId}/link-testcase` | Link JUnit case to manual TC | Consider adding "Link case" item to detail screen menu |
| Batch status update | `PUT /api/junit-results/{id}/cases/batch-update` | Change multiple case statuses at once | Multi-select and bulk operation (future) |
| Result reparse | `POST /api/junit-results/{id}/reparse` | Reparse XML (after matching rule changes) | Consider adding "Reparse" item to menu |

---

## 6. Maintenance Handoff

Core knowledge for new developers and QA.

| Item | Core content |
|---|---|
| **Permission gates** | Upload requires upload permission, editing requires result entry permission, delete requires project admin permission |
| **Agent button** | A deep link only. It does not call the run API, so a broken button does not break the feature. One call decides whether it shows — `agent-connection/runnable` — and a failed lookup defaults to hidden |
| **API response fields** | `content`, `totalPages`, `totalElements` must be included |
| **Status value management** | Separate `JunitTestStatus` enum (PASSED/FAILED/ERROR/SKIPPED) from `JunitProcessStatus` enum (PROCESSING/COMPLETED/FAILED) |
| **Color definition** | Reuse `RESULT_COLORS`, `STATUS_COLORS`, `CHART_COLORS`; do not duplicate |
| **Large file threshold** | Default 50MB, adjustable via env var `junit.file.large-size-threshold` |
| **Browser storage** | Save collapsible section expanded state only (not personal settings). Key: `testcase-manager-junit-accordion` |
