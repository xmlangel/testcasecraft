# Dashboards (S3) Requirement Coverage

> Screen ID **S3** · Base documents: [`EN-S3-Workflow`](EN-S3-Workflow.md) · [`EN-S3-Screen`](EN-S3-Screen.md) · [`EN-S3-Components`](EN-S3-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference rules are in [`../README.md`](../README.md) section 4.

---

## 1. Functional Requirements

| Requirement ID | Description | Where Implemented | Status |
|---|---|---|---|
| **S3-01** | Display core project metrics on one screen | Screen section 2.2–2.8 (6 widgets) | Working |
| **S3-02** | Project summary area shows case count and member count | Screen section 2.3 (Area C) | Working |
| **S3-03** | Selecting test plan shows recent results for that plan only | Screen section 2.8 (Area H plan select) Workflow section 3.2 | Working |
| **S3-04** | Test result pie chart shows count by status (PASS/FAIL/BLOCKED/SKIPPED/NOTRUN) | Screen section 2.4 (Area D pie chart) | Working |
| **S3-05** | Test result trend for last 15 days shown as line chart | Screen section 2.5 (Area E line chart) | Working |
| **S3-06** | In-progress test execution state distribution shown as bar chart | Screen section 2.6 (Area F bar chart) | Working |
| **S3-07** | Each assignee case progress shown as stacked bar chart | Screen section 2.7 (Area G stacked bar) | Working |
| **S3-08** | Last update time shown as chip in header | Screen section 2.1 (header) Components section 1.1 | Working |
| **S3-09** | Can click `[Refresh]` chip to reload data | Screen section 2.1 Workflow section 3.1 (refresh) | Working |
| **S3-10** | Collapsible section expand state saved in browser storage and restored after refresh | Screen section 2.3 (Area C collapsible) Components section 3 | Working |

---

## 2. Non-Functional Requirements

| Requirement ID | Description | Where Implemented | Status |
|---|---|---|---|
| **S3-N1** | Enterprise dashboard (`/dashboard`) viewable by system `ADMIN` only | Workflow section 2.2 Screen section 1.2, 5 | Working |
| **S3-N2** | Progress indicator shown during dashboard loading; widgets hidden | Screen section 3.1 Workflow section 3.1 | Working |
| **S3-N3** | On API error, error message and retry button displayed | Screen section 2.2 (Area B error state) | Working |
| **S3-N4** | Blank screen before project selection or when no project | Screen section 3.5 Workflow section 2 | Working |
| **S3-N5** | No permission returns server 403 and shows message on screen | Screen section 3.4 Components section 5 | Working |

---

## 3. Correction Targets

Screen elements where requirements are unclear or design intent is ambiguous.

| Item | Current State | Question |
|---|---|---|
| **Period filter** | Hard-coded 15 days | Can user change the period range? |
| **Chart number display** | Pie (percent?) / bar (count) | Exactly which numbers per chart? |
| **Plan table click** | Interaction unspecified | Navigate to detail or filter only on same screen? |
| **Assignee data source** | API response | Data load timing clear? |

---

## 4. Needs Verification (⚠ List)

| Item | Current | Verification Action |
|---|---|---|
| **Period filter implementation** | Does code have period selection UI? | Check front-end implementation |
| **Chart test support** | Test ID assigned to each chart? | Can E2E test be run? |
| **Enterprise dashboard implementation** | Is it actually implemented? | Code review |
| **API response structure** | Is response really that structure? | Verify via actual API call |
| **State save consistency** | Is user state save consistent? | Check restore logic |
| **Error handling path** | How 403/401/500 displayed? | Review error display logic |

---

## 5. Backend Functions Not on Screen

Paths in backend but not called from front-end.

| Path | Purpose | Reason Not Used | Policy |
|---|---|---|---|
| `GET /api/dashboard/projects/{projectId}/test-results-summary` | Test result summary | Data queried via other endpoint | Review consolidation to single endpoint |
| (Other monitoring paths) | Performance monitoring | Not called from front-end | Backend internal use |

---

## 6. Handoff Checklist

Items the next maintainer of this screen must know.

### 6.1 Update Together

1. **Add dashboard widget** → Update Workflow section 3, Screen section 1-2, Components section 1
2. **API response structure change** → Update Components section 6 API contract
3. **Chart library change** → Update Components section 8 maintenance notes

### 6.2 Test Confirmation

- Does dashboard data reload correctly when switching projects?
- Does plan select filter not affect other charts?
- Browser storage state restore working correctly?
- 403 and 500 errors displaying appropriately on screen?

### 6.3 Performance Considerations

- Do chart rerenders happen unnecessarily when collapsing/expanding sections?
- Bar chart performance when large data (>1,000 assignees)?
- Browser storage read/write cost negligible?

### 6.4 Version Compatibility

- Chart library current version? Upgrade plans?
- UI library collapsible section settings changes?
- Framework Hook version compatibility?

---

## 7. Requirement Traceability Matrix

One-glance overview of where each requirement is satisfied.

| Requirement | Workflow | Screen | Components |
|---|---|---|---|
| S3-01 | Section 1 | Sections 1-2 | — |
| S3-02 | Section 4 | Section 2.3 | — |
| S3-03 | Section 3.2 | Section 2.8 | Section 3.3 |
| S3-04 | Section 4 | Section 2.4 | Section 1 |
| S3-N1 | Section 2.2 | Sections 1.2, 5 | — |

---

## 8. Notes

- This requirement list is based on **v1.0.102**. Update when widgets are added/removed in later versions.
- If any of the "Needs Verification" items do not reproduce in actual use, log as separate issue.
- Enterprise dashboard (S3-N1) requires auth test to verify `ADMIN` security actually works.
