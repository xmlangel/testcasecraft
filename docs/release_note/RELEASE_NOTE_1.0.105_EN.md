# Release Note - v1.0.105

## [1.0.105] - 2026-08-08

Written: 2026-08-08 00:00 KST

Deleting a test execution or a previous result no longer deletes the images embedded in its notes. Attachments now disappear only when a user deletes them.

### Highlights

#### 🐞 Bug Fixes

* **Images that should have survived vanished when an execution or result was deleted**: the delete path scanned the notes for image URLs and removed those attachments without checking whether another result still referenced the same image.
  * If a note had been copied and reused, the surviving copy lost its image too. The image tag stayed in the note, so the screen showed a broken image with no way to tell why.
  * The file itself was removed as well, so it could not be recovered.
  * Deleting an execution or a previous result now leaves attachments untouched. The deletion itself behaves as before.
  * Attachments are removed only when a user deletes them from the attachment list.

### Upgrade Notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* **Unreferenced attachments can accumulate.** Images from a deleted result are no longer visible anywhere yet remain in storage. The attachment cleanup in the admin screen can reclaim them. Using a little more storage is the better trade against losing data.
* Behavior when deleting a test case is unchanged in this release; attachment records are still cleaned up in that path.
* For 1.0.104 changes see [RELEASE_NOTE_1.0.104_EN.md](RELEASE_NOTE_1.0.104_EN.md).

### Related

* 1.0.104 made result notes mark their embedded images as in use. Together with this release, the paths that silently removed result images are closed.
* Images saved before that release carried no mark and were cleanup candidates. The marks have been filled in on the production data.
