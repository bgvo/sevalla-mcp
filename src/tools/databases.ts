/**
 * Sevalla Database Tools
 *
 * Tools for managing Sevalla databases.
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
  .describe(
    "Cluster UUID (data center). Use sevalla_resources_clusters to list options."
  );

const databaseTypeSchema = z
  .enum(["postgresql", "mariadb", "mysql", "redis", "valkey"])
  .describe("Database engine type");

export function registerDatabaseTools(server: McpServer): void {
  // sevalla_databases_list
  server.registerTool(
    "sevalla_databases_list",
    {
      title: "List Databases",
      description: "List all databases for a company.",
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
        path: "/databases",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_get
  server.registerTool(
    "sevalla_databases_get",
    {
      title: "Get Database",
      description: "Get details of a specific database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
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
        path: `/databases/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_create
  server.registerTool(
    "sevalla_databases_create",
    {
      title: "Create Database",
      description:
        "Create a new database. Requires cluster_id and resource_type_id from sevalla_resources_clusters and sevalla_resources_database_resource_types.",
      inputSchema: z.object({
        display_name: z.string().describe("Display name for the database"),
        type: databaseTypeSchema,
        version: z.string().describe("Database engine version (e.g. 17)"),
        cluster_id: clusterIdSchema.optional(),
        resource_type_id: z
          .string()
          .optional()
          .describe(
            "Database resource type UUID. Use sevalla_resources_database_resource_types."
          ),
        db_name: z
          .string()
          .describe("Database name inside the server (alphanumeric, _, -, +)"),
        db_password: z.string().describe("Password for the database user"),
        db_user: z
          .string()
          .optional()
          .describe("Database username (optional; engine default if omitted)"),
        project_id: z.uuid().optional().describe("Project UUID to assign"),
        extensions: z
          .array(z.string())
          .optional()
          .describe("PostgreSQL extensions to enable"),
        // Legacy aliases kept for older prompts/tools (mapped before the API call)
        location: z
          .string()
          .optional()
          .describe("Deprecated: use cluster_id (cluster UUID) instead"),
        resource_type: z
          .string()
          .optional()
          .describe("Deprecated: use resource_type_id instead"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const clusterId = resolveClusterId(args.cluster_id, args.location);
      const resourceTypeId = args.resource_type_id ?? args.resource_type;

      if (!clusterId) {
        return formatValidationError(
          args.location
            ? `location "${args.location}" is not a cluster UUID. Call sevalla_resources_clusters and pass cluster_id.`
            : "cluster_id is required. Call sevalla_resources_clusters to list cluster UUIDs."
        );
      }
      if (!resourceTypeId) {
        return formatValidationError(
          "resource_type_id is required. Call sevalla_resources_database_resource_types to list options."
        );
      }

      const body = buildParams({
        display_name: args.display_name,
        type: args.type,
        version: args.version,
        cluster_id: clusterId,
        resource_type_id: resourceTypeId,
        db_name: args.db_name,
        db_password: args.db_password,
        db_user: args.db_user,
        project_id: args.project_id,
        extensions: args.extensions,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/databases",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_update
  server.registerTool(
    "sevalla_databases_update",
    {
      title: "Update Database",
      description: "Update an existing database's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
        display_name: z.string().optional().describe("New display name"),
        resource_type_id: z
          .string()
          .optional()
          .describe("New database resource type UUID"),
        resource_type: z
          .string()
          .optional()
          .describe("Deprecated: use resource_type_id instead"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const resourceTypeId = args.resource_type_id ?? args.resource_type;
      const body = buildParams({
        display_name: args.display_name,
        resource_type_id: resourceTypeId,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_delete
  server.registerTool(
    "sevalla_databases_delete",
    {
      title: "Delete Database",
      description:
        "Permanently delete a database. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
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
        path: `/databases/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_activate
  server.registerTool(
    "sevalla_databases_activate",
    {
      title: "Activate Database",
      description: "Activate a suspended database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}/activate`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_suspend
  server.registerTool(
    "sevalla_databases_suspend",
    {
      title: "Suspend Database",
      description: "Suspend a running database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}/suspend`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_reset_password
  server.registerTool(
    "sevalla_databases_reset_password",
    {
      title: "Reset Database Password",
      description: "Reset the password for a database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}/reset-password`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_backups_list
  server.registerTool(
    "sevalla_databases_backups_list",
    {
      title: "List Database Backups",
      description: "List all backups for a database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
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
        path: `/databases/${args.id}/backups`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "database backup");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_backups_create
  server.registerTool(
    "sevalla_databases_backups_create",
    {
      title: "Create Database Backup",
      description: "Create a new backup for a database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}/backups`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "database backup");
      return formatSuccess(result.data);
    }
  );

  // sevalla_databases_backups_restore
  server.registerTool(
    "sevalla_databases_backups_restore",
    {
      title: "Restore Database Backup",
      description: "Restore a database from a backup.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
        backup_id: z.uuid().describe("Backup UUID to restore"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}/backups/${args.backup_id}/restore`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "database backup");
      return formatSuccess(result.data);
    }
  );
}
