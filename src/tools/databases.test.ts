import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerDatabaseTools } from "./databases.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Database Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerDatabaseTools(ctx.server);
  });

  it("should register all database tools", () => {
    expect(ctx.tools.has("sevalla_databases_list")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_get")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_create")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_update")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_activate")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_suspend")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_reset_password")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_backups_list")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_backups_create")).toBe(true);
    expect(ctx.tools.has("sevalla_databases_backups_restore")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_list
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla_databases_list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla_databases_list", {
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
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla_databases_list", {
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
  // sevalla_databases_get
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_databases_get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", name: "mydb" });
      const result = await ctx.callTool("sevalla_databases_get", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_create
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_create", {
        display_name: "Test DB",
        type: "postgresql",
        version: "17",
        cluster_id: "fb5e5168-4281-4bec-94c5-0d1584e9e657",
        resource_type_id: "rt-uuid-1",
        db_name: "test_db",
        db_password: "secret123",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_databases_create", {
        display_name: "Test DB",
        type: "postgresql",
        version: "17",
        cluster_id: "fb5e5168-4281-4bec-94c5-0d1584e9e657",
        resource_type_id: "rt-uuid-1",
        db_name: "test_db",
        db_password: "secret123",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return validation error without cluster_id", async () => {
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla_databases_create", {
        display_name: "Test DB",
        type: "postgresql",
        version: "17",
        resource_type_id: "rt-uuid-1",
        db_name: "test_db",
        db_password: "secret123",
      });
      expect(result).toHaveProperty("isError", true);
      expect(ctx.mockClient.request).not.toHaveBeenCalled();
    });

    it("should return success with required v3 fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-db-uuid" });
      const clusterId = "fb5e5168-4281-4bec-94c5-0d1584e9e657";
      const result = await ctx.callTool("sevalla_databases_create", {
        display_name: "Test DB",
        type: "postgresql",
        version: "17",
        cluster_id: clusterId,
        resource_type_id: "rt-uuid-1",
        db_name: "test_db",
        db_password: "secret123",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "POST",
          body: {
            display_name: "Test DB",
            type: "postgresql",
            version: "17",
            cluster_id: clusterId,
            resource_type_id: "rt-uuid-1",
            db_name: "test_db",
            db_password: "secret123",
          },
        })
      );
    });

    it("should map legacy location and resource_type aliases", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-db-uuid" });
      const clusterId = "fb5e5168-4281-4bec-94c5-0d1584e9e657";
      const result = await ctx.callTool("sevalla_databases_create", {
        display_name: "Test DB",
        type: "mariadb",
        version: "10.6",
        location: clusterId,
        resource_type: "rt-uuid-2",
        db_name: "test_db",
        db_password: "secret123",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "POST",
          body: expect.objectContaining({
            cluster_id: clusterId,
            resource_type_id: "rt-uuid-2",
          }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_update
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", display_name: "Updated DB" });
      const result = await ctx.callTool("sevalla_databases_update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
        resource_type_id: "rt-uuid-large",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "PATCH",
          body: {
            display_name: "Updated DB",
            resource_type_id: "rt-uuid-large",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_delete
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_databases_delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_databases_delete", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_activate
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_activate", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_activate", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_activate", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla_databases_activate", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/activate",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_suspend
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_suspend", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_suspend", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_suspend", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla_databases_suspend", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/suspend",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_reset_password
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_reset_password", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_reset_password", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_reset_password", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla_databases_reset_password", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/reset-password",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_backups_list
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_backups_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_backups_list", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_backups_list", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("sevalla_databases_backups_list", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/backups",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_backups_create
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_backups_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_backups_create", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_backups_create", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "backup-uuid-1" });
      const result = await ctx.callTool("sevalla_databases_backups_create", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/backups",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla_databases_backups_restore
  // ---------------------------------------------------------------------------

  describe("sevalla_databases_backups_restore", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_databases_backups_restore", {
        id: "db-uuid-1",
        backup_id: "backup-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_databases_backups_restore", {
        id: "db-uuid-1",
        backup_id: "backup-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { restored: true });
      const result = await ctx.callTool("sevalla_databases_backups_restore", {
        id: "db-uuid-1",
        backup_id: "backup-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1/backups/backup-uuid-1/restore",
          method: "POST",
        })
      );
    });
  });
});
