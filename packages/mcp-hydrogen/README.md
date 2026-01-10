# @hydrogen-forge/mcp-hydrogen

Hydrogen scaffolding MCP server for Claude Code. Generate components, routes, and analyze project structure.

## Features

- **scaffoldComponent** - Generate React/Hydrogen components with TypeScript types
- **scaffoldRoute** - Generate React Router routes with loaders, actions, and GraphQL
- **analyzeProject** - Analyze Hydrogen project structure and get recommendations

## Installation

```bash
npm install @hydrogen-forge/mcp-hydrogen
```

## Claude Code Configuration

Add to your Claude Code MCP settings (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "hydrogen": {
      "command": "npx",
      "args": ["@hydrogen-forge/mcp-hydrogen"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "hydrogen": {
      "command": "mcp-hydrogen"
    }
  }
}
```

## Tools

### scaffoldComponent

Generate a new Hydrogen/React component with TypeScript types.

**Parameters:**

| Parameter  | Type    | Required | Default          | Description                  |
| ---------- | ------- | -------- | ---------------- | ---------------------------- |
| name       | string  | Yes      | -                | Component name in PascalCase |
| type       | string  | No       | "basic"          | Component type template      |
| props      | array   | No       | []               | Custom props to add          |
| outputDir  | string  | No       | "app/components" | Output directory             |
| withStyles | boolean | No       | true             | Include Tailwind CSS classes |
| withTests  | boolean | No       | false            | Generate test file           |

**Component Types:**

- `basic` - Simple functional component
- `product` - Product card with image, price, link
- `collection` - Collection card with overlay
- `cart` - Cart line item with quantity controls
- `form` - Form component with submission handling
- `layout` - Layout wrapper with header/footer slots

**Example:**

```json
{
  "name": "ProductCard",
  "type": "product",
  "props": [{ "name": "showVendor", "type": "boolean", "required": false }],
  "withStyles": true
}
```

### scaffoldRoute

Generate a new React Router route with loader, action, and meta functions.

**Parameters:**

| Parameter   | Type    | Required | Default      | Description                           |
| ----------- | ------- | -------- | ------------ | ------------------------------------- |
| name        | string  | Yes      | -            | Route name (e.g., "products.$handle") |
| type        | string  | No       | "page"       | Route type template                   |
| withLoader  | boolean | No       | true         | Include loader function               |
| withAction  | boolean | No       | false        | Include action function               |
| withMeta    | boolean | No       | true         | Include meta function                 |
| withGraphQL | boolean | No       | false        | Include GraphQL query template        |
| outputDir   | string  | No       | "app/routes" | Output directory                      |

**Route Types:**

- `page` - Standard page with loader/action/meta
- `resource` - API-like route (no UI)
- `collection` - Collection page with pagination
- `product` - Product detail page with variants
- `account` - Authenticated account page
- `api` - API endpoint with method handling

**Route Name Convention:**

| Pattern              | URL Path            | Description      |
| -------------------- | ------------------- | ---------------- |
| `_index`             | `/`                 | Index route      |
| `products.$handle`   | `/products/:handle` | Dynamic segment  |
| `collections._index` | `/collections`      | Collection index |
| `api.webhook`        | `/api/webhook`      | API endpoint     |
| `[robots.txt]`       | `/robots.txt`       | Escaped route    |

**Example:**

```json
{
  "name": "products.$handle",
  "type": "product",
  "withLoader": true,
  "withGraphQL": true
}
```

### analyzeProject

Analyze a Hydrogen project structure and provide insights.

**Parameters:**

| Parameter         | Type    | Required | Default | Description                   |
| ----------------- | ------- | -------- | ------- | ----------------------------- |
| projectPath       | string  | No       | "."     | Path to project               |
| includeRoutes     | boolean | No       | true    | Analyze routes                |
| includeComponents | boolean | No       | true    | Analyze components            |
| includeStyles     | boolean | No       | true    | Analyze style configuration   |
| includeConfig     | boolean | No       | true    | Analyze project configuration |

**Returns:**

```json
{
  "projectPath": "/path/to/project",
  "isHydrogenProject": true,
  "hydrogenVersion": "^2024.10.0",
  "reactRouterVersion": "^7.0.0",
  "routes": [
    {
      "file": "products.$handle.tsx",
      "path": "/products/:handle",
      "hasLoader": true,
      "hasAction": false,
      "hasMeta": true,
      "hasGraphQL": true
    }
  ],
  "components": [
    {
      "file": "ProductCard.tsx",
      "name": "ProductCard",
      "hasProps": true,
      "propsInterface": "ProductCardProps",
      "imports": ["react-router", "@shopify/hydrogen"]
    }
  ],
  "styles": {
    "hasTailwind": true,
    "tailwindConfig": "tailwind.config.ts",
    "customClasses": ["bg-primary-*", "bg-secondary-*"]
  },
  "config": {
    "typescript": true,
    "eslint": true,
    "prettier": true,
    "packageManager": "pnpm"
  },
  "recommendations": ["Consider adding route: cart for a complete storefront"]
}
```

## Usage Examples

### Create a Product Card Component

```
Use the scaffoldComponent tool to create a ProductCard component with product type
```

### Create a Collection Route

```
Use the scaffoldRoute tool to create a collections.$handle route with collection type and GraphQL
```

### Analyze Current Project

```
Use the analyzeProject tool to analyze the current Hydrogen project
```

## Generated Code Patterns

### Components

All generated components follow these patterns:

- TypeScript interfaces for props
- Tailwind CSS utility classes
- Shopify Hydrogen imports (Image, Money, etc.)
- React Router Link for navigation

### Routes

All generated routes follow these patterns:

- Route types from `./+types/{routename}`
- `loader` function for data fetching
- `action` function for form handling
- `meta` function for SEO
- GraphQL queries with `#graphql` tag

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck
```

## License

MIT
