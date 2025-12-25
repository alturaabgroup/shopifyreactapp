import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import pino from 'pino';

const logger = pino({ name: 'notificationsRoute' });
const router = Router();

// In-memory storage for push subscriptions (use database in production)
const subscriptions = new Map<string, any>();

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
router.post('/api/notifications/subscribe', async (req: Request, res: Response) => {
  try {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription data',
      });
    }
    
    // Store subscription (in production, save to database)
    const subscriptionId = subscription.endpoint;
    subscriptions.set(subscriptionId, {
      ...subscription,
      createdAt: new Date(),
    });
    
    logger.info({ subscriptionId }, 'New push notification subscription');
    
    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to subscribe to push notifications');
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to push notifications',
    });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
router.post('/api/notifications/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint is required',
      });
    }
    
    subscriptions.delete(endpoint);
    
    logger.info({ endpoint }, 'Push notification unsubscribed');
    
    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to unsubscribe from push notifications');
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe from push notifications',
    });
  }
});

/**
 * GET /api/notifications/vapid-public-key
 * Get VAPID public key for Web Push
 */
router.get('/api/notifications/vapid-public-key', (req: Request, res: Response) => {
  const publicKey = config.pushNotifications.vapid.publicKey;
  
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      error: 'Push notifications not configured',
    });
  }
  
  res.json({
    success: true,
    publicKey,
  });
});

/**
 * POST /api/notifications/send
 * Trigger a test push notification (for development/testing)
 */
router.post('/api/notifications/send', async (req: Request, res: Response) => {
  try {
    const { title, body, icon, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required',
      });
    }
    
    // In production, use web-push or FCM library to send actual notifications
    // This is a placeholder for the notification sending logic
    logger.info({ title, body, subscriberCount: subscriptions.size }, 'Push notification triggered');
    
    res.json({
      success: true,
      message: `Notification would be sent to ${subscriptions.size} subscriber(s)`,
      subscriberCount: subscriptions.size,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send push notification');
    res.status(500).json({
      success: false,
      error: 'Failed to send push notification',
    });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification subscription statistics
 */
router.get('/api/notifications/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    subscriberCount: subscriptions.size,
    configured: !!config.pushNotifications.vapid.publicKey,
  });
});

export default router;
