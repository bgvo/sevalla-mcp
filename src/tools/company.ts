/**
 * Sevalla Company Tools
 *
 * Tools for viewing company information.
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

export function registerCompanyTools(server: McpServer): void {
  // sevalla_company_users
  server.registerTool(
    "sevalla_company_users",
    {
      title: "List Company Users",
      description: "List all users for a company.",
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
        path: "/users",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
}
