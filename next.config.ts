import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  
  // ✅ Completely disable dev indicators
  devIndicators: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;