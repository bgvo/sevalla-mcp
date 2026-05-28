import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerWebhookTools } from "./webhooks.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Webhook Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("company-uuid-1");
    registerWebhookTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_webhooks_list")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_get")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_create")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_update")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_toggle")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_roll_secret")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_event_deliveries_list")).toBe(true);
    expect(ctx.tools.has("sevalla_webhooks_event_deliveries_get")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_list
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_webhooks_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_webhooks_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should use company ID from env by default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { webhooks: [] });
      const result = await ctx.callTool("sevalla_webhooks_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks",
          method: "GET",
          params: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });

    it("should accept pagination params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { webhooks: [] });
      await ctx.callTool("sevalla_webhooks_list", {
        limit: 10,
        offset: 20,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            limit: "10",
            offset: "20",
          }),
        })
      );
    });

    it("should use provided company ID over env", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { webhooks: [] });
      await ctx.callTool("sevalla_webhooks_list", {
        company: "custom-company-uuid",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ company: "custom-company-uuid" }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_get
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_get", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_webhooks_get", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "webhook-uuid-1",
        url: "https://example.com/hook",
      });
      const result = await ctx.callTool("sevalla_webhooks_get", {
        id: "webhook-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_create
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_create", {
        url: "https://example.com/hook",
        events: ["deployment.started"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_webhooks_create", {
        url: "https://example.com/hook",
        events: ["deployment.started"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_webhooks_create", {
        url: "https://example.com/hook",
        events: ["deployment.started"],
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "webhook-uuid-2",
        url: "https://example.com/hook",
      });
      const result = await ctx.callTool("sevalla_webhooks_create", {
        company: "company-uuid-1",
        url: "https://example.com/hook",
        events: ["deployment.started", "deployment.completed"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks",
          method: "POST",
          body: {
            company: "company-uuid-1",
            url: "https://example.com/hook",
            events: ["deployment.started", "deployment.completed"],
          },
        })
      );
    });

    it("should use company ID from env when not provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "webhook-uuid-3" });
      await ctx.callTool("sevalla_webhooks_create", {
        url: "https://example.com/hook",
        events: ["deployment.started"],
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_update
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_update", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_webhooks_update", {
        id: "webhook-uuid-1",
        url: "https://example.com/new-hook",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "webhook-uuid-1",
        url: "https://example.com/new-hook",
      });
      const result = await ctx.callTool("sevalla_webhooks_update", {
        id: "webhook-uuid-1",
        url: "https://example.com/new-hook",
        events: ["deployment.started"],
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1",
          method: "PATCH",
          body: {
            url: "https://example.com/new-hook",
            events: ["deployment.started"],
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_delete", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_webhooks_delete", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_webhooks_delete", {
        id: "webhook-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_toggle
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_toggle", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_toggle", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_webhooks_toggle", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "webhook-uuid-1", enabled: true });
      const result = await ctx.callTool("sevalla_webhooks_toggle", {
        id: "webhook-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1/toggle",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_roll_secret
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_roll_secret", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_webhooks_roll_secret", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_webhooks_roll_secret", {
        id: "webhook-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "webhook-uuid-1", secret: "new-secret" });
      const result = await ctx.callTool("sevalla_webhooks_roll_secret", {
        id: "webhook-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1/roll-secret",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_event_deliveries_list
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_event_deliveries_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_list",
        { id: "webhook-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_list",
        { id: "webhook-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deliveries: [] });
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_list",
        { id: "webhook-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1/event-deliveries",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_webhooks_event_deliveries_get
  // ---------------------------------------------------------------------------

  describe("sevalla_webhooks_event_deliveries_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_get",
        { id: "webhook-uuid-1", delivery_id: "delivery-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_get",
        { id: "webhook-uuid-1", delivery_id: "delivery-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "delivery-uuid-1",
        status: "delivered",
      });
      const result = await ctx.callTool(
        "sevalla_webhooks_event_deliveries_get",
        { id: "webhook-uuid-1", delivery_id: "delivery-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/webhooks/webhook-uuid-1/event-deliveries/delivery-uuid-1",
          method: "GET",
        })
      );
    });
  });
});
