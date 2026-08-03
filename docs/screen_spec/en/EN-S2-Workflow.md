# Shared Layout (S2) Workflow

> Screen ID **S2** · Screen name **Global header · Breadcrumb · Area navigation · Project switch · Profile · Bookmarks**
> Routes: Common areas within `/projects/{projectId}` · `/projects/{projectId}/bookmarks`

---

## 1. Business purpose

S2 is not a content screen but a **frame that holds content**. S3~S10 are swapped in and out of this frame. It handles four functions.

| Purpose | Content |
|---|---|
| ① **Shows location** | Breadcrumb always displays `Project / Name / Area` |
| ② **Navigates areas** | Moves between 8 areas using horizontal tabs or sidebar. **Both layouts share the same list** |
| ③ **Switches projects** | Changes project while keeping the current area |
| ④ **Adds personal tools** | Profile 7 tabs · bookmarks · dark mode · manual · JIRA status |

**What this screen does not do**

| Not doing | Handled by |
|---|---|
| Business data manipulation | S3~S10 content |
| Project creation · deletion | S1 |
| System settings | S11 (header admin menu entry only) |
| Project member management | Not implemented. See S1 section 7 |

---

## 2. Screen location

| Item | Content |
|---|---|
| Previous | `[Open Project]` from S1 project list |
| Next | One of 8 areas (S3~S10). Default is S3 Dashboard after entry |
| Entry condition | Logged in + project ID in path |
| Back navigation | Header logo · breadcrumb `Project` crumb → S1 |

**If project ID is not in the path, the shared layout returns to project selection state**. No content appears without a project selected.

---

## 3. Workflow processes

### 3.1 Area navigation

| # | User action | Screen behavior |
|---|---|---|
| 1 | Click tab or menu item | Swap content to that area, change route |
| 2 | Enter path directly in address bar | Match the path to the corresponding area |
| 3 | Browser back · forward | Follow the same path as #2 |
| 4 | RAG · Exploratory session closes | Item disappears from list, following items shift up |

**Current area is identified by position number.** That number is "which item among visible items", and is not fixed because conditional items exist. When RAG closes, the numbers of following items shift up.

**Four places to modify when adding a new area**

1. Area list definition
2. Rules for selecting content
3. Rules for determining current area from address
4. Rules for changing address when selecting area

### 3.2 Layout selection

The same area list renders in two ways. Two places to choose.

| Location | Storage |
|---|---|
| Profile → Theme Settings → `Menu Structure` | Server (per user) |
| Header toggle icon | Same |

| Value | Areas placed in | Breadcrumb first slot | Rendering component |
|---|---|---|---|
| Horizontal tabs (default) | Below breadcrumb | `Project` link | |
| Sidebar | Left side vertical | **Project selector** | |

**In sidebar mode, the breadcrumb `Project /` crumb collapses**. This eliminates duplication of project name appearing in both selector and breadcrumb.

Sidebar can collapse. When collapsed, only icons remain and labels move to `title` attribute.

### 3.3 Project switch

| # | Action | Behavior |
|---|---|---|
| 1 | Header `[Project Selection]` | Go to S1 list page |
| 2 | Sidebar mode breadcrumb project name click | Expand participating projects dropdown |
| 3 | Select different project from list | Go to `/projects/{id}`. Do nothing if same project |
| 4 | Dropdown footer `View Projects` | Go to S1 |

**The two paths differ in character**. Route 1 goes back and forth to the list page, route 2 stays on the current page. Route 2 is the solution from the diagnosis in `../../plan/LEFT_NAV_RESTRUCTURE.md` section 4.

⚠ Route 2 selector **appears in breadcrumb only in sidebar mode**. In horizontal tab mode, only route 1 is available.

### 3.4 Profile dialog

Opened by avatar → `[Profile]`. Has 7 tabs.

| # | Tab | Content | Save |
|---|---|---|---|
| 1 | Basic information | Username (read-only) · name · email · role badge · email auth status · version | Save button |
| 2 | Password | Verify existing, then change | Save button |
| 3 | Language settings | Interface language · timezone | Language immediate, timezone save button |
| 4 | JIRA settings | Address · email · connection key | Save button |
| 5 | Google Sheets settings | Account connection | Connection flow |
| 6 | API tokens | Issue · revoke (max 10) | Issue immediate |
| 7 | Theme settings | Screen mode · design system · **Menu structure** | Immediate + server save |

**API tokens show full value only once right after issue** (manual section 13-6). This is rule G7 across all screens.

### 3.5 Bookmarks

Header `☆` → `/projects/{projectId}/bookmarks`.

| # | Action | Behavior |
|---|---|---|
| 1 | Click `☆` on case list row | Add to default collection `Favorites` |
| 2 | Header `☆` | Enter bookmarks screen |
| 3 | Select collection on left | Right side shows that collection's cases |
| 4 | `[Create Collection]` | Enter name · description |
| 5 | Rename · delete collection | Default `Favorites` collection cannot be deleted |
| 6 | Personal note on case | Save |
| 7 | Remove case | Remove from collection |

**Bookmarks are personal assets.** Do not affect other users' screens. Cannot edit case content, only manage collections and notes (manual section 4-7).

---

## 4. Layout rules

| # | Rule | Content |
|---|---|---|
| B1 | **Area list defined in one place** | Horizontal tabs and sidebar read the same array. If written in two places, only one updates when items are added |
| B2 | **Current area identified by position** | Not fixed number. Conditional items cause shifting |
| B3 | **Count badges on three items only** | Test cases · plans · executions. No badges on automation · results · RAG · exploration |
| B4 | **Badge numbers counted by screen** | Filter the context list by current project and use the length. Not server aggregation |
| B5 | **Both layouts use same typography** | Layout switch doesn't change text size. Share `CHROME_TYPOGRAPHY` |
| B6 | **Result entry · plan details don't go fullscreen** | Maintain header and sidebar, open within right content area |
| B7 | **Collapse state kept in browser** | Project description collapse in browser storage, sidebar collapse in `useNavMode` |

---

## 5. Users and permissions

### 5.1 Header element exposure

| Element | Exposure condition |
|---|---|
| Logo + version | Everyone |
| `[Dashboard]` | **System ADMIN only** |
| `[Admin Menu ▾]` | **System ADMIN only** |
| `[Project Selection]` | Everyone |
| JIRA status badge | Everyone |
| `?` manual | Everyone |
| Layout switch | Everyone |
| Dark mode | Everyone |
| Avatar menu | Everyone |
| `☆` bookmarks | When in project |

**Admin menu is ADMIN-only.** A permission check exists allowing both ADMIN and MANAGER, but the actual check only allows system admins. **MANAGER cannot access the admin menu.**

⚠ Manual section 17-1 says "when logged in as admin account" so there's no conflict, but the admin menu permission function is unused dead code. Recorded in 04.

### 5.2 Area exposure

Project permissions do not hide areas themselves. Even VIEWER sees all 8 areas. Whether content is editable is determined by each content screen (see section "02 Permission differences" in each screen).

Areas disappear only under two feature flags (`00_全体_業務プロセス.md` section 4).

---

## 6. Functional rules

| # | Rule |
|---|---|
| F1 | Do not render the shared layout if project is not selected |
| F2 | Last breadcrumb crumb is current area name. If no area, bold the project name |
| F3 | Project switch dropdown shows current project as selected, clicking it again does nothing |
| F4 | Dropdown items show project code as secondary text |
| F5 | Project description can collapse, state persists on next visit |
| F6 | Sidebar selected item marked by left 3px line and primary color |
| F7 | When sidebar collapses, move label to `title` to preserve information |
| F8 | Manual opens in new tab, doesn't cover same tab |
| F9 | Avatar initials are first letter of name, or `U` if none |

---

## 7. Cross-screen coordination

| Target | Direction | Content |
|---|---|---|
| **S1 Projects** | Bidirectional | Communicate via logo · breadcrumb · `[Project Selection]` |
| **S3~S10** | S2 → content | Area navigation. Keep shared layout |
| **S4 Cases** | S4 → S2 | Case row `☆` adds to bookmarks |
| **S11 Admin** | S2 → S11 | Admin menu is gateway to 6 paths (translation management commented out) |
| **S0 Login** | S2 → S0 | Logout |
| **Manual viewer** | S2 → `/manual` | Opened from header `?` and avatar menu |
| **JIRA settings** | S2 → Profile tab 4 | Header badge alerts if not configured |

---

## 8. Assumptions and constraints

| Item | Content |
|---|---|
| Area order fragility | Inserting items in middle causes following numbers to shift, affecting content selection, address parsing, and saved last position |
| Badge number source | Length of list in context. If list is paginated, badges may not match total count |
| Two layout variants | Plan · execution screens have different structure per layout (S5 · S6 documents) |
| Project selector | Appears in breadcrumb only in sidebar mode |
| Admin menu | ADMIN-only. MANAGER cannot access |

---

## 9. Requirement ↔ Section mapping

| REQ-ID | Requirement | Section |
|---|---|---|
| S2-01 | 10 global header tools | 5.1 |
| S2-02 | 3-level breadcrumb | 3.2 · section 6 · F2 |
| S2-03 | 8 area navigation single definition | 3.1 · section 4 · B1 · B2 |
| S2-04 | Count badges 3 items | Section 4 · B3 · B4 |
| S2-05 | Horizontal tabs ↔ sidebar choice | 3.2 |
| S2-06 | Sidebar collapse | 3.2 · section 6 · F7 |
| S2-07 | Project switch (dropdown · list) | 3.3 |
| S2-08 | Profile 7 tabs | 3.4 |
| S2-09 | Bookmark collections · notes | 3.5 |
| S2-10 | Dark mode · design system | 3.4 tab 7 |
| S2-11 | Project description collapse persistence | Section 6 · F5 |

Full requirements and rationale in [`EN-S2-Requirements.md`](EN-S2-Requirements.md).
