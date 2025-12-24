# Shopify B2C PWA (React + Next.js App Router)

Production-ready, mobile-first PWA storefront for Shopify Basic. Uses Storefront GraphQL API, secure customer auth via http-only cookies, Redux Toolkit for state, Tailwind CSS for styling, Zod for validation, and Firebase Cloud Messaging for push notifications.

## Features

- Products & catalog (list, detail, variants, availability)
- Cart (create/update/remove, persist across sessions)
- Checkout via Shopify-hosted checkout URL
- Customer auth (login/signup/logout, token renewal)
- Customer account (profile, addresses CRUD)
- Order history & details, reorder to cart
- PWA install + FCM push notifications
- Secure token lifecycle + GDPR-safe patterns

## Requirements

- Shopify Basic plan (no Plus features)
- Storefront API access token
- Firebase project for Cloud Messaging
- Node 18+

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_API_VERSION=2024-10
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxx_public_storefront_token_xxxx

# Firebase for FCM
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...

# Security
COOKIE_NAME=cust_token
COOKIE_SECURE=true
```

## Installation

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build && pnpm start
```

## Shopify Setup Notes

- Ensure Storefront API is enabled and you have the Storefront access token.
- No Admin API is used in this app.
- Checkout remains hosted by Shopify (cart.checkoutUrl).

## Firebase Setup

- Create Firebase project, enable Cloud Messaging.
- Add `public/firebase-messaging-sw.js` (provided).
- Add web app credentials and VAPID key to `.env.local`.

## Security & GDPR

- Customer token stored in http-only, secure cookie (not accessible to JS).
- Data minimization: only necessary fields fetched.
- Logout clears token immediately.
- Explicit push permission prompt; dismissable; can be revoked via browser.

## Rate Limit Awareness

- Storefront GraphQL returns `extensions.cost`; client logs & backs off if nearing limits.
- Batched operations are minimized; subsequent actions defer on high cost detections.

## Production Checklist

- Use HTTPS and `COOKIE_SECURE=true`
- Configure domain and `manifest.json` icons & name
- Turn on suitable caching & CDN
- Verify SEO metadata
- Enable CSP headers if desired

## License

MIT