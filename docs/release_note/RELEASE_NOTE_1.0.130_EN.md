# Release Note - v1.0.130

## [1.0.130] - 2026-10-19

Written: 2026-10-19 23:58 KST

Force-deleting a project that contains requirements no longer fails with `409 DATA_CONFLICT`. This release adds no new features.

### Highlights

#### Force delete now removes all project data

Force delete (`DELETE /api/projects/{id}?force=true`) kept its own list of tables to clear, and tables added by later features were missing from it. The missing tables caused two kinds of problems.

| Symptom | Data |
|---|---|
| Delete failed with 409 | requirements and requirement documents, exploratory sessions and charters, bookmarks, groups, RAG categories, test case attachments and display ID history, result edit history |
| Delete succeeded but rows were left behind | JUnit results, requirement links and relations, test case versions, move audit logs, agent links |

From this release all of the above is removed before the project itself. Data in other projects is not touched.

**Impact:** projects that could not be deleted because they contained requirements can now be deleted from the UI or the API. Force delete cannot be undone, so double-check the project before deleting it.

### Upgrading

- No database changes or scripts to run.
- No changes to environment variables or configuration files.
- Leftover rows (JUnit results and so on) from projects force-deleted on earlier versions are not cleaned up by this release.

### Verification

- All 796 backend tests passed.
- A new test reads the database foreign keys and checks that every table linked to a project is in the delete list. It failed on the code before the fix. If a new project-owned table is added without updating the list, this test fails.
- Deleting a project with requirements through the UI on a live server was not tried.
