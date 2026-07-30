# Release Note - v1.0.102-dev

## [1.0.102-dev] - 2026-07-31

Written: 2026-07-31 02:20 KST

You can now choose how the screen is laid out. The horizontal tabs you have been using stay exactly as they are, and a new layout that stacks the areas down the left side sits alongside them. You pick one in your profile, and the default is the same horizontal tabs as today. In the new layout, test plans and runs no longer jump into a popup or a full screen — everything stays in one view.

**This is a development preview (-dev) build.** It exists so you can see the new layout on real screens and tell us what to change before a regular release.

### Highlights

#### ✨ New

* **Layout choice**: Profile → Theme settings → `Menu layout`, with two options.
  * `Current layout — horizontal tabs`: what you use today. It is the default, so nothing changes unless you choose otherwise.
  * `New layout — left menu`: dashboard, test cases, test plans and the rest stack down the left. Names stay readable as areas grow, and the menu collapses to icons.
  * Your choice is stored on your account, so it follows you to another machine. A top-bar icon switches between the two as well.
* **Switch projects from a list**: in the new layout the location line reads `ProjectName / Dashboard`, and clicking the project name opens the project list. You change projects without going out to the list page and back.
* **Runs nested under their plan**: the left list is now a tree. Expand a plan and its runs appear underneath, so you can tell which plan a run belongs to from the list alone. Searching by name looks at both plan names and run names.

#### 🔧 Behaviour changes (new layout only)

* **No more popups**: picking a plan opens it on the right instead of covering the screen. Moving between plans to create a run or check results no longer means closing and reopening a dialog.
* **Runs and result entry open in place**: run details and per-case result entry no longer drop into a full screen without the top bar and left menu. You keep your bearings and return to the list directly.
* **Each pane collapses**: fold the left tree when you want the detail wide, fold a plan branch when you are scanning the tree.

If you stay on the current layout, popups and full-screen pages behave exactly as before.

#### 🎨 Visual consistency

* The result entry screen and the plan/run screens looked like different products. A page-inside-a-card wrapper and a floating header bar were stacking up; both are gone.
* Font sizes and weights now come from one place, so the two layouts match and text does not jump when you switch.

### Upgrade notes

* No database migration scripts. No schema changes.
* Because the default is the existing layout, upgrading alone changes nobody's screen. Each user turns the new layout on in their own profile.

### Known items

* In the new layout, clicking `Test results` does not change the address bar to `/results`. The current layout behaves the same way and screen switching is unaffected. It will be handled when the routing is reworked.
* The remaining items from the benchmark (test case list column, quick create, setting results straight from the run list) are not in this build.
