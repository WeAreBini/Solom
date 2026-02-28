import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  
  // Next.js 15+ features
  experimental: {
    // Enable the `unstable_after` API for post-response operations
    // Useful for analytics, logging, and other non-blocking tasks
    after: true,
  },
  
  // ISR configuration for semi-static market data
  // Revalidate cached pages after 24 hours (86400 seconds)
  expireTime: 86400,
  
  // External packages that should not be bundled
  // These will be kept as external dependencies for the server
  serverExternalPackages: ['@prisma/client'],
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
