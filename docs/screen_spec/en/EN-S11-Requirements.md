# Administrator Settings(S11) Requirement Coverage

> Screen ID **S11** · Reference documents: [`EN-S11-Workflow.md`](EN-S11-Workflow.md) · [`EN-S11-Screen.md`](EN-S11-Screen.md) · [`EN-S11-Components.md`](EN-S11-Components.md)
> Baseline version **v1.0.102**
> Status notation and reference conventions: [`../EN-Index.md`](../EN-Index.md) section 4.

---

## 1. Functional Requirements

### 1.1 Organizations (S11-01~09)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-01** | List organizations as cards showing project and member counts | 02 area B (list) | Organization list query | Working |
| **S11-02** | Click organization card to enter detail screen | 02 area A, B (detail) | Detail screen routing | Working |
| **S11-03** | Switch three tabs on organization detail: info, members, groups | 02 area C, D | Tab switching | Working |
| **S11-04** | Invite users and assign roles on members tab | 02 area C | Member invite mail dependency | Working |
| **S11-05** | Edit permission matrix on groups tab (rows: functions, columns: roles) | 02 area D | Permission matrix editing | Working |
| **S11-06** | Edit organization (name, description, logo) | 02 area D (settings tab) | Organization info save | Working |
| **S11-07** | Delete organization | 02 area D (settings tab) | Organization deletion | Working |
| **S11-08** | Create organization dialog | 02 area A (`[Create organization]` button) | Organization creation | Working |
| **S11-09** | Back button on detail screen returns to list | 02 area A (detail) | Back button behavior | Working |

### 1.2 Users (S11-10~15)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-10** | Query user list and display four stat cards (total/active/inactive/recent signup) | 02 area A | User list query | Working |
| **S11-11** | Search (name, email, username) and filter (role/status) | 02 area B | Real-time search and filter | Working |
| **S11-12** | Row action menu `⋮` on each user row | 02 area D | Row action menu display | Working |
| **S11-13** | Reset password by sending temporary password via mail | 02 area D (menu) | Password reset mail dependency | Working |
| **S11-14** | Change role (ADMIN ↔ MANAGER ↔ null) | 02 area D (menu) | Change user role | Working |
| **S11-15** | Toggle active/inactive status | 02 area D (menu) | User account status control | Working |

### 1.3 Mail Settings (S11-16~19)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-16** | Enter and save SMTP settings | 02 area B, E | Save mail settings | Working |
| **S11-17** | Set sender email and display name | 02 area C, E | Sender info settings | Working |
| **S11-18** | Select template and edit `From`/`Subject`/`Body` per type | 02 area D, E | Customize mail templates | Working |
| **S11-19** | Send test mail | 02 area E (`[Send test mail]`) | Test mail send | Working |

### 1.4 LLM Settings (S11-20~25)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-20** | List LLM providers (OpenAI/Anthropic/Azure/local) | 02 area B | List LLM providers | Working |
| **S11-21** | Add provider dialog | 02 area A (`[+ Add LLM provider]`) | Add LLM provider | Working |
| **S11-22** | Enter API Key, Base URL, model name | 02 area C (detail) | Provider info input | Working |
| **S11-23** | Enable/disable toggle | 02 area C (detail) | Provider activation control | Working |
| **S11-24** | Manage prompt template (system, examples, token limit) | 02 area D | Prompt template management | Working |
| **S11-25** | Specify default (RAG use / auto-metadata use) | 02 area E (estimated) | ⚠ Screen implementation unconfirmed | ⚠ Needs verification V-S11-3 |

### 1.5 Scheduler (S11-26~30)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-26** | Display job list table (name, Cron, last run, result, status) | 02 area B | Query scheduled job list | Working |
| **S11-27** | Edit job detail (Cron) | 02 area C (inline) | Job settings editing | Working |
| **S11-28** | Run now (manual trigger) | 02 area D (`[Run now]`) | Manual job execution | Working |
| **S11-29** | Pause/resume toggle | 02 area D (`[Pause]`/`[Resume]`) | Control job active state | Working |
| **S11-30** | Display execution history (last time, result, log) | 02 area B (extra column) | Show job execution history | Working |

### 1.6 Translation Management (S11-31~36)

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-31** | Edit translation key-value per language | 02 area B (tab 1) | Enter and save translation text | Working |
| **S11-32** | Group by category | 02 area B (tab 1) | Category tree navigation | Working |
| **S11-33** | Completion stats (%) and missing key count | 02 area C (tab 2) | Show translation progress | Working |
| **S11-34** | Add new language | 02 area D (`[+ Add language]`) | Expand supported languages | Working |
| **S11-35** | CSV export/import | 02 area D (`[⬇ Export]` / `[⬆ Import]`) | File conversion and merge | Working |
| **S11-36** | Clear cache (apply translations immediately) | 02 area D (`[Clear cache]`) | Refresh translation cache | Working |

---

## 2. Non-Functional and Quality Requirements

| # | Requirement | Implemented where | Reference | Status |
|---|---|---|---|---|
| **S11-N1** | Destructive action (delete) confirmation dialog shows target name | Each screen delete dialog | Overview rule G5 | Working |
| **S11-N2** | Replace button with progress and lock cancel/confirm while saving/deleting | Each screen form and dialog | — | Working |
| **S11-N3** | Show only progress during query; do not render form | Each screen initial load | `loading` state | Working |
| **S11-N4** | Reject unauthorized access with 404 or 403 | Each controller `@PreAuthorize` | Overview section 5 | Working |
| **S11-N5** | Wrap UI copy in `t` to support multiple languages | Each component | Overview rule G10 | **Correction needed C-1** |
| **S11-N7** | Display server errors as-is (excluding sensitive info) | Each screen `Alert severity="error"` | — | Working |
| **S11-N8** | Preserve input after error for easy retry | Form state management | — | Working |

---

## 3. Corrections Needed

Four items work but diverge from standards and need correction.

| # | Item | What is inconsistent | Action |
|---|---|---|---|
| **C-1** | Translation keys unspecified | UI text is hardcoded in Korean | Wrap in `t("admin.label.…", "Korean")` and add keys to `i18n/keys.json`. Procedure: use `testcasecraft-i18n-audit` |
| **C-3** | Manager role not implemented | Admin menu defines MANAGER permission but only ADMIN actually has access | Confirm whether manager gets partial functions (view/control) or stays ADMIN-only; then correct |
| **C-4** | Translation management hidden from menu | Route `/translation-management` exists but not exposed in header menu | Confirm whether direct URL-only access is by design or menu should be shown; then correct |

---

## 4. Needs Verification

Four items need verification because screen view alone cannot resolve them.

| # | Item | Why unclear | How to verify |
|---|---|---|---|
| **V-S11-1** | MANAGER role scope | Admin menu permission check defined but not used | Check permission logic and each controller `@PreAuthorize`; verify whether MANAGER truly cannot enter S11 |
| **V-S11-2** | Scheduler API permission | `GET /api/admin/scheduler/configs` and `/configs/{taskKey}` lack permission checks | Check method declarations |
| **V-S11-3** | LLM default selection method | 02 area E does not specify how default is chosen | Open screen and verify whether radio button, toggle, or other control is used |
| **V-S11-4** | Organization role vs. project permission relationship | Does organization role (OWNER/ADMIN/MEMBER) affect project permission decision | Try editing project with organization role user; verify |

---

## 5. Backend Features Not on Screen

| Feature | Nature |
|---|---|
| Audit logs (view by auditor, entity, stats) | Track who did what |
| User activity logs (activity time, IP, device) | Security, anomaly detection |
| System settings (global flags, metadata) | RAG, exploratory session, integration settings |
| RAG maintenance (orphan document cleanup) | Embedding optimization |

---

## 6. Handoff Notes

1. **Resolve V-S11-1~4 by code inspection and update this document accordingly**: Add result row.
2. **Permission tables are in three places**: 01 section 5, 02 section 5, 03 section 2. When V-S11-1 has a final answer, update all three.
3. **When adding new admin screen**: Add section in 01 section 3, area table in 02 section 1.2, tree in 03 section 1, requirement rows in 04 section 1.
4. **When modifying mail, LLM, scheduler, or translation settings**: Update related sections in all three documents (01, 02, 03) together.
