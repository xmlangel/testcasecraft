# Release Note - v1.0.135

## [1.0.135] - 2026-10-29

Written: 2026-10-29 20:47 KST

This release bundles PR #204, merged into `dev` after 1.0.134. Swagger is enabled again on production servers, and the API specification is now restricted to system administrators. It also fixes a startup failure when the server runs on the embedded H2 database.

### Highlights

#### Swagger is available on production again

Up to 1.0.134 the production profile disabled both the Swagger UI and the API specification. From this release the Swagger UI (`/swagger-ui.html`) opens on production as well.

- The Swagger UI and its configuration (`/api-docs/swagger-config`) are public. Neither contains the API structure.
- The API specification the UI loads (`/api-docs`) is returned only to system administrators (`ADMIN`). Anonymous requests get 401 or 403; regular users get 403.
- The Swagger UI automatically attaches the `accessToken` stored when you signed in to the app in the same browser. Sign in to the app as an administrator, then open the Swagger UI to see the specification.
- If you are not signed in or not an administrator, the UI shows "Failed to load API definition".

#### Startup no longer fails on a non-PostgreSQL database

At startup, a check of the LLM provider constraints calls a PostgreSQL-only function. On other databases such as H2 the call failed, and although the failure was meant to be ignored, the transaction was left marked rollback-only, so startup failed anyway.

- The check is skipped when the database is not PostgreSQL.
- A failed check no longer stops startup. On production PostgreSQL the server now starts even if the check query fails, for example because of missing privileges.

#### Code formatting cleanup

google-java-format was applied to 128 Java files in the repository. Only whitespace and line breaks changed; behavior is unchanged. The pre-commit hook checks the whole repository, so without this cleanup any commit failed the hook regardless of which files it touched.

### Upgrade notes

- The Swagger rules apply to local and development servers as well as production. Scripts or tools that fetched `/api-docs` without signing in must now send an administrator token.
- No database schema changes.

### Verification

- On the last commit of the PR #204 branch (`b7d39b15`), all 943 backend tests passed. The 9 `JiraSmartRedirectIntegrationTest` failures listed in the 1.0.134 notes are resolved by this fix.
- The Swagger access rules are covered by 5 integration tests: anonymous, regular user, administrator, public UI configuration, and automatic token attachment.
- For the formatting commit, the content with whitespace, comment line breaks, and long-string splits removed matches the original, and the import sets are unchanged.
- Opening the Swagger UI as an administrator on a deployed production server has not been checked yet.

### Known issues

- The issues listed in 1.0.134 (step results missing from result edit history, no step pass-rate statistics or per-step attachments, and so on) are not fixed in this release.
