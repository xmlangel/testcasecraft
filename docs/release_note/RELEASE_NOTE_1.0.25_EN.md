# Release Notes - v1.0.25

## 🚀 Key Changes

### 👨‍💻 Admin Features

- **[feat] Automatic Admin Creation**: Improved initial setup convenience by automatically creating a default Admin account if none exists on startup.
- **[fix] RAG Document Search Fix**: Debugged and resolved path discovery errors that occurred during RAG document searches in specific conditions.
- **[fix] Log Cleanup & i18n Fixes**: Cleaned up redundant console logs and addressed overall missing internationalization across the application.

### 📊 Test Case Field Expansion

- **Enhanced Metadata**: Organized data structures by adding fields for Post-condition, Priority, Execution Type, Test Technique, and Tags to test cases.

### 💾 Configuration & Input UX

- **Persistence of Input Mode**: Utilized `localStorage` to save the user's previous input mode state, preserving the work environment after refreshes.
- **Korean Input Optimization**: Enhanced UX for more natural Korean character input when writing test case titles and descriptions.
