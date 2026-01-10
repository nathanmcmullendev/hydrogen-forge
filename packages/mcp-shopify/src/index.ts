#!/usr/bin/env node

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  ExecuteGraphQLSchema,
  CreateProductSchema,
  UpdateProductSchema,
  GetProductSchema,
  ListProductsSchema,
  UpdateInventorySchema,
} from './lib/types.js';

import {executeGraphQL, COMMON_QUERIES} from './tools/executeGraphQL.js';
import {createProduct, updateProduct, getProduct, listProducts, deleteProduct} from './tools/products.js';
import {
  updateInventory,
  adjustInventory,
  getInventoryLevels,
  listLocations,
  getProductInventory,
} from './tools/inventory.js';

const server = new Server(
  {
    name: 'mcp-shopify',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool definitions
const TOOLS = [
  {
    name: 'executeGraphQL',
    description:
      'Execute any GraphQL query or mutation against the Shopify Admin API. ' +
      'This is the most flexible tool - use it for any operation not covered by specific tools. ' +
      'Common queries are available via the commonQueries parameter.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The GraphQL query or mutation to execute',
        },
        variables: {
          type: 'object',
          description: 'Variables for the GraphQL operation',
        },
        operationName: {
          type: 'string',
          description: 'Name of the operation if query contains multiple',
        },
        commonQuery: {
          type: 'string',
          enum: Object.keys(COMMON_QUERIES),
          description:
            'Use a pre-built common query instead of writing custom GraphQL. ' +
            'Options: shopInfo, listProducts, getProduct, inventoryLevels, locations',
        },
      },
      required: [],
    },
  },
  {
    name: 'createProduct',
    description:
      'Create a new product in Shopify with title, description, variants, and images.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {type: 'string', description: 'Product title'},
        descriptionHtml: {
          type: 'string',
          description: 'Product description in HTML',
        },
        vendor: {type: 'string', description: 'Product vendor/brand'},
        productType: {type: 'string', description: 'Product type/category'},
        tags: {
          type: 'array',
          items: {type: 'string'},
          description: 'Product tags',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
          description: 'Product status',
        },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              price: {type: 'string', description: 'Variant price'},
              sku: {type: 'string', description: 'Variant SKU'},
              options: {
                type: 'array',
                items: {type: 'string'},
                description: 'Variant option values',
              },
            },
            required: ['price'],
          },
          description: 'Product variants',
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              src: {type: 'string', description: 'Image URL'},
              altText: {type: 'string', description: 'Alt text'},
            },
            required: ['src'],
          },
          description: 'Product images',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'updateProduct',
    description: 'Update an existing product by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Product ID (gid://shopify/Product/...)',
        },
        title: {type: 'string', description: 'New product title'},
        descriptionHtml: {
          type: 'string',
          description: 'New product description in HTML',
        },
        vendor: {type: 'string', description: 'New product vendor/brand'},
        productType: {type: 'string', description: 'New product type/category'},
        tags: {
          type: 'array',
          items: {type: 'string'},
          description: 'New product tags',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
          description: 'New product status',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'getProduct',
    description: 'Get a single product by ID or handle with full details.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Product ID (gid://shopify/Product/...)',
        },
        handle: {type: 'string', description: 'Product handle/slug'},
      },
      required: [],
    },
  },
  {
    name: 'listProducts',
    description: 'List products with filtering, sorting, and pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        first: {
          type: 'number',
          description: 'Number of products to fetch (default: 10)',
        },
        query: {
          type: 'string',
          description: 'Search query to filter products',
        },
        sortKey: {
          type: 'string',
          enum: [
            'TITLE',
            'PRODUCT_TYPE',
            'VENDOR',
            'CREATED_AT',
            'UPDATED_AT',
            'INVENTORY_TOTAL',
          ],
          description: 'Field to sort by',
        },
        reverse: {type: 'boolean', description: 'Reverse the sort order'},
      },
      required: [],
    },
  },
  {
    name: 'deleteProduct',
    description: 'Delete a product by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to delete (gid://shopify/Product/...)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'updateInventory',
    description: 'Set the inventory quantity for an item at a specific location.',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemId: {
          type: 'string',
          description: 'The inventory item ID (gid://shopify/InventoryItem/...)',
        },
        locationId: {
          type: 'string',
          description: 'The location ID (gid://shopify/Location/...)',
        },
        quantity: {type: 'number', description: 'New quantity to set'},
        reason: {
          type: 'string',
          enum: ['correction', 'cycle_count_available', 'received', 'other'],
          description: 'Reason for inventory adjustment',
        },
      },
      required: ['inventoryItemId', 'locationId', 'quantity'],
    },
  },
  {
    name: 'adjustInventory',
    description:
      'Adjust inventory by a delta (positive or negative) instead of setting absolute quantity.',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemId: {
          type: 'string',
          description: 'The inventory item ID',
        },
        locationId: {type: 'string', description: 'The location ID'},
        delta: {
          type: 'number',
          description: 'Amount to adjust (positive to add, negative to remove)',
        },
        reason: {
          type: 'string',
          description: 'Reason for adjustment',
        },
      },
      required: ['inventoryItemId', 'locationId', 'delta'],
    },
  },
  {
    name: 'getInventoryLevels',
    description: 'Get inventory levels for an inventory item across all locations.',
    inputSchema: {
      type: 'object',
      properties: {
        inventoryItemId: {
          type: 'string',
          description: 'The inventory item ID',
        },
      },
      required: ['inventoryItemId'],
    },
  },
  {
    name: 'listLocations',
    description: 'List all inventory locations for the shop.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getProductInventory',
    description:
      'Get inventory details for all variants of a product, including inventory item IDs and levels.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID (gid://shopify/Product/...)',
        },
      },
      required: ['productId'],
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {tools: TOOLS};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params;

  try {
    let result: string;

    switch (name) {
      case 'executeGraphQL': {
        const input = args as {
          query?: string;
          variables?: Record<string, unknown>;
          operationName?: string;
          commonQuery?: keyof typeof COMMON_QUERIES;
        };

        // Use common query if specified
        const query =
          input.commonQuery && COMMON_QUERIES[input.commonQuery]
            ? COMMON_QUERIES[input.commonQuery]
            : input.query;

        if (!query) {
          result = JSON.stringify({
            success: false,
            error: 'Either query or commonQuery must be provided',
          });
        } else {
          const validated = ExecuteGraphQLSchema.parse({
            query,
            variables: input.variables,
            operationName: input.operationName,
          });
          result = await executeGraphQL(validated);
        }
        break;
      }

      case 'createProduct': {
        const validated = CreateProductSchema.parse(args);
        result = await createProduct(validated);
        break;
      }

      case 'updateProduct': {
        const validated = UpdateProductSchema.parse(args);
        result = await updateProduct(validated);
        break;
      }

      case 'getProduct': {
        const validated = GetProductSchema.parse(args);
        result = await getProduct(validated);
        break;
      }

      case 'listProducts': {
        const validated = ListProductsSchema.parse(args);
        result = await listProducts(validated);
        break;
      }

      case 'deleteProduct': {
        const {productId} = args as {productId: string};
        result = await deleteProduct(productId);
        break;
      }

      case 'updateInventory': {
        const validated = UpdateInventorySchema.parse(args);
        result = await updateInventory(validated);
        break;
      }

      case 'adjustInventory': {
        const {inventoryItemId, locationId, delta, reason} = args as {
          inventoryItemId: string;
          locationId: string;
          delta: number;
          reason?: string;
        };
        result = await adjustInventory(inventoryItemId, locationId, delta, reason);
        break;
      }

      case 'getInventoryLevels': {
        const {inventoryItemId} = args as {inventoryItemId: string};
        result = await getInventoryLevels(inventoryItemId);
        break;
      }

      case 'listLocations': {
        result = await listLocations();
        break;
      }

      case 'getProductInventory': {
        const {productId} = args as {productId: string};
        result = await getProductInventory(productId);
        break;
      }

      default:
        result = JSON.stringify({success: false, error: `Unknown tool: ${name}`});
    }

    return {
      content: [{type: 'text', text: result}],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{type: 'text', text: JSON.stringify({success: false, error: message})}],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Shopify MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
