# Sevalla MCP Server

[![CI](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/jacob-hartmann/sevalla-mcp/badge.svg?branch=main)](https://coveralls.io/github/jacob-hartmann/sevalla-mcp?branch=main)
[![CodeQL](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/codeql.yml/badge.svg)](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jacob-hartmann/sevalla-mcp/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jacob-hartmann/sevalla-mcp)
[![npm version](https://img.shields.io/npm/v/sevalla-mcp)](https://www.npmjs.com/package/sevalla-mcp)
[![npm downloads](https://img.shields.io/npm/dm/sevalla-mcp)](https://www.npmjs.com/package/sevalla-mcp)
[![License](https://img.shields.io/github/license/jacob-hartmann/sevalla-mcp)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the [Sevalla](https://sevalla.com) cloud hosting platform.

> **Note:** This is a community-supported MCP server, not an official Sevalla product. An official MCP server provided and maintained by Sevalla is available at [sevalla-hosting/mcp](https://github.com/sevalla-hosting/mcp).

Manage your applications, databases, static sites, deployments, pipelines, and more -- all from your AI assistant.

> **This fork ([bgvo/sevalla-mcp](https://github.com/bgvo/sevalla-mcp))** ships **v1.0.1** with Sevalla API v3-aligned create tools (`cluster_id`, `resource_type_id`, `repo_url`, `source`, etc.) and a working `sevalla.validate` endpoint. Pin it in MCP with `github:bgvo/sevalla-mcp#v1.0.1`.

## Quick Start

### Prerequisites

- Node.js v22 or higher
- A Sevalla account with API access
- A Sevalla API key

### Step 1: Get a Sevalla API Key

1. Log in to your [Sevalla](https://sevalla.com) account
2. Navigate to your API key settings
3. Create or copy your API key

### Step 2: Configure Your MCP Client

Choose the setup that matches your MCP client:

#### Claude Desktop (Recommended)

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Claude Code (CLI)

Add to your Claude Code MCP settings (`~/.claude/mcp.json` or project-level):

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Cursor

In Cursor settings, add an MCP server:

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configuration Reference

### Environment Variables

| Variable               | Required | Default                      | Description                                          |
| ---------------------- | -------- | ---------------------------- | ---------------------------------------------------- |
| `SEVALLA_API_KEY`      | Yes      | -                            | Your Sevalla API key                                 |
| `SEVALLA_COMPANY_ID`   | No       | -                            | Default company ID for list operations               |
| `SEVALLA_API_BASE_URL` | No       | `https://api.sevalla.com/v3` | API base URL (override to use v2 or custom endpoint) |
| `MCP_TRANSPORT`        | No       | `stdio`                      | Transport mode: `stdio` or `http`                    |
| `MCP_SERVER_HOST`      | No       | `127.0.0.1`                  | Host to bind the HTTP server to                      |
| `MCP_SERVER_PORT`      | No       | `3000`                       | Port for the HTTP server                             |

## Features

- **118 tools** covering the Sevalla API v3
- **8 resources** for browsing applications, databases, static sites, pipelines, and users
- **3 prompts** for guided deployment, database creation, and API key setup workflows
- **Two transport modes**: stdio (default) and HTTP with StreamableHTTP
- **Security hardened**: helmet, rate limiting, CORS, cache control (HTTP mode)
- **Session management**: LRU-based session cache with idle timeout (HTTP mode)

### Tools

#### Validate

| Tool               | Description                                         | Read-only |
| ------------------ | --------------------------------------------------- | --------- |
| `sevalla.validate` | Validate the Sevalla API key and check connectivity | Yes       |

#### Applications

| Tool                            | Description                                   | Read-only |
| ------------------------------- | --------------------------------------------- | --------- |
| `sevalla.applications.list`     | List all applications for a company           | Yes       |
| `sevalla.applications.get`      | Get details of a specific application         | Yes       |
| `sevalla.applications.create`   | Create a new application                      | No        |
| `sevalla.applications.update`   | Update an application's configuration (PATCH) | No        |
| `sevalla.applications.delete`   | Permanently delete an application             | No        |
| `sevalla.applications.activate` | Reactivate a suspended application            | No        |
| `sevalla.applications.suspend`  | Suspend a running application                 | No        |
| `sevalla.applications.clone`    | Clone an existing application                 | No        |

#### Deployments

| Tool                           | Description                                 | Read-only |
| ------------------------------ | ------------------------------------------- | --------- |
| `sevalla.deployments.list`     | List all deployments for an application     | Yes       |
| `sevalla.deployments.get`      | Get details of a specific deployment        | Yes       |
| `sevalla.deployments.start`    | Trigger a new deployment for an application | No        |
| `sevalla.deployments.cancel`   | Cancel an in-progress deployment            | No        |
| `sevalla.deployments.rollback` | Rollback to a specific deployment           | No        |

#### Processes

| Tool                             | Description                            | Read-only |
| -------------------------------- | -------------------------------------- | --------- |
| `sevalla.processes.list`         | List all processes for an application  | Yes       |
| `sevalla.processes.get`          | Get details of a specific process      | Yes       |
| `sevalla.processes.create`       | Create a new application process       | No        |
| `sevalla.processes.update`       | Update a process configuration (PATCH) | No        |
| `sevalla.processes.delete`       | Delete a non-web process               | No        |
| `sevalla.processes.trigger-cron` | Manually trigger a cron job            | No        |

#### Application Domains

| Tool                                          | Description                           | Read-only |
| --------------------------------------------- | ------------------------------------- | --------- |
| `sevalla.applications.domains.list`           | List all domains for an application   | Yes       |
| `sevalla.applications.domains.add`            | Add a custom domain to an application | No        |
| `sevalla.applications.domains.delete`         | Remove a custom domain                | No        |
| `sevalla.applications.domains.set-primary`    | Set a domain as primary               | No        |
| `sevalla.applications.domains.refresh-status` | Re-check domain verification          | No        |

#### Application Environment Variables

| Tool                                   | Description                            | Read-only |
| -------------------------------------- | -------------------------------------- | --------- |
| `sevalla.applications.env-vars.list`   | List all environment variables         | Yes       |
| `sevalla.applications.env-vars.create` | Create a new environment variable      | No        |
| `sevalla.applications.env-vars.update` | Update an environment variable (PATCH) | No        |
| `sevalla.applications.env-vars.delete` | Delete an environment variable         | No        |

#### Application Logs

| Tool                                   | Description               | Read-only |
| -------------------------------------- | ------------------------- | --------- |
| `sevalla.applications.logs.access`     | Get HTTP access logs      | Yes       |
| `sevalla.applications.logs.runtime`    | Get runtime/stdout logs   | Yes       |
| `sevalla.applications.logs.deployment` | Get build/deployment logs | Yes       |

#### Networking

| Tool                                            | Description                                                     | Read-only |
| ----------------------------------------------- | --------------------------------------------------------------- | --------- |
| `sevalla.networking.purge-cache`                | Purge the edge cache for an application                         | No        |
| `sevalla.networking.create-internal-connection` | Create an internal connection between applications or databases | No        |
| `sevalla.networking.toggle-cdn`                 | Enable or disable CDN for an application                        | No        |

#### Databases

| Tool                                | Description                               | Read-only |
| ----------------------------------- | ----------------------------------------- | --------- |
| `sevalla.databases.list`            | List all databases for a company          | Yes       |
| `sevalla.databases.get`             | Get details of a specific database        | Yes       |
| `sevalla.databases.create`          | Create a new database                     | No        |
| `sevalla.databases.update`          | Update a database's configuration (PATCH) | No        |
| `sevalla.databases.delete`          | Permanently delete a database             | No        |
| `sevalla.databases.activate`        | Reactivate a suspended database           | No        |
| `sevalla.databases.suspend`         | Suspend a running database                | No        |
| `sevalla.databases.reset-password`  | Reset the database password               | No        |
| `sevalla.databases.backups.list`    | List all backups for a database           | Yes       |
| `sevalla.databases.backups.create`  | Create a manual backup                    | No        |
| `sevalla.databases.backups.restore` | Restore from a backup                     | No        |

#### Static Sites

| Tool                                  | Description                                      | Read-only |
| ------------------------------------- | ------------------------------------------------ | --------- |
| `sevalla.static-sites.list`           | List all static sites for a company              | Yes       |
| `sevalla.static-sites.get`            | Get details of a specific static site            | Yes       |
| `sevalla.static-sites.create`         | Create a new static site                         | No        |
| `sevalla.static-sites.update`         | Update a static site's configuration (PATCH)     | No        |
| `sevalla.static-sites.delete`         | Permanently delete a static site                 | No        |
| `sevalla.static-sites.deploy`         | Trigger a new deployment for a static site       | No        |
| `sevalla.static-sites.get-deployment` | Get details of a specific static site deployment | Yes       |
| `sevalla.static-sites.purge-cache`    | Purge the edge cache for a static site           | No        |

#### Pipelines

| Tool                                | Description                        | Read-only |
| ----------------------------------- | ---------------------------------- | --------- |
| `sevalla.pipelines.list`            | List all deployment pipelines      | Yes       |
| `sevalla.pipelines.get`             | Get details of a specific pipeline | Yes       |
| `sevalla.pipelines.create`          | Create a new pipeline              | No        |
| `sevalla.pipelines.update`          | Update a pipeline (PATCH)          | No        |
| `sevalla.pipelines.delete`          | Delete a pipeline                  | No        |
| `sevalla.pipelines.promote`         | Promote builds between stages      | No        |
| `sevalla.pipelines.stages.create`   | Create a new pipeline stage        | No        |
| `sevalla.pipelines.stages.delete`   | Delete a pipeline stage            | No        |
| `sevalla.pipelines.enable-preview`  | Enable preview environments        | No        |
| `sevalla.pipelines.disable-preview` | Disable preview environments       | No        |

#### Load Balancers

| Tool                                         | Description                    | Read-only |
| -------------------------------------------- | ------------------------------ | --------- |
| `sevalla.load-balancers.list`                | List all load balancers        | Yes       |
| `sevalla.load-balancers.get`                 | Get load balancer details      | Yes       |
| `sevalla.load-balancers.create`              | Create a load balancer         | No        |
| `sevalla.load-balancers.update`              | Update a load balancer (PATCH) | No        |
| `sevalla.load-balancers.delete`              | Delete a load balancer         | No        |
| `sevalla.load-balancers.destinations.list`   | List destinations              | Yes       |
| `sevalla.load-balancers.destinations.add`    | Add a destination              | No        |
| `sevalla.load-balancers.destinations.remove` | Remove a destination           | No        |
| `sevalla.load-balancers.destinations.toggle` | Enable/disable a destination   | No        |

#### Object Storage

| Tool                                    | Description              | Read-only |
| --------------------------------------- | ------------------------ | --------- |
| `sevalla.object-storage.list`           | List all storage buckets | Yes       |
| `sevalla.object-storage.get`            | Get bucket details       | Yes       |
| `sevalla.object-storage.create`         | Create a storage bucket  | No        |
| `sevalla.object-storage.update`         | Update a bucket (PATCH)  | No        |
| `sevalla.object-storage.delete`         | Delete a bucket          | No        |
| `sevalla.object-storage.cdn.enable`     | Enable public CDN        | No        |
| `sevalla.object-storage.cdn.disable`    | Disable public CDN       | No        |
| `sevalla.object-storage.objects.list`   | List bucket objects      | Yes       |
| `sevalla.object-storage.objects.delete` | Delete objects by key    | No        |

#### Webhooks

| Tool                                     | Description                   | Read-only |
| ---------------------------------------- | ----------------------------- | --------- |
| `sevalla.webhooks.list`                  | List all webhooks             | Yes       |
| `sevalla.webhooks.get`                   | Get webhook details           | Yes       |
| `sevalla.webhooks.create`                | Create a webhook              | No        |
| `sevalla.webhooks.update`                | Update a webhook (PATCH)      | No        |
| `sevalla.webhooks.delete`                | Delete a webhook              | No        |
| `sevalla.webhooks.toggle`                | Enable/disable a webhook      | No        |
| `sevalla.webhooks.roll-secret`           | Generate a new signing secret | No        |
| `sevalla.webhooks.event-deliveries.list` | List event deliveries         | Yes       |
| `sevalla.webhooks.event-deliveries.get`  | Get delivery details          | Yes       |

#### Projects

| Tool                               | Description                     | Read-only |
| ---------------------------------- | ------------------------------- | --------- |
| `sevalla.projects.list`            | List all projects               | Yes       |
| `sevalla.projects.get`             | Get project details             | Yes       |
| `sevalla.projects.create`          | Create a project                | No        |
| `sevalla.projects.update`          | Update a project (PATCH)        | No        |
| `sevalla.projects.delete`          | Delete a project                | No        |
| `sevalla.projects.services.add`    | Add a service to a project      | No        |
| `sevalla.projects.services.remove` | Remove a service from a project | No        |

#### Docker Registries

| Tool                               | Description                   | Read-only |
| ---------------------------------- | ----------------------------- | --------- |
| `sevalla.docker-registries.list`   | List all registry credentials | Yes       |
| `sevalla.docker-registries.get`    | Get credential details        | Yes       |
| `sevalla.docker-registries.create` | Create a registry credential  | No        |
| `sevalla.docker-registries.update` | Update a credential (PATCH)   | No        |
| `sevalla.docker-registries.delete` | Delete a credential           | No        |

#### Global Environment Variables

| Tool                             | Description                     | Read-only |
| -------------------------------- | ------------------------------- | --------- |
| `sevalla.global-env-vars.list`   | List all global env vars        | Yes       |
| `sevalla.global-env-vars.create` | Create a global env var         | No        |
| `sevalla.global-env-vars.update` | Update a global env var (PATCH) | No        |
| `sevalla.global-env-vars.delete` | Delete a global env var         | No        |

#### API Keys

| Tool                      | Description               | Read-only |
| ------------------------- | ------------------------- | --------- |
| `sevalla.api-keys.list`   | List all API keys         | Yes       |
| `sevalla.api-keys.get`    | Get API key details       | Yes       |
| `sevalla.api-keys.create` | Create a new API key      | No        |
| `sevalla.api-keys.update` | Update an API key (PATCH) | No        |
| `sevalla.api-keys.delete` | Delete an API key         | No        |
| `sevalla.api-keys.rotate` | Rotate an API key token   | No        |
| `sevalla.api-keys.toggle` | Enable/disable an API key | No        |

#### Resources (Reference Data)

| Tool                                        | Description                       | Read-only |
| ------------------------------------------- | --------------------------------- | --------- |
| `sevalla.resources.clusters`                | List available clusters/locations | Yes       |
| `sevalla.resources.database-resource-types` | List database machine sizes       | Yes       |
| `sevalla.resources.process-resource-types`  | List process machine sizes        | Yes       |

#### Company

| Tool                    | Description                  | Read-only |
| ----------------------- | ---------------------------- | --------- |
| `sevalla.company.users` | List all users for a company | Yes       |

### Resources

| Resource           | URI                            | Description                                      |
| ------------------ | ------------------------------ | ------------------------------------------------ |
| Applications       | `sevalla://applications`       | List all applications for the configured company |
| Application Detail | `sevalla://applications/{id}`  | Get details of a specific application            |
| Databases          | `sevalla://databases`          | List all databases for the configured company    |
| Database Detail    | `sevalla://databases/{id}`     | Get details of a specific database               |
| Static Sites       | `sevalla://static-sites`       | List all static sites for the configured company |
| Static Site Detail | `sevalla://static-sites/{id}`  | Get details of a specific static site            |
| Pipelines          | `sevalla://pipelines`          | List all deployment pipelines with stages        |
| Company Users      | `sevalla://company/{id}/users` | List users for a specific company                |

### Prompts

| Prompt               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `deploy-application` | Guided workflow for deploying an application     |
| `create-database`    | Guided workflow for creating a new database      |
| `setup-api-key`      | Instructions for configuring the Sevalla API key |

## Development

### Setup

```bash
# Clone the repo
git clone https://github.com/jacob-hartmann/sevalla-mcp.git
cd sevalla-mcp

# Use the Node.js version from .nvmrc
# (macOS/Linux nvm): nvm install && nvm use
# (Windows nvm-windows): nvm install 22 && nvm use 22
nvm install
nvm use

# Install dependencies
pnpm install

# Copy .env.example and configure
cp .env.example .env
# Edit .env with your API key
```

### Running Locally

```bash
# Development mode (auto-reload)
pnpm dev

# Production build
pnpm build

# Production run
pnpm start
```

### Debugging

You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to debug the server:

```bash
# Run from source
pnpm inspect

# Run from built output
pnpm inspect:dist
```

`pnpm inspect` loads `.env` automatically via `dotenv` (see `.env.example`).

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting vulnerabilities.

## Support

This is a community project provided "as is" with **no guaranteed support**. See [SUPPORT.md](./SUPPORT.md) for details.

## License

MIT © Jacob Hartmann
