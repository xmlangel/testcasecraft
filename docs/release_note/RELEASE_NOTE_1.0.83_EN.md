# Release Note - v1.0.83

## [1.0.83] - 2026-06-06

Hello! The 1.0.83 update focuses on **information density in the Test Cases screen**. The tree now focuses on folder structure navigation while the right-side list handles case browsing, so you can grasp the overall structure at a glance even in projects with many cases.

### Key Changes

#### 🌳 Folders-Only Tree (Highlight)

* The test case tree now displays **folders only** by default. Cases are browsed in the case list on the right.
  - Click the tree icon in the tree header to switch back to the previous **mixed mode** (folders + cases) at any time; the choice is saved in your browser.
  - The case selection screen in test plans always shows the full tree with cases.
* Two **virtual nodes** are pinned at the top of the tree — **All Test Cases** (total count) and **Unfiled Test Cases** (cases without a folder). Click to open the corresponding list on the right.
* A **folder filter** search box was added below the tree header. It filters the tree by partial folder-name match and automatically expands the ancestor path of matching items.
* Tree rows were decluttered — by default only the **expand arrow, icon, name, and case count** are visible; checkboxes, drag handles, version history, and the more (⋮) button appear on hover. Hover over a name to see the case ID in a tooltip.

#### 📋 Folder Case List (New)

* Selecting a folder displays its direct subfolders and **all cases including nested subfolders** as a table with **Name → Description → Expected Result → Priority** columns. Cases in subfolders get a **Folder** column with the path relative to the selected folder.
  - The "All Test Cases" / "Unfiled Test Cases" lists add a **Folder** (path) column at the front; click the path to jump to that folder.
  - Text longer than 100 characters is truncated with an ellipsis (…); hover to see the full content in a tooltip.
  - Expected Result shows the case's consolidated expected result first, falling back to numbered per-step expected results.
* Click the **pencil icon** next to the folder name to edit folder info (name, description, tags); return via save or the "← Back to case list" link.
* A **path display (breadcrumb)** was added above the main content — `Parent Folder › Subfolder › Case Name` — with clickable ancestors for quick navigation.

#### 🔢 Tab Count Badges

* The **Test Cases / Test Plans / Test Execution** tabs now display item count badges beside their labels.

#### 🐛 Bug Fixes

* Fixed an issue where clicking **[Rename] in the tree context menu did nothing** — the menu was not closing on item click, which blocked the rename dialog from opening.
* Fixed the **in-app manual/guide viewer returning 404 in Docker deployments** — manual/guide documents and screenshots are now bundled into the deployment jar, while development still reads repository docs directly.
* Fixed the **header logo not displaying in Docker deployments** (a global `*.png` rule in `.gitignore` excluded the logo file from build artifacts).

#### ⚡ Performance & Assets

* Optimized the header logo PNG from 1.6MB to **47KB**, lightening initial page loads everywhere.
* Added `logo192.png` for iOS home-screen icons and registered it in the PWA manifest.

#### 📖 Manual & Translations

* Updated the user manual (KO/EN) Sections 3-1, 4, and 5 for this redesign, with 4 new screenshots each (folders-only tree, folder case list, all-cases list, folder info edit). Added 4 new glossary entries (Folder Case List, Virtual Nodes, Folder Filter, Path Display).
* Seeded KO/EN translations for ~20 new UI strings — applied automatically on fresh installs as well.

### Upgrade Notes

* No migration required — just replace the image. New translation keys are seeded automatically at startup.
* The tree display mode now defaults to "Folders only". If you prefer the previous mixed mode, switch via the tree icon in the tree header (set once, persisted).
