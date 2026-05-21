#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { formatError } from "./errors.js";
import {
  authTools,
  authHandlers,
  projectTools,
  projectHandlers,
  organizationTools,
  organizationHandlers,
  testcaseTools,
  testcaseHandlers,
  testcaseAttachmentTools,
  testcaseAttachmentHandlers,
  testplanTools,
  testplanHandlers,
  testexecutionTools,
  testexecutionHandlers,
  testresultTools,
  testresultHandlers,
  testsessionTools,
  testsessionHandlers,
  dashboardTools,
  dashboardHandlers,
  jiraTools,
  jiraHandlers,
  ragTools,
  ragHandlers,
  systemTools,
  systemHandlers,
} from "./tools/index.js";

// Collect all tools
const allTools = [
  ...authTools,
  ...projectTools,
  ...organizationTools,
  ...testcaseTools,
  ...testcaseAttachmentTools,
  ...testplanTools,
  ...testexecutionTools,
  ...testresultTools,
  ...testsessionTools,
  ...dashboardTools,
  ...jiraTools,
  ...ragTools,
  ...systemTools,
];

// Collect all handlers
const allHandlers: Record<string, (args: unknown) => Promise<unknown>> = {
  ...authHandlers,
  ...projectHandlers,
  ...organizationHandlers,
  ...testcaseHandlers,
  ...testcaseAttachmentHandlers,
  ...testplanHandlers,
  ...testexecutionHandlers,
  ...testresultHandlers,
  ...testsessionHandlers,
  ...dashboardHandlers,
  ...jiraHandlers,
  ...ragHandlers,
  ...systemHandlers,
};

// Create MCP server
const server = new Server(
  { name: "testcasecraft-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  // Find handler
  const handler = allHandlers[name];
  if (!handler) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }

  try {
    const result = await handler(args ?? {});
    const response = {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
    return response;
  } catch (err) {
    const errResponse = formatError(err);
    return errResponse;
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[testcasecraft-mcp] started");
