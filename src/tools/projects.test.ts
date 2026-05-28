import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerProjectTools } from "./projects.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Project Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("company-uuid-1");
    registerProjectTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_projects_list")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_get")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_create")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_update")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_services_add")).toBe(true);
    expect(ctx.tools.has("sevalla_projects_services_remove")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_list
  // -------------------------------------------------------------------------

  describe("sevalla_projects_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_projects_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_projects_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should use company ID from env by default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { projects: [] });
      const result = await ctx.callTool("sevalla_projects_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects",
          method: "GET",
          params: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });

    it("should accept pagination params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { projects: [] });
      await ctx.callTool("sevalla_projects_list", {
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
      mockRequestSuccess(ctx, { projects: [] });
      await ctx.callTool("sevalla_projects_list", {
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
  // sevalla_projects_get
  // -------------------------------------------------------------------------

  describe("sevalla_projects_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_get", {
        id: "project-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_projects_get", {
        id: "project-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "project-uuid-1", name: "My Project" });
      const result = await ctx.callTool("sevalla_projects_get", {
        id: "project-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects/project-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_create
  // -------------------------------------------------------------------------

  describe("sevalla_projects_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_create", {
        company: "company-uuid-1",
        name: "New Project",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_projects_create", {
        name: "New Project",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_projects_create", {
        company: "company-uuid-1",
        name: "New Project",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "project-uuid-2", name: "New Project" });
      const result = await ctx.callTool("sevalla_projects_create", {
        company: "company-uuid-1",
        name: "New Project",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects",
          method: "POST",
          body: {
            company: "company-uuid-1",
            name: "New Project",
          },
        })
      );
    });

    it("should use company ID from env when not provided", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "project-uuid-2", name: "New Project" });
      await ctx.callTool("sevalla_projects_create", {
        name: "New Project",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_update
  // -------------------------------------------------------------------------

  describe("sevalla_projects_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_update", {
        id: "project-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_projects_update", {
        id: "project-uuid-1",
        name: "New Name",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "project-uuid-1", name: "New Name" });
      const result = await ctx.callTool("sevalla_projects_update", {
        id: "project-uuid-1",
        name: "New Name",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects/project-uuid-1",
          method: "PATCH",
          body: { name: "New Name" },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_delete
  // -------------------------------------------------------------------------

  describe("sevalla_projects_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_delete", {
        id: "project-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_projects_delete", {
        id: "project-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_projects_delete", {
        id: "project-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects/project-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_services_add
  // -------------------------------------------------------------------------

  describe("sevalla_projects_services_add", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_services_add", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
        service_type: "application",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_projects_services_add", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
        service_type: "application",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
      });
      const result = await ctx.callTool("sevalla_projects_services_add", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
        service_type: "application",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects/project-uuid-1/services",
          method: "POST",
          body: {
            service_id: "service-uuid-1",
            service_type: "application",
          },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_projects_services_remove
  // -------------------------------------------------------------------------

  describe("sevalla_projects_services_remove", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_projects_services_remove", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_projects_services_remove", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_projects_services_remove", {
        id: "project-uuid-1",
        service_id: "service-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/projects/project-uuid-1/services/service-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
