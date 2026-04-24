# Release Note - v1.0.72

## [1.0.72] - 2026-04-24

Hello! In this 1.0.72 update, we have further advanced the **AI-powered automation features** and the **integration of the RAG (Retrieval-Augmented Generation) system**. Test case creation and management have become smarter and more convenient than ever.

### Key Changes

#### 🤖 AI-Powered Test Case Naming
- **Automatic Name Generation**: AI now analyzes the content of your test cases to automatically generate the most appropriate titles and metadata.
- **Manual/Auto Mode Support**: You can generate names manually by clicking a button or receive automatic suggestions, significantly improving work efficiency.

#### 🧠 Enhanced RAG System Integration
- **Individual Vectorization Registration**: Added the ability to immediately register specific test cases into the RAG system for AI learning.
- **Real-time Status Tracking**: You can now track whether your registered test cases are reflected in the RAG system in real-time through the UI.
- **LLM Integration Optimization**: Synchronized internal logic to ensure the LLM provides optimal answers based on the RAG configuration state.

#### 🏗️ Faster and More Robust Architecture (Refactoring)
- **Tree Component Optimization**: Completely refactored the tree structure for test case lists, ensuring smoother performance even with large datasets.
- **Enhanced Modularization**: Separated complex code into functional modules, enabling faster and more stable feature updates in the future.

#### 📝 Documentation & Guide Updates
- **AI Agent Guide Updates**: Added the new `GEMINI.md` and improved `AGENTS.md` and `CLAUDE.md` to clearly define the development environment for working with AI agents.
