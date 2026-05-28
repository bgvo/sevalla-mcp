import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerNetworkingTools } from "./networking.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Networking Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerNetworkingTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_networking_purge_cache")).toBe(true);
    expect(ctx.tools.has("sevalla_networking_create_internal_connection")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla_networking_toggle_cdn")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla_networking_purge_cache
  // -------------------------------------------------------------------------

  describe("sevalla_networking_purge_cache", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_networking_purge_cache", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_networking_purge_cache", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { cleared: true });
      const result = await ctx.callTool("sevalla_networking_purge_cache", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/purge-edge-cache",
          method: "POST",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_networking_create_internal_connection
  // -------------------------------------------------------------------------

  describe("sevalla_networking_create_internal_connection", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_networking_create_internal_connection",
        {
          id: "app-uuid-1",
          target_id: "db-uuid-1",
          target_type: "database",
        }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool(
        "sevalla_networking_create_internal_connection",
        {
          id: "app-uuid-1",
          target_id: "db-uuid-1",
          target_type: "database",
        }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "conn-uuid-1" });
      const result = await ctx.callTool(
        "sevalla_networking_create_internal_connection",
        {
          id: "app-uuid-1",
          target_id: "db-uuid-1",
          target_type: "database",
        }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/internal-connections",
          method: "POST",
          body: {
            target_id: "db-uuid-1",
            target_type: "database",
          },
        })
      );
    });

    it("should support application target type", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "conn-uuid-2" });
      await ctx.callTool("sevalla_networking_create_internal_connection", {
        id: "app-uuid-1",
        target_id: "app-uuid-2",
        target_type: "application",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            target_id: "app-uuid-2",
            target_type: "application",
          },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_networking_toggle_cdn
  // -------------------------------------------------------------------------

  describe("sevalla_networking_toggle_cdn", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_networking_toggle_cdn", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_networking_toggle_cdn", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { cdn_enabled: true });
      const result = await ctx.callTool("sevalla_networking_toggle_cdn", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/toggle-cdn",
          method: "POST",
        })
      );
    });
  });
});
