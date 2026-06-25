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
  // Backward compatibility: redirect old non-locale URLs to /en
  async redirects() {
    return [
      { source: "/items", destination: "/en/items", permanent: true },
      { source: "/items/:path*", destination: "/en/items/:path*", permanent: true },
      { source: "/community", destination: "/en/community", permanent: true },
      { source: "/borrow", destination: "/en/borrow", permanent: true },
      { source: "/profile", destination: "/en/profile", permanent: true },
      { source: "/login", destination: "/en/login", permanent: true },
      { source: "/register", destination: "/en/register", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
