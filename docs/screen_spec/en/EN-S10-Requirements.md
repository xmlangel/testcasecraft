# Exploratory Sessions(S10) Requirement Coverage

> Screen ID **S10** · Reference documents: [`EN-S10-Workflow.md`](EN-S10-Workflow.md) · [`EN-S10-Screen.md`](EN-S10-Screen.md) · [`EN-S10-Components.md`](EN-S10-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference convention: [`../README.md`](../README.md) section 4.

---

## 1. Functional Requirements

Core features of exploratory sessions listed by row. Status follows:

| Status | Meaning |
|---|---|
| Working | Requirement implemented and functioning on screen |
| **Partial** | Works only under certain conditions |
| **Hidden** | Code exists but feature is disabled on screen |
| **Environment-dependent** | Visibility depends on environment variable |

### S10-01: Charter Viewing and List

| Requirement ID | Description | Status |
|---|---|---|
| S10-01-001 | View all charters in project as list | Working |
| S10-01-002 | Display empty state guidance when 0 charters | Working |
| S10-01-003 | Charter card shows title, creation date, active session count | Working |
| S10-01-004 | Display charter status (`ACTIVE` `ARCHIVED`) as badge | Working |

### S10-02: Charter Creation and Editing

| Requirement ID | Description | Status |
|---|---|---|
| S10-02-001 | Open markdown editor with `[Create new charter]` button | Working |
| S10-02-002 | Charter template (7 sections) inserted by default | Working |
| S10-02-003 | Freely edit and save markdown | Working |
| S10-02-004 | Charter creation/edit requires edit permission | Working |
| S10-02-005 | Charter with existing sessions: can add new sessions only after edit | **Partial** |

### S10-03: Session Creation and Execution

| Requirement ID | Description | Status |
|---|---|---|
| S10-03-001 | Create session with `[Start session]` button from charter | Working |
| S10-03-002 | Enter initial session info (tester, reader, duration, time allocation %) | Working |
| S10-03-003 | Time allocation must sum to exactly 100% to save | Working |
| S10-03-004 | Timer starts on session start, displays in HH:MM:SS format | Working |
| S10-03-005 | Session timer can pause and resume | **Partial** |
| S10-03-006 | Session creation/execution requires result entry permission | Working |

### S10-04: Recording During Session

| Requirement ID | Description | Status |
|---|---|---|
| S10-04-001 | Enter and add notes (unstructured) during execution | Working |
| S10-04-002 | Record bug discovery with title, severity, description | Working |
| S10-04-003 | Record interruption details and duration | Working |
| S10-04-004 | Notes, bugs, interruptions auto-save immediately upon entry | **Partial** |
| S10-04-005 | Recorded items displayed in timeline by time order | Working |
| S10-04-006 | During session execution, can only add notes/bugs, not edit | **Partial** |

### S10-05: Session End and Post-session Evaluation

| Requirement ID | Description | Status |
|---|---|---|
| S10-05-001 | Stop timer with `[End session]` button | Working |
| S10-05-002 | Open post-session evaluation tab after session ends | Working |
| S10-05-003 | Enter evaluation, next charter, achievement (%) in debrief | Working |
| S10-05-004 | Submit session with `[Submit]` button | Working |
| S10-05-005 | Approvers notified after submission | **Environment-dependent** |

### S10-06: Session Approval Workflow

| Requirement ID | Description | Status |
|---|---|---|
| S10-06-001 | Only PM/LEAD can view and approve submitted sessions | Working |
| S10-06-002 | Approve session with `[Approve]` button | Working |
| S10-06-003 | Request revision with `[Reject]` button | **Partial** |
| S10-06-004 | Promote approved session findings to formal test cases | **Partial** |
| S10-06-005 | Session creator notified on approval decision | **Environment-dependent** |

### S10-07: Environment Variable Activation

| Requirement ID | Description | Status |
|---|---|---|
| S10-07-001 | Exploratory sessions tab appears only when enabled | Working |
| S10-07-002 | Cannot access exploratory sessions screen if not enabled | **Environment-dependent** |
| S10-07-003 | When disabled, other tab indices shift automatically | Working |

---

## 2. Non-functional Requirements

### Performance

| Requirement ID | Description | Status | Reference |
|---|---|---|---|
| S10-N1-001 | Charter list view: within 100ms | **Partial** | Varies by charter count |
| S10-N1-002 | Session timer: within ±1 second error | **Partial** | Affected by system load |
| S10-N1-003 | Note/bug add: immediate (within 1 second) auto-save | **Partial** | Delays if network slow |

### Security

| Requirement ID | Description | Status | Reference |
|---|---|---|---|
| S10-N2-001 | Reject unauthorized session edit/approval attempts | Working | Permission check rules |
| S10-N2-002 | Attachment file malware scan (optional) | **Hidden** | File upload feature not implemented |
| S10-N2-003 | Encrypt session data at rest | **Partial** | Database-level encryption is operational environment setting |

### Internationalization

| Requirement ID | Description | Status | Reference |
|---|---|---|---|
| S10-N3-001 | Support English UI | **Partial** | `useI18n` hook applied, but charter template is Korean-only |
| S10-N3-002 | Error messages are also multi-language | **Partial** | `parseApiError` calls `t`, but message catalog completeness unconfirmed |

### Accessibility

| Requirement ID | Description | Status | Reference |
|---|---|---|---|
| S10-N4-001 | Tab navigation possible with keyboard | **Partial** | MUI `Tabs` component defaults; actual verification needed |
| S10-N4-002 | Error messages readable by screen reader | **Partial** | Alert component `role` attribute configuration needed |

---

## 3. Correction Needed

Items with discrepancies between specification and actual implementation.

| # | Item | Specification | Current status | Verification method |
|---|---|---|---|---|
| 1 | Timer pause | Should exist | Unconfirmed | Check UI during session |
| 2 | Auto-save timing | Save on each entry | Unconfirmed | Monitor network tab |
| 3 | Session item editing | Add only | Unconfirmed | Click recorded item |
| 4 | Rejection feedback | Feedback input field | Unconfirmed | Check screen on reject |
| 5 | Case promotion | S4 integration | Unconfirmed | Click button, verify flow |

---

## 4. Items Requiring Verification

### ⚠ V-S10-001: Timer Pause/Resume UI

**Question:** Does the session timer pause function exist during execution?

**Verification method:**
1. Start a session and let timer run for 5+ seconds
2. Check if pause button exists on screen
3. Click it and verify timer stops

**Impact:** S10-03-005 Session execution timing control

---

### ⚠ V-S10-002: Auto-save Error Handling

**Question:** How is the user notified if a network error occurs after adding a note or bug?

**Verification method:**
1. Block requests in developer tools network tab
2. Add a note and check if failure notification appears
3. Confirm if retry option exists

**Impact:** S10-04-004 Auto-save reliability

---

### ⚠ V-S10-003: Charter Template Internationalization

**Question:** Is the charter template shown in English to English-speaking users?

**Verification method:**
1. Switch app language to English
2. Check charter template language on creation
3. If shown in Korean, internationalization is not supported

**Impact:** International user experience

---

### ⚠ V-S10-004: Case Promotion After Approval

**Question:** Can bugs be registered as test cases after session approval?

**Verification method:**
1. Progress session to approved status
2. Find `[Promote to case]` button
3. Click and verify if navigation to test case screen occurs

**Impact:** S10-06-004 Finding → case workflow

---

### ⚠ V-S10-005: Button Visibility by Permission

**Question:** When user lacks permission, is button grayed out or completely hidden?

**Verification method:**
1. Log in as VIEWER user
2. View session detail screen
3. If `[Edit]` button is missing = hidden, if grayed = disabled

**Impact:** Screen consistency

---

## 5. Backend Features Not Used on Screen

Backend features that exist but are not implemented on screen.

| Feature | Status | Note |
|---|---|---|
| Per-item test recording within session | **Unused** | S6 integration unspecified |
| Approval/rejection feedback text entry | **Not implemented** | No UI |
| Charter archiving (archived status) | **Partial** | Status exists, but menu unconfirmed |
| Timeline-only viewing | **Unused** | Integrated into session detail view |
| Report export (PDF/Excel) | **Not implemented** | No UI |

---

## 6. Maintenance Handoff

### Checklist for Next Maintainer

To keep this document current:

1. **If screen changes**, update `EN-S10-Screen.md` together.
2. **If API is added/modified**, update `EN-S10-Components.md` section 7 API contract.
3. **If requirement is added**, add row to section 1 here.
4. **If ⚠ verification item is resolved**, remove from section 4 and record history.
5. **If environment variables or permission rules change**, sync with `EN-S10-Workflow.md` permission section.

### Known Limitations

- **Environment variable not set**: Exploratory sessions tab inaccessible. Environment configuration must be checked
- **Timer precision**: Browser idle or lost focus can make timer inaccurate
- **Large sessions**: Many notes/bugs can slow screen load. Pagination should be considered
