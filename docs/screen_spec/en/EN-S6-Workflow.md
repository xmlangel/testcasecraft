# Test Execution(S6) Workflow

> Screen ID **S6** · Screen name **Execution list · Execution details · Result entry**
> Routes: `/projects/{projectId}/executions` · `/projects/{projectId}/executions/new` · `/projects/{projectId}/executions/{executionId}` · `/projects/{projectId}/executions/{executionId}/testcases/{testCaseId}/result` · `/executions/{executionId}`

---

## 1. Business Objectives

Test cases assembled into an execution plan (plan) are executed, and results (Pass/Fail/Blocked/Not Run) are recorded per case. An execution can be created without a plan. Recorded results are reflected in real-time in dashboard and result screen statistics.

| Objective | Description |
|---|---|
| ① **Select execution plan** | Choose a pre-composed plan (case bundle) to create an execution. Or create an execution without specifying a plan |
| ② **Check progress** | View each execution's status (in progress/completed), progress rate (N cases completed out of total), and assigned plan from the execution list |
| ③ **Record case results** | Open each case in an execution and record result (P/F/B/N), notes, tags, JIRA, and attachments |
| ④ **Auto save** | Results are auto-saved approximately 1.5 seconds after modification. Viewing alone does not trigger save |
| ⑤ **Check previous results** | When retesting the same case, view previous results in markdown or plain text format |

**What this screen does not do**

| Not handled | Owned by |
|---|---|
| Plan creation, case addition | S5 Test Plans |
| Statistics, dashboard queries | S3 Dashboards, S7 Test Results |
| Result export (Excel/PDF) | S7 Test Results |

---

## 2. Screen Location

| Item | Content |
|---|---|
| Previous screen | From S5 Plan details `[Create Execution]` or S3 Dashboard `[Start Execution]` |
| Next screen | S3 Dashboard, S7 Test Results (auto-updated when results are saved) |
| Entry condition | Logged in + project member + edit permission (to create execution) or result recording permission (TESTER included) |
| Direct access | Left menu `[Test Execution]` in S2 Shared Layout or area tab in header |

All URLs starting with `/executions` are rendered in the S6 area. Plan selection is typically the flow from S5 → S6 entry, but an execution can also be created directly from a project card in S1.

---

## 3. Business Process Flow

### 3.1 Execution List Inquiry

| # | User Action | Screen Behavior | Result |
|---|---|---|---|
| 1 | Enter `/projects/{id}/executions` | Retrieve all executions in that project. Display in descending date order, 20 per page | — |
| 2 | (Screen display) | Display 5 per page, load next page when scrolling down | — |
| 3 | (Background) | While the tab is active (focused), auto-refresh the list every 20 seconds. Pause if tab is inactive | Status and progress of in-progress executions reflected in real-time |
| 4 | Search by title | Display only executions whose title contains the entered text. Search term is session-preserved | — |
| 5 | Click execution card | Open the case list for that execution, filter panel appears on the right | Detail screen (area 3) |
| 6 | Delete execution | Select delete from menu, confirmation dialog appears, approved deletion proceeds | — |

Auto-refresh detects tab visibility (Visibility API) and pauses when the browser tab is in the background. 20 seconds is a fixed value and cannot be adjusted via server settings.

### 3.2 Execution Creation

| # | Action | Behavior |
|---|---|---|
| 1 | Click `[+ New Execution]` button or `[Create Execution]` from S5 Plan details | Open creation form or pre-select S5 plan if initiated from plan |
| 2 | Enter execution name | Free name regardless of plan |
| 3 | Select plan | Choose from dropdown or pre-selected if entry point includes plan |
| 4 | `[Save]` | `POST /api/test-executions` creates the execution, enter case list for that execution |

Since plan is not required, cases like "this round we'll test just a few cases selected ad-hoc" are supported.

### 3.3 Record Results by Case

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | Click case row in execution | Navigate to result entry screen (`/executions/{eid}/testcases/{tcid}/result`) | — |
| 2 | (Result entry screen) | Read case title, description, step count; use 4 floating buttons (P/F/B/N) to record result | — |
| 3 | Add notes, tags, JIRA (optional) | Each field auto-saves approximately 1.5 seconds after entry | — |
| 4 | Add attachment files (optional) | Drag and drop or use upload button for images and files | — |
| 5 | Check previous results | View past results of the same case in a dialog, toggle between markdown and plain text | Manual section 8-4-6 |
| 6 | Previous/Next buttons | Proceed to next not-run case in the same execution | — |

PASS(P), FAIL(F), BLOCKED(B), NOT_RUN(N) are the four values. SKIPPED **comes only from automation tools**; manual recording has no such option.

**Auto-save guard**: Save is attempted only when result fields are modified. Opening the same case multiple times without changes does not create empty `TestResult` records. If this guard is removed, a regression occurs where viewing-only creates records (see manual section 8-4-3 caution).

### 3.4 Test Case Attachment Area

The result entry screen footer displays **case attachments** (settings, screenshots, etc., uploaded from S4) in read-only mode. TESTER role does not have permission to modify attachments, so all attachments must be prepared before execution.

---

## 4. Execution and Result Model Rules

| Item | Rule |
|---|---|
| **Execution status** | DRAFT(in preparation) / IN_PROGRESS(ongoing) / COMPLETED(complete) |
| **Result status** | PASS FAIL BLOCKED NOTRUN SKIPPED |
| **SKIPPED origin** | Comes only from automation tools (S8). Manual recording has no such option |
| **Tag inheritance** | Tags applied to execution are inherited by all result records below it |
| **Result timestamp** | Each result records save time. Retesting the same case shows only the latest result |

---

## 5. Users and Permissions

### 5.1 Execution Create, Edit, Delete

| Permission | Read | Create | Edit | Delete | Reference |
|---|---|---|---|---|---|
| PROJECT_MANAGER | ○ | ○ | ○ | ○ | Project edit permission per `00_Overview.md` section 5.2 |
| LEAD_DEVELOPER | ○ | ○ | ○ | ○ | — |
| DEVELOPER | ○ | ○ | ○ | ○ | — |
| CONTRIBUTOR | ○ | ○ | ○ | ○ | — |
| **TESTER** | ○ | — | — | — | Read and result recording only per `00_Overview.md` section 5.2 |
| VIEWER | ○ | — | — | — | — |

### 5.2 Result Recording

| Permission | Recording allowed | Reference |
|---|---|---|
| PM·LEAD·DEV·CONTRIBUTOR | ○ | Project edit permission |
| **TESTER** | **○** | Result recording permission |
| VIEWER | — | — |

**TESTER role**: No edit permission, but **result recording is allowed**. Reading cases, testing, and recording results is the TESTER's primary responsibility. Without this permission, P/F/B/N buttons are disabled for TESTER on the result entry screen, and notes, tags, attachments cannot be filled.

---

## 6. Functional Rules

| Rule | Content | Violation consequence |
|---|---|---|
| **Plan-unspecified execution** | When execution is created without selecting a plan, cases can be manually added (currently not implemented, roadmap item) | — |
| **Case retrieval for plan-unspecified execution** | Backend returns empty list if testPlanId is null | — |
| **Auto-refresh tab detection** | Browser tab polling stops when in background. Resumes when tab returns to foreground | Prevents unnecessary API calls |
| **Search term preservation** | Last search term per project is saved in sessionStorage, restored when same project is reopened | — |

---

## 7. Integration with Other Screens

| Source | Destination | Contract | Reference |
|---|---|---|---|
| **S5 Plan** | S6 Execution creation | Plan ID transferred to execution, case list inherited | onClose |
| **S6 Execution list** | S6 Case result entry | Execution ID + Case ID | `/executions/{eid}/testcases/{tcid}/result` |
| **S6 Result entry** | S3 Dashboard, S7 Results | `TestResult` table updated when result saved | Real-time statistics reflection |
| **S3 Dashboard** | S6 Execution creation | `[Start Execution]` button | Directly start from project statistics |

---

## 8. Assumptions and Constraints

| Item | Description | Workaround |
|---|---|---|
| **Plan must be created first** | To include cases in an execution, they must be pre-selected as a plan | Plan-unspecified execution roadmap (currently no UI) |
| **Case attachments read-only** | Case attachment list can be viewed on result entry screen but not modified | Prepare all attachments in advance on S4 |
| **Auto-save only** | No explicit save button. Modifications auto-save | Use read-only permission to avoid unintended changes |
| **Polling stops when tab inactive** | Execution list does not update while working in other tabs/windows | Manual refresh (browser F5) or activate tab and wait |
| **TESTER records results only** | Cannot edit execution attributes like name, plan. Read-only access | PM/LEAD creates execution, TESTER records results |

---

## 9. Requirement ↔ Section Mapping

| Requirement | Section | Verification method |
|---|---|---|
| Execution list auto-refresh every 20 seconds | 3.1 | Wait 20 seconds on active screen, observe status change |
| TESTER can record results | 5.2 | Result recording permission |
| Results are 4 values (P/F/B/N) | 4 | Manual section 8-4 |
| Plan-unspecified execution supported | 3.2 | testPlanId nullable |
| Previous results retrievable per case | 3.3 | Manual section 8-4-6 dialog toggle |
| Auto-save guard (view-only does not save) | 3.3 | Auto-save hook triggered on modification only |
