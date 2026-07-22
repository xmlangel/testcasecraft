# Release Note - v1.0.97

## [1.0.97] - 2026-07-22

This release links test cases with automation (JUnit) results and lets you navigate that relationship from either side. On a test case with automation enabled, you can link related test cases and the actual JUnit cases that automate it, and every linked item is one click away from its detail page. Link integrity was also hardened so that removing or deleting a link on one side never leaves a dangling reference on the other.

### Highlights

#### ✨ New features

* **Linked test cases / automation (JUnit) cases**: When "Automated" is enabled on a test case, you can link (1) other test cases in the same project and (2) the actual JUnit cases that automate it. Clicking a link opens its detail page.
* **Reverse visibility**: The test case screen shows "Test cases linking this one," and the JUnit result screen shows "Linked test cases," so the relationship is visible and navigable from either direction.

#### 🔧 Integrity & stability

* **Link cleanup on delete**: Deleting a test case clears both the links it made and the links pointing to it; deleting a JUnit result also clears the test-case links that referenced that result's cases. No dangling links remain on either side.
* **Link preservation rule**: A save request that omits the link fields keeps existing links, while sending empty values clears them. This prevents links from being wiped unintentionally by some bulk/import paths.
* **Delete atomicity**: If an error occurs while deleting a JUnit result, the whole operation rolls back instead of committing partially.

#### 🖥️ UI

* **Server time / version widget cleanup**: The bottom-left time/version widget now defaults to collapsed (small icon) and is shown to admins only. The header version label color was adjusted so it stays visible against the header background.

### Upgrade notes

* No DB migration script. The two link tables (`testcase_linked_test_cases`, `testcase_linked_junit_cases`) are created automatically on startup via `ddl-auto=update`.
* Applies by swapping the image; no environment variable changes required.
* For 1.0.96 changes, see [RELEASE_NOTE_1.0.96_EN.md](RELEASE_NOTE_1.0.96_EN.md).
