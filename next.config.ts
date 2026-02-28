import type { NextConfig } from "next";

/**
 * Next.js 15+ Configuration for Solom Finance Platform
 * 
 * Key features configured:
 * - Turbopack for development (enabled via `next dev --turbo` in package.json)
 * - Standalone output for Docker deployments
 * - TypeScript config support (this file is .ts, not .js)
 * - Proper caching semantics (API routes use `export const dynamic = 'force-dynamic'`)
 * - Security headers for finance platform
 * 
 * @see docs/nextjs-15-features.md for migration details
 */

const nextConfig: NextConfig = {
  // Output standalone for Docker/Kubernetes deployments
  output: 'standalone',
  
  // Image optimization disabled (using external CDN or static assets)
  images: {
    unoptimized: true,
  },

  // Headers configuration
  async headers() {
    return [
      // Global security headers for all routes
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable XSS filter
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy for privacy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Strict Transport Security
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // API-specific headers
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          // Next.js 15+ Caching: API routes are NOT cached by default
          // Explicit cache control for API responses
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;