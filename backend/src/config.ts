import dotenv from 'dotenv';
import { shopifyCLISession } from './utils/shopifyCLI.js';

dotenv.config();

// Try to load from Shopify CLI session if environment variables are not set
const cliToken = shopifyCLISession.getAccessToken();
const cliShop = shopifyCLISession.getShopDomain();

export const config = {
  // Shopify Admin API (for single-store mode)
  shopify: {
    adminApiToken: process.env.SHOPIFY_ADMIN_API_TOKEN || cliToken || '',
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || cliShop || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2025-07',
  },

  // OAuth Configuration (for multi-merchant mode)
  oauth: {
    enabled: process.env.OAUTH_ENABLED === 'true',
    apiKey: process.env.SHOPIFY_API_KEY || '',
    apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
    scopes: (process.env.SHOPIFY_SCOPES || 'read_products,write_storefront_access_tokens,read_storefront_access_tokens').split(','),
    hostName: process.env.SHOPIFY_APP_URL || `http://localhost:${process.env.PORT || '4000'}`,
  },

  // Storefront Token Management
  storefrontToken: {
    cacheTTL: parseInt(process.env.STOREFRONT_TOKEN_CACHE_TTL || '2592000000', 10), // 30 days default
    rotationDays: parseInt(process.env.STOREFRONT_TOKEN_ROTATION_DAYS || '30', 10),
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },

  // Push Notifications (Optional)
  pushNotifications: {
    vapid: {
      publicKey: process.env.VAPID_PUBLIC_KEY || '',
      privateKey: process.env.VAPID_PRIVATE_KEY || '',
      subject: process.env.VAPID_SUBJECT || '',
    },
    fcm: {
      serverKey: process.env.FCM_SERVER_KEY || '',
    },
  },
};

// Validation
export function validateConfig() {
  const errors: string[] = [];

  // Check if OAuth mode is enabled
  if (config.oauth.enabled) {
    if (!config.oauth.apiKey) {
      errors.push('SHOPIFY_API_KEY is required when OAuth is enabled');
    }
    if (!config.oauth.apiSecretKey) {
      errors.push('SHOPIFY_API_SECRET is required when OAuth is enabled');
    }
    if (!config.oauth.hostName) {
      errors.push('SHOPIFY_APP_URL is required when OAuth is enabled');
    }
  } else {
    // Single-store mode validation
    if (!config.shopify.adminApiToken) {
      errors.push('SHOPIFY_ADMIN_API_TOKEN is required. Either set it in .env or run via Shopify CLI (`shopify app dev`)');
    }

    if (!config.shopify.storeDomain) {
      errors.push('SHOPIFY_STORE_DOMAIN is required. Either set it in .env or run via Shopify CLI (`shopify app dev`)');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
