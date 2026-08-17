# Release Note - v1.0.110

## [1.0.110] - 2026-08-17

Written: 2026-08-17 23:36 KST

The titles of five screens inside a project now share one size, weight and color, each preceded by the same icon used in the left menu. The page background, which also differed per screen, was aligned as well.

### Highlights

#### 🎨 Unified screen titles

* **Five screens now use the same title size**: Dashboard, Test Plan, Test Execution, Test Results and Test Automation all differed. Test Plan and Test Automation were 34px, Dashboard 24px, the Test Execution list 20px, and Test Results moved between 24px and 34px with the viewport. All five are now 24px bold.
* **Titles are preceded by an icon**: The same icon the left menu and the horizontal tabs use. Menu and content share one symbol, so the title alone tells you which screen you are on.
* **Title colors match too**: Only the Test Results title was blue, and the execution detail title hard-coded a blue that no longer matched the theme. Both now use the same default text color as the other screens.
* **The "Test Execution:" prefix was dropped from the execution detail title**: The title read `Test Execution: E11 Black Friday Load Readiness - Run 1`, pushing the run name you actually need to the right. The breadcrumb and the menu already say which screen this is, so only the run name remains. Clicking the title still returns to the list.

#### 🖼 Unified page background

* **The gray panel on Test Results, Test Automation and Dashboard is gone**: These three painted a gray background on top of the translucent white panel, covering its glass finish and making them look different from Test Execution and Test Plan. The background is now painted once, so all five sit on the same panel.
* **Test Automation uses the same panel as the other areas**: It was the only area whose content sat directly on the page, with different side spacing and no panel border.
* **The standalone project dashboard (`/projectdashboard`) is unchanged**: That screen sits on the page rather than inside a panel, so it needs its own background.

### Upgrade notes

* No DB migration scripts. No schema changes.
* One new i18n key (`testExecution.form.editTitleFallback`) is registered automatically for both locales at startup. It fills the title slot while the run name is still loading.
* The previous key `testExecution.form.editTitle` (`Test Execution: {name}`) is left in place. The translation seeder never overwrites a row that already has a value, so changing wording requires a new key. That key is no longer used by any screen.
* Behavior and data are unchanged. Only sizes, colors and spacing differ.
* A hard reload (⌘⇧R / Ctrl+F5) may be needed if the old bundle is cached.
* For 1.0.109 changes, see [RELEASE_NOTE_1.0.109_EN.md](RELEASE_NOTE_1.0.109_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Title spec on five screens | Browser measurement (tabs and left menu modes) | 24px / weight 700 / `rgb(30,41,59)` match |
| Title icon | Same measurement | 26px / `rgb(6,182,212)` match |
| Page background | Same measurement | `rgba(255,255,255,0.7)` on all five |
| Standalone dashboard regression | `/projectdashboard` measurement | Background kept (`rgb(248,250,252)`) |
| Execution detail title | Opened a run | Run name only, no prefix |
| New translation key | DB check after startup | 1 row per locale |
| Frontend suite | 74 files, 585 tests | Passed |
