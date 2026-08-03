# Administrator Settings(S11) Components

> Screen ID **S11** · Parent document: [`EN-S11-Screen.md`](EN-S11-Screen.md)

---

## 1. UI Component Hierarchy

The administrator settings comprise six independent sub-screens. Each sub-screen loads dynamically only when needed.

**Sub-screen list**:
- Organizations (`/organizations`): organization list and detail screens
- Users (`/users`)
- Mail Settings (`/mail-settings`)
- LLM Settings (`/llm-config`)
- Scheduler (`/scheduler`)
- Translation Management (`/translation-management`)

---

## 2. State Management per Sub-Screen

### 2.1 Organizations

| Screen role | Display state | Interaction state | Data state |
|---|---|---|---|
| **Organization list** | Render organization cards or table | Item select → navigate to detail | Data loading/complete/failed |
| **Organization detail** | Display info, members, groups 3 tabs | Tab switch, info edit, member invite | Detail data loading/complete/failed |

### 2.2 Users

| Function | Display state | Interaction state | Data state |
|---|---|---|---|
| **List view** | Display stat cards (4) + table | Search/filter input, row select | List loading/complete/failed, page move |
| **Individual action** | Show row right menu (`⋮`) | Menu item select (change role, deactivate, etc.) | Change loading/complete/failed |

### 2.3 Mail Settings

| Function | Display state | Interaction state | Data state |
|---|---|---|---|
| **Settings form** | Show SMTP, sender, template fields | Edit input fields | Save loading/complete/failed |
| **Test** | Show test send button | Button click to send mail | Send loading/complete/failed |

### 2.4 LLM Settings

| Function | Display state | Interaction state | Data state |
|---|---|---|---|
| **Provider list** | Render cards or table | Click item → expand detail | List loading/complete/failed |
| **Detail form** | Show API Key, Base URL, model fields | Edit input, toggle enabled | Save loading/complete/failed |

### 2.5 Scheduler

| Function | Display state | Interaction state | Data state |
|---|---|---|---|
| **Job list** | Show name, Cron, last execution, status | Row click → expand detail | List loading/complete/failed |
| **Detail control** | Show Cron input, execution history | Edit Cron, run-now button | Save/run loading/complete/failed |

### 2.6 Translation Management

| Function | Display state | Interaction state | Data state |
|---|---|---|---|
| **Key-value tab** | Show categorized translation fields | Edit language input fields | Save loading/complete/failed |
| **Stats tab** | Show completion (%), missing count per language | — | Stats loading/complete/failed |

---

## 3. Data Loading

### 3.1 Initial Load (on each screen entry)

| Screen | Endpoint | Timing | Caching |
|---|---|---|---|
| Organizations list | `GET /api/organizations` | `useEffect` on entry | Memory (within session) |
| Users list | `GET /api/admin/users?page=0&size=20` | `useEffect` on entry | Per-page |
| Mail settings | `GET /api/admin/mail-settings` | On entry | None (query every time) |
| LLM settings | `GET /api/llm-config` | On entry | Memory |
| Scheduler | `GET /api/admin/scheduler/configs` | On entry | None (auto-refresh estimated) |
| Translation management | `GET /api/admin/translations/{languageCode}` | On language tab switch | Per-language |

### 3.2 Failure Handling

| Situation | Behavior |
|---|---|
| Query failure | `Alert severity="error"` + show previous cache (if any) |
| Save failure | Error alert in dialog/form + preserve input |
| Network loss | Retry button or auto-poll (varies by screen) |

---

## 4. API Contract

### 4.1 Organizations

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/organizations` | List organizations | System ADMIN | `List<Organization>` |
| `GET /api/organizations/{id}` | Organization detail | System ADMIN | `Organization` + members + groups |
| `POST /api/organizations` | Create organization | System ADMIN | `Organization` |
| `PUT /api/organizations/{id}` | Edit organization | System ADMIN | `Organization` |
| `DELETE /api/organizations/{id}` | Delete organization | System ADMIN | `{message}` |
| `POST /api/organizations/{id}/members` | Invite member | System ADMIN | `OrganizationUser` |
| `PUT /api/organizations/{id}/members/{userId}/role` | Change member role | System ADMIN | `OrganizationUser` |
| `DELETE /api/organizations/{id}/members/{userId}` | Remove member | System ADMIN | `{message}` |

### 4.2 Users

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/admin/users?page=N&size=M` | List users (paginated) | System ADMIN | `Page<User>` |
| `GET /api/admin/users?search=` | Search users | System ADMIN | `List<User>` |
| `GET /api/admin/users/{userId}` | User detail | System ADMIN | `User` |
| `PUT /api/admin/users/{userId}/role` | Change role (ADMIN/MANAGER/null) | System ADMIN | `User` |
| `PUT /api/admin/users/{userId}/password` | Reset password | System ADMIN | `{tempPassword}` |
| `PUT /api/admin/users/{userId}/status` | Enable/disable | System ADMIN | `User` |

### 4.3 Mail Settings

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/admin/mail-settings` | Get mail settings | System ADMIN | `MailSettings` |
| `PUT /api/admin/mail-settings` | Save mail settings | System ADMIN | `MailSettings` |
| `POST /api/admin/mail-settings/test` | Send test mail | System ADMIN | `{status, message}` |

### 4.4 LLM Settings

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/llm-config` | List LLM settings | System ADMIN | `List<LlmConfig>` |
| `POST /api/llm-config` | Add provider | System ADMIN | `LlmConfig` |
| `PUT /api/llm-config/{id}` | Edit provider | System ADMIN | `LlmConfig` |
| `DELETE /api/llm-config/{id}` | Delete provider | System ADMIN | `{message}` |
| `GET /api/llm-template` | List templates | System ADMIN | `List<LlmTemplate>` |
| `PUT /api/llm-template/{id}` | Edit template | System ADMIN | `LlmTemplate` |

### 4.5 Scheduler

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/admin/scheduler/configs` | List jobs | ⚠ Permission undefined | `List<SchedulerConfig>` |
| `GET /api/admin/scheduler/configs/{taskKey}` | Job detail | ⚠ Permission undefined | `SchedulerConfig` |
| `PUT /api/admin/scheduler/{jobId}` | Edit Cron | System ADMIN | `SchedulerConfig` |
| `PUT /api/admin/scheduler/{jobId}/status` | Enable/pause | System ADMIN | `SchedulerConfig` |
| `POST /api/admin/scheduler/{jobId}/trigger` | Manual run | System ADMIN | `{status, executionId}` |

### 4.6 Translation Management

| Method, path | Role | Permission | Response |
|---|---|---|---|
| `GET /api/admin/translations/languages` | List supported languages | System ADMIN | `List<Language>` |
| `GET /api/admin/translations/{languageCode}` | Get translations per language | System ADMIN | `List<TranslationKey>` |
| `PUT /api/admin/translations/{languageCode}` | Save translations | System ADMIN | `{message}` |
| `POST /api/admin/translations/language` | Add language | System ADMIN | `Language` |
| `GET /api/admin/translations/statistics` | Completion stats | System ADMIN | `Map<Language, {completionPercent}>` |
| `POST /api/admin/translations/export` | Export CSV | System ADMIN | File download |
| `POST /api/admin/translations/import` | Import CSV | System ADMIN | `{imported, skipped}` |

### Unused Endpoints on Screen

| Function | Endpoint | Reason |
|---|---|---|
| Audit log query | `GET /api/audit-logs` | Screen does not display audit logs |
| User activity log | `GET /api/admin/activities` | Screen does not display user activity logs |
| Global system settings | `GET /api/admin/system-settings` | Screen does not display global system settings |

---

## 5. Render Rules

| # | Rule | Reference |
|---|---|---|
| R1 | **Show only progress during query** | Do not render form until data received |
| R2 | **Organization and user tables load on screen entry** | Keep first screen light |
| R3 | **Keep only one expand state at a time; height grows smoothly** | Slide transition |
| R4 | **Place error alert at top; preserve input** | User can edit and retry |
| R5 | **Replace button with progress indicator while saving** | Prevent double submit |
| R6 | **Apply search and filter real-time** (`onChangeCapture`) | List updates as user types |
| R7 | **Table pagination defaults to 20 rows; adjustable** | Performance vs. scroll load balance |
| R8 | **Users without permission see 404 or permission error** | Server `canAccessPage` check |

---

## 6. Test Links

| Target | Method | Tools |
|---|---|---|
| Organization list drill-down | Click organization card → navigate to detail | E2E |
| User search performance | Type in search field → show results within 250ms | E2E + perf |
| Mail test send | Click test mail button → verify server response | Unit |
| LLM provider activation | Save provider → requery list | E2E |
| Scheduler manual run | Click run-now button → verify success response | E2E |
| Translation completion stats | Show completion % per language on stats tab | Unit |

---

## 7. Maintenance Notes

1. **When adding sub-screens**: Update section 1 (UI hierarchy), section 2 (state management), section 4 (API contract).
2. **When adding permissions**: Update 01 section 5, 02 section 5, and 03 section 2.
3. **When API response format differs** (List vs. Page vs. Map): Verify client data types and clarify API contract.
4. **When new elements added to screen**: Update state management table in section 2 for that sub-screen.
5. **When adding test scenarios**: Add row to section 6 test links.
