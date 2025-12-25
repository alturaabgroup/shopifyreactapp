# Shopify Storefront Application

A complete, production-ready scaffold for a Shopify Storefront application with a ReactJS/Next.js frontend and a Node.js/Express backend. This application integrates with both Shopify Storefront GraphQL API (2025-07) and Admin GraphQL API (2025-07) to provide a full-featured e-commerce experience.

## 🚀 Features

### Backend (Node.js + Express + TypeScript)

- ✅ **Shopify Admin GraphQL API Integration (2025-07)**
  - Secure token-based authentication
  - Storefront Access Token management
  - Token caching and automatic rotation
  
- ✅ **RESTful API Endpoints**
  - `/api/storefront-token` - Get or create Storefront Access Token
  - `/api/storefront-token/rotate` - Manually rotate token
  - `/api/storefront-token/cleanup` - Clean up old tokens
  - `/api/notifications/*` - Push notification management

- ✅ **Push Notifications Support** (Optional)
  - Web Push subscription management
  - VAPID keys configuration
  - FCM hooks for mobile notifications

- ✅ **Shopify CLI Integration**
  - Admin API schema introspection
  - CLI commands for better Admin API control

### Frontend (ReactJS + Next.js 14 App Router)

- ✅ **Shopify Storefront GraphQL API Integration (2025-07)**
  - Secure token retrieval from backend
  - Full GraphQL query/mutation support

- ✅ **Complete Page Implementation**
  - Home page with featured collections
  - Collections listing and detail pages
  - Product detail pages with variant selection
  - Shopping cart with Storefront Cart API
  - Customer login/register
  - Customer account with order history
  - Static pages (About, Contact, Policies)

- ✅ **Storefront Cart API**
  - Add to cart functionality
  - Update quantities
  - Remove items
  - Checkout via redirect (checkoutUrl)

- ✅ **PWA Features**
  - Service Worker for offline support
  - Web App Manifest
  - Installable app experience
  - Cache strategies for performance
  - Optional push notifications

- ✅ **Performance Optimizations**
  - Mobile-first responsive design
  - Lazy loading images
  - Skeleton loaders
  - SEO-friendly routing
  - Core Web Vitals optimized

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- A Shopify store (development or production)
- Shopify Admin API access token
- Basic knowledge of React and Node.js

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shopifyreactapp
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` and configure your Shopify credentials:

```env
# Shopify Admin API Configuration
SHOPIFY_ADMIN_API_TOKEN=shpat_your_admin_access_token_here
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_VERSION=2025-07

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Token Management
STOREFRONT_TOKEN_CACHE_TTL=2592000000
STOREFRONT_TOKEN_ROTATION_DAYS=30
```

#### Getting Your Shopify Admin API Token

**Important:** This application requires an **Admin API access token** (not Client ID/Secret). Follow these steps:

1. Go to your Shopify Admin Panel
2. Navigate to **Settings → Apps and sales channels → Develop apps**
3. **If you don't see "Develop apps"**, click "Allow custom app development" first
4. Click **"Create an app"** or select an existing app
5. Go to the **"Configuration"** tab
6. Under **"Admin API integration"**, click **"Configure"**
7. Select the following Admin API access scopes:
   - `read_products` (to read product data)
   - `write_storefront_access_tokens` (required - to create storefront tokens)
   - `read_storefront_access_tokens` (required - to list storefront tokens)
8. Click **"Save"**
9. Go to the **"API credentials"** tab
10. Click **"Install app"** (if not already installed)
11. After installation, you'll see the **"Admin API access token"** - this is what you need
12. Copy the token that starts with `shpat_` and paste it into your `.env` file

**Note:** The Admin API access token is different from:
- **API Key** (Client ID) - used for OAuth apps
- **API Secret Key** - used for OAuth apps
- **Storefront Access Token** - used for frontend (this app creates these automatically)

You need the **Admin API access token** (starts with `shpat_`) for the backend to work.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Shopify Store Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_API_VERSION=2025-07

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
```

### 4. Configure Shopify CLI (Optional)

Update `shopify.app.toml` in the root directory with your app details.

## 🚀 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:4000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

## 📚 API Documentation

### Backend Endpoints

#### Health Check
- **GET** `/health` - Server health status
- **GET** `/api/config-check` - Check backend configuration status

#### Storefront Token Management
- **GET** `/api/storefront-token` - Get current Storefront Access Token
- **POST** `/api/storefront-token/rotate` - Manually rotate token
- **POST** `/api/storefront-token/cleanup` - Clean up old tokens

#### Push Notifications (Optional)
- **GET** `/api/notifications/vapid-public-key` - Get VAPID public key
- **POST** `/api/notifications/subscribe` - Subscribe to push notifications
- **POST** `/api/notifications/unsubscribe` - Unsubscribe from push notifications
- **POST** `/api/notifications/send` - Send test notification
- **GET** `/api/notifications/stats` - Get subscription statistics

## 🔒 Security Considerations

1. **Admin API Token Security**
   - Never expose the Admin API token to the frontend
   - Store it securely in backend environment variables
   - Use HTTPS in production

2. **Storefront Access Token**
   - Token plaintext is only available on creation
   - Tokens are cached with TTL for performance
   - Automatic rotation prevents token expiration

3. **CORS Configuration**
   - Configure `CORS_ORIGINS` to only allow your frontend domain
   - Use strict CORS policies in production

4. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different tokens for development and production

## 📱 PWA Features

### Service Worker

The application includes a service worker (`/public/sw.js`) that provides:
- Offline fallback page
- Asset caching for improved performance
- Push notification handling

### Installing the PWA

1. Visit the site in a PWA-compatible browser
2. Look for the "Install" prompt or browser menu option
3. The app will be installable on desktop and mobile devices

### Push Notifications (Optional)

1. Generate VAPID keys for Web Push:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add keys to `backend/.env`:
   ```env
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

3. Users can opt-in via `/push` page

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 GraphQL Schema Introspection

### Admin API Schema

```bash
cd backend
npm run schema:admin:introspect
```

This will generate `backend/graphql.schema.admin.json` with the complete Admin API schema.

### Storefront API Schema

Create a script in `frontend/scripts/introspect-storefront.js` similar to the backend introspection script to generate the Storefront schema.

## 🎨 Customization

### Styling

The application uses utility CSS classes. To customize:
1. Modify `frontend/src/app/globals.css`
2. Update color schemes, fonts, and spacing
3. Consider integrating Tailwind CSS for more utility classes

### Adding New Pages

1. Create a new file in `frontend/src/app/[your-route]/page.tsx`
2. Import and use the `Layout` component
3. Implement your page logic

### Modifying GraphQL Queries

All GraphQL queries are organized in `frontend/src/graphql/`:
- `collections.ts` - Collection queries
- `products.ts` - Product queries
- `cart.ts` - Cart operations
- `customer.ts` - Customer authentication

## 🐛 Troubleshooting

### Backend Issues

**401 Error: "Invalid API key or access token"**
- **Cause**: Using wrong type of credentials (Client ID/Secret instead of Admin API access token)
- **Solution**: 
  1. You need the **Admin API access token** (starts with `shpat_`), not Client ID or API Secret
  2. Go to your Shopify app → **API credentials** tab
  3. If the app is not installed, click **"Install app"**
  4. Copy the **"Admin API access token"** (revealed only once after installation)
  5. If you lost it, you'll need to uninstall and reinstall the app to get a new token
  6. Make sure your app has the required scopes:
     - `read_products`
     - `write_storefront_access_tokens`
     - `read_storefront_access_tokens`

**Backend Returns 500 Error When Fetching Token**
- **Cause**: Backend environment variables not configured
- **Solution**: 
  1. Copy `backend/.env.example` to `backend/.env`
  2. Add your Shopify Admin API token and store domain
  3. Restart the backend server
  4. Visit `http://localhost:4000/api/config-check` to verify configuration

**Token Creation Fails**
- Verify Admin API token has correct scopes (`write_storefront_access_tokens`, `read_storefront_access_tokens`, `read_products`)
- Check `SHOPIFY_STORE_DOMAIN` format (should be `your-store.myshopify.com`)
- Ensure API version is correct (2025-07)
- Test your credentials by visiting your Shopify admin panel

**CORS Errors**
- Verify `CORS_ORIGINS` includes your frontend URL
- Check that both servers are running
- Ensure frontend URL matches exactly (including protocol and port)

### Frontend Issues

**API Connection Fails / "Failed to fetch storefront token: 500"**
- First, check if backend is configured: Visit `http://localhost:4000/api/config-check`
- Verify `NEXT_PUBLIC_BACKEND_URL` points to running backend (default: `http://localhost:4000`)
- Ensure backend server is running before starting frontend
- Check browser console for detailed error messages

**Cart Not Working**
- Ensure Storefront API token is valid
- Check browser localStorage for cart ID
- Verify variant IDs are correct

### PWA Issues

**Service Worker Not Registering**
- Ensure you're accessing the site via HTTPS or localhost
- Check browser console for errors
- Clear cache and reload

## 📝 Project Structure

```
shopifyreactapp/
├── backend/
│   ├── src/
│   │   ├── config.ts           # Configuration management
│   │   ├── index.ts            # Express server
│   │   ├── routes/             # API routes
│   │   ├── shopify/            # Shopify API clients
│   │   └── utils/              # Utility functions
│   ├── scripts/                # CLI scripts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # React components
│   │   ├── graphql/            # GraphQL queries
│   │   └── lib/                # Utility libraries
│   ├── public/                 # Static assets & PWA files
│   └── package.json
├── shopify.app.toml            # Shopify CLI configuration
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check Shopify's documentation:
  - [Storefront API](https://shopify.dev/docs/api/storefront)
  - [Admin API](https://shopify.dev/docs/api/admin-graphql)

## 🔗 Useful Links

- [Shopify GraphQL Admin API Reference](https://shopify.dev/docs/api/admin-graphql)
- [Shopify Storefront API Reference](https://shopify.dev/docs/api/storefront)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify CLI Documentation](https://shopify.dev/docs/apps/tools/cli)

---

Built with ❤️ for Shopify developers
