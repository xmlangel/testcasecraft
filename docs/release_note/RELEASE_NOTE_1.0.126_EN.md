# Release Note - v1.0.126

## [1.0.126] - 2026-09-18

Creating a test plan was impossible on the sidebar layout. Creating a run also required picking a plan first. Both screens now carry a create button above their list. The role picker in project settings separates roles that can create from roles that cannot.

### Highlights

#### The create-plan button is back on the sidebar layout

When the screen structure moved to the sidebar layout, the test plan screen was replaced by a new arrangement, but the button for creating a plan did not come along. Only opening an existing plan or creating a run beneath it worked; the plan itself could not be created. Typing the plan-creation address directly opened an empty screen.

The horizontal tab layout kept working, so the same account saw different behavior depending on the screen structure.

A **New plan** button now sits above the plan list, and pressing it opens the new plan form on the right. After saving, the plan just created opens in place.

**Impact:** Sidebar users can create plans. Roles without permission still do not see the button.

#### Runs can be created without picking a plan first

The create-run button lived only inside the plan detail, so entering the test run screen still required selecting a plan before a run could be created. The button now sits above the run list, and the owning plan is chosen inside the run form.

Opening a run and then pressing create no longer carries over the plan of the run just viewed.

**Impact:** A new run can be created straight from the run screen.

#### The role picker separates roles that can create from roles that cannot

The role list in project settings read Project Manager, Lead Developer, Developer, Tester, Contributor, Viewer. That order invites reading permissions as descending, but Tester cannot create while Contributor below it can, so the list order and the permission boundary disagreed.

The order is now Project Manager, Lead Developer, Developer, Contributor, Tester, Viewer, and the dropdown places a divider between the two groups, labeled **Can create and edit** and **Cannot create**.

| Role | Create plans and cases | Record run results | Manage members |
|---|---|---|---|
| Project Manager | Yes | Yes | Yes |
| Lead Developer | Yes | Yes | Yes |
| Developer | Yes | Yes | No |
| Contributor | Yes | Yes | No |
| Tester | No | Yes | No |
| Viewer | No | No | No |

Roles are stored by name, so reordering leaves already-assigned members untouched.

**Impact:** When inviting a member or changing a role, what that role can do is visible in the list itself.
