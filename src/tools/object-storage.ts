/**
 * Sevalla Object Storage Tools
 *
 * Tools for managing Sevalla object storage buckets, CDN, and objects.
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

export function registerObjectStorageTools(server: McpServer): void {
  // sevalla_object_storage_list
  server.registerTool(
    "sevalla_object_storage_list",
    {
      title: "List Object Storages",
      description: "List all object storages for a company.",
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
        path: "/object-storages",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_get
  server.registerTool(
    "sevalla_object_storage_get",
    {
      title: "Get Object Storage",
      description: "Get details of a specific object storage.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
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
        path: `/object-storages/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_create
  server.registerTool(
    "sevalla_object_storage_create",
    {
      title: "Create Object Storage",
      description: "Create a new object storage.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        display_name: z
          .string()
          .describe("Display name for the object storage"),
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
        location: args.location,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/object-storages",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_update
  server.registerTool(
    "sevalla_object_storage_update",
    {
      title: "Update Object Storage",
      description: "Update an existing object storage's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
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
        path: `/object-storages/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_delete
  server.registerTool(
    "sevalla_object_storage_delete",
    {
      title: "Delete Object Storage",
      description:
        "Permanently delete an object storage. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
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
        path: `/object-storages/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_cdn_enable
  server.registerTool(
    "sevalla_object_storage_cdn_enable",
    {
      title: "Enable Object Storage CDN",
      description: "Enable CDN for an object storage.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/object-storages/${args.id}/cdn/enable`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_cdn_disable
  server.registerTool(
    "sevalla_object_storage_cdn_disable",
    {
      title: "Disable Object Storage CDN",
      description: "Disable CDN for an object storage.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/object-storages/${args.id}/cdn/disable`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "object storage");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_objects_list
  server.registerTool(
    "sevalla_object_storage_objects_list",
    {
      title: "List Object Storage Objects",
      description: "List all objects in an object storage.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
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
        path: `/object-storages/${args.id}/objects`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "object storage object");
      return formatSuccess(result.data);
    }
  );

  // sevalla_object_storage_objects_delete
  server.registerTool(
    "sevalla_object_storage_objects_delete",
    {
      title: "Delete Object Storage Objects",
      description:
        "Delete objects from an object storage by their keys. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Object storage UUID"),
        keys: z.array(z.string()).describe("Array of object keys to delete"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/object-storages/${args.id}/objects`,
        method: "DELETE",
        body: { keys: args.keys },
      });

      if (!result.success)
        return formatError(result.error, "object storage object");
      return formatSuccess(result.data);
    }
  );
}
