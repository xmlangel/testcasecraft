# Release Notes - v1.0.41

## 🚀 Key Changes

### 📦 JUnit Upload & File Storage Improvements
- **Fixed Drag & Drop Upload**: Resolved issues with the drag-and-drop functionality for JUnit result file uploads.
- **MinIO Storage Integration**: Integrated MinIO (S3-compatible storage) for storing attachments and results, improving file management stability.

### 🔍 Enhanced Log Analysis & Metadata Extraction
- **Legacy Steps Parser**: Introduced a new parser to automatically extract test steps from specific log patterns.
- **Improved Metadata Extraction**: Enhanced the logic for extracting expected and actual results from log data for better accuracy.
- **Advanced Diagnostic Logging**: Added detailed logs for metadata parsing and system output lengths to aid in debugging and analysis.

### 🎨 UI/UX & Theme Consistency
- **Dark Theme Preview Fix**: Updated code and text preview windows to use theme-aware `action.hover` backgrounds instead of hardcoded colors.
- **Component Refactoring**: Refactored `pre` tags in preview areas to MUI `Box` components for better integration with the global theme engine.
- **UI Enhancements**: Added MUI `Chip` components to the `TestExecutionForm` for better visual information display.

## 🛠 Bug Fixes & Improvements
- **Fixed LinearProgress Reference Error**: Resolved a runtime error in the `TestExecutionForm` component caused by a missing `LinearProgress` import.
- **Dependency Updates**: Updated frontend libraries and dependency packages to their latest versions.
