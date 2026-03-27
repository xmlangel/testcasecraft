# Release Notes - v1.0.30

## 🚀 Key Changes

### 🔍 Test Management & Search

- **Test Case Name Filter**: Added a filter feature and corresponding UI to search for test cases by name directly in the test execution view.
- **Field Expansion**: Added fields for Post-condition, Test Technique, and Automation Status to test cases for more detailed management.
- **Max Steps Expansion**: Now supports up to 20 test case steps.

### 🤖 LLM & RAG Integration

- **RAG API Optimization**: Standardized the API query parameter from `project_id` to camel case (`projectId`) and improved performance.
- **Default LLM Template API**: Added a dedicated server-side API endpoint to provide default LLM templates and integrated it into the frontend.

### 💾 Data Handling & Security

- **Layered Batch Save (ICT-415)**: Implemented layered batch save logic that intelligently resolves parent-child dependencies during folder and test case saving.
- **Enhanced Security Handlers**: Customized Spring Security 401/403 error handling and improved frontend Axios interceptors to better handle forbidden responses.

### 📂 Folder & Tag Management

- **Tag Propagation Logic**: Enhanced tag management to propagate folder tags to child items and added a dedicated tag management UI.
