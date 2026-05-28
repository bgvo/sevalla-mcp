/**
 * Shared Tool Utilities
 *
 * Common utilities for MCP tool implementations to reduce code duplication.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface ToolTextContent {
  type: "text";
  text: string;
}

export interface ToolErrorResponse {
  [x: string]: unknown;
  isError: true;
  content: ToolTextContent[];
}

export interface ToolSuccessResponse {
  [x: string]: unknown;
  content: ToolTextContent[];
  structuredContent?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Output Schema
// ---------------------------------------------------------------------------

export const sevallaOutputSchema = z.looseObject({});

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Resolve cluster_id from the current field or the legacy `location` alias.
 * The v3 API expects a cluster UUID, not a region slug.
 */
export function resolveClusterId(
  clusterId: string | undefined,
  legacyLocation: string | undefined
): string | undefined {
  if (clusterId) return clusterId;
  if (legacyLocation && isUuid(legacyLocation)) return legacyLocation;
  return undefined;
}

// ---------------------------------------------------------------------------
// Error Formatting
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN:
    "Your API key is invalid or missing. Set SEVALLA_API_KEY with a valid key from https://app.sevalla.com \u2192 Settings \u2192 API Keys.",
  UNAUTHORIZED:
    "Your API key is invalid or expired. Generate a new key at https://app.sevalla.com \u2192 Settings \u2192 API Keys.",
};

/**
 * Format an error response for MCP tools.
 */
export function formatError(
  error: { code: string; message: string },
  resourceType?: string
): ToolErrorResponse {
  let errorMessage = error.message;

  if (error.code === "NOT_FOUND" && resourceType) {
    errorMessage = `The requested ${resourceType} was not found.`;
  } else {
    const mappedMessage = ERROR_MESSAGES[error.code];
    if (mappedMessage) {
      errorMessage = mappedMessage;
    }
  }

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Sevalla API Error (${error.code}): ${errorMessage}`,
      },
    ],
  };
}

/**
 * Format an authentication error response.
 */
export function formatAuthError(message: string): ToolErrorResponse {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Authentication Error: ${message}`,
      },
    ],
  };
}

/**
 * Format a validation error response.
 */
export function formatValidationError(message: string): ToolErrorResponse {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Success Formatting
// ---------------------------------------------------------------------------

/**
 * Format a successful JSON response.
 */
export function formatSuccess(data: unknown): ToolSuccessResponse {
  const structuredContent = normalizeStructuredContent(data);
  const base: ToolSuccessResponse = {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(structuredContent ?? data, null, 2),
      },
    ],
  };
  if (structuredContent) {
    base.structuredContent = structuredContent;
  }
  return base;
}

/**
 * MCP structured output must be an object. Wrap bare arrays from catalog endpoints.
 */
function normalizeStructuredContent(
  data: unknown
): Record<string, unknown> | undefined {
  if (Array.isArray(data)) {
    return { data };
  }
  if (data !== null && typeof data === "object") {
    return data as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Format a successful message response.
 */
export function formatMessage(message: string): ToolSuccessResponse {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Parameter Building
// ---------------------------------------------------------------------------

/**
 * Build a params object from input, filtering out undefined values.
 */
export function buildParams<T extends Record<string, unknown>>(
  input: T
): Partial<{ [K in keyof T]: Exclude<T[K], undefined> }> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<{ [K in keyof T]: Exclude<T[K], undefined> }>;
}
