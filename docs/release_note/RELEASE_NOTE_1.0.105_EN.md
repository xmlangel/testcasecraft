# Release Note - v1.0.105

## [1.0.105] - 2026-08-08

Written: 2026-08-08 00:20 KST

Two ways of losing work in the result entry screen are fixed: N, P, F and B being swallowed as verdict shortcuts while typing a tag or JIRA issue key, and images in result notes being deleted — file and all — when an execution or previous result was removed.

### Highlights

#### 🐞 Bug Fixes

* **Images that should have survived vanished when an execution or result was deleted**: the delete path scanned the notes for image URLs and removed those attachments without checking whether another result still referenced the same image.
  * If a note had been copied and reused, the surviving copy lost its image too. The image tag stayed in the note, so the screen showed a broken image with no way to tell why.
  * The file itself was removed as well, so it could not be recovered.
  * Deleting an execution or a previous result now leaves attachments untouched. The deletion itself behaves as before.
  * Attachments are removed only when a user deletes them from the attachment list.

* **N, P, F and B could not be typed into the tag or JIRA issue key field**: those four letters are result shortcuts (N not run, P pass, F fail, B blocked). The window-level shortcut handler stepped aside only for multi-line inputs (notes) and stayed active for single-line inputs, so it swallowed characters typed into the tag and issue key fields.
  * Typing `Pass` into the tag field flipped the verdict to pass on the `P`, saved it immediately, and showed a success message. That was a path to recording a verdict nobody asked for.
  * Shortcuts now step aside while text is being entered — single-line inputs, multi-line inputs, select lists and autocomplete fields alike.
  * Typing to find an entry in an open autocomplete list is protected too. Opening the list moves focus onto the entries, and that position now counts as text entry.
  * Focus on a checkbox or radio button still leaves the shortcuts working.

* **Enter in the tag field fell through to save**: pressing Enter to confirm a tag or pick an autocomplete entry was handled as "save the result". Same root cause, fixed together.

* **Enter pressed on a button fell through to save**: with focus on a tag's delete button or the close button, Enter saved the result instead of activating the button. Shortcuts now step aside on buttons and links, so the button gets the key.

* **Holding a verdict key fired repeated saves**: keyboard auto-repeat sent a save request on every repeat. Holding the key now saves once.

### Internal

* The focus decision for shortcuts now lives in one place (`useResultShortcuts`). Re-assembling those conditions per screen is what caused this bug, so the place to re-assemble them is gone. No behavior change.

### Upgrade Notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* The shortcuts themselves are unchanged. To change a verdict, click outside the input field first.
* **Unreferenced attachments can accumulate.** Images from a deleted result are no longer visible anywhere yet remain in storage. The attachment cleanup in the admin screen can reclaim them. Using a little more storage is the better trade against losing data.
* **The test case deletion path is unchanged in this release.** It still removes attachments without checking whether another result references the same image, so deleting a test case can still take out images from result notes that point at it.
* For 1.0.104 changes see [RELEASE_NOTE_1.0.104_EN.md](RELEASE_NOTE_1.0.104_EN.md).

### Related

* 1.0.104 made result notes mark their embedded images as in use. Together with this release, the **result and execution deletion paths** are closed. The test case deletion path remains.
* Images saved before that release carried no mark and were cleanup candidates. The marks have been filled in on the production data.
