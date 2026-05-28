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
    expect(ctx.tools.has("sevalla.databases.list")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.get")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.create")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.update")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.activate")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.suspend")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.reset-password")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.backups.list")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.backups.create")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.backups.restore")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.databases.list
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla.databases.list", {});
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
      const result = await ctx.callTool("sevalla.databases.list", {
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
      const result = await ctx.callTool("sevalla.databases.list", {
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
  // sevalla.databases.get
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.databases.get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", name: "mydb" });
      const result = await ctx.callTool("sevalla.databases.get", {
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
  // sevalla.databases.create
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.create", {
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
      const result = await ctx.callTool("sevalla.databases.create", {
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
      const result = await ctx.callTool("sevalla.databases.create", {
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
      const result = await ctx.callTool("sevalla.databases.create", {
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
      const result = await ctx.callTool("sevalla.databases.create", {
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
  // sevalla.databases.update
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", display_name: "Updated DB" });
      const result = await ctx.callTool("sevalla.databases.update", {
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
  // sevalla.databases.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.databases.delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.databases.delete", {
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
  // sevalla.databases.activate
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.activate", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.activate", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.activate", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla.databases.activate", {
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
  // sevalla.databases.suspend
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.suspend", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.suspend", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.suspend", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla.databases.suspend", {
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
  // sevalla.databases.reset-password
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.reset-password", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.reset-password", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.reset-password", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1" });
      const result = await ctx.callTool("sevalla.databases.reset-password", {
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
  // sevalla.databases.backups.list
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.backups.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.backups.list", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.backups.list", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { backups: [] });
      const result = await ctx.callTool("sevalla.databases.backups.list", {
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
  // sevalla.databases.backups.create
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.backups.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.backups.create", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.backups.create", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "backup-uuid-1" });
      const result = await ctx.callTool("sevalla.databases.backups.create", {
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
  // sevalla.databases.backups.restore
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.backups.restore", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.backups.restore", {
        id: "db-uuid-1",
        backup_id: "backup-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.backups.restore", {
        id: "db-uuid-1",
        backup_id: "backup-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { restored: true });
      const result = await ctx.callTool("sevalla.databases.backups.restore", {
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
