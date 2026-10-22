# Release Note - v1.0.132

## [1.0.132] - 2026-10-22

Written: 2026-10-22 21:45 KST

This release bundles the five changes merged into `dev` since 1.0.131. Verification emails no longer make the screen wait on the mail server, and the project list no longer goes blank for users who are not members of an organization. The test execution and result entry screens gain four features.

### Highlights

#### Verification emails are sent asynchronously and failures are shown

When the mail server was slow or unresponsive, a verification email request was held for as long as the server took. From this release, the request returns immediately and the email is sent on a dedicated thread.

- SMTP connect, read, and write each have a 5-second timeout. The admin test send uses the same limit.
- After requesting a send, the profile and user management screens check the result every second for up to 30 seconds. On failure they show the cause (connection failed, authentication failed, timeout, queue full, send failed). If no result arrives within 30 seconds, they ask the user to check their mailbox.
- Only the requester and administrators can read the send result.

**Impact:** A mail server problem no longer freezes the screen, and users can see why an email did not arrive. The admin test send stays synchronous because administrators need the result right away.

#### Invited organization projects appear in the list

A user who was not a member of an organization but was invited to one of its projects saw a blank project list. A user who belonged to a different organization lost the per-organization tab. The list now merges the user's organizations with the organizations of invited projects, and shows all of them in the per-organization tab.

The organization picker used when creating or moving a project is unchanged. Those actions are still limited to organizations the user belongs to.

#### Delete test case attachments from the result entry screen

The test case attachment list on the result entry screen now has a delete button. It appears only for roles that can edit the test case (PM, LEAD, DEV, CONTRIBUTOR, system administrator) and is hidden for TESTER and VIEWER. Deleting an image embedded in the body shows an extra warning in the confirmation dialog.

#### Filter test executions by test case ID

The test execution filter panel now starts with a "Test case ID" field. Enter several IDs separated by commas, such as `TC-0001, TC-0002`. Matching is case-insensitive, and a row matches if it contains any of them. Because this is a substring match, `TC-1` also matches `TC-10` and `TC-11`.

#### Move to the previous or next test case while editing

The test case editor shows "◀ 3 / 120 ▶" buttons to the right of the breadcrumb. The order matches the tree on the left. The buttons are hidden while a folder is open and in spreadsheet mode.

#### Images appear in Jira issue descriptions

When an issue was created from the result entry screen, images in the description showed up in Jira as server URLs, because Jira cannot reach this server's file storage. From this release, images are uploaded as Jira attachments and rendered in the issue description.

If an image cannot be uploaded, a `[image: filename]` placeholder stays in the description. The issue is still created successfully.

### Upgrading

- Three columns (`send_status`, `send_error_code`, `send_finished_at`) are added to the `email_verification_tokens` table. `ddl-auto: update` creates them at startup, and all of them allow NULL. No separate script is needed.
- To upload description images, the linked Jira account needs permission to create attachments in that project.
- No environment variable or configuration change is required.

### What was verified

- All 751 frontend tests and 822 backend tests passed.
- Against an unresponsive SMTP server, a verification email request returned within 1 second, and the send record was marked as a timeout after 5 seconds.
- Jira description images were checked on a temporary issue in a personal Jira: the image rendered in the description, and the issue was deleted afterward.
- The invited organization project list was compared on a local server with two TESTER accounts, using builds before and after the fix.
- Not checked in a browser: the real screen with the mail server disconnected, the role-based attachment delete button, the test case ID filter, and the previous/next buttons.

### Known issues

- For users who are not members of an organization, project cards get a 403 when loading the organization's member list. The screen does not break, but an error appears in the browser console.
- If the same user requests another verification email while one is still being sent, the status check for the earlier request ends with a warning. The status of the new request is reported correctly.
