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
  allowedDevOrigins: ["192.168.200.135", "192.168.88.61"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://192.168.200.135:8001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
