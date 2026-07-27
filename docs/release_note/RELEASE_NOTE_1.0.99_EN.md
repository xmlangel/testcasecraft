# Release Note - v1.0.99

## [1.0.99] - 2026-07-27

This release fixes the "Unable to load the text file" error when opening an attachment. The files were stored correctly all along — the on-screen list was pointing at attachments that had already been replaced.

### Highlights

#### 🐞 Bug fixes

* **Error when opening a replaced attachment**: When an automated import deletes and re-uploads attachments, each attachment gets a new identifier. If a screen stayed open across that change, clicking preview or download requested an already-deleted attachment, the server answered with a 500, and the UI only showed "Unable to load the text file."
  * Server: a request for a deleted attachment now returns **410 Gone** instead of a server error, and no longer fills the log with stack traces.
  * UI: on that response the attachment list is reloaded automatically so the stale row disappears, with the message "Attachment not found. It looks deleted, so the list was refreshed." Clicking again on the refreshed list works normally.

### Upgrade notes

* No DB migration script and no schema changes.
* One new i18n key (`testcaseAttachments.staleError`) is seeded automatically for both Korean and English on startup.
* For 1.0.98 changes, see [RELEASE_NOTE_1.0.98_EN.md](RELEASE_NOTE_1.0.98_EN.md).
