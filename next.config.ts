import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['swisseph', '@it-healer/human-design-calculator'],
  experimental: {
    serverComponentsExternalPackages: ['swisseph'],
  },
};

export default nextConfig;
