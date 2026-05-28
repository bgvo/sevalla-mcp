/**
 * Sevalla Application Tools
 *
 * Tools for managing Sevalla applications.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  formatValidationError,
  buildParams,
  resolveClusterId,
  sevallaOutputSchema,
} from "./utils.js";

const clusterIdSchema = z
  .uuid()
  .optional()
  .describe(
    "Cluster UUID (data center). Use sevalla.resources.clusters to list options."
  );

const applicationSourceSchema = z
  .enum(["privateGit", "publicGit", "dockerImage"])
  .describe(
    "Source type: privateGit (OAuth-connected repo), publicGit (public repo URL), dockerImage"
  );

export function registerApplicationTools(server: McpServer): void {
  // sevalla.applications.list
  server.registerTool(
    "sevalla.applications.list",
    {
      title: "List Applications",
      description: "List all applications for a company.",
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
      const params = buildParams({
        company: companyId,
        limit: args.limit?.toString(),
        offset: args.offset?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: "/applications",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.get
  server.registerTool(
    "sevalla.applications.get",
    {
      title: "Get Application",
      description: "Get details of a specific application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.create
  server.registerTool(
    "sevalla.applications.create",
    {
      title: "Create Application",
      description:
        "Create a new application from Git or Docker. Requires cluster_id from sevalla.resources.clusters.",
      inputSchema: z.object({
        display_name: z.string().describe("Display name for the application"),
        cluster_id: clusterIdSchema,
        source: applicationSourceSchema,
        repo_url: z
          .string()
          .optional()
          .describe("Git repository URL (required for privateGit/publicGit)"),
        default_branch: z
          .string()
          .optional()
          .describe("Git branch for deployments"),
        git_type: z
          .enum(["github", "bitbucket", "gitlab"])
          .optional()
          .describe("Git provider (required for some privateGit repos)"),
        docker_image: z
          .string()
          .optional()
          .describe("Docker image reference (required for dockerImage)"),
        docker_registry_credential_id: z
          .string()
          .optional()
          .describe("Docker registry credential UUID"),
        project_id: z.uuid().optional().describe("Project UUID to assign"),
        // Legacy aliases
        repository: z
          .string()
          .optional()
          .describe("Deprecated: use repo_url instead"),
        branch: z
          .string()
          .optional()
          .describe("Deprecated: use default_branch instead"),
        location: z
          .string()
          .optional()
          .describe("Deprecated: use cluster_id (cluster UUID) instead"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const clusterId = resolveClusterId(args.cluster_id, args.location);
      const repoUrl = args.repo_url ?? args.repository;
      const defaultBranch = args.default_branch ?? args.branch;

      if (!clusterId) {
        return formatValidationError(
          args.location
            ? `location "${args.location}" is not a cluster UUID. Call sevalla.resources.clusters and pass cluster_id.`
            : "cluster_id is required. Call sevalla.resources.clusters to list cluster UUIDs."
        );
      }

      if (
        (args.source === "privateGit" || args.source === "publicGit") &&
        !repoUrl
      ) {
        return formatValidationError(
          "repo_url is required when source is privateGit or publicGit."
        );
      }
      if (args.source === "dockerImage" && !args.docker_image) {
        return formatValidationError(
          "docker_image is required when source is dockerImage."
        );
      }

      const body = buildParams({
        display_name: args.display_name,
        cluster_id: clusterId,
        source: args.source,
        repo_url: repoUrl,
        default_branch: defaultBranch,
        git_type: args.git_type,
        docker_image: args.docker_image,
        docker_registry_credential_id: args.docker_registry_credential_id,
        project_id: args.project_id,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/applications",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.update
  server.registerTool(
    "sevalla.applications.update",
    {
      title: "Update Application",
      description: "Update an existing application's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
        display_name: z
          .string()
          .optional()
          .describe("New display name for the application"),
        note: z
          .string()
          .optional()
          .describe("Note or description for the application"),
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
        display_name: args.display_name,
        note: args.note,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.delete
  server.registerTool(
    "sevalla.applications.delete",
    {
      title: "Delete Application",
      description:
        "Permanently delete an application. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.activate
  server.registerTool(
    "sevalla.applications.activate",
    {
      title: "Activate Application",
      description: "Activate a suspended application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/activate`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.suspend
  server.registerTool(
    "sevalla.applications.suspend",
    {
      title: "Suspend Application",
      description: "Suspend a running application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/suspend`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.clone
  server.registerTool(
    "sevalla.applications.clone",
    {
      title: "Clone Application",
      description: "Clone an existing application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID to clone"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}/clone`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );
}
