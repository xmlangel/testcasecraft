# Automated Tests(S8) Workflow

> Screen ID **S8** · Screen name **JUnit Result Upload · List · Detail**
> Routes: `/projects/{projectId}/automation` · `/projects/{projectId}/junit` · `/projects/{projectId}/automation-results/{testResultId}` · `/projects/{projectId}/junit-results/{testResultId}` · `/junit-results/{testResultId}` · `/automation-tests/{testResultId}`

---

## 1. Workflow Purpose

The automated test channel collects, organizes, and tracks results from automated test tools (JUnit, Playwright, Pytest, etc.). It exists alongside S6 manual test execution and feeds into S3 and S7 statistics together.

| Purpose | Content |
|---|---|
| ① **Result collection** | Upload and automatically parse JUnit XML files (up to 100MB) |
| ② **List tracking** | List automated results in chronological order by project |
| ③ **Detail analysis** | View success/failure/skip status and error messages by suite and case |
| ④ **Case linking** | Match JUnit cases with manual case IDs for statistics inclusion |
| ⑤ **Result editing** | Modify status, priority, and notes of automated cases |
| ⑥ **Export** | Generate external reports in CSV or PDF |

**What this screen does not do**

| Does not do | Owned by |
|---|---|
| Automated script writing and execution | External automation tools |
| JUnit XML file generation | External automation tools |
| Organizing results into plans and executions | S5(Plans) S6(Execution) |

---

## 2. Screen Location

| Item | Content |
|---|---|
| Before | View automated result count in S3 Dashboard or select automation tab in left panel |
| After | Result detail screen(`/projects/{projectId}/automation-results/{testResultId}`) |
| Entry condition | Login + project selected |
| Entry path | Click `[Automated Tests]` in header tab bar or automation badge on project card (S1) |

---

## 3. Workflow Process Flow

### 3.1 List View

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Enter `/projects/{projectId}/automation` | Fetch project's automated results. Display skeleton while loading | — |
| 2 | Data received | Render result list and statistics (success rate, date range) together | — |
| 3 | 0 results | Display empty state guidance (centered message) | — |
| 4 | Click result row | Navigate to detail screen (`/projects/{projectId}/automation-results/{testResultId}`) | S8 detail |
| 5 | Select time range | Recalculate statistics (default 7 days) | Chart updated |

### 3.2 File Upload

| # | Action | Behavior |
|---|---|---|
| 1 | Click `[+ JUnit Result Upload]` button or upload area | File selection dialog opens |
| 2 | Select XML file (max 100MB) | Display file metadata + activate `[Upload]` button |
| 3 | Optional input: execution name, description | Form auto-saves |
| 4 | Click `[Upload]` | POST `/api/junit-results/upload` |
| 5 | Uploading | Display progress bar |
| 6 | Completed (file < 50MB) | Complete immediately. Show "Upload complete" notification + refresh list |
| 7 | Large file (file ≥ 50MB) | Display as PROCESSING status. Background processing (separate monitoring screen) |

### 3.3 Result Search and Filter

| # | Feature | Behavior |
|---|---|---|
| 1 | Search input (`filename·execution name`) | Real-time filter (debounce 500ms) |
| 2 | Status tab (`All·Pass·Fail·Skip`) | Show only matching results |
| 3 | Date range selection (7d·30d·90d·all) | Update statistics and list together |

### 3.4 Result Delete

| # | Action | Behavior |
|---|---|---|
| 1 | Click `⋮` menu on result row | Options: detail·download·delete |
| 2 | Click `[Delete]` | Show confirmation dialog "Are you sure you want to delete?" |
| 3 | Confirm `[Delete]` | DELETE `/api/junit-results/{id}` |
| 4 | Success | Remove row from list |

---

## 4. Automated Result Model Rules

| # | Rule | Content |
|---|---|---|
| A1 | **JUnit results are independent concepts** | Stored and tracked separately from plans and executions |
| A2 | **One result record per file** | XML → parsing → JunitTestResult 1 record |
| A3 | **Case matching is optional** | User manually specifies "this JUnit case = our manual TC" |
| A4 | **Four status values** | PASSED / FAILED / ERROR / SKIPPED. Manual execution's BLOCKED does not come from automation |
| A5 | **Processing status is separate** | PROCESSING(large file in progress) / COMPLETED / FAILED |
| A6 | **Aggregated in statistics** | Automatically included in S3 and S7 statistics success rate and trends |

---

## 5. Users and Permissions

### 5.1 Feature × Role

| Feature | System ADMIN | PM LEAD | DEVELOPER CONTRIBUTOR | TESTER | VIEWER | Reference |
|---|---|---|---|---|---|---|
| View automated result list | ○ | ○ | ○ | ○ | ○ | Project read permission |
| Upload JUnit XML | ○ | ○ | ○ | ○ | — | Upload permission |
| View result detail | ○ | ○ | ○ | ○ | ○ | Project read permission |
| Edit case (status, notes) | ○ | ○ | ○ | ○ | — | Result entry permission |
| Delete result | ○ | ○ | — | — | — | Project admin permission |
| Export (CSV, PDF) | ○ | ○ | ○ | ○ | ○ | Project read permission |

**TESTER can view only, cannot delete.** The structure allows recording but not deleting results.

### 5.2 Screen Element Visibility

| Element | Visibility condition |
|---|---|
| `[+ Upload]` button | Check upload permission |
| `⋮` menu (delete item) | Always visible, server rejects delete if no permission |
| Detail screen edit button | Check result entry permission |

---

## 6. Feature Rules

| # | Rule |
|---|---|
| F1 | **List is paginated** (default 20 items/page). Does not support separate download |
| F2 | **Statistics receive date filter** (7d/30d/90d/all). When selected, list shows all, chart filters only |
| F3 | **Upload accepts optional execution name and description** |
| F4 | **Large files (≥50MB) are processed asynchronously** (monitoring status available) |
| F5 | **Search is instant filter** (debounce 500ms). Does not wait for enter |
| F6 | **Status filter is tab-based** (click to apply immediately). Not radio buttons |
| F7 | **Collapsible section expanded state saved in browser storage** (remembered after refresh) |

---

## 7. Integration with Other Screens

| Integration | Data flow | Reference |
|---|---|---|
| **S3 Dashboard** | Automated result count and success rate displayed on project card | S3 document |
| **S1 Project List** | Automation count badge displayed on project card; click navigates to S8 | S1 document |
| **S7 Result Statistics** | JUnit results aggregated with manual results for success rate and trend | Manual section 9 |
| **Test Cases(S4)** | Latest status and notes of matched JUnit cases can display below manual case | |

---

## 8. Preconditions and Constraints

| # | Item | Content |
|---|---|---|
| C1 | **File format** | JUnit XML standard. Other tools (Pytest, Playwright) must support JUnit-compatible export |
| C2 | **File size limit** | Maximum 100MB. Reject if exceeded |
| C3 | **Upload permission** | Check upload permission. VIEWER cannot upload |
| C4 | **Case matching** | Manual, not automatic. User manually enters "our case ID" in JUnit case detail |
| C5 | **Large file processing** | 50MB and above is asynchronous. Notification or polling monitoring on completion |
| C6 | **Parsing failure** | On XML syntax error or unsupported tag, show error notification + example download |

---

## 9. Requirement ↔ Section Mapping

| Requirement (Feature) | This document section |
|---|---|
| JUnit XML upload | Section 3.2, 6(F3·F4) |
| Result list view, search, filter | Section 3.1, 3.3, 6(F1·F5·F6) |
| Result detail analysis | 02 Screen Definition section 2 |
| Case editing | 03 Components |
| Export (CSV, PDF) | 03 Components |
| Permission-based access | Section 5 |
| Statistics integration | Section 7 |
