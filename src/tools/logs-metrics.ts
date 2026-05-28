/**
 * Sevalla Logs & Metrics Tools
 *
 * Tools for accessing application logs and metrics.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
  sevallaOutputSchema,
} from "./utils.js";

export function registerLogsMetricsTools(server: McpServer): void {
  // sevalla_applications_logs_access
  server.registerTool(
    "sevalla_applications_logs_access",
    {
      title: "Get Access Logs",
      description: "Get access logs for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        lines: z
          .number()
          .min(1)
          .max(1000)
          .optional()
          .describe("Number of log lines to return"),
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

      const params = buildParams({
        lines: args.lines?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/access-logs`,
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "access logs");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_logs_runtime
  server.registerTool(
    "sevalla_applications_logs_runtime",
    {
      title: "Get Runtime Logs",
      description: "Get runtime logs for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        lines: z
          .number()
          .min(1)
          .max(1000)
          .optional()
          .describe("Number of log lines to return"),
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

      const params = buildParams({
        lines: args.lines?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/runtime-logs`,
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "runtime logs");
      return formatSuccess(result.data);
    }
  );

  // sevalla_applications_logs_deployment
  server.registerTool(
    "sevalla_applications_logs_deployment",
    {
      title: "Get Deployment Logs",
      description: "Get build/deployment logs for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        lines: z
          .number()
          .min(1)
          .max(1000)
          .optional()
          .describe("Number of log lines to return"),
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

      const params = buildParams({
        lines: args.lines?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/deployment-logs`,
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "deployment logs");
      return formatSuccess(result.data);
    }
  );
}
