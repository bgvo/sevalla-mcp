/**
 * sevalla.validate Tool
 *
 * Validate Sevalla API credentials.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSevallaClient } from "../sevalla/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  sevallaOutputSchema,
} from "./utils.js";

export function registerValidateTool(server: McpServer): void {
  server.registerTool(
    "sevalla.validate",
    {
      title: "Validate API Key",
      description:
        "Validate the Sevalla API key and check connectivity to the Sevalla API.",
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
        path: "/api-keys/validate",
        method: "GET",
      });

      if (!result.success) return formatError(result.error);
      return formatSuccess(result.data);
    }
  );
}
