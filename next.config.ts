import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const basePath = "/gpt-oss-issue-curator";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? basePath : undefined,
  assetPrefix: isProd ? `${basePath}/` : undefined,
  trailingSlash: true,
};

export default nextConfig;
