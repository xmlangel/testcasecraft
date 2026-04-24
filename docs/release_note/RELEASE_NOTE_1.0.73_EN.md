# Release Note - v1.0.73

## [1.0.73] - 2026-04-24

Hello! In this 1.0.73 update, we have significantly enhanced the **RAG-based intelligent search capabilities** and strengthened **project-level data isolation and security**. AI chat can now provide much more accurate and enriched answers than before.

### Key Changes

#### 🔍 Advanced RAG Intelligent Search
- **Query Intent Analysis**: AI now analyzes the intent behind user queries, going beyond simple vector search to retrieve actual test case data from the database in real-time for more accurate answers.
- **Real-time DB Data Integration**: The RAG chat service instantly references real project data (test case statistics, lists, etc.) to generate responses based on the most up-to-date information.
- **Backend Template Processing Migration**: The test case template injection logic has been migrated from the frontend to the backend (`RagQueryAnalyzer`), ensuring more consistent and stable AI response quality.

#### 🔒 Enhanced Security: Project Data Isolation
- **Strict Project Scope Enforcement**: Reinforced the data isolation policy to ensure that only data within the current user's project can be accessed during RAG search and SQL execution.
- **SQL Execution Security Validation**: Added security validation for SQL queries executed internally by the AI, fundamentally blocking unintended data access.

#### 🧰 RAG Internal Logic Optimization (Refactoring)
- **Query Analyzer Improvement**: Enhanced the analysis logic of `RagQueryAnalyzer` to more precisely identify user intent and selectively retrieve the appropriate data.
- **Data Summarization Logic Improvement**: Improved `RagDataSummarizer` to summarize retrieved data in a more concise and AI-friendly format.
- **Search API Accuracy Enhancement**: Improved the accuracy of vector similarity search results in the FastAPI RAG service.
