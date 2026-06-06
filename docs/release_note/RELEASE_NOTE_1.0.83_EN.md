# Release Note - v1.0.83

## [1.0.83] - 2026-06-06

Hello! 1.0.83 is a follow-up to the 1.0.82 Test Cases screen redesign. It improves case browsing in nested folder structures and fixes the in-app manual not opening in Docker deployments.

### Key Changes

#### 📋 Folder Case List — Nested Cases Included (Improvement)

* In `Folder > Folder > Case` structures, **selecting the parent folder now shows every test case underneath**.
  - Previously only direct children were listed, so you had to drill into each subfolder to see its cases.
  - List composition: direct subfolders (for navigation) → all cases including nested subfolders (grouped by folder, display order preserved).
* Cases in subfolders get a **Folder** column showing the path relative to the selected folder; click the path to jump to that folder.
* Folders without nested cases keep the previous simple list view.

#### 🐛 Bug Fixes

* Fixed the **in-app manual/guide viewer returning 404 in Docker deployments**.
  - Cause: manual and guide documents were read only from the server working directory, which does not exist in containers (jar only).
  - Fix: manuals (KO/EN), screenshots, and guide documents are now bundled into the deployment jar, with a fallback structure that still reads repository docs directly in development.

#### 📖 Manual

* Updated the user manual (KO/EN) Section 4-1 "Folder Case List" to reflect nested-case behavior.

### Upgrade Notes

* No migration required — just replace the image.
* For the 1.0.82 changes (folders-only tree, case list, tab badges, etc.), see [RELEASE_NOTE_1.0.82_EN.md](RELEASE_NOTE_1.0.82_EN.md).
