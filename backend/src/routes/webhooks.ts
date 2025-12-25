import express from 'express';
import { shopify } from '../shopify/shopifyApi.js';
import { sessionStorage } from '../utils/sessionStorage.js';
import pino from 'pino';

const logger = pino({ name: 'webhookRoutes' });
const router = express.Router();

// Webhook handler for app uninstalled
router.post('/api/webhooks/app/uninstalled', express.text({ type: '*/*' }), async (req, res) => {
  try {
    logger.info('Processing app/uninstalled webhook');

    // Verify the webhook
    const sessionId = await shopify.session.getCurrentId({
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    if (!sessionId) {
      logger.error('Failed to get session ID from webhook');
      return res.status(401).send('Unauthorized');
    }

    // Parse webhook body
    const webhookBody = JSON.parse(req.body as string);
    const shop = webhookBody.myshopify_domain;

    logger.info({ shop }, 'App uninstalled');

    // Delete all sessions for this shop
    const sessions = await sessionStorage.findSessionsByShop(shop);
    const sessionIds = sessions.map(s => s.id);
    await sessionStorage.deleteSessions(sessionIds);

    logger.info({ shop, sessionCount: sessionIds.length }, 'Cleaned up sessions after uninstall');

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error }, 'Failed to process app/uninstalled webhook');
    res.status(500).send('Error processing webhook');
  }
});

// Webhook handler for shop update
router.post('/api/webhooks/shop/update', express.text({ type: '*/*' }), async (req, res) => {
  try {
    logger.info('Processing shop/update webhook');

    const webhookBody = JSON.parse(req.body as string);
    const shop = webhookBody.myshopify_domain;

    logger.info({ shop, data: webhookBody }, 'Shop updated');

    // You can add custom logic here to handle shop updates
    // For example, updating shop info in your database

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error }, 'Failed to process shop/update webhook');
    res.status(500).send('Error processing webhook');
  }
});

// GDPR webhooks (required for Shopify apps)

// Customer data request
router.post('/api/webhooks/customers/data_request', express.text({ type: '*/*' }), async (req, res) => {
  try {
    logger.info('Processing customers/data_request webhook');

    const webhookBody = JSON.parse(req.body as string);
    logger.info({ shop: webhookBody.shop_domain, customerId: webhookBody.customer.id }, 'Customer data requested');

    // Implement your logic to compile and send customer data
    // This is required for GDPR compliance

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error }, 'Failed to process customers/data_request webhook');
    res.status(500).send('Error processing webhook');
  }
});

// Customer redact
router.post('/api/webhooks/customers/redact', express.text({ type: '*/*' }), async (req, res) => {
  try {
    logger.info('Processing customers/redact webhook');

    const webhookBody = JSON.parse(req.body as string);
    logger.info({ shop: webhookBody.shop_domain, customerId: webhookBody.customer.id }, 'Customer data redaction requested');

    // Implement your logic to delete customer data
    // This is required for GDPR compliance

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error }, 'Failed to process customers/redact webhook');
    res.status(500).send('Error processing webhook');
  }
});

// Shop redact
router.post('/api/webhooks/shop/redact', express.text({ type: '*/*' }), async (req, res) => {
  try {
    logger.info('Processing shop/redact webhook');

    const webhookBody = JSON.parse(req.body as string);
    const shop = webhookBody.shop_domain;

    logger.info({ shop }, 'Shop data redaction requested');

    // Delete all sessions for this shop
    const sessions = await sessionStorage.findSessionsByShop(shop);
    const sessionIds = sessions.map(s => s.id);
    await sessionStorage.deleteSessions(sessionIds);

    // Implement your logic to delete all shop data
    // This is required for GDPR compliance

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error }, 'Failed to process shop/redact webhook');
    res.status(500).send('Error processing webhook');
  }
});

export default router;
