# Release Note - v1.0.107

## [1.0.107] - 2026-08-08

Written: 2026-08-08 01:22 KST

The last path that deleted attachments — removing a test case — is closed. Deleting a case now leaves the execution results and the images in their notes intact.

### Highlights

#### 🐞 Bug Fixes

* **Deleting a test case broke images in results that survive it**: images pasted into result notes are uploaded against the test case. But deleting a case leaves executions and results in place — the note text and its image tags survive, while deletion removed the attachment record and file, breaking the screen.
  * Production data shows 145 results that outlived their test case. Images those results referenced disappeared through this path.
  * Deleting a case now clears only the attachment's owner and keeps the record and file. The download path does not look at the owner, so **the image keeps rendering in the result.**
  * The number of attachments whose owner was cleared is written to the log.

* **The scheduler screen let you enable a task that cannot run**: "Attachment cleanup" has not been scheduled since 1.0.106, yet the enable toggle was still clickable. That left people believing cleanup was running.
  * Tasks that never run on a schedule now have the toggle disabled, with a note explaining why.
  * The Execute Now button is unchanged, so the cleanup can still be run on demand.

### Upgrade Notes

* No database migration scripts.
* One new i18n key (`scheduler.tooltip.autoScheduleBlocked`) is registered automatically for both languages at startup.
* **One schema change is applied.** The owner column (`test_case_attachments.test_case_id`) must accept empty values, so the app drops its `NOT NULL` constraint once at startup. If it is already dropped, nothing happens. No migration scripts.
* **Ownerless attachments will accumulate.** Records and files survive case deletion. Leave the ones still used by results; anything nobody references can be reclaimed with "Attachment cleanup" in the admin screen.
* For 1.0.106 changes see [RELEASE_NOTE_1.0.106_EN.md](RELEASE_NOTE_1.0.106_EN.md).

### Four releases, one problem

* 1.0.104 — result notes mark their embedded images as in use
* 1.0.105 — deleting an execution or result no longer deletes note images
* 1.0.106 — the schedule that deleted attachments over time is gone
* 1.0.107 — deleting a test case no longer deletes attachment records or files (owner is cleared instead)

**The only remaining way an attachment disappears is a user deleting it from the attachment list.**

TestRail moved the same way in 7.1: attachments survive deletion of the entity they were attached to, and administrators pick off the ones no longer linked to anything.
