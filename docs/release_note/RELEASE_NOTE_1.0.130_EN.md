# Release Note - v1.0.130

## [1.0.130] - 2026-10-19

Written: 2026-10-19 23:58 KST
Last updated: 2026-10-20 00:05 KST

Force-deleting a project that contains requirements no longer fails with `409 DATA_CONFLICT`. Database tables and columns now carry descriptions (`COMMENT`), and a Korean/English data dictionary is included.

### Highlights

#### Force delete now removes all project data

Force delete (`DELETE /api/projects/{id}?force=true`) kept its own list of tables to clear, and tables added by later features were missing from it. The missing tables caused two kinds of problems.

| Symptom | Data |
|---|---|
| Delete failed with 409 | requirements and requirement documents, exploratory sessions and charters, bookmarks, groups, RAG categories, test case attachments and display ID history, result edit history |
| Delete succeeded but rows were left behind | JUnit results, requirement links and relations, test case versions, move audit logs, agent links |

From this release all of the above is removed before the project itself. Data in other projects is not touched.

**Impact:** projects that could not be deleted because they contained requirements can now be deleted from the UI or the API. Force delete cannot be undone, so double-check the project before deleting it.

#### Database tables and columns now have descriptions

Until now no table or column in the database had a description. From this release all 68 tables and 650 columns carry a Korean description following ISO/IEC 11179. Database tools show it as `name: definition`, and columns that store codes also list the allowed values.

| File | Contents |
|---|---|
| `db/comments/data-dictionary.csv` | One row per table or column, with Korean and English names, definitions, and value domains in separate columns |
| `db/comments/db-comments.sql` | 718 `COMMENT ON` statements for existing databases |
| `docs/database/DB_COMMENT_CONVENTION.md` | Writing rules for descriptions |

On startup the server compares the current descriptions with the SQL above and applies only those that differ. Redeploying an existing database with this version fills in the descriptions; there is no SQL to run by hand. If applying fails, the server logs a warning and starts normally.

**Impact:** only descriptions change; data and schema are untouched. To turn off the startup sync, set `app.db-comments.sync.enabled=false`.

### Upgrading

- No database changes or scripts to run.
- No changes to environment variables or configuration files.
- Leftover rows (JUnit results and so on) from projects force-deleted on earlier versions are not cleaned up by this release.

### Verification

- Backend tests were rerun on dev with both changes: 109 classes, 807 tests, 0 failures or errors.
- A new test reads the database foreign keys and checks that every table linked to a project is in the delete list. It failed on the code before the fix. If a new project-owned table is added without updating the list, this test fails.
- The description sync was run against two real PostgreSQL databases: the first run updated 16 items and a second run updated none. It was not checked as part of an actual server startup.
- The 718 Korean and English descriptions were checked by sampling and rule checks, not read line by line.
- Deleting a project with requirements through the UI on a live server was not tried.
