# Release Note - v1.0.53

## [1.0.53] - 2026-03-27

### Key Changes

#### 🐞 Bug Fixes

- **Enhanced TestCaseTree Stability**:
  - Fixed a critical rendering issue (`TypeError: Cannot read properties of undefined (reading 'length')`) where the tree content would occasionally disappear when reordering test cases.
  - Optimized node sorting and data mapping logic within the virtualized list to ensure stable tree interactions even with large numbers of test cases.
