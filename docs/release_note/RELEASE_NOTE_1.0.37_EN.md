# Release Notes - v1.0.37

## 🚀 Key Changes

### 🐳 Docker Image Optimization & Weight Reduction

- **Main App Alpine Migration**: Switched the Spring Boot application's base image to Alpine Linux (`eclipse-temurin:21-jdk-alpine`), significantly reducing the image size by over 300MB.
- **RAG Service Build Optimization**: Maintained the `slim` image for compatibility with ML libraries (PyTorch, etc.) while restructuring layers to maximize cache efficiency.

### ⚡ Build Speed Improvements (CI/CD)

- **Buildx Registry Cache Integration**: Added registry cache options (`--cache-from`, `--cache-to`) to the `docker buildx build` command.
- **Reduced Build Times**: By reusing OS packages and library layers from the Docker Hub cache, multi-platform (arm64/x86) build times have been drastically reduced for repetitive builds.

### ⚙️ Versioning Policy Update (Excluding RAG Service)

- **Independent RAG Versioning**: The `rag-service` version will no longer be updated during standard version bumps. It will only be updated when the `-PtargetComponent=rag-service` argument is explicitly provided.
- **Decoupled Updates**: Separated the versioning cycle of the main application/frontend from the RAG service to improve build efficiency and consistency.

### 🛠 System Stability

- **Process Management Enhancement**: Properly integrated `dumb-init` with Alpine for optimized container signal handling.
- **Package Manager Security**: Reduced security vulnerabilities by utilizing the minimal package configuration with `apk` in the Alpine-based environment.
