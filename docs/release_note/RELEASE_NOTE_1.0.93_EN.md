# Release Note - v1.0.93

## [1.0.93] - 2026-07-02

Hello! v1.0.93 introduces **moving and copying test cases across projects** and significantly **hardens authorization (access-control) security**. It also cleans up the internationalization (i18n) strings across the app and improves the readability of test-result reports.

### Highlights

#### 📦 Move / copy test cases across projects (New)

* You can now **move or copy** a test case (or folder) from the tree **to another project**, and the **test results move/copy along with it**.
* Beyond the backend and the frontend tree UI, the same operations are available as **MCP tools (`testcase_move_to_project`, `testcase_copy_to_project`)**.
* Structural issues found during move/copy were fixed as well — Select-All now includes folders (prevents structure flattening), items are **inserted at the end** of the target folder/root (fixes a mid-insert bug), and folder structure is no longer flattened when input arrives child-first.

#### 🔒 Authorization (access-control) hardening (Fix)

* **Blocked unauthenticated scheduler-setting changes (CRITICAL)**: closed a path that allowed changing scheduler settings without authentication.
* **Per-project authorization added**: TestCase/TestPlan/TestExecution CRUD and RAG document analysis/embedding/deletion now verify project membership, so resources in other projects cannot be accessed.
* **RBAC hardening + integration tests**: tightened role-based access control and added authorization integration tests.
* **User-friendly 403 messages**: permission errors now show a clear, understandable message.

#### 🌐 i18n cleanup (Improvement)

* **Wrapped remaining hardcoded Korean strings** at the component and utility levels with `t()` and reinforced the KO/EN seeds (including 36 utility-message keys).
* **Removed 719 unused translation keys** to tidy up the translation seeds.

#### 🗑️ Delete button on the test-case form (New / Improved)

* Added a **Delete** button directly on the individual test-case editing form.
* Unified the delete confirmation to use the **same dialog as the tree delete** — instead of the browser's native popup (`window.confirm`), it now shows the target item (ID/name) in a table and surfaces backend authorization errors (e.g. 403) as-is, for consistent behavior.

#### 📊 Test-result report improvements (Improvement)

* Added **Failed/Passed/Blocked classification chips** to test results and **color-coded each verdict** in the HTML/PDF reports for at-a-glance readability.

### Upgrade Notes

* No DB migration — applies by swapping the image.
* For the step-editor improvements and large-scale refactoring in 1.0.92, see [RELEASE_NOTE_1.0.92_EN.md](RELEASE_NOTE_1.0.92_EN.md).
