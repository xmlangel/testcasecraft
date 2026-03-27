# Release Note - v1.0.49

## [1.0.49] - 2026-03-24

### Major Changes

#### 🚀 Features

- **Infinity Scroll Implementation**: Replaced traditional pagination with infinity scroll in the Test Execution list for a more seamless and intuitive navigation experience.
- **Navigation Link on Test Execution Title**: Added a clickable link to the Test Execution header title, allowing users to quickly return to the list from the details view.

#### 🛠 Improvements & Optimizations

- **Test Case Tree Performance Overhaul**: Optimized tree rendering logic from $O(N^2)$ to $O(N)$ and implemented virtualization. Even projects with tens of thousands of test cases now load and scroll smoothly.
- **High-Performance Test Execution API**: Drastically reduced API latency from seconds to milliseconds by eliminating N+1 queries and implementing server-side statistics and pagination.
- **Accurate Progress Calculation**: Refined the test execution progress logic to only count the most recent results per test case, ensuring progress never exceeds 100% and maintains data integrity.

#### 🐞 Bug Fixes

- **Statistics Filter Panel Error Fix**: Resolved a `TypeError` in the statistics panel caused by data type mismatches (Page object vs List) and added defensive data handling.
- **Floating Menu Visibility Fix**: Corrected a Z-index issue where the navigation menu was hidden behind the full-screen markdown editor in the test result form.
