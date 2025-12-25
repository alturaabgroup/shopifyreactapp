const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2025-07';

let cachedToken: string | null = null;

/**
 * Fetch the Storefront Access Token from the backend
 */
async function getStorefrontToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/storefront-token`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch storefront token: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.token) {
      throw new Error('Invalid token response from backend');
    }

    cachedToken = data.token;
    return data.token;
  } catch (error) {
    console.error('Error fetching storefront token:', error);
    throw error;
  }
}

/**
 * Shopify Storefront GraphQL API Client
 */
export class StorefrontClient {
  private endpoint: string;
  private tokenPromise: Promise<string> | null = null;

  constructor() {
    this.endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  }

  /**
   * Execute a GraphQL query against the Storefront API
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      // Get token (reuse promise if already fetching)
      if (!this.tokenPromise) {
        this.tokenPromise = getStorefrontToken();
      }
      const token = await this.tokenPromise;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`Storefront API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        console.error('Storefront API errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('Storefront API request error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const storefrontClient = new StorefrontClient();
