# Release Note - v1.0.103

## [1.0.103] - 2026-08-05

Written: 2026-08-05 20:55 KST

QA summaries no longer come out as raw Markdown when you export test results, and long summaries can now be edited one heading at a time. On the JIRA side, the empty project list in the issue creation dialog is fixed, and a configuration that cannot authenticate no longer reports itself as "Connected".

### Highlights

#### 🐞 Bug Fixes

* **QA summary exported as raw Markdown**: tables, ordered lists and nested emphasis were not handled, so markers such as `| Result | Count |` were printed verbatim.
  * The HTML report now embeds the same rendering the on-screen Markdown viewer produces (headings, lists, tables, code, block quotes, rules, emphasis, links).
  * The PDF is drawn with formatting as well: headings are sized, lists are indented with bullets or numbers, tables get a grid, and code blocks get a shaded box. Page breaks keep working as before.
  * Raw HTML in the summary is escaped so it cannot execute in the exported file, and `javascript:` links are never turned into anchors.
  * Spacing below tables was increased so the next paragraph or heading no longer sits flush against the table.

* **Empty JIRA project list when creating an issue**: the connection reported success, yet the picker was empty and the log only showed `count=0`.
  * The deprecated "get all projects" endpoint (`GET /rest/api/3/project`) was in use. On Jira Cloud that path can return 200 with an empty array even when projects exist. The paginated endpoint (`/rest/api/3/project/search`) is now used and read to the last page, with a fallback to the old path for older servers that do not have it.
  * Two paging defects were fixed at the same time: skipping a range when the server caps the page size below the requested value, and stopping after the first page when the response omits `isLast`.
  * Non-2xx responses and partial lists are logged instead of being swallowed into an empty result.

* **A JIRA configuration that cannot authenticate showed as "Connected"**: Jira Cloud does not reject bad Basic credentials with 401; it downgrades the request to anonymous. The server-info call used by the connection test is a public endpoint, so it passed with invalid credentials and the broken configuration was stored as verified.
  * The connection test now verifies authentication. A wrong email or API token is reported as **authentication failure** and is not saved as connected.
  * The status shown on the settings screen is a live check rather than the stored flag, and a stale flag is corrected on the spot.
  * A configuration whose stored token cannot be decrypted asks you to enter the token again.
  * When the project list is empty, the log distinguishes a credential problem from a permission problem.

#### ✨ New Features

* **Edit the QA summary by heading**: when the summary contains `#`–`######` headings, each section gets a level badge and an "Edit this part" button. Only that section opens in the editor and the remaining lines are saved untouched. The header still offers "Edit all" for a full rewrite.
  * If the summary changes elsewhere while you are editing, the save is stopped and a warning appears with your draft kept in the editor. Previously such an edit was silently dropped or overwrote the wrong section.

* **Option to exclude the QA summary from exports**: PDF and HTML exports now have an "Include QA summary" checkbox. It is checked by default; clearing it leaves the section out entirely. The checkbox appears only when a summary exists.

#### 🔧 Developer Experience

* **Automatic code review before commit**: a pre-commit hook reviews the staged diff with the claude CLI. It is advisory and never blocks a commit; if claude is missing or the request fails, it prints a note and passes. Use `SKIP=claude-code-review` to skip one commit, or `CLAUDE_REVIEW_BLOCK=1` to stop the commit when issues are reported.

### Upgrade Notes

* No database migration scripts. No schema changes.
* Five new i18n keys (`testResult.qaSummary.editSection`, `editAll`, `preamble`, `conflict`, and `testResult.export.option.includeQaSummary`) are registered automatically for Korean and English at startup.
* **JIRA users should check their connection status once.** Because authentication is now verified, a configuration whose email is not the Atlassian account email, or whose API token has expired, will switch to "Connection failed". Re-entering the email and a fresh API token restores it.
* For 1.0.102 changes, see [RELEASE_NOTE_1.0.102_EN.md](RELEASE_NOTE_1.0.102_EN.md).
