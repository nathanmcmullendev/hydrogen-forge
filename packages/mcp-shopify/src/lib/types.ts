import {z} from 'zod';

// Shopify API Configuration
export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
}

// GraphQL Response types
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, unknown>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{line: number; column: number}>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

// Tool input schemas
export const ExecuteGraphQLSchema = z.object({
  query: z.string().describe('The GraphQL query or mutation to execute'),
  variables: z
    .record(z.unknown())
    .optional()
    .describe('Variables for the GraphQL operation'),
  operationName: z
    .string()
    .optional()
    .describe('Name of the operation to execute if query contains multiple'),
});

export const CreateProductSchema = z.object({
  title: z.string().describe('Product title'),
  descriptionHtml: z.string().optional().describe('Product description in HTML'),
  vendor: z.string().optional().describe('Product vendor/brand'),
  productType: z.string().optional().describe('Product type/category'),
  tags: z.array(z.string()).optional().describe('Product tags'),
  status: z
    .enum(['ACTIVE', 'DRAFT', 'ARCHIVED'])
    .optional()
    .describe('Product status'),
  variants: z
    .array(
      z.object({
        price: z.string().describe('Variant price'),
        sku: z.string().optional().describe('Variant SKU'),
        inventoryQuantity: z
          .number()
          .optional()
          .describe('Initial inventory quantity'),
        options: z
          .array(z.string())
          .optional()
          .describe('Variant option values'),
      }),
    )
    .optional()
    .describe('Product variants'),
  images: z
    .array(
      z.object({
        src: z.string().describe('Image URL'),
        altText: z.string().optional().describe('Alt text for accessibility'),
      }),
    )
    .optional()
    .describe('Product images'),
});

export const UpdateInventorySchema = z.object({
  inventoryItemId: z.string().describe('The inventory item ID (gid://...)'),
  locationId: z.string().describe('The location ID (gid://...)'),
  quantity: z.number().describe('New quantity to set'),
  reason: z
    .enum(['correction', 'cycle_count_available', 'received', 'other'])
    .optional()
    .describe('Reason for inventory adjustment'),
});

export const UpdateProductSchema = z.object({
  id: z.string().describe('Product ID (gid://shopify/Product/...)'),
  title: z.string().optional().describe('New product title'),
  descriptionHtml: z.string().optional().describe('New product description in HTML'),
  vendor: z.string().optional().describe('New product vendor/brand'),
  productType: z.string().optional().describe('New product type/category'),
  tags: z.array(z.string()).optional().describe('New product tags'),
  status: z
    .enum(['ACTIVE', 'DRAFT', 'ARCHIVED'])
    .optional()
    .describe('New product status'),
});

export const GetProductSchema = z.object({
  id: z.string().optional().describe('Product ID (gid://shopify/Product/...)'),
  handle: z.string().optional().describe('Product handle/slug'),
});

export const ListProductsSchema = z.object({
  first: z.number().optional().default(10).describe('Number of products to fetch'),
  query: z.string().optional().describe('Search query to filter products'),
  sortKey: z
    .enum(['TITLE', 'PRODUCT_TYPE', 'VENDOR', 'CREATED_AT', 'UPDATED_AT', 'INVENTORY_TOTAL'])
    .optional()
    .describe('Field to sort by'),
  reverse: z.boolean().optional().describe('Reverse the sort order'),
});

// Type exports
export type ExecuteGraphQLInput = z.infer<typeof ExecuteGraphQLSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type GetProductInput = z.infer<typeof GetProductSchema>;
export type ListProductsInput = z.infer<typeof ListProductsSchema>;
