# Release Notes - v1.0.40

## 🚀 Key Changes

### ⚡ Improved Initial Loading Visibility & Performance

- **Splash Screen Introduction**: Added an official splash screen to show the progress during the application's initial startup.
- **Progress Bar Visualization**: Users can now track the i18n initialization and core resource loading in real-time via a progress bar.
- **Loading Process Optimization**: Improved the main script loading mechanism for better startup stability.

### 📋 Enhanced JUnit Test Result Details

- **Detail Extraction for All Statuses**: Expanded the detail parsing range, previously limited to failures, to include detailed steps and results for **Passed**, Error, and Skipped tests.
- **Status-based UI Themes**: Detailed results for passed tests are now displayed in success-themed colors (green) to clearly distinguish them from failures.
- **Generalized Metadata Parsing**: Strengthened logic to consistently extract expected and actual result tags regardless of the XML structure.

## 🛠 Bug Fixes & Optimizations

- **Fixed Infinite Loading**: Resolved a race condition between i18n initialization and splash screen termination that caused the app to hang.
- **Dependency Optimization**: Optimized bundle size by removing the unused `@toast-ui/editor` library.
- **Startup Stability**: Enhanced initial loading stability through lifecycle management within the AppWrapper.
