import { GraphQLClient } from 'graphql-request';
import type { GraphQLResponse } from '@/types/shopify';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-10';
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

const endpoint = SHOPIFY_DOMAIN 
  ? `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`
  : '';

export const shopifyClient = endpoint && STOREFRONT_TOKEN
  ? new GraphQLClient(endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        'Content-Type': 'application/json',
      },
    })
  : null;

// Helper to log rate limit info
export function logRateLimit(response: GraphQLResponse<any>) {
  if (response.extensions?.cost) {
    const { cost } = response.extensions;
    const available = cost.throttleStatus.currentlyAvailable;
    const max = cost.throttleStatus.maximumAvailable;
    const percentage = ((max - available) / max * 100).toFixed(1);
    
    console.log(`[Shopify Rate Limit] Used: ${percentage}% (${cost.actualQueryCost} cost, ${available}/${max} available)`);
    
    if (available < max * 0.2) {
      console.warn('[Shopify Rate Limit] Warning: Nearing rate limit threshold!');
    }
  }
}

// Wrapper for requests with rate limit logging
export async function shopifyRequest<T>(
  query: string,
  variables?: Record<string, any>,
  customerToken?: string
): Promise<T> {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error('Missing required Shopify environment variables. Please check your .env.local file.');
  }

  const headers: Record<string, string> = {
    'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    'Content-Type': 'application/json',
  };

  if (customerToken) {
    headers['X-Shopify-Customer-Access-Token'] = customerToken;
  }

  const client = new GraphQLClient(endpoint, { headers });
  
  try {
    const response = await client.request<GraphQLResponse<T>>(query, variables);
    
    // Log rate limit if available
    if ((response as any).extensions) {
      logRateLimit(response as any);
    }
    
    return response as T;
  } catch (error: any) {
    console.error('[Shopify API Error]', error.response?.errors || error.message);
    throw error;
  }
}

export default shopifyClient;
