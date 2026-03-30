# Release Note - v1.0.55

## [1.0.55] - 2026-03-30

### Key Changes

#### 🚀 Features & Enhancements

- **Ollama-based Local Code Review System**:

  - **Multi-model Review Support**: Added automated code review using various local LLMs like DeepSeek and Qwen during the `pre-commit` stage.
  - **Real-time Streaming & Translation**: Supported real-time output and automatic translation of English feedback into Korean for a better user experience.
  - **Flexible File Selection**: Added a `--file` flag to allow selective reviews of specific files.

- **Frontend UI/UX Improvements**:
  - **Dynamic Tab Visibility**: Implemented dynamic visibility for the "Exploratory Session" tab via environment variables.
  - **Enhanced Charter Creation**: Optimized the exploratory testing charter creation logic for better quality management.

#### 🛠️ Infrastructure & Development Environment

- **Code Quality Automation (Pre-commit)**:
  - **Integrated Lint/Formatter Setup**: Introduced `pre-commit` hooks for Python (Black, Flake8), JavaScript (ESLint, Prettier), and Java (Google Java Format) to automate code consistency.
  - **Security & Error Handling**: Improved error handling and security validation logic in review scripts for better stability.
