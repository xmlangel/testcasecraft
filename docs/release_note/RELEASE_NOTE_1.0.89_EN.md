# Release Note - v1.0.89

## [1.0.89] - 2026-06-15

Hello! Version 1.0.89 is a small UI update that **tidies up the project selection screen layout**. We reduced the vertical space taken up by the top header area so that project cards appear higher on the screen and catch the eye faster. There are no functional changes.

### Highlights

#### 🎨 Project Selection Header Compacted (UI)

We cleaned up the unnecessarily tall "Project Selection / Project Management / New Project" area at the top of the project selection screen.

* **"Project Selection" label**: Shrunk from a large heading (`h5`) to a small caption style with minimized vertical spacing.
* **"Project Management" title**: Reduced from `h4` to `subtitle1` (bold) with smaller bottom margin.
* **"New Project" button**: Resized to `small` to match the slimmer header.

As a result, the header takes up far less vertical space and the project card list moves up.

### Upgrade Notes

* No DB migration — applies with an image swap only.
* No changes to data or feature behavior; only the top layout of the project selection screen becomes more compact.
* For the 1.0.88 initial screen-load performance improvements, see [RELEASE_NOTE_1.0.88_EN.md](RELEASE_NOTE_1.0.88_EN.md).
