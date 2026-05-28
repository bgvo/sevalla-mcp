/**
 * Sevalla API Keys Tools
 *
 * Tools for managing API keys programmatically.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
  sevallaOutputSchema,
} from "./utils.js";

export function registerApiKeyTools(server: McpServer): void {
  // sevalla_api_keys_list
  server.registerTool(
    "sevalla_api_keys_list",
    {
      title: "List API Keys",
      description: "List all API keys for a company.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
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

      const companyId = args.company ?? getCompanyId();
      if (!companyId) {
        return formatAuthError(
          "No company ID provided. Pass 'company' or set SEVALLA_COMPANY_ID."
        );
      }
      const params = buildParams({
        company: companyId,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/api-keys",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_get
  server.registerTool(
    "sevalla_api_keys_get",
    {
      title: "Get API Key",
      description: "Get details of a specific API key.",
      inputSchema: z.object({
        id: z.uuid().describe("API key UUID"),
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
        path: `/api-keys/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_create
  server.registerTool(
    "sevalla_api_keys_create",
    {
      title: "Create API Key",
      description:
        "Create a new API key with specified roles and capabilities.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        name: z.string().describe("API key name"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = args.company ?? getCompanyId();
      if (!companyId) {
        return formatAuthError(
          "No company ID provided. Pass 'company' or set SEVALLA_COMPANY_ID."
        );
      }
      const body = buildParams({
        company: companyId,
        name: args.name,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/api-keys",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_update
  server.registerTool(
    "sevalla_api_keys_update",
    {
      title: "Update API Key",
      description: "Update an API key's name, roles, or capabilities.",
      inputSchema: z.object({
        id: z.uuid().describe("API key UUID"),
        name: z.string().optional().describe("New API key name"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        name: args.name,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/api-keys/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_delete
  server.registerTool(
    "sevalla_api_keys_delete",
    {
      title: "Delete API Key",
      description:
        "Permanently delete an API key. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("API key UUID"),
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
        path: `/api-keys/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_rotate
  server.registerTool(
    "sevalla_api_keys_rotate",
    {
      title: "Rotate API Key",
      description: "Generate a new token for an API key.",
      inputSchema: z.object({
        id: z.uuid().describe("API key UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/api-keys/${args.id}/rotate`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );

  // sevalla_api_keys_toggle
  server.registerTool(
    "sevalla_api_keys_toggle",
    {
      title: "Toggle API Key",
      description: "Enable or disable an API key.",
      inputSchema: z.object({
        id: z.uuid().describe("API key UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/api-keys/${args.id}/toggle`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "API key");
      return formatSuccess(result.data);
    }
  );
}
