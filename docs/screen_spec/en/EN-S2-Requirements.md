# Shared Layout (S2) Requirement Coverage

> Screen ID **S2** · Reference documents: [`EN-S2-Workflow.md`](EN-S2-Workflow.md) · [`EN-S2-Screen.md`](EN-S2-Screen.md) · [`EN-S2-Components.md`](EN-S2-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference conventions per [`../README.md`](../README.md) section 4.

---

## 1. Functional requirements

| # | Requirement | Implementation location | Status |
|---|---|---|---|
| **S2-01** | Global header 10 tools (logo·version·ADMIN dashboard·admin menu·project selection·JIRA·manual·layout·dark mode·avatar) | Screen 2.1 section A. | Working |
| **S2-01-02** | ADMIN dashboard button visibility | Screen 2 section 5 permissions | Working |
| **S2-01-03** | Admin menu ADMIN-only | Screen 2 section 2.1 A. admin menu table | **Correction needed** — Admin menu permission function defined but not called. MANAGER cannot access |
| **S2-02** | Breadcrumb 3 levels (`Project / Name / Area`) | Screen 2 section 2.2 B. | Working |
| **S2-02-01** | Project description collapse state preserved | Screen 2 section 2.2 B. project description | Working |
| **S2-02-02** | Breadcrumb last crumb is area name | Screen 2 section 6 F2 | Working |
| **S2-03** | 8 area navigation single definition | Screen 2 sections 2.3·2.4 C·D | Working |
| **S2-03-01** | Horizontal tabs render (on layout selection) | Screen 2 section 2.3 C. | Working |
| **S2-03-02** | Sidebar render (on layout selection) | Screen 2 section 2.4 D. | Working |
| **S2-03-03** | Area number position-based (not fixed) | Screen 2 section 4 layout rules B2 | Working |
| **S2-04** | Count badges 3 items (cases · plans · execution) | Screen 2 section 2.3 C. table | Working |
| **S2-04-01** | Badge numbers from context list length | Screen 2 section 4 layout rules B4 | Working |
| **S2-05** | Horizontal tabs ↔ sidebar selectable | Screen 2 section 3.2 layout selection | Working |
| **S2-05-01** | Layout selection 2 locations | Screen 2 section 3.2 table | Working |
| **S2-05-02** | Layout selection saved server-side (per user) | Screen 2 section 5 G1 | Working |
| **S2-06** | Sidebar collapse possible | Screen 2 section 2.4 D. | Working |
| **S2-06-01** | Collapse state browser storage preserved | Screen 2 section 6 R5 | Working |
| **S2-07** | Project switch (dropdown · list page) | Screen 2 section 3.3 project switch | Working |
| **S2-07-01** | Project selector (sidebar mode only) | Screen 2 section 2.5 E. | Working |
| **S2-07-02** | Selecting same project again does nothing | Screen 2 section 6 F3 | Working |
| **S2-08** | Profile dialog 7 tabs | Screen 2 section 2.7 G. | Working |
| **S2-08-01** | API token shows full value 1x after issue | Screen 2 section 2.7 G. API token rule G7 | Working |
| **S2-08-02** | Language · timezone immediate/save branch | Screen 2 section 3.4 profile dialog table | Working |
| **S2-09** | Bookmark collections · notes | Screen 2 section 2.8 H. | Working |
| **S2-09-01** | Default collection (Favorites) non-deletable | Screen 2 section 2.8 H. manual 4-7 | Working |
| **S2-09-02** | Bookmarks are personal assets | Screen 2 section 2.8 H. final paragraph | Working |
| **S2-10** | Dark mode · design system | Screen 2 section 2.1 A. dark mode | Working |
| **S2-10-01** | Theme settings saved (per user server-side) | Screen 2 section 3.4 profile dialog | Working |
| **S2-11** | Project description collapse state per-project persistence | Screen 2 section 3.2 collapse | Working |

---

## 2. Non-functional requirements

| # | Area | Requirement | Status |
|---|---|---|---|
| **S2-N1** | Header height | Exactly 64px (`minHeight: "64px !important"`) | Working |
| **S2-N2** | i18n text | All header · menu · dialog text in `t("key", "fallback")` format. No hardcoded Korean | Working |
| **S2-N3** | Display performance | Count badges recalculated only when cases · plans · execution lists change | Working |
| **S2-N4** | Permission check consistency | Header admin menu system-admin-only, content area editability per project permission | Working |
| **S2-N5** | Browser compatibility | Same layout · same behavior across major browsers | Working |

---

## 3. Corrections needed

| ID | Item | Issue | Solution | Priority |
|---|---|---|---|---|
| **S2-01-03** | Admin menu permission conflict | Admin menu permission function defined (ADMIN \| MANAGER) vs actual exposure (ADMIN only) | Add admin menu permission check or remove function + clean comments | P2 |

---

## 4. Needs verification

| ID | Item | Question | Verification method |
|---|---|---|---|
| **V-S2-01** | Admin menu permission confirm | Should `MANAGER` role access admin menu, or ADMIN-only | Header condition review |
| **V-S2-02** | Badge inaccuracy (pagination) | If list loads paginated, badge count may differ from total. Is this known limitation or needs fixing | Operations review and user feedback |

---

## 5. Backend features not on screen

The following APIs are not called directly by S2 but are used by content screens (S3~S10).

| Endpoint | Role | Caller |
|---|---|---|
| `GET /api/testcases/project/{projectId}` | Test case list | S4 Test Cases |
| `GET /api/testplans/project/{projectId}` | Test plan list | S5 Test Plans |
| `GET /api/executions/project/{projectId}` | Test execution list | S6 Test Execution |
| `GET /api/results/project/{projectId}` | Test results | S7 Test Results |
| `GET /api/automation-results/project/{projectId}` | Automation results | S8 Automated Tests |

---

## 6. Maintenance handover

### 6.1 Four places to modify when adding/removing areas

When area list changes, modify all four (see Workflow section 3.1):

1. Area list definition
2. Content selection rules
3. Rules for parsing area from address
4. Rules for generating address from area

### 6.2 When RAG · Exploration conditions change

When RAG availability or `showExploratorySessionTab` changes:

- Number of visible areas changes, following items shift
- Upper-bound correction calculation needed
- If user tries to open hidden tab from old address, need path reset

### 6.3 When permission policy changes

Modify the permission master in `00_Overview_Workflow.md` section 5 first. Then:

- Update header exposure conditions
- Update each content screen's permission differences

---

## 7. Reference data

As of (2026-08-03):

| Item | Value | Note |
|---|---|---|
| Area count | 8 | 6 base + 2 conditional (RAG, exploration) |
| Badge items | 3 | Cases, plans, execution |
| Profile tabs | 7 | Basic info, password, language, JIRA, Sheets, API, theme |
| Bookmark collections | Unlimited (default 1) | Users can create more. Default collection non-deletable |
| Header tools | 10 | Logo, version, dashboard, admin, project, JIRA, manual, layout, dark mode, avatar |

---

## 8. Change log

| Date | File | Change | Reference |
|---|---|---|---|
| 2026-08-03 | New creation | 3 files created (Screen·Components·Requirements) | Workflow as master, establish screen definition·components·requirement tracing |
