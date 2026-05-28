#!/usr/bin/env node
/**
 * Sevalla MCP Server
 *
 * A Model Context Protocol (MCP) server for the Sevalla cloud hosting platform.
 *
 * This server provides tools, resources, and prompts for interacting
 * with the Sevalla API v2 via MCP-compatible clients.
 *
 * Supports two transport modes:
 * - stdio (default): JSON-RPC over stdin/stdout
 * - http: HTTP transport with StreamableHTTP
 *
 * Set MCP_TRANSPORT=http to use HTTP mode.
 *
 * All logging goes to stderr to avoid corrupting JSON-RPC over stdout.
 *
 * @see https://modelcontextprotocol.io/
 * @see https://api-docs.sevalla.com/v2/
 */

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const SERVER_NAME = "sevalla-mcp";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };
const SERVER_VERSION = packageJson.version;

async function startStdioServer(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] Server running on stdio transport`);
}

function createServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Sevalla MCP server for cloud hosting management. " +
        "Start with sevalla_validate to verify connectivity. " +
        "Use sevalla_applications_list to discover applications. " +
        "Use sevalla_databases_list to discover databases. " +
        "Use sevalla_deployments_start to deploy applications.",
    }
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

async function startHttpServerMode(): Promise<void> {
  const { getHttpServerConfig, startHttpServer } =
    await import("./server/index.js");

  const config = getHttpServerConfig();
  await startHttpServer(createServer, config);
}

async function main(): Promise<void> {
  const transport = process.env["MCP_TRANSPORT"] ?? "stdio";
  console.error(
    `[${SERVER_NAME}] Starting server v${SERVER_VERSION} (${transport} transport)...`
  );

  if (transport === "http") {
    await startHttpServerMode();
  } else {
    const server = createServer();

    process.on("SIGTERM", () => {
      void server.close();
    });
    process.on("SIGINT", () => {
      void server.close();
    });

    await startStdioServer(server);
  }
}

main().catch((error: unknown) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
});
