# Test Results(S7) Workflow

> Screen ID **S7** · Screen name **Result Statistics · Detail Table · QA Summary · Export**
> Routes: `/projects/{projectId}/results`

---

## 1. Operational Purpose

Display and analyze test execution results entered in S6. View pass rates, distribution, and trends at a glance, add QA summary, and export reports in formats matching policy.

| Purpose | Content |
|---|---|
| ① **Statistics Inquiry** | View aggregated execution results by period and filter as cards and charts |
| ② **Detail Review** | Sort, filter, and individually query case results in a table |
| ③ **QA Summary** | Record analysis opinions and recommendations in Markdown per execution |
| ④ **Report Export** | Export statistics as Excel / PDF / CSV. Advanced export includes QA summary |

**What this screen does not do**

| Not included | Owner |
|---|---|
| Result entry | S6 result entry form (`/executions/{id}/testcases/{tcId}/result`) |
| Automated test result collection | S8 automated test JUnit result management |
| Case or plan modification | S4, S5 |
| Execution deletion | S6 execution list |

---

## 2. Screen Position

| Item | Content |
|---|---|
| Previous (before) | Immediately after result entry in S6 detail |
| Next (after) | **No direct successor to another screen.** Repeated filtering and re-querying within the same screen |
| Entry condition | Login + project permission R or higher |
| Always accessible | S2 left menu, header tab `Test Results`, S7 item |

**Route source: `EN-Overview.md` section 6.2** This document references that table only.

---

## 3. Operational Process Flow

### 3.1 Statistics Inquiry and Filters

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Enter `/projects/{id}/results` | Aggregate all execution results and display statistics cards and charts. Show progress indicator during data load | Statistics dashboard exposed |
| 2 | Open filter panel (top right `Filter`) | Display period, plan, assignee, and result status filters | Position above detail table |
| 3 | Select period | Enter start and end dates or use presets (Last 7 days, Last 30 days, All) | Apply filter |
| 4 | Filter by plan, assignee, result | Select via checkbox or multi-select | Detail table and statistics update together |
| 5 | `[Reset]` button | All filter values return to defaults | — |

**Statistics are independent of the table.** Statistics cards are recalculated from the full or selected plan range, and the detail table is additionally filtered by period, assignee, and status from those results, then paginated.

### 3.2 Chart Area and Statistics

| # | Chart type | Display rule | Interaction |
|---|---|---|---|
| 1 | Pass rate card | Percentage of PASS among all cases | — |
| 2 | Result distribution | Count of PASS / FAIL / BLOCKED / NOTRUN | — |
| 3 | Trend chart | Daily or weekly execution count and pass rate line | Period filter applied |
| 4 | Folder statistics | Summary of results for each node in folder tree | Collapse/expand |
| 5 | Comparison chart | Side-by-side pass rates of multiple executions (optional) | — |

**No data state:** If no executions exist in the query range, display "No result data" notice + text prompting case creation and execution start.

### 3.3 Detail Table View

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | Scroll table | Render only visible rows (virtualization) | Manual section 9.3 |
| 2 | Click column header (sort) | Sort by case name, status, assignee, execution date | MUI data table native |
| 3 | Click individual row | Display result detail for that case (prior stage: execution pipeline flow) | — |
| 4 | Pagination | "Rows per page selection" "Page navigation" | — |

### 3.4 QA Summary Composition

| # | Action | Behavior |
|---|---|---|
| 1 | Select execution (after filter applied) | One execution in filter results becomes active |
| 2 | QA summary panel exposure condition | Panel does not appear if no execution selected |
| 3 | Markdown editor | Up to 10,000 characters with real-time preview |
| 4 | `[Save]` | `PUT /api/executions/{id}` (qaSummary field) |
| 5 | Metadata | Author and modification time displayed (read-only) |

**QA summary is per execution.** Selecting a different execution on the same date loads that execution's QA summary (existing value if present, empty if not).

### 3.5 Export

| # | Format | Composition | Features |
|---|---|---|---|
| 1 | **Excel** `.xlsx` | Statistics summary sheet + detail results sheet | Includes only filtered range. QA summary not included |
| 2 | **PDF (landscape)** | Charts + statistics table | Fit to one page landscape layout |
| 3 | **PDF (portrait)** | Detail table spanning multiple pages | Header and footer on each page |
| 4 | **CSV** | Detail results only | Light weight for spreadsheet transfer |
| 5 | **Advanced export** | Excel · PDF · CSV + QA summary | QA summary included in PDF only (manual section 9.4) |

**Advanced export includes QA summary:** "Test Summary", "Findings", "Recommendations" sections appear per execution in PDF, and are not included in Excel or CSV (incompatible with table format).

---

## 4. Result Aggregation Model

### 4.1 Aggregation Source

All numbers on this screen come from **re-querying the `TestResult` table**. No separate cache or aggregation table exists.

| Calculation | Target | Cache | Update timing |
|---|---|---|---|
| Pass rate | `COUNT(status='PASS') / COUNT(*)` | None | Recalculate on screen entry, filter change |
| Result distribution | `GROUP BY status COUNT(*)` | None | Same |
| Trend | Grouped by day or week | None | Same |

**Therefore real-time updates have no constraints.** When result is saved in S6, it immediately reflects in this screen.

### 4.2 Period Filter Calculation Rules

| Filter | Calculation | Example |
|---|---|---|
| **Last 7 days** | `TODAY - 7` ~ `TODAY` | As of 2026-08-03: 2026-07-27 ~ 2026-08-03 |
| **Last 30 days** | `TODAY - 30` ~ `TODAY` | Same: 2026-07-04 ~ 2026-08-03 |
| **All** | First execution ~ now | No constraint |
| **Custom** | Both dates entered inclusive | Same |

**Date is based on execution creation time (`TestExecution.createdAt`),** not result entry time.

---

## 5. Users and Permissions

### 5.1 Project Permission Application

This screen entry checks only project **R permission** (read).

| Permission | Statistics view | Filtering | QA summary write/edit | Export |
|---|---|---|---|---|
| **PM LEAD** | ◯ | ◯ | ◯ | ◯ |
| **DEVELOPER CONTRIBUTOR** | ◯ | ◯ | △ (execution creator only) | ◯ |
| **TESTER** | ◯ | ◯ | ◯ (executions where user entered results) | ◯ |
| **VIEWER** | ◯ | ◯ | × | ◯ |

⚠ **Needs verification.** Whether DEVELOPER can write QA summary for all executions or only their own assigned ones (confirm in code).

### 5.2 System Permission

`ADMIN` views all project results. Does not bypass project permission checks (ADMIN does not automatically access all projects).

---

## 6. Functional Rules (G1~G10)

### G1. Filter and Statistics Synchronization

When any filter changes, statistics cards, charts, and table all **update simultaneously**. Spin indicator appears only once.

### G2. Result Status Definition

Test result status has four values: pass, fail, blocked, not run.

| Value | Display | Condition |
|---|---|---|
| **PASS** | 🟢 Green `Pass` | Case expected and actual results match |
| **FAIL** | 🔴 Red `Fail` | Mismatch. Suspected defect |
| **BLOCKED** | 🟠 Orange `Blocked` | Cannot execute due to environment or unmet precondition |
| **NOTRUN** | ⚪ Grey `Not Run` | In plan but result not entered |

### G3. QA Summary Hidden When No Execution Selected

Even if filter results contain 1+ executions, user must explicitly select which execution's summary to write. Panel is grayed out and inactive until selection.

### G4. Export Format Selection

Six options presented in dropdown: "Excel" "PDF(landscape)" "PDF(portrait)" "CSV" "Advanced(Excel+QA)" "Advanced(PDF+QA)".

### G5. Performance Optimization for Large Result Sets

Table renders smoothly even with 1,000+ results through virtualization. Default rows per page is 50, changeable by user (all, 25, 50, 100).

### G6. Export Progress Indicator

After export button click, display "Preparing..." state for 1~3 seconds before file download starts.

### G7. Localization of Chart Category Names

Chart axis labels, legend, and tooltips all display in Korean or localized language (`t` function).

### G8. Period Filter Default Value

Default on screen entry is "Last 30 days". User selection is saved in local storage and persists on next entry.

### G9. Execution Comparison Mode

Selecting 2+ executions activates comparison mode chart (side-by-side bars). Returning to 1 execution reverts to default statistics.

### G10. Result Status Badge Consistency

Result status badges on this screen match S6 (result entry form) colors and shapes. Maintain "PASS = green" throughout product.

---

## 7. Cross-screen Links

| Screen | Entry point | Condition |
|---|---|---|
| **S3 Dashboard** | Header tab | Same project |
| **S4 Cases** | Case name link in table | Click to open case detail |
| **S6 Execution** | Execution link in table | Click to navigate to S6 execution detail |

---

## 8. Assumptions and Constraints

| Constraint | Note |
|---|---|
| **API Re-query** | Full result set re-queried each filter change. Delay possible if results very large (10,000+ records) |
| **Offline not supported** | Always server-queried without cache, so statistics not updated offline |
| **Timezone display** | Execution time is server timezone. Client timezone not reflected |
| **QA summary size** | Inputs exceeding 10,000 characters blocked before save |
| **Export size** | 50,000+ results may experience performance degradation in PDF export |

---

## 9. Requirement↔Section Mapping

| Requirement ID | Content | This document section |
|---|---|---|
| S7-01 | Period filter (7 days / 30 days / all / custom) | 3.1, 4.2 |
| S7-02 | Plan / assignee / status multi-filter | 3.1 |
| S7-03 | Pass rate card and result distribution chart | 3.2 |
| S7-04 | Trend chart (daily / weekly) | 3.2 |
| S7-05 | Folder statistics | 3.2 |
| S7-06 | Detail results table with sort and pagination | 3.3 |
| S7-07 | QA summary panel exposure on execution selection | 3.4, section 6.G3 |
| S7-08 | Markdown editor with 10,000 character limit | 3.4, section 8 |
| S7-09 | Excel / PDF / CSV / advanced export | 3.5, section 6.G4 |
| S7-10 | QA summary metadata (author, modification time) | 3.4 |
| S7-N1 | Smooth table virtualization performance | Section 6.G5 |
| S7-N2 | Internationalization (i18n) support | Section 6.G7 |
