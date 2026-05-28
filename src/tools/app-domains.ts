/**
 * Sevalla Application Domain Tools
 *
 * Tools for managing application custom domains.
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

export function registerAppDomainTools(server: McpServer): void {
  // sevalla_applications_domains_list
  server.registerTool(
    "sevalla_applications_domains_list",
    {
      title: "List Application Domains",
      description: "List all custom domains for an application.",
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
        path: `/applications/${args.app_id}/domains`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_domains_add
  server.registerTool(
    "sevalla_applications_domains_add",
    {
      title: "Add Application Domain",
      description: "Add a custom domain to an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        hostname: z.string().describe("Domain hostname (e.g., example.com)"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/domains`,
        method: "POST",
        body: { hostname: args.hostname },
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_domains_delete
  server.registerTool(
    "sevalla_applications_domains_delete",
    {
      title: "Delete Application Domain",
      description: "Remove a custom domain from an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        domain_id: z.uuid().describe("Domain UUID"),
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
        path: `/applications/${args.app_id}/domains/${args.domain_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_domains_set_primary
  server.registerTool(
    "sevalla_applications_domains_set_primary",
    {
      title: "Set Primary Domain",
      description: "Set a domain as the primary domain for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        domain_id: z.uuid().describe("Domain UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/domains/${args.domain_id}/set-primary`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_domains_refresh_status
  server.registerTool(
    "sevalla_applications_domains_refresh_status",
    {
      title: "Refresh Domain Status",
      description: "Refresh the DNS/SSL verification status of a domain.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        domain_id: z.uuid().describe("Domain UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/domains/${args.domain_id}/refresh`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "domain");
      return formatSuccess(result.data);
    }
  );
}
