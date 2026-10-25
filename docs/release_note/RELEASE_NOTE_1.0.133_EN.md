# Release Note - v1.0.133

## [1.0.133] - 2026-10-26

Written: 2026-10-26 08:30 KST

This release bundles the nine changes merged into `dev` since 1.0.132. Seven are security fixes: API keys now authenticate as the user who issued them, and APIs that were open without authentication or lacked project membership checks are now closed. The other two fix the author recorded in test case version history and add execution deletion in vertical mode.

### Highlights

#### API keys authenticate as the issuing user with that user's role

Until now, every API key authenticated as the virtual account `service-account` (TESTER role). Calls could not be traced to a person, and data created with a key recorded `service-account` as its author. From this release, a key authenticates as the user who issued it, and that user's role decides what it can do.

- If the issuer is empty, missing, or inactive, the request gets a 401.
- The temporary token exchange used by the Jira integration also issues tokens for the key's issuer.
- Keys issued from the admin screen record the administrator who actually issued them instead of a fixed `admin`.
- Sign-up rejects usernames that start with `service-account` (case-insensitive, leading spaces ignored), so no new account can pass for the old authentication principal.

**Impact:** Actions and authorship from API keys are recorded under real users. Because a key follows its issuer's role, a key issued by a user with a role below TESTER can do less than before.

#### APIs that were open without authentication are now locked

Only the settings, language, translation, manual, and guide lookups used by pre-login screens stay public.

- Monitoring and scheduler lookups, translation cache clearing, and `/api/config/environment` are restricted to administrators.
- Visit logging and the remaining settings and translation APIs require a logged-in user.
- The public `/api/config` response no longer includes the active profile.
- Four admin screens that sent requests without a token now send the login token.

#### Project membership checks on data lookups

Test case version and result lookups, exports, reports, change history, dashboards, JUnit results, charter lookups, RAG search, and result attachment lookups now check that the requesting user belongs to the project.

- Lookups by a single ID find the project the target belongs to and check that project.
- Result lookups also check every plan and execution ID sent with the projectId, so another project's execution ID cannot be attached to your own project ID.
- Unscoped lookups across all projects are limited to administrators. A dashboard opened without a selected project is narrowed to the projects the user can access.

#### Save and update permission checks no longer depend on the request's projectId

- A bulk test case save is rejected as a whole if any item has an empty projectId.
- Bulk save and single update also check edit permission against the project of the test case stored in the database.
- Test plan updates check permission against the stored plan's project and ignore a different projectId in the request.
- The bulk save API returns 400 or 403 instead of 500 when it rejects a request.

#### Permission checks and rate limits on charter and LLM APIs

- Creating a charter requires a role that can run test sessions in the target project (TESTER included). Updating a charter requires the same permission in the charter's project.
- The charter author is the logged-in user, not a value from the request body.
- AI metadata generation requires edit permission on the project. RAG advanced search requires access to the project when a projectId is given.
- AI metadata generation, the chat model list, and RAG advanced search are limited to 20 calls per minute per user. Requests over the limit get a 429.

#### The general-purpose mail send API is removed

`POST /api/mail/send` let anyone with the TESTER role send mail through the company SMTP server with the sender, recipients, subject, and body taken straight from the request. Nothing in the web app, the Jira app, or the MCP server called it, so the endpoint was removed. Email verification, password reset, and the admin mail settings test send use other paths and keep working.

#### Test case version history records the real author

Version history entries are created asynchronously, and at that point the login was not available, so every entry was saved with `System User` as the author. From this release, the display name of the user who made the change is saved as the author. Only changes made without a login are saved as `System User`. Existing entries are not changed.

#### Delete executions from the vertical-mode execution list

Vertical mode had no way to delete an execution. Execution rows in the execution list and under the plan tree now have a delete button. The confirmation text and the role that sees the button are the same as in horizontal mode. Deleting the execution that is open also closes its detail view. If deletion fails, the dialog shows the reason and the list stays as it was.

### Upgrading

- Monitoring tools or scripts that call `/api/monitoring/*`, the scheduler lookups, or `/api/config/environment` without logging in will get a 401 or 403. Switch them to an administrator token or API key.
- API keys whose issuer has been deleted or deactivated stop working. Check the issuers of keys in use before deploying.
- Any external tool calling `POST /api/mail/send` will fail. No caller was found inside the repository.
- The LLM rate limit is set with `app.ratelimit.llm.limit-per-minute`. The default is 20.
- The database schema does not change.

### What was verified

- All 900 backend tests passed on `dev` with all nine changes merged. All 757 frontend tests passed on the branches that changed the web app.
- Added access rule tests, project member and non-member integration tests, and a regression test that fails if the removed mail path reappears.
- Not checked on a real server or in a browser. In particular, the statistics screen without a selected project, the vertical-mode delete button, and the author shown for actions made with an API key need checking after deployment.

### Known issues

- The two issues listed in 1.0.132 (a 403 on project cards for users who are not organization members, and a warning on the earlier request when a verification email is requested again) are not fixed in this release.
