/**
 * Sevalla Load Balancer Tools
 *
 * Tools for managing Sevalla load balancers and their destinations.
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

export function registerLoadBalancerTools(server: McpServer): void {
  // sevalla_load_balancers_list
  server.registerTool(
    "sevalla_load_balancers_list",
    {
      title: "List Load Balancers",
      description: "List all load balancers for a company.",
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
        path: "/load-balancers",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "load balancer");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_get
  server.registerTool(
    "sevalla_load_balancers_get",
    {
      title: "Get Load Balancer",
      description: "Get details of a specific load balancer.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
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
        path: `/load-balancers/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "load balancer");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_create
  server.registerTool(
    "sevalla_load_balancers_create",
    {
      title: "Create Load Balancer",
      description: "Create a new load balancer.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        display_name: z.string().describe("Display name for the load balancer"),
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
        path: "/load-balancers",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "load balancer");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_update
  server.registerTool(
    "sevalla_load_balancers_update",
    {
      title: "Update Load Balancer",
      description: "Update an existing load balancer's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
        display_name: z
          .string()
          .optional()
          .describe("New display name for the load balancer"),
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
        path: `/load-balancers/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "load balancer");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_delete
  server.registerTool(
    "sevalla_load_balancers_delete",
    {
      title: "Delete Load Balancer",
      description:
        "Permanently delete a load balancer. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
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
        path: `/load-balancers/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "load balancer");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_destinations_list
  server.registerTool(
    "sevalla_load_balancers_destinations_list",
    {
      title: "List Load Balancer Destinations",
      description: "List all destinations for a load balancer.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
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
        path: `/load-balancers/${args.id}/destinations`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "load balancer destination");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_destinations_add
  server.registerTool(
    "sevalla_load_balancers_destinations_add",
    {
      title: "Add Load Balancer Destination",
      description: "Add a destination to a load balancer.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
        target_id: z.uuid().describe("Target UUID to add as a destination"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        target_id: args.target_id,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/load-balancers/${args.id}/destinations`,
        method: "POST",
        body,
      });

      if (!result.success)
        return formatError(result.error, "load balancer destination");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_destinations_remove
  server.registerTool(
    "sevalla_load_balancers_destinations_remove",
    {
      title: "Remove Load Balancer Destination",
      description: "Remove a destination from a load balancer.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
        dest_id: z.uuid().describe("Destination UUID to remove"),
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
        path: `/load-balancers/${args.id}/destinations/${args.dest_id}`,
        method: "DELETE",
      });

      if (!result.success)
        return formatError(result.error, "load balancer destination");
      return formatSuccess(result.data);
    }
  );

  // sevalla_load_balancers_destinations_toggle
  server.registerTool(
    "sevalla_load_balancers_destinations_toggle",
    {
      title: "Toggle Load Balancer Destination",
      description: "Toggle a destination on or off for a load balancer.",
      inputSchema: z.object({
        id: z.uuid().describe("Load balancer UUID"),
        dest_id: z.uuid().describe("Destination UUID to toggle"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/load-balancers/${args.id}/destinations/${args.dest_id}/toggle`,
        method: "POST",
      });

      if (!result.success)
        return formatError(result.error, "load balancer destination");
      return formatSuccess(result.data);
    }
  );
}
