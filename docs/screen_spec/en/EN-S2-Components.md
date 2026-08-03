# Shared Layout (S2) Components

> Screen ID **S2** · Parent document: [`EN-S2-Screen.md`](EN-S2-Screen.md)

---

## 1. Component list

| Area | Element type | Role |
|---|---|---|
| Header | Logo · project selection · manual · layout selection · profile menu | Entire screen top. Project switch entry point |
| Navigation | Tabs (horizontal) or sidebar (vertical) | Navigate 8 areas (dashboard~exploration). Conditional display (RAG · exploration) |
| Project information | Breadcrumb · tabs (horizontal mode) · project description collapse | Show current project name · code. Expand/collapse description |
| Content area | Each tab's screen content | Screen 0~8 corresponding to index. Conditional render |
| Profile dialog | 7 tabs (basic info · password · language · JIRA · Google · API · theme) | Modal form. Query · modify user settings |

---

## 2. Display specifications

### 2.1 Header

**Layout**
- Left: Logo · project selection button (dropdown)
- Center: Manual button (question mark icon)
- Right: Layout switch toggle (tabs ↔ sidebar) · profile menu (arrow)

**Buttons**
- Project selection: Current project name + arrow · click goes to project list (S1)
- Manual: Question mark icon · click opens manual markdown (new tab)
- Layout: Switch icon · shows current mode
- Profile: Avatar or name · dropdown menu

**Dropdown menu (Profile)**
- Profile settings · manual · logout

**Conditional**
- `ADMIN` role only: Show `[Dashboard]` · `[Admin Menu]` buttons
- Other roles: Hide

### 2.2 Navigation

**Horizontal tabs mode (layout toggle off)**
- Below ProjectHeader
- Tab order: Dashboard / Test Cases / Test Plans / Test Execution / Test Results / Automated Tests / (RAG) / (Exploratory Sessions)
- If no tabs, don't render (no empty space)

**Sidebar mode (layout toggle on)**
- Vertical menu left of ProjectHeader
- Menu items: Same as tabs above · icon + label · selection highlight (color)
- Collapse/expand: Toggle controlled · state preserved (browser storage)

**Badges**
- Number badge next to each tab/menu (e.g., Test Cases `123`, Test Plans `45`)
- Calculated filtered by project (not total count)

### 2.3 Project information

**Horizontal tabs mode**
- Breadcrumb: `[Project Code] / [Project Name]`
- Tabs below
- Project description collapse/expand (default: collapsed)

**Sidebar mode**
- Project name shown bold (not breadcrumb)
- Project description collapse/expand

### 2.4 Profile dialog

**Structure**
- Title: "Profile Settings"
- 7 tabs: Basic info · Password · Language/timezone · JIRA · Google Sheets · API tokens · Theme

**Basic info tab**
- Username · email (read-only) · signup date

**Password tab**
- Current password · new password · confirm · change button

**Language · timezone tab**
- Language select (dropdown) · timezone select (dropdown) · save button

**JIRA settings tab**
- JIRA URL · access token · connection status (display) · setup/remove button

**Google Sheets tab**
- Connection status · auth button · permission refresh button

**API tokens tab**
- Token (masked or copy button) · regenerate button · expiry date

**Theme tab**
- Dark / light mode select · preview

---

## 3. Interaction specifications

### 3.1 Navigation

| Action | Response | Result |
|---|---|---|
| Click tab/menu | Render corresponding screen (S3~S10) · change URL | Path sync (e.g., `/projects/{id}/testcases`) |
| Switch horizontal ↔ sidebar | Layout changes immediately | Selection saved (browser storage) |
| Click sidebar collapse | Animate collapse/expand | State saved (browser storage) |

**Tab index recalculation**
- When RAG inactive: Exploration session index shifts up (8→7)
- When exploration inactive: Exclude that tab
- Path and tab index auto-sync

### 3.2 Profile dialog

| Action | Response |
|---|---|
| Profile menu > settings | Open dialog (keep last tab) |
| Switch tabs | Show that tab content |
| Change language + save | Call `PUT /api/users/preferences` · apply immediately |
| Change timezone + save | Same · refresh timestamp display |
| Select theme | Apply immediately (auto-save) |
| Change password | Validate, then `PUT /api/users/password` · success alert |

### 3.3 Project switch

| Action | Response |
|---|---|
| Click project selection button | Navigate to S1 (project list) · select new project · return to S2 |

---

## 4. State transitions

**Screen entry**

Parse route (pathname)
 ↓
Extract project ID · path
 ↓
Determine current area
 ↓
Filter conditional items (RAG · exploration available)
 ↓
Render content screen

**Tab/menu switch**

User click
 ↓
Change area
 ↓
Generate address
 ↓
navigate (path)
 ↓
URL sync · swap content screen

---

## 5. Settings storage locations

| Item | Storage | Scope |
|---|---|---|
| Current tab/area | URL path | Bookmarkable · different per device |
| Layout choice (tabs vs sidebar) | Browser storage | Per device · per browser |
| Sidebar collapse state | Browser storage | Per device |
| Project description collapse | Browser storage (per project) | Per project · per device |
| Language · timezone | Server user preferences | Sync across devices |
| Theme (dark/light) | Server user preferences + browser storage | Sync across devices |

---

## 6. Responsive · accessibility specifications

**Narrow screen (mobile)**
- Header: Compress to dropdown menu
- Sidebar mode: Auto-active (hide horizontal tabs)
- Content: Use full width

**Keyboard navigation**
- Tab: Header buttons → tabs/menu → content elements
- Enter: Same as tab/button click
- Escape: Close dialog

**Alternative text**
- Project selection: "Current project: {project name}"
- Manual button: "Open user manual"
- Layout toggle: "Switch layout (current: horizontal tabs)" etc.
- Badge: "Test cases 123"

---

## 7. Server data exchange

### 7.1 Settings and user information

| Route | Method | Response | Purpose |
|---|---|---|---|
| `/api/config` | GET | `{ RAG availability, showExplora... }` | RAG · exploration conditions |
| `/api/users/me` | GET | User object (role included) | Header conditional display |
| `/api/users/preferences` | PUT | — | Save language · timezone · theme |

### 7.2 Logout

| Route | Method | Result |
|---|---|---|
| `/api/auth/logout` | POST | Delete token · redirect to login |

### 7.3 JIRA · Google integration

| Route | Method | Purpose |
|---|---|---|
| `/api/jira-config` | GET/PUT | JIRA auth settings |
| `/api/google-sheets/auth` | POST | Google auth callback |

---

## 8. Maintenance notes

1. **When adding areas, modify four places**: Area list · content selection rule · address-to-area parsing rule · area-to-address generation rule. If you skip any, following items' numbers shift.
2. **When RAG inactive, exploration session index changes.** Need adjustment logic based on tab conditional filter.
3. **Badges are client-side filtered calculation, not server aggregation.** May be inaccurate if list loads paginated.
4. **Each profile dialog tab is independent.** Minimize value sharing between tabs, place save button per tab.
5. **Don't render both sidebar and horizontal tabs modes simultaneously.** Conditional render one only.
6. **If admin menu permission function is defined but unused, consider removing it.** Confirm only ADMIN sees admin menu.
7. **When saving layout choice in browser storage, verify it restores after refresh.**
