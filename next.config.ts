import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // D1 is only available inside Workers. Keep the lazy import external in Node
  // builds so an unconfigured intake fails with 503 at runtime, not at build time.
  webpack(config, { isServer }) {
    if (isServer) config.externals.push({ "cloudflare:workers": "commonjs cloudflare:workers" });
    return config;
  },
};

export default nextConfig;
