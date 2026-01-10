# Changelog

All notable changes to this package will be documented in this file.

## [0.2.3] - 2026-01-09

### Fixed

- Updated credential instructions with correct Shopify admin paths
- Added instructions for creating Headless storefront

## [0.2.2] - 2026-01-09

### Fixed

- Fixed Node.js deprecation warning (DEP0190) for shell spawn with args array

## [0.2.1] - 2026-01-09

### Fixed

- Fixed git commit shell escaping bug where commit message words were parsed as separate arguments

## [0.2.0] - 2026-01-09

### Added

- **MCP Auto-Configuration**: The `create` command now prompts for Shopify credentials and automatically configures MCP for Claude Code integration
  - Prompts for store domain, Storefront API token, and Admin API access token
  - Generates `.mcp.json` with credentials for Claude Code
  - Generates `CLAUDE.md` with MCP tool instructions
  - Adds `.mcp.json` to `.gitignore` for security
- New `--skip-mcp` flag to bypass MCP configuration during project creation

### Changed

- Improved step counter logic to dynamically calculate based on enabled options

## [0.1.3] - 2026-01-08

### Fixed

- Fixed template path resolution for both monorepo development and published package
- Fixed fs-extra imports for ESM compatibility

## [0.1.0] - 2026-01-08

### Added

- Initial release
- `create` command to scaffold new Hydrogen projects
- `add` command to add components and routes
- `setup-mcp` command to configure MCP servers
