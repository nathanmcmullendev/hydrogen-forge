# @hydrogen-forge/mcp-shopify

Enhanced Shopify MCP server for Claude Code. Execute GraphQL queries, manage products, and control inventory directly from your AI assistant.

## Features

- **executeGraphQL** - Run any Shopify Admin API query or mutation
- **Product Operations** - Create, read, list, and delete products
- **Inventory Management** - Update quantities, adjust stock, view levels across locations

## Installation

```bash
npm install @hydrogen-forge/mcp-shopify
```

## Configuration

Set the following environment variables:

```bash
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-10  # optional, defaults to 2024-10
```

### Getting an Access Token

1. Go to your Shopify admin: `https://your-store.myshopify.com/admin`
2. Navigate to Settings > Apps and sales channels > Develop apps
3. Create a new app with Admin API access
4. Select the scopes you need:
   - `read_products`, `write_products` - for product operations
   - `read_inventory`, `write_inventory` - for inventory operations
   - `read_locations` - for location queries
5. Install the app and copy the Admin API access token

## Claude Code Setup

Add to your `.claude.json` or MCP settings:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["@hydrogen-forge/mcp-shopify"],
      "env": {
        "SHOPIFY_SHOP_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxxx"
      }
    }
  }
}
```

## Available Tools

### executeGraphQL

Execute any GraphQL query or mutation. Includes common pre-built queries.

```
Arguments:
- query: string - The GraphQL query/mutation
- variables: object - Variables for the operation
- commonQuery: string - Use a pre-built query (shopInfo, listProducts, getProduct, inventoryLevels, locations)
```

### createProduct

Create a new product with variants and images.

```
Arguments:
- title: string (required)
- descriptionHtml: string
- vendor: string
- productType: string
- tags: string[]
- status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
- variants: { price, sku, options }[]
- images: { src, altText }[]
```

### updateProduct

Update an existing product.

```
Arguments:
- id: string (required) - Product GID
- title: string
- descriptionHtml: string
- vendor: string
- productType: string
- tags: string[]
- status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
```

### getProduct

Get a single product by ID or handle.

```
Arguments:
- id: string - Product GID
- handle: string - Product handle/slug
```

### listProducts

List products with filtering and sorting.

```
Arguments:
- first: number - Count (default: 10)
- query: string - Search filter
- sortKey: 'TITLE' | 'VENDOR' | 'CREATED_AT' | etc.
- reverse: boolean
```

### deleteProduct

Delete a product by ID.

```
Arguments:
- productId: string (required)
```

### updateInventory

Set absolute inventory quantity at a location.

```
Arguments:
- inventoryItemId: string (required)
- locationId: string (required)
- quantity: number (required)
- reason: 'correction' | 'cycle_count_available' | 'received' | 'other'
```

### adjustInventory

Adjust inventory by delta (add or remove).

```
Arguments:
- inventoryItemId: string (required)
- locationId: string (required)
- delta: number (required) - Positive to add, negative to remove
- reason: string
```

### getInventoryLevels

Get inventory levels for an item across all locations.

```
Arguments:
- inventoryItemId: string (required)
```

### listLocations

List all inventory locations for the shop.

```
Arguments: none
```

### getProductInventory

Get inventory details for all variants of a product.

```
Arguments:
- productId: string (required)
```

## Example Usage

Once configured, you can ask Claude:

- "List all products in my Shopify store"
- "Create a new product called 'Summer T-Shirt' with price $29.99"
- "What's the inventory level for product gid://shopify/Product/123?"
- "Add 50 units of inventory for SKU 'SHIRT-001' at my main warehouse"
- "Run a custom GraphQL query to get my shop info"

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Start the server
npm start
```

## License

MIT
