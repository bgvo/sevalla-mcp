/**
 * Sevalla Static Site Tools
 *
 * Tools for managing Sevalla static sites.
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

export function registerStaticSiteTools(server: McpServer): void {
  // sevalla_static_sites_list
  server.registerTool(
    "sevalla_static_sites_list",
    {
      title: "List Static Sites",
      description: "List all static sites for a company.",
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
        path: "/static-sites",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_get
  server.registerTool(
    "sevalla_static_sites_get",
    {
      title: "Get Static Site",
      description: "Get details of a specific static site.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
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
        path: `/static-sites/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_create
  server.registerTool(
    "sevalla_static_sites_create",
    {
      title: "Create Static Site",
      description: "Create a new static site.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        display_name: z.string().describe("Display name for the static site"),
        repository: z.string().describe("Git repository URL"),
        branch: z.string().describe("Git branch to deploy"),
        build_command: z.string().optional().describe("Build command"),
        publish_directory: z.string().optional().describe("Publish directory"),
        location: z
          .string()
          .optional()
          .describe("Data center location identifier"),
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
        repository: args.repository,
        branch: args.branch,
        build_command: args.build_command,
        publish_directory: args.publish_directory,
        location: args.location,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/static-sites",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_update
  server.registerTool(
    "sevalla_static_sites_update",
    {
      title: "Update Static Site",
      description: "Update an existing static site's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
        display_name: z.string().optional().describe("New display name"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        display_name: args.display_name,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/static-sites/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_delete
  server.registerTool(
    "sevalla_static_sites_delete",
    {
      title: "Delete Static Site",
      description:
        "Permanently delete a static site. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
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
        path: `/static-sites/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_deploy
  server.registerTool(
    "sevalla_static_sites_deploy",
    {
      title: "Deploy Static Site",
      description: "Trigger a new deployment for a static site.",
      inputSchema: z.object({
        site_id: z.uuid().describe("Static site UUID"),
        branch: z.string().optional().describe("Git branch to deploy"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        branch: args.branch,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/static-sites/${args.site_id}/deployments`,
        method: "POST",
        body,
      });

      if (!result.success)
        return formatError(result.error, "static site deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_get_deployment
  server.registerTool(
    "sevalla_static_sites_get_deployment",
    {
      title: "Get Static Site Deployment",
      description: "Get details of a specific static site deployment.",
      inputSchema: z.object({
        site_id: z.uuid().describe("Static site UUID"),
        deployment_id: z.uuid().describe("Deployment UUID"),
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
        path: `/static-sites/${args.site_id}/deployments/${args.deployment_id}`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "static site deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla_static_sites_purge_cache
  server.registerTool(
    "sevalla_static_sites_purge_cache",
    {
      title: "Purge Static Site Cache",
      description: "Purge the edge cache for a static site.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/static-sites/${args.id}/purge-edge-cache`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );
}
