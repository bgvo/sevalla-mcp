/**
 * MCP Prompts Registration
 *
 * Registers all available prompts with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "deploy-application",
    {
      title: "Deploy Application",
      description: "Guided workflow for deploying an application",
      argsSchema: {
        app_id: z
          .string()
          .optional()
          .describe("Application UUID (will list available if omitted)"),
        branch: z
          .string()
          .optional()
          .describe("Git branch to deploy (will ask if omitted)"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me deploy an application on Sevalla.\n\n` +
              (args.app_id ? `Application ID: ${args.app_id}\n` : "") +
              (args.branch ? `Branch: ${args.branch}\n` : "") +
              `\nSteps:\n` +
              `1. ${args.app_id ? "Skip" : "Use sevalla_applications_list to show available applications and help me choose"}\n` +
              `2. ${args.branch ? "Skip" : "Help me choose a branch to deploy"}\n` +
              `3. Use sevalla_deployments_start to trigger the deployment\n` +
              `4. Use sevalla_deployments_get to check deployment status\n` +
              `5. Report the deployment result`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "create-database",
    {
      title: "Create Database",
      description: "Guided workflow for creating a new database",
      argsSchema: {
        type: z
          .string()
          .optional()
          .describe(
            "Database type (postgresql, mariadb, mysql, redis, valkey)"
          ),
        display_name: z
          .string()
          .optional()
          .describe("Display name for the database"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me create a new database on Sevalla.\n\n` +
              (args.type ? `Database type: ${args.type}\n` : "") +
              (args.display_name ? `Name: ${args.display_name}\n` : "") +
              `\nSteps:\n` +
              `1. ${args.type ? "Skip" : "Help me choose a database type (PostgreSQL, MariaDB, MySQL, Redis, or Valkey)"}\n` +
              `2. ${args.display_name ? "Skip" : "Help me choose a name for the database"}\n` +
              `3. Use sevalla_resources_clusters and sevalla_resources_database_resource_types for cluster_id and resource_type_id\n` +
              `4. Collect version, db_name, and db_password, then use sevalla_databases_create\n` +
              `5. Use sevalla_databases_get to confirm creation and show connection details`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "setup-api-key",
    {
      title: "Set Up API Key",
      description: "Instructions for configuring the Sevalla API key",
      argsSchema: {},
    },
    (_args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Help me set up my Sevalla API key for the MCP server.\n\n` +
              `Steps:\n` +
              `1. Log in to your Sevalla account at https://app.sevalla.com\n` +
              `2. Navigate to Settings > API Keys\n` +
              `3. Create or copy your API key\n` +
              `4. Set the SEVALLA_API_KEY environment variable:\n` +
              `   - For Claude Desktop: Add to your MCP server config in claude_desktop_config.json\n` +
              `   - For development: Create a .env file with SEVALLA_API_KEY=your_key_here\n` +
              `5. Optionally set SEVALLA_COMPANY_ID for list operations\n` +
              `6. Restart the MCP server\n` +
              `7. Use sevalla_validate to verify the connection`,
          },
        },
      ],
    })
  );
}
