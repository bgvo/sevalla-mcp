# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Security

## [1.0.2] - 2026-05-28

### Fixed

- Rename all MCP tools to use underscores only (`sevalla_databases_create` instead of `sevalla.databases.create`) for Cursor and OpenAI-compatible clients

## [1.0.1] - 2026-05-28

### Fixed

- Align `sevalla_databases_create` and `sevalla_applications_create` with Sevalla API v3 request bodies (`cluster_id`, `resource_type_id`, `repo_url`, `source`, etc.)
- Use `GET /api-keys/validate` instead of the non-existent `POST` route
- Allow array responses in tool output schemas (fixes `sevalla_resources_clusters` and `database-resource-types`)

## [1.0.0] - 2026-03-12

### Added

- Migrated to Sevalla API v3 with expanded tool coverage

### Fixed

- Added missing company ID validation to all company-scoped tools
- Fixed minimatch override to resolve ReDoS vulnerabilities (CVE)
- Achieved 100% test coverage and fixed vulnerable dependencies

## [0.1.0] - 2026-02-22

### Added

- Initial release of the Sevalla MCP server.
- **29 MCP tools** covering applications, deployments, processes, networking, databases, static sites, pipelines, and company management.
- **8 MCP resources** for browsing Sevalla infrastructure.
- **3 MCP prompts** for guided deployment, database creation, and API key setup workflows.
- HTTP (Streamable HTTP) and stdio transport modes.
- Bearer token authentication via `SEVALLA_API_KEY`.
