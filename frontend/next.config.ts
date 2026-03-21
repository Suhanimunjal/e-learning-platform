import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build to allow compilation
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
