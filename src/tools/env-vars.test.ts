import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerEnvVarTools } from "./env-vars.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Environment Variable Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerEnvVarTools(ctx.server);
  });

  it("should register all env var tools", () => {
    expect(ctx.tools.has("sevalla_applications_env_vars_list")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_env_vars_create")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_env_vars_update")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_env_vars_delete")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla_applications_env_vars_list
  // ---------------------------------------------------------------------------

  describe("sevalla_applications_env_vars_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_env_vars_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_applications_env_vars_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { env_vars: [] });
      const result = await ctx.callTool("sevalla_applications_env_vars_list", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_applications_env_vars_create
  // ---------------------------------------------------------------------------

  describe("sevalla_applications_env_vars_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "env-var-uuid-1" });
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables",
          method: "POST",
          body: { key: "NODE_ENV", value: "production" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_applications_env_vars_update
  // ---------------------------------------------------------------------------

  describe("sevalla_applications_env_vars_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "env-var-uuid-1", value: "staging" });
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables/env-var-uuid-1",
          method: "PATCH",
          body: { value: "staging" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_applications_env_vars_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_applications_env_vars_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool(
        "sevalla_applications_env_vars_delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables/env-var-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
