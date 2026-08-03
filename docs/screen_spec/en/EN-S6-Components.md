# Test Execution(S6) Components

> Screen ID **S6** · Parent: [`EN-S6-Screen.md`](EN-S6-Screen.md)

---

## 1. Component List

| Screen area | Element | Type | Role |
|---|---|---|---|
| **List screen** | Title search input | Text field | Filter execution list by name |
| | Card grid | Card | Display each execution's status, progress, menu as card |
| | ⋮ menu (card) | Button | Edit execution (when permission available) |
| | Infinite scroll | UI pattern | Auto-load next page at list end |
| **Detail screen** | Header | Info display | Show execution name, status, progress |
| | Filter panel (left) | Filter set | Filter by result, priority, runner, date, JIRA, notes, tags |
| | Case table (right) | Table | Filtered case list, click enters result entry |
| **Result entry screen** | Case title, description | Read-only | Display case information |
| | Case steps | Read-only | Show case execution steps |
| | Case attachments | Link | Test case attachments (download link only) |
| | P/F/B/N buttons (floating) | 4 buttons | Record result status (floating → bottom-right of screen) |
| | Notes input | Markdown editor | Input execution result notes |
| | Tags input | Input field + auto-complete | Add related tags |
| | JIRA issue link | Search/link field | Specify associated JIRA issue |
| | Result attachment | File upload | Upload execution result screenshots, logs |
| | Previous results | Modal, read-only | Compare and display past 5 results of same case |
| **Execution creation dialog** | Execution name | Text field | Input execution name |
| | Plan selection | Dropdown | Select plan (optional choice, not required) |
| | Save button | Button | Create new execution |

---

## 2. Display Specifications

### 2.1 Execution status display

| Status | Chip color | Description |
|---|---|---|
| **DRAFT** | Gray | Before start |
| **IN_PROGRESS** | Blue | Ongoing |
| **COMPLETED** | Green | Complete |

Progress bar: Completed cases / total cases (%)

### 2.2 Result status display

| Status | Icon | Color | Description |
|---|---|---|---|
| **PASS** | ✓ | Green | Passed |
| **FAIL** | ✗ | Red | Failed |
| **BLOCKED** | ⚠ | Orange | Blocked |
| **NOTRUN** | — | Gray | Not run |

### 2.3 Card composition (list screen)

Displayed on execution card:
- Execution name
- Status chip
- Progress bar
- Creation date, creator
- ⋮ menu (when edit permission available)

### 2.4 Filter panel items

Each filter shows current selection:
- Result: 4 checkboxes (PASS/FAIL/BLOCKED/NOTRUN)
- Priority: Dropdown (Critical/High/Medium/Low)
- Runner: Dropdown (multi-select users)
- Date: Date range picker
- JIRA: Checkbox (linked only)
- Notes: Checkbox (has notes)
- Tags: Multi-select

---

## 3. Interaction Specifications

### 3.1 List screen behavior

| User action | Result | Timing |
|---|---|---|
| Type in search field | Filter execution list | Approximately 0.5 seconds after input (debounce) |
| Click ⋮ menu on card | Show "Edit" option (when permission available) | Immediately |
| Select edit from card menu | Open execution edit dialog | Immediately |
| Reach bottom of list | Auto-load next page | Immediately |
| Close dialog after creating new execution | New execution added to top of list, existing list preserved | Immediately |

Auto-refresh: List auto-refreshes every **approximately 20 seconds** in background while open. Pauses when browser tab is inactive (hidden).

### 3.2 Detail screen behavior

| User action | Result | Timing |
|---|---|---|
| Change filter item (checkbox, dropdown, date) | Table immediately filtered | Immediately |
| Click table row (case) | Enter result entry screen | Immediately |
| Apply multiple filters combined | Filter results reflect intersection with AND condition | Immediately |

### 3.3 Result entry screen behavior

| User action | Result | Timing |
|---|---|---|
| Click P/F/B/N button | Result status immediately reflected on screen | Immediately |
| Enter notes, tags, JIRA | Save locally (screen reflected) | Immediately |
| Stop entering in any field | Start auto-save | Approximately **1.5 seconds** after input stops |
| Add input while auto-save in progress | Auto-save timer restarts | Immediately |
| File upload complete | Add to file list | Approximately 1~3 seconds (varies by file size) |
| Close browser window or navigate away | Force save if auto-save pending | Immediately |

**Auto-save protection**: If field value unchanged, do not save → no duplicate records accumulate in DB

### 3.4 Previous results comparison

Click same case again, then click "Previous results" button → show modal with last 5 results (time reverse order)

---

## 4. State Transitions

| State | Condition | Screen display | User action possible |
|---|---|---|---|
| **Loading** | Initial entry, page refresh | Skeleton display | Not possible |
| **Empty** | 0 results | "No executions" message + "Create new execution" button | Create new execution only |
| **Normal** | 1+ results | List, detail displayed | All possible |
| **Error** | API response failure | "Retrieval failed. Retry" button displayed | Retry button only |
| **Filter applied** | Filter selected | Display results matching selected filter | Remove/adjust filter |
| **No permission** | VIEWER role | Edit buttons inactive, menu hidden | View only |

---

## 5. Where Settings Are Saved

| Item | Save location | Cross-device sync | Description |
|---|---|---|---|
| **Search term** | Browser storage | Not synced (same device only) | Restored on list screen re-entry |
| **Filter selection** | Browser storage | Not synced | Filter state restored on detail screen re-entry |
| **Execution, result data** | Server DB | Synced across all devices | Queryable by other users |
| **Notes, tags, JIRA** | Auto-save then server DB | Synced across all devices | Reflected within 1.5 seconds after save |
| **Card order, sort** | Not saved | — | Restored to default order on page refresh |

---

## 6. Responsive and Accessibility Specifications

### 6.1 Layout by screen size

| Device | Width | List | Detail | Result entry |
|---|---|---|---|---|
| **Mobile** | < 480px | 1-column card | 1-column filter + table | Vertical form |
| **Tablet** | 480~960px | 2-column card | 2-column (filter collapsed) | Vertical form |
| **Desktop** | ≥ 960px | 3-column card | Left filter + right table (wide) | 2-column (detail + form) |

### 6.2 Accessibility

- **Keyboard navigation**: All buttons and input fields accessible via Tab key
- **Signal beyond color**: Status display uses icons (✓·✗·⚠) alongside colors
- **Text contrast**: All label and button text meets WCAG AA standard
- **Form labels**: All input fields have clear label or placeholder
- **Error messages**: Errors clearly explained in text

---

## 7. Server Information Exchange

### 7.1 Execution list retrieval

**GET /api/test-executions** (auto-refresh every approximately 20 seconds)

Retrieval timing:
- List screen entry
- After new execution created, list refresh
- Polling timer triggers

### 7.2 Case list and result retrieval

**GET /api/executions/{executionId}** (when execution selected from list)

Retrieval timing: Detail screen entry

Included info: Case ID, title, description, priority, steps, existing result status (if any)

### 7.3 Result save

**POST /api/test-results-v2** (during auto-save)

Save timing: Approximately 1.5 seconds after field input stops

Save content: Result status, notes, tags, JIRA issue key, attachment IDs

### 7.4 Result attachment upload

**POST /api/attachments** (auto-upload after file selection)

Upload timing: Immediately after file selection

Supported formats: Images (jpg/png/gif), text files, screenshots

Size limit: Max 10MB per file, max 100MB per execution

### 7.5 Previous results retrieval

**GET /api/test-results-v2/{testCaseId}/history** (after clicking same case, selecting "Previous results")

Included info: Last 5 results (time reverse order)

---

## 8. Permission-based Screen Display

### 8.1 Execution list screen

| Role | Create execution | Edit execution | Record result |
|---|---|---|---|
| **PROJECT_MANAGER** | ✓ | ✓ | ✓ |
| **LEAD_DEVELOPER** | ✓ | ✓ | ✓ |
| **DEVELOPER** | ✓ | ✓ | ✓ |
| **CONTRIBUTOR** | ✓ | ✓ | ✓ |
| **TESTER** | — | — | ✓ |
| **VIEWER** | — | — | — |

### 8.2 Result entry screen

**When no result recording permission**: P/F/B/N buttons inactive + "View only" label displayed

**Notes, tags, JIRA fields**: Display read-only when no permission

---

## 9. Maintenance Cautions

### 9.1 Never remove auto-save guard

Result entry has protective logic: unchanged fields are not saved.

**If this logic is removed**: Opening same case multiple times → creates new result record each time → DB waste, log bloat

### 9.2 When changing 20-second polling interval

Execution list's auto-refresh interval is client-side setting (20 seconds).

**How to change**: Modify client code, then deploy. If runtime setting needed, extend to receive interval value from server API.

### 9.3 Result recording permission verification

Must match permission definition in `00_Overview.md` section 5.2.

**If permission logic changes**: Also update backend `ProjectSecurityService.result recording permission`

### 9.4 Result attachment size limit

Max 10MB per file, max 100MB per execution are backend settings.

**Before changing**: Confirm backend setting values, align with frontend validation

