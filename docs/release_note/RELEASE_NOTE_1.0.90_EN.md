# Release Note - v1.0.90

## [1.0.90] - 2026-06-16

Hello! Version 1.0.90 improves **markdown rendering quality on the test result / execution screens**. We fixed cases where QA summaries and notes rendered awkwardly with excessive blank space, and made long notes fully visible without scrolling. We also introduced a frontend unit test setup (vitest).

### Highlights

#### 🎨 Excessive Markdown Whitespace Removed (Fix)

We cleaned up large blank gaps that appeared between paragraphs and tables across several markdown-rendered screens, including the QA summary.

* **Cause**: `pre-wrap` (preserve whitespace and line breaks) was applied to the entire markdown body, so even the invisible line breaks between paragraphs/tables were rendered as blank lines.
* **Fix**: Line-break preservation is now scoped to inside paragraphs and lists only. Line breaks you type within a paragraph are preserved, while the unnecessary blank lines between blocks disappear.
* **Scope**: QA summary, test result notes, notes in previous-execution results and JIRA history, and the RAG document chunk / summary / analysis screens.

#### 📝 Test Execution Notes Shown in Full (Improved)

* The **notes** field on the test execution screen had a fixed height and scrolled in preview when content was long. It now expands to show everything without scrolling (like test steps) whenever there is content. Edit and fullscreen modes keep the fixed height.

#### 🧪 Frontend Unit Tests Introduced (Internal Quality)

* Added a unit test setup based on vitest + Testing Library + jsdom, along with regression tests for the markdown/notes changes above (8 files, 25 cases). Run with `npm test`.

### Upgrade Notes

* No DB migration — applies with an image swap only.
* No changes to data or feature behavior; only the on-screen presentation of markdown and the notes area is improved.
* For the 1.0.89 project selection header compaction, see [RELEASE_NOTE_1.0.89_EN.md](RELEASE_NOTE_1.0.89_EN.md).
