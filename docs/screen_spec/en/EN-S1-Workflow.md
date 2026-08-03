# Projects(S1) Workflow

> Screen ID **S1** · Screen name **Project list · Create · Edit · Transfer organization · Delete**
> Route: `/projects`

---

## 1. Business purpose

Projects are the **data boundary** of this product. Cases, plans, executions, results, RAG documents, and exploratory sessions all attach to projects, and permissions are assigned at the project level. S1 is the screen that creates and selects that boundary.

| Purpose | Content |
|---|---|
| ① **Select work target** | List participating projects as cards and open one to move to workspace |
| ② **Create boundary** | Set name, code, description, and organization to create a project. **The code becomes the display ID prefix** |
| ③ **Distinguish belonging** | Separate organization-owned projects from independent projects using tabs |
| ④ **Manage lifecycle** | Edit, transfer organization, delete, force delete |
| ⑤ **Confirm participants** | Expand member list and role from organization project cards |

**What this screen does not do**

| Does not do | Who owns it |
|---|---|
| Invite members, assign roles | Server API exists but no form on this screen. See section 7 |
| Work within project | S3–S10 |
| Organization creation and member management | S11 Organization settings (`/organizations`) |
| Project switch | S2 header's `[Select Project]` dropdown is faster |

---

## 2. Screen location

| Item | Content | Reference |
|---|---|---|
| Before | S0 login success | Manual section 1-3 |
| After | **S2 workspace** (`/projects/{projectId}`) | `open-project-button` |
| Entry condition | Logged in. Screen opens even if 0 projects participate | Empty state |
| Anytime entry | Header logo click, breadcrumb `Projects` crumb | |

**`/` and `/projects` converge to the same place.** When no project ID is in the path, the screen returns to project selection state.

---

## 3. Business process flow

### 3.1 List view and entry

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Enter `/projects` | Query participating projects. During query, show only center loading indicator | — |
| 2 | 0 projects | Empty state guidance 3 lines + create button. **Do not draw tabs themselves** | — |
| 3 | N projects | Create tabs by belonging and draw card grid | — |
| 4 | Organization project card | **Automatically** pre-load members | Show member count on card |
| 5 | Member count click | Expand member list (max 5 + `+N more`) | — |
| 6 | `[Open Project]` | Move to workspace | S2 + S3 dashboard |

Step 4 applies only to organization projects. Independent projects have non-clickable member count area.

### 3.2 Create

| # | Action | Behavior |
|---|---|---|
| 1 | `[+ New Project]` or empty state's `[Create Project]` | Create dialog (width `md`) |
| 2 | Enter name, code, description, organization | Code becomes display ID prefix |
| 3 | `[Save]` | `POST /api/projects` |
| 4 | Success | List updates. Card appears |
| 5 | Failure | Red alert in dialog. Input values preserved |

**Creation permission does not check system role.** Any authenticated user can create independent projects. Code comments preserve history of normal users with `role=null` being blocked.

**Creator automatically becomes `PROJECT_MANAGER`** (manual section 17-9). The creator becomes the project administrator.

### 3.3 Edit, transfer organization, delete

Menu has four items in card's upper-right `⋮`.

| Menu | Behavior | Permission | Reference |
|---|---|---|---|
| **Edit** | Open create dialog in edit mode | Project manager role | `PUT /api/projects/{id}`|
| **Transfer** | Select target organization and move belonging | 〃 | `PUT /api/projects/{projectId}/transfer`|
| **Delete** | Confirmation dialog → delete | 〃 | `DELETE /api/projects/{id}`|
| **Force delete** | More red + different warning text confirmation dialog | 〃 | Same endpoint + `force` |

**Difference between delete and force delete is warning text.** Force delete shows "All connected test plans, test cases, and execution histories will be deleted" as alert warning. Regular delete uses same intent as gray supplementary text two lines. Both include statement that action cannot be undone.

⚠ **Needs verification.** How the two paths actually differ on the server cannot be determined by screen code alone. Check API parameter handling.

---

## 4. Project model rules

| # | Rule | Content |
|---|---|---|
| P1 | **Project code is display ID prefix** | Code `SMP` → case display ID `SMP-001`. Used in screens, search, notifications |
| P2 | **Organization belonging is optional** | Independent projects without organization attachment are first-class concept |
| P3 | **Permissions are at project level** | Same person has different roles for different projects |
| P4 | **Creator becomes PM** | Starts without separate permission assignment procedure |
| P5 | **System default folders are created together** | Protected folders auto-create on project creation and cannot be moved or deleted |
| P6 | **Deletion removes child data** | Cases, plans, executions, results disappear together |
| P7 | **Member list expands from cards only for organization projects** | Independent projects show only member count |

---

## 5. Users and permissions

### 5.1 Feature × role

This project list screen, so **project role and system role work together.**

| Feature | System ADMIN | PM LEAD | DEVELOPER CONTRIBUTOR | TESTER | VIEWER | Reference |
|---|---|---|---|---|---|---|
| Query participating project list | All | Own participation | Own participation | Own participation | Own participation | |
| Query project details | ○ | ○ | ○ | ○ | ○ | Project view permission|
| **Create new project** | ○ | ○ | ○ | ○ | ○ | Check auth only· |
| Edit project | ○ | ○ | — | — | — | Project management permission|
| Transfer organization | ○ | ○ | — | — | — | Management permission|
| Delete, force delete project | ○ | ○ | — | — | — | Project management permission|
| Query member list | ○ | ○ | ○ | ○ | ○ | Project view permission|
| Add member, change role, remove | ○ | ○ | — | — | — | Management permission — **no form on screen**(section 7) |

**Only own projects appear in list.** System `ADMIN` sees all. Not seeing other people's projects is design, not a bug.

### 5.2 Element visibility by screen

| Element | Visibility condition |
|---|---|
| `[+ New Project]` | `hasProjectCreationAccess(user)` — check auth |
| Empty state's `[Create Project]` | Same |
| `⋮` menu button | Always visible |
| Menu items: edit, transfer, delete | Server rejects. **Screen does not pre-hide based on permission** |

⚠ **Needs verification.** `⋮` menu items draw regardless of permission. When VIEWER clicks delete, how the server 403 message appears on screen needs verification. This contradicts screen-wide rule G4 (hide actions without permission).

---

## 6. Feature rules

| # | Rule |
|---|---|
| F1 | **Draw tabs only when content exists.** If no organization projects, no organization tab |
| F2 | Maintain separate display tab index and internal index. Tabs disappear conditionally so reverse conversion is needed |
| F3 | Organization project members pre-load when card mounts |
| F4 | Show up to 5 members in list, fold remainder as `+N more` |
| F5 | Member role prioritizes organization role → project role → other values in badge |
| F6 | Avatar initials use two-character split from name, otherwise first two characters |
| F7 | During deletion in progress, disable confirm and cancel buttons both |
| F8 | Menu clears state after close animation finishes |

---

## 7. Server functions not on screen — member management

Member add, role change, remove APIs exist but **this screen has no form.**

| API |
|---|
| `POST /api/projects/{projectId}/members` |
| `PUT /api/projects/{projectId}/members/{userId}/role` |
| `DELETE /api/projects/{projectId}/members/{userId}` |

Manual section 17-9 states that members are invited and roles assigned in project settings. Cannot find that form on screen, so record as **state: Hidden**. Organization project member management is handled at organization level in S11 organization details.

⚠ **Needs verification.** Confirm where the project-level member invitation screen is (or if it doesn't exist), and correct manual section 17-9 if it doesn't.

---

## 8. Integration with other screens

| Target | Direction | Content |
|---|---|---|
| **S0 Login** | S0 → S1 | Destination after login |
| **S2 Workspace** | S1 → S2 | `[Open Project]`. Reverse: header logo, breadcrumb return to S1 |
| **S2 Project switch** | — | Same purpose handled by dropdown. Does not make round trip through list page |
| **S4 Cases** | S1 → S4 | Project code becomes display ID prefix |
| **S8 Automation** | S8 → S1 | Card's automation result count comes from JUnit summary |
| **S11 Organization settings** | S1 ↔ S11 | Target list for transfer organization is same data as organization settings |

---

## 9. Assumptions and constraints

| Item | Content |
|---|---|
| 0 project user | Show guidance that invitations must be received to use. Show create button if creation permission exists |
| Card statistics | Project count, member count from list response; automation count from separate summary |
| Organization transfer | Server judges permission for target organization |
| Delete | Cannot undo. Backup policy is responsibility of operations documentation (`../../deployment/DOCKER_SETUP.md`) |

---

## 10. Requirement ↔ section mapping

| REQ-ID | Requirement | Section |
|---|---|---|
| S1-01 | Participating project list, card statistics | Section 3.1 |
| S1-02 | Tabs by belonging (organization, independent, all) | Section 3.1, 6 F1·F2 |
| S1-03 | Project create (name, code, description, organization) | Section 3.2, 4 P1 |
| S1-04 | Edit, transfer organization | Section 3.3 |
| S1-05 | Delete, force delete two-level warning | Section 3.3 |
| S1-06 | Member list expand | Section 3.1 4·5, 6 F3~F6 |
| S1-07 | 0 project guidance | Section 3.1 2 |
| S1-08 | Workspace entry | Section 3.1 6 |

Complete requirements and evidence in [`04_요건반영목록.md`](EN-S1-Requirements.md).
