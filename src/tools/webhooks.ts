/**
 * Sevalla Webhook Tools
 *
 * Tools for managing Sevalla webhooks and event deliveries.
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

export function registerWebhookTools(server: McpServer): void {
  // sevalla_webhooks_list
  server.registerTool(
    "sevalla_webhooks_list",
    {
      title: "List Webhooks",
      description: "List all webhooks for a company.",
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
        path: "/webhooks",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_get
  server.registerTool(
    "sevalla_webhooks_get",
    {
      title: "Get Webhook",
      description: "Get details of a specific webhook.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
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
        path: `/webhooks/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_create
  server.registerTool(
    "sevalla_webhooks_create",
    {
      title: "Create Webhook",
      description: "Create a new webhook.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        url: z.string().describe("Webhook endpoint URL"),
        events: z
          .array(z.string())
          .describe("Array of event types to subscribe to"),
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
        url: args.url,
        events: args.events,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/webhooks",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_update
  server.registerTool(
    "sevalla_webhooks_update",
    {
      title: "Update Webhook",
      description: "Update an existing webhook's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
        url: z.string().optional().describe("New webhook endpoint URL"),
        events: z
          .array(z.string())
          .optional()
          .describe("New array of event types to subscribe to"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        url: args.url,
        events: args.events,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/webhooks/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_delete
  server.registerTool(
    "sevalla_webhooks_delete",
    {
      title: "Delete Webhook",
      description:
        "Permanently delete a webhook. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
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
        path: `/webhooks/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_toggle
  server.registerTool(
    "sevalla_webhooks_toggle",
    {
      title: "Toggle Webhook",
      description: "Toggle a webhook's enabled/disabled state.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/webhooks/${args.id}/toggle`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_roll_secret
  server.registerTool(
    "sevalla_webhooks_roll_secret",
    {
      title: "Roll Webhook Secret",
      description: "Roll (regenerate) the signing secret for a webhook.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/webhooks/${args.id}/roll-secret`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "webhook");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_event_deliveries_list
  server.registerTool(
    "sevalla_webhooks_event_deliveries_list",
    {
      title: "List Webhook Event Deliveries",
      description: "List event deliveries for a specific webhook.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
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
        path: `/webhooks/${args.id}/event-deliveries`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "webhook event delivery");
      return formatSuccess(result.data);
    }
  );

  // sevalla_webhooks_event_deliveries_get
  server.registerTool(
    "sevalla_webhooks_event_deliveries_get",
    {
      title: "Get Webhook Event Delivery",
      description: "Get details of a specific webhook event delivery.",
      inputSchema: z.object({
        id: z.uuid().describe("Webhook UUID"),
        delivery_id: z.uuid().describe("Event delivery UUID"),
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
        path: `/webhooks/${args.id}/event-deliveries/${args.delivery_id}`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "webhook event delivery");
      return formatSuccess(result.data);
    }
  );
}
