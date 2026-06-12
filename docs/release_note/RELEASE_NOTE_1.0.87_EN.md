# Release Note - v1.0.87

## [1.0.87] - 2026-06-12

Hello! Version 1.0.87 focuses on on-screen readability. The result entry screen gains **Expand All** and **auto word-wrap** view options for comfortable reading on small screens, and several display glitches in the results detail list and dashboard were fixed.

### Highlights

#### 📱 Result Entry Screen View Options (New)

Two view toggles were added at the top of the test case content on the result entry screen.

* **Expand All**: Removes the vertical scroll (height cap) on test step cells and shows the full content. The default remains the existing scroll mode.
* **Wrap Lines (auto word wrap)**: Wraps everything including SQL code blocks and long strings, so the entire case content (description, preconditions, steps, expected results) can be read **without horizontal scrolling on small screens** such as mobile.
* Your choices are saved in the browser and **persist the next time you open the screen**. The full-page result entry view and the previous-result edit dialog share the same settings.

#### 🛠️ Test Results Detail List Display Fixes (Improved)

* **Overlapping case names**: Long test case names no longer flow underneath the edit/view icons. Names wrap up to two lines, with the full name available via hover tooltip.
* **Notes tooltip code blocks**: Markdown code blocks inside the dark tooltip were rendered with a light background, making the text invisible. Code areas now use a dark background with light text (applies to both Notes and Description columns).

#### 📊 Dashboard Empty-State Fix (Improved)

* Empty-state messages of data-less charts (result trend, open test run results, per-assignee results) no longer break vertically one character per line on mobile.

#### 🎨 Splash Logo Consolidation (Cleanup)

* The initial loading screen logo was consolidated into a single transparent PNG. The two theme-specific JPGs and the logo-swapping script were removed, simplifying asset management.

#### ⚙️ Misc

* GitHub Actions updated to Node.js 24-compatible versions (checkout v6, setup-java v5, docker login/buildx v4, gh-release v3).
* Docker Hub README gained an English "How to Run" section (.env / shell variables / --env-file) — see `docs/deployment/DOCKERHUB_README.md`.

### 📖 User Manual

* The new view options will be reflected in §8-1 (Result Entry Screen) in the next manual sync cycle.

### Upgrade Notes

* No DB migration — just replace the image.
* **New UI strings (translation keys) may be hidden by an existing server-side cache.** If Korean labels appear on the English UI after upgrading, call `POST /api/i18n/cache/clear` once with an admin token.
* For 1.0.86's QA Summary and note view toggle, see [RELEASE_NOTE_1.0.86_EN.md](RELEASE_NOTE_1.0.86_EN.md).
