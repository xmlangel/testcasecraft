# Exploratory Sessions(S10) Workflow

> Screen ID **S10** · Screen name **Charter · Session · Notes · Report · Approval**
> Route: `/projects/{projectId}/exploratory`
> Exposure: Screen appears only when the environment variable `SHOW_EXPLORATORY_SESSION_TAB` is enabled

---

## 1. Workflow Purpose

Exploratory sessions operate **SBTM(Session-Based Test Management)**, a technique for exploring and testing a product without predefined specifications. Sessions begin with a charter (objective), proceed for a fixed duration, record notes/findings/interruptions, and conclude with a report. This supplements areas that automation and case-based testing cannot fully cover.

| Purpose | Content |
|---|---|
| ① **Charter definition** | Record test objectives, scope, ideas, and strategy in markdown |
| ② **Session execution** | Conduct a session with a timer from start to end. Record notes, bugs, and interruptions during execution |
| ③ **Session recording** | Save session title, tester, time allocation (%), environment, and version |
| ④ **Report and approval** | Write post-session evaluation and QA summary, then obtain approval |
| ⑤ **Session → case promotion** | Session findings can be registered as formal test cases |

**What this screen does not do**

| Task | Owner |
|---|---|
| Recording test results (PASS/FAIL) | S6 Test Execution |
| Case asset management | S4 Test Cases |
| Absorbing automation results | S8 Automated Tests |
| Charter template management | Provided only at input |

---

## 2. Screen Location

| Item | Content | Reference |
|---|---|---|
| Previous | S3 Project Dashboard or S4 Test Cases | Left navigation menu |
| Next | **Continue exploring or switch to S4** | Session findings can be registered as cases |
| Entry condition | Click the `Exploratory Sessions` tab on the left after entering a project | **Only enabled by environment variable** |
| Environment variable | Appears only when `SHOW_EXPLORATORY_SESSION_TAB=true` | |

**If the environment variable is not set, the tab does not appear at all.** The left tab item itself is hidden. The RAG feature follows the same pattern (RAG availability), but exploratory sessions require more explicit environment configuration.

---

## 3. Workflow Process Flow

### 3.1 Charter Viewing and Creation

| # | User action | Screen behavior |
|---|---|---|
| 1 | Enter `/projects/{projectId}/exploratory?tab=charters` | Load the charter list |
| 2 | 0 charters | Empty state guidance + `[Create new charter]` button |
| 3 | Click `[Create new charter]` | Open markdown editor. Default template is inserted |
| 4 | Enter objective, scope, ideas, strategy | Auto-save or explicit save |
| 5 | Click `[Save]` | Charter is saved. New session creation becomes possible |

### 3.2 Session Creation and Execution

| # | Action | Screen behavior |
|---|---|---|
| 1 | Charter detail → click `[Start session]` | Session editor tab opens. Session is created |
| 2 | Enter tester, reader, time allocation (%) | Session initial values are saved |
| 3 | Click `[Start session]` | Timer starts. Can record notes, bugs, interruptions |
| 4 | During execution, enter notes/bugs | Items are added immediately |
| 5 | Click `[Record interruption]` | Interruption details and time are saved |
| 6 | Click `[End session]` | Session ends. Timer stops |

### 3.3 Report and Approval

| # | Action | Screen behavior |
|---|---|---|
| 1 | After session ends, click `[Post-session evaluation]` tab | Post-session evaluation form is displayed |
| 2 | Enter evaluation | Evaluation items are saved |
| 3 | Click `[Submit]` | Session becomes submitted. Approval team is notified |
| 4 | Approver review | Only PM and LEAD can see `[Approve]` or `[Reject]` buttons |
| 5 | Approval complete | Session is approved. Findings can be promoted to cases |

---

## 4. Exploratory Session Model Rules

| # | Rule | Content |
|---|---|---|
| E1 | **Charter is markdown** | Record and edit objectives, scope, ideas, strategy in markdown |
| E2 | **Sessions are time-constrained** | Typically 60–120 minutes. Execution duration must be specified |
| E3 | **Allocate session time by activity** | Three items — test execution (%), bug investigation (%), management (%) — sum to exactly 100% |
| E4 | **Session is a state machine** | Follows state transitions: drafting → submitted → approved or needs revision |
| E5 | **Record session elements** | Notes (unstructured), bugs, interruptions, test execution flow are recorded |
| E6 | **Findings can be promoted to cases** | Session bugs can be registered as formal test cases |
| E7 | **Sessions are project-scoped** | Charters and sessions in the same project are grouped together |

---

## 5. Users and Permissions

### 5.1 Feature × Role

Exploratory sessions involve different stakeholders for charter creation, session execution, and report approval.

| Feature | ADMIN | PM LEAD | DEVELOPER CONTRIBUTOR TESTER | VIEWER |
|---|---|---|---|---|
| View charter list | ○ | ○ | ○ | ○ |
| Create/edit charter | ○ | ○ | **○** | — |
| Start/conduct/record session | ○ | ○ | **○** | — |
| Submit session result (SUBMITTED) | ○ | ○ | **○** | — |
| Approve session (APPROVED) | ○ | **○** | — | — |
| Promote session findings to cases | ○ | **○** | — | — |

**TESTER can also create charters and conduct sessions.** Unstructured testing stakeholders must lead sessions.

**Only PM and LEAD have approval authority.** DEVELOPER can only submit up to the submission stage.

### 5.2 Element Visibility by Permission

| Element | Condition | Reference |
|---|---|---|
| Charter tab | All users | |
| Session list tab | All users | |
| Session editor tab | Users with edit/result entry permission | `Result entry permission \| PM/LEAD` |
| Post-session evaluation tab | After session is created | When `sessionId` exists |
| `[Start session]` | Result entry permission | Result entry permission |
| `[Approve]` / `[Reject]` | PM LEAD only | Management permission |

---

## 6. Feature Rules

| # | Rule |
|---|---|
| F1 | **Default tab is charter** |
| F2 | **Session timer displays in seconds** |
| F3 | **Each status has a fixed color** |
| F4 | **Notes and bugs auto-save immediately upon entry** |
| F5 | **Charter template provides 7 sections** |
| F6 | **Time allocation (%) must sum to exactly 100% to save** |

---

## 7. Integration with Other Screens

### 7.1 Session Finding → S4 Case Promotion

Session bug findings can be registered as test cases.

S10 session bug list
 ↓ [Register as case]
S4 Test case tree adds new case
 ↓
S5 Can be included in plan
S6 Can be executed

### 7.2 Difference from S6 Test Execution

| Item | S6 Execution | S10 Exploration |
|---|---|---|
| Reference | Defined cases | Unspecified exploration |
| Result recording | PASS/FAIL/BLOCKED/NOTRUN | Notes, findings, interruptions |
| Time management | Planned vs. actual | Activity allocation (%) |
| Output | Result statistics | Unstructured report |

---

## 8. Preconditions and Constraints

### Constraints

| Constraint | Reason | Workaround |
|---|---|---|
| **Environment variable required** | Exploratory sessions are optional, must be enabled | Set `SHOW_EXPLORATORY_SESSION_TAB=true` in docker-compose.yml |
| **Time allocation is integer (%)** | Avoid decimal computation complexity | Input only in 1% increments |
| **Cannot edit charter after session creation** | Prevent charter changes during execution | Confirm charter before creating a new session |
| **File attachment size limit** | MinIO storage capacity | Adjust via `MINIO_` environment variables |

### Preconditions

- Sessions are time-constrained (typically within 90 minutes).
- Charter must be created before starting a session.
- Direct access to test environment must be available.

---

## 9. Requirement ↔ Section Mapping

Map core requirements (from requirements document) to sections in this document. Additional requirements are covered in `EN-S10-Requirements.md`.

| Requirement ID | Requirement | This document section | Note |
|---|---|---|---|
| ER-01 | Charter creation | Section 3.1 | Markdown editor |
| ER-02 | Session creation and start | Section 3.2 | Timer included |
| ER-03 | Record notes during execution | Section 3.2 | Real-time addition |
| ER-04 | Record bug findings during session | Section 3.2 | Separate item |
| ER-05 | Record interruption time | Section 3.2 | Interruption details saved |
| ER-06 | Session end and post-session evaluation | Section 3.3 | SUBMITTED status |
| ER-07 | Session approval workflow | Section 3.3 | PM/LEAD only |
| ER-08 | Promote findings to cases | Section 7.1 | S4 integration |
| ER-09 | Feature activation by environment variable | Sections 2, 8 | SHOW_EXPLORATORY_SESSION_TAB |
