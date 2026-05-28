/**
 * Sevalla Project Tools
 *
 * Tools for managing Sevalla projects.
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

export function registerProjectTools(server: McpServer): void {
  // sevalla_projects_list
  server.registerTool(
    "sevalla_projects_list",
    {
      title: "List Projects",
      description: "List all projects for a company.",
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
        path: "/projects",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_get
  server.registerTool(
    "sevalla_projects_get",
    {
      title: "Get Project",
      description: "Get details of a specific project.",
      inputSchema: z.object({
        id: z.uuid().describe("Project UUID"),
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
        path: `/projects/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_create
  server.registerTool(
    "sevalla_projects_create",
    {
      title: "Create Project",
      description: "Create a new project.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        name: z.string().describe("Name for the project"),
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
        path: "/projects",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_update
  server.registerTool(
    "sevalla_projects_update",
    {
      title: "Update Project",
      description: "Update an existing project's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Project UUID"),
        name: z.string().optional().describe("New name for the project"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        name: args.name,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/projects/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_delete
  server.registerTool(
    "sevalla_projects_delete",
    {
      title: "Delete Project",
      description:
        "Permanently delete a project. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Project UUID"),
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
        path: `/projects/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_services_add
  server.registerTool(
    "sevalla_projects_services_add",
    {
      title: "Add Service to Project",
      description: "Add a service to an existing project.",
      inputSchema: z.object({
        id: z.uuid().describe("Project UUID"),
        service_id: z.uuid().describe("Service UUID to add"),
        service_type: z.string().describe("Type of the service"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        service_id: args.service_id,
        service_type: args.service_type,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/projects/${args.id}/services`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );

  // sevalla_projects_services_remove
  server.registerTool(
    "sevalla_projects_services_remove",
    {
      title: "Remove Service from Project",
      description: "Remove a service from a project.",
      inputSchema: z.object({
        id: z.uuid().describe("Project UUID"),
        service_id: z.uuid().describe("Service UUID to remove"),
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
        path: `/projects/${args.id}/services/${args.service_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "project");
      return formatSuccess(result.data);
    }
  );
}
