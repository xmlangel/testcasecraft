# Release Note - v1.0.94

## [1.0.94] - 2026-07-13

Hello! v1.0.94 is a bug-fix release that **repairs two regressions in test-case tree reordering** introduced by the recent tree refactoring and authorization hardening.

### Highlights

#### 🔀 Tree reordering regressions (Fix)

* **Fixed drag-and-drop move failing with 403**: tree move (DnD) authorization used a check that excludes system administrators (`hasEditRole`), so creating/editing test cases worked but **dragging to reposition returned a 403 permission error**. It now uses the same standard authorization check as create/update/delete (`canEditProject` = system ADMIN or a project edit role), so **system administrators can move items** as expected.
* **Fixed up/down reordering not taking effect in the folder-only tree**: in reorder mode, the up/down buttons swapped position with test cases that aren't shown in the tree, so the **folder order didn't visibly change**. In the folder-only view, reordering now swaps only same-kind siblings (folders), while the full view (folders + cases) keeps its existing behavior.

#### ✅ Regression tests added

* Added a tree-move authorization integration test — system admins and project edit roles are allowed to move (200); VIEWER/TESTER/non-members are denied (403).
* Added frontend unit tests for up/down reordering — folder-only view skips cases and swaps folders, the full view preserves legacy behavior, and view-only (VIEWER) is blocked.

### Upgrade Notes

* No DB migration — applies by swapping the image.
* For the cross-project move/copy and authorization hardening in 1.0.93, see [RELEASE_NOTE_1.0.93_EN.md](RELEASE_NOTE_1.0.93_EN.md).
