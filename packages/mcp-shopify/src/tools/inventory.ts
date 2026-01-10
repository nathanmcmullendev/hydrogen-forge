import {getShopifyClient} from '../lib/shopify-client.js';
import type {UpdateInventoryInput} from '../lib/types.js';

// GraphQL Mutations
const SET_INVENTORY_MUTATION = `
  mutation SetInventoryQuantity($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup {
        createdAt
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADJUST_INVENTORY_MUTATION = `
  mutation AdjustInventory($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        createdAt
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Queries
const GET_INVENTORY_LEVELS_QUERY = `
  query GetInventoryLevels($inventoryItemId: ID!) {
    inventoryItem(id: $inventoryItemId) {
      id
      sku
      tracked
      inventoryLevels(first: 50) {
        edges {
          node {
            id
            available
            location {
              id
              name
              isActive
            }
          }
        }
      }
    }
  }
`;

const LIST_LOCATIONS_QUERY = `
  query ListLocations {
    locations(first: 50) {
      edges {
        node {
          id
          name
          isActive
          fulfillsOnlineOrders
          address {
            address1
            address2
            city
            province
            country
            zip
          }
        }
      }
    }
  }
`;

const GET_PRODUCT_INVENTORY_QUERY = `
  query GetProductInventory($productId: ID!) {
    product(id: $productId) {
      id
      title
      totalInventory
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            inventoryQuantity
            inventoryItem {
              id
              tracked
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
        }
      }
    }
  }
`;

export async function updateInventory(input: UpdateInventoryInput): Promise<string> {
  const client = getShopifyClient();

  try {
    const setInput = {
      name: 'available',
      reason: input.reason?.toUpperCase() || 'CORRECTION',
      quantities: [
        {
          inventoryItemId: input.inventoryItemId,
          locationId: input.locationId,
          quantity: input.quantity,
        },
      ],
    };

    const result = await client.executeGraphQL<{
      inventorySetQuantities: {
        inventoryAdjustmentGroup: Record<string, unknown> | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    }>(SET_INVENTORY_MUTATION, {input: setInput});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const inventorySet = result.data?.inventorySetQuantities;

    if (inventorySet?.userErrors && inventorySet.userErrors.length > 0) {
      return JSON.stringify(
        {success: false, userErrors: inventorySet.userErrors},
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        adjustment: inventorySet?.inventoryAdjustmentGroup,
        message: `Inventory updated to ${input.quantity} units`,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function adjustInventory(
  inventoryItemId: string,
  locationId: string,
  delta: number,
  reason?: string,
): Promise<string> {
  const client = getShopifyClient();

  try {
    const adjustInput = {
      name: 'available',
      reason: reason?.toUpperCase() || 'CORRECTION',
      changes: [
        {
          inventoryItemId,
          locationId,
          delta,
        },
      ],
    };

    const result = await client.executeGraphQL<{
      inventoryAdjustQuantities: {
        inventoryAdjustmentGroup: Record<string, unknown> | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    }>(ADJUST_INVENTORY_MUTATION, {input: adjustInput});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const inventoryAdjust = result.data?.inventoryAdjustQuantities;

    if (inventoryAdjust?.userErrors && inventoryAdjust.userErrors.length > 0) {
      return JSON.stringify(
        {success: false, userErrors: inventoryAdjust.userErrors},
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        adjustment: inventoryAdjust?.inventoryAdjustmentGroup,
        message: `Inventory adjusted by ${delta > 0 ? '+' : ''}${delta} units`,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function getInventoryLevels(inventoryItemId: string): Promise<string> {
  const client = getShopifyClient();

  try {
    const result = await client.executeGraphQL<{
      inventoryItem: {
        id: string;
        sku: string;
        tracked: boolean;
        inventoryLevels: {
          edges: Array<{
            node: {
              id: string;
              available: number;
              location: {id: string; name: string; isActive: boolean};
            };
          }>;
        };
      } | null;
    }>(GET_INVENTORY_LEVELS_QUERY, {inventoryItemId});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const inventoryItem = result.data?.inventoryItem;

    if (!inventoryItem) {
      return JSON.stringify(
        {success: false, error: 'Inventory item not found'},
        null,
        2,
      );
    }

    const levels = inventoryItem.inventoryLevels.edges.map((e) => ({
      locationId: e.node.location.id,
      locationName: e.node.location.name,
      available: e.node.available,
      isActive: e.node.location.isActive,
    }));

    return JSON.stringify(
      {
        success: true,
        inventoryItemId: inventoryItem.id,
        sku: inventoryItem.sku,
        tracked: inventoryItem.tracked,
        levels,
        totalAvailable: levels.reduce((sum, l) => sum + l.available, 0),
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function listLocations(): Promise<string> {
  const client = getShopifyClient();

  try {
    const result = await client.executeGraphQL<{
      locations: {
        edges: Array<{
          node: {
            id: string;
            name: string;
            isActive: boolean;
            fulfillsOnlineOrders: boolean;
            address: Record<string, string>;
          };
        }>;
      };
    }>(LIST_LOCATIONS_QUERY);

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const locations = result.data?.locations.edges.map((e) => e.node) || [];

    return JSON.stringify(
      {
        success: true,
        locations,
        count: locations.length,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function getProductInventory(productId: string): Promise<string> {
  const client = getShopifyClient();

  try {
    const result = await client.executeGraphQL<{
      product: {
        id: string;
        title: string;
        totalInventory: number;
        variants: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              sku: string;
              inventoryQuantity: number;
              inventoryItem: {
                id: string;
                tracked: boolean;
                inventoryLevels: {
                  edges: Array<{
                    node: {
                      id: string;
                      available: number;
                      location: {id: string; name: string};
                    };
                  }>;
                };
              };
            };
          }>;
        };
      } | null;
    }>(GET_PRODUCT_INVENTORY_QUERY, {productId});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const product = result.data?.product;

    if (!product) {
      return JSON.stringify(
        {success: false, error: 'Product not found'},
        null,
        2,
      );
    }

    const variants = product.variants.edges.map((e) => ({
      variantId: e.node.id,
      title: e.node.title,
      sku: e.node.sku,
      inventoryQuantity: e.node.inventoryQuantity,
      inventoryItemId: e.node.inventoryItem.id,
      tracked: e.node.inventoryItem.tracked,
      levels: e.node.inventoryItem.inventoryLevels.edges.map((l) => ({
        locationId: l.node.location.id,
        locationName: l.node.location.name,
        available: l.node.available,
      })),
    }));

    return JSON.stringify(
      {
        success: true,
        productId: product.id,
        title: product.title,
        totalInventory: product.totalInventory,
        variants,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}
