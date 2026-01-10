# hydrogen-forge

CLI for creating and managing Hydrogen Forge projects.

## Installation

```bash
npm install -g hydrogen-forge
```

Or use directly with npx:

```bash
npx hydrogen-forge create my-store
```

## Commands

### create

Create a new Hydrogen Forge project.

```bash
hydrogen-forge create [name]
```

**Options:**

| Option           | Description                        |
| ---------------- | ---------------------------------- |
| `-t, --template` | Template to use (default: starter) |
| `--skip-install` | Skip npm install                   |
| `--skip-git`     | Skip git initialization            |

**Examples:**

```bash
# Interactive mode
hydrogen-forge create

# With project name
hydrogen-forge create my-store

# Skip npm install
hydrogen-forge create my-store --skip-install

# Use different template
hydrogen-forge create my-store --template starter
```

### add

Add a component or route to your project.

```bash
hydrogen-forge add <type> <name>
```

**Types:**

- `component` - Add a React component
- `route` - Add a React Router route

**Options:**

| Option        | Description               |
| ------------- | ------------------------- |
| `-d, --dir`   | Output directory          |
| `--no-styles` | Skip Tailwind CSS classes |

**Examples:**

```bash
# Add a component
hydrogen-forge add component ProductCard
hydrogen-forge add component CartDrawer
hydrogen-forge add component NewsletterForm

# Add a route
hydrogen-forge add route products.$handle
hydrogen-forge add route collections._index
hydrogen-forge add route api.webhook

# Custom directory
hydrogen-forge add component ProductCard --dir app/components/products

# Without Tailwind styles
hydrogen-forge add component BasicCard --no-styles
```

**Component Types (auto-detected from name):**

| Name Contains | Template Type                       |
| ------------- | ----------------------------------- |
| `Product`     | Product component with Image, Money |
| `Collection`  | Collection card with overlay        |
| `Cart`        | Cart line item with CartForm        |
| `Form`        | Form with useNavigation             |
| `Layout`      | Layout wrapper with slots           |
| (other)       | Basic component                     |

**Route Types (auto-detected from name):**

| Name Pattern   | Template Type   |
| -------------- | --------------- |
| `api.*`        | API endpoint    |
| `account*`     | Account page    |
| `*product*`    | Product page    |
| `*collection*` | Collection page |
| (other)        | Standard page   |

### setup-mcp

Configure MCP servers for Claude Code.

```bash
hydrogen-forge setup-mcp
```

**Options:**

| Option       | Description              |
| ------------ | ------------------------ |
| `--shopify`  | Set up Shopify MCP only  |
| `--hydrogen` | Set up Hydrogen MCP only |

**Examples:**

```bash
# Interactive setup (both MCPs)
hydrogen-forge setup-mcp

# Shopify MCP only
hydrogen-forge setup-mcp --shopify

# Hydrogen MCP only
hydrogen-forge setup-mcp --hydrogen
```

This command will:

1. Detect your Claude Code configuration location
2. Prompt for Shopify store credentials (if configuring Shopify MCP)
3. Add MCP server configurations to `claude_desktop_config.json`

## Quick Start

```bash
# Create a new project
npx hydrogen-forge create my-store
cd my-store

# Connect to Shopify
npx shopify hydrogen link

# Start development
npm run dev

# Set up MCP servers for Claude Code
npx hydrogen-forge setup-mcp
```

## Project Structure

Projects created with `hydrogen-forge create` include:

```
my-store/
├── app/
│   ├── components/     # React components
│   ├── routes/         # React Router routes
│   ├── lib/            # Utilities
│   └── styles/         # CSS files
├── public/             # Static assets
├── .env                # Environment variables
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## MCP Servers

After running `setup-mcp`, you'll have access to:

### Shopify MCP

- `executeGraphQL` - Run any Shopify Admin API query
- `createProduct` - Create products with variants
- `updateProduct` - Update product fields
- `getProduct` - Get product by ID or handle
- `listProducts` - List and filter products
- `deleteProduct` - Delete products
- `updateInventory` - Set inventory quantity
- `adjustInventory` - Adjust inventory by delta
- `getInventoryLevels` - Get stock levels
- `listLocations` - List inventory locations
- `getProductInventory` - Get variant inventory

### Hydrogen MCP

- `scaffoldComponent` - Generate component files
- `scaffoldRoute` - Generate route files
- `analyzeProject` - Analyze project structure

## Requirements

- Node.js 20.0.0 or later
- npm, pnpm, or yarn

## License

MIT
