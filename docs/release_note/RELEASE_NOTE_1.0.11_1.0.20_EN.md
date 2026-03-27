# Release Notes - v1.0.11 to v1.0.20 (Tech Stack Modernization)

## 🚀 Key Changes

### 🎨 UI Framework Modernization (MUI Grid v2 Migration)

- **MUI Latest Stack**: Fully migrated to MUI Grid v2 and cleaned up deprecated props to ensure UI stability and performance (Including MUI v5 to v7 upgrade).
- **TreeView Upgrade**: Migrated from the legacy MUI TreeView to the new `SimpleTreeView` for a modern hierarchical management interface.

### 🤖 LLM & RAG System Establishment

- **RAG Admin Panel**: Added a comprehensive panel for LLM configuration and global document management.
- **Template Management API**: Implemented dedicated API endpoints for managing LLM templates.
- **Multimedia Previews**: Enhanced document and video preview capabilities directly within RAG search results.

### 🔌 External Integrations (Jira)

- **Jira Status Sync**: Strengthened status synchronization between test cases and Jira issues.
- **i18n Support**: Enhanced internationalization for Jira comments and integration-related UI elements.

### 🛡 System Security & Stability

- **Dependency Security Patches**: Updated Spring Boot and resolved security vulnerabilities in core libraries like Bouncy Castle, Guava, and Apache POI.
- **Automatic Token Refresh**: Introduced JWT refresh token functionality for seamless user sessions.
- **Optimistic Locking**: Applied optimistic locking to ensure data integrity during concurrent test case edits.

### 🧪 Enhanced Test Execution

- **Filtering & Sorting**: Added detailed filters to test execution lists and improved data loading performance.
- **Historical Result Modification**: Added ability for admins or owners to edit/delete past test results.
