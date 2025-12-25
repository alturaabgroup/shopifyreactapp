import { config } from '../config.js';
import pino from 'pino';

const logger = pino({ name: 'adminClient' });

export interface AdminAPIResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

/**
 * Shopify Admin GraphQL API Client
 * Handles all Admin API (2025-07) requests with secure authentication
 */
export class AdminClient {
  private readonly endpoint: string;
  private readonly headers: HeadersInit;

  constructor() {
    this.endpoint = `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.shopify.adminApiToken,
    };
  }

  /**
   * Execute a GraphQL query or mutation against the Admin API
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<AdminAPIResponse<T>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.error({ status: response.status, body: text }, 'Admin API request failed');
        throw new Error(`Admin API request failed: ${response.status} ${text}`);
      }

      const result = await response.json() as AdminAPIResponse<T>;

      if (result.errors && result.errors.length > 0) {
        logger.error({ errors: result.errors }, 'Admin API returned errors');
      }

      return result;
    } catch (error) {
      logger.error({ error }, 'Admin API request exception');
      throw error;
    }
  }

  /**
   * Create a new Storefront Access Token
   */
  async createStorefrontAccessToken(title: string): Promise<{ token: string; id: string }> {
    const mutation = `
      mutation CreateStorefrontAccessToken($input: StorefrontAccessTokenInput!) {
        storefrontAccessTokenCreate(input: $input) {
          storefrontAccessToken {
            id
            accessToken
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
      },
    };

    const response = await this.query<{
      storefrontAccessTokenCreate: {
        storefrontAccessToken?: {
          id: string;
          accessToken: string;
          title: string;
        };
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (response.errors) {
      throw new Error(`Failed to create storefront access token: ${JSON.stringify(response.errors)}`);
    }

    const result = response.data?.storefrontAccessTokenCreate;
    if (result?.userErrors && result.userErrors.length > 0) {
      throw new Error(`User errors creating token: ${JSON.stringify(result.userErrors)}`);
    }

    if (!result?.storefrontAccessToken) {
      throw new Error('No storefront access token returned');
    }

    return {
      token: result.storefrontAccessToken.accessToken,
      id: result.storefrontAccessToken.id,
    };
  }

  /**
   * List all Storefront Access Tokens
   */
  async listStorefrontAccessTokens(): Promise<Array<{ id: string; title: string; createdAt: string }>> {
    const query = `
      query ListStorefrontAccessTokens {
        shop {
          storefrontAccessTokens(first: 50) {
            edges {
              node {
                id
                title
                createdAt
              }
            }
          }
        }
      }
    `;

    const response = await this.query<{
      shop: {
        storefrontAccessTokens: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              createdAt: string;
            };
          }>;
        };
      };
    }>(query);

    if (response.errors) {
      throw new Error(`Failed to list storefront access tokens: ${JSON.stringify(response.errors)}`);
    }

    return response.data?.shop.storefrontAccessTokens.edges.map((e) => e.node) || [];
  }

  /**
   * Create a new Storefront Access Token for a specific shop (OAuth mode)
   */
  async createStorefrontAccessTokenForShop(shop: string, accessToken: string, title: string): Promise<{ token: string; id: string }> {
    const endpoint = `https://${shop}/admin/api/${config.shopify.apiVersion}/graphql.json`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    };

    const mutation = `
      mutation CreateStorefrontAccessToken($input: StorefrontAccessTokenInput!) {
        storefrontAccessTokenCreate(input: $input) {
          storefrontAccessToken {
            id
            accessToken
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: mutation, variables }),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.error({ status: response.status, body: text, shop }, 'Admin API request failed for shop');
        throw new Error(`Admin API request failed: ${response.status} ${text}`);
      }

      const result = await response.json() as AdminAPIResponse<{
        storefrontAccessTokenCreate: {
          storefrontAccessToken?: {
            id: string;
            accessToken: string;
            title: string;
          };
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>;

      if (result.errors) {
        throw new Error(`Failed to create storefront access token: ${JSON.stringify(result.errors)}`);
      }

      const data = result.data?.storefrontAccessTokenCreate;
      if (data?.userErrors && data.userErrors.length > 0) {
        throw new Error(`User errors creating token: ${JSON.stringify(data.userErrors)}`);
      }

      if (!data?.storefrontAccessToken) {
        throw new Error('No storefront access token returned');
      }

      return {
        token: data.storefrontAccessToken.accessToken,
        id: data.storefrontAccessToken.id,
      };
    } catch (error) {
      logger.error({ error, shop }, 'Failed to create storefront token for shop');
      throw error;
    }
  }

  /**
   * Delete a Storefront Access Token for a specific shop (OAuth mode)
   */
  async deleteStorefrontAccessTokenForShop(shop: string, accessToken: string, id: string): Promise<boolean> {
    const endpoint = `https://${shop}/admin/api/${config.shopify.apiVersion}/graphql.json`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    };

    const mutation = `
      mutation DeleteStorefrontAccessToken($input: StorefrontAccessTokenDeleteInput!) {
        storefrontAccessTokenDelete(input: $input) {
          deletedStorefrontAccessTokenId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: mutation, variables }),
      });

      if (!response.ok) {
        logger.error({ status: response.status, shop, tokenId: id }, 'Failed to delete token for shop');
        return false;
      }

      const result = await response.json() as AdminAPIResponse<{
        storefrontAccessTokenDelete: {
          deletedStorefrontAccessTokenId?: string;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>;

      if (result.errors) {
        logger.error({ errors: result.errors, shop, tokenId: id }, 'Failed to delete storefront access token');
        return false;
      }

      const data = result.data?.storefrontAccessTokenDelete;
      if (data?.userErrors && data.userErrors.length > 0) {
        logger.error({ errors: data.userErrors, shop, tokenId: id }, 'User errors deleting token');
        return false;
      }

      return !!data?.deletedStorefrontAccessTokenId;
    } catch (error) {
      logger.error({ error, shop, tokenId: id }, 'Exception deleting token for shop');
      return false;
    }
  }
    const mutation = `
      mutation DeleteStorefrontAccessToken($input: StorefrontAccessTokenDeleteInput!) {
        storefrontAccessTokenDelete(input: $input) {
          deletedStorefrontAccessTokenId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id,
      },
    };

    const response = await this.query<{
      storefrontAccessTokenDelete: {
        deletedStorefrontAccessTokenId?: string;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(mutation, variables);

    if (response.errors) {
      logger.error({ errors: response.errors, tokenId: id }, 'Failed to delete storefront access token');
      return false;
    }

    const result = response.data?.storefrontAccessTokenDelete;
    if (result?.userErrors && result.userErrors.length > 0) {
      logger.error({ errors: result.userErrors, tokenId: id }, 'User errors deleting token');
      return false;
    }

    return !!result?.deletedStorefrontAccessTokenId;
  }
}

export const adminClient = new AdminClient();
