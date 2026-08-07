# Release Note - v1.0.104

## [1.0.104] - 2026-08-07

Written: 2026-08-07 17:40 KST

Images pasted into test result notes no longer disappear after a few days. Because nothing marked them as being in use, the nightly unused-attachment cleanup was deleting them.

### Highlights

#### 🐞 Bug Fixes

* **Images in result notes turned into broken placeholders over time**: the image tag stayed in the note while the file was gone, leaving an empty box on the result screen.
  * The cause was a missing "in use" mark. That mark was applied only from the test case editor; the result entry screen had no such step. An attachment without the mark is classified as unused, and once it is seven days old the 2 AM cleanup job removes it from storage.
  * The server now reads the note when a result is saved and marks the images it contains as in use. This covers all three paths — recording a new result, bulk-recording several cases, and editing a previous result — and applies to results submitted through the API as well.
  * Marking moved from each individual screen into the single save path on the server. New result entry screens can be added later without reintroducing the same gap.
  * Referencing the same image several times still marks it only once.

* **Saving a note that references an already-deleted image could fail**: when the mark step could not find the attachment it threw, and that exception rolled back the result save.
  * Attachments are now marked only when they still exist. Missing ones are skipped and the result saves normally.
  * Any other problem during marking no longer rolls back the result save; failed entries are written to the log.

### Upgrade Notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* **This release only affects results saved from now on.** Images already embedded in existing notes still carry no mark, so they remain cleanup candidates once seven days old. Preserving them requires a separate one-off pass that scans notes and fills in the marks.
* The unused-attachment cleanup is the scheduler task `attachment-cleanup` (default: daily at 2 AM, attachments older than seven days). If you need time before running the backfill, you can disable that task temporarily from the admin screen.
* For 1.0.103 changes see [RELEASE_NOTE_1.0.103_EN.md](RELEASE_NOTE_1.0.103_EN.md).

### Known Limitations

* Deleting a test case or a previous result also deletes the images embedded in its body, without checking whether another result still references the same image. If a note was copied and reused, the surviving copy can lose its image too.
* Attachment deletion leaves no audit record. Who deleted what, and when, can only be recovered from the application log.
