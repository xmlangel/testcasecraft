# Release Note - v1.0.54

## [1.0.54] - 2026-03-27

### Key Changes

#### 🚀 Features & Enhancements

- **Enhanced Spreadsheet Input Mode**:
  - **Folder-based Filtering Support**: You can now edit test cases for a specific selected folder rather than the entire project, significantly improving efficiency for large-scale projects.
  - **Optimized Validation Logic**: The validation system now references the full project structure even in filtered views, ensuring accurate parent folder path verification and data integrity.

#### 🐞 Bug Fixes

- **Spreadsheet Mode Bug Fixes**:
  - **Restored Row Addition Functionality**: Fixed a `ReferenceError` caused by component initialization order, restoring "Add Rows" and "Insert Above/Below" features.
  - **Preserved Display Order**: Fixed an issue where `displayOrder` would reset to 1 during bulk saves under certain filters, ensuring consistent sorting.
