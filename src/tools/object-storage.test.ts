import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerObjectStorageTools } from "./object-storage.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Object Storage Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerObjectStorageTools(ctx.server);
  });

  it("should register all object storage tools", () => {
    expect(ctx.tools.has("sevalla_object_storage_list")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_get")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_create")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_update")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_cdn_enable")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_cdn_disable")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_objects_list")).toBe(true);
    expect(ctx.tools.has("sevalla_object_storage_objects_delete")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_list
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_object_storage_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_object_storage_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { object_storages: [] });
      const result = await ctx.callTool("sevalla_object_storage_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { object_storages: [] });
      const result = await ctx.callTool("sevalla_object_storage_list", {
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
      mockRequestSuccess(ctx, { object_storages: [] });
      const result = await ctx.callTool("sevalla_object_storage_list", {
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
  // sevalla_object_storage_get
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_get", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_object_storage_get", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "os-uuid-1", name: "my-storage" });
      const result = await ctx.callTool("sevalla_object_storage_get", {
        id: "os-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_create
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_create", {
        display_name: "Test Storage",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_object_storage_create", {
        display_name: "Test Storage",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_object_storage_create", {
        display_name: "Test Storage",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-os-uuid" });
      const result = await ctx.callTool("sevalla_object_storage_create", {
        display_name: "Test Storage",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "Test Storage",
          }),
        })
      );
    });

    it("should pass optional fields in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-os-uuid" });
      const result = await ctx.callTool("sevalla_object_storage_create", {
        company: "custom-company-id",
        display_name: "Test Storage",
        location: "us-east-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages",
          method: "POST",
          body: {
            company: "custom-company-id",
            display_name: "Test Storage",
            location: "us-east-1",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_update
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_update", {
        id: "os-uuid-1",
        display_name: "Updated Storage",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_object_storage_update", {
        id: "os-uuid-1",
        display_name: "Updated Storage",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "os-uuid-1",
        display_name: "Updated Storage",
      });
      const result = await ctx.callTool("sevalla_object_storage_update", {
        id: "os-uuid-1",
        display_name: "Updated Storage",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1",
          method: "PATCH",
          body: {
            display_name: "Updated Storage",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_delete", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_object_storage_delete", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_object_storage_delete", {
        id: "os-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_cdn_enable
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_cdn_enable", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_cdn_enable", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_object_storage_cdn_enable", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "os-uuid-1" });
      const result = await ctx.callTool("sevalla_object_storage_cdn_enable", {
        id: "os-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1/cdn/enable",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_cdn_disable
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_cdn_disable", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_cdn_disable", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_object_storage_cdn_disable", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "os-uuid-1" });
      const result = await ctx.callTool("sevalla_object_storage_cdn_disable", {
        id: "os-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1/cdn/disable",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_objects_list
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_objects_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_object_storage_objects_list", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_object_storage_objects_list", {
        id: "os-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { objects: [] });
      const result = await ctx.callTool("sevalla_object_storage_objects_list", {
        id: "os-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1/objects",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_object_storage_objects_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_object_storage_objects_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_object_storage_objects_delete",
        { id: "os-uuid-1", keys: ["file1.txt", "file2.txt"] }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla_object_storage_objects_delete",
        { id: "os-uuid-1", keys: ["file1.txt"] }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool(
        "sevalla_object_storage_objects_delete",
        { id: "os-uuid-1", keys: ["file1.txt", "file2.txt"] }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/object-storages/os-uuid-1/objects",
          method: "DELETE",
          body: { keys: ["file1.txt", "file2.txt"] },
        })
      );
    });
  });
});
