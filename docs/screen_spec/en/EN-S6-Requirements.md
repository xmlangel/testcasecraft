# Test Execution(S6) Requirement Coverage

> Screen ID **S6** · Reference documents: [`EN-S6-Workflow.md`](EN-S6-Workflow.md) · [`EN-S6-Screen.md`](EN-S6-Screen.md) · [`EN-S6-Components.md`](EN-S6-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference rules per [`EN-Index.md`](EN-Index.md) section 4.

---

## 1. Functional Requirements

| ID | Requirement | Area | Status | Source basis | Verification method |
|---|---|---|---|---|---|
| **S6-01** | Search executions by title | Area 1 search input | Working | | Type title in list, confirm filter |
| **S6-02** | Auto-refresh execution list every 20 seconds | Area 2 card grid | Working | | Wait 20 seconds on active tab, observe status change |
| **S6-03** | Record result in 4 values (P/F/B/N) | Area 7.1 floating button | Working | | Result entry screen shows 4 buttons |
| **S6-04** | TESTER can record results | Area 5 permission | Working | Result recording permission | Login as TESTER, confirm P/F/B/N active |
| **S6-05** | Auto-save results approximately 1.5 seconds after modification | Area 7 all input | Working | Auto-save hook | Modify notes/tags, wait 1.5 seconds, check save log |
| **S6-06** | Changes persist until result saved | Area 7 all input | Working | Auto-save + local state | Confirm input preserved before page refresh |
| **S6-07** | Viewing alone does not create empty result record | Area 7 auto-save guard | Working | Auto-save — save on modification only | Open case then close, confirm no DB record created |
| **S6-08** | Enter case notes in markdown | Area 7.2 notes | Working | | Enter list and code block syntax, confirm rendering |
| **S6-09** | Add tags with auto-complete | Area 7.3 tags | Working | | Type existing tag, see dropdown suggestion |
| **S6-10** | Link JIRA issues to results | Area 7.4 JIRA | Working (conditional) | | Link issue when JIRA integration active |
| **S6-11** | Attach files to results | Area 7.5 result attachments | Working | | Drag and drop image/document, confirm upload |
| **S6-12** | View previous results of same case | Area 8 previous results | Working | | Click "[Previous round results]" button, toggle markdown/plain text |
| **S6-13** | View previous results in markdown and plain text | Area 8 toggle | Working | — | Dialog toggle between markdown ↔ plain text |
| **S6-14** | Filter by result status in filter panel | Area 3 filter | Working | | Check each PASS/FAIL/BLOCKED/NOTRUN |
| **S6-15** | Filter by priority in filter panel | Area 3 filter | Working | — | Select Critical/High/Medium/Low |
| **S6-16** | Filter by runner in filter panel | Area 3 filter | Working | — | Select from member list dropdown |
| **S6-17** | Filter by execution date in filter panel | Area 3 filter | Working | — | Enter date range |
| **S6-18** | Filter by JIRA link presence in filter panel | Area 3 filter | Working (conditional) | — | Visible only when JIRA integration active |
| **S6-19** | Filter by notes presence in filter panel | Area 3 filter | Working | — | Select has/none |
| **S6-20** | Filter by tags in filter panel | Area 3 filter | Working | — | Multi-select (AND condition) |
| **S6-21** | Create execution by selecting plan | Execution creation form | Working | | Select plan from dropdown then create |
| **S6-22** | Create execution without specifying plan | Execution creation form | Working | `TestExecution.testPlanId` nullable | Select "[No plan]" option then create |

---

## 2. Non-Functional Requirements

| ID | Requirement | Area | Status | Source basis | Verification method |
|---|---|---|---|---|---|
| **S6-N1** | Display list with pagination (5 per page) | Area 2 | Working | `EXECUTIONS_PER_PAGE = 5` | List shows 5, next page loads on scroll |
| **S6-N2** | Load pages with infinite scroll | Area 2 | Working | `IntersectionObserver` | Scroll down, auto-load next page |
| **S6-N3** | Preserve search term per project in sessionStorage | Area 1 | Working | `readSavedSearch` `writeSavedSearch` | Visit different screen then same project, confirm search term restored |
| **S6-N4** | Pause auto-refresh when tab inactive | Area 2 | Working | `document.visibilityState` | Switch tabs then return, confirm refresh resumes |
| **S6-N5** | Preserve filters in browser storage | Area 3 | Working | Browser storage persist | Set filters, refresh page, confirm filters restored |
| **S6-N6** | Display total count and current range | Area 4 table header | Working | Display "12/20" format | Confirm progress display in execution detail |
| **S6-N7** | Enable/disable buttons by permission | All areas | Working | `canEditExecutions` result recording permission | Login with different roles, confirm button state |
| **S6-N8** | Pause polling in offline state | Area 2 | Partial | — | ⚠ Network state detection logic not confirmed |
| **S6-N9** | API response time not over 1 second | All areas | Partial | Backend query optimization needed | Measure response time for list/detail retrieval |

---

## 3. Correction Targets

| Item | Status | Handling |
|---|---|---|
| File attachment size limit | Screen notification and server limit may differ | Server limit value received by screen, used as is in notification |
| Previous results API | Endpoint name unconfirmed | `GET /api/test-results-v2/{testCaseId}/history` (expected) |
| Offline detection | Currently not implemented | `navigator.onLine` + `online`/`offline` event subscription |

---

## 4. Items Needing Verification

| Item | Location | Verification method |
|---|---|---|
| **V-S6-01** | Max file attachments | Check backend settings |
| **V-S6-02** | File format whitelist | Check backend MIME type settings |
| **V-S6-03** | Search case sensitivity | Confirm whether title search ignores case |
| **V-S6-04** | Filter AND/OR combination | Clarify whether multiple filters are AND or OR |
| **V-S6-05** | Previous results count limit | Confirm how many rounds of past results shown for same case |
| **V-S6-06** | Result state transition rules | Confirm if BLOCKED → PASS changeable, whether history tracked |

---

## 5. Backend Functions Not in Screen

| Function | Endpoint | Status | Note |
|---|---|---|---|
| **Auto status change** | DRAFT → IN_PROGRESS (on first result entry) | Partial implementation | Manual status change also needed |
| **Auto status completion** | IN_PROGRESS → COMPLETED (when all cases done) | ⚠ Needs verification | Clarify whether auto or manual |
| **Result history tracking** | Previous value preserved on result modification | ⚠ Needs verification | Currently shows latest value only |
| **Bulk result entry** | CSV upload to enter many results at once | Not implemented | Roadmap item (not prioritized) |

---

## 6. Maintenance Handover

### 6.1 Core settings

| Setting | Value | File line | Change caution |
|---|---|---|---|
| Polling interval | 20 seconds (20000ms) | | Requires deployment to change (not runtime setting) |
| Auto-save debounce | 1.5 seconds (1500ms) | Default | Too short increases continuous save, too long decreases responsiveness |
| Page size | 5 | `EXECUTIONS_PER_PAGE = 5` | Adjust considering list query performance and UI space |
| Auto-save guard | Save only on modification | Auto-save + `isDirty` flag | **Never remove** — causes empty record bloat regression |

### 6.2 Synchronization when permission changes

If permission logic changes, update these 3 locations together:

1. **Frontend**: Edit permission and result recording permission
2. **Backend**: Judge both permissions together on server
3. **Documentation**: Canonical permission definition in `EN-Overview.md` section 5

### 6.3 Test coverage

| Test | Target | Status |
|---|---|---|
| Search filter | Title matching | ✓ Unit test needed |
| Auto-refresh | 20-second polling + tab visibility | ✓ E2E test needed |
| Auto-save | 1.5-second debounce + guard | ✓ Unit test needed |
| Result recording permission | TESTER permission check | ✓ E2E pass test needed |
| Filter combination | AND condition validation | ✓ Unit and E2E needed |

---

## 7. Change History

| Date | Change | Impact | Reference |
|---|---|---|---|
| 2026-08-03 | Initial draft (4 screen spec documents completed simultaneously) | New | Baseline commit `73340e4f` v1.0.102 |

---

## 8. Requirement ↔ Source ↔ Screen Matrix

(Reserved for cross-reference matrix)

---

## Appendix: Data Model

### Test Execution (TestExecution)

```javascript
{
 id: string, // "exec-001"
 projectId: string,
 name: string, // "ShopFlow iOS v1.0"
 status: enum, // DRAFT | IN_PROGRESS | COMPLETED
 testPlanId?: string, // nullable
 createdBy: string, // creator user ID
 createdAt: timestamp,
 tags: string[], // execution-level tags (inherited by results)
 qaSummary?: string // QA summary (written in S7)
}
```

### Test Result (TestResult)

```javascript
{
 id: string,
 executionId: string,
 testCaseId: string,
 result: enum, // PASS | FAIL | BLOCKED | NOTRUN | SKIPPED
 notes: string, // markdown
 tags: string[], // result-specific tags
 jiraIssueKey?: string, // linked JIRA issue
 attachmentIds: string[], // attachment file ID list
 createdBy: string, // recorder
 createdAt: timestamp,
 updatedAt: timestamp // modification time
}
```
