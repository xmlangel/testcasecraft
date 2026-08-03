# Administrator Settings(S11) Workflow

> Screen ID **S11** · Screens: **Organizations · Users · Mail · LLM · Scheduler · Translation Management**
> Routes: `/organizations` · `/users` · `/mail-settings` · `/llm-config` · `/scheduler` · `/translation-management`

---

## 1. Workflow Purpose

The administrator settings manage organizations and system-wide configuration. User accounts, infrastructure settings, and backend job schedules are determined in these screens, and changes affect all projects. S11 has the most restricted access, limited to system `ADMIN` role.

| Purpose | Content | Reference |
|---|---|---|
| ① **Organization hierarchy** | Group projects by organization; manage groups and member roles within each organization | `/organizations` route manual section 17-3 |
| ② **All users** | View all system accounts; control roles and status | `/users` route manual section 17-4 |
| ③ **Mail system** | Define SMTP account, sender, and templates for authentication, notifications, and result emails | `/mail-settings` route manual section 17-5 |
| ④ **LLM provider** | Define LLM integration and prompts for RAG chat and automated metadata generation | `/llm-config` route manual section 17-6 |
| ⑤ **Background jobs** | Control scheduled jobs with Cron interval, manual trigger, and pause/resume | `/scheduler` route manual section 17-7 |
| ⑥ **Translation management** | Edit UI key-value pairs dynamically to expand multilingual support | `/translation-management` route manual section 17-8 |

**What this screen does not cover**

| Not here | Where it belongs |
|---|---|
| Project-level settings (member invite, roles, folder rules) | S1 card menu or S2 header project menu (section 7) |
| Enterprise dashboard view | S3 system dashboard (`/dashboard`, auto-updated per screen rules G8) |

---

## 2. Screen Location

### 2.1 Entry Point

The **[Admin Menu ▾]** button appears in the header only when the user has system `ADMIN` or `MANAGER` role.

| Item | Content | Reference |
|---|---|---|
| From | S2 workspace (all screens) S1 project list | Header `[Admin Menu ▾]` dropdown |
| Entry condition | System `ADMIN` `MANAGER` **Translation management: direct URL entry only** (section 2.3) | |
| Always available | Header `[Admin Menu ▾]` (after login, from any project screen) | |

⚠ **Not implemented.** The admin menu currently allows only system administrators (ADMIN). Support for manager role is not yet implemented.

### 2.2 Admin Menu Dropdown

| Item | Path | Visible |
|---|---|---|
| **Organizations** | `/organizations` | ○ |
| **Users** | `/users` | ○ |
| **Mail Settings** | `/mail-settings` | ○ |
| **LLM Settings** | `/llm-config` | ○ |
| **Scheduler** | `/scheduler` | ○ |
| **Translation Management** | `/translation-management` | **× Commented out** |

**Six menu items are defined, but translation management is accessible only by direct URL.**

### 2.3 Translation Management Access

| Method | Route |
|---|---|
| Dropdown menu | **× Not available** |
| Direct entry | `http://.../#/translation-management` |

Users must enter the URL manually or use a bookmark to access this screen. It is opened only when languages need to be added or keys edited (manual section 17-8).

---

## 3. Workflow Process

### 3.1 Organization Management

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Enter `/organizations` | Retrieve organization list | Render cards or table |
| 2 | Click organization card | Navigate to detail screen (`/organizations/{orgId}`) | Display organization info, members, groups |
| 3 | Edit on detail screen | Edit name, description, logo, etc. | Call `PUT /api/organizations/{orgId}` |
| 4 | Invite on members tab | Set email and role (OWNER/ADMIN/MEMBER) and add | Send invitation email via `POST /api/organizations/{orgId}/members` |
| 5 | Permission matrix on groups tab | Specify function permissions (edit/view/execute) per group | Reflected in project permission decisions |

### 3.2 User Management

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | Enter `/users` | Query user list; display stat cards (total/active/inactive/recent) | |
| 2 | Search and filter | Narrow by name, email, role (ADMIN/PM/tester/general), status (active/inactive) | — |
| 3 | Row right action | `👁 View details` / `⋮ Reset password / Change role / Toggle active·inactive` | — |
| 4 | Reset password | Generate temporary password and email to user | Depends on mail settings |
| 5 | Change role | Cycle through `ADMIN` ↔ `MANAGER` ↔ null (general user) | `PUT /api/admin/users/{userId}/role` |
| 6 | Toggle active/inactive | Disable account → user cannot log in | `PUT /api/admin/users/{userId}/status` |

### 3.3 Mail Settings

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | Enter `/mail-settings` | Display SMTP, sender, template forms | |
| 2 | Enter SMTP settings | Enter host, port, account, password | — |
| 3 | Enter sender settings | Enter email and display name | — |
| 4 | Select and edit template | Customize `From`/`Subject`/`Body` for each type (email verification, password reset, execution result, etc.) | — |
| 5 | Send test mail | Send test email to recipient with entered settings | `POST /api/admin/mail-settings/test` |
| 6 | Save | `PUT /api/admin/mail-settings` | — |

### 3.4 LLM Settings

| # | Action | Behavior |
|---|---|---|
| 1 | Enter `/llm-config` | Display LLM provider list (OpenAI/Anthropic/Azure/local) |
| 2 | Select and create provider | Choose provider type, enter API Key and Base URL |
| 3 | Define model name | Enter model name for the selected provider (e.g., `gpt-4`) |
| 4 | Manage prompt template | Define system prompt, examples, token limit |
| 5 | Save | `PUT /api/llm-config/{id}` |

### 3.5 Scheduler Management

| # | Action | Behavior | Reference |
|---|---|---|---|
| 1 | Enter `/scheduler` | Display registered background jobs list (JIRA sync, RAG indexing, token cleanup, etc.) | |
| 2 | Select job | View name, Cron expression, last execution time/result | — |
| 3 | Edit Cron | Change interval (e.g., `0 0 * * *` (daily midnight) → `0 */6 * * *` (every 6 hours)) | `PUT /api/admin/scheduler/{jobId}` |
| 4 | Trigger manually | Click `[Run now]` button to execute immediately without waiting | `POST /api/admin/scheduler/{jobId}/trigger` |
| 5 | Pause and resume | Disable or re-enable job | `PUT /api/admin/scheduler/{jobId}/status` |

### 3.6 Translation Management

| # | Action | Behavior |
|---|---|---|
| 1 | Enter `/translation-management` | Display translation key-value list by language in tabs (Korean/English/additional) |
| 2 | Completion stats tab | Show how many keys lack translation per language |
| 3 | Edit key-value | Edit multilingual values for a key in one place |
| 4 | Register new language | Add language code to support |
| 5 | Save | `PUT /api/admin/translations/{languageCode}` |

---

## 4. Operational Model Rules

| # | Rule | Content | Reference |
|---|---|---|---|
| O1 | **Organization is a project grouping unit** | All projects in one organization share members, groups, settings. Standalone projects without organization are also first-class concepts | Manual section 17-3 Overview section 7 model |
| O2 | **System roles are three values: ADMIN/MANAGER/null** | ADMIN has full access; MANAGER can access admin menu only (enterprise dashboard is ADMIN-only); null applies project permissions only | Overview section 5.1 |
| O3 | **Organization roles are three values: OWNER/ADMIN/MEMBER** | Used only on organization detail screen; do not affect project data access | Overview section 5.3 |
| O4 | **Mail settings are system-wide, not per-organization or per-project** | Single global sender and templates; changes affect all emails | Manual section 17-5 |
| O5 | **Multiple LLM providers can be registered** | Provider-specific API Key, model, prompt; multiple providers possible; each project selects default provider (estimated) | Manual section 17-6 |
| O6 | **Scheduler controls only backend-registered jobs** | No form to add new jobs; only manages interval and activation of existing ones | Manual section 17-7 |
| O7 | **Translation keys are created in code; values entered here only** | No form to add keys; all `t("key", "fallback")` calls in UI become key generation candidates | Manual section 17-8 Overview rule G10 |

---

## 5. Users and Permissions

### 5.1 Function × Role (System Level)

Entering S11 requires system `ADMIN` role. The six sub-screens have the same permission (system admin check applies uniformly).

| Function | System ADMIN | System MANAGER | Other |
|---|---|---|---|
| S11 entry (`/organizations` etc.) | ○ | ❌(some possible) | ❌ |
| Organization view/edit/member manage | ○ | ⚠ **Needs verification** | ❌ |
| User list view/role change/deactivate | ○ | ⚠ Needs verification | ❌ |
| Mail settings change | ○ | ⚠ Needs verification | ❌ |
| LLM provider settings | ○ | ⚠ Needs verification | ❌ |
| Scheduler control | ○ | ⚠ Needs verification | ❌ |
| Translation edit | ○ | ⚠ Needs verification | ❌ |

⚠ **MANAGER role is not yet implemented.** Currently only system administrators (ADMIN) have access to all functions. To enable manager access to some functions (organization and user view, mail settings, etc.), permission checks must be added to each controller.

### 5.2 Permission Elements per Sub-Screen

| Sub-screen | Purpose | Required permission | Note |
|---|---|---|---|
| Organizations | Add, edit, invite members | System ADMIN | Organization unit is independent of project roles |
| Users | Control account roles and status | System ADMIN | Cannot change individual project roles here |
| Mail settings | Customize SMTP, sender, templates | System ADMIN | Changes affect all system emails |
| LLM settings | Define provider, model, prompt | System ADMIN | Project selection is in S1/S2 (unconfirmed) |
| Scheduler | Control job interval, activation, manual run | System ADMIN | Can only manage jobs registered in backend code |
| Translation management | Enter multilingual UI values | System ADMIN | Accessible only by direct URL (not in menu) |

---

## 6. Functional Rules

| # | Rule | Reference |
|---|---|---|
| F1 | **Organization member invites happen by email only** | Mail settings must be completed for invitation emails to be sent |
| F2 | **User list search is real-time** | Filters apply while typing; pagination recalculates | |
| F3 | **Scheduler jobs are added in code only** | No form to add jobs on screen; only subsequent changes are possible |
| F4 | **Translation keys are incremental** | When new `t` call appears in UI, empty translation row auto-generates (estimated) |
| F5 | **Multiple LLM providers can be registered** | Providers have different API Keys, models, prompts; default per-project selection (needs verification) |

---

## 7. Cross-Screen Integration

| Integration target | Content | Reference |
|---|---|---|
| **S0 Login** | User account creation/deactivation affects login availability | User management |
| **S1 Projects** | Organization membership is determined here; organization members become project permission candidates | Organizations management project creation |
| **S2 Header** | Project menu (`/projects/{id}/settings`) — project-level settings belong to S2, not S11 | Visible if user is `PROJECT_MANAGER` |
| **S3 System Dashboard** | Enterprise stats may depend on LLM, mail, scheduler settings | `/dashboard` (ADMIN-only) |
| **All screens S4–S10** | User roles, mail sending, RAG (LLM), automation schedules operate with settings defined here | Permission, mail, LLM, scheduler settings dependency |
| **S9 RAG Documents** | Provider and model selected in LLM settings are used for embedding and chat | `/projects/{id}/rag` dependency |

---

## 8. Assumptions and Constraints

| # | Assumption or constraint | Impact | Needs verification |
|---|---|---|---|
| **P1** | **Mail misconfiguration prevents member invitation emails** | High | What happens if SMTP is unconfigured when trying to invite members? |
| **P2** | **MANAGER role actual access scope is unclear** | High | ✓ Correction needed section 8 |
| **P3** | **System initial admin account is fixed** | High | `admin / admin123` (must change post-deployment; manual section 17) |
| **P4** | **Scheduler has no form to add new jobs** | Medium | What if new background work is needed after deployment? |
| **P5** | **Translation keys require only value input without code change** | Medium | Multilingual UI support can expand dynamically |
| **P6** | **Organization projects and standalone projects coexist** | Medium | S1 has separate org/standalone tabs; needs confirmation here too |
| **P7** | **Adding LLM provider without project selection means it is unused** | Low | Project default LLM selection path needs confirmation |

---

## 9. Requirement ↔ Section Mapping

Documents 01 02 03 04 are written first; this section maps them.
Track functional requirements (S11-01~), non-functional (S11-N1~), corrections (C-1~), and verifications (V-S11~).
