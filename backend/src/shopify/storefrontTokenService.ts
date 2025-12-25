import { adminClient } from './adminClient.js';
import { ExpiringCache } from '../utils/cache.js';
import { config } from '../config.js';
import pino from 'pino';

const logger = pino({ name: 'storefrontTokenService' });

interface StorefrontTokenData {
  token: string;
  tokenId: string;
  createdAt: Date;
}

/**
 * Storefront Access Token Service
 * Manages creation, caching, and rotation of Storefront Access Tokens
 */
export class StorefrontTokenService {
  private cache: ExpiringCache<StorefrontTokenData>;
  private readonly tokenTitle = 'Storefront-Auto-Generated';

  constructor() {
    this.cache = new ExpiringCache<StorefrontTokenData>(config.storefrontToken.cacheTTL);
  }

  /**
   * Get or create a Storefront Access Token for a specific shop (OAuth mode)
   */
  async getStorefrontTokenForShop(shop: string, accessToken: string): Promise<string> {
    // In OAuth mode, we use a per-shop cache key
    const cacheKey = `shop:${shop}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      logger.info({ shop }, 'Returning cached storefront token for shop');
      
      // Check if rotation is needed based on age
      const ageInDays = (Date.now() - cached.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays >= config.storefrontToken.rotationDays) {
        logger.info({ shop, ageInDays }, 'Token needs rotation, creating new token');
        return this.createAndCacheTokenForShop(shop, accessToken, cached.tokenId);
      }
      
      return cached.token;
    }

    // No cached token, create new one
    logger.info({ shop }, 'No cached token for shop, creating new token');
    return this.createAndCacheTokenForShop(shop, accessToken);
  }

  /**
   * Create a new Storefront Access Token for a specific shop and cache it
   */
  private async createAndCacheTokenForShop(shop: string, accessToken: string, oldTokenId?: string): Promise<string> {
    try {
      // Create new token using the shop's access token
      const { token, id } = await adminClient.createStorefrontAccessTokenForShop(
        shop,
        accessToken,
        `${this.tokenTitle}-${shop}`
      );
      
      logger.info({ shop, tokenId: id }, 'Created new storefront access token for shop');

      // Cache the new token with shop-specific key
      const cacheKey = `shop:${shop}`;
      this.cache.set(
        {
          token,
          tokenId: id,
          createdAt: new Date(),
        },
        cacheKey
      );

      // Delete old token if rotation is happening
      if (oldTokenId) {
        try {
          const deleted = await adminClient.deleteStorefrontAccessTokenForShop(shop, accessToken, oldTokenId);
          if (deleted) {
            logger.info({ shop, oldTokenId }, 'Deleted old storefront access token during rotation');
          }
        } catch (error) {
          logger.error({ error, shop, oldTokenId }, 'Error deleting old token during rotation');
        }
      }

      return token;
    } catch (error) {
      logger.error({ error, shop }, 'Failed to create storefront access token for shop');
      throw error;
    }
  }

  /**
   * Create a new Storefront Access Token and cache it
   * Optionally delete an old token during rotation
   */
  private async createAndCacheToken(oldTokenId?: string): Promise<string> {
    try {
      // Create new token
      const { token, id } = await adminClient.createStorefrontAccessToken(this.tokenTitle);
      
      logger.info({ tokenId: id }, 'Created new storefront access token');

      // Cache the new token
      this.cache.set({
        token,
        tokenId: id,
        createdAt: new Date(),
      });

      // Delete old token if rotation is happening
      if (oldTokenId) {
        try {
          const deleted = await adminClient.deleteStorefrontAccessToken(oldTokenId);
          if (deleted) {
            logger.info({ oldTokenId }, 'Deleted old storefront access token during rotation');
          } else {
            logger.warn({ oldTokenId }, 'Failed to delete old token during rotation');
          }
        } catch (error) {
          logger.error({ error, oldTokenId }, 'Error deleting old token during rotation');
        }
      }

      return token;
    } catch (error) {
      logger.error({ error }, 'Failed to create storefront access token');
      throw error;
    }
  }

  /**
   * Manually clear the cached token (useful for testing or forced rotation)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Cleared storefront token cache');
  }

  /**
   * Clean up old tokens (can be called manually or scheduled)
   */
  async cleanupOldTokens(): Promise<number> {
    try {
      const tokens = await adminClient.listStorefrontAccessTokens();
      const titlePattern = /^Storefront-Auto-Generated/;
      
      // Get current cached token to avoid deleting it
      const cached = this.cache.get();
      
      // Find tokens older than rotation days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.storefrontToken.rotationDays);
      
      let deletedCount = 0;
      for (const token of tokens) {
        if (
          titlePattern.test(token.title) &&
          token.id !== cached?.tokenId &&
          new Date(token.createdAt) < cutoffDate
        ) {
          const deleted = await adminClient.deleteStorefrontAccessToken(token.id);
          if (deleted) {
            deletedCount++;
            logger.info({ tokenId: token.id, createdAt: token.createdAt }, 'Deleted old storefront token');
          }
        }
      }
      
      logger.info({ deletedCount }, 'Cleanup completed');
      return deletedCount;
    } catch (error) {
      logger.error({ error }, 'Failed to cleanup old tokens');
      throw error;
    }
  }
}

export const storefrontTokenService = new StorefrontTokenService();
