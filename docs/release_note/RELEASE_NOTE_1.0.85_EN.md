# Release Note - v1.0.85

## [1.0.85] - 2026-06-09

Hello! 1.0.85 is a usability-focused update. It adds a new **bookmarks** feature for collecting frequently used test cases into personal favorites, and makes the test execution screen more convenient with **auto-refresh** and a **filter panel**.

### Key Changes

#### ⭐ Test Case Favorites & Bookmarks (New)

Organize frequently referenced cases into personal bookmarks. Bookmarks are **private to you** and do not affect other users' screens.

* **Favorite toggle**: A star icon (☆/★) was added to each row in the case list, so you can add or remove a case from favorites with a single click.
* **Bookmarks screen**: Open the Bookmarks screen (`/projects/{projectId}/bookmarks`) via the ☆ button in the header. It consists of a **collection** list on the left and a case list on the right (Case Name · Priority · Note · Actions).
* **Collection management**: Create, rename, and delete collections that group cases by topic. The default **Favorites** collection always exists and cannot be deleted.
* **Personal notes**: Attach a personal note to each case, such as "always check during regression."
* **Read-only**: The Bookmarks screen handles only collection organization and notes; edit case content on the Test Cases screen as before.

#### 🔄 Test Execution List Auto-Refresh + Filter Panel (Improved)

* **Auto-refresh**: The test execution list **refreshes automatically about every 20 seconds**, so progress recorded by other team members appears without a manual reload. Refresh pauses while you are on another tab to avoid unnecessary requests, and resumes when you return. You can also refresh instantly at any time with the **[Refresh]** button at the top of the list.
* **Filter panel**: A filter panel was added above the case list in the execution detail, letting you narrow cases by **result** (PASS/FAIL/BLOCKED/NOT RUN), **priority**, **executor**, **execution date**, **JIRA issue key**, and **notes**. When a filter is active, an **Active** indicator appears, and **[Clear]** removes all conditions at once.
* **Search persistence**: The title search term in the execution list is remembered per project, so your previous search state is retained when you reopen the screen.

#### 🔐 Security Code Cleanup

* Cleaned up usage of the `DaoAuthenticationProvider` API deprecated in Spring Security 6.4+ (switched to constructor injection). No behavior change; resolves compile warnings.

### 📖 User Manual

* The Korean and English manuals reflect the above changes — Section 3-1 header ☆ button, new "Bookmarks & Favorites" subsection in Section 4-7, and Section 8 auto-refresh/filter panel notes with refreshed execution screenshots.

### Upgrade Notes

* Applies with a simple image swap; no migration required.
* Bookmark data is stored per user and does not affect existing data.
* For the 1.0.84 security update (vulnerability remediation, JWT_SECRET validation/auto-generation), see [RELEASE_NOTE_1.0.84_EN.md](RELEASE_NOTE_1.0.84_EN.md).
