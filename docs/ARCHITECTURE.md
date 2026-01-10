# Hydrogen Forge Architecture

This document describes the architecture and design decisions for Hydrogen Forge.

## Overview

Hydrogen Forge is a monorepo containing:

1. **CLI Package** (`packages/cli`) - Project scaffolding and management
2. **MCP Packages** (`packages/mcp-*`) - Claude Code integration
3. **Starter Template** (`templates/starter`) - Base Hydrogen theme

```
┌─────────────────────────────────────────────────────────────────┐
│                        Hydrogen Forge                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    CLI      │  │   MCPs      │  │    Starter Template     │  │
│  │             │  │             │  │                         │  │
│  │ • create    │  │ • shopify   │  │ • Components (20+)      │  │
│  │ • add       │  │ • hydrogen  │  │ • Routes (30+)          │  │
│  │ • setup-mcp │  │             │  │ • Tailwind CSS          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Package Architecture

### CLI (`hydrogen-forge`)

```
packages/cli/
├── src/
│   ├── index.ts           # Entry point, Commander setup
│   ├── commands/
│   │   ├── create.ts      # Project scaffolding
│   │   ├── add.ts         # Component/route generation
│   │   └── setup-mcp.ts   # MCP configuration
│   └── lib/
│       ├── utils.ts       # File operations, spinners
│       └── generators.ts  # Code templates
└── dist/                  # Compiled output
```

**Key Design Decisions:**

- Uses Commander.js for CLI parsing
- Interactive prompts with Inquirer
- Template-based code generation
- Cross-platform MCP config detection

### Shopify MCP (`@hydrogen-forge/mcp-shopify`)

```
packages/mcp-shopify/
├── src/
│   ├── index.ts           # MCP server entry
│   ├── lib/
│   │   ├── shopify-client.ts  # GraphQL client
│   │   └── types.ts       # Zod schemas
│   └── tools/
│       ├── executeGraphQL.ts  # Raw GraphQL
│       ├── products.ts    # Product CRUD
│       └── inventory.ts   # Inventory ops
└── dist/
```

**Key Design Decisions:**

- Zod for input validation
- Direct GraphQL execution for flexibility
- Convenience methods for common operations
- Environment-based configuration

### Hydrogen MCP (`@hydrogen-forge/mcp-hydrogen`)

```
packages/mcp-hydrogen/
├── src/
│   ├── index.ts           # MCP server entry
│   ├── lib/types.ts       # Zod schemas
│   ├── templates/
│   │   ├── components.ts  # Component templates
│   │   └── routes.ts      # Route templates
│   └── tools/
│       ├── scaffoldComponent.ts
│       ├── scaffoldRoute.ts
│       └── analyzeProject.ts
└── dist/
```

**Key Design Decisions:**

- Multiple component types (basic, product, collection, cart, form, layout)
- Multiple route types (page, collection, product, account, api)
- Project analysis for recommendations
- Tailwind CSS integration

### Starter Template

```
templates/starter/
├── app/
│   ├── components/        # React components
│   ├── routes/            # React Router routes
│   ├── lib/               # Utilities
│   ├── styles/            # CSS files
│   └── graphql/           # GraphQL fragments
├── public/                # Static assets
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Component Architecture

### Compound Components

Complex components use the compound component pattern:

```tsx
// Usage
<ProductCard product={product}>
  <ProductCard.Image />
  <ProductCard.Title />
  <ProductCard.Price />
</ProductCard>
```

### Props Patterns

Components follow consistent props patterns:

```tsx
interface ComponentProps {
  // Required data
  data: DataType;

  // Optional styling
  className?: string;

  // Optional behavior
  onAction?: () => void;

  // Children for composition
  children?: ReactNode;
}
```

### Styling

- Tailwind CSS utility classes
- Custom design tokens (primary-_, secondary-_)
- Consistent spacing scale
- Responsive breakpoints (sm, md, lg, xl)

## Route Architecture

### File-based Routing

React Router 7 file-based routing:

```
app/routes/
├── _index.tsx              # /
├── products.$handle.tsx    # /products/:handle
├── collections.$handle.tsx # /collections/:handle
├── cart.tsx                # /cart
└── api.webhook.tsx         # /api/webhook
```

### Route Structure

Each route follows the pattern:

```tsx
// Types
import type { Route } from "./+types/routename";

// Meta function (SEO)
export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.title }];
};

// Loader (data fetching)
export async function loader({ context, params }: Route.LoaderArgs) {
  const { storefront } = context;
  // Fetch data
  return { data };
}

// Action (form handling)
export async function action({ context, request }: Route.ActionArgs) {
  // Handle form submission
  return { success: true };
}

// Component
export default function RouteName() {
  const data = useLoaderData<typeof loader>();
  return <div>{/* UI */}</div>;
}

// GraphQL query
const QUERY = `#graphql
  query {...}
` as const;
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Route       │────▶│  Storefront  │
│              │     │  Loader      │     │  API         │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React      │◀────│  Component   │◀────│  GraphQL     │
│   Component  │     │  Props       │     │  Response    │
└──────────────┘     └──────────────┘     └──────────────┘
```

## State Management

### Server State

- React Router loaders for data fetching
- Storefront API for products/collections
- Customer Account API for account data

### Client State

- React state for UI interactions
- Optimistic updates for cart operations
- URL state for filters and pagination

### Cart State

```tsx
// Optimistic cart updates
const cart = useOptimisticCart(originalCart);

// Cart form actions
<CartForm
  action={CartForm.ACTIONS.LinesAdd}
  inputs={{ lines: [{ merchandiseId, quantity }] }}
>
  <button type="submit">Add to Cart</button>
</CartForm>;
```

## MCP Integration

### Tool Registration

```tsx
const TOOLS = [
  {
    name: "toolName",
    description: "What this tool does",
    inputSchema: {
      type: "object",
      properties: {
        param: { type: "string", description: "..." },
      },
      required: ["param"],
    },
  },
];

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Handle tool call
});
```

### Configuration

Claude Code config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["@hydrogen-forge/mcp-shopify"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "...",
        "SHOPIFY_ACCESS_TOKEN": "..."
      }
    },
    "hydrogen": {
      "command": "npx",
      "args": ["@hydrogen-forge/mcp-hydrogen"]
    }
  }
}
```

## Build System

### Monorepo Structure

- npm workspaces
- Shared TypeScript configuration
- Per-package builds

### Build Commands

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=packages/cli

# Development mode
npm run dev --workspace=packages/cli
```

### CI/CD

GitHub Actions workflow:

1. Install dependencies
2. Run linting
3. Run type checking
4. Build all packages

## Security

### API Keys

- Environment variables for sensitive data
- Never commit credentials
- `.env` files in `.gitignore`

### Input Validation

- Zod schemas for all MCP inputs
- Type-safe GraphQL queries
- Sanitized user inputs

## Performance

### Code Splitting

- Route-based code splitting
- Lazy-loaded components
- Tree-shaking unused code

### Caching

- Storefront API caching headers
- CDN caching for static assets
- Browser caching for assets

### Optimization

- Image optimization with Hydrogen Image
- Minimal JavaScript bundle
- Critical CSS inlining
