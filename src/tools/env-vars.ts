/**
 * Sevalla Environment Variable Tools
 *
 * Tools for managing application environment variables.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  sevallaOutputSchema,
} from "./utils.js";

export function registerEnvVarTools(server: McpServer): void {
  // sevalla_applications_env_vars_list
  server.registerTool(
    "sevalla_applications_env_vars_list",
    {
      title: "List Environment Variables",
      description: "List all environment variables for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/environment-variables`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_env_vars_create
  server.registerTool(
    "sevalla_applications_env_vars_create",
    {
      title: "Create Environment Variable",
      description: "Create a new environment variable for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        key: z.string().describe("Environment variable key"),
        value: z.string().describe("Environment variable value"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/environment-variables`,
        method: "POST",
        body: { key: args.key, value: args.value },
      });

      if (!result.success)
        return formatError(result.error, "environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_env_vars_update
  server.registerTool(
    "sevalla_applications_env_vars_update",
    {
      title: "Update Environment Variable",
      description: "Update an existing environment variable.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        env_var_id: z.uuid().describe("Environment variable UUID"),
        value: z.string().describe("New environment variable value"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/environment-variables/${args.env_var_id}`,
        method: "PATCH",
        body: { value: args.value },
      });

      if (!result.success)
        return formatError(result.error, "environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_env_vars_delete
  server.registerTool(
    "sevalla_applications_env_vars_delete",
    {
      title: "Delete Environment Variable",
      description: "Delete an environment variable from an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        env_var_id: z.uuid().describe("Environment variable UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/environment-variables/${args.env_var_id}`,
        method: "DELETE",
      });

      if (!result.success)
        return formatError(result.error, "environment variable");
      return formatSuccess(result.data);
    }
  );
}
