import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import storefrontTokenRoutes from './routes/storefrontToken.js';
import notificationsRoutes from './routes/notifications.js';
import pino from 'pino';

const logger = pino({ name: 'server' });

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error({ error }, 'Configuration validation failed');
  process.exit(1);
}

const app = express();

// Middleware
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Shopify Storefront Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      storefrontToken: '/api/storefront-token',
      tokenRotate: '/api/storefront-token/rotate',
      tokenCleanup: '/api/storefront-token/cleanup',
      notificationsSubscribe: '/api/notifications/subscribe',
      notificationsUnsubscribe: '/api/notifications/unsubscribe',
      notificationsVapidKey: '/api/notifications/vapid-public-key',
      notificationsSend: '/api/notifications/send',
      notificationsStats: '/api/notifications/stats',
    },
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
  logger.info({ port: PORT, nodeEnv: config.server.nodeEnv }, 'Server started');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`🏪 Shopify Store: ${config.shopify.storeDomain}`);
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
