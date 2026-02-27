/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {},
  env: {
    PORT: process.env.PORT || '3000',
  },
};

export default nextConfig;
