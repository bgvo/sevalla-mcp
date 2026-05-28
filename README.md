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

> **This fork ([bgvo/sevalla-mcp](https://github.com/bgvo/sevalla-mcp))** ships **v1.0.2** with Sevalla API v3-aligned create tools, Cursor-safe tool names (`sevalla_databases_create`), and `sevalla_validate`. Pin it in MCP with `github:bgvo/sevalla-mcp#v1.0.2`.

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
| `sevalla_validate` | Validate the Sevalla API key and check connectivity | Yes       |

#### Applications

| Tool                            | Description                                   | Read-only |
| ------------------------------- | --------------------------------------------- | --------- |
| `sevalla_applications_list`     | List all applications for a company           | Yes       |
| `sevalla_applications_get`      | Get details of a specific application         | Yes       |
| `sevalla_applications_create`   | Create a new application                      | No        |
| `sevalla_applications_update`   | Update an application's configuration (PATCH) | No        |
| `sevalla_applications_delete`   | Permanently delete an application             | No        |
| `sevalla_applications_activate` | Reactivate a suspended application            | No        |
| `sevalla_applications_suspend`  | Suspend a running application                 | No        |
| `sevalla_applications_clone`    | Clone an existing application                 | No        |

#### Deployments

| Tool                           | Description                                 | Read-only |
| ------------------------------ | ------------------------------------------- | --------- |
| `sevalla_deployments_list`     | List all deployments for an application     | Yes       |
| `sevalla_deployments_get`      | Get details of a specific deployment        | Yes       |
| `sevalla_deployments_start`    | Trigger a new deployment for an application | No        |
| `sevalla_deployments_cancel`   | Cancel an in-progress deployment            | No        |
| `sevalla_deployments_rollback` | Rollback to a specific deployment           | No        |

#### Processes

| Tool                             | Description                            | Read-only |
| -------------------------------- | -------------------------------------- | --------- |
| `sevalla_processes_list`         | List all processes for an application  | Yes       |
| `sevalla_processes_get`          | Get details of a specific process      | Yes       |
| `sevalla_processes_create`       | Create a new application process       | No        |
| `sevalla_processes_update`       | Update a process configuration (PATCH) | No        |
| `sevalla_processes_delete`       | Delete a non-web process               | No        |
| `sevalla_processes_trigger_cron` | Manually trigger a cron job            | No        |

#### Application Domains

| Tool                                          | Description                           | Read-only |
| --------------------------------------------- | ------------------------------------- | --------- |
| `sevalla_applications_domains_list`           | List all domains for an application   | Yes       |
| `sevalla_applications_domains_add`            | Add a custom domain to an application | No        |
| `sevalla_applications_domains_delete`         | Remove a custom domain                | No        |
| `sevalla_applications_domains_set_primary`    | Set a domain as primary               | No        |
| `sevalla_applications_domains_refresh_status` | Re-check domain verification          | No        |

#### Application Environment Variables

| Tool                                   | Description                            | Read-only |
| -------------------------------------- | -------------------------------------- | --------- |
| `sevalla_applications_env_vars_list`   | List all environment variables         | Yes       |
| `sevalla_applications_env_vars_create` | Create a new environment variable      | No        |
| `sevalla_applications_env_vars_update` | Update an environment variable (PATCH) | No        |
| `sevalla_applications_env_vars_delete` | Delete an environment variable         | No        |

#### Application Logs

| Tool                                   | Description               | Read-only |
| -------------------------------------- | ------------------------- | --------- |
| `sevalla_applications_logs_access`     | Get HTTP access logs      | Yes       |
| `sevalla_applications_logs_runtime`    | Get runtime/stdout logs   | Yes       |
| `sevalla_applications_logs_deployment` | Get build/deployment logs | Yes       |

#### Networking

| Tool                                            | Description                                                     | Read-only |
| ----------------------------------------------- | --------------------------------------------------------------- | --------- |
| `sevalla_networking_purge_cache`                | Purge the edge cache for an application                         | No        |
| `sevalla_networking_create_internal_connection` | Create an internal connection between applications or databases | No        |
| `sevalla_networking_toggle_cdn`                 | Enable or disable CDN for an application                        | No        |

#### Databases

| Tool                                | Description                               | Read-only |
| ----------------------------------- | ----------------------------------------- | --------- |
| `sevalla_databases_list`            | List all databases for a company          | Yes       |
| `sevalla_databases_get`             | Get details of a specific database        | Yes       |
| `sevalla_databases_create`          | Create a new database                     | No        |
| `sevalla_databases_update`          | Update a database's configuration (PATCH) | No        |
| `sevalla_databases_delete`          | Permanently delete a database             | No        |
| `sevalla_databases_activate`        | Reactivate a suspended database           | No        |
| `sevalla_databases_suspend`         | Suspend a running database                | No        |
| `sevalla_databases_reset_password`  | Reset the database password               | No        |
| `sevalla_databases_backups_list`    | List all backups for a database           | Yes       |
| `sevalla_databases_backups_create`  | Create a manual backup                    | No        |
| `sevalla_databases_backups_restore` | Restore from a backup                     | No        |

#### Static Sites

| Tool                                  | Description                                      | Read-only |
| ------------------------------------- | ------------------------------------------------ | --------- |
| `sevalla_static_sites_list`           | List all static sites for a company              | Yes       |
| `sevalla_static_sites_get`            | Get details of a specific static site            | Yes       |
| `sevalla_static_sites_create`         | Create a new static site                         | No        |
| `sevalla_static_sites_update`         | Update a static site's configuration (PATCH)     | No        |
| `sevalla_static_sites_delete`         | Permanently delete a static site                 | No        |
| `sevalla_static_sites_deploy`         | Trigger a new deployment for a static site       | No        |
| `sevalla_static_sites_get_deployment` | Get details of a specific static site deployment | Yes       |
| `sevalla_static_sites_purge_cache`    | Purge the edge cache for a static site           | No        |

#### Pipelines

| Tool                                | Description                        | Read-only |
| ----------------------------------- | ---------------------------------- | --------- |
| `sevalla_pipelines_list`            | List all deployment pipelines      | Yes       |
| `sevalla_pipelines_get`             | Get details of a specific pipeline | Yes       |
| `sevalla_pipelines_create`          | Create a new pipeline              | No        |
| `sevalla_pipelines_update`          | Update a pipeline (PATCH)          | No        |
| `sevalla_pipelines_delete`          | Delete a pipeline                  | No        |
| `sevalla_pipelines_promote`         | Promote builds between stages      | No        |
| `sevalla_pipelines_stages_create`   | Create a new pipeline stage        | No        |
| `sevalla_pipelines_stages_delete`   | Delete a pipeline stage            | No        |
| `sevalla_pipelines_enable_preview`  | Enable preview environments        | No        |
| `sevalla_pipelines_disable_preview` | Disable preview environments       | No        |

#### Load Balancers

| Tool                                         | Description                    | Read-only |
| -------------------------------------------- | ------------------------------ | --------- |
| `sevalla_load_balancers_list`                | List all load balancers        | Yes       |
| `sevalla_load_balancers_get`                 | Get load balancer details      | Yes       |
| `sevalla_load_balancers_create`              | Create a load balancer         | No        |
| `sevalla_load_balancers_update`              | Update a load balancer (PATCH) | No        |
| `sevalla_load_balancers_delete`              | Delete a load balancer         | No        |
| `sevalla_load_balancers_destinations_list`   | List destinations              | Yes       |
| `sevalla_load_balancers_destinations_add`    | Add a destination              | No        |
| `sevalla_load_balancers_destinations_remove` | Remove a destination           | No        |
| `sevalla_load_balancers_destinations_toggle` | Enable/disable a destination   | No        |

#### Object Storage

| Tool                                    | Description              | Read-only |
| --------------------------------------- | ------------------------ | --------- |
| `sevalla_object_storage_list`           | List all storage buckets | Yes       |
| `sevalla_object_storage_get`            | Get bucket details       | Yes       |
| `sevalla_object_storage_create`         | Create a storage bucket  | No        |
| `sevalla_object_storage_update`         | Update a bucket (PATCH)  | No        |
| `sevalla_object_storage_delete`         | Delete a bucket          | No        |
| `sevalla_object_storage_cdn_enable`     | Enable public CDN        | No        |
| `sevalla_object_storage_cdn_disable`    | Disable public CDN       | No        |
| `sevalla_object_storage_objects_list`   | List bucket objects      | Yes       |
| `sevalla_object_storage_objects_delete` | Delete objects by key    | No        |

#### Webhooks

| Tool                                     | Description                   | Read-only |
| ---------------------------------------- | ----------------------------- | --------- |
| `sevalla_webhooks_list`                  | List all webhooks             | Yes       |
| `sevalla_webhooks_get`                   | Get webhook details           | Yes       |
| `sevalla_webhooks_create`                | Create a webhook              | No        |
| `sevalla_webhooks_update`                | Update a webhook (PATCH)      | No        |
| `sevalla_webhooks_delete`                | Delete a webhook              | No        |
| `sevalla_webhooks_toggle`                | Enable/disable a webhook      | No        |
| `sevalla_webhooks_roll_secret`           | Generate a new signing secret | No        |
| `sevalla_webhooks_event_deliveries_list` | List event deliveries         | Yes       |
| `sevalla_webhooks_event_deliveries_get`  | Get delivery details          | Yes       |

#### Projects

| Tool                               | Description                     | Read-only |
| ---------------------------------- | ------------------------------- | --------- |
| `sevalla_projects_list`            | List all projects               | Yes       |
| `sevalla_projects_get`             | Get project details             | Yes       |
| `sevalla_projects_create`          | Create a project                | No        |
| `sevalla_projects_update`          | Update a project (PATCH)        | No        |
| `sevalla_projects_delete`          | Delete a project                | No        |
| `sevalla_projects_services_add`    | Add a service to a project      | No        |
| `sevalla_projects_services_remove` | Remove a service from a project | No        |

#### Docker Registries

| Tool                               | Description                   | Read-only |
| ---------------------------------- | ----------------------------- | --------- |
| `sevalla_docker_registries_list`   | List all registry credentials | Yes       |
| `sevalla_docker_registries_get`    | Get credential details        | Yes       |
| `sevalla_docker_registries_create` | Create a registry credential  | No        |
| `sevalla_docker_registries_update` | Update a credential (PATCH)   | No        |
| `sevalla_docker_registries_delete` | Delete a credential           | No        |

#### Global Environment Variables

| Tool                             | Description                     | Read-only |
| -------------------------------- | ------------------------------- | --------- |
| `sevalla_global_env_vars_list`   | List all global env vars        | Yes       |
| `sevalla_global_env_vars_create` | Create a global env var         | No        |
| `sevalla_global_env_vars_update` | Update a global env var (PATCH) | No        |
| `sevalla_global_env_vars_delete` | Delete a global env var         | No        |

#### API Keys

| Tool                      | Description               | Read-only |
| ------------------------- | ------------------------- | --------- |
| `sevalla_api_keys_list`   | List all API keys         | Yes       |
| `sevalla_api_keys_get`    | Get API key details       | Yes       |
| `sevalla_api_keys_create` | Create a new API key      | No        |
| `sevalla_api_keys_update` | Update an API key (PATCH) | No        |
| `sevalla_api_keys_delete` | Delete an API key         | No        |
| `sevalla_api_keys_rotate` | Rotate an API key token   | No        |
| `sevalla_api_keys_toggle` | Enable/disable an API key | No        |

#### Resources (Reference Data)

| Tool                                        | Description                       | Read-only |
| ------------------------------------------- | --------------------------------- | --------- |
| `sevalla_resources_clusters`                | List available clusters/locations | Yes       |
| `sevalla_resources_database_resource_types` | List database machine sizes       | Yes       |
| `sevalla_resources_process_resource_types`  | List process machine sizes        | Yes       |

#### Company

| Tool                    | Description                  | Read-only |
| ----------------------- | ---------------------------- | --------- |
| `sevalla_company_users` | List all users for a company | Yes       |

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
