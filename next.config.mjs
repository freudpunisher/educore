import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.200.165", "192.168.88.84", "192.168.88.50"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://192.168.88.50:1200/api/:path*",
      },
    ];
  },
};

export default nextConfig;
