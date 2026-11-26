# Release Note - v1.0.139

## [1.0.139] - 2026-11-26

Written: 2026-11-26 10:10 KST

This release tightens the three-pane test case and test execution screens introduced in 1.0.138. It adds layouts that overlay panes depending on screen width, shortens the case detail header and top fields, and fixes the dashboard total case count that did not match the actual number of cases.

### Highlights

#### Choose Auto, 1-pane, or 2-pane layout

- The case and execution screens now offer a layout choice (Auto / 1-pane / 2-pane). On the case screen it sits in the project header row (the bookmark and settings icon row).
- 2-pane shows the list and the detail (the result pane on the execution screen) side by side. If there is not enough width, the detail overlays the screen at full width.
- 1-pane overlays the detail at full width. Close the overlay with the close button or Esc; the list scroll position and selection are kept.
- The choice is stored in the browser. A 3-pane choice saved in 1.0.138 carries over as 2-pane.

#### Case detail header in one row

- One row holds the ID and automation chip, edit/view toggle, form/spreadsheet toggle, the main action (Edit, or Cancel and Save), Previous · n/N · Next, and More (⋮).
- Add new case, RAG registration, version history, create version, and delete moved into the More menu. No feature was removed.
- The header stays on top of the detail pane, so the Save button remains visible while scrolling.

#### Shorter top fields in case detail

- The "Automated" switch is gone; execution type (Manual / Automation / Hybrid) is the single control. Automation and Hybrid are saved as automated, Manual as manual.
- Execution type, priority, and test technique sit in one row, and their input text is 14px like the other fields.
- Tags, linked RAG documents, linked cases, and JUnit cases are folded into one "Linked items" section whose collapsed row shows a count per item.
- Owner, Parent, order, and updated-by appear as one small-text line; ID, Parent ID, and Project ID are folded under "Identity" with copy buttons.
- The test step and expected result cards now align at the top, and the expected result pane no longer shrinks so far that the editor toolbar wraps to two lines.

#### Case list and tree

- Name, ID, and owner in the case list stay on one line; scroll horizontally when the table is wider than the pane.
- The ID column is narrowed to 8 characters. Longer IDs are truncated and the full value shows on hover.
- The list pane can be narrowed down to the type icon, favorite, and ID columns. The 3-pane middle list no longer shows the owner column.
- Tree case rows no longer prefix the name with the ID, since the list already has an ID column.
- The tree's Automated / Manual filter now also applies to the case counts next to folders and to the middle case list.
- Folders can be collapsed while a filter or search is active.

#### Test execution screen

- Case names in the execution case list stay on one line and scroll horizontally when the pane is narrow.
- After opening the result pane, the list pane can be narrowed down to the checkbox and ID columns.

#### Dashboard total case count fixed

- The "Total N" chip at the top of the dashboard showed the number of results per execution instead of the number of test cases (for example 1117 for a project with 980 cases). The result pie chart and the completed count denominator still count results.

### Upgrading

- No database schema or configuration changes.
- Existing cases whose "Automated" value disagrees with the execution type are aligned to the execution type the next time they are saved. The database value is unchanged until then.
- The spreadsheet view no longer has an "Automated" column; automation follows the Type column.
- New UI strings (12 translation keys) are added automatically at server start if missing.
