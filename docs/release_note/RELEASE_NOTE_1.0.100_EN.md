# Release Note - v1.0.100

## [1.0.100] - 2026-07-29

This release fixes JIRA issues whose project key contains a digit (such as `AGV2-100`). Searching for them returned nothing, and linking one to a test result was rejected as a non-existent issue. It also fixes the `Invalid date` shown for test case attachment upload times.

### Highlights

#### 🐞 Bug fixes

* **Issues with a digit in the project key could not be used**: A JIRA project key only has to start with a letter — digits are allowed after that. The product recognized letter-only keys (`ONT-904`) only, so teams on a project like `AGV2` effectively could not use the JIRA integration at all.
  * Issue search: entering `AGV2-100` was treated as a summary/description text search instead of a key lookup. An issue key does not appear in its own summary or description, so the result was always empty, and the search was additionally narrowed to the configured default project. Keys are now matched exactly.
  * Linking an issue to a result: saving a test result was rejected with `The JIRA issue does not exist`, even though the issue was there. The format check was what blocked it.
  * Issue key field: `Invalid issue key format` stayed on screen while typing.
  * Lowercase input is accepted. `agv2-100` is normalized to `AGV2-100`.
* **Attachment upload time shown as `Invalid date`**: On the test execution screen, the upload time of a test case attachment displayed `Invalid date`. Test result attachments on the same screen were fine, so only one side looked broken. Times now render in the user's time zone, and a missing or unreadable value shows `-` instead of `Invalid date`.

### Upgrade notes

* No DB migration script and no schema changes.
* No new i18n keys.
* The issue key format defaults to `^[A-Z][A-Z0-9]+-[0-9]+$`. If your JIRA instance uses single-letter project keys, adjust it with the `JIRA_ISSUE_KEY_PATTERN` environment variable.
* If issue search still returns nothing, check the JIRA connection settings. When a stored API token cannot be decrypted, search ends with an empty result rather than an error. On server deployments, `JIRA_ENCRYPTION_KEY` must match the value in use when the token was saved.
* Developers running locally against a remote database should put `JIRA_ENCRYPTION_KEY` in `.env.local` (see `.env.local.example`). Without it, JIRA settings stored remotely cannot be decrypted and the integration will not work.
* For 1.0.99 changes, see [RELEASE_NOTE_1.0.99_EN.md](RELEASE_NOTE_1.0.99_EN.md).
