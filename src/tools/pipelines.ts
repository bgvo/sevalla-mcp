/**
 * Sevalla Pipeline Tools
 *
 * Tools for managing Sevalla deployment pipelines.
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

export function registerPipelineTools(server: McpServer): void {
  // sevalla_pipelines_list
  server.registerTool(
    "sevalla_pipelines_list",
    {
      title: "List Pipelines",
      description: "List all deployment pipelines for a company.",
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
        path: "/pipelines",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_get
  server.registerTool(
    "sevalla_pipelines_get",
    {
      title: "Get Pipeline",
      description: "Get details of a specific pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
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
        path: `/pipelines/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_create
  server.registerTool(
    "sevalla_pipelines_create",
    {
      title: "Create Pipeline",
      description: "Create a new deployment pipeline.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        name: z.string().describe("Pipeline name"),
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
        path: "/pipelines",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_update
  server.registerTool(
    "sevalla_pipelines_update",
    {
      title: "Update Pipeline",
      description: "Update an existing pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
        name: z.string().optional().describe("New pipeline name"),
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
        path: `/pipelines/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_delete
  server.registerTool(
    "sevalla_pipelines_delete",
    {
      title: "Delete Pipeline",
      description:
        "Permanently delete a pipeline. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
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
        path: `/pipelines/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_promote
  server.registerTool(
    "sevalla_pipelines_promote",
    {
      title: "Promote Pipeline",
      description: "Promote builds between pipeline stages.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/pipelines/${args.id}/promote`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_stages_create
  server.registerTool(
    "sevalla_pipelines_stages_create",
    {
      title: "Create Pipeline Stage",
      description: "Create a new stage in a pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
        name: z.string().optional().describe("Stage name"),
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
        path: `/pipelines/${args.id}/stages`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "pipeline stage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_stages_delete
  server.registerTool(
    "sevalla_pipelines_stages_delete",
    {
      title: "Delete Pipeline Stage",
      description: "Delete a stage from a pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
        stage_id: z.uuid().describe("Stage UUID"),
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
        path: `/pipelines/${args.id}/stages/${args.stage_id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "pipeline stage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_enable_preview
  server.registerTool(
    "sevalla_pipelines_enable_preview",
    {
      title: "Enable Pipeline Preview",
      description: "Enable preview environments for a pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/pipelines/${args.id}/preview/enable`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla_pipelines_disable_preview
  server.registerTool(
    "sevalla_pipelines_disable_preview",
    {
      title: "Disable Pipeline Preview",
      description: "Disable preview environments for a pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/pipelines/${args.id}/preview/disable`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );
}
