import { describe, it, expect } from "vitest";
import {
  formatError,
  formatAuthError,
  formatValidationError,
  formatSuccess,
  formatMessage,
  buildParams,
  resolveClusterId,
  isUuid,
  sevallaOutputSchema,
} from "./utils.js";

describe("Tool Utilities", () => {
  describe("formatError", () => {
    it("should format error with code and message", () => {
      const result = formatError({
        code: "SERVER_ERROR",
        message: "Internal error",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Sevalla API Error");
      expect(result.content[0]?.text).toContain("SERVER_ERROR");
      expect(result.content[0]?.text).toContain("Internal error");
    });

    it("should use mapped message for FORBIDDEN", () => {
      const result = formatError({ code: "FORBIDDEN", message: "raw" });
      expect(result.content[0]?.text).toContain("invalid or missing");
      expect(result.content[0]?.text).toContain("SEVALLA_API_KEY");
    });

    it("should use mapped message for UNAUTHORIZED", () => {
      const result = formatError({ code: "UNAUTHORIZED", message: "raw" });
      expect(result.content[0]?.text).toContain("invalid or expired");
    });

    it("should use custom not-found message when resourceType is given", () => {
      const result = formatError(
        { code: "NOT_FOUND", message: "raw" },
        "application"
      );
      expect(result.content[0]?.text).toContain("application was not found");
    });

    it("should use raw message for NOT_FOUND without resourceType", () => {
      const result = formatError({ code: "NOT_FOUND", message: "raw msg" });
      expect(result.content[0]?.text).toContain("raw msg");
    });
  });

  describe("formatAuthError", () => {
    it("should format authentication error", () => {
      const result = formatAuthError("Missing API key");
      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Authentication Error");
      expect(result.content[0]?.text).toContain("Missing API key");
    });
  });

  describe("formatValidationError", () => {
    it("should format validation error", () => {
      const result = formatValidationError("Invalid application ID");
      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain(
        "Error: Invalid application ID"
      );
    });
  });

  describe("formatSuccess", () => {
    it("should format data as JSON", () => {
      const result = formatSuccess({ name: "test" });
      expect(result.content[0]?.text).toContain('"name": "test"');
    });

    it("should include structuredContent for object data", () => {
      const data = { name: "test" };
      const result = formatSuccess(data);
      expect(result.structuredContent).toEqual(data);
    });

    it("should wrap array data for MCP structured output", () => {
      const data = [{ id: "cluster-1" }];
      const result = formatSuccess(data);
      expect(result.structuredContent).toEqual({ data });
      expect(result.content[0]?.text).toContain('"data"');
    });

    it("should not include structuredContent for non-object data", () => {
      const result = formatSuccess(null);
      expect(result.structuredContent).toBeUndefined();
    });
  });

  describe("resolveClusterId", () => {
    const clusterId = "fb5e5168-4281-4bec-94c5-0d1584e9e657";

    it("should prefer cluster_id", () => {
      expect(resolveClusterId(clusterId, "europe-west1")).toBe(clusterId);
    });

    it("should accept legacy location when it is a UUID", () => {
      expect(resolveClusterId(undefined, clusterId)).toBe(clusterId);
    });

    it("should reject legacy region slugs", () => {
      expect(resolveClusterId(undefined, "europe-west1")).toBeUndefined();
    });
  });

  describe("isUuid", () => {
    it("should validate UUIDs", () => {
      expect(isUuid("fb5e5168-4281-4bec-94c5-0d1584e9e657")).toBe(true);
      expect(isUuid("europe-west1")).toBe(false);
    });
  });

  describe("formatMessage", () => {
    it("should format plain message", () => {
      const result = formatMessage("Hello!");
      expect(result.content[0]?.text).toBe("Hello!");
    });
  });

  describe("buildParams", () => {
    it("should filter out undefined values", () => {
      const result = buildParams({
        company: "company-1",
        format: undefined,
        limit: "10",
      });
      expect(result).toEqual({ company: "company-1", limit: "10" });
    });

    it("should keep falsy but defined values", () => {
      const result = buildParams({
        name: "",
        count: 0,
        active: false,
      });
      expect(result).toEqual({ name: "", count: 0, active: false });
    });
  });

  describe("sevallaOutputSchema", () => {
    it("should accept any object", () => {
      const result = sevallaOutputSchema.safeParse({ foo: "bar" });
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const result = sevallaOutputSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
