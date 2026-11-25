# Release Note - v1.0.138

## [1.0.138] - 2026-11-25

Written: 2026-11-25 18:55 KST

This release reorganizes the test case and test execution screens into a three-pane layout that keeps the list visible next to the detail, and cleans up console errors and warnings on both screens.

### Highlights

#### Selectable screen density

- Theme settings now offer a "Comfortable / Compact" choice. Compact reduces input and tab heights and spacing so more fits on one screen.
- The initial setting is Compact. Choose "Comfortable" to keep the previous sizes.
- The choice is stored in the browser.

#### Test case screen split into tree, list, and detail

- Opening a case no longer hides the list.
- The case list gains Owner and Latest Result columns, and the top header is shorter.
- The case detail groups inputs into two columns and places steps and expected results side by side. A Previous · n/N · Next · Save bar stays pinned at the bottom.
- The tree shows the case ID before the case name, and long names can be scrolled horizontally.

#### Test execution screen split into run list, case list, and result entry

- Result entry is split into two columns, and each step result reads on one line. A Previous · n/N · Next · Save bar stays pinned at the bottom.
- The run list uses single-line rows with a progress bar per result.

#### Narrow screens collapse panes

| Width | Test case screen | Test execution screen |
|---|---|---|
| 1440 | List collapsed, detail only | Result pane collapsed; clicking a case opens the result screen |
| 1600 | List and detail together | Run summary stacked vertically |
| 1920 | List and detail together | Run summary side by side |

The middle pane has a minimum width (600px for cases, 640px for executions). When space runs short the right pane shrinks first, and collapses if it would go below its own minimum.

#### Console errors and warnings fixed

- The latest-result tooltip in the case list showed the date as a number list such as `PASS · 2026,8,20,22,4,30,6`. It now shows a proper date and time.
- Cases saved earlier with execution type `Automated` showed an empty execution type field. They now show `Automation` and are saved as `Automation`. The stored DB value stays unchanged until the case is saved.
- Two React warnings from the editor and the scroll hint are gone.

### Known limitations

- The case list on the execution screen is a 13-column table, so only some columns fit at 1600 and 1920 widths and horizontal scrolling is needed.

### Upgrading

- No DB schema or configuration changes.
- New API `GET /api/testcases/projects/{projectId}/latest-results`. The Latest Result column in the case list uses it.
- New UI strings (6 translation keys) are added automatically at server startup when missing.
