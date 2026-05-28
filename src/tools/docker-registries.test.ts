import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerDockerRegistryTools } from "./docker-registries.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Docker Registry Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerDockerRegistryTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_docker_registries_list")).toBe(true);
    expect(ctx.tools.has("sevalla_docker_registries_get")).toBe(true);
    expect(ctx.tools.has("sevalla_docker_registries_create")).toBe(true);
    expect(ctx.tools.has("sevalla_docker_registries_update")).toBe(true);
    expect(ctx.tools.has("sevalla_docker_registries_delete")).toBe(true);
  });

  describe("sevalla_docker_registries_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_docker_registries_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_docker_registries_list", {});
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
      const result = await ctx.callTool("sevalla_docker_registries_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { registries: [] });
      const result = await ctx.callTool("sevalla_docker_registries_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });
  });

  describe("sevalla_docker_registries_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_docker_registries_get", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_docker_registries_get", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-1" });
      const result = await ctx.callTool("sevalla_docker_registries_get", {
        id: "reg-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "GET",
        })
      );
    });
  });

  describe("sevalla_docker_registries_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_docker_registries_create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_docker_registries_create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
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
      const result = await ctx.callTool("sevalla_docker_registries_create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-new" });
      const result = await ctx.callTool("sevalla_docker_registries_create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "My Registry",
          }),
        })
      );
    });
  });

  describe("sevalla_docker_registries_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_docker_registries_update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_docker_registries_update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-1" });
      const result = await ctx.callTool("sevalla_docker_registries_update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "PATCH",
          body: { display_name: "Updated" },
        })
      );
    });
  });

  describe("sevalla_docker_registries_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_docker_registries_delete", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_docker_registries_delete", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_docker_registries_delete", {
        id: "reg-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
