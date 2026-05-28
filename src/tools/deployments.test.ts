import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerDeploymentTools } from "./deployments.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Deployment Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerDeploymentTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_deployments_get")).toBe(true);
    expect(ctx.tools.has("sevalla_deployments_start")).toBe(true);
    expect(ctx.tools.has("sevalla_deployments_list")).toBe(true);
    expect(ctx.tools.has("sevalla_deployments_cancel")).toBe(true);
    expect(ctx.tools.has("sevalla_deployments_rollback")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla_deployments_get
  // -------------------------------------------------------------------------

  describe("sevalla_deployments_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_deployments_get", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_deployments_get", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1", status: "running" });
      const result = await ctx.callTool("sevalla_deployments_get", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments/deploy-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_deployments_start
  // -------------------------------------------------------------------------

  describe("sevalla_deployments_start", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_deployments_start", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_deployments_start", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-2", status: "queued" });
      const result = await ctx.callTool("sevalla_deployments_start", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments",
          method: "POST",
        })
      );
    });

    it("should include branch when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-3", status: "queued" });
      await ctx.callTool("sevalla_deployments_start", {
        app_id: "app-uuid-1",
        branch: "main",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments",
          body: { branch: "main" },
        })
      );
    });

    it("should include tag when provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-4", status: "queued" });
      await ctx.callTool("sevalla_deployments_start", {
        app_id: "app-uuid-1",
        tag: "v1.0.0",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments",
          body: { tag: "v1.0.0" },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_deployments_list
  // -------------------------------------------------------------------------

  describe("sevalla_deployments_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_deployments_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_deployments_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deployments: [] });
      const result = await ctx.callTool("sevalla_deployments_list", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_deployments_cancel
  // -------------------------------------------------------------------------

  describe("sevalla_deployments_cancel", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_deployments_cancel", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_deployments_cancel", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1", status: "cancelled" });
      const result = await ctx.callTool("sevalla_deployments_cancel", {
        app_id: "app-uuid-1",
        id: "deploy-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments/deploy-uuid-1/cancel",
          method: "POST",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_deployments_rollback
  // -------------------------------------------------------------------------

  describe("sevalla_deployments_rollback", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_deployments_rollback", {
        app_id: "app-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_deployments_rollback", {
        app_id: "app-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1", status: "queued" });
      const result = await ctx.callTool("sevalla_deployments_rollback", {
        app_id: "app-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployments/deploy-uuid-1/rollback",
          method: "POST",
        })
      );
    });
  });
});
