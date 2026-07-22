# testcasecraft MCP Server

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for testcasecraft REST API. Enables Claude, Claude Desktop, Cline, and other MCP clients to interact with testcasecraft programmatically.

## Overview

This MCP server bridges the testcasecraft REST API to Claude and other AI tools via the Model Context Protocol. It provides 59 tools for managing projects, test cases, test plans, execution, results, attachments, bookmarks, and more.

**Status:** 59 tools implemented. Includes DELETE operations for attachments and bookmarks. Run `npm run build` (or `npm install`, which triggers the `prepare` hook) after pulling to keep `dist/` in sync with `src/`.

## Installation

### Prerequisites

- Node.js 20+
- npm
- testcasecraft backend running (default: `http://localhost:8080`)

### Setup

```bash
cd mcp-server
npm install
npm run build
```

The compiled server will be in `dist/index.js`.

## Usage

### Starting the Server Directly

```bash
# Development (watch mode)
npm run dev

# Production
npm run build && npm start
```

The server listens on stdin/stdout (Stdio transport).

### Claude Desktop Integration

Edit `~/.claude/claude.json` (or create it):

```json
{
  "mcpServers": {
    "testcasecraft": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "TESTCASECRAFT_BASE_URL": "http://localhost:8080"
      }
    }
  }
}
```

Then restart Claude Desktop.

### Cline / Cursor Integration

Add to your IDE's MCP configuration:

```json
{
  "mcpServers": {
    "testcasecraft": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "TESTCASECRAFT_BASE_URL": "http://localhost:8080"
      }
    }
  }
}
```

## Environment Variables

Configure via `.env` file or environment:

- **TESTCASECRAFT_BASE_URL** (default: `http://localhost:8080`)  
  Base URL of the testcasecraft API

- **TESTCASECRAFT_TOKEN_PATH** (default: `~/.testcasecraft-mcp/token.json`)  
  Path to store authentication tokens (automatically created with 0600 permissions)

- **TESTCASECRAFT_TIMEOUT_MS** (default: `30000`)  
  HTTP request timeout in milliseconds

## Tools (59 Total)

### Authentication (4 tools)

- `auth_login` — Log in with username/password
- `auth_logout` — Log out and clear local token
- `auth_status` — Check current login state
- `auth_refresh` — Manually refresh token

### Projects (4 tools)

- `project_list` — List all projects
- `project_get` — Get project details by ID
- `project_create_or_update` — Create or update project
- `project_members` — List project members

### Organization (3 tools)

- `org_list_organizations` — List organizations
- `org_list_groups` — List groups
- `org_list_users` — List users

### Test Cases (9 tools)

- `testcase_list` — List test cases in a project
- `testcase_get` — Get test case details
- `testcase_search` — Search test cases
- `testcase_create_or_update` — Create or update test case (supports `linkedTestCaseIds` / `linkedDocumentIds` / `linkedJunitTestCaseIds`)
- `testcase_move` — Move test case to another location
- `testcase_move_batch` — Move multiple test cases at once
- `testcase_move_to_project` — Move a test case to another project
- `testcase_copy_to_project` — Copy a test case to another project
- `testcase_versions` — View test case version history

### Test Case Attachments (4 tools)

- `testcase_attachment_upload` — Upload an attachment to a test case
- `testcase_attachment_list` — List attachments of a test case
- `testcase_attachment_get` — Get attachment metadata/content
- `testcase_attachment_delete` — Delete an attachment

### Test Plans (3 tools)

- `testplan_list` — List test plans
- `testplan_get` — Get test plan details
- `testplan_create_or_update` — Create or update test plan

### Test Execution (4 tools)

- `testexecution_list` — List test executions
- `testexecution_get` — Get test execution details
- `testexecution_record_result` — Record test execution result (PASS/FAIL/BLOCKED/NOT_RUN; SKIP is accepted and mapped to BLOCKED)
- `testexecution_update_qa_summary` — Save/update the execution-level QA summary (markdown)

### Test Results (4 tools)

- `testresult_list` — List test results
- `testresult_get` — Get test result details
- `testresult_report_get` — Get test result report
- `testresult_report_html` — Get test result report as HTML

### Test Sessions (2 tools)

- `testsession_list` — List test sessions
- `testsession_get` — Get test session details

### Bookmarks / Favorites (10 tools)

Personal bookmarks — all responses are scoped to the current authenticated user.

- `bookmark_list_collections` — List my bookmark collections for a project
- `bookmark_create_collection` — Create a bookmark collection
- `bookmark_update_collection` — Update a collection's name/description
- `bookmark_delete_collection` — Delete a collection (default collection cannot be deleted)
- `bookmark_list_items` — List items in a collection (read-only case summaries)
- `bookmark_add_item` — Add a test case to a collection
- `bookmark_update_item` — Update a bookmark item's note
- `bookmark_delete_item` — Remove a bookmark item
- `bookmark_toggle_favorite` — Toggle a test case's default-collection favorite (star)
- `bookmark_status` — Get the favorite-status map for a project's cases

### Dashboard (3 tools)

- `dashboard_overview` — Get system-wide dashboard
- `dashboard_by_project` — Get project-specific dashboard
- `dashboard_test_metrics` — Get test metrics and statistics

### Jira Integration (3 tools)

- `jira_status` — Check Jira integration status
- `jira_sync` — Synchronize Jira data
- `jira_list_issues` — List Jira issues

### RAG / Chat (3 tools)

- `rag_chat` — Ask questions about testcasecraft
- `rag_list_conversations` — List chat conversations
- `rag_get_conversation` — Get conversation details

### System (3 tools)

- `system_health` — Check system health
- `system_version` — Get system version
- `system_config` — Get system configuration

## Usage Examples

### Example 1: Login and List Projects

```
User: "Log me into testcasecraft with admin/admin123"
→ MCP calls auth_login(username="admin", password="admin123")
→ Token saved to ~/.testcasecraft-mcp/token.json

User: "Show me all projects"
→ MCP calls project_list()
→ Returns project list with details
```

### Example 2: Search and Update Test Case

```
User: "Find all test cases about login"
→ MCP calls testcase_search(query="login")
→ Returns matching test cases

User: "Update test case 123 to mark it as HIGH priority"
→ MCP calls testcase_create_or_update(id=123, priority="HIGH")
→ Returns updated test case
```

### Example 3: Check Test Execution Status

```
User: "Show me dashboard metrics"
→ MCP calls dashboard_test_metrics()
→ Returns test metrics, pass rates, trends

User: "List all test results"
→ MCP calls testresult_list()
→ Returns paginated test results
```

## Authentication Flow

1. **Login:** User calls `auth_login` with credentials
2. **Token Storage:** Server stores `accessToken`, `refreshToken`, and expiration times in `~/.testcasecraft-mcp/token.json` (0600 permissions)
3. **Auto-Injection:** All subsequent requests automatically include `Authorization: Bearer <token>`
4. **Auto-Refresh:** On 401 responses, server automatically refreshes token using `refreshToken`
5. **Logout:** `auth_logout` deletes the token file

## Error Handling

- **400/422:** Validation error → `McpError(InvalidParams)`
- **401 (after refresh):** Not authenticated → suggest `auth_login`
- **403:** Not authorized → suggest admin
- **404:** Resource not found
- **500+:** Server error
- **Network:** Connection refused → suggest checking backend

## Known Limitations

- No permission/role management tools
- No mail/LLM configuration tools
- No translation management tools
- Single user per MCP server instance (token stored locally)

DELETE (attachments, bookmarks) and batch operations (`testcase_move_batch`, cross-project move/copy) are now supported.

## Architecture

```
src/
├── index.ts                    # MCP server entry point
├── http-client.ts              # Axios + auto-auth interceptors
├── token-store.ts              # Token file I/O (~/.testcasecraft-mcp/token.json)
├── errors.ts                   # McpError formatting
└── tools/
    ├── auth.ts                 # Authentication (4 tools)
    ├── project.ts              # Projects (4 tools)
    ├── organization.ts         # Organizations (3 tools)
    ├── testcase.ts             # Test Cases (9 tools)
    ├── testcase_attachment.ts  # Test Case Attachments (4 tools)
    ├── testplan.ts             # Test Plans (3 tools)
    ├── testexecution.ts        # Test Execution (4 tools)
    ├── testresult.ts           # Test Results (4 tools)
    ├── testsession.ts          # Test Sessions (2 tools)
    ├── bookmark.ts             # Bookmarks / Favorites (10 tools)
    ├── dashboard.ts            # Dashboard (3 tools)
    ├── jira.ts                 # Jira Integration (3 tools)
    ├── rag.ts                  # RAG Chat (3 tools)
    ├── system.ts               # System (3 tools)
    └── index.ts                # Tool exports
```

## Development

### Build

```bash
npm run build
```

TypeScript strict mode enabled. All tools use Zod for input validation.

### Debug

```bash
npm run dev
```

Watch mode rebuilds on file changes.

## Testing

To test manually:

```bash
# Start backend
./gradlew bootRun

# In another terminal, start MCP server
npm start

# Use Claude/Cline/Cursor to interact
```

## Security Notes

- Tokens stored in `~/.testcasecraft-mcp/` with 0600 file permissions, 0700 directory
- No token logs printed to stderr
- Refresh tokens automatically used on token expiration
- Set `TESTCASECRAFT_TOKEN_PATH` to change storage location if needed

## Support

For issues or feature requests:

- Check if testcasecraft backend is running
- Verify environment variables are set
- Review API endpoint paths in `src/tools/*.ts` files
- Check backend logs for 401/403/404 responses

## License

MIT
