# Release Note - v1.0.77

## [1.0.77] - 2026-05-22

Hello! In this 1.0.77 update, we have **refined the exception handling for external LLM API authentication failures (401/403)** in RAG chat, and **implemented clear, user-friendly guidance in both Korean and English** so that users and administrators can instantly resolve the issue.

### Key Improvements

#### 🛠️ Refinement of Exceptions in the External LLM Client Layer
* We now precisely capture and handle authentication errors (`401 Unauthorized` or `403 Forbidden`) that can occur during communication with external LLM APIs (OpenWebUI, OpenAI, OpenRouter, Perplexity, Ollama) in RAG (Retrieval-Augmented Generation) chat.
* Instead of displaying vague internal 500 errors ("Failed to call API"), we positioned `WebClientResponseException` at the front of catch blocks to branch HTTP response codes early.
* Standardized error propagation using `LlmClientException` with descriptive English and Korean guidance when hitting 401 or 403 status codes.

| Target Component | Improvements & Changes |
| :--- | :--- |
| **OpenWebUIClient.java** | Added robust 401 error detection for expired/invalid API Keys, enhanced decryption logging. |
| **OpenAIClient.java** | Implemented sophisticated API error isolation for both non-streaming (`chat`) and streaming (`chatStream`) requests. |
| **OpenRouterClient.java** | Added WebClient response exception interception to handle invalid credentials or endpoint timeouts. |
| **PerplexityClient.java** | Structured exception mapping aligned with Perplexity AI API specifications. |
| **OllamaClient.java** | Added error handling for configurations where Ollama integration requires authorization. |

---

### 💡 Administrator & User Action Guide

If you encounter an error message similar to the following popup or toast during RAG chat, please follow this guide to resolve it:

> **💡 Error Message Example:**
> *"API authentication failed (401/403). Please verify that the registered API Key is valid and has not expired."*

1. **Root Cause:** The API key registered for the target LLM provider (e.g., OpenAI, OpenWebUI) is either expired or incorrect.
2. **Resolution Steps:**
   - Navigate to the **LLM Integration Settings** menu in the System Administration Console.
   - Issue a new, valid API Key from the external provider's developer console (e.g., OpenAI Developer Platform).
   - Replace and save the API Key in the settings input. The RAG chat functionality will be restored instantly without requiring a system restart.

---

### 🛡️ Verification & QA Results

To ensure backend quality and reliability, we executed the full Java compilation and test suite covering controllers, services, repositories, and integration tests before this release.

* **Verification Command:** `./gradlew test`
* **Build Result:** `BUILD SUCCESSFUL in 7m 37s` (11 actionable tasks)
* **Quality Metrics:**
  - Regression error rate due to new exception handling logic: **0%**
  - All schema mapping and application startup integration tests successfully passed.
  - Repository queries and performance index assertions passed.
