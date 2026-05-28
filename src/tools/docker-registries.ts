/**
 * Sevalla Docker Registry Tools
 *
 * Tools for managing Docker registry credentials.
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

export function registerDockerRegistryTools(server: McpServer): void {
  // sevalla_docker_registries_list
  server.registerTool(
    "sevalla_docker_registries_list",
    {
      title: "List Docker Registries",
      description: "List all Docker registry credentials.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of results (1-100)"),
        offset: z
          .number()
          .min(0)
          .optional()
          .describe("Number of results to skip"),
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
        limit: args.limit?.toString(),
        offset: args.offset?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: "/docker-registries",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "docker registry");
      return formatSuccess(result.data);
    }
  );

  // sevalla_docker_registries_get
  server.registerTool(
    "sevalla_docker_registries_get",
    {
      title: "Get Docker Registry",
      description: "Get details of a specific Docker registry credential.",
      inputSchema: z.object({
        id: z.uuid().describe("Docker registry UUID"),
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
        path: `/docker-registries/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "docker registry");
      return formatSuccess(result.data);
    }
  );

  // sevalla_docker_registries_create
  server.registerTool(
    "sevalla_docker_registries_create",
    {
      title: "Create Docker Registry",
      description: "Create a new Docker registry credential.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        display_name: z.string().describe("Display name for the registry"),
        registry_url: z.string().describe("Docker registry URL"),
        username: z.string().describe("Registry username"),
        password: z.string().describe("Registry password or token"),
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
        display_name: args.display_name,
        registry_url: args.registry_url,
        username: args.username,
        password: args.password,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/docker-registries",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "docker registry");
      return formatSuccess(result.data);
    }
  );

  // sevalla_docker_registries_update
  server.registerTool(
    "sevalla_docker_registries_update",
    {
      title: "Update Docker Registry",
      description: "Update a Docker registry credential.",
      inputSchema: z.object({
        id: z.uuid().describe("Docker registry UUID"),
        display_name: z.string().optional().describe("New display name"),
        username: z.string().optional().describe("New username"),
        password: z.string().optional().describe("New password or token"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        display_name: args.display_name,
        username: args.username,
        password: args.password,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/docker-registries/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "docker registry");
      return formatSuccess(result.data);
    }
  );

  // sevalla_docker_registries_delete
  server.registerTool(
    "sevalla_docker_registries_delete",
    {
      title: "Delete Docker Registry",
      description:
        "Permanently delete a Docker registry credential. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Docker registry UUID"),
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
        path: `/docker-registries/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "docker registry");
      return formatSuccess(result.data);
    }
  );
}
