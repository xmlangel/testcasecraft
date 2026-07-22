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
  bookmarkTools,
  bookmarkHandlers,
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
  ...bookmarkTools,
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
  ...bookmarkHandlers,
  ...dashboardHandlers,
  ...jiraHandlers,
  ...ragHandlers,
  ...systemHandlers,
};

// 배선 불변식 가드: allTools ⊆ allHandlers + 도구명 유일성.
// 새 도구를 tools 배열에만 넣고 handler 배선을 빠뜨리면 런타임 MethodNotFound 가
// 나기 전에 부팅 시점에서 즉시 실패시킨다(컴파일러가 못 잡는 배선 누락 방어).
export function assertWiring(
  tools: { name: string }[],
  handlers: Record<string, unknown>,
): void {
  const seen = new Set<string>();
  const dupes: string[] = [];
  const missing: string[] = [];
  for (const t of tools) {
    if (seen.has(t.name)) dupes.push(t.name);
    seen.add(t.name);
    if (!(t.name in handlers)) missing.push(t.name);
  }
  const orphanHandlers = Object.keys(handlers).filter((h) => !seen.has(h));
  const problems: string[] = [];
  if (dupes.length) problems.push(`중복 도구명: ${dupes.join(", ")}`);
  if (missing.length) problems.push(`핸들러 없는 도구: ${missing.join(", ")}`);
  if (orphanHandlers.length)
    problems.push(`도구 없는 핸들러: ${orphanHandlers.join(", ")}`);
  if (problems.length) {
    throw new Error(
      `[testcasecraft-mcp] 배선 불변식 위반 — ${problems.join(" / ")}`,
    );
  }
}

assertWiring(allTools, allHandlers);

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
