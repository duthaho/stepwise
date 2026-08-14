import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — export to ./out for Cloudflare Workers static assets.
  output: "export",
};

export default nextConfig;
