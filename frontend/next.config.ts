import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        // Cloudflare R2 public bucket domain
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        // Cloudflare R2 custom domain (if configured)
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  // No manual locale redirects needed — next-intl middleware handles locale routing
  // with localePrefix: 'as-needed', the default locale (en) has no prefix,
  // and other locales get prefixed automatically.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/ws/:path*",
        destination: "http://localhost:8080/ws/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
