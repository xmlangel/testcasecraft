# Test Plans(S5) Requirement Coverage

> Screen ID **S5** · Reference documents: [`EN-S5-Workflow.md`](EN-S5-Workflow.md) · [`EN-S5-Screen.md`](EN-S5-Screen.md) · [`EN-S5-Components.md`](EN-S5-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference specification: [`EN-Index.md`](EN-Index.md) section 4.

---

## 1. Functional requirements (S5-01~)

| Requirement ID | Requirement name | Functional description | Screen area | Status |
|---|---|---|---|---|
| **S5-01** | Plan list view | Retrieve all plans in the project as list and cards | S5 Screen 1.1 Area A | ✅ Working |
| **S5-02** | Plan creation | Create a new plan by entering name, description, and selecting included cases | S5 Screen 3.3 / 2.2 | ✅ Working |
| **S5-03** | Plan editing | Change plan name, description, or included cases | S5 Screen 3.4 | ✅ Working |
| **S5-04** | Plan deletion | Delete a plan (with confirmation dialog) | S5 Screen 3.3 | ✅ Working |
| **S5-05** | Create execution from plan | Select a plan → navigate to execution creation form (cases auto-filled) | S5 Workflow 3.4 | ✅ Working |
| **S5-06** | Connect automation results | Match uploaded JUnit results to the plan | S5 Workflow 1 ⑥ | ✅ Working |
| **S5-07** | Plan execution list | 2-pane layout shows executions under the plan | S5 Screen 1.2 / S5 Workflow 3.5 | ✅ Working |
| **S5-08** | Multi-case selection | Multiple cases can be selected during plan creation | S5 Screen 2.2 and 2.3 | ✅ Working |
| **S5-09** | Folder-level selection | Selecting a folder in the case selection tree includes all cases in the folder | S5 Screen 2.2 | ⚠ Needs verification (V-S5-01) |
| **S5-10** | Pagination | List is split into pages when exceeding 10 items | S5 Screen 1.1 | ✅ Working |

---

## 2. Non-functional requirements (S5-N~)

| Requirement ID | Requirement name | Description | Status |
|---|---|---|---|
| **S5-N1** | Sidebar 2-pane layout | Dynamically switch between tab layout and sidebar layout based on project settings | Environment-dependent |
| **S5-N2** | Permission validation | PM, LEAD, DEVELOPER: create, edit, delete. TESTER: read-only. VIEWER: list view only | ✅ Working |
| **S5-N3** | Real-time auto-refresh | When other team members modify plans, are changes reflected periodically on the current screen? | ⚠ Needs verification (V-S5-02) |
| **S5-N4** | Performance: case count calculation | Load time for lists with large plans (1000+ cases) | ⚠ Needs verification (V-S5-03) |
| **S5-N5** | Internationalization | All screen text supports multiple languages | ✅ Working |
| **S5-N6** | Accessibility | Keyboard navigation and screen reader support | Under verification |

---

## 3. Correction targets

| ID | Issue | Correction | Reference |
|---|---|---|---|
| COR-S5-01 | Plan deletion and execution status | After deleting a plan, verify whether existing executions appear as "plan unassigned" in the execution list | S5 Workflow T4 rule |
| COR-S5-02 | Automation connect permission | Clarify whether the permission to connect automation results to a plan is PM/LEAD only or also includes TESTER | S5 Workflow 6 / S5 Screen 5 |

---

## 4. Items needing verification (V-S5-n)

| ID | Verification item | Verification method | Owner | Status |
|---|---|---|---|---|
| **V-S5-01** | Folder-level selection behavior | When checking a folder in the case selection tree, verify that **all cases** in the folder are actually selected (including nested folders) | Developer verification | ⏳ Pending |
| **V-S5-02** | Real-time refresh | When another user creates/edits a plan, does the current screen's list automatically update? What is the interval? | Manual test (2 users logged in) | ⏳ Pending |
| **V-S5-03** | Large plan performance | When a plan contains 500+ cases, is the load time for list and creation form within 3 seconds? | Performance test tool | ⏳ Pending |
| **V-S5-04** | Automation count API | When there are 100+ plans, do parallel requests for automation result counts complete normally without timeout? | Load test | ⏳ Pending |
| **V-S5-05** | Edit plan after creation | When editing a plan to add/remove cases, are the cases of existing executions preserved? | Integration test (with S6) | ⏳ Pending |
| **V-S5-06** | Sidebar filter | In the sidebar, does the search filter match both plan names and execution names simultaneously? | Functional test | ⏳ Pending |
| **V-S5-07** | Accessibility: accordion state | Is the tree expand/collapse state saved in browser storage and restored when opening again? | Functional test | ⏳ Pending |

---

## 5. Backend features not exposed in screen

The following API endpoints are defined in the TestcaseCraft codebase but are not exposed in the S5 screen.

| API | Purpose | Exposed screen | Notes |
|---|---|---|---|
| `GET /api/test-plans/{planId}` | Plan detail retrieval | Not exposed (all information already in list) | Not needed for S5 |
| `GET /api/test-plans?search=` | Plan search | Not exposed (front-end memory filter) | Sidebar's filterText |
| `POST /api/test-plans/{planId}/duplicate` | Plan duplication | Not exposed | No menu item |
| `PATCH /api/test-plans/{planId}/archive` | Plan archival | Not exposed | Soft delete not implemented |

---

## 6. Maintenance handover

### 6.1 Known constraints

| Constraint | Impact | Resolution approach |
|---|---|---|
| No cascade deletion when deleting plan | Orphan executions may occur | Consider archive (soft delete) or strengthen DB constraints |
| No case snapshot saved when included | Difference between plan edits and past execution cases | Version management or documentation required |
| Automation connect only via UI dialog | Batch automation not possible | Consider batch API endpoint |

### 6.2 Future feature suggestions

| Feature | Priority | Reference |
|---|---|---|
| Plan version tracking | Medium | Record who changed what and when |
| Plan template saving | Low | Quick reuse of similar plans |
| Plan-by-plan statistics dashboard | Medium | Complement S3 Dashboards |
| Plan sharing/import | Low | Reuse plans across organizations |

### 6.3 Cross-document synchronization checklist

When editing S5 documents, verify the following:

- [ ] Route change → sync with `EN-Index.md` section 6.2
- [ ] Permission change → sync with `EN-Index.md` section 5
- [ ] Area add/remove → sync with README.md screen list and S2 documents
- [ ] Screen element add → modify EN-S5-Screen and EN-S5-Components simultaneously
- [ ] Manual change → sync with `../../manual/new/USER_MANUAL.md` section 7

---

## 7. Version history

| Version | Release date | Change | Impact |
|---|---|---|---|
| v1.0.102 | 2026-08-03 | Current version | — |
| v1.0.101 | 2026-07-31 | Add sidebar 2-pane layout (`LEFT_NAV_RESTRUCTURE.md`) | Medium |
| v1.0.80 | 2026-06-05 | Parallelize automation result count | Low |

---
