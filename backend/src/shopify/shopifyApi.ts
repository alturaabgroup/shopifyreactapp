import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import { config } from '../config.js';

export const shopify = shopifyApi({
  apiKey: config.oauth.apiKey,
  apiSecretKey: config.oauth.apiSecretKey,
  scopes: config.oauth.scopes,
  hostName: config.oauth.hostName.replace(/https?:\/\//, ''),
  hostScheme: config.oauth.hostName.startsWith('https') ? 'https' : 'http',
  apiVersion: ApiVersion.July25,
  isEmbeddedApp: false,
  logger: {
    level: config.server.nodeEnv === 'development' ? 'debug' : 'info',
  },
});

export { Session };
