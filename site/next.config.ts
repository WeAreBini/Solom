import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "financialmodelingprep.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.financialmodelingprep.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
