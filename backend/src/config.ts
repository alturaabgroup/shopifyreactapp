import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Shopify Admin API
  shopify: {
    adminApiToken: process.env.SHOPIFY_ADMIN_API_TOKEN || '',
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2025-07',
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

  if (!config.shopify.adminApiToken) {
    errors.push('SHOPIFY_ADMIN_API_TOKEN is required');
  }

  if (!config.shopify.storeDomain) {
    errors.push('SHOPIFY_STORE_DOMAIN is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
