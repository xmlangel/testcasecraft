# Release Note - v1.0.76

## [1.0.76] - 2026-05-22

Hello! In this 1.0.76 update, we have **made sign-up and data integrity error messages user-friendly (Korean)** and **launched a new MCP server** that lets LLM clients (Claude Desktop, Cline, Cursor, etc.) operate the TestCaseCraft API in natural language.

### Major Changes

#### 🤝 Friendlier Sign-up and Error Messages

- **Friendly Sign-up Failure Responses**: When a username or email is already taken, the API now returns clear Korean messages such as `이미 사용 중인 사용자 이름입니다.` / `이미 등록된 이메일입니다.` together with a `field` indicator pinpointing which value conflicts.
- **Normalized HTTP Status**: Duplicate-registration now returns `409 Conflict` instead of `400 Bad Request`, making conflict situations easier for clients to handle.
- **Pre-validation of Email Duplication**: Sign-up now checks email duplication up front in addition to username, blocking it cleanly before any database exception is raised.
- **Improved Global Data Integrity Handling**: PostgreSQL `duplicate key`, `foreign key`, and `not-null` violation messages are translated into user-friendly Korean copy with column names mapped to Korean labels (e.g. `이메일`, `사용자 이름`, `프로젝트 키`). Internal constraint names (`uk_...`) and raw DB messages are no longer leaked to end users.

#### 🤖 MCP Server: TestCaseCraft × LLM

- **Operate TestCaseCraft in Natural Language**: From MCP-compatible LLM clients such as Claude Desktop, Cline, and Cursor, you can browse and create projects, test cases, executions, reports, RAG chats, and more using natural language.
- **40+ Tools Out of the Box**: 433 REST endpoints are organized into tools for authentication (`auth_*`), projects, test cases (including attachments), executions / results / sessions / plans, dashboards, Jira integration, organizations & users, RAG, and system health.
- **Automatic Authentication & Re-login**: JWT tokens are stored securely and refreshed automatically on expiry.
- **File Attachment Uploads**: Multipart upload is supported so you can attach logs and evidence files to test cases.
- See `mcp-server/README.md` for installation and integration details.

#### 🔧 MCP Tool Enhancements

- **Improved User List Tool**: Switched to the admin user-list endpoint and added `role` (ADMIN/MANAGER/TESTER/USER) and `isActive` filters.
