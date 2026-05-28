/**
 * Sevalla Networking Tools
 *
 * Tools for managing application networking features.
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

export function registerNetworkingTools(server: McpServer): void {
  // sevalla_networking_purge_cache
  server.registerTool(
    "sevalla_networking_purge_cache",
    {
      title: "Purge Application Cache",
      description: "Purge the edge cache for an application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/purge-edge-cache`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla_networking_create_internal_connection
  server.registerTool(
    "sevalla_networking_create_internal_connection",
    {
      title: "Create Internal Connection",
      description:
        "Create an internal connection between applications or databases.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
        target_id: z.uuid().describe("Target resource UUID to connect to"),
        target_type: z
          .enum(["application", "database"])
          .describe("Type of the target resource"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/internal-connections`,
        method: "POST",
        body: {
          target_id: args.target_id,
          target_type: args.target_type,
        },
      });

      if (!result.success) return formatError(result.error, "connection");
      return formatSuccess(result.data);
    }
  );

  // sevalla_networking_toggle_cdn
  server.registerTool(
    "sevalla_networking_toggle_cdn",
    {
      title: "Toggle CDN",
      description: "Enable or disable CDN for an application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/toggle-cdn`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "CDN");
      return formatSuccess(result.data);
    }
  );
}
