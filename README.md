# Hydrogen Forge

[![CI](https://github.com/nathanmcmullendev/hydrogen-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/nathanmcmullendev/hydrogen-forge/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The developer-focused Shopify Hydrogen ecosystem. Clean architecture, MCP integration, no vendor lock-in.

## What is Hydrogen Forge?

Hydrogen Forge is a comprehensive toolkit for building Shopify Hydrogen storefronts:

- **CLI** - Create projects with `npx hydrogen-forge create my-store`
- **Starter Theme** - Clean TypeScript template with 20+ components
- **MCP Servers** - AI-assisted development with Claude Code (14 tools)
- **No Vendor Lock-In** - Unlike Pack/Sanity/Weaverse, we're standalone

## Quick Start

```bash
# Create a new project
npx hydrogen-forge create my-store
cd my-store

# Connect to Shopify
npx shopify hydrogen link

# Start development
npm run dev
```

## Packages

| Package                                                 | Description              | npm                  |
| ------------------------------------------------------- | ------------------------ | -------------------- |
| [`hydrogen-forge`](packages/cli)                        | CLI for project creation | `npx hydrogen-forge` |
| [`@hydrogen-forge/mcp-shopify`](packages/mcp-shopify)   | Shopify Admin API tools  | 11 tools             |
| [`@hydrogen-forge/mcp-hydrogen`](packages/mcp-hydrogen) | Scaffolding tools        | 3 tools              |

## CLI Commands

```bash
# Create new project
hydrogen-forge create [name]

# Add component to existing project
hydrogen-forge add component ProductCard
hydrogen-forge add component CartDrawer

# Add route to existing project
hydrogen-forge add route products.$handle
hydrogen-forge add route api.webhook

# Configure Claude Code MCPs
hydrogen-forge setup-mcp
```

## MCP Tools

### Shopify MCP

| Tool                  | Description                     |
| --------------------- | ------------------------------- |
| `executeGraphQL`      | Run any Shopify Admin API query |
| `createProduct`       | Create products with variants   |
| `updateProduct`       | Update product fields           |
| `getProduct`          | Get product by ID or handle     |
| `listProducts`        | List and filter products        |
| `deleteProduct`       | Delete products                 |
| `updateInventory`     | Set inventory quantity          |
| `adjustInventory`     | Adjust inventory by delta       |
| `getInventoryLevels`  | Get stock levels                |
| `listLocations`       | List inventory locations        |
| `getProductInventory` | Get variant inventory           |

### Hydrogen MCP

| Tool                | Description               |
| ------------------- | ------------------------- |
| `scaffoldComponent` | Generate component files  |
| `scaffoldRoute`     | Generate route files      |
| `analyzeProject`    | Analyze project structure |

## Starter Template

The starter template includes:

### Components (20+)

- **Layout**: Header, Footer, Navigation, MobileMenu, PageLayout
- **Product**: ProductCard, ProductGrid, ProductGallery, ProductForm, ProductPrice
- **Cart**: CartMain, CartLineItem, CartSummary, AddToCartButton
- **Collection**: CollectionGrid, CollectionFilters
- **Search**: SearchDialog, SearchResultsPredictive

### Features

- Shopify Hydrogen 2025.7.1
- React Router 7
- TypeScript (strict mode)
- Tailwind CSS with custom design tokens
- Accessible components (WCAG compliant)
- Pre-configured ESLint & Prettier

## Project Structure

```
hydrogen-forge/
├── packages/
│   ├── cli/               # hydrogen-forge CLI
│   ├── mcp-shopify/       # Shopify MCP server
│   └── mcp-hydrogen/      # Hydrogen MCP server
├── templates/
│   └── starter/           # Starter theme
│       ├── app/
│       │   ├── components/
│       │   ├── routes/
│       │   ├── lib/
│       │   └── styles/
│       └── public/
├── docs/                  # Documentation
└── .claude/               # Project context
```

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and patterns
- [Extension Guide](docs/EXTENSION.md) - Adding components and routes
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to Shopify Oxygen

## Development

```bash
# Clone repository
git clone https://github.com/nathanmcmullendev/hydrogen-forge.git
cd hydrogen-forge

# Install dependencies
npm install

# Build all packages
npm run build

# Run linting
npm run lint

# Run starter template
cd templates/starter
npm run dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.
