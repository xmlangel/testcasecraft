# Test Plans(S5) Components

> Screen ID **S5** · Parent document: [`EN-S5-Screen.md`](EN-S5-Screen.md)

---

## 1. Component list

### 1.1 Plan list area (tab layout)

| Element | Type | Role |
|-----|------|------|
| Tab header | Tab group | Plan list / Execution list etc. (selectable) |
| New create | Button | Click [+ New Plan] |
| Plan card or row | Card or row | Plan name, case count, creation date, menu |
| Menu | Dropdown | Click [⋮] to edit/delete/execute |
| Pagination | Control | Previous/next page |
| Plan form | Modal | Creation/editing dialog |
| Delete confirmation | Modal | Confirmation dialog before deletion |

### 1.2 Plan and execution 2-pane layout (left + right)

#### Left: Plan and execution tree

| Element | Type | Role |
|-----|------|------|
| Tree header | Filter + toggle | Name filter + collapse button |
| Plan node | Recursive tree | Plan name + expand toggle |
| Execution node | Child item | Execution name + status chip (COMPLETED/in progress/aborted) |
| Scroll | Scroll area | Plan/execution tree (virtualized) |

#### Right: Detail area

| Element | Type | Role |
|-----|------|------|
| Form | Input form | Plan creation/editing (when plan node is selected) |
| Read view | Read-only | Plan detail view (when mode switches) |
| Execution form | Input form | Execution creation/editing (when execution node is selected) |

---

## 2. Display specifications

### 2.1 Plan card or row

| Information | Display location | Format |
|-----|---------|------|
| Plan name | Header or left | Text (truncate if long) |
| Description | Subtitle (optional) | Text or not displayed |
| Case count | Right badge | "Cases: N" |
| Creation date | Bottom small text | YYYY-MM-DD |
| Menu | Far right | [⋮] icon |

### 2.2 Status chip (execution node)

| Status | Background color | Text | Icon |
|-----|--------|--------|--------|
| COMPLETED | Green | "Complete" | ✓ |
| IN_PROGRESS | Orange | "In progress" | ◐ |
| ABORTED | Gray | "Aborted" | ◻ |

### 2.3 Pagination

- Position: bottom of list
- Display: "1 / 5" or previous/next buttons
- Default: 10–20 items per page

---

## 3. Interaction specifications

### 3.1 In plan list

| Action | Effect | Timing |
|-----|------|--------|
| Click plan card | Show menu or detail | Immediately |
| Click [⋮] menu | Show edit/delete/execution menu | Immediately |
| Select [Edit] | Open plan form dialog | Immediately |
| Select [Delete] | Show delete confirmation | Immediately |
| Click [+ New Plan] | Open creation form dialog | Immediately |
| Move page | Update pagination | Immediately |

### 3.2 In plan form

| Field | Input type | Constraints |
|-----|---------|------|
| Plan name | Text | 1–255 characters, required |
| Description | Markdown or text | Optional |
| Case selection | Checkbox tree | Selection required (minimum 1) |

### 3.3 In 2-pane layout

| Action | Effect | Timing |
|-----|------|--------|
| Expand plan node | Show execution list | Immediately |
| Select plan node | Change right detail/form | Immediately |
| Select execution node | Show right execution form | Immediately |
| Collapse left | Minimize list width | 0.3s animation |
| Type in filter | Real-time tree item filter | While typing |

---

## 4. State transitions

| Situation | Screen state |
|-----|---------|
| Initial load | Show plan list (or loading) |
| 0 plans | Empty state guidance + [New Plan] button |
| Page overflow | Auto-reset to page 1 |
| No permission (TESTER) | [New Plan], menu buttons hidden (read-only) |
| After plan deletion | Remove from list + reload |
| 2-pane layout collapsed | Left width 44px → right expands |

---

## 5. Configuration save location

| Configuration | Save location | Scope | Persistence |
|-----|---------|------|---------|
| Tree expand state | Browser storage | User's this device | Until manual deletion |
| Filter input | Session (memory) | This session only | Clears on refresh |
| 2-pane collapse state | Browser storage | User's this device | Until manual deletion |

---

## 6. Server interaction

### 6.1 Retrieve plan list

**Path**: `GET /api/test-plans?projectId={projectId}`

Retrieve timing: Auto-retrieve on screen entry

Response: All test plans for the project (plan ID, name, description, case count, creation date)

### 6.2 Create plan

**Path**: `POST /api/test-plans`

Request: Project ID, plan name, description, case ID list

Response: Created plan object (including ID)

### 6.3 Edit plan

**Path**: `PUT /api/test-plans/{planId}`

Request: Plan name, description, case ID list

Response: Edited plan object

### 6.4 Delete plan

**Path**: `DELETE /api/test-plans/{planId}`

Response: 204 No Content

### 6.5 Retrieve executions by plan

**Path**: `GET /api/test-executions?testPlanId={planId}`

Retrieve timing: When expanding plan in tree, or auto

Response: All executions for the plan (execution ID, name, status, creation date)

### 6.6 Retrieve automation results

**Path**: `GET /api/junit-results/by-plan/{planId}`

Retrieve timing: Parallel retrieve on initial plan list load

Response: Automation result summary per plan (count, suite name list)

---

## 7. Responsive specifications

- **Width ≥ 768px**: 2-pane layout (left 250px + right variable)
- **Width < 768px**: Stacked or list-only display
- **Minimum tree width**: 44px (when collapsed)

---

## 8. Maintenance notes

| Item | Note |
|-----|--------|
| **Plan ID vs case ID** | UUID confusion risk → explicit type hints |
| **Included cases ≠ execution cases** | Editing plan after execution creation preserves existing execution cases |
| **Executions of deleted plan** | Execution's `testPlanId` can become null |
| **Automation result count** | One API call per plan → parallelize with Promise.all |
| **Tree width constant** | `LIST_WIDTH=260px`, `LIST_COLLAPSED=44px` |
| **Status chip color** | Use constant function to maintain COMPLETED/IN_PROGRESS/ABORTED color consistency |
| **Browser storage dependency** | Tree expand state saved → multi-device sync not supported |
