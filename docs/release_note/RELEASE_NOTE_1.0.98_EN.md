# Release Note - v1.0.98

## [1.0.98] - 2026-07-27

Test case attachments are now visible on the screen where you record test results. Until now they only appeared in the test case editor, so checking a precondition document or a test data file during execution meant leaving the screen. Two related failures — a preview button that could not be clicked and downloads that failed outright — are fixed as well.

### Highlights

#### ✨ New features

* **Test case attachments on the result entry screen**: A "Test Case Attachments" section now appears below the case details on the result entry screen (both the dialog and the full-page view). It is **view only**, since it exists for reference during execution: preview and download work, while upload and delete buttons are not rendered. Cases without attachments show no section at all, so the screen does not grow. Adding and removing attachments still happens in the test case editor.

#### 🐞 Bug fixes

* **Preview button could not be clicked**: When the uploading browser or tool does not send a content type, the file is stored as `application/octet-stream`. Text, image, and PDF detection then all failed even for `.txt`, `.md`, and `.png` files, leaving preview disabled. Detection now falls back to the file extension when the stored type is inconclusive, so existing attachments become previewable without re-uploading. Newly uploaded files get their type corrected at save time.
* **"Failed to download the file"**: The `remote` profile pointed the database at the remote server while file storage (MinIO) still pointed at localhost, so attachment lists loaded but the actual objects were never found (`File not found in storage`). File storage now targets the same remote host.

### Upgrade notes

* No DB migration script and no schema changes.
* If you run the `remote` profile, the default file storage endpoint is now the remote host (`192.168.1.156:9000`). Override it with the `MINIO_ENDPOINT` environment variable if your setup differs.
* One new i18n key (`testResult.caseAttachments.title`) is seeded automatically for both Korean and English on startup.
* For 1.0.97 changes, see [RELEASE_NOTE_1.0.97_EN.md](RELEASE_NOTE_1.0.97_EN.md).
