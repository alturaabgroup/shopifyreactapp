import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import storefrontTokenRoutes from './routes/storefrontToken.js';
import notificationsRoutes from './routes/notifications.js';
import oauthRoutes from './routes/oauth.js';
import webhookRoutes from './routes/webhooks.js';
import pino from 'pino';

const logger = pino({ name: 'server' });

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
  logger.info({ oauthEnabled: config.oauth.enabled }, 'OAuth mode');
} catch (error) {
  logger.error({ error }, 'Configuration validation failed');
  process.exit(1);
}

const app = express();

// Webhook routes need raw body for signature verification
app.use('/api/webhooks', express.text({ type: '*/*' }));

// Middleware for other routes
app.use(express.json());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Routes
if (config.oauth.enabled) {
  app.use(oauthRoutes);
  app.use(webhookRoutes);
  logger.info('OAuth and webhook routes enabled');
}
app.use(storefrontTokenRoutes);
app.use(notificationsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// Configuration check endpoint (useful for debugging)
app.get('/api/config-check', (req, res) => {
  const configStatus = {
    oauthEnabled: config.oauth.enabled,
    shopifyAdminToken: !!config.shopify.adminApiToken,
    shopifyStoreDomain: !!config.shopify.storeDomain,
    shopifyApiVersion: config.shopify.apiVersion,
    shopifyApiKey: config.oauth.enabled ? !!config.oauth.apiKey : 'N/A',
    shopifyApiSecret: config.oauth.enabled ? !!config.oauth.apiSecretKey : 'N/A',
    corsOrigins: config.cors.origins,
    environment: config.server.nodeEnv,
  };
  
  const isConfigured = config.oauth.enabled
    ? !!(config.oauth.apiKey && config.oauth.apiSecretKey)
    : !!(configStatus.shopifyAdminToken && configStatus.shopifyStoreDomain);
  
  res.json({
    configured: isConfigured,
    details: configStatus,
    message: !isConfigured
      ? config.oauth.enabled
        ? 'OAuth mode: Configure SHOPIFY_API_KEY and SHOPIFY_API_SECRET in .env'
        : 'Single-store mode: Configure SHOPIFY_ADMIN_API_TOKEN and SHOPIFY_STORE_DOMAIN in .env'
      : 'Backend is properly configured.',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  const endpoints: Record<string, string> = {
    health: '/health',
    configCheck: '/api/config-check',
    storefrontToken: '/api/storefront-token',
    tokenRotate: '/api/storefront-token/rotate',
    tokenCleanup: '/api/storefront-token/cleanup',
    notificationsSubscribe: '/api/notifications/subscribe',
    notificationsUnsubscribe: '/api/notifications/unsubscribe',
    notificationsVapidKey: '/api/notifications/vapid-public-key',
    notificationsSend: '/api/notifications/send',
    notificationsStats: '/api/notifications/stats',
  };

  if (config.oauth.enabled) {
    endpoints.auth = '/api/auth?shop=yourstore.myshopify.com';
    endpoints.authCallback = '/api/auth/callback';
    endpoints.authValidate = '/api/auth/validate?shop=yourstore.myshopify.com';
    endpoints.shopInfo = '/api/shop-info?shop=yourstore.myshopify.com';
    endpoints.webhooks = '/api/webhooks/*';
  }

  res.json({
    name: 'Shopify Storefront Backend API',
    version: '1.0.0',
    mode: config.oauth.enabled ? 'OAuth (Multi-merchant)' : 'Single-store',
    endpoints,
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info({ port: PORT, nodeEnv: config.server.nodeEnv, oauthEnabled: config.oauth.enabled }, 'Server started');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`🔐 Mode: ${config.oauth.enabled ? 'OAuth (Multi-merchant)' : 'Single-store'}`);
  if (!config.oauth.enabled) {
    console.log(`🏪 Shopify Store: ${config.shopify.storeDomain}`);
  }
  console.log(`📦 API Version: ${config.shopify.apiVersion}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
