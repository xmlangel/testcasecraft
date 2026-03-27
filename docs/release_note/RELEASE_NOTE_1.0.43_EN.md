# Release Note - v1.0.43

## 🚀 Key Changes

### 🏗️ CI/CD and Docker Build Process Improvements

- **Enhanced GitHub Action Workflow**: Improved stability in Docker build and push processes and granted `contents: write` permission to enable automated release handling.
- **Extended Build Script Options**: Added `--skip-tag-verify` option to major build scripts like `build-and-push-multiplatform.sh` for more flexible tag management.
- **Improved Pre-release Support**: Enhanced version parsing and validation logic for pre-release versions and optimized `latest` tag assignment for better version accuracy.
- **Optimized Path Management**: Refactored build paths and JAR file management to use explicit script directory paths, increasing build environment independence.
- Added UI and API tests
