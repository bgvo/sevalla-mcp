import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn().mockReturnValue("company-uuid-1"),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerApplicationTools } from "./applications.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Application Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("company-uuid-1");
    registerApplicationTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_applications_list")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_get")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_create")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_update")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_activate")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_suspend")).toBe(true);
    expect(ctx.tools.has("sevalla_applications_clone")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_list
  // -------------------------------------------------------------------------

  describe("sevalla_applications_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_applications_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should use company ID from env by default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { applications: [] });
      const result = await ctx.callTool("sevalla_applications_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications",
          method: "GET",
          params: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });

    it("should accept pagination params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { applications: [] });
      await ctx.callTool("sevalla_applications_list", {
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
      mockRequestSuccess(ctx, { applications: [] });
      await ctx.callTool("sevalla_applications_list", {
        company: "custom-company-uuid",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ company: "custom-company-uuid" }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_get
  // -------------------------------------------------------------------------

  describe("sevalla_applications_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_get", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_applications_get", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", name: "My App" });
      const result = await ctx.callTool("sevalla_applications_get", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_create
  // -------------------------------------------------------------------------

  describe("sevalla_applications_create", () => {
    const clusterId = "fb5e5168-4281-4bec-94c5-0d1584e9e657";

    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_create", {
        display_name: "New App",
        cluster_id: clusterId,
        source: "publicGit",
        repo_url: "https://github.com/org/repo",
        default_branch: "main",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_applications_create", {
        display_name: "New App",
        cluster_id: clusterId,
        source: "publicGit",
        repo_url: "https://github.com/org/repo",
        default_branch: "main",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return validation error without cluster_id", async () => {
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_applications_create", {
        display_name: "New App",
        source: "publicGit",
        repo_url: "https://github.com/org/repo",
      });
      expect(result).toHaveProperty("isError", true);
      expect(ctx.mockClient.request).not.toHaveBeenCalled();
    });

    it("should send POST with v3 body fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-2", display_name: "New App" });
      const result = await ctx.callTool("sevalla_applications_create", {
        display_name: "New App",
        cluster_id: clusterId,
        source: "publicGit",
        repo_url: "https://github.com/org/repo",
        default_branch: "main",
        git_type: "github",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications",
          method: "POST",
          body: {
            display_name: "New App",
            cluster_id: clusterId,
            source: "publicGit",
            repo_url: "https://github.com/org/repo",
            default_branch: "main",
            git_type: "github",
          },
        })
      );
    });

    it("should map legacy repository, branch, and location aliases", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-2" });
      await ctx.callTool("sevalla_applications_create", {
        display_name: "New App",
        location: clusterId,
        source: "publicGit",
        repository: "https://github.com/org/repo",
        branch: "main",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            cluster_id: clusterId,
            repo_url: "https://github.com/org/repo",
            default_branch: "main",
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_update
  // -------------------------------------------------------------------------

  describe("sevalla_applications_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_update", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_applications_update", {
        id: "app-uuid-1",
        display_name: "New Name",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", display_name: "New Name" });
      const result = await ctx.callTool("sevalla_applications_update", {
        id: "app-uuid-1",
        display_name: "New Name",
        note: "Updated note",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "PATCH",
          body: { display_name: "New Name", note: "Updated note" },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_delete
  // -------------------------------------------------------------------------

  describe("sevalla_applications_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_delete", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_applications_delete", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_applications_delete", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_activate
  // -------------------------------------------------------------------------

  describe("sevalla_applications_activate", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_activate", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_applications_activate", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", status: "active" });
      const result = await ctx.callTool("sevalla_applications_activate", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/activate",
          method: "POST",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_suspend
  // -------------------------------------------------------------------------

  describe("sevalla_applications_suspend", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_suspend", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_applications_suspend", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", status: "suspended" });
      const result = await ctx.callTool("sevalla_applications_suspend", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/suspend",
          method: "POST",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_applications_clone
  // -------------------------------------------------------------------------

  describe("sevalla_applications_clone", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_applications_clone", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_applications_clone", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-2", cloned_from: "app-uuid-1" });
      const result = await ctx.callTool("sevalla_applications_clone", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/clone",
          method: "POST",
        })
      );
    });
  });
});
