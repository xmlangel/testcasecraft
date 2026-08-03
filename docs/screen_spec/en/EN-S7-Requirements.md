# Test Results(S7) Requirement Coverage

> Screen ID **S7** · Reference documents: [`EN-S7-Workflow.md`](EN-S7-Workflow.md) · [`EN-S7-Screen.md`](EN-S7-Screen.md) · [`EN-S7-Components.md`](EN-S7-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference conventions: [`EN-Index.md`](EN-Index.md) section 4.

---

## 1. Functional Requirements

### Basic Statistics and Filtering

| ID | Requirement | Status | Verification method |
|---|---|---|---|
| **S7-01** | **Period filter**: Last 7 days / Last 30 days / All / Custom date | Working | Click filter dropdown → verify 4 options |
| **S7-02** | **Multi-filter**: Apply plan, assignee, result status simultaneously | Working | Select multiple filters → verify statistics and table update |
| **S7-03** | **Pass rate card** (%) and **result distribution donut chart** (PASS/FAIL/BLOCKED/NOTRUN) | Working | Enter dashboard tab → verify card and chart render |
| **S7-04** | **Trend chart**: Daily or weekly pass rate + execution count trend | Working | Change period filter → verify chart update |
| **S7-05** | **Folder statistics**: Folder tree structure with result summary per node | Working | Expand folder → verify sub-statistics display |
| **S7-06** | **Detail results table**: Case name, status, assignee, execution time + sort + page navigation | Working | Enter detail table tab → verify column sort and page navigation |

### QA Summary and Report

| ID | Requirement | Status | Verification method |
|---|---|---|---|
| **S7-07** | **QA summary panel**: Exposed when execution selected, inactive when not selected | Working | Select execution by filter → verify panel activation |
| **S7-08** | **Markdown editor**: Max 10,000 character input, real-time preview, save | Working | Type text → verify character count display + save operation |
| **S7-09** | **Export 6 formats**: Excel PDF(landscape/portrait) CSV Advanced(Excel+QA) Advanced(PDF+QA) | Working | Download each format → verify file creation |
| **S7-10** | **QA summary metadata**: Author name and modification time (read-only) displayed | Working | QA summary panel → verify metadata render |

---

## 2. Non-Functional Requirements

| ID | Requirement | Status | Verification method |
|---|---|---|---|
| **S7-N1** | **Performance**: Smooth table scrolling even with 1,000+ results | Working | Upload large data then scroll response → verify smooth response |
| **S7-N2** | **Localization**: Korean default with English support | Working | Switch language then verify text changes (manual section 14) |
| **S7-N3** | **Accessibility**: Table header sort, keyboard navigation, screen reader | Partial | Verify with screen reader and Tab key navigation |
| **S7-N4** | **Responsive**: Mobile <600px, tablet 600~1280px, desktop >1280px | Working | Browser responsive mode → verify per resolution |

---

## 3. Correction Items

As of 2026-08-03, code review reveals the following items unspecified or unclear.

| Item | Current status | Impact | Resolution |
|---|---|---|---|
| **Comparison chart activation condition** | Implemented in code but UI entry path unclear | Document 2.4 section D-5 states "when 2+ selected" but filter UI doesn't show selection method | Add direct execution selection capability to filter panel or update documentation |
| **DEVELOPER's QA summary permission scope** | Code: checks project edit permission only, no individual execution assignee constraint | Table 5.1 says "△ (assigned only)" but doesn't match implementation | Review permission logic |
| **TESTER's table query range** | Unconfirmed whether TESTER can query only own entered results or all | Possible data exposure risk | Review permission filtering logic |
| **PDF export line break rule** | How long steps/expected results break at page boundary unclear from screen alone | Document 2.7 states "print across multiple pages intact" only | Export results with long steps in both landscape and portrait to verify page boundary handling visually |

---

## 4. Needs Verification (⚠)

Code review alone cannot determine these. Requires execution or developer confirmation.

### V-S7-1: Table "Action" Column Behavior

**Current situation**: Code has `handleViewResult` function, but unclear whether click navigates to detail page or opens inline form.

**Verification method**:
1. Click "View details" link in table row
2. (A) Does it navigate to new page or route?
3. (B) Does it open modal/drawer inline in current screen?

**Impact**: Requires update to document 2.5 section "Action" column description.

### V-S7-2: Advanced Export PDF QA Summary Display Method

**Current situation**: "QA Analysis" section stated to be inserted in PDF, but section layout (Markdown→HTML conversion, page splitting) unclear in code.

**Verification method**:
1. Advanced export → select PDF+QA then download
2. Open generated PDF → verify "QA Analysis" section
3. Verify if Markdown formatting (bold, headings, etc.) reflected in PDF

**Impact**: Requires strengthening description in document 3.5 and 2.7 "Advanced export" sections.

### V-S7-3: Filter Default Value Save Location

**Current situation**: Document 6.G8 states "save in local storage", but unclear if actual implementation is browser storage or server user settings.

**Verification method**:
1. Select period filter to "Last 7 days"
2. Visit different page then return
3. Does period filter remain "Last 7 days"? (browser storage) or revert to default? (no server save)

**Impact**: Requires update to document 6.G8.

### V-S7-4: Data Refresh Frequency

**Current situation**: Document 4.1 states "re-query" each time, but unclear if auto-refresh (polling) exists.

**Verification method**:
1. Save result in S6
2. S7 screen already open
3. Do statistics numbers change without manual refresh?

**Impact**: Requires update to document 4.1 "Update timing" table.

---

## 5. Backend Functions Not in Screen

Following API endpoints implemented but not directly called from S7 screen.

| Path | Purpose | Used by screen |
|---|---|---|
| `GET /api/test-results/{id}` | Query individual result detail | S6 result entry form |
| `POST /api/test-results/{id}/attach` | Upload attachment to result | S6 |
| `DELETE /api/test-results/{id}` | Delete result | S6 |

---

## 6. Maintenance Handoff

### 6.1 Change Rules

When modifying S7 screen, always update all four documents together.

| Document | Update when |
|---|---|
| **01_Workflow** | Add/delete feature, change permission policy, change filter rule |
| **02_Screen** | Add/delete/move UI element, change state rule, change text |
| **03_Components** | Restructure component, change props, add API endpoint |
| **04_Requirements** (this file) | ① Add requirement → generate ID ② Modify code → update "Implementation location" ③ Resolve "Needs verification" items |

### 6.2 Version Management

Update documentation header version, commit, and timestamp.

Baseline version **v1.0.102** → **v1.0.103**
Baseline commit **73340e4f** → **{new commit}**
Written **2026-08-03 21:42 KST** → **{current KST}**

### 6.3 Verification Checklist

After change:

- [ ] Verify terminology and numbering match across documents 01, 02, 03, 04
- [ ] If new requirement added, verify no duplicate ID in S7-01~
- [ ] Verify API response structure matches TypeScript interface in document 03
- [ ] Review if "Needs verification" items in document 04 resolved

### 6.4 Related Document Coordination

Update together when modifying S7:

| Document | Reason |
|---|---|
| `EN-Overview.md` | Route (`/results`) permission operational stage definition |
| `../../manual/new/USER_MANUAL.md` manual section 9 | Usage procedure screenshots |
| | Route definition area determination |
| | Menu item |

---

## 7. Approval and Signature

These requirements verified by following methods.

| Role | Verification items | Status |
|---|---|---|
| **Design** | Requirement, UI, component consistency | ☑ |
| **Developer** | Code implementation, API contract | ◻ (pending V-S7-1~4 confirmation) |
| **QA** | Feature operation, performance, accessibility | ◻ (testing planned) |
| **Documentation** | Full review | ◻ |

**Last updated**: 2026-08-03 21:42 KST
