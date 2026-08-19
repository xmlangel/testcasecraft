# Release Note - v1.0.113

## [1.0.113] - 2026-08-20

Written: 2026-08-20 01:35 KST

Project roles can now be assigned from the UI. Until now the six roles in User Manual 18-4 could only be granted through the API. Authorization was tightened at the same time so that view-only roles really are view-only, and a logged-in user who is not a project member can no longer overwrite someone else's test case.

### Highlights

#### 🔐 New Project Settings screen — per-user role assignment

* **Entry point**: the gear icon at the top right of a project screen, at `/projects/{projectId}/settings`. The gear appears only for project managers, lead developers, and system administrators.
* **General tab**: change the project name, description, and display order. The code cannot be changed after creation. The tab appears only for project managers and system administrators.
* **Members tab**: search for a user to add, change a role from the dropdown, and remove a member. Role changes apply immediately with no save button. The last remaining project manager cannot be demoted or removed.
* **User search**: type two or more characters to match username, name, or email; up to 20 results. Users who already belong to the project and inactive accounts never appear, so a pick never fails as a duplicate. The organization member invite dialog uses the same search.
* **Layout**: the global header, breadcrumb, and left area menu stay in place; only the content area changes.

#### 🛡️ Authorization cleanup — view-only roles are now view-only

* **Endpoints open with authentication alone**: four test case version endpoints (restore, manual create, cleanup) and ten exploratory session write endpoints had no project role check. Version restore overwrites the test case body with that version, so any logged-in user could change a test case in a project they do not belong to.
* **26 endpoints guarded by a read predicate**: `canUploadToProject` was defined as `canAccessProject` (read). JUnit result upload and delete, RAG document upload, delete, and analysis, test case and result attachment upload, and result edit CRUD were all open to view-only roles. These now split between the result-entry permission and the edit permission.
* **Endpoints judged by system role**: twelve exploratory session APIs checked only the system role (ADMIN, MANAGER, TESTER, USER) and ignored the project role. A project viewer who happened to be a system tester could create sessions and change their state.
* **Exploratory session delete**: narrowed from the session-run permission to lead and above. A session is a shared record, so someone who can run one should not be able to delete someone else's.
* **Project settings change**: limited to project managers and system administrators per User Manual 18-4. Lead developers and organization administrators previously passed.

#### 🙈 No permission means no exposure

* **The new layout (left menu) was fully open**: the plan and execution workspace had no role check, so view-only roles saw "Create execution" and the form save buttons. The server blocked the calls with 403, but a user had to click and fail to learn they lacked permission.
* **Spreadsheet input mode**: without edit permission the input mode toggle is not rendered. Only the individual form remains. A user already in spreadsheet mode is returned to the individual form.
* **Wrong judgment axis**: the test plan list hid its buttons by system role, so a project manager could not see them while a project viewer who was a system manager could. It now uses the project role.
* **Tree context menu**: add and delete were gated but rename was not.
* **Test case screen**: add new case, attachment upload, and folder edit entry points are hidden for view-only roles.
* **Automation, RAG, exploratory sessions**: upload, delete, and create entry points follow the same role as their backend guard. This includes the upload button inside the empty-state message of the RAG document list and charter creation in exploratory sessions.
* **Hiding through Tooltip does not work**: a Tooltip renders no DOM of its own and only passes props to its child, so `display:none` applies nowhere. The exploratory session delete button used that approach and stayed visible for view-only roles. It is now conditionally rendered.

#### 🧪 A startup failure

* `data-test.sql` inserted test cases without the optimistic lock column (`version`), so the Display ID migration that runs right after startup failed during flush while updating those rows. That exception broke ApplicationContext loading and two security test classes failed entirely.
* The seed now sets the value, and startup fills `version` with 0 where it is empty. Rows inserted through raw SQL can miss this column anywhere, and when they do the application does not start.

#### 🌱 The local sample set now creates role accounts

* The ShopFlow seed adds `pm`, `lead`, `contributor`, and `viewer`, covering all six project roles. All four keep the system role `TESTER` and differ only in project role. If both axes differ you cannot tell which one blocked a request.
* When an account exists but the password does not match, the seed resets it to the documented value using administrator rights. It previously stopped at "fix it directly in the backend", which left that account unusable.
* `07_verify.py` compares the actual member roles against the account table and names any account that does not match.

#### 🔧 Administrator password change returned 400

* When an administrator changed another user's password with "skip current password verification" checked, the request failed with `유효하지 않은 요청 데이터: [currentPassword] 공백일 수 없습니다`. The request DTO required that field. The self-service path is unaffected because its controller and service each check the field on their own.

### Upgrade notes

* No DB migration scripts. No schema changes.
* On startup, rows in `testcases` with an empty `version` are set to 0. A failure logs a warning and does not block startup.
* 39 new i18n keys (`projectSettings.*` 34, `memberSearch.*` 5), seeded in both Korean and English.
* **Some permissions are narrower.** The following now return 403 where an earlier version allowed them.
  * Project settings change: lead developers and organization admins → project managers and system admins only
  * Exploratory session delete and approve: system testers and managers → lead and above in that project
  * JUnit upload and delete, RAG document changes, attachment upload: project access → result-entry or edit permission
* The API key path for uploading JUnit results was not verified. API key authentication fixes the username to `service-account`, which does not exist in the users table, so it fails project permission checks in earlier versions too. This is not a regression, but how that path actually works needs checking.
* Force-refresh the browser (⌘⇧R / Ctrl+F5) if an old screen is cached.
* For 1.0.112 changes see [RELEASE_NOTE_1.0.112_EN.md](RELEASE_NOTE_1.0.112_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Backend suite | 84 files, 536 tests | Pass (17 failures before) |
| Frontend suite | 78 files, 612 tests | Pass |
| Role authorization, measured | Requests from seven role variants against the running app, seventeen actions | Matches User Manual 18-4 |
| View-only role | Viewer account against sixteen write actions | All 403; only the one read action returned 200 |
| Non-member | Account not added to the project | 403 even on read |
| Role exposure in the UI | Seven roles × six controls, actual visibility rather than DOM presence | Splits at the same line as the server |
| Write buttons for view-only role | Eight screens swept for visible button text | 0 |
| Console errors | Touched screens visited as viewer and manager | 0 page errors (only network errors from the stopped RAG service) |
| Authorization regression guard | Test that fails when a write endpoint is guarded by a read predicate or system role alone | 5 exceptions remain, each with a stated reason |
| Role list regression guard | The three role lists behind authorization compared with the manual, six roles × three tiers | Pass |
| Seed idempotency | Delete accounts and rerun, then rerun twice | 3 created, then reuse only; password repair works |
| Screenshots | Not taken | The manual has no Project Settings image yet |
