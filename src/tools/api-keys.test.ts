import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerApiKeyTools } from "./api-keys.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("API Key Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerApiKeyTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_api_keys_list")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_get")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_create")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_update")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_rotate")).toBe(true);
    expect(ctx.tools.has("sevalla_api_keys_toggle")).toBe(true);
  });

  describe("sevalla_api_keys_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_api_keys_list", {});
      expect(result).toHaveProperty("isError", true);
      expect(result).toHaveProperty(
        "content.0.text",
        expect.stringContaining("SEVALLA_COMPANY_ID")
      );
      expect(ctx.mockClient.request).not.toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_api_keys_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { api_keys: [] });
      const result = await ctx.callTool("sevalla_api_keys_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });
  });

  describe("sevalla_api_keys_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_get", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_api_keys_get", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "key-uuid-1" });
      const result = await ctx.callTool("sevalla_api_keys_get", {
        id: "key-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys/key-uuid-1",
          method: "GET",
        })
      );
    });
  });

  describe("sevalla_api_keys_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_create", {
        name: "My Key",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_api_keys_create", {
        name: "My Key",
      });
      expect(result).toHaveProperty("isError", true);
      expect(result).toHaveProperty(
        "content.0.text",
        expect.stringContaining("SEVALLA_COMPANY_ID")
      );
      expect(ctx.mockClient.request).not.toHaveBeenCalled();
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_api_keys_create", {
        name: "My Key",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "key-uuid-new" });
      const result = await ctx.callTool("sevalla_api_keys_create", {
        name: "My Key",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            name: "My Key",
          }),
        })
      );
    });
  });

  describe("sevalla_api_keys_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_update", {
        id: "key-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_api_keys_update", {
        id: "key-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "key-uuid-1" });
      const result = await ctx.callTool("sevalla_api_keys_update", {
        id: "key-uuid-1",
        name: "Updated",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys/key-uuid-1",
          method: "PATCH",
          body: { name: "Updated" },
        })
      );
    });
  });

  describe("sevalla_api_keys_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_delete", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_api_keys_delete", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_api_keys_delete", {
        id: "key-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys/key-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  describe("sevalla_api_keys_rotate", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_rotate", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_api_keys_rotate", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { token: "new-token" });
      const result = await ctx.callTool("sevalla_api_keys_rotate", {
        id: "key-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys/key-uuid-1/rotate",
          method: "POST",
        })
      );
    });
  });

  describe("sevalla_api_keys_toggle", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_api_keys_toggle", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_api_keys_toggle", {
        id: "key-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { enabled: false });
      const result = await ctx.callTool("sevalla_api_keys_toggle", {
        id: "key-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api-keys/key-uuid-1/toggle",
          method: "POST",
        })
      );
    });
  });
});
