const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { enabled: true } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**.cdn.shopify.com" }] },
  headers: async () => [{ source: "/(.*)", headers: [
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
  ] }]
};
module.exports = nextConfig;
