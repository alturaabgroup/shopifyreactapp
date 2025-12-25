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
   * Delete a Storefront Access Token by ID
   */
  async deleteStorefrontAccessToken(id: string): Promise<boolean> {
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
