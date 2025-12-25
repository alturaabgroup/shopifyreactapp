import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import pino from 'pino';

const logger = pino({ name: 'shopifyCLI' });

interface ShopifySession {
  accessToken?: string;
  shop?: string;
  [key: string]: any;
}

/**
 * Utility to read Shopify CLI session data
 * The Shopify CLI stores session tokens in ~/.config/shopify/
 */
export class ShopifyCLISession {
  private sessionDir: string;

  constructor() {
    this.sessionDir = join(homedir(), '.config', 'shopify');
  }

  /**
   * Try to load access token from Shopify CLI session
   * Returns null if no session is found
   */
  getAccessToken(): string | null {
    try {
      // Check if session directory exists
      if (!existsSync(this.sessionDir)) {
        logger.debug('Shopify CLI session directory not found');
        return null;
      }

      // Try to read session file
      // The exact file structure may vary, so we'll try common patterns
      const sessionFile = join(this.sessionDir, 'session.json');
      
      if (!existsSync(sessionFile)) {
        logger.debug('Shopify CLI session file not found');
        return null;
      }

      const sessionData = JSON.parse(readFileSync(sessionFile, 'utf-8')) as ShopifySession;
      
      if (sessionData.accessToken) {
        logger.info('Loaded access token from Shopify CLI session');
        return sessionData.accessToken;
      }

      return null;
    } catch (error) {
      logger.warn({ error }, 'Failed to read Shopify CLI session');
      return null;
    }
  }

  /**
   * Get shop domain from CLI session
   */
  getShopDomain(): string | null {
    try {
      if (!existsSync(this.sessionDir)) {
        return null;
      }

      const sessionFile = join(this.sessionDir, 'session.json');
      
      if (!existsSync(sessionFile)) {
        return null;
      }

      const sessionData = JSON.parse(readFileSync(sessionFile, 'utf-8')) as ShopifySession;
      
      if (sessionData.shop) {
        logger.info('Loaded shop domain from Shopify CLI session');
        return sessionData.shop;
      }

      return null;
    } catch (error) {
      logger.warn({ error }, 'Failed to read shop domain from CLI session');
      return null;
    }
  }
}

export const shopifyCLISession = new ShopifyCLISession();
