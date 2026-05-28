/**
 * Sevalla Resources Tools
 *
 * Tools for accessing reference data like clusters and resource types.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSevallaClient } from "../sevalla/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  sevallaOutputSchema,
} from "./utils.js";

export function registerResourceTools(server: McpServer): void {
  // sevalla_resources_clusters
  server.registerTool(
    "sevalla_resources_clusters",
    {
      title: "List Clusters",
      description: "List all available clusters/data center locations.",
      inputSchema: {},
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/resources/clusters",
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "cluster");
      return formatSuccess(result.data);
    }
  );

  // sevalla_resources_database_resource_types
  server.registerTool(
    "sevalla_resources_database_resource_types",
    {
      title: "List Database Resource Types",
      description: "List available database machine sizes and configurations.",
      inputSchema: {},
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/resources/database-resource-types",
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "resource type");
      return formatSuccess(result.data);
    }
  );

  // sevalla_resources_process_resource_types
  server.registerTool(
    "sevalla_resources_process_resource_types",
    {
      title: "List Process Resource Types",
      description: "List available process machine sizes and configurations.",
      inputSchema: {},
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (_args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/resources/process-resource-types",
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "resource type");
      return formatSuccess(result.data);
    }
  );
}
