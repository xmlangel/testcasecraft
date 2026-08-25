# Release Note - v1.0.122

## [1.0.122] - 2026-08-26

Code pasted into a step no longer gets cut off. Code blocks were also drawn with corners so round that the first and last lines fell outside the background — that is fixed too. And buttons that sat on the same row in different sizes now match.

### Highlights

#### Code no longer gets clipped

Multi-line commands typed into "Step description" or "Expected result" lost their tail. The box height was derived only from the line count of the raw markdown. Step columns are narrow, so one logical line wraps into several on screen, and that extra height was never counted.

In a measured case, a five-line install command rendered as more than ten lines while the box stopped at five. The box now grows with wrapped content up to ten lines; beyond that it scrolls, with a hint showing that content continues.

Code blocks now wrap instead of scrolling sideways, so the tail of a long command flows down rather than hiding off to the right.

#### Code block corners are drawn correctly

Inline code and code blocks were rounded by 48px and 64px. The intended values were 3px and 4px, but the app-wide corner base value was multiplied in, making them sixteen times larger. Inline code looked like a pill, and the first and last lines of a code block were clipped by the rounding. The values are now pinned in pixels.

#### Button sizes match

Large and small buttons were mixed on the same row, which makes it hard to tell which action is primary.

| Screen | Buttons aligned |
|---|---|
| Test case form (header) | Add case, Cancel, Update, Create version, Delete |
| Test case form (footer) | Cancel, Update, Create version |
| Result entry | Select file |
| Result entry (Jira) | Search, Create issue, Link, Open in JIRA, Cancel |

The size is defined in one place so future buttons stay consistent.

### Verified scope

- All 702 frontend tests pass.
- Two new tests cover the editor height ceiling.
- No browser-based visual verification was performed. The figures above come from the code and the test suite.
