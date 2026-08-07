# Release Note - v1.0.106

## [1.0.106] - 2026-08-08

Written: 2026-08-08 01:00 KST

The schedule that deleted attachments simply because time had passed is gone. The cleanup itself remains, to be run by an administrator when needed.

### Highlights

#### 🐞 Bug Fixes

* **Removed the nightly 2 AM job that deleted unused attachments**: it removed attachments older than seven days that carried no "in use" mark. Files disappeared without anyone asking for it, and could not be recovered.
  * Before 1.0.104, images pasted into result notes never received that mark. So images visibly present on screen were classified as unused and deleted.
  * This task is no longer scheduled. It is filtered out regardless of the time or enabled flag left in its configuration, so **servers already running it will stop once they take this release.**
  * New installations create it in the disabled state as well.

* **The cleanup itself still works**: running "Attachment cleanup" from the admin screen behaves as before. Use it when storage needs reclaiming.

### Upgrade Notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* The existing configuration values (daily at 2 AM, seven-day threshold) are left in place. They remain visible on screen but no longer drive a schedule.
* **Unused attachments will accumulate.** Nothing reclaims them automatically, so watch storage usage and run the cleanup from the admin screen when needed.
* For 1.0.105 changes see [RELEASE_NOTE_1.0.105_EN.md](RELEASE_NOTE_1.0.105_EN.md).

### Related

* Deleting note images along with a result or execution was removed in 1.0.105.
* The test case deletion path still cleans up attachments, so images in result notes pointing at that case can still disappear.
