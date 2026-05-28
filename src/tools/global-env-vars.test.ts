import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerGlobalEnvVarTools } from "./global-env-vars.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Global Environment Variable Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerGlobalEnvVarTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_global_env_vars_list")).toBe(true);
    expect(ctx.tools.has("sevalla_global_env_vars_create")).toBe(true);
    expect(ctx.tools.has("sevalla_global_env_vars_update")).toBe(true);
    expect(ctx.tools.has("sevalla_global_env_vars_delete")).toBe(true);
  });

  describe("sevalla_global_env_vars_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_global_env_vars_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_global_env_vars_list", {});
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
      const result = await ctx.callTool("sevalla_global_env_vars_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { variables: [] });
      const result = await ctx.callTool("sevalla_global_env_vars_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/global-environment-variables",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });
  });

  describe("sevalla_global_env_vars_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_global_env_vars_create", {
        key: "NODE_ENV",
        value: "production",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return clear error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_global_env_vars_create", {
        key: "NODE_ENV",
        value: "production",
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
      const result = await ctx.callTool("sevalla_global_env_vars_create", {
        key: "NODE_ENV",
        value: "production",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "gev-uuid-1" });
      const result = await ctx.callTool("sevalla_global_env_vars_create", {
        key: "NODE_ENV",
        value: "production",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/global-environment-variables",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            key: "NODE_ENV",
            value: "production",
          }),
        })
      );
    });
  });

  describe("sevalla_global_env_vars_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_global_env_vars_update", {
        id: "gev-uuid-1",
        value: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_global_env_vars_update", {
        id: "gev-uuid-1",
        value: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "gev-uuid-1" });
      const result = await ctx.callTool("sevalla_global_env_vars_update", {
        id: "gev-uuid-1",
        value: "staging",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/global-environment-variables/gev-uuid-1",
          method: "PATCH",
          body: { value: "staging" },
        })
      );
    });
  });

  describe("sevalla_global_env_vars_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_global_env_vars_delete", {
        id: "gev-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_global_env_vars_delete", {
        id: "gev-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_global_env_vars_delete", {
        id: "gev-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/global-environment-variables/gev-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
