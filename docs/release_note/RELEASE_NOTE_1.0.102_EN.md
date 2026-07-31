# Release Note - v1.0.102

## [1.0.102] - 2026-07-31

Written: 2026-07-31 23:55 KST

You can now choose how the screen is laid out. The horizontal tabs you have been using stay exactly as they are, and a new layout that stacks the areas down the left side sits alongside them. You pick one in your profile, and the default is the same horizontal tabs as today. In the new layout, test plans and runs no longer jump into a popup or a full screen — everything stays in one view. Test result screens also open faster: on projects with tens of thousands of results, queries that took more than five seconds now come back in under one.

### Highlights

#### ✨ New features

* **Layout selector**: Pick one of two options under `Menu structure` at the bottom of Profile → Theme Settings.
  * `Current layout — horizontal tabs`: the structure used so far. It is the default, so nothing changes unless you switch.
  * `New layout — left-side menu`: areas such as Dashboard, Test Cases, and Test Plans sit vertically on the left. Names are not truncated even with many areas, and you can collapse the menu to icons only.
  * Your choice is stored on your account, so it follows you to another PC. The icon in the top bar switches it immediately.
* **Switch projects from a list**: In the new layout the location line reads `Project name / Dashboard`, and clicking the project name opens the project list. You move straight to another project instead of going out to the list page and back.
* **A tree with runs under each plan**: The left list in the Test Plans area is now a tree. Expand a plan and its runs appear beneath it, so the list alone tells you which plan a run belongs to. Searching by name looks at both plan names and run names.
* **Status and plan in the run list**: The Test Execution area lists the project's runs newest first. Each row carries its progress status and the name of the plan it belongs to. Name search runs on the server, so a long list is not limited to the first page — `Load more` at the bottom pulls the next batch.
* **Select all after narrowing a search**: In the test case tree, pressing select-all while a search is applied selects only the visible results. Hidden cases are no longer swept into a bulk action.

#### ⚡ Speed

* **Test result queries**: Measured on a project with 1,200 cases and 48,000 results, folder statistics went from 5.7s to 0.8s, the latest-50-results query from 5.4s to 0.3s, and result statistics from 1.1s to 0.2s. The cause was loading every result in the project into memory to render a single page. Picking the latest result now reads only the columns it needs, and only the rows that reach the screen are read in full. Responses are unchanged — the same requests were compared byte for byte before and after.
* **First screen**: The app used to arrive as one 6.8MB bundle; it is now split per screen. The first request is 733KB, and the rest arrives when you open that screen. You may see a brief spinner the first time a screen opens.
* **Automated-test counts in the plan list**: Requests that queued one behind another, one per plan, are now sent together. Lists fill in sooner on projects with many plans.

#### 🔧 Behavior changes (new layout only)

* **No more popups**: Selecting a plan opens its content on the right instead of covering the screen with a popup. Moving between plans to create runs or check results no longer means closing and reopening a window.
* **Runs and result entry open in place**: Run details and case result entry no longer break out into a full screen without the top bar and left menu. You keep your bearings and return straight to the list.
* **Each pane collapses**: Collapse the left list when you want the detail pane wider.

If you stay on the existing layout (horizontal tabs), popup and full-screen behavior is exactly as before.

#### 🎨 Screen consistency

* The result entry screen and the plan/run screens looked like different applications. A page was nested inside the detail pane, and a floating header bar appeared on top of another; both are gone.
* Font sizes and weights are defined in one place and shared by both layouts, so text does not jump when you switch.

#### 📖 Documentation

* The user manual was updated in both Korean and English for these screens — layout selector, the two-pane plan/run screens, name/ID/tag search in the tree, the tag filter on the execution screen, and test case attachments on the result entry screen. Fifteen screenshots were newly captured or refreshed.

### Upgrade notes

* There is no DB migration script. However, **three indexes are created on first startup** — `test_plans(project_id)`, `test_plans(project_id, created_at)`, and `test_executions(project_id, created_at)`. Startup may take slightly longer on databases with a very large number of plans and runs.
* The default is the existing layout, so upgrading alone does not change anyone's screen. Each user turns the new layout on in their profile.
* Three new i18n keys (`testPlan.workspace.filterExecution`, `testPlan.workspace.emptyExecutions`, `testPlan.workspace.loadMore`) are registered automatically for both Korean and English at startup.
* Request and response formats for the result query and statistics APIs are unchanged. Scripts that post results or consume reports need no edits.
* For 1.0.101 changes, see [RELEASE_NOTE_1.0.101_EN.md](RELEASE_NOTE_1.0.101_EN.md).

### Known issues

* In the new layout, clicking `Test Results` does not change the address bar to `/results`. The existing layout behaves the same way, and screen switching is unaffected. This will be handled when the routing scheme is reworked.
* Entering the result entry screen fetches the project's case list to work out the previous/next order. That request is large on projects with many cases (production compresses responses, so the transferred size is much smaller). Trimming it to only the fields needed is deferred to a later release.
* The run table for plans with more than 1,000 cases can scroll heavily. It currently renders 50 rows at a time and grows from there.
* The remaining benchmark items (case list column, quick create, setting results straight from the run list) are not in this release.
