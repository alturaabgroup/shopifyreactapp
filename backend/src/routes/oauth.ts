import express from 'express';
import { shopify } from '../shopify/shopifyApi.js';
import { sessionStorage } from '../utils/sessionStorage.js';
import pino from 'pino';

const logger = pino({ name: 'oauthRoutes' });
const router = express.Router();

// OAuth entry point - initiates the OAuth flow
router.get('/api/auth', async (req, res) => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({
        success: false,
        error: 'Missing shop parameter',
      });
    }

    // Validate shop domain format
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shop domain format',
      });
    }

    logger.info({ shop }, 'Starting OAuth flow');

    // Begin OAuth process
    await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(shop, true)!,
      callbackPath: '/api/auth/callback',
      isOnline: false, // Use offline tokens for Admin API access
      rawRequest: req,
      rawResponse: res,
    });
  } catch (error) {
    logger.error({ error }, 'OAuth initiation failed');
    res.status(500).json({
      success: false,
      error: 'Failed to initiate OAuth',
    });
  }
});

// OAuth callback - handles the redirect from Shopify
router.get('/api/auth/callback', async (req, res) => {
  try {
    logger.info('Processing OAuth callback');

    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    // Store the session
    await sessionStorage.storeSession(session);

    logger.info({
      shop: session.shop,
      sessionId: session.id,
      scopes: session.scope,
    }, 'OAuth completed successfully');

    // Redirect to the frontend or app home page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?shop=${session.shop}&success=true`);
  } catch (error) {
    logger.error({ error }, 'OAuth callback failed');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?error=oauth_failed`);
  }
});

// Validate session endpoint - checks if a shop's session is valid
router.get('/api/auth/validate', async (req, res) => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({
        success: false,
        error: 'Missing shop parameter',
      });
    }

    const sessions = await sessionStorage.findSessionsByShop(shop);
    
    if (sessions.length === 0) {
      return res.json({
        success: false,
        valid: false,
        message: 'No session found for this shop',
      });
    }

    // Check if any session is still valid
    const validSession = sessions.find(session => {
      return session.isActive(shopify.config.scopes);
    });

    if (validSession) {
      return res.json({
        success: true,
        valid: true,
        shop: validSession.shop,
        scopes: validSession.scope,
      });
    } else {
      return res.json({
        success: false,
        valid: false,
        message: 'Session expired or invalid scopes',
      });
    }
  } catch (error) {
    logger.error({ error }, 'Session validation failed');
    res.status(500).json({
      success: false,
      error: 'Failed to validate session',
    });
  }
});

// Get shop info endpoint - returns basic shop information
router.get('/api/shop-info', async (req, res) => {
  try {
    const shop = req.query.shop as string;

    if (!shop) {
      return res.status(400).json({
        success: false,
        error: 'Missing shop parameter',
      });
    }

    const sessions = await sessionStorage.findSessionsByShop(shop);
    
    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'No authenticated session found',
        requiresAuth: true,
      });
    }

    const session = sessions[0];

    if (!session.isActive(shopify.config.scopes)) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        requiresAuth: true,
      });
    }

    // Create GraphQL client for this shop
    const client = new shopify.clients.Graphql({ session });

    // Query shop information
    const shopDataQuery = `
      query {
        shop {
          id
          name
          email
          myshopifyDomain
          plan {
            displayName
          }
          primaryDomain {
            url
          }
        }
      }
    `;

    const response = await client.query({
      data: shopDataQuery,
    });

    res.json({
      success: true,
      shop: response.body.data.shop,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to fetch shop info');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shop information',
    });
  }
});

export default router;
