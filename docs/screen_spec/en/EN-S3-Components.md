# Dashboards (S3) Components

> Screen ID **S3** · Parent: [`EN-S3-Screen`](EN-S3-Screen.md)

---

## 1. Component List

### 1.1 Project Dashboard

| Area | Element | Type | Role |
|-----|------|------|------|
| Header | Title | Text | "Dashboard" or project name |
| Header | Refresh button | Button (chip) | Load latest data |
| Header | Last update | Text | M/D/YYYY HH:MM format |
| Header | Status notification | Banner (Alert) | Loading/error message |
| Summary | Project summary | Accordion | Project name, case count, member count (expand/collapse state persisted) |
| Chart D | Result distribution | Pie chart | PASS/FAIL/BLOCKED/SKIPPED/NOTRUN ratio |
| Chart E | 14-day trend | Line chart | Cumulative by date (PASS, FAIL, BLOCKED) |
| Chart F | Open execution | Bar chart | Results sum by execution or date |
| Chart G | By assignee progress | Stacked bar chart | Member name, status sum |
| Filter | Plan select | Dropdown | All plans or specific plan selection |
| Results | Recent execution results | Table | Most recent N executions for selected plan |
| Status | No data | Guidance message | Project selection needed / no cases |

### 1.2 Enterprise Dashboard

Same composition as project dashboard but aggregation scope covers all projects.

---

## 2. Display Specifications

### 2.1 State-Based Display

| State | Display Method | Color/Icon | Interaction |
|-----|---------|---------|-------|
| Loading | Widgets hidden + centered loading indicator | Spinning circle | No click |
| Error | Alert banner screen top | Red (alert color) | Close button (optional) |
| No data | Guidance text + creation button | Gray | Prompt project selection |
| Data present | All widgets visible | Normal colors | Normal interaction |

### 2.2 Last Update Time

- Display: Right side of header in "Last update M/D/YYYY HH:MM" format
- Auto-update: Immediately when refresh button clicked
- Server time: Based on API response

### 2.3 Chart Legend and Range

| Chart | Legend Location | Data Range | Display Unit |
|-----|---------|---------|---------|
| Pie | Right or bottom | Recent execution result (5 types) | Count or percent |
| Line | Right | Last 14-day trend | Date, cumulative count |
| Bar (execution) | Right | Open executions or time buckets | Date, count |
| Bar (assignee) | Right | All assignees | Member name, status sum |

### 2.4 Accordion State

- Open/close state: Saved in browser
- Next visit: Previous state restored
- Key: `testcase-manager-dashboard-accordion`

---

## 3. Interaction Specifications

### 3.1 Project Selection Behavior

- **Trigger**: Project change in ProjectSelector above
- **Immediate effect**: Loading indicator → API query starts
- **Completion**: All chart/table data refreshed (1-2 seconds)
- **Timing**: Immediately after project selection ends

### 3.2 Refresh Button Click

- **Location**: Top right of header
- **Visual feedback**: Button shows loading spinner
- **Effect**: Dashboard data for current project reloads
- **Timing**: Complete within 1 second (typically 500ms)
- **Note**: Plan filter persists

### 3.3 Accordion Expand/Collapse

- **Location**: "Project Summary" section header
- **State saved**: Immediately saved to browser storage on click
- **Loading**: Previous state restored from browser storage
- **Animation**: 0.3-second slide

### 3.4 Plan Dropdown Selection

- **Location**: Above recent execution results table
- **Default**: "All plans"
- **Effect**: "Recent execution results" table filtered only
- **Other charts unaffected**: Remain project-wide baseline
- **Timing**: Table reloads directly after selection (< 500ms)

---

## 4. State Transitions

| Situation | Screen State | Save/Restore |
|-----|---------|---------|
| Initial entry | Project not selected → guidance message | — |
| Project selected | Loading indicator shown | — |
| Data load complete | All charts and table visible | — |
| API error | Alert banner + no data display | — |
| No permission | Screen entry blocked (router above blocks) | — |
| Revisit | Previous accordion state restored | Browser storage |

### Conditional Hide

- **Loading**: All widgets hidden (loading indicator only)
- **Error**: All widgets hidden (Alert only)
- **No data**: Guidance text, data widgets hidden

---

## 5. Settings Storage Location

| Setting | Storage Location | Scope | Duration |
|-----|---------|------|---------|
| Accordion expand state | Browser storage | User on this device | Until explicit delete |
| Plan filter selection | Session (memory) | This session only | Cleared on page refresh |

---

## 6. Server Data Exchange

### 6.1 Project Dashboard Data Query

**Path**: `GET /api/dashboard/projects/{projectId}`

Query timing:
- Auto-queried when project selected
- Manual query when user clicks refresh button

Response info:
- Project summary (total cases, completion rate, last update)
- 14-day trend (cumulative results by date)
- Open executions (result per execution/time bucket)

### 6.2 By Assignee Results Query

**Path**: `GET /api/dashboard/projects/{projectId}/open-test-run-assignee-results`

Query timing: Immediately after project dashboard data query

Response info: By assignee progress (assignee name, PASS/FAIL/BLOCKED count)

### 6.3 By Plan Recent Results Query

**Path**: `GET /api/testplans/{testPlanId}/recent-results?limit=20`

Query timing: When plan selected from dropdown

Response info: Most recent executions for selected plan (execution ID, status, result summary)

### 6.4 Functions Screen Does Not Use

Dashboard is read-only, so no POST/PUT/DELETE. When other screens change cases, plans, or results, dashboard requires refresh.

---

## 7. Responsive Specifications

- **Width**: Assumes 1024px and above (3-column charts)
- **Mobile**: 1-column (stacked) when < 768px
- **Scroll**: Minimize horizontal scroll (recommended)

---

## 8. Maintenance Notes

| Item | Caution |
|-----|--------|
| **API response change** | If response structure changes, parsing logic must update too |
| **Date format** | lastUpdated is M/D/YYYY fixed; verify parsing if server response changes |
| **Browser storage key** | `testcase-manager-dashboard-accordion` hard-coded; change will lose user settings |
| **Permission validation** | Depends on API response only; verify server 403 handling logic |
| **14-day range** | Line chart period is fixed; change data query range together when modified |
