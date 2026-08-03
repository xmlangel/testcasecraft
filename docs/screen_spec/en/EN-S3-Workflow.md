# Dashboards (S3) Workflow

> Screen ID **S3** · Screen name **Project Dashboard · Enterprise Dashboard**
> Routes: `/projects/{projectId}` · `/dashboard` (system admin only)

---

## 1. Business Purpose

The dashboard is the **command center for viewing test work status at a glance**. It consolidates case counts, progress, member workload, and recent trends in graphs and numbers, enabling quick decisions on next actions based on execution status. Two levels of dashboard exist.

| Purpose | Target Audience | Content |
|---|---|---|
| ① **Project Status Overview** | Project participants (PM, developers, QA) | Case and execution progress, result completion rate, plan success rates |
| ② **Enterprise Management Overview** | System ADMIN | Organization projects, activity trends, server performance |
| ③ **Assignee Task Awareness** | Team members in active executions | Cases assigned to me, progress, deadline |

**What this screen does not do**

| Not handled | Owned by |
|---|---|
| Case, plan, execution creation or editing | S4, S5, S6 |
| Detailed report export | S7 Results screen |
| System settings, permission management | S11 Administrator Settings |

---

## 2. Screen Location

### 2.1 Project Dashboard

| Item | Content |
|---|---|
| Before | S2 Workspace entry (`/projects/{projectId}` default) |
| After | S4, S5, S6, S7, S8, S9, S10 — navigate via area tabs |
| Entry condition | Project access permission; 403 if denied |
| Always accessible | Header `[Dashboard]` tab (first in horizontal tabs) |

**`/projects/{projectId}` is the default area.** The dashboard appears as the first screen when a project is activated.

### 2.2 Enterprise Dashboard

| Item | Content |
|---|---|
| Before | S1 Projects list and management menu |
| Entry | Header `[Admin]` dropdown → `[Dashboard]` |
| Entry condition | System `ADMIN` role |
| Route | `/dashboard` |

**`MANAGER` role opens the admin menu only; enterprise dashboard is for `ADMIN` only.**

---

## 3. Workflow Process

### 3.1 Project Dashboard — Entry and Refresh

| # | User Action | Screen Behavior | Result |
|---|---|---|---|
| 1 | Open project | `/projects/{projectId}` entry → dashboard loads automatically | Dashboard data being queried |
| 2 | Data loading | Progress indicator + loading message | User is notified of waiting |
| 3 | Data load complete | All 6 widgets render | Dashboard complete |
| 4 | Click `[Refresh]` | Query latest data | Chart updates |
| 5 | Load failure | Error message + retry button | User recognizes issue and can act |

**Auto-reload on project switch.** Changing project selection automatically re-queries dashboard data.

### 3.2 Widget Interactions

| Widget | Behavior |
|---|---|
| **Project Summary** | Collapse/expand (saved in browser) |
| **Recent Test Results** | Select from plan dropdown → show recent results for that plan only |
| **Test Result Trend** | Period filter (default 15 days) |
| **By Assignee Results** | Stacked bar showing member progress |

**Plan selection affects only the Recent Results widget.** Other charts remain at project-wide baseline.

---

## 4. Data Aggregation Rules

Definitions of numbers displayed on the dashboard.

| Metric | Calculation |
|---|---|
| **Total case count** | Count of all test cases in project |
| **Member count** | Count of all members assigned to project |
| **Completion rate** | (PASS + FAIL + BLOCKED + SKIPPED) / total cases × 100 |
| **Failure rate** | FAIL count in most recent execution / total cases × 100 |
| **By assignee progress** | In current open execution, sum of PASS/FAIL/incomplete per member |
| **By plan success rate** | Most recent N executions for that plan |

**"Most recent execution" range is unspecified.** ⚠ Needs verification: last 1 execution only, or last 7 days? Confirm via API response testing.

---

## 5. Users and Permissions

### 5.1 Features × Roles

Project dashboard is viewable by all roles with project access. No editing (read-only).

| Feature | ADMIN | PM LEAD | DEVELOPER CONTRIBUTOR | TESTER | VIEWER | Reference |
|---|---|---|---|---|---|---|
| Project dashboard view | ○ | ○ | ○ | ○ | ○ | Project access permission |
| Enterprise dashboard view | ○ | — | — | — | — | `isSystemAdmin` |
| Refresh | ○ | ○ | ○ | ○ | ○ | All can do |
| Change period filter | ○ | ○ | ○ | ○ | ○ | All can do |
| Select plan | ○ | ○ | ○ | ○ | ○ | All can do |

**VIEWER also views the dashboard.** No editing, so access is minimized to read-only. Enterprise dashboard is management info, ADMIN only.

### 5.2 Screen Element Display

| Element | Display Condition |
|---|---|
| Project dashboard 6 widgets | `activeProject` exists and access granted |
| `[Refresh]` chip | Visible when `activeProject` exists; ADMIN and MANAGER can click |
| Period filter | Confirm if implemented ⚠ |
| Enterprise dashboard link | `isSystemAdmin` = true |

---

## 6. Functional Rules

| # | Rule |
|---|---|
| F1 | **Collapsible sections store state in browser storage.** Closed sections remain closed after refresh |
| F2 | **Plan selection can be cleared; Recent Results widget persists.** Shows entire project's recent results |
| F3 | **Error messages include retry button together.** Users can easily recover from transient network errors |
| F4 | **Plan selection resets on project switch.** Plans are not tied across projects |
| F5 | **No-data warning hides during loading or error.** Prevents overlapping UI |

---

## 7. Cross-Screen Navigation

Dashboard is **read-only** but has multiple entry points to other screens.

| Entry Point | Target Screen | Behavior |
|---|---|---|
| Widget click | S4 / S5 / S6 | Navigate to corresponding area tab; filter may auto-apply |
| Plan selection | Same screen | Show recent results for selected plan only |
| (Not implemented) Period filter | Same screen | Change chart date range |

---

## 8. Assumptions and Constraints

| # | Item | Content |
|---|---|---|
| T1 | **Server API required** | Dashboard data cannot be built from front-end local state. `dashboardService` API call is essential |
| T2 | **Project context required** | Project dashboard assumes `activeProject` exists. Empty screen without project |
| T3 | **Server validates permissions** | Front-end only displays access; actual 403/401 depends on API response |
| T4 | **Not real-time sync** | Latest data loads only when refresh button is clicked; no polling or WebSocket |

---

## 9. Requirement ↔ Section Mapping

Which sections of the screen implement each requirement is covered in **04_요건반영목록.md**.

| Requirement ID | Requirement | Screen Section |
|---|---|---|
| `S3-01` | Display key project metrics | Section 3.1 Screen definition section 2.2 |
| `S3-02` | 6 widgets | Screen definition section 1 |
| `S3-03` | Filter by plan | Section 3.2 Screen definition section 2.3 |
| `S3-04` | Enterprise dashboard (ADMIN) | Section 2.2 04's `S3-N1` |
