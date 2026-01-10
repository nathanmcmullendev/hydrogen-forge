# Hydrogen Forge

[![CI](https://github.com/nathanmcmullendev/hydrogen-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/nathanmcmullendev/hydrogen-forge/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The developer-focused Shopify Hydrogen ecosystem. Clean architecture, MCP integration, no vendor lock-in.

## What This Is

Hydrogen Forge is a comprehensive ecosystem for developers building Shopify Hydrogen storefronts:

- **Starter Theme** - Clean TypeScript template with Tailwind CSS, 95+ PageSpeed target
- **Enhanced MCPs** - AI-assisted development with Claude Code
- **CLI Tools** - `npx hydrogen-forge create my-store`
- **No Vendor Lock-In** - Unlike Pack/Sanity/Weaverse starters, we're standalone

## Quick Start

```bash
# Clone and install
git clone https://github.com/nathanmcmullendev/hydrogen-forge.git
cd hydrogen-forge
npm install

# Run the starter template
cd templates/starter
npm run dev
```

## Project Structure

```
hydrogen-forge/
├── .claude/           # Project context, priorities, decisions
├── .github/           # CI/CD workflows
├── packages/          # MCPs and CLI tools (coming soon)
│   ├── mcp-shopify/   # Enhanced Shopify MCP
│   ├── mcp-hydrogen/  # Hydrogen development MCP
│   └── cli/           # CLI tool
├── templates/
│   └── starter/       # Base Hydrogen theme
├── research/          # Market research and analysis
└── docs/              # Documentation
```

## Starter Template Features

- Shopify Hydrogen 2025.7.1
- React Router 7
- TypeScript (strict mode)
- Tailwind CSS with custom design system
- Accessible components (WCAG compliant)
- Pre-configured ESLint & Prettier

## Development

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run starter in development mode
cd templates/starter
npm run dev

# Build starter
npm run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Documentation

- [Project Context](.claude/CONTEXT.md) - Current state and priorities
- [Priorities](.claude/PRIORITIES.md) - Sprint plan and task breakdown
- [Decisions](.claude/DECISIONS.md) - Architecture decisions

## License

MIT - see [LICENSE](LICENSE) for details.
