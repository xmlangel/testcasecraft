# Test Plans(S5) Workflow

> Screen ID **S5** · Screen name **Plan List · Plan Creation · Case Selection · Plan 2-Pane Workspace**
> Routes: `/projects/{projectId}/testplans` · `/projects/{projectId}/testplans/new` · `/projects/{projectId}/testplans/{testPlanId}`

---

## 1. Purpose of the screen

A test plan groups cases as an execution unit. Cases reside scattered in a tree, but when you select cases to run together, that becomes a plan. A plan stores the bundle's name, description, and list of included cases, and carries the same case set when creating executions.

| Purpose | Content |
|---|---|
| ① **Plan management** | View all plans in the project as cards or a list, and see at a glance how many cases are in each plan |
| ② **Plan creation** | Create a new plan by entering a name, description, and selecting cases to include |
| ③ **Plan editing** | Change the name, description, or included cases of a created plan |
| ④ **Create execution from plan** | Select a plan → move to the execution creation form, and the plan's cases are automatically populated in the execution |
| ⑤ **View execution list under plan** | In the sidebar layout, expand a plan to see its executions displayed as a tree |
| ⑥ **Connect automated results** | Match uploaded JUnit results to the plan and include them in statistics |

**What this screen does not do**

| Not responsible for | Handled by |
|---|---|
| Creating or editing cases | S4 Test Cases |
| Execution details and result entry | S6 Test Execution |
| Statistics and reporting | S3 Dashboards and S7 Test Results |
| Uploading JUnit files | S8 Automated Tests |

---

## 2. Screen position

| Item | Content |
|---|---|
| Previous | S4 Test Cases, S3 Dashboards, S1 Projects list |
| Next | S6 Test Execution (`/projects/{projectId}/executions`) or plan detail page |
| Entry condition | Login + project selection |
| Always accessible | Via the `[Test Plans]` tab in the header, or by selecting from the sidebar menu |

---

## 3. Workflow process flow

### 3.1 List view

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Enter `/projects/{projectId}/testplans` | Retrieve all plans for the project. Display loading indicator during retrieval | — |
| 2 | 0 plans exist | Show empty state guidance + `[+ New Plan]` button | — |
| 3 | N plans exist | Display as table or card grid with pagination | — |
| 4 | Click card or row | Tab layout: show plan detail popup. Sidebar layout: show detail area on the right | Display plan name, description, case count |

Plans are sorted by creation date (`createdAt`) from oldest to newest.

### 3.2 Creation

| # | Action | Behavior |
|---|---|---|
| 1 | `[+ New Plan]` | Creation form dialog (tab layout) or right area (sidebar layout) |
| 2 | Enter name, description, select cases | Multi-select tree — folders can also be selected (includes all cases within the folder) |
| 3 | `[Save]` | `POST /api/test-plans` |
| 4 | Success | Update list. New plan appears in the list |
| 5 | Failure | Red notification inside the dialog. Input values are retained |

**⚠ Needs verification** — Confirm via test whether selecting a folder includes the folder itself or only all cases within the folder.

### 3.3 Editing

| # | Action | Behavior |
|---|---|---|
| 1 | Click `✎ Edit` menu on plan card or row, or `[Edit]` in detail | Open the creation form in edit mode |
| 2 | Modify name, description, or included cases | Replace with newly selected cases |
| 3 | `[Save]` | `PUT /api/test-plans/{id}` |
| 4 | Success | Update list. Plan information is reflected |

**⚠ Needs verification** — When removing or adding included cases, the case list for the plan may differ from cases already created as executions. Verify which cases appear in the execution detail in this scenario (see S6 documentation).

### 3.4 Create execution from plan

| # | Action | Behavior |
|---|---|---|
| 1 | Click `[Start Execution]` in plan detail | Navigate to execution creation form |
| 2 | Execution creation form | Plan selection field is already filled with "this plan" |
| 3 | Case list | Only cases included in this plan are displayed |
| 4 | Save execution | Save the plan's case set with `TestExecution.testPlanId = {planId}` |

After creating an execution, the execution references the plan, so modifying the plan later preserves the cases of the existing execution.

### 3.5 Plan tree in 2-pane layout

In the sidebar layout (see `LEFT_NAV_RESTRUCTURE.md`), the plan list appears as a tree with plans as the parent nodes.

| Structure | Behavior |
|---|---|
| **Plan (parent)** | Click the branch icon `▶` or left-click to expand |
| **Execution (child)** | Executions created from this plan appear below it in recency order |
| **Select execution row** | Click an execution → the detail area on the right changes to show that execution's content |
| **Return to plan** | Click the `← Back to Plan` button in the execution detail header → the right area returns to plan content |

---

## 4. Plan model rules

| # | Rule | Content |
|---|---|---|
| T1 | **Plans do not create case snapshots** | When adding cases to a plan, the case version at that moment is not fixed. If case content changes later, it is reflected in the plan |
| T2 | **Executions inherit the case list at the time of creation** | When creating an execution from a plan, the plan's case list is copied and stored in `TestExecution.testCaseIds`. After that, the execution's cases remain unchanged even if the plan changes |
| T3 | **Executions without a plan are possible** | Since `TestExecution.testPlanId` is nullable, cases can be selected and executed without a plan |
| T4 | **Deleting a plan does not affect existing executions** | Even if you delete a plan, the executions created from it continue to exist. Only the execution's `testPlanId` becomes empty |
| T5 | **Deleting a case is reflected in the plan** | If a case is deleted, it is automatically removed from the list of plans that included that case |

---

## 5. Users and permissions

### 5.1 Features × roles

| Feature | System ADMIN | PM LEAD | DEVELOPER CONTRIBUTOR | TESTER | VIEWER |
|---|---|---|---|---|---|
| View plan list | ○ | ○ | ○ | ○ | ○ |
| View plan detail | ○ | ○ | ○ | ○ | ○ |
| **Create plan** | ○ | ○ | ○ | **—** | — |
| **Edit plan** | ○ | ○ | ○ | — | — |
| **Delete plan** | ○ | ○ | ○ | — | — |
| **Create execution from plan** | ○ | ○ | ○ | ○ | — |

**TESTER cannot create or edit plans.** The TESTER's role is to create executions from existing plans and record results.

### 5.2 Element exposure by permission

| Element | Exposure condition |
|---|---|
| `[+ New Plan]` | Edit permission (PM, LEAD, DEVELOPER, CONTRIBUTOR) |
| `✎ Edit` menu on plan card | Edit permission |
| `⋮` delete menu | Edit permission |
| `[Start Execution]` / `[Create Execution]` | Result entry permission (above 4 roles + TESTER) |
| Automation connect button | Edit permission (current) |

---

## 6. Feature rules

| # | Rule |
|---|---|
| F1 | **Table is sorted by creation date, oldest first** |
| F2 | **Pagination shows 10 items per page** |
| F3 | **Case selection is multi-select tree format.** Folders can also be selected |
| F4 | **Case selection is temporary until saving.** Clicking save transmits to the server |
| F5 | **Number of included cases is displayed on cards and rows** |
| F6 | **Automation result connection dialog is a separate component** |
| F7 | **In the sidebar tree, folders are not displayed as plans.** Plans are leaf nodes only |
| F8 | **Is there a list search (filter)?** Needs verification |

---

## 7. Integration with other screens

| Target | Integration content | Direction |
|---|---|---|
| **S4 Test Cases** | When creating a plan, the case list is fetched from S4. If a case in S4 is deleted, it is reflected in the plan list | Bidirectional |
| **S6 Test Execution** | Select a plan → `Create Execution` → navigate to execution creation page. When creating an execution, copy that plan's case list and save it to the execution | S5 → S6 |
| **S8 Automated Tests** | Intermediate step when matching JUnit results to plans. Automation result connection dialog | S5 ← S8 |
| **S3 Dashboards** | Does the statistics filter include a "by plan" option? | ⚠ Needs verification |

---

## 8. Prerequisites and constraints

### 8.1 Two layout variants

The S5 screen is rendered in **two different layouts** depending on project settings (see `LEFT_NAV_RESTRUCTURE.md`).

| Layout | Screen composition | User experience | Documentation target |
|---|---|---|---|
| **Tab layout** (default) | Tab selection → full screen page switch. Plan card → popup or separate page | Page-centered navigation | S5 → S6 is a route transition |
| **Sidebar layout** (new, `LEFT_NAV_RESTRUCTURE.md`) | Left: plan/execution tree. Right: detail area changes. No popups | 2-pane workspace preserves context | Specification |

**The basic functionality is the same in both layouts, but the UX differs.** In the tab layout, you move to a popup or full page; in the sidebar layout, the detail area on the right changes while the left list remains.

### 8.2 Screen exposure conditions

| Item | Condition | Determination location |
|---|---|---|
| S5 Test Plans tab itself | Always exposed | |
| Automation connection dialog | When integration with S8 is possible | ⚠ Needs verification |

---

## 9. Requirement ↔ section mapping

Correspondence between functional requirements (S5-01~) in section 1 of `EN-S5-Requirements.md` and sections of this document.

| Requirement | Location in document | Status |
|---|---|---|
| S5-01 Plan list view | 3.1 section | Working |
| S5-02 Plan creation | 3.2 section | Working |
| S5-03 Plan editing | 3.3 section | Working |
| S5-04 Plan deletion | 3.3 section | Working |
| S5-05 Create execution from plan | 3.4 section | Working |
| S5-06 Automation result connection | section 1 ⑥ | Working |
| S5-07 Permission validation | section 5 | Working |
| S5-N1 Sidebar 2-pane layout | 8.1 section | Environment-dependent |

---
