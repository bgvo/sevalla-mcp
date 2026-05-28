import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerLoadBalancerTools } from "./load-balancers.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Load Balancer Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerLoadBalancerTools(ctx.server);
  });

  it("should register all load balancer tools", () => {
    expect(ctx.tools.has("sevalla_load_balancers_list")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_get")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_create")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_update")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_destinations_list")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla_load_balancers_destinations_add")).toBe(true);
    expect(ctx.tools.has("sevalla_load_balancers_destinations_remove")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla_load_balancers_destinations_toggle")).toBe(
      true
    );
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_list
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_load_balancers_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_load_balancers_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_load_balancers_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla_load_balancers_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla_load_balancers_list", {
        company: "custom-company-id",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ company: "custom-company-id" }),
        })
      );
    });

    it("should pass limit and offset as string params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla_load_balancers_list", {
        limit: 10,
        offset: 20,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ limit: "10", offset: "20" }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_get
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_load_balancers_get", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_load_balancers_get", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "lb-uuid-1", name: "my-lb" });
      const result = await ctx.callTool("sevalla_load_balancers_get", {
        id: "lb-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_create
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_load_balancers_create", {
        display_name: "Test LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_load_balancers_create", {
        display_name: "Test LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_load_balancers_create", {
        display_name: "Test LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-lb-uuid" });
      const result = await ctx.callTool("sevalla_load_balancers_create", {
        display_name: "Test LB",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "Test LB",
          }),
        })
      );
    });

    it("should pass optional fields in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-lb-uuid" });
      const result = await ctx.callTool("sevalla_load_balancers_create", {
        company: "custom-company-id",
        display_name: "Test LB",
        location: "us-east-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "POST",
          body: {
            company: "custom-company-id",
            display_name: "Test LB",
            location: "us-east-1",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_update
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_load_balancers_update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_load_balancers_update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      const result = await ctx.callTool("sevalla_load_balancers_update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "PATCH",
          body: {
            display_name: "Updated LB",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_load_balancers_delete", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_load_balancers_delete", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_load_balancers_delete", {
        id: "lb-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_destinations_list
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_destinations_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_list",
        { id: "lb-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_list",
        { id: "lb-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { destinations: [] });
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_list",
        { id: "lb-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_destinations_add
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_destinations_add", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "dest-uuid-1" });
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations",
          method: "POST",
          body: { target_id: "target-uuid-1" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_destinations_remove
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_destinations_remove", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations/dest-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_load_balancers_destinations_toggle
  // ---------------------------------------------------------------------------

  describe("sevalla_load_balancers_destinations_toggle", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "dest-uuid-1", enabled: true });
      const result = await ctx.callTool(
        "sevalla_load_balancers_destinations_toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations/dest-uuid-1/toggle",
          method: "POST",
        })
      );
    });
  });
});
