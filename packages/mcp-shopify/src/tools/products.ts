import {getShopifyClient} from '../lib/shopify-client.js';
import type {
  CreateProductInput,
  UpdateProductInput,
  GetProductInput,
  ListProductsInput,
} from '../lib/types.js';

// GraphQL Mutations
const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        handle
        status
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

// Queries
const LIST_PRODUCTS_QUERY = `
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
          totalInventory
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export async function createProduct(input: CreateProductInput): Promise<string> {
  const client = getShopifyClient();

  try {
    // Build the product input for Shopify
    const productInput: Record<string, unknown> = {
      title: input.title,
    };

    if (input.descriptionHtml) {
      productInput.descriptionHtml = input.descriptionHtml;
    }
    if (input.vendor) {
      productInput.vendor = input.vendor;
    }
    if (input.productType) {
      productInput.productType = input.productType;
    }
    if (input.tags) {
      productInput.tags = input.tags;
    }
    if (input.status) {
      productInput.status = input.status;
    }

    // Handle variants
    if (input.variants && input.variants.length > 0) {
      productInput.variants = input.variants.map((v) => ({
        price: v.price,
        sku: v.sku,
        options: v.options,
      }));
    }

    // Handle images
    if (input.images && input.images.length > 0) {
      productInput.images = input.images.map((img) => ({
        src: img.src,
        altText: img.altText,
      }));
    }

    const result = await client.executeGraphQL<{
      productCreate: {
        product: Record<string, unknown> | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    }>(CREATE_PRODUCT_MUTATION, {input: productInput});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const productCreate = result.data?.productCreate;

    if (productCreate?.userErrors && productCreate.userErrors.length > 0) {
      return JSON.stringify(
        {
          success: false,
          userErrors: productCreate.userErrors,
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        product: productCreate?.product,
        message: `Product "${input.title}" created successfully`,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function updateProduct(input: UpdateProductInput): Promise<string> {
  const client = getShopifyClient();

  try {
    const productInput: Record<string, unknown> = {
      id: input.id,
    };

    if (input.title) {
      productInput.title = input.title;
    }
    if (input.descriptionHtml) {
      productInput.descriptionHtml = input.descriptionHtml;
    }
    if (input.vendor) {
      productInput.vendor = input.vendor;
    }
    if (input.productType) {
      productInput.productType = input.productType;
    }
    if (input.tags) {
      productInput.tags = input.tags;
    }
    if (input.status) {
      productInput.status = input.status;
    }

    const result = await client.executeGraphQL<{
      productUpdate: {
        product: Record<string, unknown> | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    }>(UPDATE_PRODUCT_MUTATION, {input: productInput});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const productUpdate = result.data?.productUpdate;

    if (productUpdate?.userErrors && productUpdate.userErrors.length > 0) {
      return JSON.stringify(
        {
          success: false,
          userErrors: productUpdate.userErrors,
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        product: productUpdate?.product,
        message: 'Product updated successfully',
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function getProduct(input: GetProductInput): Promise<string> {
  const client = getShopifyClient();

  if (!input.id && !input.handle) {
    return JSON.stringify(
      {success: false, error: 'Either id or handle is required'},
      null,
      2,
    );
  }

  try {
    // Use simpler queries based on what we have
    let query: string;
    let variables: Record<string, unknown>;

    if (input.id) {
      query = `
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
            totalInventory
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  inventoryQuantity
                }
              }
            }
            images(first: 20) {
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
      `;
      variables = {id: input.id};
    } else {
      query = `
        query GetProductByHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
            title
            handle
            descriptionHtml
            status
            vendor
            productType
            tags
            totalInventory
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  inventoryQuantity
                }
              }
            }
            images(first: 20) {
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
      `;
      variables = {handle: input.handle};
    }

    const result = await client.executeGraphQL<{
      product?: Record<string, unknown>;
      productByHandle?: Record<string, unknown>;
    }>(query, variables);

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const product = result.data?.product || result.data?.productByHandle;

    if (!product) {
      return JSON.stringify(
        {success: false, error: 'Product not found'},
        null,
        2,
      );
    }

    return JSON.stringify({success: true, product}, null, 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function listProducts(input: ListProductsInput): Promise<string> {
  const client = getShopifyClient();

  try {
    const variables: Record<string, unknown> = {
      first: input.first || 10,
    };

    if (input.query) {
      variables.query = input.query;
    }
    if (input.sortKey) {
      variables.sortKey = input.sortKey;
    }
    if (input.reverse !== undefined) {
      variables.reverse = input.reverse;
    }

    const result = await client.executeGraphQL<{
      products: {
        edges: Array<{node: Record<string, unknown>; cursor: string}>;
        pageInfo: {hasNextPage: boolean};
      };
    }>(LIST_PRODUCTS_QUERY, variables);

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const products = result.data?.products.edges.map((e) => e.node) || [];

    return JSON.stringify(
      {
        success: true,
        products,
        count: products.length,
        hasNextPage: result.data?.products.pageInfo.hasNextPage,
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}

export async function deleteProduct(productId: string): Promise<string> {
  const client = getShopifyClient();

  try {
    const result = await client.executeGraphQL<{
      productDelete: {
        deletedProductId: string | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    }>(DELETE_PRODUCT_MUTATION, {input: {id: productId}});

    if (result.errors) {
      return JSON.stringify({success: false, errors: result.errors}, null, 2);
    }

    const productDelete = result.data?.productDelete;

    if (productDelete?.userErrors && productDelete.userErrors.length > 0) {
      return JSON.stringify(
        {success: false, userErrors: productDelete.userErrors},
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        deletedProductId: productDelete?.deletedProductId,
        message: 'Product deleted successfully',
      },
      null,
      2,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({success: false, error: message}, null, 2);
  }
}
