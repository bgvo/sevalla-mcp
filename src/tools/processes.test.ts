import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerProcessTools } from "./processes.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Process Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerProcessTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla_processes_list")).toBe(true);
    expect(ctx.tools.has("sevalla_processes_get")).toBe(true);
    expect(ctx.tools.has("sevalla_processes_create")).toBe(true);
    expect(ctx.tools.has("sevalla_processes_update")).toBe(true);
    expect(ctx.tools.has("sevalla_processes_delete")).toBe(true);
    expect(ctx.tools.has("sevalla_processes_trigger_cron")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_list
  // -------------------------------------------------------------------------

  describe("sevalla_processes_list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_processes_list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, [{ id: "proc-uuid-1", name: "web" }]);
      const result = await ctx.callTool("sevalla_processes_list", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_get
  // -------------------------------------------------------------------------

  describe("sevalla_processes_get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_get", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_processes_get", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", name: "web" });
      const result = await ctx.callTool("sevalla_processes_get", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes/proc-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_create
  // -------------------------------------------------------------------------

  describe("sevalla_processes_create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_create", {
        app_id: "app-uuid-1",
        name: "worker",
        command: "npm start",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_processes_create", {
        app_id: "app-uuid-1",
        name: "worker",
        command: "npm start",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-2", name: "worker" });
      const result = await ctx.callTool("sevalla_processes_create", {
        app_id: "app-uuid-1",
        name: "worker",
        command: "npm start",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes",
          method: "POST",
          body: { name: "worker", command: "npm start" },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_update
  // -------------------------------------------------------------------------

  describe("sevalla_processes_update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_update", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla_processes_update", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
        pod_count: 3,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", pod_count: 3 });
      const result = await ctx.callTool("sevalla_processes_update", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
        pod_count: 3,
        size: "large",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes/proc-uuid-1",
          method: "PATCH",
          body: { pod_count: 3, size: "large" },
        })
      );
    });

    it("should filter out undefined body params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", pod_count: 2 });
      await ctx.callTool("sevalla_processes_update", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
        pod_count: 2,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { pod_count: 2 },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_delete
  // -------------------------------------------------------------------------

  describe("sevalla_processes_delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_delete", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla_processes_delete", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla_processes_delete", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes/proc-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla_processes_trigger_cron
  // -------------------------------------------------------------------------

  describe("sevalla_processes_trigger_cron", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla_processes_trigger_cron", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla_processes_trigger_cron", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { triggered: true });
      const result = await ctx.callTool("sevalla_processes_trigger_cron", {
        app_id: "app-uuid-1",
        id: "proc-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/processes/proc-uuid-1/trigger",
          method: "POST",
        })
      );
    });
  });
});
