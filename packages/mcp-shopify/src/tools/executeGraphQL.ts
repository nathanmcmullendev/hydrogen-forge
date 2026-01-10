import {getShopifyClient} from '../lib/shopify-client.js';
import type {ExecuteGraphQLInput} from '../lib/types.js';

export async function executeGraphQL(input: ExecuteGraphQLInput): Promise<string> {
  const client = getShopifyClient();

  try {
    const result = await client.executeGraphQL(
      input.query,
      input.variables,
      input.operationName,
    );

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message).join('\n');
      return JSON.stringify(
        {
          success: false,
          errors: result.errors,
          message: `GraphQL errors:\n${errorMessages}`,
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        data: result.data,
        extensions: result.extensions,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify(
      {
        success: false,
        error: message,
      },
      null,
      2,
    );
  }
}

// Common GraphQL queries for quick access
export const COMMON_QUERIES = {
  // Get shop info
  shopInfo: `
    query ShopInfo {
      shop {
        name
        email
        primaryDomain {
          url
          host
        }
        plan {
          displayName
        }
        currencyCode
        billingAddress {
          country
        }
      }
    }
  `,

  // List products with pagination
  listProducts: `
    query ListProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            status
            vendor
            productType
            createdAt
            updatedAt
            totalInventory
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `,

  // Get single product
  getProduct: `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        descriptionHtml
        status
        vendor
        productType
        tags
        createdAt
        updatedAt
        totalInventory
        options {
          id
          name
          values
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              price
              compareAtPrice
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
      }
    }
  `,

  // Get inventory levels
  inventoryLevels: `
    query InventoryLevels($inventoryItemId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        id
        sku
        inventoryLevels(first: 10) {
          edges {
            node {
              id
              available
              location {
                id
                name
              }
            }
          }
        }
      }
    }
  `,

  // List locations
  locations: `
    query Locations {
      locations(first: 50) {
        edges {
          node {
            id
            name
            isActive
            address {
              address1
              city
              country
            }
          }
        }
      }
    }
  `,
};
