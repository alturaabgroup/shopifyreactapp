import { Router, Request, Response } from 'express';
import { storefrontTokenService } from '../shopify/storefrontTokenService.js';
import pino from 'pino';

const logger = pino({ name: 'storefrontTokenRoute' });
const router = Router();

/**
 * GET /api/storefront-token
 * Returns the current Storefront Access Token
 * Creates a new one if none exists or if rotation is needed
 */
router.get('/api/storefront-token', async (req: Request, res: Response) => {
  try {
    logger.info('Storefront token requested');
    
    const token = await storefrontTokenService.getStorefrontToken();
    
    res.json({
      success: true,
      token,
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get storefront token');
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to retrieve storefront access token';
    
    if (error.message && error.message.includes('SHOPIFY_ADMIN_API_TOKEN')) {
      errorMessage = 'Shopify Admin API token not configured. Please set SHOPIFY_ADMIN_API_TOKEN in your .env file.';
    } else if (error.message && error.message.includes('SHOPIFY_STORE_DOMAIN')) {
      errorMessage = 'Shopify store domain not configured. Please set SHOPIFY_STORE_DOMAIN in your .env file.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * POST /api/storefront-token/rotate
 * Manually trigger token rotation
 */
router.post('/api/storefront-token/rotate', async (req: Request, res: Response) => {
  try {
    logger.info('Manual token rotation requested');
    
    // Clear cache to force new token creation
    storefrontTokenService.clearCache();
    const token = await storefrontTokenService.getStorefrontToken();
    
    res.json({
      success: true,
      message: 'Token rotated successfully',
      token,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to rotate storefront token');
    res.status(500).json({
      success: false,
      error: 'Failed to rotate storefront access token',
    });
  }
});

/**
 * POST /api/storefront-token/cleanup
 * Clean up old tokens
 */
router.post('/api/storefront-token/cleanup', async (req: Request, res: Response) => {
  try {
    logger.info('Token cleanup requested');
    
    const deletedCount = await storefrontTokenService.cleanupOldTokens();
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old token(s)`,
      deletedCount,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old tokens');
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old tokens',
    });
  }
});

export default router;
