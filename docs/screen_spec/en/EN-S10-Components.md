# Exploratory Sessions(S10) Components

> Screen ID **S10** · Parent document: [`EN-S10-Screen.md`](EN-S10-Screen.md)

---

## 1. Component List

The exploratory sessions screen consists of 5 major areas, each managing data independently.

| # | Area | Role | Included elements |
|---|---|---|---|
| **1** | Charter area | Define session objectives | Charter list, markdown editor |
| **2** | Sessions list area | View all sessions | Card grid, status badges |
| **3** | Session editor area | Conduct session | Basic subtab, recording subtab |
| **4** | Post-session evaluation area | Summarize results | Evaluation form, achievement input |
| **5** | Session detail area | View session record | Timeline, notes, bugs, attachments |

---

## 2. State Configuration

### Exploratory Session States

Possible states for a session.

| State | Screen label | Background | Possible actions |
|---|---|---|---|
| **DRAFT** | Drafting | Light blue | Enter information, start session |
| **RUNNING** | Running | Lime | Record notes, bugs, interruptions |
| **COMPLETED** | Completed | Gray | Write post-session evaluation |
| **SUBMITTED** | Submitted | Yellow | Await approval (read-only) |
| **APPROVED** | Approved | Green | Promote to case, view only |
| **NEEDS_UPDATE** | Needs revision | Red | Edit evaluation, resubmit |

### Visibility by Permission

Screen elements change based on user permission.

| Permission | Create charter | Conduct session | Approve | Hidden elements |
|---|---|---|---|---|
| ADMIN | ○ | ○ | ○ | None |
| PM / LEAD | ○ | ○ | ○ | None |
| DEVELOPER / TESTER | ○ | ○ | — | `[Approve]`, `[Reject]` buttons |
| CONTRIBUTOR | ○ | ○ | — | `[Approve]`, `[Reject]` buttons |
| VIEWER | — | — | — | All edit buttons |

---

## 3. Interaction and Timing

### Charter Area Interaction

| Action | Screen reaction | Save timing |
|---|---|---|
| Click `[Create new charter]` | Markdown editor opens | Upon template load |
| Markdown entry | Text appears | Explicit save or auto-save |
| Click `[Save]` | Charter saved, editor closes | Immediately |
| Select charter menu | Edit/archive/delete options shown | Upon option selection |

### Session Editor Interaction

| Action | Screen reaction | Save timing |
|---|---|---|
| Select charter | Charter is selected | Upon next field or explicit save |
| Enter basic information | Values appear | Upon save button or auto-save |
| Enter time allocation | Total displayed | Real-time |
| Click `[Start session]` | Timer starts, recording subtab active | Immediately |
| Enter note + click `[Add]` | Note added to list | Immediately (auto-save) |
| Enter bug + click `[Add]` | Bug added to list | Immediately (auto-save) |
| Enter interruption + click `[Record]` | Interruption recorded | Immediately (auto-save) |
| Click `[End session]` | Timer stops, status changes | Immediately |

### Timer Operation

| State | Display | Behavior |
|---|---|---|
| Running | HH:MM:SS increments | Increments every 1 second |
| Paused | HH:MM:SS fixed | Time does not increment |
| Stopped | HH:MM:SS fixed | View only |

---

## 4. State Transitions and Conditional Visibility

### Session State Transition Diagram

[DRAFT]
 ↓ start session
[RUNNING]
 ↓ end session
[COMPLETED]
 ↓ submit
[SUBMITTED]
 ├─ approve → [APPROVED]
 └─ reject → [NEEDS_UPDATE]
 ↓ revise and resubmit
 [SUBMITTED]

### Tab Visibility Conditions

| Tab | Visibility condition |
|---|---|
| **Charter** | Always visible |
| **Sessions list** | Always visible |
| **Session editor** | When charter is selected |
| **Post-session evaluation** | When session is completed (COMPLETED) |
| **Session detail** | When session is selected |

### Button Visibility Conditions

| Button | Visibility condition |
|---|---|
| `[Create new charter]` | Always |
| `[Start session]` | When charter is selected |
| `[End session]` | When timer is running |
| `[Submit]` | When session is completed (COMPLETED) |
| `[Approve]` / `[Reject]` | When session is submitted (SUBMITTED) AND user is PM/LEAD |
| `[Promote to case]` | When session is approved (APPROVED) |

---

## 5. Storage Configuration

Auto-save and explicit save are mixed.

| Item | Save method | Save location | Verification method |
|---|---|---|---|
| Charter | Explicit `[Save]` | Server DB | Charter list refreshes |
| Session basic information | Save button or auto-save | Server DB | View session detail |
| Notes | Auto (after entry) | Server DB | List updates immediately |
| Bugs | Auto (after entry) | Server DB | List updates immediately |
| Interruptions | Auto (after entry) | Server DB | List updates immediately |
| Evaluation | Explicit `[Submit]` | Server DB | Status changes (SUBMITTED) |
| Approval | Explicit `[Approve]`/`[Reject]` | Server DB | Status changes (APPROVED/NEEDS_UPDATE) |

---

## 6. Responsive and Accessibility

### Responsive Behavior

| Device | Width | Behavior |
|---|---|---|
| **Desktop** | 1024px and up | All 5 tabs shown, card grid 4 columns |
| **Tablet** | 768–1023px | Tabs scrollable, card grid 2–3 columns |
| **Mobile** | 767px and below | Tab menu available, cards 1 column stack |

### Keyboard Navigation

| Key | Action |
|---|---|
| **Tab** | Move focus to next element |
| **Shift+Tab** | Move focus to previous element |
| **Enter** | Activate button or submit field |
| **Escape** | Close editor or modal |
| **←→** | Switch tabs (arrow keys) |

### Screen Reader Support

- Status badges must be read as text, not just color (e.g., "Drafting", "Running")
- Error messages announced via `role="alert"` attribute
- Table headers structured with `<th>` tag

---

## 7. Server Integration

### API Call Rules

| Action | Method | Path | Timing |
|---|---|---|---|
| View charter list | GET | `/api/charters?projectId=...` | Upon screen entry |
| Create charter | POST | `/api/charters` | Click `[Save]` |
| Edit charter | PATCH | `/api/charters/{charterId}` | Click `[Save]` |
| View session list | GET | `/api/sessions?projectId=...` | Upon screen entry |
| Create session | POST | `/api/sessions` | Click `[Start session]` |
| Edit session | PATCH | `/api/sessions/{sessionId}` | Note/bug auto-save |
| Submit session | POST | `/api/sessions/{sessionId}/submit` | Click `[Submit]` |
| Approve session | POST | `/api/sessions/{sessionId}/approve` | Click `[Approve]` |
| Reject session | POST | `/api/sessions/{sessionId}/reject` | Click `[Reject]` |

### Error Handling

If network error occurs, screen shows:

| Situation | Display |
|---|---|
| Charter list load fails | "Cannot load charters. Please try again" |
| Note save fails | "Failed to save note" (with retry option) |
| Session submit fails | "Failed to submit session. Check network" |

---

## 8. Maintenance Notes

### Known Limitations

1. **Environment variable dependency.** If `SHOW_EXPLORATORY_SESSION_TAB=true` is not set, tabs do not appear. Environment configuration must be verified.

2. **Timer precision.** If browser is idle or loses focus, timer may become inaccurate. Technical limitation.

3. **Large sessions.** If session has hundreds of notes/bugs, screen load may slow. Pagination should be considered.

4. **Charter editing.** After session creation, editing the charter does not affect existing sessions. Design constraint.

### Improvement Candidates

- Timer error correction: Validate against server time
- Auto-save failure: Strengthen retry logic
- English template: Provide charter template in multiple languages
- Pagination: Convert notes/bug list to scroll-load
