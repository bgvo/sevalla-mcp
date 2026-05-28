import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerPipelineTools } from "./pipelines.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Pipeline Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerPipelineTools(ctx.server);
  });

  it("should register all pipeline tools", () => {
    expect(ctx.tools.has("sevalla_pipelines_list")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_get")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_create")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_update")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_promote")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_stages_create")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_stages_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_enable_preview")).toBe(true);
    expect(ctx.tools.has("sevalla_pipelines_disable_preview")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_list
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_pipelines_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_pipelines_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla_pipelines_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla_pipelines_list", {
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
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla_pipelines_list", {
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
  // sevalla_pipelines_get
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_get", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_pipelines_get", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "pipeline-uuid-1", name: "my-pipeline" });
      const result = await ctx.callTool("sevalla_pipelines_get", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_create
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_pipelines_create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_pipelines_create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-pipeline-uuid" });
      const result = await ctx.callTool("sevalla_pipelines_create", {
        name: "Test Pipeline",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            name: "Test Pipeline",
          }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_update
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_pipelines_update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "pipeline-uuid-1", name: "Updated" });
      const result = await ctx.callTool("sevalla_pipelines_update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "PATCH",
          body: { name: "Updated" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_pipelines_delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_pipelines_delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_promote
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_promote", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_pipelines_promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { promoted: true });
      const result = await ctx.callTool("sevalla_pipelines_promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/promote",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_stages_create
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_stages_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_stages_create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_pipelines_stages_create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "stage-uuid-1" });
      const result = await ctx.callTool("sevalla_pipelines_stages_create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/stages",
          method: "POST",
          body: { name: "staging" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_stages_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_stages_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_stages_delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_pipelines_stages_delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_pipelines_stages_delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/stages/stage-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_enable_preview
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_enable_preview", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_enable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_pipelines_enable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { enabled: true });
      const result = await ctx.callTool("sevalla_pipelines_enable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/preview/enable",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_pipelines_disable_preview
  // ---------------------------------------------------------------------------

  describe("sevalla_pipelines_disable_preview", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_pipelines_disable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_pipelines_disable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { disabled: true });
      const result = await ctx.callTool("sevalla_pipelines_disable_preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/preview/disable",
          method: "POST",
        })
      );
    });
  });
});
