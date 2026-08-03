# Projects(S1) Components

> Screen ID **S1** · Parent document: [`EN-S1-Screen.md`](EN-S1-Screen.md)

---

## 1. Component list

| Area | Component type | Role |
|---|---|---|
| A | Create button | Create new project. Display only when empty |
| B | Alert area | Server error display (red) |
| C | Tab group | "By organization" / "Independent" / "All" list select. Render only when tabs exist |
| D | Card list | Project name, code, description, members, automation metrics. Open button at bottom. Card height uniform |
| E | Empty state | "No projects" guidance + create button |
| F | More menu | Each card's ⋮ → edit / transfer / delete / force delete |
| G | Create/edit dialog | Name, code, organization select, description. Save/cancel buttons |
| H | Transfer dialog | Select target organization |
| I | Delete confirmation dialog | Warning text (force delete differs) + confirm/cancel |

---

## 2. Display specification

### 2.1 Card

**Layout**
- Width: Fixed width (major: 3 columns or 2 columns)
- Height: Uniform (flexGrow applied to body)
- Background: White card, thin border

**Content**
- Project name: Bold, 16px, no overflow
- Code: Chip form, language color (e.g., PYTHON blue)
- Description: 1-3 lines below title, omit row if no description
- Member expand: Click "N members" to expand, show only 5, 6+ show "+N"

**Bottom button**
- Open: Blue button, full width, click to move to workspace
- ⋮ (More): Gray icon button, upper-right

### 2.2 Automation statistics

**Display condition**
- Show statistics on card only when automation tests exist
- If none, omit space

**Format**
- Icon + "123 test results"
- Pass/fail/skip ratio (color coded)

### 2.3 Dialogs

**Create/edit dialog**
- Title: "Create project" or "Edit project"
- Fields: Name (required), code (required), organization select (dropdown), description (optional)
- Error alert: Red text below field
- Buttons: Save (blue), cancel (gray)

**Transfer dialog**
- Title: "Move organization"
- Select: Organization dropdown
- Buttons: Move, cancel

**Delete confirmation dialog**
- Title: "Delete project" or "Force delete project"
- Warning: "Deletion removes all data" (force delete has additional warning)
- Buttons: Confirm (red), cancel (gray)

### 2.4 Tabs

**Display**
- Render only "By organization", "Independent", "All" with content
- Do not create tab if no content
- Recalculate tab index based on conditional tabs

**By organization**
- Group projects by organization
- Display organization name as section header (optional)

---

## 3. Interaction specification

### 3.1 Card interaction

| User action | Screen response | API call | Result |
|---|---|---|---|
| Member expand arrow click | Arrow rotate (0.3s), display member list | `GET /api/organizations/{orgId}/members` or `/api/projects/{projectId}/members` | Show 5 members, display remainder count |
| Open button click | Move to workspace | None | Move to project internal screen (S2) |
| ⋮ click | Show menu (at click position) | None | — |

### 3.2 Menu interaction

| Menu item | Action |
|---|---|
| Edit | Open dialog G, fill current values |
| Transfer | Open dialog H |
| Delete | Open dialog I (regular mode) |
| Force delete | Open dialog I (force mode), change warning |

Menu close: Reset state after animation completes

### 3.3 Dialog flow

**Create**

`[Create Project]` click (A or E)
 ↓
Open dialog G (clear fields)
 ↓
Enter fields + save
 ↓
POST /api/projects
 ↓
Success: Refresh list
Failure: Alert above fields

**Edit**

⋮ > Edit
 ↓
Open dialog G (fill current values)
 ↓
Edit fields + save
 ↓
PUT /api/projects/{projectId}
 ↓
Success: Refresh list, close dialog
Failure: Show alert

**Transfer**

⋮ > Transfer
 ↓
Open dialog H
 ↓
Select organization + move
 ↓
PUT /api/projects/{projectId}/transfer
 ↓
Success: Refresh list (keep tab position)

**Delete**

⋮ > Delete or Force delete
 ↓
Open dialog I
 ↓
Click confirm
 ↓
DELETE /api/projects/{projectId}
 ↓
Success: Refresh list, close dialog
Failure: Show alert

**Timing**
- While saving/deleting: Button → loading indicator, cancel inactive
- While querying list: Full screen loading indicator, no header

---

## 4. State transition

**Full list**

Loading (loading indicator)
 ↓
Query complete
 ├ Projects exist → Show list (cards)
 └ None → Empty state (E)
 ↓ (when project created)
 Switch to list display

**Member expand (each card)**

Collapsed (arrow: ↓)
 ↓ click
Loading (loading indicator)
 ↓
Expanded (arrow: ↑, member list)
 ↓ click again
Collapsed

**Save state (dialog)**

Initial (form active)
 ↓ click save
Saving (button → loading indicator)
 ↓
Success or failure
 ├ Success → Close dialog, refresh list
 └ Failure → Error alert + form active again

---

## 5. Where settings are saved

| Item | Save location | Persistence scope |
|---|---|---|
| Project list | Server (at query time) | Fetch fresh each request |
| Tab selection | Memory | Reset to "by organization" on page refresh |
| Member list (cache) | Memory | Clear on page refresh. Single query per organization |
| Menu open position | Memory | Clear when closed |

---

## 6. Responsive and accessibility specification

**Narrow screen (mobile)**
- Card columns: 3 → 2 → 1
- Tabs: Render scrollable
- Dialog: Width 90%, height auto adjust

**Keyboard navigation**
- Tab: Card → buttons (open, ⋮) → menu items
- Enter/Space: Same as button click
- Escape: Close menu, dialog

**Alternative text**
- Code chip: Project code mention
- ⋮ button: "Project menu" or "{project name} options"
- Member expand arrow: "Expand {n} members"

**Avoid color dependency**
- Automation statistics: Color + number + label together
- Status display: Icon + color or color + pattern

---

## 7. Server data exchange

### 7.1 Project CRUD

| Path | Method | Request | Response | Purpose |
|---|---|---|---|---|
| `/api/projects` | GET | — | Project array | Query list |
| `/api/projects` | POST | `{ name, code, organizationId, description }` | `{ id, name, ... }` | Create |
| `/api/projects/{id}` | PUT | `{ name, code, organizationId, description }` | Edit result | Edit |
| `/api/projects/{id}` | DELETE | — | — | Delete |
| `/api/projects/{id}/transfer` | PUT | `{ targetOrganizationId }` | — | Transfer organization |

### 7.2 Member, organization API

| Path | Method | Response | Purpose | Cache |
|---|---|---|---|---|
| `/api/projects/{projectId}/members` | GET | Member array (independent projects) | Query members | Not per-project |
| `/api/organizations/{orgId}/members` | GET | Member array (organization-owned) | Query members | **Per-organization** — same organization projects query once |
| `/api/organizations` | GET | Organization array | Create/transfer select options | Once per page load |

### 7.3 Automation statistics API

| Path | Method | Response | Purpose |
|---|---|---|---|
| `/api/projects/{projectId}/junit-summary` | GET | `{ totalCount, passedCount, failedCount }` | Display "N test results" on card |

If no statistics (hasResults=false), omit number display (do not show 0)

---

## 8. Maintenance notes

1. **When adding tabs, update three places**: condition to draw tab, tab list, tab-specific body. Align so internal index doesn't shift.
2. **Keep member cache key per-organization.** Changing to project ID causes duplicate calls across multiple organization projects.
3. **Draw list even if member query fails.** Member info is supplementary so does not block full screen.
4. **Keep tab position after transfer.** If transferred project appears in different tab, don't auto-switch; let user change tabs.
5. **Handle delete confirmation text multilingually.** Currently Korean appears in English mode.
6. **Attach permission conditions to menu.** Prevent showing items without permission then server rejects.
7. **Accurately judge project creation permission.** Disable create button for role=null users.
