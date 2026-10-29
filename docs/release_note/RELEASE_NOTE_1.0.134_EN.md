# Release Note - v1.0.134

## [1.0.134] - 2026-10-29

Written: 2026-10-29 18:20 KST

This release bundles the ten changes merged into `dev` since 1.0.133. The main feature is per-step test results, which now flow into reports, exports, and Jira comments. It also stops exports from leaking image URLs and public tokens, fills in missing translations, and consolidates the export buttons on the results screen.

### Highlights

#### Record test results per step (ICT-469)

The step table on the result entry screen now has result buttons (Pass, Fail, Blocked) and an actual result field for each step. Pressing the same button again resets the step to NOT_RUN.

- Changing a step result recalculates the case result: any Fail gives Fail; otherwise any Blocked gives Blocked; any remaining NOT_RUN step gives NOT_RUN; all Pass gives Pass.
- The case result can still be changed by hand, and a manual choice is kept when steps change again.
- Each step result stores a copy of the step description and expected result at execution time, so later edits to the test case do not change past results.
- The previous results dialog and the case execution history show a step result summary.
- The result API accepts an optional `steps` array. Without it, a single case result is saved as before. Bulk save does not accept `steps`.
- The MCP tool `testexecution_record_result` also accepts `steps`.

#### "Pass all steps" requires a note (ICT-479)

The button used to fill only empty steps, so it did nothing when re-running with the previous result loaded. It now sets every step to Pass and keeps any actual results already entered.

- The button opens a note dialog, and the note is saved to the result's notes. The dialog uses the same markdown editor as the notes field.
- Saving is blocked and focus moves to the note when it is empty. Autosave also waits.
- Result shortcut keys are disabled while the dialog is open, so typing in the note does not change the verdict.

#### Step results in reports and the results screen (ICT-472, ICT-475)

- Case cards in PDF and HTML reports include a step result table in step order.
- Card fields (folder, JIRA status, automation, execution type, tags, linked documents, attachments, postconditions, test technique) appear only when their column is enabled. Before, the card fields were fixed regardless of column settings.
- Step actual results are entered with the markdown editor. Existing plain-text values keep their line breaks.
- The field shows an error when an actual result exceeds 10,000 characters. The server already rejected longer values, but the screen did not say so until saving.
- The "Step results" column in the result detail table now uses cards like the "Step info" column. Each card shows `Step N` with its result, and the actual result is rendered as markdown. Step results are no longer cut off when the step info column is hidden.

#### Exports no longer contain image URLs or public tokens (ICT-470)

Inline images in notes or steps went into Excel and CSV cells as raw `![image](/api/testcase-attachments/public/...?token=...)` text, which was unreadable and left the public token in the file.

- Result exports (Excel, CSV, PDF, HTML), server exports, JUnit result CSV, and the test case spreadsheet replace images with `[Image: alt text]`, or `[Image]` when there is no alt text.
- Cells containing an image are exported as plain text with the remaining markdown removed. Cells without images are exported as is.
- To re-import the test case spreadsheet, use the new "raw for import" CSV and Excel entries in the export menu.

#### Step results in Excel, CSV, and PDF exports (ICT-469, ICT-472)

- Excel, PDF, and CSV exports from both the web app and the server have a step result column. Excel gains a "case × step" detail sheet.
- Server exports add Display ID, description, postconditions, automation, execution type, test technique, tags, linked documents, and attachment columns.

#### Server exports and Jira auto-comments follow the user's language (ICT-473, ICT-474)

- Column headers, sheet names, and result values in server-generated Excel, CSV, and PDF files follow the UI language. Without language information they stay in Korean.
- In Korean exports, the automation value changed from `Automation`/`Manual` to `자동화`/`수동`, matching the web app export.
- Failure alerts, result updates, and execution summary comments are written in the preferred language of the user who triggers them, falling back to Korean when the user cannot be found. User-entered notes, step descriptions, and actual results are not translated.
- Result update comments list Fail and Blocked steps with expected and actual results.
- A result update comment with no execution time now shows "not set" instead of failing.

#### One export button on the results screen (ICT-476, ICT-478)

The default EXPORT (CSV, print) button and the "Advanced export" button in the result grid toolbar are removed. Only the **Export** button above the table remains. That button was initially visible only at mobile widths; it now shows on desktop too.

### Upgrading

- A new table, `test_result_steps`, stores step results. It is created on startup by `ddl-auto: update`, so no SQL needs to be run. Existing results appear without step results.
- Exports from the results screen now include all rows regardless of grid filters and sorting.
- Korean server exports use `자동화`/`수동` for the automation value. Check any scripts that read it.
- Result export requests accept an optional `language` field.

### What was verified

- All 830 frontend unit tests passed on `dev` (`1e6a3dac`) with all ten changes merged.
- Backend tests: 938 of 947 passed on the branch that merged ICT-474. The 9 failures are all `JiraSmartRedirectIntegrationTest` failing to start on H2, and the same 9 fail on `dev` before these changes. The backend suite was not re-run on `dev` with all ten changes merged.
- For ICT-469, 470, and 472, three E2E tests passed three times each on a local server. Eight deliberate code mutations each made the matching test fail.
- The step result cards in the result detail table were checked on a local screen.
- The other UI changes (the pass-all note, the desktop export button, the PDF and HTML report files) were not checked in a browser and need checking after deployment.

### Known issues

- Result edit history (approval-based edits) does not include step results.
- Step pass-rate statistics, step results in hierarchical exports, and per-step attachments and defect links are not available yet.
- The two issues listed in 1.0.132 (a 403 on project cards for users who are not organization members, and a warning on the earlier request when a verification email is requested again) are still not fixed.
