# Release Note - v1.0.51

## [1.0.51] - 2026-03-26

### Main Changes

#### 🚀 Features & Enhancements
- **Enhanced Inline Image Support in Markdown Notes (ICT-386)**:
  - Added support for pasting and uploading images directly into the markdown editor, significantly improving documentation workflow.
  - Optimized the upload process to instantly insert images into the content without intermediate dialogs.
  - Strengthened file management by ensuring associated inline images are automatically cleaned up when test cases or results are deleted.
- **Architectural Improvements & Stability**:
  - Refactored frontend context usage to call `useAuth` and `useI18n` directly, effectively resolving circular dependency issues and improving application initialization stability.

#### 🐞 Bug Fixes
- **Inline Image Placeholder Fix**: Resolved a bug where image placeholders were not correctly replaced during insertion into markdown notes.
- **Codebase Cleanup**: Performed a comprehensive cleanup of unused imports across both frontend components and backend tests to maintain high code quality.
