# Release Note - v1.0.107

## [1.0.107] - 2026-08-08

Written: 2026-08-08 01:22 KST

The last path that deleted attachment files — removing a test case — is closed. Attachment files no longer leave storage unless a user deletes them.

### Highlights

#### 🐞 Bug Fixes

* **Deleting a test case also deleted the attachment files hanging off it**: images pasted into result notes are uploaded against the test case. So removing a case silently emptied other people's result screens, and the files were gone for good.
  * Deleting a case now leaves the files in storage, so they can be retrieved if needed.
  * Attachment records are still cleaned up — the schema cannot keep a record once its case is gone. Result notes will show an empty image, but the file survives, which leaves room to recover it.
  * Which files were kept is written to the log, for later cleanup or recovery.

* **The scheduler screen let you enable a task that cannot run**: "Attachment cleanup" has not been scheduled since 1.0.106, yet the enable toggle was still clickable. That left people believing cleanup was running.
  * Tasks that never run on a schedule now have the toggle disabled, with a note explaining why.
  * The Execute Now button is unchanged, so the cleanup can still be run on demand.

### Upgrade Notes

* No database migration scripts. No schema changes.
* One new i18n key (`scheduler.tooltip.autoScheduleBlocked`) is registered automatically for both languages at startup.
* **Orphaned files will accumulate.** Deleting a case removes the attachment record and leaves the file. "Attachment cleanup" will not reclaim those files either — it only handles attachments that still have a record. Use the file paths from the log to clean storage directly, or to pull back an image you need.
* For 1.0.106 changes see [RELEASE_NOTE_1.0.106_EN.md](RELEASE_NOTE_1.0.106_EN.md).

### Four releases, one problem

* 1.0.104 — result notes mark their embedded images as in use
* 1.0.105 — deleting an execution or result no longer deletes note images
* 1.0.106 — the schedule that deleted attachments over time is gone
* 1.0.107 — deleting a test case no longer deletes attachment files

**The only remaining way an attachment file leaves storage is a user deleting it from the attachment list.**
