# Release Note - v1.0.137

## [1.0.137] - 2026-11-06

Written: 2026-11-06 14:53 KST

This release fixes 21 Docker image vulnerabilities by upgrading libraries, and adds an edit/view toggle plus automation markers and filters to the test case screens.

### Highlights

#### Edit/view toggle on the test case form

- An "Edit / View" toggle now appears next to the TC ID at the top of the form. Only roles with edit permission see it.
- In view mode, inputs are disabled and the Save, Cancel, Delete, and Create Version buttons are hidden.
- The chosen mode is stored in the browser and kept when moving to another case. The default is Edit.
- View mode does not apply while writing a new case or on the folder form.
- TESTER and VIEWER roles stay read-only regardless of the toggle.
- Changes entered before switching to view mode are still auto-saved.

#### Automated cases are marked with an icon

- Cases with the automation checkbox set show an automation icon in the left tree, in the case list when a folder is opened, and at the top of the form.
- Changing the automation checkbox in the form updates the header marker immediately.
- Manual cases, older cases without an automation value, and folders show no marker.

#### Automation filter in the test case tree

- Under the tree search box you can choose "All · Automated · Manual". It is hidden in the folder-only view.
- Older cases without an automation value count as manual.
- Combined with a search term, only cases matching both remain. Counts and Select All follow the filtered result.
- With a filter applied, bulk delete removes only the filtered cases and does not delete checked folders, because deleting a folder would also delete cases outside the filter. With "All", behavior is unchanged.

#### Pick test plan cases by automation status

- The case selection tree on the plan create/edit screen now has the same filter.
- With a filter applied, Select All and folder checkboxes add only the filtered cases to the plan.
- If cases outside the filter are already selected, a notice reads "N cases selected outside the filter will also be saved".

#### 21 Docker image vulnerabilities fixed

A Docker Scout scan of the 1.0.136 image reported 26 issues. The 21 that a library upgrade resolves are fixed.

| Library | Before → After | Resolved |
|---|---|---|
| tomcat-embed | 10.1.55 → 10.1.61 | Critical 4 |
| netty-bom | 4.1.136.Final → 4.1.139.Final | Critical 1, Medium 2 |
| bcprov / bcpkix-jdk18on | 1.84 → 1.86 | Critical 1, High 1 |
| jackson-bom | 2.21.5 → 2.21.8 | High 4, Medium 2 |
| snappy-java (transitive) | 1.1.10.7 → 1.1.10.12 | High 2, Medium 1 |
| guava (transitive) | 33.4.8-jre → 33.7.2-jre | High 1 |
| log4j2 | 2.24.3 → 2.25.5 | Medium 1 |

### Upgrade notes

- No database schema or configuration changes.
- The new UI strings (9 translation keys) are added automatically at server startup if missing.
