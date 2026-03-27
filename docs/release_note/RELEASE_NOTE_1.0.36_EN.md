# Release Notes - v1.0.36

## 🚀 Key Changes

### ⚙️ Build & Deployment Automation (CI/CD)

- **GitHub Actions Integration**: Established workflows for automatic Docker image building and deployment.
- **Tag-based Builds**: Flexible build target selection via tag patterns (`v*-app`, `v*-rag`, `v*-all`).
- **Automatic Release Creation**: Automatically generates GitHub Releases using files in `docs/release_note/` upon tag push.

### ✅ JUnit & Test Validation Enhancements

- **JUnit XML Structure Improvement**: Structured individual execution steps, expected results, and actual results into separate XML elements to improve readability and analysis efficiency.
- **Enhanced Error Analysis**: Strengthened logic to include detailed step information, making it easier to identify the cause of test failures.

### 📚 Documentation & Guides

- **Release Guide Added**: Detailed guide for local version updates and build consistency in `docs/dev_md/14_release_procedure_guide.md`.
- **GitHub Actions Technical Docs**: Comprehensive documentation on the automation workflow structure and usage.

### 🛠 System Improvements

- **Build Script Enhancement**: Added non-interactive (CI) mode and argument parsing to `build-and-push-multiplatform.sh`.
- **Metadata Synchronization**: Improved build process to ensure version consistency for key metadata like `package-lock.json`.
