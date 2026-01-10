import type {ShopifyConfig, GraphQLResponse} from './types.js';

const DEFAULT_API_VERSION = '2024-10';

export class ShopifyClient {
  private shopDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: ShopifyConfig) {
    this.shopDomain = config.shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || DEFAULT_API_VERSION;
  }

  get adminApiUrl(): string {
    return `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`;
  }

  async executeGraphQL<T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
    operationName?: string,
  ): Promise<GraphQLResponse<T>> {
    const body: Record<string, unknown> = {query};

    if (variables) {
      body.variables = variables;
    }

    if (operationName) {
      body.operationName = operationName;
    }

    const response = await fetch(this.adminApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as GraphQLResponse<T>;
    return result;
  }
}

// Singleton instance management
let clientInstance: ShopifyClient | null = null;

export function getShopifyClient(): ShopifyClient {
  if (!clientInstance) {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopDomain || !accessToken) {
      throw new Error(
        'Missing Shopify credentials. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables.',
      );
    }

    clientInstance = new ShopifyClient({
      shopDomain,
      accessToken,
      apiVersion: process.env.SHOPIFY_API_VERSION,
    });
  }

  return clientInstance;
}

export function resetShopifyClient(): void {
  clientInstance = null;
}
