# Release Note - v1.0.121

## [1.0.121] - 2026-08-25

Markdown editing works differently now. The two-pane screen — markup on the left, result on the right — is gone. Formatting is drawn inline as you type. Tables look like tables, and checkboxes can be clicked. What gets saved is still the same markdown.

### Highlights

#### ✍️ Formatting appears as you type

Type `## ` and the line becomes a heading. Type `- ` and it becomes a list item. The markup characters disappear and only the result remains.

A toolbar with nine buttons sits above the text: bold, italic, code, heading, quote, bullet list, numbered list, checklist, and insert table. Inserting a table gives you a 3×3 grid, and Tab moves between cells.

Here is where this applies.

| Screen | Field |
|---|---|
| Folder | Description |
| Test case | Description, Precondition, Expected results |
| Test case | "Step description" and "Expected result" in the steps table |
| Execution result | Notes |
| Execution | QA summary |
| Exploratory testing | Charter |

**Every field uses the same editor.** Narrow spots such as the steps table have the same button set as everywhere else.

#### 🔍 Notes can be opened fullscreen

Long notes were hard to read in a narrow box on the execution result screen. The button next to the character counter expands the editor to fill the screen.

The expanded view has an "Exit fullscreen" button at the top with the `Esc` shortcut shown beside it. The result verdict buttons stay at the bottom, so you can still save while expanded.

#### 📝 Notes can be edited again

Save a note, come back to it, and it opens read-only. There was previously no way to switch back to editing from that state.

A pencil button now handles it. Press it to edit, press it again to return to reading. The mode is remembered, so the next visit starts the same way. Users with read-only permission do not see the button.

#### 🛟 Fixed: merely opening the screen could overwrite a result

The execution result screen autosaves notes 1.5 seconds after a change. While wiring up the new editor, a path appeared where **simply opening** the screen counted as a change and triggered that save. Someone else's recorded result could be overwritten without anyone touching anything.

Only real content changes now lead to a save. Opening the screen or moving the cursor does not.

#### 📜 Hidden content is now indicated

Editors and viewers cap their height and scroll internally when content is longer. Without any indication of that, the text appeared to simply end where it was cut off. When a table or list happened to land right at the boundary, there was no signal at all that more followed.

Three short bars, shaped like lines of text, now drift toward the hidden side and fade out: at the bottom when more follows, at the top when content has scrolled above. Scroll to the end and the bottom indicator disappears, confirming you have seen everything. Nothing appears when the content fits.

It deliberately carries no border or shadow so it does not read as a button. The color follows the theme accent, and where reduced motion is requested the drift stops and only the bars remain.

In the editor the indicator appears the moment typing pushes the text past the limit. Viewers behave the same way.

#### 🔤 Notation is normalized on save

The editor rewrites markdown in a single notation. The meaning stays the same and only the form changes.

| What you typed | What gets saved |
|---|---|
| `__bold__` | `**bold**` |
| `_italic_` | `*italic*` |
| `* list` | `- list` |
| Table cell widths | Padding spaces are added to align cells |

This settles on the first save and does not change afterwards. Repeated saves do not accumulate blank lines.

**HTML tags are dropped.** If your text contains a `<details>` block, the tags disappear on the first save and only the inner text remains. There is currently no way to keep a collapsible block.

#### 🖼️ Pasted images land at a different position

Pasting an image still uploads it, but the image is inserted at the **end of the text** rather than at the cursor. Move it where you want it after pasting.

#### ⏳ Running executions stand out in lists

Status was conveyed by color alone. With finished and running items side by side, spotting what was in progress at a glance was hard, and the color even differed between screens (blue in lists, amber in the workspace).

Only in-progress items move now. The icon becomes a spinning progress indicator and the chip breathes, shifting slightly in size and brightness. Finished and not-yet-started items stay still: if everything moved, nothing would stand out.

Color and shape now differ too.

| Status | Color | Fill | Icon |
|---|---|---|---|
| Not started | Grey | Outline only | Clock |
| In progress | Amber | Filled | Spinning indicator |
| Completed | Green | Filled | Check |

**Color is not the only cue.** Fill, icon shape, and motion all differ, so the states remain distinguishable with color vision deficiency or in black and white. In-progress moved to amber because the default design system's blue sits close to grey in brightness and the two blurred together side by side.

This applies in five places: the execution list, the plan list, the execution workspace, and the execution summary.

#### 🌳 The test case tree opens with cases visible

First-time users saw folders only. With nothing but folders in the tree there was nothing to expand, and seeing cases required a toggle they had no reason to know about.

The tree now starts with cases visible. Choose folders-only once and that choice is remembered.

#### 🧰 Tree header buttons fit on one line

Selecting cases reveals "Move/copy to project" and "Delete selected". The tree is narrow, so those labels wrapped one character per line, stretching the header to nearly 380px.

Both are now icons with tooltips naming what they do, including the selection count. While a selection is active the folder and case counts collapse to just the selected count, leaving room for all six icons on one line. Header height went from nearly 380px to 38px.

#### 🔧 Icon sizes are now consistent

Icon sizes in the app chrome came in three flavors: 24px for bookmarks and settings in the top bar and breadcrumb, 20px in the tree header and view switcher, and a mix of 18px and 20px in the left menu. Different sizes on the same row imply a hierarchy that is not there.

Everything is 18px now: top bar, breadcrumb, tree header, left menu, and the individual-form/spreadsheet switcher.

#### 🔤 Text sizes on the RAG and exploratory screens now match the rest

Those two screens looked oversized. Switch, checkbox, and input labels used the 16px default, and nineteen places specified 16px body text. Everywhere else uses 14px.

They are 14px now, and RAG section headings dropped from 24px to 20px to match the heading level used elsewhere. Measured, the share of text at 16px or larger went from 38% to 24% on RAG and from 32% to 21% on the exploratory screen; what remains is the breadcrumb and page title that every screen has.

#### 🧹 Removed a JIRA integration error message

Opening a screen without a configured JIRA server printed an error in the browser console. Not configuring it is a normal state, yet it looked like a failure. Nothing on screen was affected.

#### 🌐 Korean and English labels for the new buttons

The nine toolbar buttons, four notes buttons, and the tree header selection label now have strings registered in both Korean and English.

### Documentation

- Manual screenshots were recaptured: 82 for the Korean edition and 82 for the English edition
- Four previously undocumented screens were added: automation link in a plan, filtered case list, performance metrics, and the server time panel
- Ten development guides and three deployment documents were brought in line with the current code

### Developer notes

Markdown editing and rendering are now separate concerns.

| Area | Before | Now |
|---|---|---|
| Editing | `@uiw/react-md-editor` | Tiptap (ProseMirror) |
| Rendering | `MDEditor.Markdown` from `@uiw/react-md-editor` | `react-markdown` |
| Render call sites | Called directly in nine files | One shared `MarkdownViewer` |
| Root class | `.wmde-markdown` | `.markdown-body` |

`@uiw/react-md-editor` was removed. The `markdown.css` it shipped went with it, so table, code, and heading styles are now provided directly in `markdownStyles.js`.

**`react-markdown` was promoted to a direct dependency.** It had only been present as a transitive dependency of `@uiw/react-md-editor`, so removing that package outright would have broken the three screens already using it (RAG chat, chunk preview, JIRA comment).

Inline HTML is kept via `rehypeRaw` and filtered by `rehypeSanitize` placed after it. Test case bodies are user input that other users open on the result screen; without filtering, an injected script would run.

**Editor interaction cannot be verified in `jsdom`.** ProseMirror resolves input positions through coordinates (`elementFromPoint`), which `jsdom` does not implement. Editor unit tests cover rendering, permissions, and external value synchronization only; typing, toolbar actions, table insertion, and fullscreen were verified in a real browser. Interaction tests of this kind belong in Cypress going forward.

The scroll indicator is shared between editor and viewer through the `useScrollOverflow` hook and the `ScrollHint` component. It observes content height with `ResizeObserver` and falls back to scroll events where that API is unavailable; the indicator simply does not appear, and the screen works as before.

Three defects surfaced while building it, each caught by measurement. First, many call sites put the height cap on a wrapping Box, so watching the viewer element missed the actual scroller. The search now walks upward but accepts a scroller **only when our content is taller than it** — walking up unconditionally read the page scroll as ours and put an indicator on short step editors. Second, the editor body has no padding, so the last paragraph's bottom margin escaped and added to scroll height: a single line overflowed its box by exactly 5px (171 vs 166). Third, lifting the indicator with a negative margin did not take effect and it was clipped outside the scroll box (chip 1020–1040, box bottom 1014); it is drawn with absolute positioning instead.

In-progress styling comes from `isInProgressStatus` and two sx objects in `inProgressPulse.js`, shared by five screens. The server uses both `IN_PROGRESS` and `INPROGRESS`, so case, spaces, and hyphens are normalized and both are accepted. No color values are hardcoded; only the `warning`, `success`, and `default` tokens are named.

Icon sizing lives in `CHROME_ICON_SX` in `common/iconSizes.js`. Specifying it per screen is how the sizes drifted apart in the first place.

Tree view mode resolution moved to `TestCaseTree/treeViewMode.js`. Kept inside the component, checking the default would mean rendering the whole tree, which makes it hard to guard the default with a test.

The RAG service image tag moved to `RAG_SERVICE_IMAGE_TAG`, defaulting to `latest`. Run `docker compose pull rag-service` before starting a new image: the local `latest` tag does not refresh on its own, so starting without a pull brings up the older build.

Build output went from 8,256KB to 8,032KB. What the removed editor freed up offset Tiptap, which splits into a separate 520KB chunk downloaded only on editing screens.
