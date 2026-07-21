import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HD 引擎依赖的 WASM/占星包：运行时从 node_modules require，不进 bundle
  serverExternalPackages: ['@fusionstrings/swisseph-wasm', '@it-healer/human-design-calculator'],
};

export default nextConfig;
