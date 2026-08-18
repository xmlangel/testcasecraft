# Release Note - v1.0.112

## [1.0.112] - 2026-08-19

Written: 2026-08-19 07:40 KST

Status chips are now told apart by color in the Modern Glass theme. Until now in-progress, completed and failed all rendered in the same cyan, and you had to switch to Material 3 to see the difference.

### Highlights

#### 🎨 Status chip colors in the Modern Glass theme

* **Different statuses, one color**: The Glass theme pinned a cyan background (`rgba(6,182,212,0.15)`) and cyan label (`#0891B2`) on every filled chip. The color set on the chip (primary for in-progress, success for completed, error for failed) was overwritten, so executions in different states looked identical in the list.
* **Why Material 3 worked**: That theme carries no chip override, so the palette color applies as-is. Switching themes brought the colors back.
* **Colored chips now use their own color**: Chips with no color keep the existing cyan. Chips with a color get that palette color as a translucent fill (18% in light mode, 32% in dark) plus a matching border, so they stay glassy and still read apart. Labels use the darker shade in light mode and the lighter shade in dark mode to stay legible on the fill.
* **Icons follow the label**: The leading icon and the delete icon now take the label color.
* **Scope**: Every filled chip that sets a color. 108 such usages exist across the screen components, covering execution status, result verdicts, and automation and JUnit status chips.

### Upgrade notes

* No database migration scripts. No schema changes.
* No new i18n keys.
* Chip colors change on screens using the Modern Glass theme. Material 3 is unaffected.
* Chip size, shape and typography are unchanged; only fill, border and label color differ.
* Alerts in the Glass theme were left alone this release. Their fill is the same across severities, but the border, icon and text follow the severity color, so they remain distinguishable.
* A hard refresh (⌘⇧R / Ctrl+F5) may be needed if the browser cached the old bundle.
* For 1.0.111, see [RELEASE_NOTE_1.0.111_EN.md](RELEASE_NOTE_1.0.111_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Cause | Compared chip overrides across both themes | Cyan pinned in Glass only; Material 3 has no override |
| Color separation | Compared default, primary, success, error and warning fills in light and dark | All five differ |
| Existing behavior | Checked chips without a color | Cyan fill retained |
| Icon color | Inspected the override return value | Inherits the label color |
| Regression test | Reverted to the pinned cyan and reran | All 4 tests fail, as expected |
| Frontend suite | 75 files, 594 tests | Pass |
| Browser check | Not performed | Verify per-status colors and dark-mode legibility in the Glass theme |
