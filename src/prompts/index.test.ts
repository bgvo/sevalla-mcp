import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./index.js";

type PromptHandler = (args: Record<string, string | undefined>) => any;

interface RegisteredPrompt {
  name: string;
  config: any;
  handler: PromptHandler;
}

function setupPrompts() {
  const prompts: RegisteredPrompt[] = [];

  const server = {
    registerPrompt: vi.fn(
      (name: string, config: any, handler: PromptHandler) => {
        prompts.push({ name, config, handler });
      }
    ),
  } as unknown as McpServer;

  registerPrompts(server);
  return { server, prompts };
}

describe("registerPrompts", () => {
  it("should register all 3 prompts", () => {
    const { server } = setupPrompts();
    expect(server.registerPrompt).toHaveBeenCalledTimes(3);
  });

  describe("deploy-application", () => {
    it("should include app_id and branch when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "deploy-application")!;

      const result = prompt.handler({
        app_id: "app-123",
        branch: "main",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("app-123");
      expect(text).toContain("main");
      expect(text).toContain("Skip");
    });

    it("should ask for app and branch when not provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "deploy-application")!;

      const result = prompt.handler({
        app_id: undefined,
        branch: undefined,
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("sevalla_applications_list");
      expect(text).toContain("help me choose");
    });
  });

  describe("create-database", () => {
    it("should include type and name when provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "create-database")!;

      const result = prompt.handler({
        type: "postgresql",
        display_name: "My DB",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("postgresql");
      expect(text).toContain("My DB");
      expect(text).toContain("Skip");
    });

    it("should ask for type and name when not provided", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "create-database")!;

      const result = prompt.handler({
        type: undefined,
        display_name: undefined,
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("Help me choose a database type");
      expect(text).toContain("Help me choose a name");
    });
  });

  describe("setup-api-key", () => {
    it("should include setup instructions", () => {
      const { prompts } = setupPrompts();
      const prompt = prompts.find((p) => p.name === "setup-api-key")!;

      const result = prompt.handler({});

      const text = result.messages[0].content.text;
      expect(text).toContain("SEVALLA_API_KEY");
      expect(text).toContain("app.sevalla.com");
      expect(text).toContain("sevalla_validate");
    });
  });
});
